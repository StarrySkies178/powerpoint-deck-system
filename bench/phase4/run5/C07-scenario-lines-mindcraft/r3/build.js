// C07 rebuild (run5 r3): two scenario line charts in the Mindcraft deck style (deck as reference, leave-one-out).
// Layout HALF2, taken from the deck's other two-panel analysis slides (Mindcraft 4, 5, 7, 8): numbered chip + bold
// sub-headline over a grey rule, italic chart title, chart with a CAGR column at its right (Mindcraft 4), a metric row
// under the chart in red italic (the "Pull-up ratio" row of Mindcraft 8), a red ring on the key value (Mindcraft 4, 5),
// and a grey reading box with bullets under each panel (Mindcraft 4, 8). Note line above the source (Mindcraft 5, 8).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
});
const C = P.C, FONT = "Verdana";
const RED = C.navy, DARK = "5C5C5C", LIGHT = "A6A6A6";   // main colour for the case the panel's reading is about; greys for the others
const years = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || C.text, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true, underline: o.underline ? { style: "sng" } : undefined });

// one panel: chart + end values + CAGR column; returns the plot geometry so rows under the chart can align with the years
function scenarioChart(box, spec) {
  // chart box, then the end values (and the CAGR column) on its right; the case names sit as a legend in the empty
  // upper-left corner of the plot (legend form of Mindcraft 4 panel 1)
  const vmin = spec.min, vmax = spec.max, cw = box.w - spec.side;
  const lay = spec.lay || { x: 0.04, y: 0.04, w: 0.92, h: 0.82 };          // plot area (inner) as a share of the chart box
  const data = spec.series.map((s) => ({ name: s.name, labels: years, values: s.values }));
  slide.addChart(pres.ChartType.line, data, {
    x: box.x, y: box.y, w: cw, h: box.h, chartColors: spec.series.map((s) => s.color), lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 7,
    showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: vmin, valAxisMaxVal: vmax, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: 14, catAxisLabelColor: C.text, catAxisLabelFontFace: FONT, catAxisLineShow: false, layout: lay,
  });
  const px = (i) => box.x + cw * (lay.x + lay.w * (i + 0.5) / years.length);
  const py = (v) => box.y + box.h * (lay.y + lay.h * (1 - (v - vmin) / (vmax - vmin)));
  const v0 = spec.series[0].values[0];                                       // start value, shared by the three cases
  T(spec.fmt(v0), px(0) - 0.4, py(v0) - 0.4, 0.8, 0.28, { align: "center" });
  const ends = spec.series.map((s) => py(s.values[5]));
  for (let k = 1; k < ends.length; k++) if (ends[k] - ends[k - 1] < 0.32) ends[k] = ends[k - 1] + 0.32;   // keep labels apart
  const hasC = spec.series.some((s) => s.cagr), cx = box.x + box.w - 0.85;
  if (hasC) { T("CAGR", cx, box.y - 0.5, 0.85, 0.28, { bold: true, underline: true, align: "center" });
    T("18-23E", cx, box.y - 0.22, 0.85, 0.26, { align: "center" }); }
  spec.series.forEach((s, k) => {
    const hi = s.color === RED, o = { bold: hi, color: hi ? RED : C.text };
    T(spec.fmt(s.values[5]), px(5) + 0.14, ends[k] - 0.15, 0.7, 0.3, o);
    if (s.cagr) T(s.cagr, cx, ends[k] - 0.15, 0.85, 0.3, { ...o, align: "center" });
    // legend row: a short line in the case's colour + its name
    const ly = box.y + 0.05 + k * 0.32, lx0 = box.x + (spec.legendX || 0.1);
    slide.addShape("line", { x: lx0, y: ly + 0.15, w: 0.32, h: 0, line: { color: s.color, width: 2.25 } });
    T(s.name, lx0 + 0.42, ly, 1.5, 0.3, o);
  });
  return { px, cw, ends, cx };
}
function grey(bullets, box) {   // grey reading box, bullets at the deck's body size, key words bold in the main colour
  S.readingBox(slide, bullets, box, { size: 14 });
}

// ---- geometry (inches): two halves as on Mindcraft 4 / 5 / 8
const top = 1.39, lx = 0.37, lw = 5.95, rx = 6.67, rw = 6.06, readY = 5.62, readH = 1.33;

// ---- panel 1: top line
S.subhead(slide, 1, "Resilient growth under scenario analysis", lx, top, lw);
T("CSS Top Line Scenario Analysis (¥ Bn)", lx, 1.97, lw - 0.9, 0.3, { italic: true });
const g1 = scenarioChart({ x: lx, y: 2.45, w: lw, h: 2.95 }, {
  min: 7.2, max: 19, side: 1.5, fmt: (v) => v.toFixed(1),
  series: [
    { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], cagr: "17%", color: RED },
    { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], cagr: "12%", color: DARK },
    { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2], cagr: "8%", color: LIGHT },
  ],
});
// the market's growth under the CAGR column: all three cases sit above it
slide.addShape("line", { x: g1.cx, y: g1.ends[2] + 0.28, w: 0.85, h: 0, line: { color: LIGHT, width: 0.75, dashType: "dash" } });
T("Market", g1.cx - 0.2, g1.ends[2] + 0.32, 1.25, 0.26, { pt: 12, italic: true, color: DARK, align: "center" });
T("7%", g1.cx, g1.ends[2] + 0.58, 0.85, 0.28, { italic: true, color: DARK, align: "center" });
grey(["Three cases all indicate **above-market growth** (7%)",
  "Under the optimistic case, **~17% 5-year** could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"],
  { x: lx, y: readY, w: lw, h: readH });

// ---- panel 2: capex
S.subhead(slide, 2, "Guaranteed financial feasibility", rx, top, rw);
T("Required Annual Capex Scenario Analysis (¥ Mn)", rx, 1.97, rw - 0.9, 0.3, { italic: true });
const g = scenarioChart({ x: rx, y: 2.45, w: rw, h: 2.3 }, {
  min: 165, max: 330, side: 0.75, lay: { x: 0.22, y: 0.04, w: 0.76, h: 0.82 }, legendX: 1.25, fmt: (v) => String(v),
  series: [
    { name: "Optimistic", values: [200, 231, 244, 255, 292, 309], color: RED },
    { name: "Base", values: [200, 209, 216, 233, 268, 277], color: DARK },
    { name: "Crush", values: [200, 175, 180, 201, 228, 243], color: LIGHT },
  ],
});
// metric rows under the chart, aligned with the forecast years (row form of Mindcraft 8's "Pull-up ratio")
const rowY = 4.8;
T([{ text: "Capex burden" }, { text: "1", options: { superscript: true } }], rx, rowY, 1.75, 0.3, { pt: 12, bold: true, italic: true, color: RED });
["26%", "22%", "20%", "19%", "17%"].forEach((v, i) => T(v, g.px(i + 1) - 0.32, rowY, 0.64, 0.3, { bold: true, italic: true, align: "center" }));
const r2 = rowY + 0.38;
T([{ text: "Return on Capex under base case" }, { text: "2", options: { superscript: true } }], rx, r2, 3.95, 0.3, { pt: 12, bold: true, italic: true, color: RED });
T("~1.6 years", rx + 4.15, r2, 1.4, 0.3, { bold: true, italic: true, align: "center" });
slide.addShape("ellipse", { x: rx + 4.05, y: r2 - 0.07, w: 1.6, h: 0.44, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
grey(["Increasing capital expenditure is required to support the **offline expansion** strategy",
  "Yearly capex accounts for **~20% of liquidity**, with quick return (1.6yrs), indicating a good financial feasibility"],
  { x: rx, y: readY, w: rw, h: readH });

// section tracker as the deck draws it (Mindcraft 4, 8, 10, 15): bold italic items, current one in the main colour,
// red triangles between them
[["Market Analysis", 0.37, false], ["Growth Strategy", 2.89, false], ["Financial Forecasting", 5.57, true]].forEach(([t, x, cur], i) => {
  T(t, x, 0.04, 2.9, 0.3, { bold: true, italic: true, color: cur ? RED : C.g2 });
  if (i) slide.addShape("triangle", { x: x - 0.45, y: 0.06, w: 0.26, h: 0.24, rotate: 90, fill: { color: RED }, line: { type: "none" } });
});

// note line above the source (Mindcraft 5, 8)
T("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  0.39, 7.0, 12.4, 0.22, { pt: 10, italic: true });

L.save(pres, __dirname + "/candidate.pptx");
