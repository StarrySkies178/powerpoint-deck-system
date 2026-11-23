"""C10 variant a: put the deck's TrueNorth logo (top right, every content slide) into the candidate.
The logo is lifted from slide 7's stored object (case-truenorth-pola-007, element 0), an OTHER slide of the deck,
and placed at the box it has there."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.environ.get("GEN") or os.path.join(HERE, "../../../../Generators")
STORE = os.environ.get("STORE") or os.path.join(HERE, "../../../../Objects/store")
sys.path.insert(0, GEN)
import objstore as O

cand = os.path.join(HERE, "candidate.pptx")
logo = O.element(O.get(STORE, "case-truenorth-pola-007"), 0)
box = [v / 914400 for v in logo["bbox"]]
O.place(cand, 1, logo, box, STORE, out_path=cand, colours="original")

# pptxgenjs writes an extra <a:pPr><a:buNone/> before every later run of a paragraph (a bullet item with a bold
# keyword); PowerPoint takes it as invalid and LibreOffice drops the bullet. Keep only each paragraph's first pPr.
import zipfile, shutil, re
tmp = cand + ".tmp"
with zipfile.ZipFile(cand) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        data = zin.read(it.filename)
        if it.filename.startswith("ppt/slides/slide") and it.filename.endswith(".xml"):
            s = data.decode("utf8")
            s = re.sub(r'(</a:r>)<a:pPr\b[^>]*?(?:/>|>.*?</a:pPr>)', r'\1', s)
            data = s.encode("utf8")
        zout.writestr(it, data)
shutil.move(tmp, cand)
