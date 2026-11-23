#!/usr/bin/env python3
"""Find and fetch free-licensed photos for slides (Wikimedia Commons), at full resolution, with the credit logged.

Run from the Powerpoint folder (needs internet; Python standard library only):
  python3 scripts/get_photo.py search "container port aerial"            # list candidates, nothing is downloaded
  python3 scripts/get_photo.py search "上海 陆家嘴 夜景" --n 12 --min 3000   # more results, at least 3000 px wide
  python3 scripts/get_photo.py fetch "File:Some title.jpg" --name port-aerial [--deck "<deck name>"]
                                                                         # ORIGINAL file -> Objects/Visual/photos/port-aerial.jpg
                                                                         # + one line in Objects/credits.md
  python3 scripts/get_photo.py list                                      # photos already in the folder, with pixel size

Rules it keeps (Objects/images.md):
- Licence: CC0 / public domain first, then CC BY, then CC BY-SA. Anything else (NC, ND, fair use, no licence) is not listed
  and cannot be fetched.
- Full resolution: the original file is saved as it is. It is never resized or recompressed.
- Only landscape photos at least --min pixels wide are listed (default 2400), so a full-slide picture stays sharp.
- It cannot see what is in a picture. The person or agent choosing still checks: a generic scene only, no identifiable
  people, no logos or brand as the subject, no watermark. Photos of real people are never fetched.
- Downloads follow the approved slide plan: list the candidates in the plan's "assets needed", fetch after approval.
"""
import json, os, re, sys, urllib.parse, urllib.request

ROOT = os.getcwd(); OUT = os.path.join(ROOT, "Objects", "Visual", "photos"); CREDITS = os.path.join(ROOT, "Objects", "credits.md")
API = "https://commons.wikimedia.org/w/api.php"; UA = {"User-Agent": "deck-system/1.0 (personal slide tool; Wikimedia Commons API)"}
RANK = [("cc0", 0), ("public domain", 0), ("pd", 0), ("cc by-sa", 2), ("cc-by-sa", 2), ("cc by", 1), ("cc-by", 1)]   # lower is better
BAD = re.compile(r"\bnc\b|non-?commercial|\bnd\b|no ?deriv|fair use|copyrighted|all rights", re.I)
PEOPLE = re.compile(r"portrait|headshot|selfie|\bceo\b|president|minister|actor|actress|singer|politician|athlete|player|人像|肖像", re.I)

def api(**q):
    q.update(format="json", action="query")
    with urllib.request.urlopen(urllib.request.Request(API + "?" + urllib.parse.urlencode(q), headers=UA), timeout=30) as r: return json.load(r)

def licence(meta):
    """(rank, short name, author, attribution needed) or None when the licence is not one we use"""
    g = lambda k: re.sub(r"<[^>]+>", "", (meta.get(k) or {}).get("value", "")).strip()
    name = g("LicenseShortName") or g("License"); low = name.lower()
    if not name or BAD.search(name) or BAD.search(g("UsageTerms")): return None
    for key, rank in RANK:
        if low.startswith(key) or (key in ("public domain", "cc0") and key in low):
            return rank, name, (g("Artist") or "unknown")[:80], rank > 0
    return None

def info(pages):
    out = []
    for p in pages:
        ii = (p.get("imageinfo") or [{}])[0]; lic = licence(ii.get("extmetadata") or {})
        if not lic or not ii.get("url"): continue
        out.append(dict(title=p["title"], url=ii["url"], page=ii.get("descriptionurl", ""), w=ii.get("width", 0), h=ii.get("height", 0), mb=ii.get("size", 0) / 1e6,
                        rank=lic[0], licence=lic[1], author=lic[2], credit=lic[3], people=bool(PEOPLE.search(p["title"] + " " + ((ii.get("extmetadata") or {}).get("Categories") or {}).get("value", "")))))
    return out

def search(query, n=8, min_w=2400):
    d = api(generator="search", gsrnamespace=6, gsrsearch="filetype:bitmap " + query, gsrlimit=50, prop="imageinfo", iiprop="url|size|extmetadata")
    c = [x for x in info((d.get("query") or {}).get("pages", {}).values()) if x["w"] >= min_w and x["w"] > x["h"] and not x["people"] and x["title"].lower().endswith((".jpg", ".jpeg", ".png"))]
    c.sort(key=lambda x: (x["rank"], -x["w"]))
    if not c: print("nothing found with a usable licence at that size; try other words (English finds most) or a lower --min"); return
    for x in c[:n]:
        print(f"{x['title']}\n    {x['w']} x {x['h']} px, {x['mb']:.1f} MB | {x['licence']} | author: {x['author']} | credit on slide: {'yes' if x['credit'] else 'no'}\n    {x['page']}")
    print(f"\n{min(n, len(c))} of {len(c)} shown. Look at the picture before choosing (no identifiable people, no logos, no watermark). Nothing was downloaded.")

def fetch(title, name, deck=""):
    if not title.startswith("File:"): title = "File:" + title
    c = info((api(titles=title, prop="imageinfo", iiprop="url|size|extmetadata").get("query") or {}).get("pages", {}).values())
    if not c: sys.exit("not fetched: file not found, or its licence is not CC0 / public domain / CC BY / CC BY-SA")
    x = c[0]
    if x["people"]: sys.exit("not fetched: this looks like a photo of a person. Photos of real people come only from the user.")
    ext = os.path.splitext(x["url"])[1].lower() or ".jpg"; slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    os.makedirs(OUT, exist_ok=True); dest = os.path.join(OUT, slug + ext)
    if os.path.exists(dest): sys.exit(f"not fetched: {dest} already exists; choose another --name")
    with urllib.request.urlopen(urllib.request.Request(x["url"], headers=UA), timeout=180) as r, open(dest, "wb") as f:   # the original bytes, untouched
        while True:
            b = r.read(1 << 20)
            if not b: break
            f.write(b)
    row = f"| Visual/photos/{slug}{ext} | {x['page']} | {x['licence']} | {'Yes' if x['credit'] else 'No'} (author: {x['author']}) | {deck or 'none yet'}; original {x['w']} x {x['h']} px |\n"
    with open(CREDITS, "a", encoding="utf-8") as f: f.write(row)
    print(f"saved {dest} ({os.path.getsize(dest) / 1e6:.1f} MB, {x['w']} x {x['h']} px, original file)\ncredit logged in Objects/credits.md" +
          (f"\nput on the slide's source line: Photo: {x['author']}, {x['licence']}" if x["credit"] else ""))

def listing():
    try: from PIL import Image
    except ImportError: Image = None
    for f in sorted(os.listdir(OUT)) if os.path.isdir(OUT) else []:
        p = os.path.join(OUT, f); size = ""
        if Image:
            try:
                with Image.open(p) as im: size = f"{im.width} x {im.height} px, "
            except Exception: pass
        print(f"{f}: {size}{os.path.getsize(p) / 1e6:.1f} MB")

if __name__ == "__main__":
    a = sys.argv[1:]
    def opt(k, d=None):
        if k in a: i = a.index(k); v = a[i + 1]; del a[i:i + 2]; return v
        return d
    n = int(opt("--n", 8)); mn = int(opt("--min", 2400)); name = opt("--name"); deck = opt("--deck", "")
    if a[:1] == ["search"] and len(a) > 1: search(" ".join(a[1:]), n, mn)
    elif a[:1] == ["fetch"] and len(a) > 1 and name: fetch(" ".join(a[1:]), name, deck)
    elif a[:1] == ["list"]: listing()
    else: print(__doc__)
