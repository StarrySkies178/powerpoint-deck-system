// C07 attempt 1: Mindcraft financial-forecast slide, built from prompt.md with the deck's style profile.
// Layout: HALF2 (two numbered panels, as the deck's two-exhibit slides 4 and 8), each panel =
// italic unit line, native line chart (3 scenarios) with a right-hand figure column, and a grey reading box.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const title = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, B, P, S, HOUSE } = L.start({
  ref: "Case-2019-Mindcraft",
  title,
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
});
const C = P.C, txt = P.txt, FONT = HOUSE.FONT.latin;
const years = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
const SER = [
  { name: "Optimistic", color: C.navy },   // C00000: the case the takeaway names
  { name: "Base", color: "5C5C5C" },
  { name: "Crush", color: "A6A6A6" },
];

// note line above the source (as the deck's slide 8 carries its note)
const NOTE_H = 0.24;
const body = { x: B.x, y: B.y, w: B.w, h: B.h - NOTE_H - 0.04 };

// one line-chart exhibit with a figure column at its right edge, aligned to the 2023E values
function scenarioChart(box, spec) {
  const colW = spec.colW, cw = box.w - colW;
  const min = spec.min, max = spec.max;
  const data = SER.map((s, i) => ({ name: s.name, labels: years, values: spec.values[i] }));
  slide.addChart(pres.ChartType.line, data, {
    x: box.x, y: box.y, w: cw, h: box.h,
    chartColors: SER.map((s) => s.color), lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showLegend: false, showValue: true, dataLabelPosition: "t", dataLabelFontSize: 12, dataLabelFontFace: FONT, dataLabelColor: C.text,
    dataLabelFormatCode: spec.format,
    catAxisLabelFontSize: 12, catAxisLabelFontFace: FONT, catAxisLabelColor: C.text, catAxisLineShow: true, catAxisLineColor: "A6A6A6",
    valAxisHidden: true, valAxisMinVal: min, valAxisMaxVal: max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
  });
  // figure column: header, then one row per scenario (top to bottom in the order the lines end)
  const cx = box.x + cw + 0.05;
  txt(slide, spec.colHead, cx, box.y - 0.05, colW - 0.05, 0.5, { fontSize: 12, keepSize: true, bold: true, align: "center", valign: "top", color: C.text });
  slide.addShape("line", { x: cx + 0.12, y: box.y + 0.46, w: colW - 0.3, h: 0, line: { color: C.text, width: 1 } });
  SER.forEach((s, i) => {
    const y = box.y + 0.62 + i * 0.56;
    slide.addShape("ellipse", { x: cx + 0.02, y: y + 0.05, w: 0.12, h: 0.12, fill: { color: s.color }, line: { type: "none" } });
    txt(slide, s.name, cx + 0.18, y - 0.02, colW - 0.2, 0.24, { fontSize: 12, keepSize: true, color: C.text, valign: "middle", margin: 0 });
    txt(slide, spec.col[i], cx + 0.18, y + 0.2, colW - 0.2, 0.24, { fontSize: 14, keepSize: true, bold: i === 0, color: i === 0 ? C.navy : C.text, valign: "middle", margin: 0 });
  });
}

// the exhibit's unit line: italic, as the deck's chart titles (slides 4 and 8)
const unitLine = (t, b) => slide.addText(t, { x: b.x, y: b.y, w: b.w, h: 0.3, fontFace: FONT, fontSize: 14, italic: true, color: C.text, valign: "middle", margin: 0, isTextBox: true });

// grey reading box, 2 bullets, key words bold in the main colour (S.readingBox)
const reading = (bullets, box) => S.readingBox(slide, bullets, box, { size: 14 });

const panels = [
  {
    headline: "Resilient growth under scenario analysis",
    draw: (sl, b) => {
      unitLine("CSS Top Line Scenario Analysis (¥ Bn)", b);
      const rh = 1.25, chartBox = { x: b.x, y: b.y + 0.4, w: b.w, h: b.h - 0.4 - rh - 0.15 };
      scenarioChart(chartBox, {
        values: [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]],
        min: 7.4, max: 19, format: "0.0", colW: 1.35, colHead: "CAGR\n18-23E", col: ["17%", "12%", "8%"],
      });
      reading([
        "Three cases all indicate **above-market growth (7%)**",
        "Under the optimistic case, **~17% 5-year** could be expected, **offline expansion roadmap** and **ramp-up speed** are two key value creation levers",
      ], { x: b.x, y: b.y + b.h - rh, w: b.w, h: rh });
    },
  },
  {
    headline: "Guaranteed financial feasibility",
    draw: (sl, b) => {
      unitLine("Required Annual Capex Scenario Analysis (¥ Mn)", b);
      const rh = 1.25, rowsH = 0.82;
      const chartBox = { x: b.x, y: b.y + 0.4, w: b.w, h: b.h - 0.4 - rh - rowsH - 0.15 };
      const colW = 1.35;
      scenarioChart(chartBox, {
        values: [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]],
        min: 150, max: 325, format: "0", colW, colHead: "Scenario\n2023E", col: ["309", "277", "243"],
      });
      // rows under the chart, aligned to the category columns of the plot area
      const cw = chartBox.w - colW, px = chartBox.x + cw * 0.03, pw = cw * 0.94, step = pw / 6;
      const ry = chartBox.y + chartBox.h + 0.05;
      slide.addShape("line", { x: b.x, y: ry, w: b.w, h: 0, line: { color: "A6A6A6", width: 0.75, dashType: "dash" } });
      const burden = ["", "26%", "22%", "20%", "19%", "17%"];
      txt(slide, "Capex burden¹", b.x + b.w - colW + 0.05, ry + 0.05, colW, 0.32, { fontSize: 11, keepSize: true, bold: true, color: C.navy, valign: "middle", margin: 0 });
      burden.forEach((v, i) => { if (v) txt(slide, v, px + i * step, ry + 0.05, step, 0.32, { fontSize: 12, keepSize: true, align: "center", valign: "middle", margin: 0, color: C.text }); });
      slide.addShape("line", { x: b.x, y: ry + 0.41, w: b.w, h: 0, line: { color: "A6A6A6", width: 0.75, dashType: "dash" } });
      slide.addText([
        { text: "Return on Capex under base case²: ", options: { bold: true, color: C.navy } },
        { text: "~1.6 years", options: { bold: true, color: C.text } },
      ], { x: b.x, y: ry + 0.45, w: b.w, h: 0.34, fontFace: FONT, fontSize: 12, valign: "middle", margin: 0.04, isTextBox: true });
      reading([
        "**Increasing capital expenditure** is required to support the offline expansion strategy",
        "Yearly capex accounts for **~20% of liquidity**, with **quick return (1.6yrs)**, indicating a good financial feasibility",
      ], { x: b.x, y: b.y + b.h - rh, w: b.w, h: rh });
    },
  },
];
S.composeSlide(pres, slide, { layout: "HALF2", panels }, body);

txt(slide, "Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  B.x, B.y + B.h - NOTE_H, B.w, NOTE_H, { fontSize: 10, keepSize: true, color: C.text, valign: "bottom", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
