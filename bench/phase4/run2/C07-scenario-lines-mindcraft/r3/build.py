# build.py: runs after build.js (working directory = this folder).
# pptxgenjs gives data labels one position per series; three scenario lines share their first point and run close
# in the first years, so a few labels are set per point here (OOXML <c:dLbl>): the shared start value is shown once,
# and a crowded label is moved beside its point. Chart data and every other label stay as built.
import re, zipfile, shutil, os

PPTX = "candidate.pptx"
# chart part -> series idx -> {point idx: "delete" or a dLblPos value}
EDITS = {
    "ppt/charts/chart1.xml": {1: {0: "delete", 1: "r"}, 2: {0: "delete"}},
    "ppt/charts/chart2.xml": {1: {0: "delete"}, 2: {0: "delete"}},
}

# series whose labels get a white fill, so a line passing under a label does not cut through its digits
WHITE = {"ppt/charts/chart1.xml": {1}, "ppt/charts/chart2.xml": {1}}
FILL = '<c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></c:spPr>'

def edit_series(ser, pts, white=False):
    if white:
        ser = re.sub(r'(<c:dLbls><c:numFmt [^>]*/>)', lambda m: m.group(1) + FILL, ser, count=1)
    m = re.search(r"<c:dLbls>(.*?)</c:dLbls>", ser, re.S)
    body = m.group(1)
    numfmt = re.search(r"<c:numFmt [^>]*/>", body).group(0)
    txpr = (FILL if white else "") + re.search(r"<c:txPr>.*?</c:txPr>", body, re.S).group(0)
    out = ""
    for i, how in sorted(pts.items()):
        if how == "delete":
            out += f'<c:dLbl><c:idx val="{i}"/><c:delete val="1"/></c:dLbl>'
        else:
            out += (f'<c:dLbl><c:idx val="{i}"/>{numfmt}{txpr}<c:dLblPos val="{how}"/><c:showLegendKey val="0"/><c:showVal val="1"/>'
                    '<c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbl>')
    return ser[:m.start(1)] + out + ser[m.start(1):]

def edit_chart(xml, edits, white):
    def sub(m):
        ser = m.group(0)
        idx = int(re.search(r'<c:idx val="(\d+)"/>', ser).group(1))
        return edit_series(ser, edits.get(idx, {}), idx in white) if (idx in edits or idx in white) else ser
    return re.sub(r"<c:ser>.*?</c:ser>", sub, xml, flags=re.S)

tmp = PPTX + ".tmp"
with zipfile.ZipFile(PPTX) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename in EDITS:
            data = edit_chart(data.decode("utf8"), EDITS[item.filename], WHITE.get(item.filename, set())).encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, PPTX)
print("labels set per point")
