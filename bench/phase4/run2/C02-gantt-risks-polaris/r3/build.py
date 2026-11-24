# Footer furniture of the reference deck, which the harness frame does not draw: the grey rule over the
# source line and the PANDORA | Polaris logo pair (pictures with a divider), copied from the deck's own
# financial-analysis page (the one after the target), plus the page number from the prompt.
import copy, io, re, zipfile, shutil, os
from pptx import Presentation

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "../../../../../Templates/Case-2019-Polaris.pptx")
OUT = os.path.join(HERE, "candidate.pptx")
PAGE = "16"   # page number given in prompt.md
FOOTER = {"object 3", "object 5", "object 6", "object 7"}   # rule, two logos, divider

ref = Presentation(REF)
donor = ref.slides[16]
deck = Presentation(OUT)
target = deck.slides[0]
for sh in donor.shapes:
    if sh.name not in FOOTER:
        continue
    el = copy.deepcopy(sh._element)
    for blip in el.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}blip"):
        rid = blip.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")
        blob = donor.part.related_part(rid).blob
        _, new_rid = target.part.get_or_add_image_part(io.BytesIO(blob))
        blip.set("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed", new_rid)
    target.shapes._spTree.append(el)
deck.save(OUT)

# page number: the slide-number field would read 1 in a one-page file; firstSlideNum fixes it in PowerPoint,
# and the field on the page is turned into plain text so every renderer shows the same number
tmp = OUT + ".tmp"
with zipfile.ZipFile(OUT) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for item in zi.infolist():
        data = zi.read(item.filename)
        if item.filename == "ppt/presentation.xml":
            s = data.decode("utf8")
            s = re.sub(r'\sfirstSlideNum="\d+"', "", s)
            s = s.replace("<p:presentation ", '<p:presentation firstSlideNum="%s" ' % PAGE, 1)
            data = s.encode("utf8")
        if item.filename == "ppt/slides/slide1.xml":
            s = data.decode("utf8")
            s = re.sub(r'<a:fld [^>]*type="slidenum">(.*?)</a:fld>',
                       lambda m: "<a:r>" + re.sub(r"<a:t>.*?</a:t>", "<a:t>%s</a:t>" % PAGE, m.group(1)) + "</a:r>", s, flags=re.S)
            data = s.encode("utf8")
        zo.writestr(item, data)
shutil.move(tmp, OUT)
