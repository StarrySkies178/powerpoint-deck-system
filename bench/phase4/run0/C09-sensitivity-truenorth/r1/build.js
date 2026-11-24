// C09 rebuild (deck as reference: TrueNorth Pola). Two scenario charts stacked, in the look of the deck's
// backup scenario chart (other-slides render 23): bold 18 pt scenario heading, stacked columns pola (grey,
// bottom) + Jurlique (red), totals over each column joined by dashed lines, the same for the pola tops,
// a value axis whose top label carries the unit, legend top-left, CAGR 2015-2021 column on the right
// aligned with each segment of the last column. Frame from the deck's style profile; grey footer band and
// logo as on every slide of the deck.
const path = require("path"), cp = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const REF = "Case-2016-TrueNorth-Pola-China-growth";

const { pres, slide, P } = L.start({ ref: REF,
  title: "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic" });
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.navy, GREY = C.g3, BLACK = C.text;   // main CC0000, grey3 A2A2A2, text 000000

// deck furniture: grey footer band and the TrueNorth logo top right (same place on every slide of the deck)
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
try {
  const logo = cp.execFileSync("unzip", ["-p", path.resolve(__dirname, "../../../../../Templates", REF + ".pptx"), "ppt/media/image1.jpg"]);
  slide.addImage({ data: "image/jpeg;base64," + logo.toString("base64"), x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
} catch (e) { /* logo is decoration only */ }

const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const SCEN = [
  { name: "Normal Scenario", total: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58],
    cagr: { jur: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", total: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78],
    cagr: { jur: "19%", pola: "27%" } },
];

const PT = 12;                                   // chart labels (deck's label size)
const PX = 1.07, PW = 6.84, N = YEARS.length;    // plot area: 9 columns at 0.76 in pitch, columns 0.51 in wide
const GAP = 49, pitch = PW / N, bw = pitch / (1 + GAP / 100);
const colX = (i) => PX + i * pitch + (pitch - bw) / 2;

function scenario(s, yb) {
  const top = yb + 0.55, PH = 1.95, base = top + PH;                // plot area inside the chart frame
  const max = Math.ceil(Math.max(...s.total) / 0.5) * 0.5;
  const yOf = (v) => base - (v / max) * PH;
  const jur = s.total.map((t, i) => Math.round((t - s.pola[i]) * 100) / 100);

  P.txt(slide, s.name, 0.4, yb, 3.5, 0.36, { fontSize: 18, bold: true, keepSize: true, noScale: true, margin: 0, valign: "top" });

  // native stacked chart (editable data); plot area pinned so the drawn labels and connectors line up with it
  const cx = 0.3, cy = top - 0.2, cw = 7.75, ch = PH + 0.5;
  const top1 = max.toFixed(1);
  slide.addChart(pres.ChartType.bar, [
    { name: "pola", labels: YEARS, values: s.pola },
    { name: "Jurlique", labels: YEARS, values: jur },
  ], { x: cx, y: cy, w: cw, h: ch, barDir: "col", barGrouping: "stacked", chartColors: [GREY, RED], barGapWidthPct: GAP,
    layout: { x: (PX - cx) / cw, y: (top - cy) / ch, w: PW / cw, h: PH / ch },
    showLegend: false, showValue: false,
    valAxisHidden: false, valAxisMinVal: 0, valAxisMaxVal: max, valAxisMajorUnit: 0.5,
    valAxisLabelFormatCode: `[=${top1}]"¥${top1}M";0.0`, valAxisLabelFontSize: PT, valAxisLabelColor: BLACK, valAxisLabelFontFace: FONT,
    valAxisLineShow: true, valAxisLineColor: "595959", valAxisLineSize: 0.75, valGridLine: { style: "none" },
    catAxisLabelFontSize: PT, catAxisLabelColor: BLACK, catAxisLabelFontFace: FONT, catAxisLineShow: true, catAxisLineColor: "595959", catAxisLineSize: 0.75,
    catGridLine: { style: "none" } });

  // legend, top-left inside the plot
  [["pola", GREY], ["Jurlique", RED]].forEach(([n, col], k) => {
    const lx = PX + 0.55 + k * 0.62;
    slide.addShape("rect", { x: lx, y: top + 0.04, w: 0.1, h: 0.1, fill: { color: col }, line: { type: "none" } });
    P.txt(slide, n, lx + 0.12, top - 0.04, 0.75, 0.26, { fontSize: PT, keepSize: true, noScale: true, margin: 0, valign: "middle" });
  });

  // totals over each column, and dashed connectors between the column tops and between the pola tops
  s.total.forEach((t, i) => P.txt(slide, t.toFixed(1), colX(i) - 0.15, yOf(t) - 0.3, bw + 0.3, 0.26,
    { fontSize: PT, keepSize: true, noScale: true, align: "center", valign: "bottom", margin: 0 }));
  const dash = (x1, y1, x2, y2) => slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(0.001, Math.abs(y2 - y1)),
    flipV: y2 < y1, line: { color: BLACK, width: 1, dashType: "dash" } });
  for (let i = 0; i < N - 1; i++) {
    dash(colX(i) + bw, yOf(s.total[i]), colX(i + 1), yOf(s.total[i + 1]));
    dash(colX(i) + bw, yOf(s.pola[i]), colX(i + 1), yOf(s.pola[i + 1]));
  }

  // CAGR 2015-2021 column, each value level with its segment of the last column
  const kx = 8.18, kw = 1.0;
  slide.addText([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "2015-2021" }],
    { x: kx, y: top - 0.5, w: kw, h: 0.46, fontFace: FONT, fontSize: PT, color: BLACK, align: "center", valign: "bottom", margin: 0, isTextBox: true });
  const last = N - 1;
  [[s.cagr.jur, (yOf(s.total[last]) + yOf(s.pola[last])) / 2], [s.cagr.pola, (yOf(s.pola[last]) + base) / 2]].forEach(([v, y]) =>
    P.txt(slide, v, kx, y - 0.14, kw, 0.28, { fontSize: PT, keepSize: true, noScale: true, align: "center", valign: "middle", margin: 0 }));
}

scenario(SCEN[0], 1.5);
scenario(SCEN[1], 4.33);

L.save(pres, __dirname + "/candidate.pptx");
