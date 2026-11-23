// C09 variant c: edit the closest other slide of the same deck.
// Closest slide: Pola deck slide 23 ("Pessimistic scenario", backup, small-multiples): one scenario heading over a
// stacked pola / Jurlique column chart, 2013-2021e, totals on top, dashed lines joining the bar tops, value axis in ¥M
// and a "CAGR 2015-2021" column on the right. This prompt is the same exhibit twice (normal and optimistic scenario),
// so the slide is that object stacked twice. Slide 16 (online/offline stack with CAGR) is the runner-up; it has
// numbered panel heads and arrows this prompt does not ask for.
// Split of the work: build.js draws the frame and what the stored object cannot carry, because its labels, axis and
// connectors are pictures or glyph outlines of the old numbers (axis labels, ticks, totals, years, dashed connectors,
// CAGR column). build.py then places case-truenorth-pola-023 twice, refills its heading, resizes its own bar shapes to
// the new data and moves its legend. The shared geometry goes to geom.json so both files use the same scale.
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });

const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const CHARTS = [
  { name: "Normal Scenario", total: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58],
    cagr: { jurlique: "15%", pola: "25%" }, axisMax: 2.0, headY: 1.47, topY: 2.02, baseY: 3.92 },
  { name: "Optimistic Scenario", total: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78],
    cagr: { jurlique: "19%", pola: "27%" }, axisMax: 2.5, headY: 4.29, topY: 4.84, baseY: 6.74 },
];
// geometry of the stored chart on slide 23 (inches, measured from its shapes): bar lefts, bar width, axis line, ticks
const EMU = 914400;
const BAR_X = [1111998, 1807106, 2502132, 3197241, 3892349, 4587458, 5282566, 5977592, 6672701].map((v) => v / EMU);
const BAR_W = 463550 / EMU, AXIS_X = 996000 / EMU, TICK_X0 = 965351 / EMU, AXIS_END = 7257224 / EMU;
const CAGR_X = 7.62, CAGR_W = 0.9;
const BLACK = "000000", PT = 12;
const t = (s, x, y, w, h, o = {}) => P.txt(slide, s, x, y, w, h, { fontSize: PT, keepSize: true, color: BLACK, margin: 0, ...o });
const line = (x1, y1, x2, y2, o = {}) => slide.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
  flipV: (x2 - x1) * (y2 - y1) < 0, line: { color: BLACK, width: o.width || 0.85, dashType: o.dash || "solid" } });

for (const c of CHARTS) {
  const u = (c.baseY - c.topY) / c.axisMax, yOf = (v) => c.baseY - v * u;
  c.unit = u;
  // value axis: line, ticks every 0.5, labels (top one carries the unit, as on slide 23: "¥1.5M")
  line(AXIS_X, c.topY, AXIS_X, c.baseY);
  line(AXIS_X, c.baseY, AXIS_END, c.baseY);
  for (let v = 0; v <= c.axisMax + 1e-9; v += 0.5) {
    const y = yOf(v);
    line(TICK_X0, y, AXIS_X, y);
    const lab = v >= c.axisMax - 1e-9 ? `¥${v.toFixed(1)}M` : v.toFixed(1);
    t(lab, 0.3, y - 0.12, TICK_X0 - 0.33, 0.24, { align: "right", valign: "middle" });
  }
  // year labels under the bars, totals over them
  YEARS.forEach((yr, i) => {
    const cx = BAR_X[i] + BAR_W / 2;
    t(yr, cx - 0.38, c.baseY + 0.04, 0.76, 0.24, { align: "center" });
    t(c.total[i].toFixed(1), cx - 0.38, yOf(c.total[i]) - 0.27, 0.76, 0.24, { align: "center", valign: "bottom" });
  });
  // dashed connectors bar top → next bar top, for the total and for the pola segment
  for (let i = 0; i < YEARS.length - 1; i++) {
    for (const s of [c.total, c.pola]) line(BAR_X[i] + BAR_W, yOf(s[i]), BAR_X[i + 1], yOf(s[i + 1]), { dash: "dash" });
  }
  // CAGR 2015-2021 column: header above the plot, one value at the middle of each 2021e segment
  t([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "2015-2021" }], CAGR_X, c.topY - 0.42, CAGR_W, 0.42, { align: "center" });
  const k = YEARS.length - 1;
  t(c.cagr.jurlique, CAGR_X, (yOf(c.total[k]) + yOf(c.pola[k])) / 2 - 0.12, CAGR_W, 0.24, { align: "center", valign: "middle" });
  t(c.cagr.pola, CAGR_X, (yOf(c.pola[k]) + c.baseY) / 2 - 0.12, CAGR_W, 0.24, { align: "center", valign: "middle" });
}

// the deck's grey footer band (every slide, 7.21" to the bottom, CCCCCC); the frame does not draw it for this profile
slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });

fs.writeFileSync(path.join(__dirname, "geom.json"), JSON.stringify({ EMU, BAR_X, BAR_W, charts: CHARTS }, null, 1));
L.save(pres, __dirname + "/candidate.pptx");
