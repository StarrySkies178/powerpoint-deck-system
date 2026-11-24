"""objstore.py: the reusable object store.

Every drawing in the template libraries is saved as editable vector XML (DrawingML), with:
  * colours remapped to house THEME ROLES (schemeClr) -> recolour by changing the theme or a role map
  * fonts set to the theme font (+mn-lt / +mn-ea) -> follows Arial/YaHei or any reference font
  * a stored bounding box -> resize to any box (vector, lossless) via a scaling group
  * pictures kept as media files -> re-linked when placed

Operations (all return a new object; the store is never modified):
  resize      place(obj, box, keep_aspect=True)
  recolour    recolour(obj, {"accent1": "accent3", ...})  or set the deck theme
  flip/rotate transform(obj, flipH, flipV, rot)
  extend      extend(obj, n)        # 4 arrows -> 5 arrows: finds the repeated element, re-spaces it
  swap shape  swap_geom(obj, "chevron", where=...)    # transmute preset shapes
  combine     several place() calls on one slide, or combine([...]) into one object
  pick        element(obj, i)       # lift one shape out of an object to reuse on its own

CLI:
  python3 objstore.py extract <deck.pptx> <deck_key> <store_dir>
  python3 objstore.py find <store_dir> <words...>
"""
import copy, gzip, hashlib, json, math, os, re, sys, zipfile
from lxml import etree

NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
A, P, RNS = "{%s}" % NS["a"], "{%s}" % NS["p"], "{%s}" % NS["r"]
EMU = 914400
DS = "{urn:deck-system:src}"   # private attribute on a stored colour: the exact original colour (stripped by place())
SHAPE_TAGS = {P + "sp", P + "grpSp", P + "cxnSp", P + "pic", P + "graphicFrame"}

# ------------------------------------------------------------------ colour -> house role
def _rgb(h): return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def _hsl(h):
    r, g, b = [c / 255 for c in _rgb(h)]
    mx, mn = max(r, g, b), min(r, g, b); l = (mx + mn) / 2
    s = 0 if mx == mn else (mx - mn) / (1 - abs(2 * l - 1))
    return s, l

def role_map(hexes_by_use):
    """Map each source colour to a house theme slot.
    Saturated colours by usage -> accent1 (main), accent2 (secondary), accent3 (accent);
    greys by lightness -> accent5 (dark grey), accent4, accent6, bg2 (lightest); black-ish -> tx1; white -> bg1."""
    m, sat = {}, []
    for h, _n in hexes_by_use:
        s, l = _hsl(h)
        if l > 0.96: m[h] = "bg1"
        elif l < 0.13: m[h] = "tx1"
        elif s > 0.22: sat.append(h)
        elif l < 0.42: m[h] = "accent5"
        elif l < 0.62: m[h] = "accent4"
        elif l < 0.80: m[h] = "accent6"
        else: m[h] = "bg2"
    # most-used saturated -> main; then secondary; then accent; others cycle main/secondary by lightness
    for i, h in enumerate(sat):
        m[h] = ["accent1", "accent2", "accent3"][i] if i < 3 else ("accent1" if _hsl(h)[1] < 0.5 else "accent2")
    return m

def _theme_colors(z, slide_name):
    """Resolve the slide's theme (slide -> layout -> master -> theme) to {slot: hex} incl. clrMap aliases."""
    def rel_target(part, typ):
        rp = os.path.dirname(part) + "/_rels/" + os.path.basename(part) + ".rels"
        if rp not in z.namelist(): return None
        for r in etree.fromstring(z.read(rp)):
            if r.get("Type", "").endswith("/" + typ):
                return os.path.normpath(os.path.join(os.path.dirname(part), r.get("Target"))).replace("\\", "/")
    lay = rel_target(slide_name, "slideLayout"); mas = rel_target(lay, "slideMaster") if lay else None
    th = rel_target(mas, "theme") if mas else None
    cols = {}
    if th:
        t = etree.fromstring(z.read(th))
        cs = t.find(".//a:clrScheme", NS)
        if cs is not None:
            for el in cs:
                tag = etree.QName(el).localname; c = el[0]
                cols[tag] = c.get("val") if etree.QName(c).localname == "srgbClr" else (c.get("lastClr") or ("000000" if tag == "dk1" else "FFFFFF"))
    cmap = {"tx1": "dk1", "bg1": "lt1", "tx2": "dk2", "bg2": "lt2"}
    if mas:
        cm = etree.fromstring(z.read(mas)).find(".//p:clrMap", NS)
        if cm is not None: cmap = {k: cm.get(k) for k in ("tx1", "bg1", "tx2", "bg2")}
    for k, v in cmap.items():
        if v in cols: cols[k] = cols[v]
    return {k: v.upper() for k, v in cols.items() if v}

# ------------------------------------------------------------------ geometry helpers
def _xfrm(el):
    """(x, y, w, h) of a top-level shape in EMU, or None."""
    tag = etree.QName(el).localname
    if tag == "grpSp": x = el.find("p:grpSpPr/a:xfrm", NS)
    elif tag == "graphicFrame": x = el.find("p:xfrm", NS)
    else: x = el.find("./*/a:xfrm", NS)
    if x is None: return None
    off, ext = x.find("a:off", NS), x.find("a:ext", NS)
    if off is None or ext is None: return None
    return [int(off.get("x")), int(off.get("y")), int(ext.get("cx")), int(ext.get("cy"))]

def _set_xfrm(el, x, y, w, h):
    tag = etree.QName(el).localname
    xf = el.find("p:grpSpPr/a:xfrm", NS) if tag == "grpSp" else (el.find("p:xfrm", NS) if tag == "graphicFrame" else el.find("./*/a:xfrm", NS))
    off, ext = xf.find("a:off", NS), xf.find("a:ext", NS)
    if tag == "grpSp":  # keep children mapping: scale chExt/chOff stay, only frame moves
        pass
    off.set("x", str(int(x))); off.set("y", str(int(y))); ext.set("cx", str(max(1, int(w)))); ext.set("cy", str(max(1, int(h))))

def _text(el): return " ".join(t.text or "" for t in el.iter(A + "t")).strip()

# ------------------------------------------------------------------ EXTRACT
FILLER = re.compile(r"^(text( \d+)?|header|heading|headline|title( text)?|sub-?title|label( ?\d+)?|xx+|x+%?|\.\.\.|…|<[^>]{1,40}>|\?<[^>]+>|"
    r"type text here.*|or here|level \d text|text level \d|insert .*|lorem ipsum.*|this is (dummy|a level).*|placeholder.*|name( surname)?|"
    r"arrow \d+|step \d+|phase \d+|option \d+|factor( \d+)?|item( \d+)?|category( \d+)?|series( \d+)?|measure( \d+)?|"
    r"box title|heading \d|point \d|chart title|axis title|legend|value|text text text|\[insert your text\]|txt|文本|标题)$", re.I)
INSTRUCTION = re.compile(r"(graphic title goes here|chart title goes here|subtitle runs here|^tip[:!]|right-click|use this slide|click (here|on)|"
    r"insert appropriate|member firms|place notes|subtitle is \d+ ?point|this is an example of a tombstone|check language settings|"
    r"assign .*template|use .*template|copy and paste|keep source formatting|all phrases can be replaced|n\.b\.|"
    r"dummy text|is not here to be read|last modified|<company name>|<message>|<title>|<footnote>|unit of measure|^\* ?\t?footnote|^source:? *source$|^source$)", re.I)

def _frame_keys(z, order):
    """Elements repeated on >=40% of a deck's slides (logos, 'Last Modified', company-name boxes) = frame, not content."""
    cnt = {}
    for sname in order:
        tree = etree.fromstring(z.read(sname)).find(".//p:cSld/p:spTree", NS)
        seen = set()
        for el in tree:
            if el.tag not in SHAPE_TAGS: continue
            bb = _xfrm(el)
            if not bb: continue
            k = (etree.QName(el).localname, _text(el)[:30], round(bb[0] / 50000), round(bb[1] / 50000), round(bb[2] / 50000))
            seen.add(k)
        for k in seen: cnt[k] = cnt.get(k, 0) + 1
    n = len(order)
    return {k for k, c in cnt.items() if n >= 5 and c >= 0.4 * n}

def _clean_text(el):
    """Filler text -> empty fillable SLOT (hint kept in the shape name); returns 'drop' for instruction boxes."""
    t = _text(el)
    if not t: return None
    if INSTRUCTION.search(t) and (etree.QName(el).localname == "sp" and not _filled(el) or len(t) > 60): return "drop"
    nslots = 0
    shapes = [el] if etree.QName(el).localname == "sp" else list(el.iter(P + "sp")) + list(el.iter(P + "graphicFrame"))
    for sp in shapes:
        if etree.QName(sp).localname == "sp" and INSTRUCTION.search(_text(sp)) and not _filled(sp):
            sp.getparent().remove(sp); continue
        hint = _text(sp); n_here = 0
        for tb in list(sp.iter(P + "txBody")) + list(sp.iter(A + "txBody")):
            for para in tb.findall("a:p", NS):
                pt = "".join(x.text or "" for x in para.iter(A + "t")).strip()
                if pt and FILLER.match(pt):
                    ts = list(para.iter(A + "t")); ts[0].text = ""
                    for x in ts[1:]: x.text = ""
                    n_here += 1
        if n_here and etree.QName(sp).localname == "sp":
            c = sp.find("p:nvSpPr/p:cNvPr", NS); c.set("name", "Slot: " + hint[:40]); c.set("descr", "slot")
        nslots += n_here
    return nslots

def extract(deck_path, deck_key, store_dir, slide_meta=None):
    z = zipfile.ZipFile(deck_path)
    pres = etree.fromstring(z.read("ppt/presentation.xml"))
    sz = pres.find("p:sldSz", NS); SW, SH = int(sz.get("cx")), int(sz.get("cy"))
    rels = etree.fromstring(z.read("ppt/_rels/presentation.xml.rels"))
    rid2t = {r.get("Id"): r.get("Target") for r in rels}
    order = ["ppt/" + rid2t[s.get(RNS + "id")] for s in pres.find("p:sldIdLst", NS)]
    os.makedirs(os.path.join(store_dir, "media"), exist_ok=True)
    frame = _frame_keys(z, order)
    out = []
    for si, sname in enumerate(order, 1):
        root = etree.fromstring(z.read(sname)); tree = root.find(".//p:cSld/p:spTree", NS)
        srels = {}
        rp = os.path.dirname(sname) + "/_rels/" + os.path.basename(sname) + ".rels"
        if rp in z.namelist():
            for r in etree.fromstring(z.read(rp)):
                srels[r.get("Id")] = (r.get("Type").split("/")[-1], os.path.normpath(os.path.join(os.path.dirname(sname), r.get("Target"))).replace("\\", "/"), r.get("TargetMode"))
        theme = _theme_colors(z, sname)
        keep, charts = [], {}
        for el in tree:
            if el.tag not in SHAPE_TAGS: continue
            if el.find(".//p:nvPr/p:ph", NS) is not None and etree.QName(el).localname != "grpSp": continue  # title/footer placeholders
            bb0 = _xfrm(el)
            if bb0 and (etree.QName(el).localname, _text(el)[:30], round(bb0[0] / 50000), round(bb0[1] / 50000), round(bb0[2] / 50000)) in frame: continue
            if etree.QName(el).localname == "graphicFrame":
                cref = el.find(".//{http://schemas.openxmlformats.org/drawingml/2006/chart}chart", NS)
                ole = el.find(".//p:oleObj", NS)
                if cref is not None and cref.get(RNS + "id") in srels:      # native chart: keep, editable
                    charts[cref.get(RNS + "id")] = srels[cref.get(RNS + "id")][1]
                elif ole is not None:                                         # think-cell / MS Graph: keep preview image
                    pic = ole.find("p:pic", NS)
                    if pic is None: continue
                    pic = copy.deepcopy(pic); xf = el.find("p:xfrm", NS)
                    sp = pic.find("p:spPr", NS); old = sp.find("a:xfrm", NS)
                    if old is not None: sp.remove(old)
                    nx = etree.SubElement(sp, A + "xfrm"); sp.insert(0, nx)
                    for c in xf: nx.append(copy.deepcopy(c))
                    el = pic
                elif el.find(".//a:tbl", NS) is None: continue
            bb = _xfrm(el)
            # a straight line or divider has zero width or zero height (PDF imports draw them so): keep it; only a shape
            # with no size at all is dropped
            if bb is None or bb[2] < 0 or bb[3] < 0 or (bb[2] == 0 and bb[3] == 0): continue
            x, y, w, h = bb
            if y > SH * 0.91: continue                                                      # footer zone
            if y + h < SH * 0.17 and etree.QName(el).localname == "sp" and _text(el) and w > SW * 0.3: continue  # title-like text box
            keep.append(el)
        if not keep: continue
        # media + charts
        media, ok, chart_parts = {}, True, {}
        CH = "{http://schemas.openxmlformats.org/drawingml/2006/chart}chart"
        for el in keep:
            for b in el.iter(A + "blip"):
                rid = b.get(RNS + "embed") or b.get(RNS + "link")
                if rid not in srels or srels[rid][2] == "External": ok = False; continue
                data = z.read(srels[rid][1]); ext = os.path.splitext(srels[rid][1])[1].lower()
                hname = hashlib.sha1(data).hexdigest()[:16] + ext
                fp = os.path.join(store_dir, "media", hname)
                if not os.path.exists(fp): open(fp, "wb").write(data)
                media[rid] = hname
            for cr in el.iter(CH):
                rid = cr.get(RNS + "id")
                if rid in charts:
                    cname = charts[rid]; key = f"chart{len(chart_parts) + 1}"
                    part = {"xml": z.read(cname).decode("utf-8"), "rels": []}
                    rp = os.path.dirname(cname) + "/_rels/" + os.path.basename(cname) + ".rels"
                    if rp in z.namelist():
                        for r in etree.fromstring(z.read(rp)):
                            if r.get("TargetMode") == "External": continue
                            tgt = os.path.normpath(os.path.join(os.path.dirname(cname), r.get("Target"))).replace("\\", "/")
                            if tgt in z.namelist():
                                import base64
                                part["rels"].append({"id": r.get("Id"), "type": r.get("Type"), "ext": os.path.splitext(tgt)[1],
                                                     "data": base64.b64encode(z.read(tgt)).decode()})
                    chart_parts[key] = part; media[rid] = "CHART:" + key
        frag = etree.Element(P + "spTree", nsmap={"a": NS["a"], "p": NS["p"], "r": NS["r"], "ds": DS[1:-1]})
        for el in keep: frag.append(copy.deepcopy(el))
        for e in frag.iter():
            for att in list(e.attrib):
                if att.startswith(RNS):
                    v = e.get(att)
                    if v in media: e.set(att, media[v] if media[v].startswith("CHART:") else "MEDIA:" + media[v])
                    else: del e.attrib[att]
            if e.tag == A + "hlinkClick": e.getparent().remove(e)
        # filler text -> slots; instruction boxes dropped
        slots = 0
        for el in list(frag):
            r = _clean_text(el)
            if r == "drop": frag.remove(el)
            elif r: slots += r
        if not len(frag): continue
        # colours: resolve scheme refs to hex, count, remap to house roles
        use = {}
        for c in list(frag.iter(A + "schemeClr")):
            v = c.get("val")
            if v == "phClr": continue
            hx = theme.get(v) or theme.get({"tx1": "dk1", "bg1": "lt1", "tx2": "dk2", "bg2": "lt2"}.get(v, v))
            if not hx: continue
            c.tag = A + "srgbClr"; c.set("val", hx)
        for c in frag.iter(A + "srgbClr"):
            use[c.get("val").upper()] = use.get(c.get("val").upper(), 0) + 1
        for c in frag.iter(A + "sysClr"):
            c.tag = A + "srgbClr"; v = (c.get("lastClr") or "000000").upper()
            for k in list(c.attrib): del c.attrib[k]
            c.set("val", v); use[v] = use.get(v, 0) + 1
        chart_trees = {}
        for k, part in chart_parts.items():
            ct = etree.fromstring(part["xml"].encode("utf-8"))
            for c in ct.iter(A + "srgbClr"): use[c.get("val").upper()] = use.get(c.get("val").upper(), 0) + 1
            for c in list(ct.iter(A + "schemeClr")):
                hx = theme.get(c.get("val"))
                if hx: c.tag = A + "srgbClr"; c.set("val", hx); use[hx] = use.get(hx, 0) + 1
            chart_trees[k] = ct
        rm = role_map(sorted(use.items(), key=lambda kv: -kv[1]))
        role_src = {}                                   # slot -> the original colour it stands for (most used first)
        for hx, _n in sorted(use.items(), key=lambda kv: -kv[1]):
            if rm.get(hx) and rm[hx] not in role_src: role_src[rm[hx]] = hx
        for k, ct in chart_trees.items():
            for c in list(ct.iter(A + "srgbClr")):
                role = rm.get(c.get("val").upper())
                if role: c.set(DS + "c", c.get("val").upper()); c.tag = A + "schemeClr"; c.set("val", role)
            for t in ct.iter(A + "latin"): t.set("typeface", "+mn-lt")
            chart_parts[k]["xml"] = etree.tostring(ct, encoding="unicode")
        for c in list(frag.iter(A + "srgbClr")):
            role = rm.get(c.get("val").upper())
            if role: c.set(DS + "c", c.get("val").upper()); c.tag = A + "schemeClr"; c.set("val", role)
        # fonts -> theme fonts
        for t in frag.iter(A + "latin"): t.set("typeface", "+mn-lt")
        for t in frag.iter(A + "ea"): t.set("typeface", "+mn-ea")
        for t in frag.iter(A + "cs"): t.set("typeface", "+mn-cs")
        bbs = [_xfrm(el) for el in frag]
        X0 = min(b[0] for b in bbs); Y0 = min(b[1] for b in bbs)
        X1 = max(b[0] + b[2] for b in bbs); Y1 = max(b[1] + b[3] for b in bbs)
        meta = (slide_meta or {}).get(si, {})
        obj = dict(id=f"{deck_key}-{si:03d}", deck=deck_key, slide=si, pattern=meta.get("pattern", ""),
                   title=meta.get("title", ""), note=meta.get("note", ""), bbox=[X0, Y0, X1 - X0, Y1 - Y0], src_slide=[SW, SH],
                   n_shapes=len(frag), text=" | ".join(filter(None, (_text(el)[:40] for el in frag)))[:200],
                   roles_used=sorted(set(rm.values())), media=sorted(set(v for v in media.values() if not v.startswith("CHART:"))), complete=ok,
                   slots=slots, charts=chart_parts, role_src=role_src,
                   xml=etree.tostring(frag, encoding="unicode"))
        out.append(obj)
    with gzip.open(os.path.join(store_dir, f"{deck_key}.jsonl.gz"), "wt", encoding="utf-8") as f:
        for o in out: f.write(json.dumps(o, ensure_ascii=False) + "\n")
    return out

# ------------------------------------------------------------------ LOAD / FIND
_CACHE = {}
def load_deck(store_dir, deck):
    k = (store_dir, deck)
    if k not in _CACHE:
        with gzip.open(os.path.join(store_dir, f"{deck}.jsonl.gz"), "rt", encoding="utf-8") as f:
            _CACHE[k] = {o["id"]: o for o in map(json.loads, f)}
    return _CACHE[k]
def get(store_dir, oid): return copy.deepcopy(load_deck(store_dir, oid.rsplit("-", 1)[0])[oid])
def find(store_dir, words, limit=20):
    idx = json.load(open(os.path.join(store_dir, "index.json")))
    ws = [w.lower() for w in words]
    hits = [o for o in idx if all(w in (o["pattern"] + " " + o["title"] + " " + o["note"] + " " + o["text"]).lower() for w in ws)]
    return hits[:limit]

def _frag(obj): return etree.fromstring(obj["xml"])
def _store(obj, frag):
    obj["xml"] = etree.tostring(frag, encoding="unicode")
    bbs = [_xfrm(el) for el in frag if _xfrm(el)]
    X0 = min(b[0] for b in bbs); Y0 = min(b[1] for b in bbs)
    obj["bbox"] = [X0, Y0, max(b[0] + b[2] for b in bbs) - X0, max(b[1] + b[3] for b in bbs) - Y0]
    return obj

# ------------------------------------------------------------------ OPERATIONS
def original_colours(obj):
    """Put back the colours the object had in its source slide (needs role_src, saved since 2026-11-23).
    Use when the user names that exact reference slide; otherwise objects follow the deck theme."""
    src = obj.get("role_src") or {}
    obj = copy.deepcopy(obj)
    def fix(tree):   # each colour's own original (kept per colour since v2.85), else the slot's most used original
        for c in list(tree.iter(A + "schemeClr")):
            hx = c.get(DS + "c") or src.get(c.get("val"))
            if hx: c.tag = A + "srgbClr"; c.set("val", hx)
            c.attrib.pop(DS + "c", None)
    f = _frag(obj); fix(f)
    for k, part in obj.get("charts", {}).items():
        ct = etree.fromstring(part["xml"].encode("utf-8")); fix(ct); part["xml"] = etree.tostring(ct, encoding="unicode")
    return _store(obj, f)

def recolour(obj, mapping):
    """mapping: {'accent1': 'accent3', ...} role->role, or role->'#RRGGBB' for a fixed colour."""
    obj = copy.deepcopy(obj); f = _frag(obj)
    for c in f.iter(A + "schemeClr"):
        v = mapping.get(c.get("val"))
        if v is None: continue
        c.attrib.pop(DS + "c", None)   # recoloured on purpose: no longer the original colour
        if v.startswith("#"): c.tag = A + "srgbClr"; c.set("val", v[1:].upper())
        else: c.set("val", v)
    return _store(obj, f)

def element(obj, i):
    """Lift top-level shape i out of an object."""
    obj = ungroup(obj); f = _frag(obj)
    for j, el in enumerate(list(f)):
        if j != i: f.remove(el)
    obj["id"] += f".e{i}"
    obj = _store(obj, f)
    return _used_media(obj)

def _used_media(obj):
    """Keep in obj["media"] only the pictures its XML still refers to ("MEDIA:<name>")."""
    if obj.get("media"):
        x = obj["xml"]; obj["media"] = [m for m in obj["media"] if "MEDIA:" + m in x]
    return obj

def elements(obj):
    f = _frag(ungroup(obj))
    return [dict(i=i, kind=etree.QName(el).localname, geom=_geom(el), bbox=_xfrm(el), text=_text(el)[:40]) for i, el in enumerate(f)]

def _geom(el):
    g = el.find(".//a:prstGeom", NS)
    return g.get("prst") if g is not None else ("custom" if el.find(".//a:custGeom", NS) is not None else etree.QName(el).localname)

def swap_geom(obj, prst, where=None):
    """Transmute preset/custom shapes into preset `prst` (e.g. 'chevron', 'roundRect', 'ellipse').
    where(element_info) -> bool selects which shapes (default: all simple shapes)."""
    obj = ungroup(obj); f = _frag(obj)
    for i, el in enumerate(f):
        if etree.QName(el).localname != "sp" or not _filled(el): continue
        info = dict(i=i, geom=_geom(el), bbox=_xfrm(el), text=_text(el))
        if where and not where(info): continue
        spPr = el.find("p:spPr", NS)
        for g in spPr.findall("a:prstGeom", NS) + spPr.findall("a:custGeom", NS): spPr.remove(g)
        ng = etree.SubElement(spPr, A + "prstGeom", prst=prst); etree.SubElement(ng, A + "avLst")
        xf = spPr.find("a:xfrm", NS); spPr.remove(ng); spPr.insert(list(spPr).index(xf) + 1 if xf is not None else 0, ng)
    return _store(obj, f)

def transform(obj, flipH=False, flipV=False, rot=0):
    """Flip/rotate the whole object about its centre (vector)."""
    obj = copy.deepcopy(obj); f = _frag(obj)
    X, Y, W, H = obj["bbox"]; cx, cy = X + W / 2, Y + H / 2
    for el in f:
        x, y, w, h = _xfrm(el); ex, ey = x + w / 2, y + h / 2
        if flipH: ex = 2 * cx - ex
        if flipV: ey = 2 * cy - ey
        if rot:
            a = math.radians(rot); dx, dy = ex - cx, ey - cy
            ex, ey = cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)
        _set_xfrm(el, ex - w / 2, ey - h / 2, w, h)
        xf = el.find("p:grpSpPr/a:xfrm", NS) if etree.QName(el).localname == "grpSp" else el.find("./*/a:xfrm", NS)
        if xf is None: continue
        if flipH: xf.set("flipH", "0" if xf.get("flipH") == "1" else "1")
        if flipV: xf.set("flipV", "0" if xf.get("flipV") == "1" else "1")
        if rot: xf.set("rot", str((int(xf.get("rot", "0")) + int(rot * 60000)) % 21600000))
    return _store(obj, f)

def ungroup(obj):
    """Dissolve top-level groups so their parts can be edited one by one (repeat until >1 part)."""
    obj = copy.deepcopy(obj); f = _frag(obj)
    changed = True
    while changed:
        changed = False
        kids = list(f)
        if len(kids) == 1 and etree.QName(kids[0]).localname == "grpSp":
            _ungroup_into(f, kids[0]); changed = True
    return _store(obj, f)

def _ungroup_into(parent, g):
    xf = g.find("p:grpSpPr/a:xfrm", NS)
    off, ext, cho, che = (xf.find("a:" + t, NS) for t in ("off", "ext", "chOff", "chExt"))
    ox, oy, ew, eh = int(off.get("x")), int(off.get("y")), int(ext.get("cx")), int(ext.get("cy"))
    cx, cy, cw, chh = int(cho.get("x")), int(cho.get("y")), max(1, int(che.get("cx"))), max(1, int(che.get("cy")))
    sx, sy = ew / cw, eh / chh
    pos = list(parent).index(g)
    for j, ch in enumerate([c for c in g if c.tag in SHAPE_TAGS]):
        bb = _xfrm(ch)
        if bb: _set_xfrm(ch, ox + (bb[0] - cx) * sx, oy + (bb[1] - cy) * sy, bb[2] * sx, bb[3] * sy)
        parent.insert(pos + j, ch)
    parent.remove(g)

def explode(obj):
    """Dissolve ALL groups recursively (e.g. map -> one shape per province)."""
    obj = copy.deepcopy(obj); f = _frag(obj)
    while True:
        gs = [e for e in f if etree.QName(e).localname == "grpSp"]
        if not gs: break
        for g in gs: _ungroup_into(f, g)
    return _store(obj, f)

def _filled(el):
    """True for a visible shape (fill, picture or non-rect geometry), False for a text-only box."""
    tag = etree.QName(el).localname
    if tag in ("grpSp", "pic", "graphicFrame", "cxnSp"): return True
    spPr = el.find("p:spPr", NS)
    if spPr is None: return False
    has_fill = any(spPr.find("a:" + t, NS) is not None for t in ("solidFill", "gradFill", "blipFill", "pattFill"))
    style_fill = el.find("p:style/a:fillRef", NS) is not None and spPr.find("a:noFill", NS) is None
    return has_fill or style_fill or _geom(el) not in ("rect", "custom")

def _repeated(f):
    """Largest set of visible siblings with the same geometry family and similar area (±60%).
    Rotated copies of a freeform (cycle segments) count as the same element."""
    kids = list(f); fam = {}
    for i, el in enumerate(kids):
        bb = _xfrm(el)
        if not bb or not _filled(el): continue
        if etree.QName(el).localname == "cxnSp" or _geom(el) in ("line", "straightConnector1", "bentConnector3"): continue
        if min(bb[2], bb[3]) < 0.06 * max(bb[2], bb[3]): continue      # thin bars / rules are dividers, not items
        fam.setdefault(_geom(el), []).append((bb[2] * bb[3], i))
    best = None
    for g, items in fam.items():
        items.sort(); cl = [[items[0]]]
        for a_, i in items[1:]:
            (cl[-1].append((a_, i)) if a_ <= cl[-1][0][0] * 1.6 else cl.append([(a_, i)]))
        for c in cl:
            if len(c) >= 3 and (best is None or (len(c), sum(x[0] for x in c)) > (len(best), sum(x[0] for x in best))): best = c
    return [i for _, i in best] if best else None

def _expand_groups(f):
    """If no repeats at top level, open the biggest group (its parts may be the repeats)."""
    kids = list(f)
    gs = [(_xfrm(e)[2] * _xfrm(e)[3], e) for e in kids if etree.QName(e).localname == "grpSp" and _xfrm(e)]
    if not gs: return False
    _ungroup_into(f, max(gs, key=lambda x: x[0])[1]); return True

def _lane_units(f, idx, unit):
    """Linear layouts: any other element whose span along the flow sits within one repeat's span
    (text under a chevron, the box beside a row tag) belongs to that repeat and moves with it."""
    kids = list(f); bbs = {i: _xfrm(kids[i]) for i in idx}
    cs = [(b[0] + b[2] / 2, b[1] + b[3] / 2) for b in bbs.values()]
    horiz = (max(c[0] for c in cs) - min(c[0] for c in cs)) >= (max(c[1] for c in cs) - min(c[1] for c in cs))
    lo = (lambda b: b[0]) if horiz else (lambda b: b[1]); sz = (lambda b: b[2]) if horiz else (lambda b: b[3])
    taken = {t for v in unit.values() for t in v} | set(idx)
    for j, el in enumerate(kids):
        if j in taken: continue
        b = _xfrm(el)
        if not b: continue
        hits = []
        clo = (lambda b: b[1]) if horiz else (lambda b: b[0]); csz = (lambda b: b[3]) if horiz else (lambda b: b[2])
        for i, rb in bbs.items():
            ov = min(lo(b) + sz(b), lo(rb) + sz(rb)) - max(lo(b), lo(rb))
            gap = max(clo(b) - (clo(rb) + csz(rb)), clo(rb) - (clo(b) + csz(b)), 0)      # distance across the flow
            if ov > 0.6 * sz(b) and sz(b) <= 1.3 * sz(rb) and gap <= 0.5 * max(csz(rb), 1): hits.append(i)
        if len(hits) == 1: unit[hits[0]].append(j)
    return unit

def _units(f, idx):
    """Attach each repeated shape's label (text-only boxes inside or nearest to it) so they move together."""
    kids = list(f); reps = [kids[i] for i in idx]
    texts = [i for i, el in enumerate(kids) if i not in idx and not _filled(el) and _text(el) and _xfrm(el)]
    unit = {i: [] for i in idx}; free = set(texts)
    cen = lambda b: (b[0] + b[2] / 2, b[1] + b[3] / 2)
    for t in texts:
        tc = cen(_xfrm(kids[t]))
        for i in idx:
            b = _xfrm(kids[i]); mx, my = b[2] * 0.15, b[3] * 0.15
            if b[0] - mx <= tc[0] <= b[0] + b[2] + mx and b[1] - my <= tc[1] <= b[1] + b[3] + my:
                unit[i].append(t); free.discard(t); break
    if len(free) >= len(idx):  # pair outside labels by nearest distance
        for i in idx:
            if unit[i] or not free: continue
            c = cen(_xfrm(kids[i])); b = _xfrm(kids[i])
            t = min(free, key=lambda t: math.dist(c, cen(_xfrm(kids[t]))))
            if math.dist(c, cen(_xfrm(kids[t]))) < 1.6 * max(b[2], b[3]): unit[i].append(t); free.discard(t)
    return unit

class NeedsGenerator(ValueError):
    """The object's layout isn't regular enough to re-count safely; redraw it with the pattern's generator."""

GEN_FOR = {"cycle": "cycle", "virtuous-cycle": "cycle", "chevron-process": "chevronProcess", "value-chain": "chevronProcess",
    "staircase": "staircase", "timeline": "timeline", "text-columns": "textColumns", "labelled-rows": "labelledRows",
    "hub-spoke": "hubSpoke", "impact-out": "hubSpoke", "honeycomb": "hubSpoke", "forces-in": "forcesIn", "pyramid": "pyramid",
    "funnel": "funnel", "matrix-2x2": "matrix", "converge": "converge", "synthesis": "converge", "venn": "venn",
    "issue-tree": "issueTree", "driver-tree": "issueTree", "temple": "temple", "before-after": "beforeAfter",
    "kpi-numbers": "kpiRow", "scoring-table": "scoringTable", "wedges": "cycle", "options-branch": "converge",
    "gantt": "gantt", "org-chart": "orgChart", "target-onion": "targetOnion", "nested-sizes": "targetOnion",
    "phase-matrix": "phaseMatrix", "swimlanes": "phaseMatrix", "table": "dataTable", "icon-infographic": "iconList",
    "puzzle": "puzzleGrid", "gap": "staircase", "balance": "beforeAfter", "pros-cons": "beforeAfter", "quotes": "textColumns",
    "tracker": "trackerBar", "case-study": "textColumns", "framework": "matrix", "filter": "funnel", "barrier": "converge",
    "chain-reaction": "chevronProcess", "exchange": "beforeAfter", "opposing": "beforeAfter", "separation": "beforeAfter",
    "change-direction": "beforeAfter", "flow-with-shock": "chevronProcess", "vertical-process": "labelledRows",
    "process-zoom": "chevronProcess", "input-into-cycle": "cycle", "feedback-loop": "cycle", "cube-3d": "matrix",
    "bubble-portfolio": "matrix", "scale-position": "staircase", "exec-summary-tree": "issueTree"}

def _points(el):
    """Outline points of a shape in slide coordinates (custom paths exactly; presets by bbox corners/mids)."""
    b = _xfrm(el); pts = []
    if b is None: return pts
    xf = el.find("./*/a:xfrm", NS); rot = int(xf.get("rot", "0")) / 60000 if xf is not None else 0
    fh = xf is not None and xf.get("flipH") == "1"; fv = xf is not None and xf.get("flipV") == "1"
    for path in el.findall(".//a:pathLst/a:path", NS):
        w = int(path.get("w", "0") or 0) or b[2]; h = int(path.get("h", "0") or 0) or b[3]
        for pt in path.iter(A + "pt"):
            try: px, py = int(pt.get("x")), int(pt.get("y"))
            except (TypeError, ValueError): continue
            u, v = px / max(w, 1), py / max(h, 1)
            if fh: u = 1 - u
            if fv: v = 1 - v
            pts.append((b[0] + u * b[2], b[1] + v * b[3]))
    if not pts:
        pts = [(b[0] + u * b[2], b[1] + v * b[3]) for u in (0, .5, 1) for v in (0, .5, 1) if (u, v) != (.5, .5)]
    if rot:
        cx, cy = b[0] + b[2] / 2, b[1] + b[3] / 2; a = math.radians(rot)
        pts = [(cx + (x - cx) * math.cos(a) - (y - cy) * math.sin(a), cy + (x - cx) * math.sin(a) + (y - cy) * math.cos(a)) for x, y in pts]
    return pts

def _is_arc_segment(el, cx, cy, R, n):
    """True if the shape runs AROUND the centre (ring segment), not out from it (radial arrow, blade)."""
    pts = _points(el)
    if len(pts) < 3: return False
    angs = sorted(math.degrees(math.atan2(y - cy, x - cx)) % 360 for x, y in pts)
    gaps = [b - a for a, b in zip(angs, angs[1:])] + [angs[0] + 360 - angs[-1]]
    ang_span = 360 - max(gaps)
    rads = [math.dist((x, y), (cx, cy)) for x, y in pts]
    # principal axis of the outline must run ALONG the ring (tangential), not toward the centre (radial arrow)
    px = sum(x for x, _ in pts) / len(pts); py = sum(y for _, y in pts) / len(pts)
    sxx = sum((x - px) ** 2 for x, _ in pts); syy = sum((y - py) ** 2 for _, y in pts); sxy = sum((x - px) * (y - py) for x, y in pts)
    axis = 0.5 * math.atan2(2 * sxy, sxx - syy); radial = math.atan2(py - cy, px - cx)
    if abs(math.cos(axis - radial)) > 0.6: return False
    return ang_span >= 0.75 * (360 / n) and (max(rads) - min(rads)) <= 0.72 * R and min(rads) > 0.25 * R

def _gate_linear(bbs, order, horiz):
    """Regular row/column: aligned on the cross axis, even pitch, no overlaps."""
    if len(order) < 3: return False
    c = [((b[0] + b[2] / 2), (b[1] + b[3] / 2)) for b in (bbs[i] for i in order)]
    cross = [p[1] if horiz else p[0] for p in c]; size_cross = max((bbs[i][3] if horiz else bbs[i][2]) for i in order)
    if max(cross) - min(cross) > 0.2 * size_cross: return False                     # not aligned (diagonal, scattered)
    along = [p[0] if horiz else p[1] for p in c]
    pitches = [b - a for a, b in zip(along, along[1:])]
    if min(pitches) <= 0: return False
    for a_, b_ in zip(order, order[1:]):                                             # items must not overlap
        A_, B_ = bbs[a_], bbs[b_]
        ov = max(0, min(A_[0] + A_[2], B_[0] + B_[2]) - max(A_[0], B_[0])) * max(0, min(A_[1] + A_[3], B_[1] + B_[3]) - max(A_[1], B_[1]))
        if ov > 0.12 * min(A_[2] * A_[3], B_[2] * B_[3]): return False
    m = sum(pitches) / len(pitches)
    if len(pitches) >= 2 and (max(pitches) - min(pitches)) / m > 0.2: return False   # uneven spacing
    sizes = [bbs[i][2] if horiz else bbs[i][3] for i in order]
    cross_sizes = [bbs[i][3] if horiz else bbs[i][2] for i in order]
    return (max(sizes) / max(min(sizes), 1) < 1.35 and                               # same size along the flow
            max(cross_sizes) / max(min(cross_sizes), 1) < 1.35)                      # ...and across it (not a pyramid/steps)

def _is_ring_geom(el):
    g = _geom(el)
    if g in ("donut", "blockArc", "circularArrow", "arc"): return True
    if g == "custom":
        paths = el.findall(".//a:pathLst/a:path", NS)
        return len(paths) >= 2 or len(el.findall(".//a:pathLst//a:arcTo", NS)) >= 2
    return False

def extend(obj, n, indices=None, strict=True):
    """Change the count in place when the layout is regular; otherwise raise NeedsGenerator(pattern)."""
    try:
        return _extend(obj, n, indices, strict)
    except NeedsGenerator:
        raise
    except ValueError as e:
        raise NeedsGenerator(f"{obj.get('pattern')}: {e} -> use generator '{GEN_FOR.get(obj.get('pattern'), 'build by hand')}'")

def _extend(obj, n, indices=None, strict=True):
    """Change how many times the object's repeated element appears (e.g. 4 arrows -> 5).
    Each repeat moves together with its label. LINE layouts are re-spaced over the same span
    (elements shrink if they would overlap); CIRCLE layouts are re-spaced at 360/n with each copy
    rotated to its new angle."""
    obj = ungroup(obj); f = _frag(obj)
    idx = indices or _repeated(f)
    while not idx and indices is None and _expand_groups(f): idx = _repeated(f)
    mode = "shapes"
    if not idx and indices is None:
        idx, extra = _label_sets(f)
        if idx:
            mode = "labels"
            ring = _ring_shape(f, idx)
            if ring is not None:
                return _rebuild_ring(obj, f, ring, idx, n)
            kids_ = list(f)
            hosts = [e for e in kids_ if _filled(e) and _xfrm(e) and _geom(e) in ("rightArrow", "homePlate", "chevron", "custom", "notchedRightArrow", "stripedRightArrow")
                     and all(_xfrm(e)[0] <= _xfrm(kids_[i])[0] + _xfrm(kids_[i])[2] / 2 <= _xfrm(e)[0] + _xfrm(e)[2] and
                             _xfrm(e)[1] <= _xfrm(kids_[i])[1] + _xfrm(kids_[i])[3] / 2 <= _xfrm(e)[1] + _xfrm(e)[3] for i in idx)]
            if not hosts or sum(1 for e in kids_ if _filled(e)) > 2:
                raise NeedsGenerator(f"{obj.get('pattern')}: only the labels repeat -> use generator '{GEN_FOR.get(obj.get('pattern'), 'build by hand')}'")
    kids = list(f)
    if not idx and indices is None and any(g.find(".//a:tbl", NS) is not None for g in f.iter(P + "graphicFrame")):
        rows = len(next(g for g in f.iter(P + "graphicFrame") if g.find(".//a:tbl", NS) is not None).findall(".//a:tr", NS))
        r = table_size(obj, rows=n + 1); r["extend_mode"] = "table-rows"; return r   # n body rows + header
    if not idx:
        raise ValueError("NOT REPEATABLE: this object has no repeated part (a single drawing). "
                         "Use a generator for the pattern, or pass indices=[...] (see elements())")
    unit = _units(f, idx) if mode == "shapes" else _label_units(f, idx, extra)
    if not circular_hint(f, idx): unit = _lane_units(f, idx, unit)
    bbs = {i: _xfrm(kids[i]) for i in idx}
    cs = {i: (b[0] + b[2] / 2, b[1] + b[3] / 2) for i, b in bbs.items()}
    mx = sum(c[0] for c in cs.values()) / len(cs); my = sum(c[1] for c in cs.values()) / len(cs)
    rs = [math.dist(c, (mx, my)) for c in cs.values()]; rbar = sum(rs) / len(rs)
    xs = [c[0] for c in cs.values()]; ys = [c[1] for c in cs.values()]
    spread_x, spread_y = max(xs) - min(xs), max(ys) - min(ys)
    circular = len(cs) >= 3 and rbar > 0 and (max(rs) - min(rs)) / rbar < 0.3 and min(spread_x, spread_y) > 0.45 * max(spread_x, spread_y)
    if circular and strict:
        angs = sorted(math.degrees(math.atan2(c[1] - my, c[0] - mx)) % 360 for c in cs.values())
        gaps = [b - a for a, b in zip(angs, angs[1:])] + [angs[0] + 360 - angs[-1]]
        even = (max(gaps) - min(gaps)) / (360 / len(gaps)) < 0.35
        arcs = all(_geom(kids[i]) not in ("ellipse", "rect", "roundRect", "hexagon", "pentagon", "diamond", "triangle") for i in idx)
        def gap_to_centre(b):
            dx = max(b[0] - mx, 0, mx - (b[0] + b[2])); dy = max(b[1] - my, 0, my - (b[1] + b[3]))
            return math.hypot(dx, dy)
        Rout = max(math.dist((mx, my), (b[0] + b[2] / 2, b[1] + b[3] / 2)) + max(b[2], b[3]) / 2 for b in bbs.values())
        hole = min(gap_to_centre(b) for b in bbs.values()) >= 0.12 * Rout or all(
            math.dist((mx, my), (b[0] + b[2] / 2, b[1] + b[3] / 2)) > 0.45 * Rout for b in bbs.values())
        tangential = all(abs(math.dist((mx, my), (b[0] + b[2] / 2, b[1] + b[3] / 2)) - rbar) < 0.35 * rbar for b in bbs.values())
        pointy = sum(1 for i in idx if _geom(kids[i]) in ("rightArrow", "leftArrow", "upArrow", "downArrow")) == len(idx)
        Rr = max(math.dist((mx, my), p) for i in idx for p in _points(kids[i]))
        arcs = arcs and all(_is_arc_segment(kids[i], mx, my, Rr, len(idx)) for i in idx)
        if not (even and arcs and hole and tangential and not pointy):
            raise NeedsGenerator(f"{obj.get('pattern')}: items are not ring segments -> use generator '{GEN_FOR.get(obj.get('pattern'), 'hubSpoke')}'")
    if circular: order = sorted(idx, key=lambda i: math.atan2(cs[i][1] - my, cs[i][0] - mx))
    else:
        horiz = spread_x >= spread_y
        order = sorted(idx, key=lambda i: cs[i][0] if horiz else cs[i][1])
    insert_at = min(kids.index(kids[i]) for i in idx)
    members = {i: [kids[i]] + [kids[t] for t in unit[i]] for i in idx}
    for i in idx:
        for e in members[i]: f.remove(e)
    def clone(i): return [copy.deepcopy(e) for e in members[i]]
    def move(group, dx, dy, k=1.0, anchor=None):
        for e in group:
            b = _xfrm(e)
            if k != 1.0 and anchor:
                ncx = anchor[0] + (b[0] + b[2] / 2 - anchor[0]) * k; ncy = anchor[1] + (b[1] + b[3] / 2 - anchor[1]) * k
                _set_xfrm(e, ncx - b[2] * k / 2 + dx, ncy - b[3] * k / 2 + dy, b[2] * k, b[3] * k)
            else: _set_xfrm(e, b[0] + dx, b[1] + dy, b[2], b[3])
    new = []
    if circular:
        # Arcs can't be stretched by scaling, so the ring is rebuilt as true circular-arrow segments
        # (any n, gap between segments), reusing each original segment's fill in turn; labels follow.
        allb = [bbs[i] for i in idx]
        ux0 = min(b[0] for b in allb); uy0 = min(b[1] for b in allb)
        ux1 = max(b[0] + b[2] for b in allb); uy1 = max(b[1] + b[3] for b in allb)
        ccx, ccy = (ux0 + ux1) / 2, (uy0 + uy1) / 2; R = min(ux1 - ux0, uy1 - uy0) / 2
        thick = 0.24 * R; step = 360.0 / n; gapd = min(8.0, step * 0.12)
        a0 = math.degrees(math.atan2(cs[order[0]][1] - ccy, cs[order[0]][0] - ccx))
        fills = []
        for i in order:
            spPr = kids[i].find("p:spPr", NS)
            fl = None if spPr is None else next((c for c in spPr if etree.QName(c).localname in ("solidFill", "gradFill", "pattFill")), None)
            has_ln = spPr is not None and spPr.find("a:ln", NS) is not None
            fills.append(copy.deepcopy(fl) if fl is not None else etree.fromstring(('<a:noFill xmlns:a="%s"/>' if has_ln else '<a:solidFill xmlns:a="%s"><a:schemeClr val="accent1"/></a:solidFill>') % NS["a"]))
        labs = [[kids[t] for t in unit[i]] for i in order]
        lab_r = [math.dist(((_xfrm(l)[0] + _xfrm(l)[2] / 2), (_xfrm(l)[1] + _xfrm(l)[3] / 2)), (ccx, ccy)) for ls in labs for l in ls]
        lr = sum(lab_r) / len(lab_r) if lab_r else R * 0.7
        for j in range(n):
            mid = a0 + step * j; st = (mid - step / 2 + gapd / 2) % 360; en = (mid + step / 2 - gapd / 2) % 360
            sp = etree.fromstring(('<p:sp xmlns:p="%s" xmlns:a="%s"><p:nvSpPr><p:cNvPr id="0" name="Segment %d"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
                '<p:spPr><a:xfrm><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="circularArrow"><a:avLst>'
                '<a:gd name="adj1" fmla="val %d"/><a:gd name="adj2" fmla="val 1142319"/><a:gd name="adj3" fmla="val %d"/>'
                '<a:gd name="adj4" fmla="val %d"/><a:gd name="adj5" fmla="val %d"/></a:avLst></a:prstGeom></p:spPr></p:sp>') %
                (NS["p"], NS["a"], j + 1, ccx - R, ccy - R, 2 * R, 2 * R, thick / (2 * R) * 100000, en * 60000, st * 60000, thick / (2 * R) * 110000))
            spp = sp.find("p:spPr", NS); spp.append(copy.deepcopy(fills[j % len(fills)]))
            src_ln = kids[order[j % len(order)]].find("p:spPr/a:ln", NS)
            if src_ln is not None: spp.append(copy.deepcopy(src_ln))
            new.append(sp)
            outside = n > len(order)          # more segments than the original: labels go outside the ring
            for lab in (labs[j % len(labs)] if labs else []):
                l = copy.deepcopy(lab); b = _xfrm(l); ra = math.radians(mid)
                if outside:
                    k = max(0.6, (len(order) / n) ** 0.5)
                    for rpr in list(l.iter(A + "rPr")) + list(l.iter(A + "endParaRPr")):
                        if rpr.get("sz"): rpr.set("sz", str(max(800, int(int(rpr.get("sz")) * k / 100) * 100)))
                        sf = rpr.find("a:solidFill", NS)
                        if sf is not None: rpr.remove(sf)
                        etree.SubElement(rpr, A + "solidFill").append(etree.fromstring('<a:schemeClr xmlns:a="%s" val="tx1"/>' % NS["a"]))
                        rpr.insert(0, rpr[-1])
                    px, py = ccx + (R + thick * 0.4) * math.cos(ra), ccy + (R + thick * 0.4) * math.sin(ra)
                    c = math.cos(ra); w2 = b[2]
                    x0 = px if c > 0.25 else (px - w2 if c < -0.25 else px - w2 / 2)
                    y0 = py - b[3] / 2 if abs(c) > 0.25 else (py - b[3] if math.sin(ra) < 0 else py)
                    _set_xfrm(l, x0, y0, w2, b[3])
                    for pp in l.iter(A + "pPr"): pp.set("algn", "l" if c > 0.25 else ("r" if c < -0.25 else "ctr"))
                else:
                    _set_xfrm(l, ccx + lr * math.cos(ra) - b[2] / 2, ccy + lr * math.sin(ra) - b[3] / 2, b[2], b[3])
                new.append(l)
    else:
        if strict and not _gate_linear(bbs, order, horiz):
            raise NeedsGenerator(f"{obj.get('pattern')}: layout not a regular row/column -> use generator '{GEN_FOR.get(obj.get('pattern'), 'build by hand')}'")
        key = (lambda b: b[0]) if horiz else (lambda b: b[1])
        size_of = (lambda b: b[2]) if horiz else (lambda b: b[3])
        first, last = bbs[order[0]], bbs[order[-1]]
        start, end = key(first), key(last) + size_of(last)
        size = sum(size_of(bbs[i]) for i in order) / len(order)
        gap = ((end - start) - len(order) * size) / max(1, len(order) - 1)
        new_size = min(size, ((end - start) - (n - 1) * gap) / n)
        if new_size < size * 0.35:
            new_size = size * 0.35; gap = ((end - start) - n * new_size) / max(1, n - 1)
        k = new_size / size
        for j in range(n):
            src = order[min(j, len(order) - 1)] if j < len(order) else order[len(order) // 2]
            g = clone(src); b = bbs[src]; c = cs[src]
            # scale the unit along the flow axis only for the shape; labels keep height, get the new width
            shape_start = start + j * (new_size + gap)
            for m_, e in enumerate(g):
                eb = _xfrm(e)
                if m_ == 0:                                            # the repeated shape: shrinks along the flow
                    if horiz: _set_xfrm(e, shape_start, eb[1], eb[2] * k, eb[3])
                    else: _set_xfrm(e, eb[0], shape_start, eb[2], eb[3] * k)
                else:                                                  # its labels: keep their size unless wider than a slot
                    ecen = (key(eb) + size_of(eb) / 2 - key(b)) / size          # label centre relative to shape
                    ncen = shape_start + ecen * new_size
                    ew = min(size_of(eb), new_size + gap * 0.9) if size_of(eb) > new_size + gap else size_of(eb)
                    if horiz: _set_xfrm(e, ncen - ew / 2, eb[1], ew, eb[3])
                    else: _set_xfrm(e, eb[0], ncen - ew / 2, eb[2], ew)
            new += g
    for j, e in enumerate(new): f.insert(insert_at + j, e)
    obj["id"] += f".x{n}"; obj["extend_mode"] = "ring-rebuilt" if circular else mode
    return _store(obj, f)

def table_size(obj, rows=None, cols=None, which=0):
    """Resize a stored table: add rows/columns (copies of the last body row/column, emptied) or remove them.
    The table keeps its total width (columns re-divided) and grows/shrinks in height by row height."""
    obj = copy.deepcopy(obj); f = _frag(obj)
    gfs = [g for g in f.iter(P + "graphicFrame") if g.find(".//a:tbl", NS) is not None]
    if not gfs: raise ValueError("object has no table")
    gf = gfs[which]; tbl = gf.find(".//a:tbl", NS); grid = tbl.find("a:tblGrid", NS)
    trs = tbl.findall("a:tr", NS)
    def empty(el):
        for t in el.iter(A + "t"): t.text = ""
        return el
    def fills(tr):   # each cell's fill colour (the store's private attributes aside)
        return tuple(tuple((etree.QName(c).localname, c.get("val")) for c in f_.iter()) if f_ is not None else ()
                     for f_ in (tc.find("a:tcPr/a:solidFill", NS) for tc in tr.findall("a:tc", NS)))
    if rows is not None:
        # banded rows (fills alternate): a new row copies the row two above, so the bands go on alternating
        banded = len(trs) >= 3 and fills(trs[-1]) != fills(trs[-2]) and fills(trs[-1]) == fills(trs[-3])
        while len(trs) < rows:
            src = trs[-2] if banded else trs[-1]
            nr = empty(copy.deepcopy(src))
            if banded:   # the copied row's own top rule belongs to its place; take the last row's top edge instead
                for tc_new, tc_last in zip(nr.findall("a:tc", NS), trs[-1].findall("a:tc", NS)):
                    pn, pl = tc_new.find("a:tcPr", NS), tc_last.find("a:tcPr", NS)
                    if pn is None or pl is None: continue
                    old = pn.find("a:lnT", NS); new = pl.find("a:lnT", NS)
                    if old is not None: pn.remove(old)
                    if new is not None: pn.insert(0, copy.deepcopy(new))
            tbl.insert(list(tbl).index(trs[-1]) + 1, nr); trs.append(nr)
        while len(trs) > max(1, rows): tbl.remove(trs.pop())
    if cols is not None:
        gcs = grid.findall("a:gridCol", NS); total = sum(int(g.get("w")) for g in gcs)
        while len(gcs) < cols:
            ng = copy.deepcopy(gcs[-1]); grid.append(ng); gcs.append(ng)
            for tr in tbl.findall("a:tr", NS): tr.append(empty(copy.deepcopy(tr.findall("a:tc", NS)[-1])))
        while len(gcs) > max(1, cols):
            grid.remove(gcs.pop())
            for tr in tbl.findall("a:tr", NS): tr.remove(tr.findall("a:tc", NS)[-1])
        first = int(gcs[0].get("w")) if len(gcs) > 2 else None
        rest = (total - (first or 0)) / (len(gcs) - (1 if first else 0))
        for i, g in enumerate(gcs): g.set("w", str(int(first if (first and i == 0) else rest)))
        # The data columns now share one width, so their paragraph indents must match too: a source that placed its
        # numbers with a right indent on some columns only (C03) would otherwise space them unevenly. Each data
        # column's indents are set to the smallest found among them (per side), so the text keeps its alignment.
        data = range(1 if first else 0, len(gcs))
        def col_ppr(j):
            return [p_.find("a:pPr", NS) for tr in tbl.findall("a:tr", NS) for p_ in tr.findall("a:tc", NS)[j].iter(A + "p")
                    if p_.find(".//a:t", NS) is not None and _para_text(p_).strip() or tr is tbl.findall("a:tr", NS)[0]]
        for side in ("marR", "marL"):
            seen = [int(pp.get(side, 0)) if pp is not None else 0 for j in data for pp in col_ppr(j)]
            low = min(seen) if seen else 0
            for j in data:
                for tr in tbl.findall("a:tr", NS):
                    for p_ in tr.findall("a:tc", NS)[j].iter(A + "p"):
                        pp = p_.find("a:pPr", NS)
                        if pp is None:
                            if not low: continue
                            pp = etree.Element(A + "pPr"); p_.insert(0, pp)
                        if low: pp.set(side, str(low))
                        else: pp.attrib.pop(side, None)
    h = sum(int(tr.get("h", "370840")) for tr in tbl.findall("a:tr", NS))
    xf = gf.find("p:xfrm", NS); xf.find("a:ext", NS).set("cy", str(h))
    obj["id"] += ".t" + (f"r{rows}" if rows is not None else "") + (f"c{cols}" if cols is not None else "")
    return _store(obj, f)

def circular_hint(f, idx):
    kids = list(f); cs = [((_xfrm(kids[i])[0] + _xfrm(kids[i])[2] / 2), (_xfrm(kids[i])[1] + _xfrm(kids[i])[3] / 2)) for i in idx]
    mx = sum(c[0] for c in cs) / len(cs); my = sum(c[1] for c in cs) / len(cs)
    rs = [math.dist(c, (mx, my)) for c in cs]; rbar = sum(rs) / len(rs)
    sx = max(c[0] for c in cs) - min(c[0] for c in cs); sy = max(c[1] for c in cs) - min(c[1] for c in cs)
    return len(cs) >= 3 and rbar > 0 and (max(rs) - min(rs)) / rbar < 0.3 and min(sx, sy) > 0.45 * max(sx, sy)

def _label_sets(f):
    """When no shape repeats: the repeated element is the LABELS (text-only boxes of the same size).
    Returns (main set, other sets of the same count to move along with it)."""
    kids = list(f); cl = {}
    for i, el in enumerate(kids):
        bb = _xfrm(el)
        if not bb or _filled(el) or etree.QName(el).localname != "sp": continue
        cl.setdefault((round(bb[2] / 120000), round(bb[3] / 60000)), []).append(i)
    sets = sorted([v for v in cl.values() if len(v) >= 3], key=len, reverse=True)
    if not sets: return None, []
    main = sets[0]; extra = [v for v in sets[1:] if len(v) == len(main)]
    return main, extra

def _label_units(f, idx, extra):
    kids = list(f); unit = {i: [] for i in idx}
    cen = lambda i: ((_xfrm(kids[i])[0] + _xfrm(kids[i])[2] / 2), (_xfrm(kids[i])[1] + _xfrm(kids[i])[3] / 2))
    for st in extra:
        free = set(st)
        for i in idx:
            j = min(free, key=lambda j: math.dist(cen(i), cen(j))); unit[i].append(j); free.discard(j)
    return unit

def _ring_shape(f, labels):
    """A single big filled shape that the labels sit around/inside in a circle = a ring drawn as one shape."""
    kids = list(f)
    big = [(i, _xfrm(e)) for i, e in enumerate(kids) if _filled(e) and _xfrm(e)]
    if not big: return None
    i, b = max(big, key=lambda x: x[1][2] * x[1][3])
    if not (0.75 < b[2] / max(b[3], 1) < 1.33) or len(labels) < 3 or not _is_ring_geom(kids[i]): return None
    cx, cy = b[0] + b[2] / 2, b[1] + b[3] / 2
    ds = [math.dist((cx, cy), ((_xfrm(kids[j])[0] + _xfrm(kids[j])[2] / 2), (_xfrm(kids[j])[1] + _xfrm(kids[j])[3] / 2))) for j in labels]
    m = sum(ds) / len(ds)
    return i if m > 0.2 * b[2] and (max(ds) - min(ds)) / m < 0.45 else None

def _rebuild_ring(obj, f, ring_i, labels, n):
    """Ring drawn as one shape: replace it with n circular-arrow segments in its colour; labels re-spaced around."""
    kids = list(f); ring = kids[ring_i]; b = _xfrm(ring)
    cx, cy, R = b[0] + b[2] / 2, b[1] + b[3] / 2, min(b[2], b[3]) / 2
    spPr = ring.find("p:spPr", NS)
    fl = None if spPr is None else next((c for c in spPr if etree.QName(c).localname in ("solidFill", "gradFill", "pattFill")), None)
    ln = None if spPr is None else spPr.find("a:ln", NS)
    if fl is None and ln is None: fl = etree.fromstring('<a:solidFill xmlns:a="%s"><a:schemeClr val="accent1"/></a:solidFill>' % NS["a"])
    labs = sorted(labels, key=lambda j: math.atan2((_xfrm(kids[j])[1] + _xfrm(kids[j])[3] / 2) - cy, (_xfrm(kids[j])[0] + _xfrm(kids[j])[2] / 2) - cx))
    lc = lambda j: ((_xfrm(kids[j])[0] + _xfrm(kids[j])[2] / 2), (_xfrm(kids[j])[1] + _xfrm(kids[j])[3] / 2))
    lr = sum(math.dist(lc(j), (cx, cy)) for j in labs) / len(labs)
    a0 = math.degrees(math.atan2(lc(labs[0])[1] - cy, lc(labs[0])[0] - cx))
    pos = kids.index(ring)
    templ = [copy.deepcopy(kids[j]) for j in labs]
    for j in sorted(labs + [ring_i], reverse=True): f.remove(kids[j])
    thick = 0.22 * R; step = 360.0 / n; gapd = min(8.0, step * 0.12); new = []
    for j in range(n):
        mid = a0 + step * j; st = (mid - step / 2 + gapd / 2) % 360; en = (mid + step / 2 - gapd / 2) % 360
        sp = etree.fromstring(('<p:sp xmlns:p="%s" xmlns:a="%s"><p:nvSpPr><p:cNvPr id="0" name="Segment %d"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            '<p:spPr><a:xfrm><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="circularArrow"><a:avLst>'
            '<a:gd name="adj1" fmla="val %d"/><a:gd name="adj2" fmla="val 1142319"/><a:gd name="adj3" fmla="val %d"/>'
            '<a:gd name="adj4" fmla="val %d"/><a:gd name="adj5" fmla="val %d"/></a:avLst></a:prstGeom></p:spPr></p:sp>') %
            (NS["p"], NS["a"], j + 1, cx - R, cy - R, 2 * R, 2 * R, thick / (2 * R) * 100000, en * 60000, st * 60000, thick / (2 * R) * 110000))
        spp = sp.find("p:spPr", NS)
        spp.append(copy.deepcopy(fl) if fl is not None else etree.fromstring('<a:noFill xmlns:a="%s"/>' % NS["a"]))
        if ln is not None: spp.append(copy.deepcopy(ln))
        new.append(sp)
        l = copy.deepcopy(templ[j % len(templ)]); lb = _xfrm(l); ra = math.radians(mid)
        _set_xfrm(l, cx + lr * math.cos(ra) - lb[2] / 2, cy + lr * math.sin(ra) - lb[3] / 2, lb[2], lb[3]); new.append(l)
    for k, e in enumerate(new): f.insert(pos + k, e)
    obj["id"] += f".x{n}"; obj["extend_mode"] = "ring-rebuilt"
    return _store(obj, f)

def recolour_elements(obj, indices, role):
    """Give chosen parts one role (e.g. highlight one province of a map, one arrow of a cycle)."""
    obj = ungroup(obj); f = _frag(obj); kids = list(f)
    for i in indices:
        el = kids[i]
        for sf in el.iter(A + "solidFill"):
            if sf.getparent().tag in (P + "spPr", P + "grpSpPr") or etree.QName(sf.getparent()).localname == "spPr":
                for c in list(sf): sf.remove(c)
                etree.SubElement(sf, A + "schemeClr", val=role)
    return _store(obj, f)

def slots(obj):
    """Fillable text slots in reading order: [(index, hint)] (same order set_texts fills; table cells last, hint "cell r,c")."""
    marker = "\u2063"; o = set_texts(obj, [marker + str(i) for i in range(500)])
    f = _frag(o); found = []
    for tb in f.iter(P + "txBody", A + "txBody"):
        t = "".join(x.text or "" for x in tb.iter(A + "t"))
        if t.startswith(marker):
            if tb.tag == A + "txBody":   # a table cell: "cell <row>,<column>"
                tc = tb.getparent(); tr = tc.getparent()
                hint = f"cell {list(tr.getparent().findall('a:tr', NS)).index(tr)},{list(tr.findall('a:tc', NS)).index(tc)}"
            else:
                c = tb.getparent().find("p:nvSpPr/p:cNvPr", NS); hint = c.get("name", "")[6:] if c is not None else ""
            found.append((int(t[1:]), hint))
    return sorted(found)

def _cell_bodies(f):
    """Table cells' text bodies (a:tc/a:txBody), table by table in document order, each table row by row."""
    out = []
    for tbl in f.iter(A + "tbl"):
        for tr in tbl.findall("a:tr", NS):
            for tc in tr.findall("a:tc", NS):
                if tc.get("hMerge") == "1" or tc.get("vMerge") == "1": continue   # covered by a merged cell
                tb = tc.find("a:txBody", NS)
                if tb is None: tb = etree.SubElement(tc, A + "txBody"); etree.SubElement(tb, A + "bodyPr"); etree.SubElement(tb, A + "lstStyle")
                out.append(tb)
    return out

def _para_text(p_): return "".join(t.text or "" for t in p_.iter(A + "t"))

def _run_groups(rs):
    """Template runs grouped by format: consecutive runs whose rPr differ only in spacing/bookkeeping (PDF imports cut
    text into one run per word) count as one run. Returns one representative rPr per group."""
    def key(r):
        rp = r.find("a:rPr", NS)
        if rp is None: return ""
        rp = copy.deepcopy(rp)
        for a in ("spc", "dirty", "err", "lang", "noProof", "kern"): rp.attrib.pop(a, None)
        return etree.tostring(rp)
    groups = []
    for r in rs:
        k = key(r)
        if not groups or groups[-1][0] != k: groups.append((k, r.find("a:rPr", NS)))
    return [g[1] for g in groups]

def _fill_para(tmpl, line, keep_marR=True):
    """One paragraph from its template: the template's own pPr, and run k in the format of template run k
    (runs of one format count as one; the last for any further run). `line` is a string (one run) or a list of
    strings (runs). keep_marR=False drops the paragraph's right margin (a PDF import's line-break margin)."""
    runs = line if isinstance(line, (list, tuple)) else [line]
    np_ = copy.deepcopy(tmpl)
    rprs = _run_groups([r for r in np_ if r.tag in (A + "r", A + "fld")])
    for r in list(np_):
        if r.tag in (A + "r", A + "fld", A + "br"): np_.remove(r)
    if not keep_marR and np_.find("a:pPr", NS) is not None: np_.find("a:pPr", NS).attrib.pop("marR", None)
    end = np_.find("a:endParaRPr", NS)
    for k, text in enumerate(runs):
        r = etree.Element(A + "r")
        src = rprs[min(k, len(rprs) - 1)] if rprs else None
        if src is None and end is not None: src = end
        if src is not None:
            rp = copy.deepcopy(src); rp.tag = A + "rPr"
            if "spc" in rp.attrib: del rp.attrib["spc"]   # letter spacing fitted to the old words (PDF imports)
            r.append(rp)
        etree.SubElement(r, A + "t").text = text
        if end is not None: end.addprevious(r)
        else: np_.append(r)
    return np_

def set_texts(obj, texts):
    """Fill text in reading order (top-to-bottom, left-to-right), keeping each paragraph's and each run's own format.
    Uses the object's SLOTS (former filler text) when it has them; otherwise all text boxes with text, then every
    table cell (table by table, row by row), so a table is filled by passing one item per cell after the boxes.
    An item is a string, or a list with one entry per paragraph. Paragraph i takes the format (level, bullet, spacing,
    alignment) of the box's own paragraph i; further paragraphs repeat the last, or the last at level n when the entry is
    a dict {"lvl": n, "runs": ...} (taken from another box of the object when this box has none at that level). A
    paragraph entry is a string (one run) or a list of strings (runs): run k keeps the format of the original's k-th
    run of a new format (bold lead, red "Mitigation:", superscript; runs of one format count as one). A paragraph whose
    text is unchanged keeps its original runs exactly. Empty spacer paragraphs before and after the text stay. On new
    text, letter spacing (spc) is dropped, and in text boxes (not table cells) the paragraph's right margin (marR, a
    PDF import's line-break margin) too.
    An item None leaves that box as it is."""
    obj = copy.deepcopy(obj); f = _frag(obj)
    bodies = []
    for tb in f.iter(P + "txBody"):
        c = tb.getparent().find("p:nvSpPr/p:cNvPr", NS)
        if c is not None and c.get("descr") == "slot": bodies.append(tb)
    def abs_bb(tb):   # position on the slide, also for shapes nested in groups
        el = tb.getparent(); bb = _xfrm(el) or [0, 0, 0, 0]; par = el.getparent()
        while par is not None and etree.QName(par).localname == "grpSp":
            xf = par.find("p:grpSpPr/a:xfrm", NS)
            if xf is None: break
            o, e_, co, ce = (xf.find("a:" + t, NS) for t in ("off", "ext", "chOff", "chExt"))
            sx = int(e_.get("cx")) / max(1, int(ce.get("cx"))); sy = int(e_.get("cy")) / max(1, int(ce.get("cy")))
            bb = [int(o.get("x")) + (bb[0] - int(co.get("x"))) * sx, int(o.get("y")) + (bb[1] - int(co.get("y"))) * sy, bb[2] * sx, bb[3] * sy]
            par = par.getparent()
        return bb
    slotted = bool(bodies)
    if not bodies:
        bodies = [tb for tb in f.iter(P + "txBody") if "".join(t.text or "" for t in tb.iter(A + "t")).strip()]
    def pos(tb):
        bb = abs_bb(tb)
        return (round(bb[1] / 200000), bb[0])
    bodies.sort(key=pos)
    if not slotted: bodies += _cell_bodies(f)   # after the boxes: earlier indices do not move
    lvl = lambda p_: int((p_.find("a:pPr", NS).get("lvl") if p_.find("a:pPr", NS) is not None else None) or 0)
    has_t = lambda p_: p_.find(".//a:t", NS) is not None and _para_text(p_) != ""
    all_paras = [p_ for p_ in f.iter(A + "p") if has_t(p_)]
    for tb, s_ in zip(bodies, texts):
        if s_ is None: continue
        paras = tb.findall("a:p", NS); lines = s_ if isinstance(s_, list) else [s_]
        if not paras: paras = [etree.SubElement(tb, A + "p")]
        runs_in = lambda p_: any(r.tag in (A + "r", A + "fld") for r in p_)
        tmpls = [p_ for p_ in paras if has_t(p_)] or [p_ for p_ in paras if runs_in(p_)] or paras[:1]
        ti = [i for i, p_ in enumerate(paras) if runs_in(p_)]   # spacers: paragraphs with no run at all
        lead = paras[:ti[0]] if ti else []                    # empty spacer paragraphs before the text stay
        trail = paras[ti[-1] + 1:] if ti else []              # and after it
        cell = tb.tag == A + "txBody"
        for p_ in paras: tb.remove(p_)
        for p_ in lead: tb.append(p_)
        for i, line in enumerate(lines):
            want = line.get("lvl") if isinstance(line, dict) else None
            runs = line.get("runs", line.get("text", "")) if isinstance(line, dict) else line
            if want is not None:
                same = [t for t in tmpls if lvl(t) == want]
                if i < len(tmpls) and lvl(tmpls[i]) == want: tmpl = tmpls[i]
                elif same: tmpl = same[-1]
                else:   # no paragraph at that level in this box: take one from another box of the object
                    other = [t for t in all_paras if lvl(t) == want]
                    tmpl = other[0] if other else tmpls[min(i, len(tmpls) - 1)]
            else:
                tmpl = tmpls[min(i, len(tmpls) - 1)]
            text = "".join(runs) if isinstance(runs, (list, tuple)) else runs
            if re.sub(" +", " ", text.strip()) == re.sub(" +", " ", _para_text(tmpl).strip()): np_ = copy.deepcopy(tmpl)   # unchanged text keeps its runs (repeated spaces aside; a tab is not a space)
            else: np_ = _fill_para(tmpl, runs, keep_marR=cell)       # a text box's right margin was fitted to the old words
            if want is not None and lvl(np_) != want:
                pp = np_.find("a:pPr", NS)
                if pp is None: pp = etree.Element(A + "pPr"); np_.insert(0, pp)
                pp.set("lvl", str(want))
            tb.append(np_)
        for p_ in trail: tb.append(p_)
    return _store(obj, f)

def set_chart_data(obj, categories, series, chart=None):
    """Replace a stored chart's data. series = [(name, [values...]), ...]. Updates the chart's cached values
    (what PowerPoint shows) AND its embedded workbook (what 'Edit Data' opens), so they never disagree."""
    import base64, io
    obj = copy.deepcopy(obj); C_ = "{http://schemas.openxmlformats.org/drawingml/2006/chart}"
    key = chart or next(iter(obj["charts"]))
    part = obj["charts"][key]; ct = etree.fromstring(part["xml"].encode("utf-8"))
    sers = list(ct.iter(C_ + "ser"))
    if not sers: raise ValueError("chart has no series")
    parent = sers[0].getparent()
    while len(sers) < len(series):
        nw = copy.deepcopy(sers[-1]); parent.insert(list(parent).index(sers[-1]) + 1, nw); sers.append(nw)
    for extra in sers[len(series):]: parent.remove(extra)
    sers = sers[:len(series)]
    col = lambda i: chr(ord("B") + i)
    n = len(categories)
    def fill_cache(el, vals, numeric, ref):
        for child in list(el): el.remove(child)
        ref_tag = "numRef" if numeric else "strRef"; cache_tag = "numCache" if numeric else "strCache"
        r = etree.SubElement(el, C_ + ref_tag); etree.SubElement(r, C_ + "f").text = ref
        c = etree.SubElement(r, C_ + cache_tag)
        if numeric: etree.SubElement(c, C_ + "formatCode").text = "General"
        etree.SubElement(c, C_ + "ptCount", val=str(len(vals)))
        for i, v in enumerate(vals):
            p_ = etree.SubElement(c, C_ + "pt", idx=str(i)); etree.SubElement(p_, C_ + "v").text = str(v)
    for i, (ser, (name, vals)) in enumerate(zip(sers, series)):
        idx = ser.find(C_ + "idx"); order = ser.find(C_ + "order")
        if idx is not None: idx.set("val", str(i))
        if order is not None: order.set("val", str(i))
        tx = ser.find(C_ + "tx")
        if tx is not None: fill_cache(tx, [name], False, f"Sheet1!${col(i)}$1")
        for tag, vals_, numeric, ref in (("cat", categories, False, f"Sheet1!$A$2:$A${n + 1}"), ("val", vals, True, f"Sheet1!${col(i)}$2:${col(i)}${n + 1}")):
            el = ser.find(C_ + tag)
            if el is None: el = etree.SubElement(ser, C_ + tag)
            fill_cache(el, vals_, numeric, ref)
        for dp in ser.findall(C_ + "dPt"):
            if int(dp.find(C_ + "idx").get("val")) >= n: ser.remove(dp)
    part["xml"] = etree.tostring(ct, encoding="unicode")
    try:
        import openpyxl
        wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Sheet1"; ws["A1"] = ""
        for i, (name, vals) in enumerate(series): ws.cell(row=1, column=i + 2, value=name)
        for r, cat in enumerate(categories):
            ws.cell(row=r + 2, column=1, value=cat)
            for i, (_, vals) in enumerate(series): ws.cell(row=r + 2, column=i + 2, value=vals[r] if r < len(vals) else None)
        buf = io.BytesIO(); wb.save(buf)
        for r in part["rels"]:
            if r["type"].endswith("/package"): r["data"] = base64.b64encode(buf.getvalue()).decode(); r["ext"] = ".xlsx"
    except ImportError:
        pass
    return obj

def combine(objs, layout="row", gap=0.3 * EMU):
    """Combine several objects into ONE object, laid out in a row or column (each keeps its proportions)."""
    f = etree.Element(P + "spTree", nsmap={"a": NS["a"], "p": NS["p"], "r": NS["r"]})
    cur = 0; H = max(o["bbox"][3] for o in objs); Wm = max(o["bbox"][2] for o in objs)
    for o in objs:
        X, Y, W, Hh = o["bbox"]
        g = _group(_frag(o), X, Y, W, Hh, (cur, (H - Hh) / 2) if layout == "row" else ((Wm - W) / 2, cur), (W, Hh))
        f.append(g); cur += (W if layout == "row" else Hh) + gap
    out = dict(id="+".join(o["id"] for o in objs), deck="combined", slide=0, pattern="combined", title="", note="",
               media=sorted(set(sum((o["media"] for o in objs), []))), complete=True, n_shapes=sum(o["n_shapes"] for o in objs), text="")
    return _store(out, f)

def _group(frag, X, Y, W, H, at, size):
    g = etree.Element(P + "grpSp")
    nv = etree.SubElement(g, P + "nvGrpSpPr"); etree.SubElement(nv, P + "cNvPr", id="0", name="Object"); etree.SubElement(nv, P + "cNvGrpSpPr"); etree.SubElement(nv, P + "nvPr")
    gp = etree.SubElement(g, P + "grpSpPr"); xf = etree.SubElement(gp, A + "xfrm")
    etree.SubElement(xf, A + "off", x=str(int(at[0])), y=str(int(at[1]))); etree.SubElement(xf, A + "ext", cx=str(int(size[0])), cy=str(int(size[1])))
    etree.SubElement(xf, A + "chOff", x=str(int(X)), y=str(int(Y))); etree.SubElement(xf, A + "chExt", cx=str(int(W)), cy=str(int(H)))
    for el in list(frag): g.append(el)
    return g

# ------------------------------------------------------------------ PLACE into a deck
def _autofit(frag, kx, ky, min_pt=8):
    """After scaling, shrink each text body until its text fits its (scaled) box; never below min_pt.
    Width estimate: Arial ≈ 0.52 em per Latin char, 1.0 em per CJK char; line height 1.2 em."""
    warn = []
    for tb in frag.iter(P + "txBody"):
        sp = tb.getparent(); bb = _xfrm(sp)
        if not bb: continue
        bp = tb.find("a:bodyPr", NS)
        ins = lambda a, d: int(bp.get(a, d)) if bp is not None else d
        w = (bb[2] - ins("lIns", 91440) - ins("rIns", 91440)) * kx / 12700; h = (bb[3] - ins("tIns", 45720) - ins("bIns", 45720)) * ky / 12700
        if w <= 4: continue
        if not _filled(sp) and sp.getparent() is not None:      # a label sits on a shape: it must fit THAT shape
            lc = (bb[0] + bb[2] / 2, bb[1] + bb[3] / 2)
            hosts = [e for e in sp.getparent() if e is not sp and e.tag in SHAPE_TAGS and _filled(e) and _xfrm(e)
                     and _xfrm(e)[0] <= lc[0] <= _xfrm(e)[0] + _xfrm(e)[2] and _xfrm(e)[1] <= lc[1] <= _xfrm(e)[1] + _xfrm(e)[3]]
            if hosts:
                hb = _xfrm(min(hosts, key=lambda e: _xfrm(e)[2] * _xfrm(e)[3]))
                w = min(w, hb[2] * 0.62 * kx / 12700)
        paras = ["".join(t.text or "" for t in p_.iter(A + "t")) for p_ in tb.findall("a:p", NS)]
        if not "".join(paras).strip(): continue
        szs = [int(r.get("sz")) / 100 for r in tb.iter(A + "rPr") if r.get("sz")] or [18]
        size = max(szs); nowrap = bp is not None and bp.get("wrap") == "none"
        def need(sz):
            lines = 0; widest = 0
            for ptxt in paras:
                units = sum(1.0 if ord(c) > 0x2E80 else 0.52 for c in ptxt) * sz
                widest = max(widest, units)
                if nowrap: lines += 1; continue
                words = ptxt.split(" "); cur = 0; n = 1
                for wd in words:
                    u = sum(1.0 if ord(c) > 0x2E80 else 0.52 for c in wd + " ") * sz
                    if u > w: return False                      # a single word wider than the box: would break mid-word
                    if cur + u > w: n += 1; cur = u
                    else: cur += u
                lines += n
            if nowrap and widest > max(w, 1) * 1.05: return False
            return lines * sz * 1.2 <= max(h, sz * 1.25) * 1.15
        fit = size
        while fit > min_pt and not need(fit): fit -= 0.5
        if fit < size:
            r_ = fit / size
            for r in list(tb.iter(A + "rPr")) + list(tb.iter(A + "endParaRPr")) + list(tb.iter(A + "defRPr")):
                if r.get("sz"): r.set("sz", str(max(int(min_pt * 100), int(int(r.get("sz")) * r_ / 50) * 50)))
        if not need(fit): warn.append(("text does not fit even at %.0f pt" % min_pt, "".join(paras)[:30]))
    return warn

def _move_labels_out(frag, bbox, k, warnings):
    """Labels too long for their shape at this size: move them just outside the object (radially from its centre),
    in body-text colour, never overlapping the drawing. Returns the warnings that remain."""
    X, Y, W, H = bbox; cx, cy = X + W / 2, Y + H / 2; bad = {w[1] for w in warnings}; left = []
    for el in list(frag):
        if etree.QName(el).localname != "sp" or _filled(el): continue
        t = _text(el)
        if t[:30] not in bad: continue
        b = _xfrm(el); ex, ey = b[0] + b[2] / 2, b[1] + b[3] / 2
        a = math.atan2(ey - cy, ex - cx); rx, ry = W / 2 + 0.08 * W, H / 2 + 0.08 * H
        nx, ny = cx + rx * math.cos(a), cy + ry * math.sin(a)
        w = max(b[2], len(t) * 0.55 * 12700 * 9 / max(k, 0.05)); h = b[3]
        c = math.cos(a); x0 = nx if c > 0.3 else (nx - w if c < -0.3 else nx - w / 2)
        _set_xfrm(el, x0, ny - h / 2, w, h)
        bp = el.find("p:txBody/a:bodyPr", NS)
        if bp is not None: bp.set("wrap", "none")
        for pp in el.iter(A + "pPr"): pp.set("algn", "l" if c > 0.3 else ("r" if c < -0.3 else "ctr"))
        for rpr in el.iter(A + "rPr"):
            for sf in rpr.findall("a:solidFill", NS): rpr.remove(sf)
            sf = etree.Element(A + "solidFill"); etree.SubElement(sf, A + "schemeClr", val="tx1"); rpr.insert(0, sf)
    return left

def _strip_ds(tree):
    """Take the store's private attributes off before XML goes into a deck."""
    for e in tree.iter():
        for a in [a for a in e.attrib if a.startswith(DS)]: del e.attrib[a]
    etree.cleanup_namespaces(tree)
    return tree

def place(pptx_path, slide_no, obj, box_in, store_dir, keep_aspect=True, align="center", scale_text=True, out_path=None, texts=None, move_labels=True, colours="theme"):
    """Insert obj into slide `slide_no` (1-based) of a .pptx, fitted into box_in=(x,y,w,h) inches.
    Vector scaling via a group; text sizes scaled with it (min 8 pt); media copied and linked.
    At scale 1 (the object's own size) text is not scaled and not fitted: sizes stay as stored."""
    X, Y, W, H = obj["bbox"]
    bx, by, bw, bh = [v * EMU for v in box_in]
    s = min(bw / W, bh / H) if keep_aspect else None
    tw, th = (W * s, H * s) if keep_aspect else (bw, bh)
    ax = bx + (bw - tw) / 2 if align == "center" else bx
    ay = by + (bh - th) / 2
    if texts is not None: obj = set_texts(obj, texts)
    if colours == "original": obj = original_colours(obj)
    frag = _strip_ds(_frag(obj))
    k = s if keep_aspect else min(bw / W, bh / H)
    warnings = []
    unit = abs(tw / W - 1) < 0.005 and abs(th / H - 1) < 0.005   # placed at its own size: text is left exactly as stored
    if scale_text and not unit:
        for tb in frag.iter(P + "txBody"):                 # make inherited sizes explicit so they can scale/fit
            d = tb.find("a:lstStyle/a:lvl1pPr/a:defRPr", NS)
            base = d.get("sz") if d is not None and d.get("sz") else "1800"
            for r in tb.iter(A + "r"):
                rp = r.find("a:rPr", NS)
                if rp is None: rp = etree.Element(A + "rPr"); r.insert(0, rp)
                if not rp.get("sz"): rp.set("sz", base)
        for rpr in list(frag.iter(A + "rPr")) + list(frag.iter(A + "defRPr")) + list(frag.iter(A + "endParaRPr")):
            if rpr.get("sz"): rpr.set("sz", str(max(800, int(int(rpr.get("sz")) * k / 100) * 100)))
        warnings = _autofit(frag, (bw / W) if not keep_aspect else k, (bh / H) if not keep_aspect else k)
        if warnings and move_labels: warnings = _move_labels_out(frag, obj["bbox"], k, warnings)
    for el in frag.iter(P + "sp"):            # short labels: never wrap mid-word when resized (also at scale 1: a
                                              # stored box sized to its font can wrap under another font, see v2.80)
        if not _filled(el) and len(_text(el).split()) <= 3:
            bp = el.find("p:txBody/a:bodyPr", NS)
            if bp is not None: bp.set("wrap", "none")
    tables = []
    for gf in [e for e in frag if etree.QName(e).localname == "graphicFrame" and e.find(".//a:tbl", NS) is not None]:
        frag.remove(gf); kx = tw / W; ky = th / H
        b = _xfrm(gf); _set_xfrm(gf, ax + (b[0] - X) * kx, ay + (b[1] - Y) * ky, b[2] * kx, b[3] * ky)
        for gc in gf.iter(A + "gridCol"): gc.set("w", str(int(int(gc.get("w")) * kx)))
        for tr in gf.iter(A + "tr"): tr.set("h", str(int(int(tr.get("h", "370840")) * ky)))
        tables.append(gf)
    g = _group(frag, X, Y, W, H, (ax, ay), (tw, th)) if len(frag) else None
    z = zipfile.ZipFile(pptx_path); files = {n: z.read(n) for n in z.namelist()}; z.close()
    pres = etree.fromstring(files["ppt/presentation.xml"])
    prels = {r.get("Id"): r.get("Target") for r in etree.fromstring(files["ppt/_rels/presentation.xml.rels"])}
    sname = "ppt/" + prels[pres.find("p:sldIdLst", NS)[slide_no - 1].get(RNS + "id")]
    rpath = os.path.dirname(sname) + "/_rels/" + os.path.basename(sname) + ".rels"
    rels = etree.fromstring(files[rpath])
    used = {r.get("Id") for r in rels}
    media_rid = {}
    for m in _used_media(copy.deepcopy(obj)).get("media", []):   # only pictures the placed shapes use
        target = f"ppt/media/obj_{m}"
        mp = os.path.join(store_dir, "media", m)
        files[target] = open(mp, "rb").read() if os.path.exists(mp) else zipfile.ZipFile(os.path.join(store_dir, "media.zip")).read(m)
        rid = next(f"rIdO{i}" for i in range(1, 9999) if f"rIdO{i}" not in used); used.add(rid)
        etree.SubElement(rels, "{http://schemas.openxmlformats.org/package/2006/relationships}Relationship",
                         Id=rid, Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", Target=f"../media/obj_{m}")
        media_rid[m] = rid
        ext = os.path.splitext(m)[1][1:].lower()
        ct = files["[Content_Types].xml"].decode()
        if f'Extension="{ext}"' not in ct:
            mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "gif": "image/gif", "emf": "image/x-emf", "wmf": "image/x-wmf", "bmp": "image/bmp", "tif": "image/tiff", "tiff": "image/tiff", "svg": "image/svg+xml"}.get(ext, "application/octet-stream")
            files["[Content_Types].xml"] = ct.replace("<Default ", f'<Default Extension="{ext}" ContentType="{mime}"/><Default ', 1).encode()
    import base64
    ctypes = files["[Content_Types].xml"].decode()
    def add_ct(partname, ctype):
        nonlocal ctypes
        if f'PartName="/{partname}"' not in ctypes: ctypes = ctypes.replace("</Types>", f'<Override PartName="/{partname}" ContentType="{ctype}"/></Types>')
    def add_default(ext, ctype):
        nonlocal ctypes
        if f'Extension="{ext}"' not in ctypes: ctypes = ctypes.replace("<Default ", f'<Default Extension="{ext}" ContentType="{ctype}"/><Default ', 1)
    chart_rid = {}
    for key, part in (obj.get("charts") or {}).items():
        n = 1
        while f"ppt/charts/chartObj{n}.xml" in files: n += 1
        cname = f"ppt/charts/chartObj{n}.xml"; crels = etree.Element("{http://schemas.openxmlformats.org/package/2006/relationships}Relationships")
        for r in part["rels"]:
            t = r["type"].split("/")[-1]; data = base64.b64decode(r["data"])
            if t == "package": tgt = f"ppt/embeddings/chartObj{n}_data{r['ext']}"; add_default(r["ext"][1:], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if r["ext"] == ".xlsx" else "application/octet-stream")
            elif t == "chartStyle": tgt = f"ppt/charts/styleObj{n}.xml"; add_ct(tgt, "application/vnd.ms-office.chartstyle+xml")
            elif t == "chartColorStyle": tgt = f"ppt/charts/colorsObj{n}.xml"; add_ct(tgt, "application/vnd.ms-office.chartcolorstyle+xml")
            elif t == "themeOverride": tgt = f"ppt/theme/themeOverrideObj{n}.xml"; add_ct(tgt, "application/vnd.openxmlformats-officedocument.themeOverride+xml")
            elif t == "image": tgt = f"ppt/media/chartObj{n}_img{r['ext']}"
            else: continue
            files[tgt] = data
            etree.SubElement(crels, "{http://schemas.openxmlformats.org/package/2006/relationships}Relationship", Id=r["id"], Type=r["type"], Target="../" + tgt.split("ppt/", 1)[1])
        files[cname] = etree.tostring(_strip_ds(etree.fromstring(part["xml"].encode("utf-8"))), xml_declaration=True, encoding="UTF-8", standalone=True)
        files[os.path.dirname(cname) + "/_rels/" + os.path.basename(cname) + ".rels"] = etree.tostring(crels, xml_declaration=True, encoding="UTF-8", standalone=True)
        add_ct(cname, "application/vnd.openxmlformats-officedocument.drawingml.chart+xml")
        rid = next(f"rIdC{i}" for i in range(1, 9999) if f"rIdC{i}" not in used); used.add(rid)
        etree.SubElement(rels, "{http://schemas.openxmlformats.org/package/2006/relationships}Relationship",
                         Id=rid, Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart", Target=f"../charts/chartObj{n}.xml")
        chart_rid[key] = rid
    files["[Content_Types].xml"] = ctypes.encode()
    for root_ in ([g] if g is not None else []) + tables:
        for e in root_.iter():
            for att, v in list(e.attrib.items()):
                if v.startswith("MEDIA:"): e.set(att, media_rid[v[6:]])
                elif v.startswith("CHART:"): e.set(att, chart_rid[v[6:]])
    sl = etree.fromstring(files[sname]); tree = sl.find(".//p:cSld/p:spTree", NS)
    nid = max([int(c.get("id")) for c in sl.iter(P + "cNvPr") if c.get("id", "").isdigit()] + [1]) + 1
    for root_ in ([g] if g is not None else []) + tables:
        for c in root_.iter(P + "cNvPr"): c.set("id", str(nid)); nid += 1
        tree.append(root_)
    files[sname] = etree.tostring(sl, xml_declaration=True, encoding="UTF-8", standalone=True)
    files[rpath] = etree.tostring(rels, xml_declaration=True, encoding="UTF-8", standalone=True)
    out = out_path or pptx_path
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zo:
        for n, d in files.items(): zo.writestr(n, d)
    return dict(box=(ax / EMU, ay / EMU, tw / EMU, th / EMU), warnings=warnings)

# ------------------------------------------------------------------ CLI
if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "extract":
        objs = extract(sys.argv[2], sys.argv[3], sys.argv[4]); print(len(objs), "objects")
    elif cmd == "find":
        for o in find(sys.argv[2], sys.argv[3:]): print(o["id"], "|", o["pattern"], "|", o["title"][:40], "|", o["n_shapes"], "shapes")
