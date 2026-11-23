// C07 variant a: scenario line charts in the Mindcraft deck style (deck as reference, leave-one-out).
// Approach: Mindcraft style profile + generators (frame/crumb, numbered sub-headlines), HALF2 arrangement taken from the
// deck's other two-panel slides (Mindcraft 4 and 8: chip + headline + rule, italic exhibit title, CAGR column right of the
// chart with a red hand-drawn ring, grey reading box with bullets, red italic ratio row under a chart, note line over the source).
// Native line charts (editable data); build.py sets per-series label positions after the save.
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, P, S, prof } = L.start({
  ref: "Case-2019-Mindcraft", title: TITLE,
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
});
const C = P.C, FONT = prof.fonts.latin;
const RED = prof.roles.main, DARK = prof.roles.grey2, LIGHT = prof.roles.grey4, PANEL = prof.roles.panel;
const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const SER = ["Optimistic", "Base", "Crush"], COLS = [RED, DARK, LIGHT];

// tracker as the deck draws it (Mindcraft 4, 8, 10): bold italic 14 pt items on tab stops, red solid triangles between
// (P.frame's crumb has no italic and no separate triangle shapes, so it is drawn here)
const CRUMB = ["Market Analysis", "Growth Strategy", "Financial Forecasting"], CX = [0.36, 2.92, 5.58];
CRUMB.forEach((t, i) => slide.addText(t, { x: CX[i], y: 0.05, w: 2.5, h: 0.26, fontFace: FONT, fontSize: 14, bold: true, italic: true,
  color: i === 2 ? RED : LIGHT, margin: 0, valign: "middle", isTextBox: true }));
[2.43, 5.18].forEach((x) => slide.addShape("custGeom", { x, y: 0.07, w: 0.18, h: 0.25, fill: { color: RED }, line: { type: "none" },
  points: [{ x: 0, y: 0, moveTo: true }, { x: 0.18, y: 0.125 }, { x: 0, y: 0.25 }, { close: true }] }));
// deck frame furniture kept on its master: grey footer rule and the team logo (taken from the reference deck's master, original pixels)
slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });
async function addLogo() {
  const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs"))] }));
  const zip = await JSZip.loadAsync(require("fs").readFileSync(path.join(__dirname, "../../../../Templates/Case-2019-Mindcraft.pptx")));
  const rels = await zip.file("ppt/slideMasters/_rels/slideMaster1.xml.rels").async("string");
  const img = rels.match(/Target="\.\.\/media\/([^"]+\.png)"/)[1];
  const b64 = await zip.file("ppt/media/" + img).async("base64");
  slide.addImage({ data: "image/png;base64," + b64, x: 11.642, y: 7.175, w: 1.137, h: 0.325 });
}
const tb = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: 14, color: "000000", margin: 0, valign: "middle", isTextBox: true, ...o });

// panels (HALF2, as the deck's two-panel slides place them)
const top = 1.36, PL = { x: 0.37, w: 5.95 }, PR = { x: 6.67, w: 6.3 };
const boxY = 5.5, boxH = 1.42;

// line chart with a fixed plot area so the side column can sit level with the 2023E points
function lineChart(o) {
  const lay = { x: 0.03, y: 0.08, w: 0.94, h: o.h > 2.6 ? 0.8 : 0.74 };
  slide.addChart(pres.ChartType.line, o.series.map((v, i) => ({ name: SER[i], labels: YEARS, values: v })), {
    x: o.x, y: o.y, w: o.w, h: o.h, layout: lay, chartColors: COLS, lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showLegend: false, showValue: true, dataLabelPosition: "t", dataLabelFontSize: 12, dataLabelFontFace: FONT, dataLabelColor: "000000",
    dataLabelFormatCode: o.fmt, valAxisHidden: true, valAxisMinVal: o.min, valAxisMaxVal: o.max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: 12, catAxisLabelFontFace: FONT, catAxisLabelColor: "000000", catAxisLineShow: true, catAxisLineColor: "000000",
    catAxisMajorTickMark: "none", valAxisLineShow: false,
  });
  const px = o.x + o.w * lay.x, pw = o.w * lay.w, py = o.y + o.h * lay.y, ph = o.h * lay.h;
  return { colX: (j) => px + pw * (j + 0.5) / 6, colW: pw / 6, yOf: (v) => py + ph * (o.max - v) / (o.max - o.min), right: o.x + o.w };
}
function greyBox(x, w, bullets) {
  slide.addShape("rect", { x, y: boxY, w, h: boxH, fill: { color: PANEL }, line: { type: "none" } });
  slide.addText(bullets.map((b) => ({ text: b, options: { bullet: { indent: 14 }, breakLine: true, paraSpaceAfter: 3 } })),
    { x: x + 0.08, y: boxY + 0.05, w: w - 0.16, h: boxH - 0.1, fontFace: FONT, fontSize: 14, color: "000000", margin: 0.03, valign: "middle", isTextBox: true });
}

// ---------- panel 1: top line scenarios ----------
let h1 = S.subhead(slide, 1, "Resilient growth under scenario analysis", PL.x, top, PL.w);
tb("CSS Top Line Scenario Analysis (¥ Bn)", PL.x + 0.05, top + h1, PL.w, 0.32, { italic: true });
const top1 = [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]];
const c1 = lineChart({ x: PL.x, y: top + h1 + 0.4, w: 4.3, h: boxY - (top + h1 + 0.4) - 0.05, series: top1, min: 7.7, max: 18.9, fmt: "0.0" });
// CAGR column (deck form: bold underlined CAGR head, values level with the series' last points, key value ringed in red)
const cx = c1.right + 0.05, nameW = 1.0, cagrX = cx + nameW + 0.05, cagrW = PL.x + PL.w - cagrX;
tb([{ text: "CAGR", options: { bold: true, underline: { style: "sng" }, breakLine: true } }, { text: "18-23E" }], cagrX - 0.05, top + h1 - 0.04, cagrW + 0.1, 0.48, { align: "center", fontSize: 12 });
["17%", "12%", "8%"].forEach((v, i) => {
  const y = c1.yOf(top1[i][5]);
  tb(SER[i], cx, y - 0.14, nameW, 0.28, { fontSize: 12, color: i === 0 ? RED : "000000", bold: i === 0 });
  tb(v, cagrX, y - 0.14, cagrW, 0.28, { fontSize: 12, align: "center", bold: i === 0, color: i === 0 ? RED : "000000" });
});
// market growth as the yardstick the takeaway compares with (deck form: market CAGR row, Mindcraft 4)
const mY = c1.yOf(12.2) + 0.42;
slide.addShape("line", { x: cx, y: mY - 0.06, w: PL.x + PL.w - cx, h: 0, line: { color: LIGHT, width: 0.75, dashType: "dash" } });
tb("Market", cx, mY, nameW, 0.28, { fontSize: 12, italic: true, color: DARK });
tb("7%", cagrX, mY, cagrW, 0.28, { fontSize: 12, italic: true, align: "center", color: DARK });
slide.addShape("ellipse", { x: cagrX - 0.04, y: c1.yOf(18.2) - 0.24, w: cagrW + 0.08, h: 0.48, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
greyBox(PL.x, PL.w, [
  "Three cases all indicate above-market growth (7%)",
  "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers",
]);

// ---------- panel 2: capex scenarios ----------
let h2 = S.subhead(slide, 2, "Guaranteed financial feasibility", PR.x, top, PR.w);
tb("Required Annual Capex Scenario Analysis (¥ Mn)", PR.x + 0.05, top + h2, PR.w, 0.32, { italic: true });
const capex = [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]];
const rowY = 5.0, chY = top + h2 + 0.4;
const c2 = lineChart({ x: PR.x, y: chY, w: 4.65, h: rowY - chY - 0.02, series: capex, min: 150, max: 322, fmt: "0" });
const lx = c2.right + 0.08, rw = PR.x + PR.w - lx;
SER.forEach((s, i) => {
  const y = c2.yOf(capex[i][5]);
  slide.addShape("line", { x: lx, y, w: 0.22, h: 0, line: { color: COLS[i], width: 2.25 } });
  tb(s, lx + 0.3, y - 0.14, rw - 0.3, 0.28, { fontSize: 12, color: i === 0 ? RED : "000000", bold: i === 0 });
});
// return on capex: the one number that settles feasibility, ringed in red beside the chart (deck form: red ring, Mindcraft 4 and 5)
const rY = c2.yOf(capex[2][5]) + 0.45;
slide.addShape("line", { x: lx, y: rY - 0.12, w: rw, h: 0, line: { color: LIGHT, width: 0.75, dashType: "dash" } });
tb([{ text: "Return on Capex under base case" }, { text: "2", options: { superscript: true } }], lx, rY, rw, 0.66, { fontSize: 12, bold: true, italic: true, color: RED, valign: "top" });
tb("~1.6 years", lx + 0.1, rY + 0.74, rw - 0.2, 0.4, { fontSize: 14, bold: true, align: "center" });
slide.addShape("ellipse", { x: lx + 0.02, y: rY + 0.7, w: rw - 0.04, h: 0.48, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
// ratio row under the chart, level with the year columns (deck form: Mindcraft 8 "Pull-up ratio" row)
tb([{ text: "Capex burden" }, { text: "1", options: { superscript: true } }], PR.x, rowY, c2.colX(1) - c2.colW / 2 - PR.x + 0.05, 0.42, { fontSize: 12, bold: true, italic: true, color: RED });
["26%", "22%", "20%", "19%", "17%"].forEach((v, j) => tb(v, c2.colX(j + 1) - c2.colW / 2, rowY, c2.colW, 0.42, { fontSize: 12, bold: true, italic: true, color: RED, align: "center" }));
greyBox(PR.x, PR.w, [
  "Increasing capital expenditure is required to support the offline expansion strategy",
  "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility",
]);

// note over the source line (deck form: italic note line, Mindcraft 5 and 8)
tb("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  PL.x, 6.97, 12.5, 0.24, { fontSize: 10, italic: true, valign: "top" });

addLogo().catch((e) => console.warn("logo skipped:", e.message)).then(() => L.save(pres, __dirname + "/candidate.pptx"));
