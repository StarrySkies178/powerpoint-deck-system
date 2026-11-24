// C07 scenario lines, Mindcraft deck as the style reference (deck-as-reference, leave-one-out).
// Layout: two halves (HALF2), panel boxes from layout_skeleton.py on Mindcraft slide 4 (two numbered halves,
// chart with an aligned CAGR column and a grey reading box). Each half: numbered sub-headline, italic unit line,
// native line chart (three scenarios, optimistic highlighted in the main colour), a value grid aligned to the
// chart's years with the CAGR / return column on the right (one circled value, as in Mindcraft 4), and the
// takeaways in a grey box.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
});
const C = P.C, F = P.THEME.bodyFontFace;
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || C.text, bold: !!o.bold,
  italic: !!o.italic, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0, isTextBox: true });
const rule = (x, y, w, color = "D5D5D5", width = 0.75) => slide.addShape("line", { x, y, w, h: 0, line: { color, width } });
const runs = (s) => String(s).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: C.navy } } : { text: p, options: {} }));

const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const SER = [{ name: "Optimistic", color: C.navy }, { name: "Base", color: C.g4 }, { name: "Crush", color: C.g2 }];
const Y = { sub: 1.39, unit: 1.92, chart: 2.26, chartH: 1.5, years: 3.8, row0: 4.08, rowH: 0.27, take: 5.6, takeEnd: 6.8 };

function panel(spec) {
  const { x, w, nameW, lastW } = spec;
  S.subhead(slide, spec.n, spec.headline, x, Y.sub, w);
  T(spec.unit, x, Y.unit, w, 0.3, { size: 14, italic: true });
  const gx = x + nameW, gw = w - nameW - lastW, cw = gw / YEARS.length, cx = (i) => gx + cw * (i + 0.5);
  // native line chart over the year columns (plot area = the columns, so points sit on the column centres)
  const { min, max } = spec.axis, py = (v) => Y.chart + Y.chartH * (1 - (v - min) / (max - min));
  slide.addChart(pres.ChartType.line, SER.map((s, k) => ({ name: s.name, labels: YEARS, values: spec.values[k] })), {
    x: gx, y: Y.chart, w: gw, h: Y.chartH, layout: { x: 0, y: 0, w: 1, h: 1 }, chartColors: SER.map((s) => s.color), lineSize: 2.25,
    lineDataSymbol: "circle", lineDataSymbolSize: 6, showLegend: false, showValue: false, valAxisHidden: true, catAxisHidden: true,
    valAxisMinVal: min, valAxisMaxVal: max, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false,
  });
  // start value (shared) left of the first point, end values right of the last point
  T(spec.fmt(spec.values[0][0]), cx(0) - 0.62, py(spec.values[0][0]) - 0.13, 0.5, 0.26, { align: "right" });
  SER.forEach((s, k) => { const v = spec.values[k][5];
    T(spec.fmt(v), cx(5) + 0.12, py(v) - 0.13, lastW + cw / 2 - 0.14, 0.26, { bold: true, color: k === 2 ? C.g4 : s.color }); });
  // year header = the chart's category axis
  rule(gx, Y.years, gw, "7E7E7E", 1);
  YEARS.forEach((yr, i) => T(yr, cx(i) - cw / 2 - 0.05, Y.years + 0.01, cw + 0.1, 0.26, { align: "center" }));
  // value grid: one row per scenario, swatch + name as the legend
  SER.forEach((s, k) => {
    const ry = Y.row0 + k * Y.rowH;
    T(s.name, x, ry, nameW, Y.rowH, { bold: true, color: k === 2 ? C.g4 : s.color });
    spec.values[k].forEach((v, i) => T(spec.fmt(v), cx(i) - cw / 2, ry, cw, Y.rowH, { align: "center", bold: k === 0 && i === 5, color: k === 0 ? C.navy : C.text }));
    rule(x, ry + Y.rowH, w - lastW - 0.05);
  });
  if (spec.extra) spec.extra({ x, gx, cw, cx, nameW, lastW, w });
  // reading of the exhibit: the takeaways in a grey box
  S.readingBox(slide, spec.takeaways, { x, y: Y.take, w, h: Y.takeEnd - Y.take }, { size: 14 });
}
const circle = (x, y, w, h) => slide.addShape("ellipse", { x, y, w, h, fill: { type: "none" }, line: { color: C.navy, width: 1.75 } });

// ---------- 1: top line ----------
panel({
  n: 1, x: 0.36, w: 6.08, nameW: 1.25, lastW: 0.85,
  headline: "Resilient growth under scenario analysis",
  unit: "CSS Top Line Scenario Analysis (¥ Bn)",
  axis: { min: 7.4, max: 18.8 }, fmt: (v) => v.toFixed(1),
  values: [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]],
  takeaways: [
    "Three cases all indicate **above-market growth** (7%)",
    "Under the optimistic case, **~17% 5-year** could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers",
  ],
  extra: ({ x, w, lastW }) => {
    const lx = x + w - lastW;
    T("CAGR", lx, Y.years - 0.27, lastW, 0.26, { align: "center", bold: true, underline: true });
    T("18-23E", lx, Y.years + 0.01, lastW, 0.26, { align: "center", size: 12 });
    ["17%", "12%", "8%"].forEach((c, k) => T(c, lx, Y.row0 + k * Y.rowH, lastW, Y.rowH, { align: "center", bold: k === 0, color: k === 0 ? C.navy : C.text }));
    circle(lx + 0.14, Y.row0 - 0.04, lastW - 0.28, Y.rowH + 0.08);
    // the benchmark the takeaway compares against: market growth (7%)
    const ry = Y.row0 + 3 * Y.rowH + 0.02;
    T("Market growth (benchmark)", x, ry, w - lastW, Y.rowH, { bold: true, size: 12, color: C.g4 });
    T("7%", lx, ry, lastW, Y.rowH, { align: "center", color: C.g4 });
    rule(x, ry + Y.rowH, w - 0.05, "7E7E7E", 1);
  },
});

// ---------- 2: capex ----------
panel({
  n: 2, x: 6.67, w: 6.21, nameW: 1.45, lastW: 0.6,
  headline: "Guaranteed financial feasibility",
  unit: "Required Annual Capex Scenario Analysis (¥ Mn)",
  axis: { min: 160, max: 322 }, fmt: (v) => String(v),
  values: [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]],
  takeaways: [
    "Increasing capital expenditure is required to support the **offline expansion strategy**",
    "Yearly capex accounts for **~20% of liquidity**, with **quick return (1.6yrs)**, indicating a good financial feasibility",
  ],
  extra: ({ x, cx, cw, w, lastW }) => {
    const ry = Y.row0 + 3 * Y.rowH + 0.02;
    T([{ text: "Capex burden" }, { text: "1", options: { superscript: true } }], x, ry, 1.48, Y.rowH, { bold: true, size: 12 });
    ["–", "26%", "22%", "20%", "19%", "17%"].forEach((v, i) => T(v, cx(i) - cw / 2, ry, cw, Y.rowH, { align: "center" }));
    rule(x, ry + Y.rowH, w - lastW - 0.05, "7E7E7E", 1);
    const r2 = ry + Y.rowH + 0.03;
    T([{ text: "Return on capex" }, { text: "2", options: { superscript: true } }, { text: " under base case" }], x, r2, 4.0, 0.32, { bold: true });
    T("~1.6 years", cx(4) - cw / 2, r2, 2 * cw, 0.32, { align: "center", bold: true, color: C.navy });
    circle(cx(4) - cw / 2 + 0.02, r2 - 0.03, 2 * cw - 0.04, 0.38);
  },
});

// note above the source line, as on the deck's other financial slides
T("Note: 1) Capex burden = Capex / cash flow from operations; 2) Return on capex = capex per store / avg. operational income per store", 0.36, 6.86, 12.5, 0.24, { size: 10, italic: true });

L.save(pres, __dirname + "/candidate.pptx");
