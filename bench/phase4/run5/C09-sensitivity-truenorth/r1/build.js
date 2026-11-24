// C09 rebuild: sensitivity analysis, two stacked column charts (normal / optimistic scenario), TrueNorth Pola deck style.
// Deck as reference, leave-one-out: layout taken from the deck's closest other slide, the backup scenario chart
// (slide-map code small-multiples, "Pessimistic scenario"): bold scenario heading, stacked columns pola (grey, bottom)
// and Jurlique (red), totals over each column joined by dashed lines, CAGR 2015-2021 column on the right.
// Two of those charts are stacked here, one per scenario. Native charts (editable data); totals, dashed links,
// legend and CAGR column are drawn over the inner plot area, whose position is fixed with a manual layout.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const title = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const { pres, slide, P, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title });
const C = P.C, FONT = (prof && prof.fonts.latin) || "Calibri";
const BODYPT = (prof && prof.body.pt) || 14, LBL = BODYPT;   // chart text at the deck's body size (its scenario chart labels are body size)
const RED = C.navy, GREY = C.g3, DARK = C.text;          // main colour CC0000, grey A2A2A2 as in the deck

const years = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const r2 = (v) => Math.round(v * 100) / 100;
const scenarios = [
  { name: "Normal Scenario", totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7],
    pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1],
    pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" } },
];
const MAX = 2.5, STEP = 0.5;                              // one scale for both scenarios, so they compare by eye

const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || LBL, color: o.color || DARK,
  bold: !!o.bold, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

function scenarioChart(sc, top, height) {
  // heading
  t(sc.name, 0.42, top, 4.5, 0.34, { size: BODYPT + 2, bold: true });
  // chart box and inner plot area (manual layout, fractions of the chart box)
  const box = { x: 0.35, y: top + 0.38, w: 7.75, h: height - 0.38 };
  const lay = { x: 0.085, y: 0.07, w: 0.9, h: 0.78 };
  const pa = { x: box.x + lay.x * box.w, y: box.y + lay.y * box.h, w: lay.w * box.w, h: lay.h * box.h };
  const jur = sc.totals.map((v, i) => r2(v - sc.pola[i]));
  const gap = 55;
  slide.addChart(pres.ChartType.bar, [
    { name: "pola", labels: years, values: sc.pola },
    { name: "Jurlique", labels: years, values: jur },
  ], { ...box, barDir: "col", barGrouping: "stacked", overlap: 100, barGapWidthPct: gap, chartColors: [GREY, RED],
    showLegend: false, showValue: false, layout: lay,
    valAxisMinVal: 0, valAxisMaxVal: MAX, valAxisMajorUnit: STEP, valAxisHidden: false, valAxisLineShow: true,
    valAxisLabelFormatCode: `[=${MAX}]"¥${MAX.toFixed(1)}M";0.0`, valAxisLabelFontSize: LBL, valAxisLabelFontFace: FONT, valAxisLabelColor: DARK,
    valAxisLineColor: "777777", valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: LBL, catAxisLabelFontFace: FONT, catAxisLabelColor: DARK, catAxisLineColor: "777777", catAxisLineShow: true,
    dataBorder: { pt: 0.75, color: "FFFFFF" } });
  // geometry of the columns
  const n = years.length, slot = pa.w / n, bw = slot / (1 + gap / 100);
  const cx = (i) => pa.x + slot * (i + 0.5), yv = (v) => pa.y + pa.h * (1 - v / MAX);
  // dashed links between column tops (totals) and between pola tops, as in the deck's scenario chart
  const link = (vals) => vals.forEach((v, i) => { if (i === n - 1) return;
    const x1 = cx(i) + bw / 2, x2 = cx(i + 1) - bw / 2, y1 = yv(v), y2 = yv(vals[i + 1]);
    slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1) || 0.001, flipV: y2 < y1,
      line: { color: DARK, width: 1, dashType: "dash" } }); });
  link(sc.totals); link(sc.pola);
  // totals over each column
  sc.totals.forEach((v, i) => t(v.toFixed(1), cx(i) - 0.4, yv(v) - 0.3, 0.8, 0.26, { size: LBL, align: "center", valign: "bottom" }));
  // legend, top left inside the plot
  const lx = pa.x + 0.35, ly = pa.y + 0.02;
  [["pola", GREY], ["Jurlique", RED]].forEach(([name, col], k) => {
    const x = lx + k * 0.85;
    slide.addShape("rect", { x, y: ly + 0.08, w: 0.11, h: 0.11, fill: { color: col }, line: { type: "none" } });
    t(name, x + 0.15, ly, 0.65, 0.27, { size: LBL });
  });
  // CAGR 2015-2021 column on the right, each rate level with its segment of the last column
  const cxR = 8.95, last = n - 1;
  t("CAGR", cxR - 0.6, pa.y - 0.12, 1.2, 0.24, { size: LBL, align: "center", underline: true });
  t("2015-2021", cxR - 0.6, pa.y + 0.12, 1.2, 0.24, { size: LBL, align: "center" });
  t(sc.cagr.jur, cxR - 0.5, yv((sc.totals[last] + sc.pola[last]) / 2) - 0.13, 1.0, 0.26, { size: LBL, align: "center" });
  t(sc.cagr.pola, cxR - 0.5, yv(sc.pola[last] / 2) - 0.13, 1.0, 0.26, { size: LBL, align: "center" });
}

// the deck's grey footer band (every slide of the reference carries it)
slide.addShape("rect", { x: 0, y: 7.2, w: 10, h: 0.3, fill: { color: "D9D9D9" }, line: { type: "none" } });
// source line on the band, at the deck's source position and size (drawn after the band so it stays on top)
const SL = (prof && prof.source_line) || { x: 0.35, y: 7.24, pt: 10, colour: "000000" };
slide.addText("Source: TrueNorth Analysis", { x: SL.x, y: SL.y, w: 6.5, h: 0.22, fontFace: FONT, fontSize: SL.pt, color: SL.colour, valign: "top", margin: 0, isTextBox: true });
scenarioChart(scenarios[0], 1.5, 2.8);
scenarioChart(scenarios[1], 4.32, 2.8);

L.save(pres, __dirname + "/candidate.pptx");
