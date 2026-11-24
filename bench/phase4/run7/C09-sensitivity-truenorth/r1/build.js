// C09 run7 r1: sensitivity analysis, two scenario charts stacked, in the style of the TrueNorth Pola deck.
// Deck as reference, leave-one-out. Form taken from the deck's own backup scenario chart (slide 23, "Pessimistic scenario")
// and the financial-model slide (16): stacked columns drawn with shapes (the deck has no native charts), grey pola at the
// foot and red Jurlique on top, total above each column, dashed lines joining the column tops and the pola tops,
// a thin value axis with "¥…M" on the top tick, legend at the top left of the plot, and a "CAGR 2015-2021" column on the
// right with each value level with its segment of the last column. Built by hand in the deck style (no generator draws
// this drawn form; stackedCagr is a native chart with a table).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P, HOUSE } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.navy;          // main colour of the profile (CC0000)
const GREY = "A2A2A2";       // the deck's light grey for the pola segment
const AXIS = "777777", TXT = "000000";

const periods = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const scenarios = [
  { name: "Normal Scenario", top: 2.0, totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { Jurlique: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", top: 2.5, totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { Jurlique: "19%", pola: "27%" } },
];

function t(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || TXT, bold: !!o.bold, underline: o.underline ? { style: "sng" } : undefined,
    align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
}
const line = (x1, y1, x2, y2, o = {}) => slide.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
  flipV: (y2 < y1) !== (x2 < x1), line: { color: o.color || AXIS, width: o.width || 0.75, dashType: o.dash || "solid" } });

function scenarioChart(sc, by) {
  // block: header, then plot; block height ~2.8 in
  t(sc.name, 0.38, by, 4.5, 0.36, { pt: 16, bold: true });
  const px0 = 1.12, px1 = 7.9, top = by + 0.62, base = by + 2.38, n = periods.length;
  const slot = (px1 - px0) / n, bw = slot * 0.66;
  const Y = (v) => base - (v / sc.top) * (base - top);
  // value axis: vertical line, ticks every 0.5, "¥…M" on the top tick
  line(px0, top, px0, base);
  line(px0, base, px1, base);
  for (let v = 0; v <= sc.top + 1e-9; v += 0.5) {
    const y = Y(v);
    line(px0 - 0.05, y, px0, y);
    const lab = v.toFixed(1) + (Math.abs(v - sc.top) < 1e-9 ? "M" : "");
    t(Math.abs(v - sc.top) < 1e-9 ? "¥" + lab : lab, px0 - 0.72, y - 0.12, 0.64, 0.24, { pt: 13, align: "right" });
  }
  // legend, top left of the plot
  const ly = top - 0.02;
  [["pola", GREY], ["Jurlique", RED]].forEach(([nm, col], k) => {
    const lx = px0 + 0.25 + k * 0.85;
    slide.addShape("rect", { x: lx, y: ly + 0.07, w: 0.11, h: 0.11, fill: { color: col }, line: { type: "none" } });
    t(nm, lx + 0.15, ly, 0.75, 0.25, { pt: 13 });
  });
  // columns
  const xs = [];
  periods.forEach((p, i) => {
    const x = px0 + i * slot + (slot - bw) / 2, tot = sc.totals[i], po = sc.pola[i];
    xs.push(x);
    slide.addShape("rect", { x, y: Y(tot), w: bw, h: Y(po) - Y(tot), fill: { color: RED }, line: { color: "FFFFFF", width: 0.75 } });
    slide.addShape("rect", { x, y: Y(po), w: bw, h: base - Y(po), fill: { color: GREY }, line: { color: "FFFFFF", width: 0.75 } });
    t(tot.toFixed(1), x - 0.2, Y(tot) - 0.3, bw + 0.4, 0.26, { pt: 14, align: "center" });
    t(p, px0 + i * slot - 0.05, base + 0.03, slot + 0.1, 0.26, { pt: 13, align: "center" });
  });
  // dashed lines joining the column tops and the pola tops
  for (let i = 0; i < n - 1; i++) {
    line(xs[i] + bw, Y(sc.totals[i]), xs[i + 1], Y(sc.totals[i + 1]), { color: TXT, dash: "dash" });
    line(xs[i] + bw, Y(sc.pola[i]), xs[i + 1], Y(sc.pola[i + 1]), { color: TXT, dash: "dash" });
  }
  // CAGR 2015-2021 column, values level with the segments of the last column
  const cx = 8.25, cw = 1.3, last = n - 1;
  t("CAGR", cx, by + 0.22, cw, 0.24, { pt: 13, align: "center", underline: true });
  t("2015-2021", cx, by + 0.44, cw, 0.24, { pt: 13, align: "center" });
  t(sc.cagr.Jurlique, cx, (Y(sc.totals[last]) + Y(sc.pola[last])) / 2 - 0.13, cw, 0.26, { pt: 14, align: "center" });
  t(sc.cagr.pola, cx, (Y(sc.pola[last]) + base) / 2 - 0.13, cw, 0.26, { pt: 14, align: "center" });
}

// the deck's grey foot band (on every rendered slide of the deck; the style master does not draw it)
slide.addShape("rect", { x: 0, y: 7.2, w: 10, h: 0.3, fill: { color: "D9D9D9" }, line: { type: "none" } });
scenarioChart(scenarios[0], 1.5);
scenarioChart(scenarios[1], 4.3);

L.save(pres, __dirname + "/candidate.pptx");
