# common.py: places the stored objects of case19-mindcraft-014 into candidate.pptx (made by build.js) and
# puts the native charts' points on the category ticks (crossBetween midCat), as the original draws them.
# Used by A/build.py and B/build.py with their own texts.
import os, re, sys, zipfile
ROOT = "/home/claude/powerpoint-deck-system"
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O
from lxml import etree
A_ = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P_ = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
ST = os.path.join(ROOT, "Objects/store")
EMU = 914400

# element index (after ungroup) of case19-mindcraft-014 -> what it is
CRUMB_ARROWS = (0, 1)
HEAD1 = (2, 3, 4)          # chip "1", grey rule, heading text
HEAD2 = (5, 6, 7)
CHART_TITLE1, CHART_TITLE2 = 23, 28
TAKE1, TAKE2 = 27, 36
RETURN_LABEL = 37


def run(pptx, texts, log):
    slide = O.get(ST, "case19-mindcraft-014")

    def put(i, text=None, recolour=None, name="", width_of=None):
        el = O.element(slide, i)
        # element() keeps the whole slide's media list, so place() would copy every marker PNG into the deck
        # (linked, never drawn); keep only media this element really uses
        el["media"] = [m for m in el.get("media", []) if ("MEDIA:" + m) in el["xml"]]
        if width_of is not None and text:
            # the rebuilt heading box is only as wide as the original words: give new words the width of the panel rule
            rule = O.element(slide, width_of)["bbox"]
            f = etree.fromstring(el["xml"]); ext = next(f.iter(A_ + "ext")); ext.set("cx", str(rule[0] + rule[2] - el["bbox"][0]))
            el["xml"] = etree.tostring(f, encoding="unicode"); el["bbox"][2] = int(ext.get("cx"))
        if recolour: el = O.recolour(el, recolour)
        if text: el = O.set_texts(el, text)   # paragraph i keeps the format of the box's own paragraph i
        X, Y, W, H = [v / EMU for v in el["bbox"]]
        r = O.place(pptx, 1, el, (X, Y, W, H), ST, colours="original")
        log.append((f"case19-mindcraft-014 e{i}", name, "refilled" if text else "as is", r["warnings"]))

    for i in CRUMB_ARROWS: put(i, name="crumb arrow")
    for (chip, rule, head), (n, t) in zip((HEAD1, HEAD2), texts["heads"]):
        put(chip, [n] if n else None, name="panel chip")
        put(rule, name="panel rule")
        put(head, [t] if t else None, name="panel heading", width_of=rule)
    put(CHART_TITLE1, [texts["chart_titles"][0]], name="chart title 1")
    put(CHART_TITLE2, [texts["chart_titles"][1]], name="chart title 2")
    # takeaway boxes: the store maps their light grey fill to bg2 (D5D5D5, the crush-line grey); the original is the panel grey
    put(TAKE1, [texts["take"][0]], recolour={"bg2": "#F1F1F1"}, name="takeaway 1")
    put(TAKE2, [texts["take"][1]], recolour={"bg2": "#F1F1F1"}, name="takeaway 2")
    put(RETURN_LABEL, [texts["return_label"]] if texts.get("return_label") else None, name="return label")

    # native charts: points on the ticks (first and last point on the plot edges)
    z = zipfile.ZipFile(pptx); files = {n: z.read(n) for n in z.namelist()}; z.close()
    for n in files:
        if re.match(r"ppt/charts/chart\d+\.xml$", n):
            files[n] = files[n].replace(b'<c:crossBetween val="between"/>', b'<c:crossBetween val="midCat"/>')
    with zipfile.ZipFile(pptx, "w", zipfile.ZIP_DEFLATED) as zo:
        for n, d in files.items(): zo.writestr(n, d)
    for row in log: print(*row)
