"""C04 variant c, step 2 (runs after build.js, working directory = this folder).
Places the stored pieces of Case-2019-E-Cluster slide 5 (case19-ecluster-005, the closest other slide: T2B1 with
stacked columns + CAGR table, a second chart and three icon cards) at their original boxes and refills their text.
Then fixes two frame details in this candidate only: the title inset and a stray layout rule (see notes at the end)."""
import copy, os, re, sys, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
EMU = 914400

obj = O.get(STORE, "case19-ecluster-005")
f = O._frag(obj)
el = list(f)

def set_paras(e, paras, keep_bold=None):
    """Refill a stored text box: paragraph i gets text paras[i], in the style of its first run."""
    ps = [p for p in e.iter(A + "p") if p.find(A + "r") is not None]
    while len(ps) < len(paras):
        n = copy.deepcopy(ps[-1]); ps[-1].addnext(n); ps.append(n)
    for p, t in zip(ps, paras):
        rs = p.findall(A + "r")
        for r in rs[1:]: p.remove(r)
        rp = rs[0].find(A + "rPr")
        if rp is not None and "spc" in rp.attrib: del rp.attrib["spc"]
        rs[0].find(A + "t").text = t
    for p in ps[len(paras):]: p.getparent().remove(p)
    return e

def move(e, x=None, y=None, w=None, h=None, dx=0, dy=0):
    b = list(O._xfrm(e))
    if x is not None: b[0] = x * EMU
    if y is not None: b[1] = y * EMU
    if w is not None: b[2] = w * EMU
    if h is not None: b[3] = h * EMU
    b[0] += dx * EMU; b[1] += dy * EMU
    O._set_xfrm(e, *[int(v) for v in b])
    return e

def clone(e): return copy.deepcopy(e)

keep = []
# logo (top right)
keep.append(el[1])
# grey band of panel 3: band, top rule, two dividers; drop slide 5's own icons (pictures and drawn laptop / bulb)
band = el[2]
for c in list(band):
    tag = etree.QName(c).localname
    if tag in ("nvGrpSpPr", "grpSpPr"): continue
    b = [v / EMU for v in O._xfrm(c)]
    keep_it = tag == "sp" and (b[2] > 12 or b[2] < 0.01)     # band rect, top rule, vertical dividers
    if not keep_it: band.remove(c)
keep.append(band)
# numbered chips 1-3
keep += el[13:19]
# sub-headlines
keep.append(set_paras(el[11], ["Fine jewelry has a lower growth rate"]))
keep.append(set_paras(move(el[3], w=5.6), ["Fine jewelry accounts for the majority of CTF*"]))
h3 = set_paras(move(clone(el[11]), y=4.9, w=8.0), ["Major constraints limit the further development of fine jewelry"])
keep.append(h3)
# unit lines (title + italic unit), the slide's own two-paragraph unit box
keep.append(set_paras(move(el[12], w=5.2), ["China fine jewelry annual market size and growth", "CNY Billion"]))
keep.append(set_paras(move(clone(el[12]), x=7.0, y=1.85, w=2.75), ["CTF's annual revenue", "CNY Billion"]))
keep.append(set_paras(move(clone(el[12]), x=10.0, y=1.85, w=3.0), ["CTF's 2018 revenue by segment", "%"]))
# CAGR table: headers, highlighted (circled) fashion row, then fine and total rows cloned from the same cells
DX, DY = 0.15, -0.20                                         # stored row (y 3.20) -> fashion row centre (y 3.13); columns a little right
keep.append(set_paras(move(el[22], dx=DX), ["CAGR", "13-18"]))  # two lines, as the deck stacks its CAGR headers
keep.append(set_paras(move(el[23], dx=DX), ["CAGR", "18-23"]))
fa, fb = el[21], el[19]
for e, t in ((fa, "23%"), (fb, "18%")):
    keep.append(set_paras(move(e, dx=DX, dy=DY), [t]))
keep.append(move(el[20], dx=DX, dy=DY))                      # the circle on the key CAGR
for k, (a, b) in ((1, ("4%", "5%")), (2, ("4%", "7%"))):     # fine and total rows: clones of the (already moved) fashion cells
    keep.append(set_paras(move(clone(fa), dy=0.6 * k), [a]))
    keep.append(set_paras(move(clone(fb), dy=0.6 * k), [b]))
# three constraint cards: bold label + italic line
cards = [("Customer changing preference", "New emerging customers value the fashion design more and show different preference"),
         ("Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"),
         ("Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment")]
for e, (lab, body), w in zip(el[43:46], cards, (3.3, 3.75, 3.3)):
    keep.append(set_paras(move(e, w=w), [lab, body]))

for c in list(f): f.remove(c)
for c in keep: f.append(c)
obj = O._store(obj, f) or obj
bb = [v / EMU for v in obj["bbox"]]
O.place(CAND, 1, obj, bb, STORE, out_path=CAND, colours="original", scale_text=False, move_labels=False)

# ---- candidate-only fixes (frame), written back into the .pptx
z = zipfile.ZipFile(CAND); files = {n: z.read(n) for n in z.namelist()}; z.close()
s = files["ppt/slides/slide1.xml"].decode()
# 1. the stored group goes to the back, so the generator's icons and charts stay on top of the grey band
tree = etree.fromstring(s.encode())
sp = tree.find(".//{http://schemas.openxmlformats.org/presentationml/2006/main}spTree")
groups = [c for c in sp if etree.QName(c).localname == "grpSp"]
if groups:
    g = groups[-1]; sp.remove(g); sp.insert(2, g)
seen, nxt = set(), 1000                                       # cloned pieces share ids: make every shape id unique
for c in tree.iter("{http://schemas.openxmlformats.org/presentationml/2006/main}cNvPr"):
    if c.get("id") in seen: c.set("id", str(nxt)); nxt += 1
    seen.add(c.get("id"))
# 2. title: as on the deck's other slides, a full-width box whose paragraph is indented, two lines inside the band
PNS = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
ttl = next(e for e in sp if etree.QName(e).localname == "sp" and e.find(f".//{PNS}ph") is not None and e.find(f".//{PNS}ph").get("type") == "title")
off, ext = ttl.find(f"{PNS}spPr/{A}xfrm/{A}off"), ttl.find(f"{PNS}spPr/{A}xfrm/{A}ext")
off.set("x", "0"); off.set("y", "438912"); ext.set("cx", "12188952"); ext.set("cy", "850392")
for pp in ttl.iter(f"{A}pPr"):                               # the deck indents its title paragraph (marL 0.35 in, marR 0.62 in)
    pp.set("marL", "318135"); pp.set("marR", "569595")
s = etree.tostring(tree, xml_declaration=True, encoding="UTF-8", standalone=True).decode()
files["ppt/slides/slide1.xml"] = s.encode()
# 3. the layout carries a navy rule at y 1.74 in from x 4.6 in (the profile read a panel sub-headline rule as a title rule);
#    the panels draw their own rules, so drop it from this candidate's layout
rels = files["ppt/slides/_rels/slide1.xml.rels"].decode()
lay = "ppt/slideLayouts/" + re.search(r'slideLayouts/(slideLayout\d+\.xml)', rels).group(1)
ls = files[lay].decode()
ls = re.sub(r'<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Shape 1"></p:cNvPr>.*?<a:prstGeom prst="line">.*?</p:sp>', '', ls, count=1, flags=re.S)
files[lay] = ls.encode()
out = zipfile.ZipFile(CAND, "w", zipfile.ZIP_DEFLATED)
for n, b in files.items(): out.writestr(n, b)
out.close()
print("placed", len(keep), "stored pieces of case19-ecluster-005")
