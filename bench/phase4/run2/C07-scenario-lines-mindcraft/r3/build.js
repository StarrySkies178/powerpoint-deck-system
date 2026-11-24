// C07 scenario lines, deck as reference (Case-2019-Mindcraft), leave-one-out build.
// Approach: the deck's style profile through the harness (title, rule, source, page number, Verdana, red + greys),
// panel sub-headlines drawn from the profile's panel entry (chip, rule from the chip's edge), two HALF2 panels as in the
// deck's chart slides (Mindcraft 4 and 8: italic chart header, legend top left inside the chart, CAGR column with the
// circled value, a ratio row under the chart like the "Pull-up ratio" row, grey reading box with bullets at body size).
// Charts are native line charts (editable data); one line chart per series in one plot so each series
// keeps its own label position.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, P, S, HOUSE, prof } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
});
const C = P.C, F = P.THEME.bodyFontFace;
const RED = prof.roles.main, DARK = prof.roles.grey2, MID = prof.roles.grey3, LIGHT = prof.roles.grey4, PANEL = prof.roles.panel;
const BODY_PT = prof.body.pt, LABEL_PT = prof.body.label_pt;

// ---- breadcrumb as the deck draws it: bold italic section names, red triangles between, current one red
(function crumb(items, current) {
  const cs = prof.crumb; let x = cs.x;
  const widths = items.map((t) => t.length * cs.pt * 0.62 / 72 + 0.15);
  items.forEach((t, i) => {
    if (i) { slide.addShape("triangle", { x: x + 0.12, y: cs.y + 0.07, w: 0.2, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } }); x += 0.5; }
    slide.addText(t, { x, y: cs.y, w: widths[i], h: 0.32, fontFace: F, fontSize: cs.pt, bold: true, italic: true, color: i === current ? RED : LIGHT, margin: 0, valign: "middle" });
    x += widths[i];
  });
})(["Market Analysis", "Growth Strategy", "Financial Forecasting"], 2);

const years = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const SER = [
  { name: "Optimistic", colour: RED },
  { name: "Base", colour: DARK },
  { name: "Crush", colour: LIGHT },
];

// native line chart, one line type per series so each series has its own data-label position
function scenarioChart(box, values, fmt, min, max, plot, pos) {
  const types = SER.map((s, i) => ({
    type: pres.ChartType.line,
    data: [{ name: s.name, labels: years, values: values[i] }],
    options: { chartColors: [s.colour], lineSize: i === 0 ? 2.5 : 2, lineDataSymbol: "circle", lineDataSymbolSize: 6,
      showValue: true, dataLabelPosition: pos[i], dataLabelColor: C.text, dataLabelFontSize: BODY_PT,
      dataLabelFontFace: F, dataLabelFormatCode: fmt },
  }));
  slide.addChart(types, { ...box, layout: plot, showLegend: false, valAxisHidden: true, valAxisMinVal: min, valAxisMaxVal: max,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontSize: BODY_PT, catAxisLabelFontFace: F, catAxisLabelColor: C.text,
    catAxisLineShow: true, catAxisLineColor: MID, valAxisLineShow: false });
}
// y (inches) of a value inside the chart box, from the plot layout
const yOf = (box, plot, min, max, v) => box.y + box.h * (plot.y + plot.h * (1 - (v - min) / (max - min)));

// panel sub-headline as the deck draws it: red square chip with the number in bold italic white, bold headline,
// grey rule from the chip's right edge along its bottom (sizes from the profile's panel entry)
function subhead(n, text, x, y, w) {
  const ps = prof.panel, s = ps.size;
  slide.addShape("rect", { x, y, w: s, h: s, fill: { color: ps.fill }, line: { type: "none" } });
  slide.addText(String(n), { x, y, w: s, h: s, fontFace: F, fontSize: ps.chip_pt, bold: true, italic: true, color: ps.text, align: "center", valign: "middle", margin: 0 });
  slide.addText(text, { x: x + s + 0.1, y, w: w - s - 0.1, h: s, fontFace: F, fontSize: ps.pt, bold: true, color: ps.colour, valign: "middle", margin: 0 });
  slide.addShape("line", { x: x + s, y: y + s, w: w - s, h: 0, line: { color: ps.rule[0], width: ps.rule[1] } });
  return s + 0.14;
}
function chartHeader(text, x, y, w) {
  slide.addText(text, { x, y, w, h: 0.32, fontFace: F, fontSize: BODY_PT, italic: true, color: C.text, margin: 0, valign: "middle" });
}
function readingBox(bullets, box) {
  slide.addShape("rect", { ...box, fill: { color: PANEL }, line: { type: "none" } });
  slide.addText(bullets.map((b) => ({ text: b, options: { bullet: { indent: 12 }, breakLine: true } })),
    { x: box.x + 0.08, y: box.y + 0.04, w: box.w - 0.16, h: box.h - 0.08, fontFace: F, fontSize: BODY_PT, color: C.text, margin: 0.02, valign: "middle", paraSpaceAfter: 2 });
}
// legend in the empty upper-left corner of the plot (deck form: the legend sits inside the chart area, top left)
function legend(x, y) {
  SER.forEach((s, i) => {
    const ly = y + i * 0.26;
    slide.addShape("line", { x, y: ly + 0.135, w: 0.34, h: 0, line: { color: s.colour, width: i === 0 ? 2.5 : 2 } });
    slide.addShape("ellipse", { x: x + 0.12, y: ly + 0.085, w: 0.1, h: 0.1, fill: { color: s.colour }, line: { type: "none" } });
    slide.addText(s.name, { x: x + 0.42, y: ly, w: 1.4, h: 0.27, fontFace: F, fontSize: BODY_PT, color: C.text, margin: 0, valign: "middle" });
  });
}

// ================= layout (HALF2, measured from the deck's two-panel chart slides)
const B = P.BODY, gap = 0.3, half = (B.w - gap) / 2;
const P1 = { x: B.x, y: B.y, w: half, h: B.h }, P2 = { x: B.x + half + gap, y: B.y, w: half, h: B.h };
const READ_H = 1.22, readY = B.y + B.h - READ_H - 0.3;           // reading boxes aligned across the two panels, note line under them

// ---------- panel 1: scenario lines + CAGR column at the line ends, the optimistic CAGR circled (deck form: circled CAGR)
let y1 = P1.y + subhead(1, "Resilient growth under scenario analysis", P1.x, P1.y, P1.w);
chartHeader("CSS Top Line Scenario Analysis (\u00A5 Bn)", P1.x, y1, P1.w - 1.0);
const top = [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]];
const cw1 = 0.9, c1 = { x: P1.x, y: y1 + 0.34, w: P1.w - cw1 - 0.05, h: readY - (y1 + 0.34) - 0.1 };
const pl1 = { x: 0.03, y: 0.07, w: 0.94, h: 0.8 }, min1 = 7.6, max1 = 19.2;
scenarioChart(c1, top, "0.0", min1, max1, pl1, ["t", "t", "b"]);
legend(P1.x + 0.1, y1 + 0.5);
const cx1 = P1.x + P1.w - cw1;
slide.addText([{ text: "CAGR", options: { bold: true, underline: { style: "sng" }, breakLine: true } }, { text: "18-23E" }],
  { x: cx1, y: y1, w: cw1, h: 0.55, fontFace: F, fontSize: BODY_PT, color: C.text, align: "center", margin: 0, valign: "top" });
const ys1 = [18.2, 14.6, 12.2].map((v) => yOf(c1, pl1, min1, max1, v));
["17%", "12%", "8%"].forEach((v, i) => slide.addText(v, { x: cx1, y: ys1[i] - 0.15, w: cw1, h: 0.3, fontFace: F, fontSize: BODY_PT, color: i === 0 ? RED : C.text, bold: i === 0, margin: 0, align: "center", valign: "middle" }));
slide.addShape("ellipse", { x: cx1 + 0.02, y: ys1[0] - 0.24, w: cw1 - 0.04, h: 0.48, fill: { type: "none" }, line: { color: RED, width: 2 } });
readingBox([
  "Three cases all indicate above-market growth (7%)",
  "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers",
], { x: P1.x, y: readY, w: P1.w, h: READ_H });

// ---------- panel 2: capex lines + ratio rows under the columns (deck form: the "Pull-up ratio" row under a chart)
let y2 = P2.y + subhead(2, "Guaranteed financial feasibility", P2.x, P2.y, P2.w);
chartHeader("Required Annual Capex Scenario Analysis (\u00A5 Mn)", P2.x, y2, P2.w);
const capex = [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]];
const ROW_H = 0.34, ROW1_H = 0.34, rowsY = readY - 0.1 - ROW1_H - ROW_H - 0.02;
const lw2 = 1.0, c2 = { x: P2.x + lw2 - 0.25, y: y2 + 0.34, w: P2.w - lw2 + 0.3, h: rowsY - (y2 + 0.34) };
const pl2 = { x: 0.03, y: 0.06, w: 0.94, h: 0.79 }, min2 = 150, max2 = 335;
scenarioChart(c2, capex, "0", min2, max2, pl2, ["t", "b", "b"]);
legend(P2.x + 0.1, y2 + 0.4);
const colX = (j) => c2.x + c2.w * (pl2.x + pl2.w * (j + 0.5) / years.length);
slide.addText([{ text: "Capex burden" }, { text: "1", options: { superscript: true } }],
  { x: P2.x, y: rowsY, w: colX(1) - 0.42 - P2.x, h: ROW1_H, fontFace: F, fontSize: BODY_PT, bold: true, italic: true, color: RED, margin: 0, valign: "middle" });
["26%", "22%", "20%", "19%", "17%"].forEach((v, k) => slide.addText(v, { x: colX(k + 1) - 0.4, y: rowsY, w: 0.8, h: ROW1_H, fontFace: F, fontSize: BODY_PT, bold: true, italic: true, color: RED, align: "center", margin: 0, valign: "middle" }));
const r2 = rowsY + ROW1_H + 0.02;
slide.addText([{ text: "Return on Capex under base case" }, { text: "2", options: { superscript: true } }, { text: ": " }, { text: "~1.6 years", options: { bold: true, color: RED } }],
  { x: P2.x, y: r2, w: P2.w, h: ROW_H, fontFace: F, fontSize: BODY_PT, italic: true, color: C.text, margin: 0, valign: "middle" });
readingBox([
  "Increasing capital expenditure is required to support the offline expansion strategy",
  "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility",
], { x: P2.x, y: readY, w: P2.w, h: READ_H });

// ---------- note line (deck: italic note above the source line)
slide.addText("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  { x: B.x, y: readY + READ_H + 0.04, w: B.w, h: 0.24, fontFace: F, fontSize: 10, italic: true, color: C.text, margin: 0, valign: "middle" });

L.save(pres, __dirname + "/candidate.pptx").then(() => console.log("saved"));
