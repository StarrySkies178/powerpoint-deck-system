"""Helpers shared by A/build.py and B/build.py (this case's folder only; no framework file is changed)."""
import os, sys, zipfile, re, copy
from lxml import etree
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
STORE = os.path.join(ROOT, "Objects/store")
EMU = 914400
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

def _edit(path, fn):
    z = zipfile.ZipFile(path); files = {k: z.read(k) for k in z.namelist()}; z.close()
    fn(files)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zo:
        for k, d in files.items(): zo.writestr(k, d)

def explicit_borders(path, slide="ppt/slides/slide1.xml"):
    order = ["lnL", "lnR", "lnT", "lnB"]
    def fn(files):
        s = etree.fromstring(files[slide])
        for tc in s.iter(A + "tc"):
            tp = tc.find(A + "tcPr")
            if tp is None: tp = etree.SubElement(tc, A + "tcPr")
            have = {etree.QName(c).localname for c in tp}
            for side in order:
                if side in have: continue
                el = etree.Element(A + side, w="0"); etree.SubElement(el, A + "noFill")
                idx = 0
                for i, c in enumerate(tp):
                    n = etree.QName(c).localname
                    if n in order and order.index(n) < order.index(side): idx = i + 1
                tp.insert(idx, el)
        files[slide] = etree.tostring(s, xml_declaration=True, encoding="UTF-8", standalone=True)
    _edit(path, fn)

def page_number(path, n, slide="ppt/slides/slide1.xml"):
    def fn(files):
        p = files["ppt/presentation.xml"].decode()
        p = re.sub(r'\sfirstSlideNum="\d+"', "", p).replace("<p:presentation ", f'<p:presentation firstSlideNum="{n}" ', 1)
        files["ppt/presentation.xml"] = p.encode()
        s = etree.fromstring(files[slide])
        for fld in list(s.iter(A + "fld")):
            if fld.get("type") != "slidenum": continue
            r = etree.Element(A + "r"); rp = fld.find(A + "rPr")
            if rp is not None: r.append(copy.deepcopy(rp))
            t = etree.SubElement(r, A + "t"); t.text = str(n)
            fld.getparent().replace(fld, r)
        files[slide] = etree.tostring(s, xml_declaration=True, encoding="UTF-8", standalone=True)
    _edit(path, fn)

def respace_columns(obj, first_w, num_w0, num_w):
    """Label column keeps first_w; the first number column num_w0, the rest num_w each; the right
    indent the source used to push numbers left inside wide columns is dropped (numbers end on the column edge)."""
    obj = copy.deepcopy(obj); f = O._frag(obj)
    gcs = list(f.iter(A + "gridCol"))
    for i, g in enumerate(gcs): g.set("w", str(int(first_w if i == 0 else (num_w0 if i == 1 else num_w))))
    for tr in f.iter(A + "tr"):
        for j, tc in enumerate(tr.findall(A + "tc")):
            if j == 0: continue
            for p in tc.iter(A + "pPr"):
                if p.get("marR"): p.set("marR", "0")
    total = sum(int(g.get("w")) for g in gcs)
    for gf in f.iter("{http://schemas.openxmlformats.org/presentationml/2006/main}graphicFrame"):
        gf.find(".//" + A + "ext").set("cx", str(total))
    return O._store(obj, f)
