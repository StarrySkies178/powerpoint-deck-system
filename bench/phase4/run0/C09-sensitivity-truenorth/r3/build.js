// C09 sensitivity (TrueNorth deck as reference, leave-one-out).
// Form taken from the deck's other scenario backup slide (23, "Pessimistic Scenario"): bold scenario heading,
// stacked columns pola (grey, bottom) + Jurlique (red, top), value axis in ¥M, legend top-left, totals over each bar,
// dashed connectors between bar tops, "CAGR 2015-2021" column on the right beside each segment of the last bar.
// Here two scenarios stacked one above the other. Frame: red title band (style profile), logo + grey footer bar
// from the reference deck's slide layout.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
const C = P.C, FONT = "Calibri";
const RED = "CC0000", GREY = "A2A2A2", BLACK = "000000";

// reference deck frame: logo top right, grey bar along the bottom (its slide layout)
slide.addImage({ path: path.join(__dirname, "truenorth-logo.jpg"), x: 8.54, y: 0, w: 1.42, h: 0.41 });
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });

const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];

function scenario(sc) {
  const { head, top, plotTop, plotH, max, totals, pola, cagr } = sc;
  const jur = totals.map((t, i) => Math.round((t - pola[i]) * 100) / 100);
  // heading
  slide.addText(head, { x: 0.35, y: top, w: 4, h: 0.36, fontFace: FONT, fontSize: 16, bold: true, color: BLACK, margin: 0.04, valign: "middle" });
  // plot area (inner) in inches; the chart frame leaves room for axis labels left and category labels below
  const PL = { x: 1.09, y: plotTop, w: 6.88, h: plotH };
  const F = { x: 0.3, y: plotTop - 0.12, w: 7.8, h: plotH + 0.48 };
  const lay = { x: (PL.x - F.x) / F.w, y: (PL.y - F.y) / F.h, w: PL.w / F.w, h: PL.h / F.h };
  const fmt = `[>=${max - 0.05}]"¥"0.0"M";0.0`;
  slide.addChart(pres.ChartType.bar, [
    { name: "pola", labels: YEARS, values: pola },
    { name: "Jurlique", labels: YEARS, values: jur },
  ], {
    ...F, layout: lay, barDir: "col", barGrouping: "stacked", barGapWidthPct: 52, chartColors: [GREY, RED],
    dataBorder: { pt: 1, color: "FFFFFF" }, showLegend: false, showValue: false,
    valAxisMinVal: 0, valAxisMaxVal: max, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: fmt,
    valAxisLabelFontSize: 12, valAxisLabelFontFace: FONT, valAxisLabelColor: BLACK,
    valAxisLineShow: true, valAxisLineColor: "595959", valAxisMajorTickMark: "out",
    catAxisLabelFontSize: 12, catAxisLabelFontFace: FONT, catAxisLabelColor: BLACK,
    catAxisLineShow: false, catAxisMajorTickMark: "none",
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
  });
  // geometry of the bars
  const pitch = PL.w / YEARS.length, bw = pitch / 1.52;
  const yOf = (v) => PL.y + PL.h * (1 - v / max);
  const cx = (i) => PL.x + pitch * (i + 0.5);
  // category axis line drawn over the chart, so the bars' white separators do not break it
  slide.addShape("line", { x: PL.x, y: PL.y + PL.h, w: PL.w, h: 0, line: { color: "595959", width: 0.75 } });
  // totals over the bars
  totals.forEach((t, i) => slide.addText(t.toFixed(1), { x: cx(i) - 0.35, y: yOf(t) - 0.3, w: 0.7, h: 0.26, fontFace: FONT, fontSize: 14, color: BLACK, align: "center", valign: "bottom", margin: 0 }));
  // dashed connectors from each bar's top right to the next bar's top left (total and pola level)
  const dash = (x1, y1, x2, y2) => slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1), flipV: y2 < y1, line: { color: BLACK, width: 1, dashType: "dash" } });
  for (let i = 0; i < YEARS.length - 1; i++) {
    dash(cx(i) + bw / 2, yOf(totals[i]), cx(i + 1) - bw / 2, yOf(totals[i + 1]));
    dash(cx(i) + bw / 2, yOf(pola[i]), cx(i + 1) - bw / 2, yOf(pola[i + 1]));
  }
  // legend, top left inside the plot
  const ly = PL.y + 0.02;
  [["pola", GREY, 1.6], ["Jurlique", RED, 2.25]].forEach(([n, col, x]) => {
    slide.addShape("rect", { x, y: ly + 0.07, w: 0.1, h: 0.1, fill: { color: col }, line: { type: "none" } });
    slide.addText(n, { x: x + 0.12, y: ly, w: 0.8, h: 0.24, fontFace: FONT, fontSize: 12, color: BLACK, margin: 0, valign: "middle" });
  });
  // CAGR column: header, then the rate beside each segment of the last bar
  const cx0 = 8.05, cw = 1.3, last = YEARS.length - 1;
  slide.addText([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "2015-2021" }],
    { x: cx0, y: top + 0.05, w: cw, h: 0.46, fontFace: FONT, fontSize: 12, color: BLACK, align: "center", valign: "top", margin: 0 });
  slide.addText(cagr.jurlique, { x: cx0, y: (yOf(totals[last]) + yOf(pola[last])) / 2 - 0.13, w: cw, h: 0.26, fontFace: FONT, fontSize: 12, color: BLACK, align: "center", valign: "middle", margin: 0 });
  slide.addText(cagr.pola, { x: cx0, y: (yOf(pola[last]) + yOf(0)) / 2 - 0.13, w: cw, h: 0.26, fontFace: FONT, fontSize: 12, color: BLACK, align: "center", valign: "middle", margin: 0 });
}

scenario({ head: "Normal Scenario", top: 1.48, plotTop: 2.08, plotH: 1.86, max: 2.0,
  totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58],
  cagr: { jurlique: "15%", pola: "25%" } });
scenario({ head: "Optimistic Scenario", top: 4.36, plotTop: 4.96, plotH: 1.86, max: 2.5,
  totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78],
  cagr: { jurlique: "19%", pola: "27%" } });

L.save(pres, __dirname + "/candidate.pptx");
