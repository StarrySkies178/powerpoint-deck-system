// C09 sensitivity (TrueNorth Pola deck as reference, leave-one-out).
// Form: the deck's own scenario chart (backup "Pessimistic Scenario" slide 23, and the financial-model chart of slide 16):
// bold scenario heading, stacked columns pola (grey, bottom) + Jurlique (red, top), totals over each column,
// dashed lines joining the column tops and the pola tops, value axis with the unit on its top label,
// legend top-left inside the plot, "CAGR 2015-2021" column on the right with one rate beside each segment.
// Two scenarios stacked one above the other, as the prompt asks.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const SCEN = [
  { name: "Normal Scenario", totals: ["0.5", "0.6", "0.7", "0.8", "0.9", "1.1", "1.3", "1.5", "1.7"],
    pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" }, max: 2.0 },
  { name: "Optimistic Scenario", totals: ["0.5", "0.6", "0.7", "0.8", "1.1", "1.3", "1.5", "1.8", "2.1"],
    pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" }, max: 2.5 },
];

(async () => {
  const { pres, slide, P, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
  const C = P.C, F = prof.fonts.latin;
  const RED = prof.roles.main, GREY = "A3A3A3", BLACK = prof.roles.text;   // pola grey as in the deck's scenario chart
  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.pt || 13, color: o.color || BLACK, bold: !!o.bold,
    underline: o.u ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

  // block geometry (inches, 4:3 slide); plot box is the chart's inner plot area
  const PX0 = 1.10, PX1 = 7.95, GAP = 50;                 // plot left/right, bar gap %
  // the deck's grey footer band (every content slide; the master built from the profile has none)
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
  const tops = [1.50, 4.36];
  SCEN.forEach((s, b) => {
    const T = tops[b];
    t(s.name, 0.40, T, 3.5, 0.34, { pt: 18, bold: true });
    const plot = { y0: T + 0.66, y1: T + 2.36 };          // top (= axis max) and baseline
    const frm = { x: 0.30, y: T + 0.42, w: 7.80, h: 2.36 }; // chart frame; category labels fall below the baseline
    const lay = { x: (PX0 - frm.x) / frm.w, y: (plot.y0 - frm.y) / frm.h, w: (PX1 - PX0) / frm.w, h: (plot.y1 - plot.y0) / frm.h };
    const tot = s.totals.map(Number), jur = tot.map((v, i) => Math.round((v - s.pola[i]) * 100) / 100);
    const fmt = `[=${s.max}]"¥${s.max.toFixed(1)}M";0.0`;   // unit on the top axis label, as the deck writes it
    slide.addChart(pres.ChartType.bar, [
      { name: "pola", labels: YEARS, values: s.pola },
      { name: "Jurlique", labels: YEARS, values: jur },
    ], { ...frm, layout: lay, barDir: "col", barGrouping: "stacked", barGapWidthPct: GAP, chartColors: [GREY, RED],
      showValue: false, showLegend: false, dataBorder: { pt: 0.75, color: "FFFFFF" },
      valAxisMinVal: 0, valAxisMaxVal: s.max, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: fmt, valAxisLabelFontSize: 13, valAxisLabelColor: BLACK,
      valAxisLabelFontFace: F, valAxisLineShow: true, valAxisLineColor: "404040", valAxisMajorTickMark: "out", valGridLine: { style: "none" },
      catAxisLabelFontSize: 13, catAxisLabelColor: BLACK, catAxisLabelFontFace: F, catAxisLineShow: true, catAxisLineColor: "404040",
      catAxisMajorTickMark: "none", catGridLine: { style: "none" }, serGridLine: { style: "none" } });

    // legend inside the plot, top-left (deck's form: small square + series name)
    const ly = plot.y0 + 0.02;
    [["pola", GREY, 1.62], ["Jurlique", RED, 2.20]].forEach(([n, c, x]) => {
      slide.addShape("rect", { x, y: ly + 0.07, w: 0.1, h: 0.1, fill: { color: c }, line: { type: "none" } });
      t(n, x + 0.14, ly, 0.8, 0.24, { pt: 13 });
    });

    // bar positions from the plot geometry: category width, bar width at GAP %
    const cw = (PX1 - PX0) / YEARS.length, bw = cw / (1 + GAP / 100), k = (plot.y1 - plot.y0) / s.max;
    const yv = (v) => plot.y1 - v * k, bx = (i) => PX0 + i * cw + (cw - bw) / 2;
    tot.forEach((v, i) => t(s.totals[i], bx(i) - 0.1, yv(v) - 0.30, bw + 0.2, 0.26, { pt: 14, align: "center", valign: "bottom" }));
    // dashed joins: top of each column to the next, and pola top to the next pola top
    const dash = (x1, y1, x2, y2) => slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1), flipV: y2 < y1,
      line: { color: BLACK, width: 1, dashType: "dash" } });
    for (let i = 0; i < YEARS.length - 1; i++) {
      dash(bx(i) + bw, yv(tot[i]), bx(i + 1), yv(tot[i + 1]));
      dash(bx(i) + bw, yv(s.pola[i]), bx(i + 1), yv(s.pola[i + 1]));
    }

    // CAGR column on the right, each rate level with its segment of the last column
    const cx = 8.30, cwid = 1.10, n = YEARS.length - 1;
    t("CAGR", cx, T + 0.42, cwid, 0.22, { pt: 13, u: true, align: "center", valign: "top" });
    t("2015-2021", cx, T + 0.62, cwid, 0.22, { pt: 13, align: "center", valign: "top" });
    t(s.cagr.jur, cx, (yv(tot[n]) + yv(s.pola[n])) / 2 - 0.13, cwid, 0.26, { pt: 13, align: "center" });
    t(s.cagr.pola, cx, (yv(s.pola[n]) + plot.y1) / 2 - 0.13, cwid, 0.26, { pt: 13, align: "center" });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
