#!/usr/bin/env python3
"""Sign-in sheet for the Powerpoint folder: several chats can change the system at once.

Why: more than one Claude chat (and Hermes) works in this folder at the same time. Without a
shared record they take the same version number, overwrite each other's edit of the same file,
and push each other's half-finished work to GitHub. Rules: maintenance/working-together.md.

  start  "<chat>" "<what>" <path>...   sign in: claim the files you are about to change.
                                       Prints your claim id, or CONFLICT and who holds them.
  add    <id> <path>...                claim more files under the same sign-in
  drop   <id> <path>...                release some of them early (do this for shared files)
  version <id>                         reserve the next version number (never handed out twice)
  log    <id> "<what changed>" "<why>" "<files touched>"
                                       add the changelog row under your reserved version
  others <id>                          paths other chats hold right now (leave them out of a sync)
  touch  <id>                          still working (a claim goes stale after 3 hours)
  done   <id>                          sign out: release the files
  status                               who is working on what

A path is a file, a folder (end it with /) or a shared job in capitals:
GITHUB (a sync to GitHub) and DESIGN-SYSTEM (publishing the Claude design system).
Nothing here needs deleting a file, because chats cannot delete in this folder: a claim is one
small file in logs/active-work/, and signing out moves it to logs/active-work/done/.
Standard library only (Python 3.8+).
"""
import datetime, json, os, random, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STALE_HOURS = 3
SEP = "|---|---|---|---|---|\n"


def paths(root):
    d = os.path.join(root, "logs", "active-work")
    return d, os.path.join(d, "done"), os.path.join(d, "versions")


def now():
    return datetime.datetime.now(datetime.timezone.utc)


def stamp(t=None):
    return (t or now()).strftime("%Y-%m-%dT%H:%M:%SZ")


def age_hours(s):
    t = datetime.datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc)
    return (now() - t).total_seconds() / 3600


def norm(root, p):
    p = p.strip().replace("\\", "/")
    if re.fullmatch(r"[A-Z][A-Z0-9-]*", p):
        return p                                    # a shared job, e.g. GITHUB
    if os.path.isabs(p):
        p = os.path.relpath(p, root).replace(os.sep, "/")
    while p.startswith("./"):
        p = p[2:]
    if not p.endswith("/") and os.path.isdir(os.path.join(root, p)):
        p += "/"
    return p


def overlap(a, b):
    return a == b or (a.endswith("/") and b.startswith(a)) or (b.endswith("/") and a.startswith(b))


def write_new(path, text):
    """Create a file only if it does not exist yet (atomic). False when someone else has it."""
    try:
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
    except FileExistsError:
        return False
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)
    return True


class ChangelogTurn:
    """One chat writes logs/changelog.md at a time. The turn is a token file that is renamed, never
    deleted: changelog.free -> changelog.busy-<time>-<who> and back. A turn held for over a minute
    belongs to a chat that died, and is taken over."""

    def __init__(self, root):
        self.d = paths(root)[0]
        self.free = os.path.join(self.d, "changelog.free")
        self.mine = None

    def __enter__(self):
        os.makedirs(self.d, exist_ok=True)
        deadline = time.time() + 90
        while time.time() < deadline:
            mine = os.path.join(self.d, "changelog.busy-%d-%d-%04d" % (time.time(), os.getpid(), random.randrange(10000)))
            try:
                os.rename(self.free, mine)
                self.mine = mine
                return self
            except FileNotFoundError:
                pass
            busy = [n for n in os.listdir(self.d) if n.startswith("changelog.busy-")]
            if not busy:
                write_new(self.free, "the changelog turn (see scripts/work.py)\n")
                continue
            for n in busy:
                if time.time() - int(n.split("-")[1]) > 60:
                    try:
                        os.rename(os.path.join(self.d, n), mine)
                        self.mine = mine
                        return self
                    except FileNotFoundError:
                        pass
            time.sleep(0.15 + random.random() * 0.2)
        sys.exit("Could not get a turn at logs/changelog.md for 90 seconds. Run the command again.")

    def __exit__(self, *exc):
        if self.mine:
            try:
                os.rename(self.mine, self.free)
            except OSError:
                pass


def save(path, claim):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(claim, f, indent=1, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, path)


def load_all(root):
    d = paths(root)[0]
    out = []
    if os.path.isdir(d):
        for n in sorted(os.listdir(d)):
            if n.endswith(".json"):
                try:
                    c = json.load(open(os.path.join(d, n), encoding="utf-8"))
                    c["stale"] = age_hours(c["touched"]) > STALE_HOURS
                    out.append(c)
                except Exception:
                    pass                             # half-written by another chat: next call sees it
    return out


def load(root, cid):
    p = os.path.join(paths(root)[0], cid + ".json")
    if not os.path.exists(p):
        sys.exit("No open sign-in with id %s (run: status)" % cid)
    return p, json.load(open(p, encoding="utf-8"))


def conflicts(root, cid, wanted):
    hits = []
    for c in load_all(root):
        if c["id"] == cid or c["stale"]:
            continue
        both = sorted({q for q in c["paths"] for p in wanted if overlap(p, q)})
        if both:
            hits.append((c, both))
    return hits


def view(root):
    """logs/active-work.md: the readable sign-in sheet, rewritten on every command."""
    rows = load_all(root)
    lines = ["# Who is working in this folder right now", "",
             "Written by `scripts/work.py` (don't edit by hand). Rules: `maintenance/working-together.md`.",
             "Checked %s UTC." % stamp()[:16].replace("T", " "), ""]
    if not rows:
        lines.append("Nobody is signed in.")
    for c in rows:
        lines.append("- **%s**%s: %s" % (c["chat"], " (STALE: no sign of life for over %d hours, does not block)" % STALE_HOURS if c["stale"] else "", c["what"]))
        lines.append("  - id `%s`, since %s UTC%s" % (c["id"], c["started"][:16].replace("T", " "), ", version %s" % c["version"] if c.get("version") else ""))
        lines.append("  - holds: " + ", ".join("`%s`" % p for p in c["paths"]))
    try:
        with open(os.path.join(root, "logs", "active-work.md"), "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
    except OSError:
        pass
    return rows


def cmd_start(root, chat, what, wanted):
    d, done, _ = paths(root)
    os.makedirs(done, exist_ok=True)
    wanted = sorted({norm(root, p) for p in wanted})
    if not wanted:
        sys.exit("Name at least one file, folder/ or shared job (GITHUB, DESIGN-SYSTEM).")
    slug = re.sub(r"[^a-z0-9]+", "-", chat.lower()).strip("-")[:24] or "chat"
    t = now()
    claim = {"chat": chat, "what": what, "started": stamp(t), "order": t.strftime("%Y%m%d%H%M%S%f"),
             "touched": stamp(t), "paths": wanted}
    n = 0
    while True:
        cid = "%s-%s%s" % (t.strftime("%Y%m%d-%H%M%S"), slug, "-%d" % n if n else "")
        claim["id"] = cid
        if not os.path.exists(os.path.join(d, cid + ".json")):
            save(os.path.join(d, cid + ".json"), claim)      # written whole, then moved into place
            break
        n += 1
    # look again now that our own claim is visible: of two chats that sign in at the same
    # moment for the same file, the later id steps back
    mine = (claim["order"], cid)
    hits = [(c, both) for c, both in conflicts(root, cid, wanted) if (c.get("order", ""), c["id"]) < mine]
    if hits:
        os.replace(os.path.join(d, cid + ".json"), os.path.join(done, cid + ".withdrawn.json"))
        view(root)
        print("CONFLICT: not signed in. Already held by another chat:")
        for c, both in hits:
            print("  %s (%s, since %s UTC, id %s): %s" % (c["chat"], c["what"], c["started"][11:16], c["id"], ", ".join(both)))
        print("Work on something else, or wait and run start again. Do not edit these files meanwhile.")
        return 1
    view(root)
    print(cid)
    return 0


def cmd_add(root, cid, wanted):
    p, claim = load(root, cid)
    wanted = sorted({norm(root, x) for x in wanted})
    hits = conflicts(root, cid, wanted)
    if hits:
        print("CONFLICT: nothing added. Already held by another chat:")
        for c, both in hits:
            print("  %s (%s, id %s): %s" % (c["chat"], c["what"], c["id"], ", ".join(both)))
        return 1
    claim["paths"] = sorted(set(claim["paths"]) | set(wanted))
    claim["touched"] = stamp()
    save(p, claim)
    view(root)
    print("holding: " + ", ".join(claim["paths"]))
    return 0


def cmd_drop(root, cid, gone):
    p, claim = load(root, cid)
    gone = {norm(root, x) for x in gone}
    claim["paths"] = [q for q in claim["paths"] if q not in gone]
    claim["touched"] = stamp()
    save(p, claim)
    view(root)
    print("holding: " + (", ".join(claim["paths"]) or "nothing (run done when finished)"))
    return 0


def vkey(v):
    return tuple(int(x) for x in v.split("."))


def top_version(root):
    best = (0, 0)
    try:
        for line in open(os.path.join(root, "logs", "changelog.md"), encoding="utf-8"):
            m = re.match(r"\|\s*(\d+\.\d+)\s*\|", line)
            if m:
                best = max(best, vkey(m.group(1)))
    except OSError:
        pass
    vd = paths(root)[2]
    if os.path.isdir(vd):
        for n in os.listdir(vd):
            if re.fullmatch(r"\d+\.\d+", n):
                best = max(best, vkey(n))
    return best


def cmd_version(root, cid, major=False):
    p, claim = load(root, cid)
    if claim.get("version"):
        print(claim["version"])
        return 0
    vd = paths(root)[2]
    os.makedirs(vd, exist_ok=True)
    while True:
        a, b = top_version(root)
        v = "%d.0" % (a + 1) if major else "%d.%d" % (a, b + 1)
        if write_new(os.path.join(vd, v), "%s  %s  %s  %s\n" % (stamp(), claim["chat"], cid, claim["what"])):
            break                                    # the file is the reservation: created once, by one chat
    claim["version"] = v
    claim["touched"] = stamp()
    save(p, claim)
    view(root)
    print(v)
    return 0


def cmd_log(root, cid, what, why, files, date=None):
    cmd_version_quiet(root, cid)
    p, claim = load(root, cid)
    cl = os.path.join(root, "logs", "changelog.md")
    clean = lambda s: " ".join(s.replace("|", "/").split())
    row = "| %s | %s | %s | %s | %s |\n" % (claim["version"], date or datetime.date.today().isoformat(), clean(what), clean(why), clean(files))
    with ChangelogTurn(root):
        text = open(cl, encoding="utf-8").read()     # read and write back in one turn: no stale copy
        if re.search(r"^\|\s*%s\s*\|" % re.escape(claim["version"]), text, flags=re.M):
            print("Version %s is already in the changelog. Edit that row in place if it needs changing." % claim["version"])
            return 1
        if text.count(SEP) != 1:
            print("Could not find the table header in logs/changelog.md: add the row by hand under the header line.")
            return 1
        # keep the newest on top, but below any higher version another chat logged first
        head, rest = text.split(SEP)
        lines = rest.splitlines(keepends=True)
        i = 0
        while i < len(lines):
            m = re.match(r"\|\s*(\d+\.\d+)\s*\|", lines[i])
            if m and vkey(m.group(1)) > vkey(claim["version"]):
                i += 1
            else:
                break
        lines.insert(i, row)
        tmp = cl + ".writing"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(head + SEP + "".join(lines))
        os.replace(tmp, cl)                          # readers never see a half-written changelog
    claim["logged"] = True
    claim["touched"] = stamp()
    save(p, claim)
    print("logged v%s" % claim["version"])
    return 0


def cmd_version_quiet(root, cid):
    _, claim = load(root, cid)
    if not claim.get("version"):
        out, sys.stdout = sys.stdout, open(os.devnull, "w")
        try:
            cmd_version(root, cid)
        finally:
            sys.stdout.close()
            sys.stdout = out


def cmd_others(root, cid):
    held = sorted({q for c in load_all(root) if c["id"] != cid and not c["stale"] for q in c["paths"]})
    for q in held:
        print(q)
    return 0


def cmd_touch(root, cid):
    p, claim = load(root, cid)
    claim["touched"] = stamp()
    save(p, claim)
    view(root)
    print("ok")
    return 0


def cmd_done(root, cid, abandon=False):
    p, claim = load(root, cid)
    if claim.get("version") and not claim.get("logged") and not abandon:
        print("Version %s is reserved but not in the changelog yet. Run log first, or done %s --abandon if nothing changed." % (claim["version"], cid))
        return 1
    claim["finished"] = stamp()
    save(p, claim)
    os.makedirs(paths(root)[1], exist_ok=True)
    os.replace(p, os.path.join(paths(root)[1], cid + ".json"))
    view(root)
    print("signed out: " + ", ".join(claim["paths"]))
    return 0


def cmd_status(root):
    rows = view(root)
    if not rows:
        print("Nobody is signed in.")
    for c in rows:
        print("%s%s: %s" % (c["chat"], " [STALE]" if c["stale"] else "", c["what"]))
        print("   id %s, since %s UTC%s" % (c["id"], c["started"][11:16], ", version %s" % c["version"] if c.get("version") else ""))
        print("   holds: " + ", ".join(c["paths"]))
    a, b = top_version(root)
    print("Newest version handed out or logged: %d.%d" % (a, b))
    return 0


def main(a):
    root = ROOT
    if "--root" in a:
        i = a.index("--root")
        root = os.path.abspath(a[i + 1])
        a = a[:i] + a[i + 2:]
    flags = {x for x in a if x.startswith("--")}
    a = [x for x in a if not x.startswith("--")]
    if len(a) >= 4 and a[0] == "start":
        return cmd_start(root, a[1], a[2], a[3:])
    if len(a) >= 3 and a[0] == "add":
        return cmd_add(root, a[1], a[2:])
    if len(a) >= 3 and a[0] == "drop":
        return cmd_drop(root, a[1], a[2:])
    if len(a) == 2 and a[0] == "version":
        return cmd_version(root, a[1], "--major" in flags)
    if len(a) == 5 and a[0] == "log":
        return cmd_log(root, a[1], a[2], a[3], a[4])
    if len(a) == 2 and a[0] == "others":
        return cmd_others(root, a[1])
    if len(a) == 2 and a[0] == "touch":
        return cmd_touch(root, a[1])
    if len(a) == 2 and a[0] == "done":
        return cmd_done(root, a[1], "--abandon" in flags)
    if a == ["status"]:
        return cmd_status(root)
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
