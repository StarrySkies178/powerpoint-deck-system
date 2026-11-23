"""C03 variant c: place Polaris slide 19's stored table (case19-polaris-019, element 0) three times,
cut to header + 3 rows and 6 columns, and refill it with the three scenarios of the prompt.
Runs after build.js with this folder as working directory."""
import copy, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
CAND = os.path.join(HERE, "candidate.pptx")
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
EMU = 914400

YEARS = ["2019", "2020", "2021", "2022", "2023"]
CASES = [
    ("High Case", [("# stores", ["261", "321", "381", "441", "551"]),
                   ("Organic Growth (%)", ["4%", "8%", "10%", "12%", "15%"]),
                   ("Online Growth (%)", ["31%", "41%", "40%", "45%", "38%"])]),
    ("Base Case", [("# stores", ["261", "306", "351", "396", "441"]),
                   ("Organic Growth (%)", ["4%", "8%", "10%", "10%", "12%"]),
                   ("Online Growth (%)", ["31%", "32%", "32%", "30%", "30%"])]),
    ("Low Base", [("# stores", ["261", "306", "351", "391", "431"]),
                  ("Organic Growth (%)", ["4%", "4%", "4%", "3%", "5%"]),
                  ("Online Growth (%)", ["31%", "29%", "29%", "27%", "25%"])]),
]

X, W = 0.37, 12.6                  # slide 19's table: left edge and width
TOP, GAP = 1.13, 0.30              # profile body top; gap between the three tables
HDR_H, ROW_H = 0.46, 0.40
FIRST_W = 3.1                      # label column; the five year columns share the rest


def set_cell(tc, text, algn=None, header=False):
    """Keep the cell's own run formatting (size, bold, theme colour), put one run with `text` in it."""
    body = tc.find(A + "txBody")
    ps = body.findall(A + "p")
    keep = next((p for p in reversed(ps) if p.find(A + "r") is not None), ps[0])
    for p in ps:
        if p is not keep: body.remove(p)
    runs = keep.findall(A + "r")
    for r in runs[1:]: keep.remove(r)
    runs[0].find(A + "t").text = text
    rpr = runs[0].find(A + "rPr")
    if rpr is not None and rpr.get("spc"): del rpr.attrib["spc"]
    ppr = keep.find(A + "pPr")
    if algn is not None:
        ppr.set("algn", algn)
        for k in ("marL", "marR"):
            if k in ppr.attrib and algn == "ctr": del ppr.attrib[k]
    if header:                      # header text sits on the black rule, as on slide 19
        sb = ppr.find(A + "spcBef")
        if sb is not None: ppr.remove(sb)
        tcpr = tc.find(A + "tcPr"); tcpr.set("anchor", "b"); tcpr.set("marB", "45720"); tcpr.set("marT", "0")


def table_obj(name, rows):
    o = O.element(O.get(STORE, "case19-polaris-019"), 0)      # the native table of slide 19, no Harvey balls
    f = O._frag(o)
    gf = next(f.iter("{http://schemas.openxmlformats.org/presentationml/2006/main}graphicFrame"))
    tbl = gf.find(".//" + A + "tbl"); grid = tbl.find(A + "tblGrid")
    src = tbl.findall(A + "tr")
    # rows: header, first body row, a middle row, the last row (red closing rule)
    pick = [src[0], src[1], src[2], src[-1]]
    for tr in src: tbl.remove(tr)
    new = []
    for tr in pick:
        tr = copy.deepcopy(tr); tcs = tr.findall(A + "tc")
        for tc in tcs: tr.remove(tc)
        tr.append(tcs[0])                                     # bold label column (City)
        for _ in YEARS: tr.append(copy.deepcopy(tcs[2]))      # centred number column (Urban population)
        tbl.append(tr); new.append(tr)
    for g in grid.findall(A + "gridCol"): grid.remove(g)
    rest = (W - FIRST_W) / len(YEARS)
    for w in [FIRST_W] + [rest] * len(YEARS):
        g = grid.makeelement(A + "gridCol", {"w": str(int(w * EMU))}); grid.append(g)
    hdr = new[0].findall(A + "tc")
    set_cell(hdr[0], name, header=True)
    for tc, y in zip(hdr[1:], YEARS): set_cell(tc, y, algn="ctr", header=True)
    for tr, (label, vals) in zip(new[1:], rows):
        tcs = tr.findall(A + "tc")
        set_cell(tcs[0], label)
        for tc, v in zip(tcs[1:], vals): set_cell(tc, v, algn="ctr")
    new[0].set("h", str(int(HDR_H * EMU)))
    for tr in new[1:]: tr.set("h", str(int(ROW_H * EMU)))
    h = HDR_H + ROW_H * len(rows)
    O._set_xfrm(gf, int(X * EMU), int(0), int(W * EMU), int(h * EMU))
    o = O._store(o, f)
    o["bbox"] = [int(X * EMU), 0, int(W * EMU), int(h * EMU)]
    return o, h


y = TOP
for name, rows in CASES:
    o, h = table_obj(name, rows)
    O.place(CAND, 1, o, (X, y, W, h), STORE, out_path=CAND, colours="original", scale_text=False)
    y += h + GAP
print("tables end at %.2f in" % (y - GAP))


# Footer of the reference deck. The store drops repeated frame elements and the profile has no footer, so
# the grey rule above the source, the two client logos with their divider come from the same slide 19
# of Templates/Case-2019-Polaris.pptx.
# The page number is the one the prompt gives.
import io
from pptx import Presentation
from pptx.util import Emu
ref = Presentation(os.path.join(ROOT, "Templates/Case-2019-Polaris.pptx")).slides[18]
cand = Presentation(CAND); sl = cand.slides[0]
for sh in ref.shapes:
    if sh.name in ("object 3", "object 7"):                     # grey footer rule, logo divider
        sl.shapes._spTree.append(copy.deepcopy(sh._element))
    elif sh.name in ("object 5", "object 6"):                   # Polaris and Pandora logos
        blip = sh._element.find(".//" + A + "blip")
        img = ref.part.related_part(blip.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")).blob
        sl.shapes.add_picture(io.BytesIO(img), sh.left, sh.top, sh.width, sh.height)
for sh in sl.placeholders:
    if sh.placeholder_format.type == 13:                       # slide number field -> the page number from the prompt
        p = sh.text_frame.paragraphs[0]
        for el in list(p._p):
            if el.tag in (A + "fld", A + "r"): p._p.remove(el)
        r = p.add_run(); r.text = "22"
cand.save(CAND)
