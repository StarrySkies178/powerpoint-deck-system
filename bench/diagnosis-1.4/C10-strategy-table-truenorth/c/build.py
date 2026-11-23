"""C10 variant c: refill the native table of the deck's slide 15 (case-truenorth-pola-015, element 3) as the
4-column strategy overview. Runs after build.js (which drew the frame) with this folder as working directory."""
import os, sys, copy
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

# ---- grid (inches): full body width like the stored table, from under the title band to above the source line
X0, Y0 = 0.12, 1.50
COLS = [2.52, 3.38, 2.05, 1.81]
ROWS = [0.36, 0.80, 1.04, 0.94, 1.20, 1.04]
RED, HDR, GREY, PINK, WHITE, BLACK = "CC0000", "CC1B00", "F1F1F1", "F5D7D3", "FFFFFF", "000000"
PT, HEAD_PT, TOP_PT = 10, 14, 10.5

# ---- lift the table out of the stored slide, resize it to 6 x 4 and place it over the body
src = O.get(STORE, "case-truenorth-pola-015")
tbl = O.element(src, 3)
tbl = O.table_size(tbl, rows=len(ROWS), cols=len(COLS))
O.place(CAND, 1, tbl, (X0, Y0, sum(COLS), sum(ROWS)), STORE, keep_aspect=False, colours="original", out_path=CAND)

p = Presentation(CAND)
s = p.slides[0]
gf = [sh for sh in s.shapes if sh.has_table][0]
t = gf.table
for j, w in enumerate(COLS): t.columns[j].width = Inches(w)
for i, h in enumerate(ROWS): t.rows[i].height = Inches(h)
gf.left, gf.top, gf.width, gf.height = Inches(X0), Inches(Y0), Inches(sum(COLS)), Inches(sum(ROWS))

def solid(parent, hexv):
    f = etree.SubElement(parent, A + "solidFill"); c = etree.SubElement(f, A + "srgbClr"); c.set("val", hexv); return f

def style_cell(cell, fill, anchor="t", marL=0.08, marT=0.03):
    tcPr = cell._tc.get_or_add_tcPr()
    for tag in ("solidFill", "noFill"):
        for e in tcPr.findall(A + tag): tcPr.remove(e)
    for side in ("lnL", "lnR", "lnT", "lnB"):           # white rules between cells, as on the stored table
        for e in tcPr.findall(A + side): tcPr.remove(e)
    for side, w in (("lnL", 12700), ("lnR", 12700), ("lnT", 12700), ("lnB", 12700)):
        ln = etree.SubElement(tcPr, A + side); ln.set("w", str(w)); solid(ln, WHITE)
    solid(tcPr, fill)
    tcPr.set("anchor", anchor)
    tcPr.set("marL", str(int(marL * 914400))); tcPr.set("marR", str(int(0.05 * 914400)))
    tcPr.set("marT", str(int(marT * 914400))); tcPr.set("marB", str(int(0.02 * 914400)))

def fill_cell(cell, paras, align="l"):
    """paras: list of (text, dict(b=, bullet=, color=, sz=)); text may be a list of (run, bold) pieces."""
    txb = cell._tc.txBody
    for e in txb.findall(A + "p"): txb.remove(e)
    for text, o in paras:
        pp = etree.SubElement(txb, A + "p")
        pPr = etree.SubElement(pp, A + "pPr"); pPr.set("algn", o.get("algn", align))
        if o.get("bullet"):
            pPr.set("marL", str(int(0.15 * 914400))); pPr.set("indent", str(int(-0.15 * 914400)))
        sb = etree.SubElement(pPr, A + "spcBef"); etree.SubElement(sb, A + "spcPts").set("val", str(o.get("before", 0)))
        if o.get("bullet"):
            bf = etree.SubElement(pPr, A + "buFont"); bf.set("typeface", "Arial")
            etree.SubElement(pPr, A + "buChar").set("char", "•")
        else:
            etree.SubElement(pPr, A + "buNone")
        pieces = text if isinstance(text, list) else [(text, o.get("b", False))]
        for run, bold in pieces:
            r = etree.SubElement(pp, A + "r")
            rPr = etree.SubElement(r, A + "rPr"); rPr.set("lang", "en-US"); rPr.set("sz", str(int(o.get("sz", PT) * 100)))
            rPr.set("b", "1" if bold else "0"); rPr.set("dirty", "0")
            solid(rPr, o.get("color", BLACK))
            etree.SubElement(rPr, A + "latin").set("typeface", "+mn-lt")
            etree.SubElement(r, A + "t").text = run

B = lambda txt, **k: (txt, dict(bullet=True, **k))
H = lambda txt, **k: (txt, dict(b=True, **k))

# header row: red, white text
for j, h in enumerate(["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"]):
    c = t.cell(0, j); style_cell(c, HDR, anchor="ctr", marT=0.02)
    fill_cell(c, [(h, dict(b=False, color=WHITE, sz=HEAD_PT, algn="ctr"))])

# highlighted summary row
top = [
    ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
    ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
    ["Market Risks", "Political Risks"],
    ["R&D Process", "Product Intro", "Re-evaluation"],
]
for j, items in enumerate(top):
    c = t.cell(1, j); style_cell(c, PINK, anchor="ctr")
    fill_cell(c, [B(it, b=True, sz=TOP_PT, before=0 if k == 0 else 300) for k, it in enumerate(items)])

phases = [
    ("Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
     "Brand position", ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"]),
    ("Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
     "Marketing strategy", ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"]),
    ("Purchase phase", ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
     "Channel optimization", ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"]),
    ("Aftersales phase", ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
     "Loyalty management", ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"]),
]
for i, (ph, needs, st, acts) in enumerate(phases):
    r = 2 + i; band = GREY if i % 2 == 0 else WHITE
    for j, (head, items) in enumerate([(ph, needs), (st, acts)]):
        c = t.cell(r, j); style_cell(c, band, anchor="ctr", marL=0.08 if j == 0 else 0.22)
        fill_cell(c, [H(head, color=RED, sz=PT + 1)] + [B(x) for x in items])

# risks and mitigation: one merged cell each over the four phase rows
risk = t.cell(2, 2); risk.merge(t.cell(5, 2))
mit = t.cell(2, 3); mit.merge(t.cell(5, 3))
style_cell(risk, GREY, anchor="t", marT=0.15); style_cell(mit, WHITE, anchor="t", marT=0.15)
fill_cell(risk, [H("Market Risks", color=RED, sz=PT + 1),
                 B("Competitor responses to anti-hero products", before=700),
                 B("Four Channel management takes efforts", before=700),
                 B("R&D process not entirely aligned with consumer trends for products", before=700),
                 H("Political Risks", color=RED, sz=PT + 1, before=2400),
                 B("Import tax increase for premium cosmetics products", before=700),
                 B("Floating exchange", before=700),
                 B("Political outrage in south Asia area", before=700)])
fill_cell(mit, [B("Actively collect consumer feedback to facilitate R&D process"),
                B("Roll out products quickly to meet consumer needs", before=2400),
                B("Prioritize channel management for weak channels", before=2400),
                B("Re-consider manufacturing strategy in 2 years and consider option of building factory in China", before=2400)])
# merged-away cells keep no stray text
for rr in range(3, 6):
    for cc in (2, 3):
        style_cell(t.cell(rr, cc), GREY if cc == 2 else WHITE)

# pairing arrows: situation -> strategy in each phase row (red, like the deck's flow arrows)
ax = X0 + COLS[0] - 0.02
y = Y0 + ROWS[0] + ROWS[1]
for i in range(4):
    h = ROWS[2 + i]
    a = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(ax), Inches(y + h / 2 - 0.12), Inches(0.2), Inches(0.24))
    a.fill.solid(); a.fill.fore_color.rgb = RGBColor.from_string(RED); a.line.fill.background(); a.name = "pair arrow"
    a.shadow.inherit = False
    y += h

# deck frame the style profile does not draw: the grey band along the bottom edge (behind source and page number)
bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.21), Inches(10), Inches(0.29))
bar.fill.solid(); bar.fill.fore_color.rgb = RGBColor.from_string("CCCCCC"); bar.line.fill.background(); bar.shadow.inherit = False
bar.name = "footer band"
tree = s.shapes._spTree; tree.remove(bar._element); tree.insert(2, bar._element)
# breadcrumb separators: the profile's red triangle (U+25BA, which never turns into a colour emoji like U+25B6)
for sh in s.shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith("Market Analysis"):
        for r in sh.text_frame.paragraphs[0].runs:
            if "\u25B6" in r.text:
                r.text = r.text.replace("\u25B6", "\u25BA"); r.font.color.rgb = RGBColor.from_string(RED)
p.save(CAND)
