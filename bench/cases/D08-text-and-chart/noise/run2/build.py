# D08 attempt 2: place slide 59's own stored chart object (del-059) with its original colours, refill its data,
# then start page numbering at 59 so the slide-number field reads 59 as in the reference.
import os, sys, re, zipfile, shutil
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../lib"))
from place_named import place_named

HERE = os.path.dirname(os.path.abspath(__file__))
cand = os.path.join(HERE, "candidate.pptx")
place_named(cand, "del-059",
            chart=(["2009", "2010", "2011", "2012"],
                   [("Label 1", [4.3, 2.5, 3.5, 4.5]),
                    ("Label 2", [2.4, 4.4, 1.8, 2.8]),
                    ("Label 3", [2.0, 2.0, 3.0, 5.0])]),
            colours="original")

# page number 59: presentation-level first slide number
tmp = cand + ".tmp"
with zipfile.ZipFile(cand) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        data = zin.read(it.filename)
        if it.filename == "ppt/presentation.xml":
            x = data.decode("utf8")
            x = re.sub(r'\sfirstSlideNum="\d+"', "", x)
            x = re.sub(r"<p:presentation\b", '<p:presentation firstSlideNum="59"', x, count=1)
            data = x.encode("utf8")
        zout.writestr(it, data)
shutil.move(tmp, cand)
