// C09 variant a: sensitivity analysis, two stacked scenario charts, in the style of the TrueNorth Pola deck.
// Style: the deck's profile (title band, Calibri, red/grey roles). Form taken from the deck's backup scenario
// chart (slide 23, "Pessimistic scenario"): scenario heading, stacked columns pola (grey) + Jurlique (red),
// value axis with "¥xM" on the top tick, legend at top left, totals over each column, dashed lines joining the
// column tops, and a "CAGR 2015-2021" column on the right level with each segment of the last column.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P, S } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
const C = P.C, F = P.THEME.bodyFontFace;
const RED = C.navy, GREY = C.g3, BLACK = "000000";

const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const r2 = (v) => Math.round(v * 100) / 100;
const scenarios = [
  { name: "Normal Scenario", total: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" }, max: 2.0 },
  { name: "Optimistic Scenario", total: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" }, max: 2.5 },
];

const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 12, color: o.color || BLACK, bold: !!o.bold,
  underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

function scenarioChart(sc, top, height) {
  // heading
  T(sc.name, 0.42, top, 4.5, 0.34, { size: 16, bold: true });
  const ch = { x: 0.35, y: top + 0.32, w: 7.75, h: height - 0.32 };
  const plot = { x0: 1.12, x1: 7.98, y0: ch.y + 0.42, y1: ch.y + ch.h - 0.3 };   // inner plot area, inches
  const layout = { x: (plot.x0 - ch.x) / ch.w, y: (plot.y0 - ch.y) / ch.h, w: (plot.x1 - plot.x0) / ch.w, h: (plot.y1 - plot.y0) / ch.h };
  const jur = sc.total.map((t, i) => r2(t - sc.pola[i]));
  const gap = 55, n = YEARS.length, slot = (plot.x1 - plot.x0) / n, bw = slot / (1 + gap / 100);
  const fmt = `[>=${(sc.max - 0.05).toFixed(2)}]"¥"0.0"M";0.0`;
  S.chartIn(pres, slide, {
    type: "stacked", labels: YEARS, colors: [GREY, RED],
    series: [{ name: "pola", values: sc.pola }, { name: "Jurlique", values: jur }],
    showValue: false,
    options: { ...ch, layout, showLegend: false, showValue: false, barGapWidthPct: gap, dataBorder: { pt: 0.75, color: "FFFFFF" },
      valAxisHidden: false, valAxisMinVal: 0, valAxisMaxVal: sc.max, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: fmt,
      valAxisLabelFontSize: 12, valAxisLabelColor: BLACK, valAxisLineShow: true, valAxisLineColor: BLACK, valAxisLineSize: 0.75,
      valAxisMajorTickMark: "out", catAxisLineShow: true, catAxisLineColor: BLACK, catAxisLineSize: 0.75, catAxisMajorTickMark: "none",
      catAxisLabelFontSize: 12, catAxisLabelColor: BLACK, valGridLine: { style: "none" }, catGridLine: { style: "none" } },
  }, ch);
  // legend, top left inside the plot (as the reference)
  const ly = plot.y0 - 0.14;
  [["pola", GREY], ["Jurlique", RED]].forEach(([nm, col], k) => {
    const lx = 1.62 + k * 0.62;
    slide.addShape("rect", { x: lx, y: ly + 0.08, w: 0.09, h: 0.09, fill: { color: col }, line: { type: "none" } });
    T(nm, lx + 0.12, ly, 0.6, 0.25, { size: 11 });
  });
  // totals over the columns and dashed lines joining the column tops (total and pola)
  const yv = (v) => plot.y1 - (v / sc.max) * (plot.y1 - plot.y0);
  const cx = (i) => plot.x0 + slot * (i + 0.5);
  sc.total.forEach((t, i) => T(t.toFixed(1), cx(i) - 0.35, yv(t) - 0.3, 0.7, 0.26, { size: 13, align: "center" }));
  const dashed = (vals) => vals.slice(0, -1).forEach((v, i) => {
    const xa = cx(i) + bw / 2, xb = cx(i + 1) - bw / 2, ya = yv(v), yb = yv(vals[i + 1]);
    slide.addShape("line", { x: xa, y: Math.min(ya, yb), w: xb - xa, h: Math.max(Math.abs(yb - ya), 0.001), flipV: yb < ya,
      line: { color: BLACK, width: 0.75, dashType: "dash" } });
  });
  dashed(sc.total); dashed(sc.pola);
  // CAGR 2015-2021 column, each value level with its segment of the last column
  const cxC = 8.75, last = n - 1;
  T("CAGR", cxC - 0.6, ch.y - 0.02, 1.2, 0.2, { size: 11, align: "center", underline: true });
  T("2015-2021", cxC - 0.6, ch.y + 0.17, 1.2, 0.2, { size: 11, align: "center" });
  T(sc.cagr.jur, cxC - 0.5, (yv(sc.total[last]) + yv(sc.pola[last])) / 2 - 0.13, 1.0, 0.26, { size: 12, align: "center" });
  T(sc.cagr.pola, cxC - 0.5, (yv(sc.pola[last]) + yv(0)) / 2 - 0.13, 1.0, 0.26, { size: 12, align: "center" });
}

// the deck's grey footer band (every slide of the reference has it; the style profile carries no footer)
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
scenarioChart(scenarios[0], 1.48, 2.85);
scenarioChart(scenarios[1], 4.36, 2.8);

L.save(pres, __dirname + "/candidate.pptx");
