# build.py: runs after build.js (cwd = this folder). Gives each scenario line its own data-label position and drops
# labels that would sit on top of another series' label, which pptxgenjs cannot set per series.
# chart order = order added in build.js: chart 1 top line, chart 2 capex. Per series: (default position, {point index: position or None})
import zipfile, shutil, re, os

POS = {
    1: [("t", {}), ("t", {0: None, 1: "r", 2: "r"}), ("b", {0: None})],
    2: [("t", {}), ("b", {0: None}), ("b", {0: None})],
}

src = "candidate.pptx"; tmp = "candidate.tmp.pptx"
NS_C = "http://schemas.openxmlformats.org/drawingml/2006/chart"

def fix(xml, spec):
    sers = list(re.finditer(r"<c:ser>.*?</c:ser>", xml, re.S))
    out, last = [], 0
    for i, m in enumerate(sers):
        s = m.group(0)
        if i < len(spec):
            pos, pts = spec[i]
            s = re.sub(r'<c:dLblPos val="[a-zA-Z]+"/>', '<c:dLblPos val="%s"/>' % pos, s)
            extra = ""
            for idx, p in sorted(pts.items()):
                if p is None:
                    extra += '<c:dLbl><c:idx val="%d"/><c:delete val="1"/></c:dLbl>' % idx
                else:
                    extra += ('<c:dLbl><c:idx val="%d"/><c:dLblPos val="%s"/><c:showLegendKey val="0"/><c:showVal val="1"/>'
                              '<c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbl>') % (idx, p)
            s = s.replace("<c:dLbls>", "<c:dLbls>" + extra, 1)
        out.append(xml[last:m.start()]); out.append(s); last = m.end()
    out.append(xml[last:])
    return "".join(out)

with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    charts = sorted([n for n in zin.namelist() if re.match(r"ppt/charts/chart\d+\.xml$", n)], key=lambda n: int(re.findall(r"\d+", n)[0]))
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename in charts:
            k = charts.index(item.filename) + 1
            if k in POS:
                data = fix(data.decode("utf8"), POS[k]).encode("utf8")
        zout.writestr(item, data)
shutil.move(tmp, src)
print("labels set on", len(POS), "charts")
