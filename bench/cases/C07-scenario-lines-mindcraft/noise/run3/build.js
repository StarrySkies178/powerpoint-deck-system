// C07 scenario lines (Mindcraft style), attempt 3. Built from prompt.md only.
// Layout: HALF2 (two numbered panels side by side), panel boxes taken from Mindcraft slide 8 (HALF2 sibling, financial).
// Each panel: numbered sentence sub-headline, italic chart title, native line chart (3 scenarios, highlight = optimistic in
// the deck's red, base dark grey, crush light grey), end labels + scenario names (+ CAGR column) at the right,
// grey reading box with the two takeaways under it. Panel 2 adds the capex-burden and return-on-capex rows under the chart.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const title = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title,
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
});
const C = P.C, txt = P.txt, FONT = P.THEME.bodyFontFace;
const RED = C.navy;   // the deck's main colour (C00000)
const put = (runs, x, y, w, h, o = {}) => slide.addText(runs, { x, y, w, h, fontFace: FONT, fontSize: o.size || 12, color: C.text, margin: 0, valign: o.valign || "middle", align: o.align || "left", isTextBox: true });
const READ_H = 1.05;
const reading = (b, bullets) => S.readingBox(slide, bullets, { x: b.x, y: b.y + b.h - READ_H, w: b.w, h: READ_H }, { size: 12 });

const years = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
const SC = [
  { name: "Optimistic", col: C.navy, w: 2.5 },
  { name: "Base", col: "5C5C5C", w: 2 },
  { name: "Crush", col: "A6A6A6", w: 2 },
];

// a line chart whose plot area is fixed (manual inner layout), so labels and rows can be aligned to its points
function scenarioChart(box, values, o) {
  const lay = { x: 0.03, y: 0.08, w: 0.94, h: 0.74 };                 // inner plot area, fractions of the chart box
  const min = o.min, max = o.max;
  slide.addChart(pres.ChartType.line, SC.map((s, i) => ({ name: s.name, labels: years, values: values[i] })), {
    ...box, ...P.chartStyle(), chartColors: SC.map((s) => s.col), lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: min, valAxisMaxVal: max,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelColor: C.text, catAxisLabelFontSize: 12,
    catAxisLineShow: true, catAxisLineColor: "808080", layout: lay,
  });
  const px = (i) => box.x + box.w * (lay.x + (lay.w * (i + 0.5)) / years.length);
  const py = (v) => box.y + box.h * (lay.y + lay.h * (1 - (v - min) / (max - min)));
  return { px, py, step: (box.w * lay.w) / years.length };
}
// value labels: the common start once, the end of each scenario (spread so they never overlap)
function endLabels(ch, values, fmt) {
  const x0 = ch.px(0), v0 = values[0][0];
  txt(slide, fmt(v0), x0 - 0.45, ch.py(v0) - 0.36, 0.9, 0.26, { fontSize: 12, keepSize: true, align: "center", margin: 0, noScale: true });
  const ys = values.map((v) => ch.py(v[v.length - 1]));
  for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] < 0.3) ys[i] = ys[i - 1] + 0.3;
  const x5 = ch.px(years.length - 1);
  values.forEach((v, i) => put([{ text: fmt(v[v.length - 1]), options: { bold: i === 0, color: i === 0 ? RED : C.text } }], x5 + 0.12, ys[i] - 0.13, 0.62, 0.26));
  return ys;
}

// ---------- panel 1: top line scenarios ----------
const top = [
  [8.3, 10.1, 11.8, 13.6, 15.6, 18.2],
  [8.3, 9.6, 10.7, 12.0, 13.3, 14.6],
  [8.3, 9.2, 9.7, 10.5, 11.3, 12.2],
];
const cagr = ["17%", "12%", "8%"];
// ---------- panel 2: capex scenarios ----------
const capex = [
  [200, 231, 244, 255, 292, 309],
  [200, 209, 216, 233, 268, 277],
  [200, 175, 180, 201, 228, 243],
];
const burden = ["26%", "22%", "20%", "19%", "17%"];

const BX = { y: 1.42, h: 5.45 };
const regions = [{ x: 0.37, y: BX.y, w: 6.05, h: BX.h }, { x: 6.75, y: BX.y, w: 6.2, h: BX.h }];

const PANELS = [
    {
      headline: "Resilient growth under scenario analysis",
      read: [
        "Three cases all indicate **above-market growth (7%)**",
        "Under the optimistic case, **~17% 5-year** could be expected, **offline expansion roadmap** and **ramp-up speed** are two key value creation levers",
      ],
      draw: (sl, b) => {
        txt(sl, "CSS Top Line Scenario Analysis (¥ Bn)", b.x, b.y, b.w, 0.3, { fontSize: 12, noScale: true, margin: 0, valign: "middle" });
        reading(b, PANELS[0].read);
        const cw = b.w - 2.15, cb = { x: b.x, y: b.y + 0.45, w: cw, h: b.h - 0.55 - READ_H - 0.1 };
        const ch = scenarioChart(cb, top, { min: 7, max: 19.5 });
        const ys = endLabels(ch, top, (v) => v.toFixed(1));
        const nx = cb.x + cb.w + 0.25, cx = b.x + b.w - 0.8;
        txt(sl, [{ text: "CAGR", options: { bold: true, underline: { style: "sng" }, breakLine: true } }, { text: "18-23E", options: {} }],
          cx - 0.05, ys[0] - 0.75, 0.9, 0.5, { fontSize: 12, noScale: true, align: "center", margin: 0 });
        SC.forEach((s, i) => {
          put([{ text: s.name, options: { bold: i === 0, color: i === 0 ? RED : C.text } }], nx, ys[i] - 0.13, 1.1, 0.26);
          put([{ text: cagr[i], options: { bold: i === 0, color: i === 0 ? RED : C.text } }], cx, ys[i] - 0.13, 0.8, 0.26, { align: "center" });
        });
        sl.addShape("ellipse", { x: cx - 0.02, y: ys[0] - 0.2, w: 0.84, h: 0.4, fill: { type: "none" }, line: { color: C.navy, width: 1.5 } });
      },
    },
    {
      headline: "Guaranteed financial feasibility",
      read: [
        "Increasing **capital expenditure** is required to support the **offline expansion** strategy",
        "Yearly capex accounts for **~20% of liquidity**, with **quick return (1.6yrs)**, indicating a good financial feasibility",
      ],
      draw: (sl, b) => {
        txt(sl, "Required Annual Capex Scenario Analysis (¥ Mn)", b.x, b.y, b.w, 0.3, { fontSize: 12, noScale: true, margin: 0, valign: "middle" });
        reading(b, PANELS[1].read);
        const rowsH = 0.8, cb = { x: b.x, y: b.y + 0.45, w: b.w - 1.45, h: b.h - 0.55 - rowsH - READ_H - 0.1 };
        const ch = scenarioChart(cb, capex, { min: 150, max: 330 });
        const ys = endLabels(ch, capex, (v) => String(v));
        const nx = ch.px(years.length - 1) + 0.75;
        SC.forEach((s, i) => put([{ text: s.name, options: { bold: i === 0, color: i === 0 ? RED : C.text } }], nx - 0.05, ys[i] - 0.13, 1.1, 0.26));
        // rows under the chart, aligned to the forecast years
        const r1 = cb.y + cb.h + 0.06, r2 = r1 + 0.38;
        sl.addShape("line", { x: b.x, y: r1 - 0.02, w: b.w, h: 0, line: { color: "A6A6A6", width: 0.75, dashType: "dash" } });
        put([{ text: "Capex", options: { bold: true, color: RED, breakLine: true } }, { text: "burden¹", options: { bold: true, color: RED } }], b.x, r1 - 0.02, ch.step + 0.1, 0.4, { size: 11 });
        burden.forEach((v, i) => txt(sl, v, ch.px(i + 1) - 0.4, r1, 0.8, 0.34, { fontSize: 12, noScale: true, align: "center", valign: "middle", margin: 0 }));
        put([{ text: "Return on Capex under base case²: ", options: { bold: true, color: RED } }, { text: "~1.6 years", options: { bold: true } }], b.x, r2, b.w, 0.34, { size: 11 });
      },
    },
];
S.composeSlide(pres, slide, { layout: "HALF2", regions, panels: PANELS });

// notes above the source line
txt(slide, "Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  0.39, 6.95, 12.3, 0.24, { fontSize: 10, noScale: true, margin: 0, valign: "middle" });

L.save(pres, __dirname + "/candidate.pptx");
