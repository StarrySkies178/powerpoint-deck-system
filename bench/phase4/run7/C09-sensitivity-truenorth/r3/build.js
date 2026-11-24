// C09 sensitivity (TrueNorth deck as reference, leave-one-out). Two scenario charts stacked, drawn with shapes the way
// the deck's own backup scenario chart (the pessimistic one) draws them: bold scenario heading, stacked columns
// pola (grey, foot) + Jurlique (red, top), a thin value axis with a ¥ unit, legend at the top left, totals over the bars,
// dashed lines joining the column tops and the pola tops, and a "CAGR 2015-2021" column on the right whose values sit
// level with each series' segment in the last column. Same value scale in both charts so the scenarios compare.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });

const RED = "CC0000", GREY = "A2A2A2", TEXT = "000000", AXIS = "777777", FONT = "Calibri";
const years = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const scenarios = [
  { name: "Normal Scenario", totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" } },
];

const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || TEXT, bold: !!o.bold,
  underline: o.u ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
const seg = (x1, y1, x2, y2, line) => slide.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001),
  h: Math.max(Math.abs(y2 - y1), 0.001), flipV: (y2 < y1) !== (x2 < x1), line });

const VMAX = 2.5, TICKS = [0, 0.5, 1.0, 1.5, 2.0, 2.5];
const AX = 1.1, PX0 = 1.18, PX1 = 8.05, n = years.length, pitch = (PX1 - PX0) / n, bw = pitch * 0.64;
const CX = 8.25, CW = 1.4;                                                // CAGR column

function chart(sc, top) {
  // heading
  T(sc.name, 0.42, top, 4, 0.34, { pt: 18, bold: true });
  const py0 = top + 0.55, py1 = top + 2.45, Y = (v) => py1 - (v / VMAX) * (py1 - py0);
  // value axis with ticks
  seg(AX, py0, AX, py1, { color: AXIS, width: 0.75 });
  seg(AX, py1, PX1 + 0.05, py1, { color: AXIS, width: 0.75 });
  TICKS.forEach((t) => {
    seg(AX - 0.05, Y(t), AX, Y(t), { color: AXIS, width: 0.75 });
    T((t === VMAX ? "¥" : "") + t.toFixed(1) + (t === VMAX ? "M" : ""), 0.15, Y(t) - 0.12, AX - 0.23, 0.24, { pt: 14, align: "right" });
  });
  // legend
  const ly = py0 - 0.02;
  [["pola", GREY], ["Jurlique", RED]].forEach(([nm, c], k) => {
    const lx = 1.55 + k * 0.9;
    slide.addShape("rect", { x: lx, y: ly + 0.06, w: 0.11, h: 0.11, fill: { color: c }, line: { type: "none" } });
    T(nm, lx + 0.15, ly - 0.01, 0.8, 0.24, { pt: 14 });
  });
  // columns
  const tops = [], ptops = [];
  years.forEach((yr, i) => {
    const x = PX0 + i * pitch + (pitch - bw) / 2, tot = sc.totals[i], p = sc.pola[i];
    slide.addShape("rect", { x, y: Y(p), w: bw, h: Y(0) - Y(p), fill: { color: GREY }, line: { color: "FFFFFF", width: 0.75 } });
    slide.addShape("rect", { x, y: Y(tot), w: bw, h: Y(p) - Y(tot), fill: { color: RED }, line: { color: "FFFFFF", width: 0.75 } });
    T(tot.toFixed(1), x - 0.1, Y(tot) - 0.28, bw + 0.2, 0.25, { pt: 14, align: "center" });
    T(yr, PX0 + i * pitch - 0.05, py1 + 0.04, pitch + 0.1, 0.25, { pt: 14, align: "center" });
    tops.push([x, x + bw, Y(tot)]); ptops.push([x, x + bw, Y(p)]);
  });
  // dashed joins between the column tops and between the pola tops
  for (let i = 1; i < n; i++) {
    seg(tops[i - 1][1], tops[i - 1][2], tops[i][0], tops[i][2], { color: TEXT, width: 1, dashType: "dash" });
    seg(ptops[i - 1][1], ptops[i - 1][2], ptops[i][0], ptops[i][2], { color: TEXT, width: 1, dashType: "dash" });
  }
  // CAGR column, values level with each series' segment in the last column
  T("CAGR", CX, top + 0.02, CW, 0.24, { pt: 14, u: true, align: "center" });
  T("2015-2021", CX, top + 0.26, CW, 0.24, { pt: 14, align: "center" });
  const last = n - 1, jm = (Y(sc.totals[last]) + Y(sc.pola[last])) / 2, pm = (Y(sc.pola[last]) + Y(0)) / 2;
  T(sc.cagr.jur, CX, jm - 0.13, CW, 0.26, { pt: 14, align: "center" });
  T(sc.cagr.pola, CX, pm - 0.13, CW, 0.26, { pt: 14, align: "center" });
}

chart(scenarios[0], 1.5);
chart(scenarios[1], 4.3);

L.save(pres, __dirname + "/candidate.pptx");
