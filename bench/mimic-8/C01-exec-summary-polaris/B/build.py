"""C01 open-book mimic, build B: the slide's stored object (case19-polaris-002) re-laid out for 4 stage columns and refilled.
objstore.extend(obj, 4) refuses this object (NeedsGenerator -> issueTree: its columns differ in width), and issueTree is
not this form, so the column units (arrow + head + bullet list) of the object itself are re-spaced and one is cloned here.
Run after build.js (which writes layout.json), with B/ as the working directory."""
import copy, json, os, re, sys, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
NS, A, P = O.NS, O.A, O.P
OUT = os.path.join(HERE, "candidate.pptx")
LAY = json.load(open(os.path.join(HERE, "layout.json")))
C, G = LAY["content"], LAY["geo"]
TIP, AY, AH = 278130, 1076705, 556260          # arrow tip depth, top and height (EMU, as on the original)


def tidy(obj):
    """Same clean-up of the PDF-imported object as build A (see A/build.py)."""
    f = O._frag(obj)
    for t in f.iter(A + "t"):
        if t.text: t.text = re.sub(r"(?<=\S)  +(?=\S)", " ", t.text)
    for pp in f.iter(A + "pPr"):
        bc = pp.find("a:buChar", NS)
        if bc is not None and pp.find("a:buFont", NS) is None: bc.addprevious(etree.Element(A + "buFont", typeface="Arial"))
    for sp in f.iter(P + "sp"):
        tb = sp.find("p:txBody", NS); bp = tb.find("a:bodyPr", NS) if tb is not None else None
        txt = O._text(sp)
        if O._filled(sp) and txt:
            for af in bp.findall("a:spAutoFit", NS): bp.remove(af)
            bp.set("anchor", "ctr")
            for p_ in tb.findall("a:p", NS):
                if not "".join(t.text or "" for t in p_.iter(A + "t")).strip(): tb.remove(p_); continue
                pp = p_.find("a:pPr", NS)
                for k in ("marL", "indent"): pp.attrib.pop(k, None)
                pp.set("algn", "ctr")
                for sb in pp.findall("a:spcBef", NS): pp.remove(sb)
        elif tb is not None and tb.find(".//a:buChar", NS) is not None and len(tb.findall("a:p", NS)) > 1:
            bp.set("wrap", "none")
            for p_ in tb.findall("a:p", NS):                           # the import's right-aligned paragraphs: sibling indents
                pp = p_.find("a:pPr", NS)
                if pp is None or pp.get("algn") != "r": continue
                pp.attrib.pop("algn"); pp.attrib.pop("marR", None)
                lvl1 = pp.get("lvl") == "1"
                pp.set("marL", "367665" if lvl1 else "190500"); pp.set("indent", "-177800" if lvl1 else "-178435")
                for tab in pp.iter(A + "tab"): tab.set("pos", "368300" if lvl1 else "191135")
    return O._store(obj, f)


def xf(el, x=None, y=None, w=None, h=None):
    b = O._xfrm(el)
    O._set_xfrm(el, b[0] if x is None else x, b[1] if y is None else y, b[2] if w is None else w, b[3] if h is None else h)


def ppr(sp, **kv):
    """Layout: set or drop attributes of a box's paragraph properties (set_texts copies them to the new text)."""
    for pp in sp.iter(A + "pPr"):
        for k, v in kv.items():
            if v is None: pp.attrib.pop(k, None)
            else: pp.set(k, v)


def tag(sp, key):
    """Name a box so its slot can be found in objstore.slots() (clones share their source's name)."""
    sp.find("p:nvSpPr/p:cNvPr", NS).set("name", "Fill: " + key)


obj = tidy(O.get(STORE, "case19-polaris-002"))
f = O._frag(obj); els = list(f)
bb = lambda e: O._xfrm(e)
cust = [e for e in els if e.find("p:spPr/a:custGeom", NS) is not None and not O._text(e)]
lines = [e for e in cust if bb(e)[2] == 0 or bb(e)[3] == 0]                 # straight lines (zero width or height)
shapes = [e for e in cust if e not in lines]
arrows = sorted([e for e in shapes if bb(e)[3] > 400000 and bb(e)[2] < 9000000], key=lambda e: bb(e)[0])
whites = sorted([e for e in lines if bb(e)[1] < 1100000], key=lambda e: bb(e)[0])   # hide each arrow's left edge
divs = sorted([e for e in lines if bb(e)[2] == 0 and bb(e)[1] > 1800000], key=lambda e: bb(e)[0])   # dashed: long, short
rules = sorted([e for e in lines if bb(e)[3] == 0 and bb(e)[1] < 5000000], key=lambda e: bb(e)[0])  # one per implication
chevs = sorted([e for e in shapes if bb(e)[3] < 300000], key=lambda e: (bb(e)[1], bb(e)[0]))      # 2 over the implications, 1 over the bar
bar = next(e for e in shapes if bb(e)[2] > 9000000)
texts = [e for e in els if O._text(e)]
heads = sorted([e for e in texts if bb(e)[1] == 1215390], key=lambda e: bb(e)[0])
lists = sorted([e for e in texts if 1700000 < bb(e)[1] < 1900000 and not O._filled(e)], key=lambda e: bb(e)[0])
impls = sorted([e for e in texts if 4500000 < bb(e)[1] < 5000000 and not O._filled(e)], key=lambda e: bb(e)[0])
rowlab = sorted([e for e in texts if O._filled(e)], key=lambda e: bb(e)[1])
bartxt = next(e for e in texts if bb(e)[1] > 6000000 and not O._filled(e))

# 1. stage columns: re-space the three units and clone the last one for each extra column (fewer columns: drop units)
n = G["n"]
units = list(zip(arrows, whites, heads, lists))
while len(units) < n:
    new = tuple(copy.deepcopy(e) for e in units[-1])
    for e in new: f.append(e)
    units.append(new)
for extra in units[n:]:
    for e in extra: f.remove(e)
units = units[:n]
wA = G["wA"]
fill = {}                                      # slot name -> what set_texts puts in it
for i, ((ar, wl, hd, ls), col) in enumerate(zip(units, C["columns"])):
    x = G["arrows"][i]
    xf(ar, x=x, w=wA); xf(wl, x=x)
    path = ar.find(".//a:path", NS); path.set("w", str(wA))
    for pt, (px, py) in zip(path.iter(A + "pt"), [(0, 0), (wA - TIP, 0), (wA, AH // 2), (wA - TIP, AH), (0, AH)]):
        pt.set("x", str(px)); pt.set("y", str(py))
    xf(hd, x=x, w=wA - TIP // 2); ppr(hd, algn="ctr", marL=None)
    tag(hd, f"head{i}"); fill[f"head{i}"] = col["head"]
    xf(ls, x=x + 23368, w=wA)
    tag(ls, f"list{i}"); fill[f"list{i}"] = [{"lvl": lvl, "runs": t} for t, lvl in col["items"]]
    # the import's boxes hug their text; these are column-wide, so they wrap at the column (a renderer centres
    # an auto-width box on its frame, which shifted short lists right)
    ls.find("p:txBody/a:bodyPr", NS).set("wrap", "square")

# dashed dividers (the object's own): long where an implication ends, short elsewhere; clone for extra columns
long_d, short_d = divs
pool = {True: [long_d], False: [short_d]}
for x in G["dividers"]:
    lg = x in G["longDiv"]
    d = pool[lg].pop(0) if pool[lg] else copy.deepcopy(short_d if not lg else long_d)
    if d.getparent() is None: short_d.addnext(d)
    xf(d, x=x)
for d in pool[True] + pool[False]: f.remove(d)

# 2. row labels
for k, (sp, lines) in enumerate(zip(rowlab, C["rowLabels"])):
    tag(sp, f"row{k}"); fill[f"row{k}"] = lines

# 3. implications: one box per implication across its columns, its double chevron centred on its grey rule
while len(impls) < len(C["implications"]):
    e = copy.deepcopy(impls[-1]); f.append(e); impls.append(e)
    c = copy.deepcopy(chevs[1]); chevs[1].addnext(c); chevs.insert(len(impls) - 1, c)
    r = copy.deepcopy(rules[-1]); rules[-1].addnext(r); rules.append(r)
for e in impls[len(C["implications"]):] + rules[len(C["implications"]):]: f.remove(e)
for k, (sp, im) in enumerate(zip(impls, C["implications"])):
    a, b = G["spans"][k]
    xf(sp, x=a + 23368, y=4837557, w=b - a - 60000, h=513080)
    runs = [t for t, _ in im["runs"]]          # run k = the box's k-th run of a new format (regular, bold, regular)
    tag(sp, f"impl{k}"); fill[f"impl{k}"] = [runs if len(runs) > 1 else runs[0]]
    r0, r1 = G["rules"][k]; cw = bb(chevs[k])[2]
    xf(chevs[k], x=(r0 + r1) // 2 - cw // 2)
    xf(rules[k], x=r0, w=r1 - r0)                 # its grey rule (the object's own line, stretched)

# 4. the bar: centred across its full width
b = bb(bar)
xf(bartxt, x=b[0], w=b[2]); ppr(bartxt, algn="ctr", marL=None)
tag(bartxt, "bar"); fill["bar"] = C["bar"]

# 5. refill with the store tool, in its own slot order
obj = O._store(obj, f)
order = O.slots(obj)
texts = [fill[h] for _, h in order]
print("slots:", [h for _, h in order])

X, Y, W, H = obj["bbox"]; E = O.EMU
r = O.place(OUT, 1, obj, (X / E, Y / E, W / E, H / E), STORE, colours="original", texts=texts)
print("placed case19-polaris-002 (4 columns) at", tuple(round(v, 3) for v in r["box"]), "warnings:", r["warnings"])

z = zipfile.ZipFile(OUT); files = {n_: z.read(n_) for n_ in z.namelist()}; z.close()
sl = files["ppt/slides/slide1.xml"].decode()
sl = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>2</a:t></a:r>', sl)
files["ppt/slides/slide1.xml"] = sl.encode()
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zo:
    for n_, d in files.items(): zo.writestr(n_, d)
