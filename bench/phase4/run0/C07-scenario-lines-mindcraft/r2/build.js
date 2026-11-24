// C07 rebuild 2: scenario lines in the Mindcraft deck style (deck as reference, leave-one-out).
// Approach: the deck's style profile (title, crumb, rule, Verdana, red/grey roles) through the harness; a HALF2 layout as on the
// deck's two-panel analysis slides (4, 5, 8, 13): numbered red chip + bold sub-headline + grey rule, italic unit line,
// grey-and-red figure with a CAGR column circled in red (form of slide 4), a ratio row under the figure (form of the
// "Pull-up ratio" row on slide 8), a red dashed callout (slides 5 and 7), grey reading box with round bullets (slides 4, 8, 18),
// italic note line above the source (slides 5, 8, 18). Charts are native line charts (editable data); labels are text boxes
// placed from the chart's fixed inner plot area.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
});
const C = P.C, F = "Verdana";
const RED = "C00000", DARK = "5C5C5C", MID = "A6A6A6", BLACK = "000000", GREY_BOX = "F1F1F1";

function t(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true, underline: o.underline ? { style: "sng" } : undefined });
}

// section tracker as the deck draws it: bold italic 14 pt, grey sections, the current one red, red triangles between
[["Market Analysis", 0.39, "A6A6A6"], ["Growth Strategy", 2.88, "A6A6A6"], ["Financial Forecasting", 5.56, RED]].forEach(([s, x, c]) =>
  t(s, x, 0.05, 2.6, 0.3, { size: 14, bold: true, italic: true, color: c, valign: "top" }));
[2.42, 5.18].forEach((x) => slide.addShape("triangle", { x, y: 0.07, w: 0.26, h: 0.26, rotate: 90, fill: { color: RED }, line: { type: "none" } }));
// source line in the layout's source placeholder, italic as on the deck's slides; thin grey rule above the footer
slide.addText([{ text: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg", options: { italic: true } }], { placeholder: "source" });
slide.addShape("line", { x: 0, y: 7.19, w: 13.333, h: 0, line: { color: "A6A6A6", width: 0.75 } });
// team mark before the page number, as on every slide of the deck (the logo picture is not in the framework: set as text)
t("MindCraft", 11.45, 7.2, 1.2, 0.26, { size: 12, bold: true, color: RED, align: "right" });

// numbered panel head as the deck draws it: red square with an italic white number, bold sentence, grey rule from the chip
function subhead(n, text, x, y, w) {
  slide.addShape("rect", { x, y, w: 0.35, h: 0.35, fill: { color: RED }, line: { type: "none" } });
  t(String(n), x, y, 0.35, 0.35, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center" });
  t(text, x + 0.43, y, w - 0.43, 0.35, { size: 14, bold: true });
  slide.addShape("line", { x: x + 0.35, y: y + 0.33, w: w - 0.35, h: 0, line: { color: "7E7E7E", width: 1.2 } });
  return 0.5;
}

const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const SER = [ // top to bottom: the optimistic case is the point, so it is red; the others grey
  { name: "Optimistic", color: RED, bold: true },
  { name: "Base", color: DARK },
  { name: "Crush", color: MID },
];

// one scenario line chart: native chart in a fixed inner plot area, value labels placed as text boxes
function scenarioChart(box, values, min, max, fmt, labelAll) {
  const lay = { x: 0.06, y: 0.04, w: 0.88, h: 0.8 };           // inner plot area as a share of the chart frame
  slide.addChart(pres.ChartType.line, SER.map((s, i) => ({ name: s.name, labels: YEARS, values: values[i] })), {
    x: box.x, y: box.y, w: box.w, h: box.h, layout: lay,
    chartColors: SER.map((s) => s.color), lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: min, valAxisMaxVal: max,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontFace: F, catAxisLabelFontSize: 12, catAxisLabelColor: BLACK, catAxisLineShow: true, catAxisLineColor: MID,
  });
  const px = box.x + lay.x * box.w, pw = lay.w * box.w, py = box.y + lay.y * box.h, ph = lay.h * box.h;
  const X = (i) => px + (i + 0.5) * pw / YEARS.length, Y = (v) => py + ph * (1 - (v - min) / (max - min));
  // shared start value, once, left of the first point
  t(fmt(values[0][0]), X(0) - 0.62, Y(values[0][0]) - 0.14, 0.5, 0.28, { size: 12, align: "right" });
  // every point of the top line above it and of the bottom line below it; the middle line only at its end
  values.forEach((vs, s) => vs.forEach((v, i) => {
    if (i === 0) return;
    const last = i === vs.length - 1;
    if (!labelAll && !last) return;
    if (s === 1 && !last) return;
    const above = s === 0 || (s === 1 && last && false);
    let y = above ? Y(v) - 0.32 : s === 2 ? Y(v) + 0.06 : Y(v) - 0.14;
    if (last) y = Y(v) - 0.14;
    const x = last ? X(i) + 0.1 : X(i) - 0.3;
    t(fmt(v), x, y, last ? 0.6 : 0.6, 0.28, { size: 12, bold: last && SER[s].bold, color: last && s === 0 ? RED : BLACK, align: last ? "left" : "center" });
  }));
  return { X, Y };
}

// ---------- geometry (HALF2 as on the deck's two-panel slides) ----------
const B = P.BODY;
const GAP = 0.3, LW = 6.1;
const left = { x: B.x, y: B.y, w: LW, h: B.h }, right = { x: B.x + LW + GAP, y: B.y, w: B.x + B.w - (B.x + LW + GAP) - 0.2, h: B.h };
const READ_Y = 5.42, READ_H = 1.38;

// ---------- panel 1: top line ----------
let y = left.y + subhead(1, "Resilient growth under scenario analysis", left.x, left.y, left.w);
t("CSS Top Line Scenario Analysis (¥ Bn)", left.x, y, left.w, 0.3, { italic: true });
const top = [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]];
const c1 = { x: left.x + 0.35, y: y + 0.4, w: 3.5, h: READ_Y - 0.12 - (y + 0.4) };
const m1 = scenarioChart(c1, top, 7, 20, (v) => v.toFixed(1), true);
// legend + CAGR column (slide 4 form: underlined "CAGR", period under it, the key row circled in red)
const nx = m1.X(5) + 0.72, cx = left.x + left.w - 0.85;
t("CAGR", cx, y + 0.02, 0.85, 0.26, { size: 14, bold: true, underline: true, align: "center" });
t("18-23E", cx, y + 0.3, 0.85, 0.26, { size: 12, align: "center" });
const cagr = ["17%", "12%", "8%"];
SER.forEach((s, i) => {
  const yy = m1.Y(top[i][5]) - 0.14;
  t(s.name, nx, yy, cx - nx, 0.28, { size: 12, bold: !!s.bold, color: s.bold ? RED : BLACK });
  t(cagr[i], cx, yy, 0.85, 0.28, { size: 14, bold: !!s.bold, color: s.bold ? RED : BLACK, align: "center" });
});
slide.addShape("ellipse", { x: cx - 0.02, y: m1.Y(top[0][5]) - 0.26, w: 0.89, h: 0.52, fill: { type: "none" }, line: { color: RED, width: 1.75 } });

// ---------- panel 2: capex ----------
let y2 = right.y + subhead(2, "Guaranteed financial feasibility", right.x, right.y, right.w);
t("Required Annual Capex Scenario Analysis (¥ Mn)", right.x, y2, right.w, 0.3, { italic: true });
const capex = [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]];
const c2 = { x: right.x + 0.8, y: y2 + 0.38, w: 3.9, h: 2.12 };
const m2 = scenarioChart(c2, capex, 120, 320, (v) => String(v), true);
const nx2 = m2.X(5) + 0.72;
SER.forEach((s, i) => t(s.name, nx2, m2.Y(capex[i][5]) - 0.14, right.x + right.w - nx2, 0.28, { size: 12, bold: !!s.bold, color: s.bold ? RED : BLACK }));
// capex burden row under the years 2019-2023E (slide 8 "Pull-up ratio" form)
const ry = c2.y + c2.h + 0.04;
t("Capex burden¹", right.x, ry, m2.X(1) - 0.32 - right.x, 0.3, { size: 12, bold: true, italic: true, color: RED });
["26%", "22%", "20%", "19%", "17%"].forEach((v, i) => t(v, m2.X(i + 1) - 0.32, ry, 0.64, 0.3, { size: 12, bold: true, italic: true, align: "center" }));
// return on capex callout (red dashed box, slides 5 and 7)
const cy = ry + 0.4;
slide.addShape("rect", { x: right.x, y: cy, w: right.w, h: 0.42, fill: { type: "none" }, line: { color: RED, width: 1.25, dashType: "dash" } });
t([{ text: "Return on capex under base case²: ", options: { bold: true, italic: true, color: RED } }, { text: "~1.6 years", options: { bold: true, color: BLACK } }],
  right.x + 0.12, cy, right.w - 0.24, 0.42, { size: 12 });

// ---------- readings: grey boxes with round bullets ----------
function reading(box, items) {
  slide.addShape("rect", { ...box, fill: { color: GREY_BOX }, line: { type: "none" } });
  slide.addText(items.map((s, i) => ({ text: s, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1 } })),
    { x: box.x + 0.08, y: box.y + 0.05, w: box.w - 0.16, h: box.h - 0.1, fontFace: F, fontSize: 14, color: BLACK, valign: "middle", margin: 0, isTextBox: true, paraSpaceAfter: 2 });
}
reading({ x: left.x, y: READ_Y, w: left.w, h: READ_H }, [
  "Three cases all indicate above-market growth (7%)",
  "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers",
]);
reading({ x: right.x, y: READ_Y, w: right.w, h: READ_H }, [
  "Increasing capital expenditure is required to support the offline expansion strategy",
  "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility",
]);

// note line above the source (italic, as on the deck's other slides)
t("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  B.x, 6.88, 12.4, 0.24, { size: 10, italic: true });

L.save(pres, __dirname + "/candidate.pptx");
