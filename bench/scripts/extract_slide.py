"""extract_slide.py deck.pptx N out.pptx : keep only slide N (used for the scorer's self-check and the copy path)."""
import sys
from pptx import Presentation
def extract(src, n, out):
    p = Presentation(src); ids = p.slides._sldIdLst
    for i, s in reversed(list(enumerate(list(ids)))):
        if i != n - 1:
            p.part.drop_rel(s.rId); ids.remove(s)
    p.save(out)
if __name__ == "__main__": extract(sys.argv[1], int(sys.argv[2]), sys.argv[3])
