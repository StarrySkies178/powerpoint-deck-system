"""sync_design_system.py [--check] [--mark-published <artifact version>]

Keeps the Claude design system "Powerpoint House Style" in step with the folder, so the two can't drift.
The folder is the source of truth; `design-system/project/` holds the exact files that get published.

What it does (no arguments):
  1. Reads the house look from Generators/house.js (colour roles, tints, type sizes, grid, fonts).
  2. Writes those values into design-system/project/tokens.json and the token block of
     design-system/project/slides-kit/deck.css (the kit Claude Slides decks are built from).
  3. Checks coverage: every generator exported by Generators/patterns*.js must appear in
     design-system/pattern-map.json (mapped to a component / Slides recipe, or listed as a known gap).
  4. Stamps the folder version (logs/changelog.md) into the design system README.
  5. Writes design-system/sync-report.md and design-system/state.json, and prints one line:
        IN SYNC                      nothing to publish
        PUBLISH NEEDED: <files>      follow design-system/PUBLISH.md (needs Claude's Artifact tools)
        NEW GENERATORS: <names>      add them to pattern-map.json (and build a component if worth it)
--check            report only, write nothing (exit 1 if anything is out of step)
--mark-published   record that the current files are live (after publishing), with the artifact version id
"""
import os, re, sys, json, hashlib, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DS = os.path.join(ROOT, "design-system"); PROJ = os.path.join(DS, "project")
PT2PX, IN2PX = 96 / 72, 96          # design-system canvas: 1280 px wide = 13.333 in
S_PT2PX, S_IN2PX = 2.0, 144         # Claude Slides canvas: 1920 px wide

def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()

def house():
    s = read("Generators/house.js")
    def block(name):
        m = re.search(r"(?:const|let)\s+%s\s*=\s*\{(.*?)\n\};" % name, s, re.S) or re.search(r"(?:const|let)\s+%s\s*=\s*\{(.*?)\};" % name, s, re.S)
        if not m: raise SystemExit(f"sync_design_system: can't find {name} in Generators/house.js (format changed?)")
        return m.group(1)
    roles = {k: h.upper() for k, h in re.findall(r"(\w+):\s*\{\s*hex:\s*\"([0-9A-Fa-f]{6})\"", block("ROLES"))}
    tints = {}
    for hx, slot, mod, off in re.findall(r"\"?([0-9A-Fa-f]{6})\"?:\s*\{\s*slot:\s*\"(\w+)\",\s*lumMod:\s*(\d+),\s*lumOff:\s*(\d+)", block("TINTS")):
        tints[(slot, int(mod))] = hx.upper()
    ext = re.findall(r"\"([0-9A-Fa-f]{6})\"", re.search(r"const EXTENDED\s*=\s*\[(.*?)\]", s).group(1))
    nums = lambda body: {k: float(v) for k, v in re.findall(r"(\w+):\s*(-?[\d.]+)", body)}
    grid = nums(block("GRID")); typ = nums(block("TYPE"))
    W, H = map(float, re.search(r"(?:let|const)\s+W\s*=\s*([\d.]+),\s*H\s*=\s*([\d.]+)", s).groups())
    font = dict(re.findall(r"(\w+):\s*\"([^\"]+)\"", block("FONT")))
    need = {"text", "white", "main", "secondary", "accent", "grey1", "grey2", "grey3", "grey4"}
    if not need <= set(roles) or not {"title", "body", "label", "foot"} <= set(typ) or "left" not in grid:
        raise SystemExit("sync_design_system: house.js parsed incompletely; not writing anything")
    grid["bodyH"] = grid["footY"] - 0.15 - grid["bodyTop"]
    return dict(roles=roles, tints=tints, ext=[e.upper() for e in ext], grid=grid, type=typ, W=W, H=H, font=font)

def px(v, nd=2):
    t = f"{round(v, nd):.{nd}f}"
    return (t.rstrip("0").rstrip(".") if "." in t else t) + "px"

def expected_tokens(h):
    r, t = h["roles"], h["tints"]; hx = lambda v: "#" + v.lower()
    col = {"main": hx(r["main"]), "secondary": hx(r["secondary"]), "accent": hx(r["accent"]), "grey-1": hx(r["grey1"]), "grey-2": hx(r["grey2"]),
           "grey-3": hx(r["grey3"]), "grey-4": hx(r["grey4"]), "paper": hx(r["white"]),
           "surface": {"light": hx(r["white"]), "dark": hx(r["main"])}, "title": {"light": hx(r["main"])}, "ink": {"light": hx(r["text"])},
           "muted": {"light": hx(r["grey1"])}, "rule": {"light": hx(r["grey3"])}}
    for key, name in ((("accent1", 20000), "main-tint"), (("accent2", 20000), "secondary-tint"), (("accent3", 20000), "accent-tint")):
        if key in t: col[name] = hx(t[key])
    if ("bg2", 50000) in t: col["panel"] = {"light": hx(t[("bg2", 50000)])}
    if ("accent3", 60000) in t: col["accent-text"] = {"light": hx(t[("accent3", 60000)])}
    for name, e in zip(("ext-light-blue", "ext-dark-green", "ext-lime"), h["ext"]): col[name] = hx(e)
    T = h["type"]
    typ = {"t-cover": T.get("cover"), "t-divider": T.get("divider"), "t-kpi": T.get("kpi"), "t-title": T["title"], "t-subtitle": T.get("subtitle"),
           "t-body": T["body"], "t-body-zh": T["body"], "t-label": T["label"], "t-small": T.get("small"), "t-foot": T["foot"]}
    G = h["grid"]
    sp = {"slide-w": px(round(h["W"] * IN2PX), 0), "slide-h": px(h["H"] * IN2PX, 0), "margin-x": px(G["left"] * IN2PX), "title-top": px(G["titleTop"] * IN2PX),
          "title-h": px(G["titleH"] * IN2PX), "subtitle-top": px(G["subY"] * IN2PX), "body-top": px(G["bodyTop"] * IN2PX), "body-h": px(G["bodyH"] * IN2PX),
          "footer-top": px(G["footY"] * IN2PX)}
    return col, typ, sp

def apply_tokens(tok, h, changes):
    col, typ, sp = expected_tokens(h)
    for t in tok["color"]["tokens"]:
        want = col.get(t["name"])
        if want is None: continue
        if isinstance(want, dict):
            for k, v in want.items():
                if t["value"].get(k) != v: changes.append(f"colour {t['name']}.{k}: {t['value'].get(k)} → {v}"); t["value"][k] = v
        elif t["value"] != want: changes.append(f"colour {t['name']}: {t['value']} → {want}"); t["value"] = want
    for g in tok["type"]["groups"]:
        for st in g.get("styles", []):
            pt = typ.get(st["name"])
            if pt is None: continue
            want = px(pt * PT2PX)
            if st["fontSize"] != want:
                changes.append(f"type {st['name']}: {st['fontSize']} → {want} ({pt:g} pt)"); st["fontSize"] = want
                st["usage"] = re.sub(r"^\d+(\.\d+)? pt", f"{pt:g} pt", st.get("usage", ""))
    fam = tok["type"]["families"]["sans"]; lead = f'{h["font"]["latin"]}, "{h["font"]["ea"]}"'
    if not fam.startswith(lead):
        rest = ", ".join(x.strip() for x in fam.split(",")[2:]); tok["type"]["families"]["sans"] = lead + (", " + rest if rest else "")
        changes.append(f"font family → {lead}")
    for t in tok["spacing"]["tokens"]:
        want = sp.get(t["name"])
        if want and t["value"] != want: changes.append(f"spacing {t['name']}: {t['value']} → {want}"); t["value"] = want

def slides_token_block(h):
    r, t, T, G = h["roles"], h["tints"], h["type"], h["grid"]
    c = lambda v: "#" + v.upper(); f24 = lambda pt: max(24, round(pt * S_PT2PX))     # Slides shows nothing under 24 px (12 pt)
    L = ["/* @tokens:start  (written by scripts/sync_design_system.py from Generators/house.js; edit there, not here) */", ":root {",
         f"  --main: {c(r['main'])}; --secondary: {c(r['secondary'])}; --accent: {c(r['accent'])}; --accent-text: {c(t.get(('accent3', 60000), '4D7100'))};",
         f"  --ink: {c(r['text'])}; --muted: {c(r['grey1'])}; --grey-2: {c(r['grey2'])}; --rule: {c(r['grey3'])}; --grey-4: {c(r['grey4'])}; --paper: {c(r['white'])};",
         f"  --panel: {c(t.get(('bg2', 50000), 'F0F0F0'))}; --main-tint: {c(t.get(('accent1', 20000), 'CCD4E4'))}; --secondary-tint: {c(t.get(('accent2', 20000), 'CCECF8'))}; --accent-tint: {c(t.get(('accent3', 20000), 'E6F2CC'))};",
         f"  --font: {h['font']['latin']}, \"{h['font']['ea']}\", \"PingFang SC\", sans-serif;",
         f"  --t-title: {round(T['title'] * S_PT2PX)}px; --t-body: {round(T['body'] * S_PT2PX)}px; --t-label: {f24(T['label'])}px; --t-foot: {f24(T['foot'])}px;",
         f"  --t-kpi: {round(T.get('kpi', 66) * S_PT2PX)}px; --t-cover: {round(T.get('cover', 36) * S_PT2PX)}px; --t-sub: {round(T.get('subtitle', 14) * S_PT2PX)}px;",
         f"  --mx: {round(G['left'] * S_IN2PX)}px; --title-top: {round(G['titleTop'] * S_IN2PX)}px; --title-h: {round(G['titleH'] * S_IN2PX)}px; --body-top: {round(G['bodyTop'] * S_IN2PX)}px; --foot-top: {round(G['footY'] * S_IN2PX)}px;",
         "}"]
    L += ["section {" ] + L[2:-1] + ["}", "/* @tokens:end */"]     # same values on every slide, in case a reader skips :root
    return "\n".join(L)

def generators():
    names = {}
    for f in sorted(os.listdir(os.path.join(ROOT, "Generators"))):
        if not re.fullmatch(r"patterns\w*\.js", f): continue
        s = read("Generators/" + f)
        cand = re.findall(r"module\.exports\.(\w+)\s*=", s)
        for body in re.findall(r"module\.exports\s*=\s*\{(.*?)\};", s, re.S) + re.findall(r"Object\.assign\(module\.exports,\s*\{(.*?)\}\)", s, re.S):
            cand += [n.strip().split(":")[0].strip() for n in body.replace("\n", " ").split(",")]
        for n in cand:
            if re.fullmatch(r"[a-z]\w*", n) and re.search(r"(function\s+%s\s*\(|const\s+%s\s*=\s*\()" % (n, n), s): names[n] = f
    return names

def version():
    m = re.search(r"^\|\s*(\d+\.\d+)\s*\|", read("logs/changelog.md"), re.M); return m.group(1) if m else "?"

def tree_hash():
    hsh = hashlib.sha256(); files = []
    for dp, dn, fn in os.walk(PROJ):
        for f in sorted(fn):
            p = os.path.join(dp, f); rel = os.path.relpath(p, PROJ); files.append(rel)
    out = {}
    for rel in sorted(files):
        d = hashlib.sha256(open(os.path.join(PROJ, rel), "rb").read()).hexdigest(); out[rel] = d; hsh.update((rel + d).encode())
    return hsh.hexdigest(), out

def main():
    a = sys.argv[1:]; check = "--check" in a
    state_p = os.path.join(DS, "state.json"); state = json.load(open(state_p)) if os.path.exists(state_p) else {}
    if "--mark-published" in a:
        hsh, files = tree_hash()
        state.update(published_hash=hsh, published_files=files, published_version=a[a.index("--mark-published") + 1], published_at=datetime.datetime.now().isoformat(timespec="minutes"),
                     folder_version=version())
        json.dump(state, open(state_p, "w"), indent=1); print("marked published:", state["published_version"]); return 0
    h = house(); changes = []
    tok_p = os.path.join(PROJ, "tokens.json"); tok = json.load(open(tok_p, encoding="utf-8"))
    apply_tokens(tok, h, changes)
    css_p = os.path.join(PROJ, "slides-kit", "deck.css"); css = open(css_p, encoding="utf-8").read() if os.path.exists(css_p) else ""
    blk = slides_token_block(h)
    new_css = re.sub(r"/\* @tokens:start.*?@tokens:end \*/", lambda m: blk, css, flags=re.S) if "@tokens:start" in css else css
    if css and new_css != css: changes.append("slides-kit/deck.css token block")
    v = version(); rd_p = os.path.join(PROJ, "README.md"); rd = open(rd_p, encoding="utf-8").read()
    new_rd = re.sub(r"\*\*In step with folder version [^*]*\*\*", f"**In step with folder version {v}**", rd)
    if new_rd != rd and changes: pass
    # coverage
    pm_p = os.path.join(DS, "pattern-map.json"); pm = json.load(open(pm_p, encoding="utf-8")) if os.path.exists(pm_p) else {"patterns": {}, "helpers": []}
    gens = generators(); known = set(pm["patterns"]) | set(pm.get("helpers", []))
    new_gens = sorted(n for n in gens if n not in known); gone = sorted(n for n in pm["patterns"] if n not in gens)
    gaps = sorted(n for n, m in pm["patterns"].items() if n in gens and not m.get("component") and not m.get("slides"))
    if not check:
        if changes:
            json.dump(tok, open(tok_p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
            if css and new_css != css: open(css_p, "w", encoding="utf-8").write(new_css)
        if new_rd != rd: open(rd_p, "w", encoding="utf-8").write(new_rd)
    hsh, files = tree_hash()
    pub = state.get("published_files", {})
    to_publish = sorted(f for f, d in files.items() if pub.get(f) != d and f != "design-system.json")
    removed = sorted(f for f in pub if f not in files)
    status = "IN SYNC" if not (to_publish or removed or new_gens) else ""
    lines = [f"# Design system sync report", "", f"Folder version {v}; checked {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}.", ""]
    lines += ["## House look → tokens", ""] + ([f"- {c}" for c in changes] or ["- No change: tokens match `Generators/house.js`."]) + [""]
    lines += ["## To publish", ""] + ([f"- `{f}`" for f in to_publish] + [f"- remove `{f}`" for f in removed] or ["- Nothing: the live design system matches `design-system/project/`."]) + [""]
    lines += ["## Pattern coverage", "", f"- Generators: {len(gens)}; mapped to a component or Slides recipe: {sum(1 for n in gens if n in pm['patterns'] and (pm['patterns'][n].get('component') or pm['patterns'][n].get('slides')))}; PowerPoint-only (known gaps): {len(gaps)}."]
    if new_gens: lines.append("- **New generators not in `pattern-map.json`:** " + ", ".join(f"`{n}` ({gens[n]})" for n in new_gens))
    if gone: lines.append("- In the map but no longer exported: " + ", ".join(f"`{n}`" for n in gone))
    if gaps: lines.append("- PowerPoint-only: " + ", ".join(f"`{n}`" for n in gaps))
    if not check:
        open(os.path.join(DS, "sync-report.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
        state.update(checked_at=datetime.datetime.now().isoformat(timespec="minutes"), folder_version_checked=v, needs_publish=bool(to_publish or removed), new_generators=new_gens)
        json.dump(state, open(state_p, "w"), indent=1)
    if status: print(status)
    if to_publish or removed: print("PUBLISH NEEDED:", len(to_publish), "file(s):", ", ".join(to_publish[:8]) + (" …" if len(to_publish) > 8 else ""))
    if new_gens: print("NEW GENERATORS:", ", ".join(new_gens))
    if check and changes: print("TOKENS OUT OF STEP:", "; ".join(changes))
    return 0 if status and not (check and changes) else 1

if __name__ == "__main__": sys.exit(main())
