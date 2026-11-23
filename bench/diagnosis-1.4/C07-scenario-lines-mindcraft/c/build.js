// C07 variant c: edit the closest other slide of the reference deck (Case-2019-Mindcraft).
// Closest slide: Mindcraft slide 4 ("Fine jewelry expects to pull up market steadily ...", store id
// case19-mindcraft-004). Why: it is the deck's two-half chart slide (HALF2-like R2L1): a red numbered
// square + bold sub-headline + grey rule over each half, an italic chart title with unit, a trend chart
// whose series end in a CAGR column with one value circled by a red hand-drawn ring, and a grey bullet
// box of takeaways under the chart. This prompt needs the same furniture twice (two trend charts with
// takeaways). Slide 8 (waterfall half) lends its red bold-italic "Pull-up ratio" row, reused here for
// the capex-burden row.
// build.js draws the frame (style profile) and what the stored slide cannot carry: the two native line
// charts (slide 4's chart is drawn shapes, not chart data) and the note line. build.py then places the
// stored objects of slides 4 and 8, refilled with this slide's text, around the charts.
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
});
// section tracker as on the deck's slides: bold italic, grey sections, current one in red, red triangles
// between them (the triangles are slide 4's stored shapes, placed by build.py)
[["Market Analysis", 0.37, "A6A6A6"], ["Growth Strategy", 2.9, "A6A6A6"], ["Financial Forecasting", 5.57, "C00000"]].forEach(([t, x, c]) =>
  slide.addText(t, { x, y: 0.05, w: 2.6, h: 0.3, fontFace: "Verdana", fontSize: 14, bold: true, italic: true, color: c, margin: 0, valign: "top" }));

const years = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
const COLS = ["C00000", "5C5C5C", "A6A6A6"];        // optimistic = deck red (the point), base dark grey, crush light grey
// plot area fixed (inner layout) so build.py can put the series-end labels exactly at the line ends
const PL = { x: 0.03, y: 0.1, w: 0.94, h: 0.74 };
const charts = {
  top: { box: { x: 0.42, y: 2.2, w: 4.3, h: 3.5 }, min: 7, max: 19.5,
    series: [["Optimistic", [8.3, 10.1, 11.8, 13.6, 15.6, 18.2]], ["Base", [8.3, 9.6, 10.7, 12.0, 13.3, 14.6]], ["Crush", [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]]],
    format: "0.0" },
  capex: { box: { x: 6.72, y: 2.2, w: 4.5, h: 2.75 }, min: 150, max: 320,
    series: [["Optimistic", [200, 231, 244, 255, 292, 309]], ["Base", [200, 209, 216, 233, 268, 277]], ["Crush", [200, 175, 180, 201, 228, 243]]],
    format: "0" },
};
for (const k of Object.keys(charts)) {
  const c = charts[k];
  S.chartIn(pres, slide, {
    type: "line", labels: years, colors: COLS, format: c.format,
    series: c.series.map(([name, values]) => ({ name, values })),
    options: { showLegend: false, valAxisMinVal: c.min, valAxisMaxVal: c.max, layout: PL,
      catAxisLabelFontSize: 12, dataLabelFontSize: 11, catAxisLineShow: true, catAxisLineColor: "000000", lineSize: 2.25 },
  }, c.box);
}

// note line (the deck puts "Note: ..." in italics just above the source line, e.g. slides 5 and 8)
slide.addText("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  { x: 0.39, y: 6.93, w: 12.3, h: 0.24, fontFace: "Verdana", fontSize: 10, italic: true, color: "000000", margin: 0, valign: "top" });

fs.writeFileSync(path.join(__dirname, "geometry.json"), JSON.stringify({ PL, charts }, null, 1));
L.save(pres, __dirname + "/candidate.pptx");
