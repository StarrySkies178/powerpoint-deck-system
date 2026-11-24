// C07 run7 r2: scenario lines in the Mindcraft deck style (deck as reference, leave-one-out).
// Layout: HALF2 (two numbered halves), as the deck's two-exhibit analysis slides (slide 4, slide 8): each half has a
// red number chip + sub-headline over a grey rule, an italic unit line, a drawn chart labelled at its line ends with
// no value axis (profile chart entry), and a grey reading box. Pull-up-ratio style data row under the capex chart (slide 8).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
});
const C = P.C, PT = 14, LPT = 12;
const years = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const unit = (t, x, y, w) => P.txt(slide, [{ text: t, options: { italic: true } }], x, y, w, 0.32, { fontSize: PT, color: C.text, valign: "middle", margin: 0 });

// grey reading box (the framework's readingBox), key words bold red (**...**), at the deck's body size
const reading = (items, box) => S.readingBox(slide, items, box, { size: PT });

// replicate lineEnds' plot x positions so a data row can sit under the year labels
function plotX(spec, box) {
  const pt = spec.fontSize, em = (t) => (String(t).length * pt * 0.62) / 72, fmt = spec.format || String;
  const sideW = spec.side ? Math.min(1.6, Math.max(0.9, em(spec.side.header || "") / 2 + 0.2, ...(spec.side.values || []).map((v) => em(v) + 0.3))) : 0;
  const nameW = Math.min(box.w * 0.3, Math.max(...spec.series.map((s) => em(fmt(s.values[s.values.length - 1]) + "  " + s.name) + 0.15)));
  const startW = Math.max(0.45, ...spec.series.map((s) => em(fmt(s.values[0])) + 0.12));
  const px0 = box.x + startW, px1 = box.x + box.w - sideW - nameW - 0.12, n = spec.labels.length;
  return (i) => px0 + (i / (n - 1)) * (px1 - px0);
}

S.composeSlide(pres, slide, {
  layout: "HALF2",
  panels: [
    {
      headline: "Resilient growth under scenario analysis",
      draw: (sl, b) => {
        unit("CSS Top Line Scenario Analysis (¥ Bn)", b.x, b.y, b.w);
        const rdH = 1.45, ch = { x: b.x, y: b.y + 0.42, w: b.w, h: b.h - 0.42 - rdH - 0.2 };
        S.lineEnds(sl, {
          fontSize: LPT, labels: years, min: 7, format: (v) => v.toFixed(1),
          series: [
            { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], hi: true },
            { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6] },
            { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2] },
          ],
          side: { header: "CAGR 18-23E", values: ["17%", "12%", "8%"], circle: 0 },
        }, ch);
        reading([
          "Three cases all indicate **above-market growth** (7%)",
          "Under the optimistic case, **~17% 5-year** could be expected, offline expansion roadmap and ramp-up speed are two **key value creation levers**",
        ], { x: b.x, y: b.y + b.h - rdH, w: b.w, h: rdH });
      },
    },
    {
      headline: "Guaranteed financial feasibility",
      draw: (sl, b) => {
        unit("Required Annual Capex Scenario Analysis (¥ Mn)", b.x, b.y, b.w);
        const rdH = 1.45, rowH = 0.3, ind = 0.65, ch = { x: b.x + ind, y: b.y + 0.42, w: b.w - ind, h: b.h - 0.42 - rdH - 0.2 - 3 * rowH - 0.2 };
        const spec = {
          fontSize: LPT, labels: years, min: 150,
          series: [
            { name: "Optimistic", values: [200, 231, 244, 255, 292, 309], hi: true },
            { name: "Base", values: [200, 209, 216, 233, 268, 277] },
            { name: "Crush", values: [200, 175, 180, 201, 228, 243] },
          ],
        };
        S.lineEnds(sl, spec, ch);
        const X = plotX(spec, ch), ry = ch.y + ch.h + 0.08;
        P.txt(sl, [{ text: "Capex burden¹", options: { bold: true, italic: true } }], b.x, ry, 1.15, 2 * rowH, { fontSize: LPT, color: C.accent, valign: "middle", margin: 0, onDark: true });
        ["26%", "22%", "20%", "19%", "17%"].forEach((v, i) =>
          P.txt(sl, [{ text: v, options: { bold: true, italic: true } }], X(i + 1) - 0.45, ry, 0.9, 2 * rowH, { fontSize: LPT, color: C.accent, align: "center", valign: "middle", margin: 0, onDark: true }));
        P.txt(sl, [{ text: "Return on Capex under base case²: ", options: { bold: true, italic: true, color: C.accent } }, { text: "~1.6 years", options: { bold: true, color: C.text } }],
          b.x, ry + 2 * rowH + 0.06, b.w, rowH, { fontSize: LPT, valign: "middle", margin: 0, onDark: true });
        reading([
          "Increasing **capital expenditure** is required to support the offline expansion strategy",
          "Yearly capex accounts for **~20% of liquidity**, with **quick return (1.6yrs)**, indicating a good financial feasibility",
        ], { x: b.x, y: b.y + b.h - rdH, w: b.w, h: rdH });
      },
    },
  ],
}, { x: B.x, y: B.y, w: B.w, h: B.h - 0.3 });

// note line above the source, as on the deck's slide 8
P.txt(slide, [{ text: "Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store", options: { italic: true } }],
  B.x, B.y + B.h - 0.27, B.w, 0.25, { fontSize: 10, color: C.text, valign: "middle", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
