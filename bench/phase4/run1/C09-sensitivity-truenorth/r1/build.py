# Adds the team logo (top right, above the red title band) that every slide of the reference deck carries.
# Taken from the deck's backup scenario slide (slide 23), the frame group's picture; runs after build.js in this folder.
import io, os
from pptx import Presentation
from pptx.util import Emu

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "../../../../../Templates/Case-2016-TrueNorth-Pola-China-growth.pptx")
OUT = os.path.join(HERE, "candidate.pptx")


def find_logo(shapes):
    for sh in shapes:
        if sh.shape_type == 6:
            r = find_logo(sh.shapes)
            if r is not None:
                return r
        elif sh.shape_type == 13 and sh.top < Emu(914400 * 0.2) and sh.left > Emu(914400 * 8):
            return sh
    return None


ref = Presentation(REF)
logo = find_logo(ref.slides[23 - 1].shapes)
deck = Presentation(OUT)
s = deck.slides[0]
if logo is not None:
    s.shapes.add_picture(io.BytesIO(logo.image.blob), logo.left, logo.top, logo.width, logo.height)
deck.save(OUT)
