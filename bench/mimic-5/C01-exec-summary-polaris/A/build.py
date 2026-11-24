"""C01 open-book mimic, build A: place the slide's own stored object (case19-polaris-002) on the frame build.js made.
Run after build.js, with A/ as the working directory."""
import os, re, sys, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree

STORE = os.path.join(ROOT, "Objects/store")
NS, A, P = O.NS, O.A, O.P
OUT = os.path.join(HERE, "candidate.pptx")


def tidy(obj):
    """The stored object came from a PDF import. Make it render as the original does in any renderer:
    label panels keep their size and centre their text; one-line bullets never wrap; the two right-aligned
    paragraphs of the import get the same indents as their siblings."""
    f = O._frag(obj)
    for t in f.iter(A + "t"):                                          # the import's line breaks became double spaces
        if t.text: t.text = re.sub(r"(?<=\S)  +(?=\S)", " ", t.text)
    for pp in f.iter(A + "pPr"):                                       # dash bullets: name the bullet font, as the round ones do
        bc = pp.find("a:buChar", NS)
        if bc is not None and pp.find("a:buFont", NS) is None:
            bf = etree.Element(A + "buFont", typeface="Arial"); bc.addprevious(bf)
    for sp in f.iter(P + "sp"):
        tb = sp.find("p:txBody", NS); bp = tb.find("a:bodyPr", NS) if tb is not None else None
        txt = O._text(sp)
        if O._filled(sp) and txt:                                      # grey row-label panels
            for af in bp.findall("a:spAutoFit", NS): bp.remove(af)
            bp.set("anchor", "ctr")
            for p_ in tb.findall("a:p", NS):
                if not "".join(t.text or "" for t in p_.iter(A + "t")).strip(): tb.remove(p_); continue
                pp = p_.find("a:pPr", NS)
                for k in ("marL", "indent"): pp.attrib.pop(k, None)
                pp.set("algn", "ctr")
                for sb in pp.findall("a:spcBef", NS): pp.remove(sb)
        elif tb is not None and tb.find(".//a:buChar", NS) is not None and len(tb.findall("a:p", NS)) > 1:   # bullet lists
            bp.set("wrap", "none")
            for p_ in tb.findall("a:p", NS):
                pp = p_.find("a:pPr", NS)
                if pp is None or pp.get("algn") != "r": continue
                pp.attrib.pop("algn"); pp.attrib.pop("marR", None)
                lvl1 = pp.get("lvl") == "1"
                pp.set("marL", "367665" if lvl1 else "190500"); pp.set("indent", "-177800" if lvl1 else "-178435")
                for tab in pp.iter(A + "tab"): tab.set("pos", "368300" if lvl1 else "191135")
    return O._store(obj, f)


obj = tidy(O.get(STORE, "case19-polaris-002"))
X, Y, W, H = obj["bbox"]; E = O.EMU
r = O.place(OUT, 1, obj, (X / E, Y / E, W / E, H / E), STORE, colours="original")
print("placed case19-polaris-002 at", tuple(round(v, 3) for v in r["box"]), "warnings:", r["warnings"])

# the original slide is page 2 of its deck: show 2 (a fixed number; this file holds the one slide)
z = zipfile.ZipFile(OUT); files = {n: z.read(n) for n in z.namelist()}; z.close()
sl = files["ppt/slides/slide1.xml"].decode()
sl = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', r'<a:r>\1<a:t>2</a:t></a:r>', sl)
files["ppt/slides/slide1.xml"] = sl.encode()
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zo:
    for n, d in files.items(): zo.writestr(n, d)
