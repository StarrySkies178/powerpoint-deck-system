// C09 rebuild r3: sensitivity analysis, two scenario charts stacked (normal above, optimistic below).
// Style: the TrueNorth deck's profile (red title band, Calibri, red + grey). Form: the deck's own backup
// scenario chart (Pessimistic Scenario, slide 23 of the reference): stacked columns pola (grey) + Jurlique (red),
// totals over the bars joined by dashed lines, value axis with the unit on its top label, CAGR column on the right.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
const C = P.C, F = "Calibri";
const RED = prof.roles.main, GREY = prof.roles.grey3, TXT = prof.roles.text, LINE = prof.roles.grey1;
const PT = prof.body.pt, LPT = prof.body.label_pt;   // 14 / 12

// the deck's grey footer band (on every slide of the reference)
slide.addShape("rect", { x: 0, y: 7.19, w: 10, h: 0.31, fill: { color: "D9D9D9" }, line: { type: "none" } });

const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const SCEN = [
  { name: "Normal Scenario", total: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { Jurlique: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", total: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { Jurlique: "19%", pola: "27%" } },
];
const MAX = 2.5, STEP = 0.5;                    // same scale on both charts, so the scenarios compare by height
const PX0 = 1.05, PX1 = 8.05;                   // plot area (inner), inches
const GAP = 55;                                 // bar gap, % of bar width
const n = YEARS.length, cw = (PX1 - PX0) / n, bw = cw / (1 + GAP / 100);
const cx = (i) => PX0 + cw * (i + 0.5);
const fmt = (v) => v.toFixed(1);

function line(x1, y1, x2, y2, o = {}) {
  const up = y2 < y1;
  slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1), flipV: up, line: { color: o.color || TXT, width: o.width || 1, dashType: o.dash || "solid" } });
}
function text(t, x, y, w, h, o = {}) {
  slide.addText(t, { x, y, w, h, fontFace: F, fontSize: o.size || PT, color: o.color || TXT, bold: !!o.bold, underline: o.underline ? { style: "sng" } : undefined,
    align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
}

function scenario(s, top, plotTop, plotBot) {
  const ph = plotBot - plotTop, yv = (v) => plotBot - (v / MAX) * ph;
  // scenario header (the reference's bold chart heading)
  text(s.name, 0.4, top, 5, 0.4, { size: 18, bold: true });
  // native stacked chart: pola at the bottom (grey), Jurlique on top (red); data stays editable
  const jur = s.total.map((t, i) => Math.round((t - s.pola[i]) * 100) / 100);
  const box = { x: PX0 - 0.05, y: plotTop - 0.05, w: PX1 - PX0 + 0.1, h: ph + 0.45 };
  slide.addChart(pres.ChartType.bar, [{ name: "pola", labels: YEARS, values: s.pola }, { name: "Jurlique", labels: YEARS, values: jur }], {
    ...box, barDir: "col", barGrouping: "stacked", chartColors: [GREY, RED], barGapWidthPct: GAP, showLegend: false, showValue: false,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: MAX, valAxisMajorUnit: STEP, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: PT, catAxisLabelFontFace: F, catAxisLabelColor: TXT, catAxisLineShow: true, catAxisLineColor: LINE,
    layout: { x: 0.05 / box.w, y: 0.05 / box.h, w: (PX1 - PX0) / box.w, h: ph / box.h },
  });
  // value axis drawn as in the reference: a line, ticks, the unit on the top label
  line(PX0, plotTop, PX0, plotBot, { color: LINE, width: 0.75 });
  for (let v = 0; v <= MAX + 1e-9; v += STEP) {
    const y = yv(v);
    line(PX0 - 0.06, y, PX0, y, { color: LINE, width: 0.75 });
    text(v >= MAX - 1e-9 ? "¥" + fmt(v) + "M" : fmt(v), PX0 - 0.75, y - 0.12, 0.66, 0.24, { align: "right" });
  }
  // legend, top left inside the plot (as the reference)
  [["pola", GREY], ["Jurlique", RED]].forEach(([nm, col], k) => {
    const lx = PX0 + 0.25 + k * 0.95;
    slide.addShape("rect", { x: lx, y: plotTop + 0.04, w: 0.13, h: 0.13, fill: { color: col }, line: { type: "none" } });
    text(nm, lx + 0.18, plotTop - 0.04, 0.8, 0.28);
  });
  // totals over the bars and dashed lines joining the bar tops and the pola tops
  s.total.forEach((t, i) => text(fmt(t), cx(i) - 0.35, yv(t) - 0.3, 0.7, 0.27, { size: PT, align: "center" }));
  for (let i = 0; i < n - 1; i++) {
    line(cx(i) + bw / 2, yv(s.total[i]), cx(i + 1) - bw / 2, yv(s.total[i + 1]), { dash: "dash", width: 1 });
    line(cx(i) + bw / 2, yv(s.pola[i]), cx(i + 1) - bw / 2, yv(s.pola[i + 1]), { dash: "dash", width: 1 });
  }
  // CAGR 2015-2021 column on the right, each value level with its segment of the last bar
  const CX = 8.35, CW = 1.3;
  text("CAGR", CX, top + 0.02, CW, 0.24, { align: "center", underline: true });
  text("2015-2021", CX, top + 0.25, CW, 0.24, { align: "center" });
  const last = n - 1, tJ = (yv(s.total[last]) + yv(s.pola[last])) / 2, tP = (yv(s.pola[last]) + plotBot) / 2;
  text(s.cagr.Jurlique, CX, tJ - 0.14, CW, 0.28, { size: PT, align: "center" });
  text(s.cagr.pola, CX, tP - 0.14, CW, 0.28, { size: PT, align: "center" });
}

scenario(SCEN[0], 1.5, 2.05, 3.95);
scenario(SCEN[1], 4.35, 4.95, 6.82);

L.save(pres, __dirname + "/candidate.pptx");
