// C09 sensitivity analysis, TrueNorth (Pola) deck as the style reference.
// Layout taken from the deck's other backup scenario slide (slide 23, "Pessimistic scenario", small-multiples):
// bold scenario heading, stacked pola / Jurlique columns with totals on top, dashed lines joining the bar tops
// and the pola tops, value axis with the unit on the top tick, CAGR 2015-2021 column on the right at the
// height of each 2021e segment. Here two such panels are stacked, one per scenario. Backup slides of this deck
// carry no breadcrumb, source line or page number; the grey bottom band is on every slide of the deck.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
const C = P.C, FONT = P.THEME.bodyFontFace;

// grey bottom band of the deck (every slide)
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "D9D9D9" }, line: { type: "none" } });

const years = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const scenarios = [
  { name: "Normal Scenario", axisMax: 2.0, top: "¥2.0M",
    totals: ["0.5", "0.6", "0.7", "0.8", "0.9", "1.1", "1.3", "1.5", "1.7"],
    pola: ["0.1", "0.12", "0.13", "0.18", "0.25", "0.32", "0.38", "0.5", "0.58"],
    cagr: { jurlique: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", axisMax: 2.5, top: "¥2.5M",
    totals: ["0.5", "0.6", "0.7", "0.8", "1.1", "1.3", "1.5", "1.8", "2.1"],
    pola: ["0.1", "0.12", "0.13", "0.22", "0.32", "0.4", "0.5", "0.62", "0.78"],
    cagr: { jurlique: "19%", pola: "27%" } },
];

const LBL = 14, TOT = 14, HDR = 12;   // chart text at the deck's body size (as drawn on its scenario slide); the CAGR header smaller
const CH = { x: 0.3, w: 7.75 };               // chart frame (x, width)
const PL = { x: 0.095, w: 0.895, y: 0.15, h: 0.72 };   // plot area inside the chart (fractions)

function panel(sc, y0) {
  const chartY = y0 + 0.38, chartH = 2.42;
  P.txt(slide, sc.name, 0.4, y0, 3.2, 0.36, { fontSize: 18, keepSize: true, noScale: true, bold: true, margin: 0.04, valign: "middle" });

  const tot = sc.totals.map(Number), pola = sc.pola.map(Number);
  const jur = tot.map((t, i) => Math.round((t - pola[i]) * 100) / 100);
  slide.addChart(pres.ChartType.bar, [
    { name: "pola", labels: years, values: pola },
    { name: "Jurlique", labels: years, values: jur },
  ], {
    x: CH.x, y: chartY, w: CH.w, h: chartH, barDir: "col", barGrouping: "stacked", chartColors: [C.g3, C.navy],
    barGapWidthPct: 50, dataBorder: { pt: 0.75, color: "FFFFFF" }, showLegend: false, showValue: false,
    valAxisMinVal: 0, valAxisMaxVal: sc.axisMax, valAxisMajorUnit: 0.5, valAxisHidden: false, valAxisLineShow: true,
    valAxisLineColor: C.g5, valAxisLabelFormatCode: `[>=${sc.axisMax}]"¥"0.0"M";0.0`, valAxisLabelFontSize: LBL,
    valAxisLabelColor: C.text, valAxisLabelFontFace: FONT, valAxisMajorTickMark: "out",
    catAxisLineShow: true, catAxisLineColor: C.g5, catAxisLabelFontSize: LBL, catAxisLabelColor: C.text, catAxisLabelFontFace: FONT,
    catAxisMajorTickMark: "none", valGridLine: { style: "none" }, catGridLine: { style: "none" },
    layout: PL,
  });

  // geometry of the plot area, to place totals, connectors and CAGRs on the bars
  const px = CH.x + PL.x * CH.w, pw = PL.w * CH.w, py = chartY + PL.y * chartH, ph = PL.h * chartH;
  const n = years.length, slot = pw / n, bw = slot / 1.5;           // gap width 50% of the bar
  const cx = (i) => px + (i + 0.5) * slot, vy = (v) => py + ph * (1 - v / sc.axisMax);

  // legend inside the plot, top left (as on the deck's scenario slide)
  [["pola", C.g3], ["Jurlique", C.navy]].forEach(([nm, col], k) => {
    const lx = px + 0.55 + k * 0.8;
    slide.addShape("rect", { x: lx, y: py - 0.02, w: 0.11, h: 0.11, fill: { color: col }, line: { type: "none" } });
    P.txt(slide, nm, lx + 0.13, py - 0.13, 0.75, 0.3, { fontSize: LBL, keepSize: true, noScale: true, margin: 0.02, valign: "middle" });
  });

  // totals over the bars, dashed lines joining the bar tops and the pola tops
  const dash = (x1, y1, x2, y2) => slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(0.001, Math.abs(y2 - y1)),
    flipV: y2 < y1, line: { color: C.text, width: 0.75, dashType: "dash" } });
  sc.totals.forEach((t, i) => {
    P.txt(slide, t, cx(i) - 0.4, vy(tot[i]) - 0.32, 0.8, 0.3, { fontSize: TOT, keepSize: true, noScale: true, align: "center", valign: "bottom", margin: 0 });
    if (i < n - 1) {
      dash(cx(i) + bw / 2, vy(tot[i]), cx(i + 1) - bw / 2, vy(tot[i + 1]));
      dash(cx(i) + bw / 2, vy(pola[i]), cx(i + 1) - bw / 2, vy(pola[i + 1]));
    }
  });

  // CAGR 2015-2021 column on the right, each rate at the height of its 2021e segment
  const kx = 8.3, kw = 1.0, last = n - 1;
  slide.addText([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "2015-2021" }],
    { x: kx - 0.1, y: py - 0.42, w: kw + 0.2, h: 0.46, fontFace: FONT, fontSize: HDR, color: C.text, align: "center", valign: "top", margin: 0, isTextBox: true });
  const mid = (a, b) => (vy(a) + vy(b)) / 2;
  P.txt(slide, sc.cagr.jurlique, kx, mid(tot[last], pola[last]) - 0.15, kw, 0.3, { fontSize: TOT, keepSize: true, noScale: true, align: "center", valign: "middle", margin: 0 });
  P.txt(slide, sc.cagr.pola, kx, mid(pola[last], 0) - 0.15, kw, 0.3, { fontSize: TOT, keepSize: true, noScale: true, align: "center", valign: "middle", margin: 0 });
}

panel(scenarios[0], 1.47);
panel(scenarios[1], 4.33);

L.save(pres, __dirname + "/candidate.pptx");
