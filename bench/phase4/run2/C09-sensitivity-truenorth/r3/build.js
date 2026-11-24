// Sensitivity analysis (backup slide), TrueNorth Pola deck as the style reference (deck-as-reference, leave-one-out).
// Form taken from the deck's own backup scenario chart (slide 23, "Pessimistic scenario" in the slide map): a bold
// scenario heading, a stacked column chart (pola grey at the bottom, Jurlique red on top) with the total over each
// column, dashed lines joining the column tops, a legend top-left and a "CAGR 2015-2021" column on the right with
// one rate per series beside its segment. Here two of them, stacked: Normal above Optimistic. No crumb, no source:
// the deck's backup slides have neither.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic",
});
const C = P.C, FONT = "Calibri";
const GREY = C.g3, RED = C.navy;   // grey3 A2A2A2 and main CC0000 of the profile
const years = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const r2 = (v) => Math.round(v * 100) / 100;
const t = (s, text, x, y, w, h, o = {}) => s.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 12, color: o.color || C.text, bold: !!o.bold,
  underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

function scenario(s, y0, name, totals, pola, cagr, axisMax) {
  // heading
  t(s, name, 0.38, y0, 4, 0.32, { size: 16, bold: true });
  // chart box and its plot area (inner layout set explicitly so the drawn totals and dashed lines sit on the columns)
  const box = { x: 0.45, y: y0 + 0.36, w: 7.75, h: 2.42 };
  const lay = { x: 0.085, y: 0.1, w: 0.905, h: 0.76 };
  const px = box.x + lay.x * box.w, py = box.y + lay.y * box.h, pw = lay.w * box.w, ph = lay.h * box.h;
  const gap = 55, cw = pw / years.length, bw = cw / (1 + gap / 100);
  const jur = totals.map((v, i) => r2(v - pola[i]));
  s.addChart(pres.ChartType.bar, [
    { name: "pola", labels: years, values: pola },
    { name: "Jurlique", labels: years, values: jur },
  ], {
    ...box, barDir: "col", barGrouping: "stacked", barGapWidthPct: gap, chartColors: [GREY, RED], layout: lay,
    showLegend: false, showValue: false,
    valAxisMinVal: 0, valAxisMaxVal: axisMax, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: `[>=${axisMax - 0.01}]"¥"0.0"M";0.0`,
    valAxisLabelFontSize: 12, valAxisLabelFontFace: FONT, valAxisLabelColor: C.text, valAxisLineShow: true, valAxisLineColor: "000000",
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: 12, catAxisLabelFontFace: FONT, catAxisLabelColor: C.text, catAxisLineShow: true, catAxisLineColor: "000000", catAxisMajorTickMark: "none",
    dataBorder: { pt: 0.75, color: "FFFFFF" },
  });
  const yOf = (v) => py + ph * (1 - v / axisMax), xc = (i) => px + (i + 0.5) * cw;
  // totals over the columns, dashed lines joining the tops of the stack and of the pola segment
  totals.forEach((v, i) => t(s, String(v), xc(i) - 0.35, yOf(v) - 0.3, 0.7, 0.26, { size: 14, align: "center" }));
  for (let i = 0; i + 1 < years.length; i++) {
    for (const arr of [totals, pola]) {
      const x1 = xc(i) + bw / 2, x2 = xc(i + 1) - bw / 2, y1 = yOf(arr[i]), y2 = yOf(arr[i + 1]);
      s.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1), flipV: y2 < y1, line: { color: "000000", width: 0.75, dashType: "dash" } });
    }
  }
  // legend, top left inside the plot
  [["pola", GREY], ["Jurlique", RED]].forEach(([n, col], k) => {
    const lx = px + 0.55 + k * 0.85;
    s.addShape("rect", { x: lx, y: py + 0.06, w: 0.11, h: 0.11, fill: { color: col }, line: { type: "none" } });
    t(s, n, lx + 0.15, py - 0.01, 0.75, 0.25, { size: 12 });
  });
  // CAGR column, one rate beside the middle of each segment of the last column
  const cx = 8.35, cwid = 1.2, last = years.length - 1;
  t(s, "CAGR", cx, y0 + 0.36, cwid, 0.22, { size: 14, underline: true, align: "center" });
  t(s, "2015-2021", cx, y0 + 0.6, cwid, 0.24, { size: 14, align: "center" });
  t(s, cagr.jurlique, cx, (yOf(totals[last]) + yOf(pola[last])) / 2 - 0.13, cwid, 0.26, { size: 14, align: "center" });
  t(s, cagr.pola, cx, (yOf(pola[last]) + yOf(0)) / 2 - 0.13, cwid, 0.26, { size: 14, align: "center" });
}

// the deck's grey footer band (on every slide of the reference; the style profile has no footer entry, so drawn here)
slide.addShape("rect", { x: 0, y: 7.2, w: 10, h: 0.3, fill: { color: "CCCCCC" }, line: { type: "none" } });

scenario(slide, 1.5, "Normal Scenario",
  [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58],
  { jurlique: "15%", pola: "25%" }, 2.0);
scenario(slide, 4.33, "Optimistic Scenario",
  [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78],
  { jurlique: "19%", pola: "27%" }, 2.5);

L.save(pres, __dirname + "/candidate.pptx");
