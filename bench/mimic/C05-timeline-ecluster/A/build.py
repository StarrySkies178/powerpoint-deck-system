"""C05 mimic, build A, step 2 (run in A/ after build.js).
1. Small frame fixes on the slide itself (no framework file is changed): title text position, grey crumb arrows,
   the slide's own band behind the title, layout band/rule switched off for this slide, page number 12 in bold navy.
2. Places the stored risk objects of case19-ecluster-017 (label box + bullet box) at their original positions,
   with the original colours. The stored object's third element is the Gantt PICTURE: it is never placed."""
import os, sys, copy
from lxml import etree
from pptx import Presentation
from pptx.util import Inches, Emu

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
OUT = os.path.join(HERE, "candidate.pptx")
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
PN = "{http://schemas.openxmlformats.org/presentationml/2006/main}"

RISKS = None          # build A: keep the stored text
LABEL = None
PAGE = 12


def fix_frame(path, page):
    prs = Presentation(path)
    s = prs.slides[0]
    tree = s.shapes._spTree
    for sh in s.shapes:
        if sh.is_placeholder and sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type):
            sh.left, sh.top, sh.width, sh.height = Inches(0), Inches(0.424), Inches(13.333), Inches(0.903)
            bp = sh.text_frame._txBody.find(A + "bodyPr"); bp.set("anchor", "ctr"); bp.set("lIns", str(Inches(0.33)))
        elif sh.has_text_frame and "→" in sh.text_frame.text:            # crumb: arrows grey like the original
            for r in sh.text_frame._txBody.iter(A + "r"):
                if "→" in "".join(t.text or "" for t in r.iter(A + "t")):
                    sf = r.find(A + "rPr/" + A + "solidFill")
                    for c in list(sf): sf.remove(c)
                    etree.SubElement(sf, A + "srgbClr", val="BEBEBE")
            sh.left = Inches(0.325)
        elif sh.is_placeholder and "SLIDE_NUMBER" in str(sh.placeholder_format.type):
            for r in list(sh.text_frame._txBody.iter(A + "fld")):
                rp = r.find(A + "rPr"); rp.set("b", "1"); rp.set("sz", "1000")
                sf = etree.SubElement(rp, A + "solidFill"); etree.SubElement(sf, A + "srgbClr", val="202C4F")
                # LibreOffice ignores firstSlideNum, so the field becomes the plain page text "12" (as printed in the deck)
                run = etree.Element(A + "r"); run.append(copy.deepcopy(rp)); t = etree.SubElement(run, A + "t"); t.text = str(page)
                r.addprevious(run); r.getparent().remove(r)
            sh.top = Inches(7.31)
    band = next(sh for sh in s.shapes if sh.name == "title band")
    el = band._element; tree.remove(el); tree.insert(2, el)                # behind the title text
    s._element.set("showMasterSp", "0")                                    # layout band + rule off: this slide draws its own
    prs.part._element.set("firstSlideNum", str(page))                      # the page field reads 12, as in the deck
    prs.save(path)


def place_risks(path, risks=None, label=None, top=None):
    obj = O.get(STORE, "case19-ecluster-017")
    kinds = [e["kind"] for e in O.elements(obj)]
    assert kinds == ["sp", "sp", "pic"], kinds
    box = O.element(obj, 0)          # bullet box (outlined, 14 pt bullets)
    lab = O.element(obj, 1)          # "Potential Risks" filled label box
    if risks is not None: box = O.set_texts(box, [risks])
    if label is not None: lab = O.set_texts(lab, [label])
    # objstore bug worked around: element() keeps the parent's media list, so place() would copy the Gantt JPEG into
    # the deck (an unused picture part + relationship) although the lifted text boxes reference no picture.
    for o in (lab, box):
        if "<p:pic" not in o["xml"] and "MEDIA:" not in o["xml"]: o["media"] = []
    res = []
    for o in (lab, box):
        X, Y, W, H = [v / 914400 for v in o["bbox"]]
        res.append(O.place(path, 1, o, (X, Y if top is None else top, W, H), STORE, keep_aspect=False, colours="original"))
    return res


def keep_box_sizes(path):
    """The stored boxes carry spAutoFit (shape grows/shrinks to its text). LibreOffice then shrinks the
    'Potential Risks' box to its two lines; the original keeps both boxes at the same 1.21 in height."""
    prs = Presentation(path)
    for bp in prs.slides[0]._element.iter(A + "bodyPr"):
        for af in bp.findall(A + "spAutoFit"):
            bp.remove(af); etree.SubElement(bp, A + "noAutofit")
    prs.save(path)


if __name__ == "__main__":
    fix_frame(OUT, PAGE)
    import json
    bottom = json.load(open(os.path.join(HERE, "layout.json")))["gridBottom"]
    for r in place_risks(OUT, RISKS, LABEL, top=round(bottom + 0.147, 3)): print(r)
    keep_box_sizes(OUT)
