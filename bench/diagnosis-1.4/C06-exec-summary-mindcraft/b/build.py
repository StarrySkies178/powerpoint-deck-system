# C06 variant b: turn the full-bleed background rectangle into a linear fade from the left edge to the right edge.
# pptxgenjs has no gradient fill, so build.js draws it solid and this step sets the gradient (editable in PowerPoint).
# End colours are the deck's own neutrals (Style/refs/Case-2019-Mindcraft.profile.json, neutrals_ranked).
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import PP_PLACEHOLDER

LEFT, RIGHT = "FFFFFF", "A6A6A6"
prs = Presentation("candidate.pptx")
for shp in prs.slides[0].shapes:
    if shp.name == "background fade":
        f = shp.fill
        f.gradient()
        f.gradient_angle = 0          # 0 degrees = left to right
        st = f.gradient_stops
        st[0].position, st[0].color.rgb = 0.0, RGBColor.from_string(LEFT)
        st[1].position, st[1].color.rgb = 1.0, RGBColor.from_string(RIGHT)
# the layout's page number and empty source placeholder are copied onto the slide above the background;
# the slide has neither (no page number, no source line), so drop them
for shp in list(prs.slides[0].shapes):
    if shp.is_placeholder and shp.placeholder_format.type in (PP_PLACEHOLDER.SLIDE_NUMBER, PP_PLACEHOLDER.BODY) and not shp.text_frame.text.strip(" 0123456789"):
        shp._element.getparent().remove(shp._element)
prs.save("candidate.pptx")
