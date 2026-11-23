# Place slide 14's own chevron row (del-014) with its original colours and refill it; page number 14.
import os, sys, re, zipfile, shutil
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named

cand = "candidate.pptx"
# 4 chevrons: the first keeps its fixed label "Text, Arial 14-pt bold" (highlighted); the 3 slots are the others
place_named(cand, "del-014", texts=["Text", "Text", "Text"], colours="original")

# the reference is slide 14 of its deck: start numbering at 14 so the slide-number field shows 14
tmp = cand + ".tmp"
with zipfile.ZipFile(cand) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = x.replace("<p:presentation ", '<p:presentation firstSlideNum="14" ', 1)
            data = x.encode("utf8")
        if it.filename == "ppt/slides/slide1.xml":   # renderers that ignore firstSlideNum: show 14 as text
            x = data.decode("utf8")
            x = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)?(?:<a:pPr[^>]*/>)?<a:t>\d+</a:t></a:fld>',
                       lambda m: "<a:r>" + (m.group(1) or "") + "<a:t>14</a:t></a:r>", x)
            data = x.encode("utf8")
        zo.writestr(it, data)
shutil.move(tmp, cand)
