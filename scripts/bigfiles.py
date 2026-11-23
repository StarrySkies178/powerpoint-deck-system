#!/usr/bin/env python3
"""Big files for the GitHub mirror: split on the Mac, place in the clone, join after a clone.

Why: GitHub rejects files over 100 MB, and staging from the Mac times out on big files
(on 2026-11-23 a 30 MB piece timed out twice while 9 MB pieces went through every time).
Any file over 90 MB (today Objects/store/media.zip and its archive copies) is therefore
kept in the repo as 8 MiB parts next to where the file belongs:
    Objects/store/media.zip.part00, .part01, ...
plus bigfiles.json at the repo root (path, bytes, sha256, sha256 of every part).
The Mac folder keeps the whole file; nothing changes there.
media.zip only grows at its end, so the early parts stay byte-identical between versions:
only the last few parts need staging and pushing after a change.

  split <folder> <out_dir>   on the Mac: write the parts + bigfiles.json into <out_dir>
  place <out_dir> <clone>    in the clone: put the parts in, say which ones are still missing,
                             list the whole files in .gitignore
  join  <clone>              after a clone: rebuild the whole files and check their sha256

Standard library only (Python 3.8+).
"""
import hashlib, json, os, re, shutil, subprocess, sys

LIMIT = 90 * 1000 * 1000          # files larger than this are split
PART = 8 * 1024 * 1024            # part size: small enough to stage in one call on a slow link
SKIP_DIRS = {".git", "_to_delete", "node_modules", "__pycache__"}
MANIFEST = "bigfiles.json"
BEGIN = "# >>> big files kept as parts (written by scripts/bigfiles.py, do not edit)"
END = "# <<< big files"
PART_RE = re.compile(r"\.part\d\d\d?$")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def big_files(folder):
    out = []
    for root, dirs, files in os.walk(folder):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for name in sorted(files):
            p = os.path.join(root, name)
            if PART_RE.search(name) or os.path.islink(p):
                continue
            if os.path.getsize(p) > LIMIT:
                out.append(os.path.relpath(p, folder).replace(os.sep, "/"))
    return out


def split(folder, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    entries = []
    for rel in big_files(folder):
        src = os.path.join(folder, rel)
        dst = os.path.join(out_dir, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        hashes = []
        with open(src, "rb") as f:
            while True:
                block = f.read(PART)
                if not block:
                    break
                with open("%s.part%02d" % (dst, len(hashes)), "wb") as o:
                    o.write(block)
                hashes.append(hashlib.sha256(block).hexdigest())
        entries.append({"path": rel, "bytes": os.path.getsize(src), "sha256": sha256(src),
                        "parts": len(hashes), "part_sha256": hashes})
        print("split  %s  %.1f MB -> %d parts" % (rel, entries[-1]["bytes"] / 1e6, len(hashes)))
    with open(os.path.join(out_dir, MANIFEST), "w") as f:
        json.dump(entries, f, indent=1)
        f.write("\n")
    if not entries:
        print("no file over %d MB" % (LIMIT // 1000000))
    return 0


def part_names(entry):
    return ["%s.part%02d" % (entry["path"], i) for i in range(entry["parts"])]


def _has(path, digest):
    return os.path.exists(path) and sha256(path) == digest


def place(out_dir, clone):
    entries = json.load(open(os.path.join(out_dir, MANIFEST)))
    old_paths = _old_paths(clone)
    wanted, missing = set(), []
    for e in entries:
        for rel, digest in zip(part_names(e), e["part_sha256"]):
            src, dst = os.path.join(out_dir, rel), os.path.join(clone, rel)
            wanted.add(rel)
            if _has(src, digest):                      # freshly staged
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copyfile(src, dst)
            elif _has(dst, digest):                    # unchanged, already in the clone
                pass
            else:                                      # unchanged, but wiped by the mirror step
                subprocess.run(["git", "-C", clone, "checkout", "-q", "HEAD", "--", rel],
                               check=False, stderr=subprocess.DEVNULL)
                if not _has(dst, digest):
                    missing.append(rel)
    if missing:
        print("STILL NEEDED: stage these %d parts from %s (one per call), then run place again:" % (len(missing), out_dir))
        for rel in missing:
            print("  " + rel)
        return 1
    # parts left over from an older, longer or deleted file
    known = {e["path"] for e in entries} | old_paths
    for root, dirs, files in os.walk(clone):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            rel = os.path.relpath(os.path.join(root, name), clone).replace(os.sep, "/")
            if PART_RE.search(name) and rel not in wanted and PART_RE.sub("", rel) in known:
                os.remove(os.path.join(clone, rel))
                print("removed stale part %s" % rel)
    shutil.copyfile(os.path.join(out_dir, MANIFEST), os.path.join(clone, MANIFEST))
    # the whole files stay out of git
    gi = os.path.join(clone, ".gitignore")
    text = open(gi).read() if os.path.exists(gi) else ""
    text = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n?", "", text, flags=re.S).rstrip("\n")
    block = "\n".join([BEGIN] + ["/" + e["path"] for e in entries] + [END])
    open(gi, "w").write((text + "\n\n" if text else "") + block + "\n")
    for e in entries:
        subprocess.run(["git", "-C", clone, "rm", "--cached", "-q", "--ignore-unmatch", "--", e["path"]],
                       check=False, stderr=subprocess.DEVNULL)
        print("placed %s (%d parts)" % (e["path"], e["parts"]))
    return 0


def _old_paths(clone):
    """Paths listed in the clone's previous bigfiles.json (so their parts can be cleaned up)."""
    try:
        return {e["path"] for e in json.load(open(os.path.join(clone, MANIFEST)))}
    except Exception:
        return set()


def join(clone):
    mf = os.path.join(clone, MANIFEST)
    if not os.path.exists(mf):
        print("no %s here: nothing to join" % MANIFEST)
        return 0
    bad = 0
    for e in json.load(open(mf)):
        dst = os.path.join(clone, e["path"])
        if os.path.exists(dst) and os.path.getsize(dst) == e["bytes"] and sha256(dst) == e["sha256"]:
            print("OK     %s (already whole)" % e["path"])
            continue
        tmp = dst + ".joining"
        with open(tmp, "wb") as o:
            for rel in part_names(e):
                with open(os.path.join(clone, rel), "rb") as f:
                    shutil.copyfileobj(f, o, 1 << 20)
        if os.path.getsize(tmp) == e["bytes"] and sha256(tmp) == e["sha256"]:
            os.replace(tmp, dst)
            print("OK     %s  %.1f MB from %d parts" % (e["path"], e["bytes"] / 1e6, e["parts"]))
        else:
            os.remove(tmp)
            bad += 1
            print("FAILED %s: size or sha256 does not match %s" % (e["path"], MANIFEST))
    return 1 if bad else 0


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 3 and a[0] == "split":
        sys.exit(split(a[1], a[2]))
    if len(a) == 3 and a[0] == "place":
        sys.exit(place(a[1], a[2]))
    if len(a) == 2 and a[0] == "join":
        sys.exit(join(a[1]))
    print(__doc__)
    sys.exit(2)
