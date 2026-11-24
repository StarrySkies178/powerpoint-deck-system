// C09 rebuild: two scenario charts stacked one above the other, in the TrueNorth deck's backup-chart form
// (scenario heading, stacked columns pola/Jurlique with totals and dashed links, CAGR column on the right: deck slide 23).
const path = require("path"), fs = require("fs"), cp = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const ROOT = path.resolve(__dirname, "../../../../..");

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const SCEN = [
  { name: "Normal Scenario", total: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" }, max: 2.0 },
  { name: "Optimistic Scenario", total: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" }, max: 2.5 },
];

(async () => {
  const { pres, slide, P } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
  const C = P.C, FONT = P.THEME.bodyFontFace;
  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 12, color: o.color || C.text, bold: !!o.bold,
    underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

  // deck frame pieces the master does not carry: grey foot band and the team logo (stored with the deck's other slides)
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
  const logo = path.join(__dirname, "logo.jpg");
  if (!fs.existsSync(logo)) {
    try { fs.writeFileSync(logo, cp.execFileSync("unzip", ["-p", path.join(ROOT, "Objects/store/media.zip"), "bb793eb28421bcf5.jpg"])); } catch (e) { }
  }
  if (fs.existsSync(logo) && fs.statSync(logo).size > 0) slide.addImage({ path: logo, x: 8.54, y: 0, w: 1.42, h: 0.41 });

  const PX = 1.1, PW = 6.85, n = YEARS.length, catW = PW / n, gap = 0.5, bw = catW / (1 + gap);
  const barX = (i) => PX + i * catW + (catW - bw) / 2;
  const dash = (x1, y1, x2, y2) => slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(0.001, Math.abs(y2 - y1)), flipV: y2 < y1,
    line: { color: C.text, width: 0.75, dashType: "dash" } });

  SCEN.forEach((s, k) => {
    const y0 = 1.5 + k * 2.84;                   // block top
    const plotTop = y0 + 0.5, plotH = 1.92, plotBot = plotTop + plotH;
    t(s.name, 0.4, y0, 4, 0.34, { size: 18, bold: true });

    // native stacked chart, plot area fixed so the drawn totals and links sit on the bars
    const CB = { x: 0.3, y: plotTop - 0.1, w: 7.75, h: plotH + 0.42 };
    const jur = s.total.map((v, i) => Math.round((v - s.pola[i]) * 100) / 100);
    slide.addChart(pres.ChartType.bar, [{ name: "pola", labels: YEARS, values: s.pola }, { name: "Jurlique", labels: YEARS, values: jur }], {
      ...CB, barDir: "col", barGrouping: "stacked", chartColors: [C.g3, C.navy], barGapWidthPct: gap * 100, showLegend: false, showValue: false,
      layout: { x: (PX - CB.x) / CB.w, y: (plotTop - CB.y) / CB.h, w: PW / CB.w, h: plotH / CB.h },
      valAxisMinVal: 0, valAxisMaxVal: s.max, valAxisMajorUnit: 0.5, valAxisHidden: false, valAxisLineShow: true, valAxisLineColor: "595959",
      valAxisLabelFormatCode: `[>=${s.max}]"¥"0.0"M";0.0`, valAxisLabelFontSize: 14, valAxisLabelColor: C.text, valAxisLabelFontFace: FONT,
      valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: false, catAxisMajorTickMark: "none",
      catAxisLabelFontSize: 14, catAxisLabelColor: C.text, catAxisLabelFontFace: FONT, dataBorder: { pt: 0.75, color: "FFFFFF" } });

    const yOf = (v) => plotBot - (v / s.max) * plotH;
    // baseline drawn again on top: the white segment borders would otherwise break it under each bar
    slide.addShape("line", { x: PX, y: plotBot, w: PW, h: 0, line: { color: "595959", width: 0.75 } });
    // legend top-left inside the plot
    const lx = PX + 0.5, ly = plotTop + 0.02;
    [["pola", C.g3], ["Jurlique", C.navy]].forEach(([nm, col], j) => {
      const x = lx + j * 0.8;
      slide.addShape("rect", { x, y: ly + 0.06, w: 0.1, h: 0.1, fill: { color: col }, line: { type: "none" } });
      t(nm, x + 0.15, ly, 0.7, 0.24, { size: 14 });
    });
    // totals over the bars and dashed links between tops (total and pola)
    s.total.forEach((v, i) => {
      t(v.toFixed(1), barX(i) - 0.1, yOf(v) - 0.3, bw + 0.2, 0.26, { size: 14, align: "center", valign: "bottom" });
      if (i < n - 1) {
        dash(barX(i) + bw, yOf(v), barX(i + 1), yOf(s.total[i + 1]));
        dash(barX(i) + bw, yOf(s.pola[i]), barX(i + 1), yOf(s.pola[i + 1]));
      }
    });
    // CAGR 2015-2021 column, each rate level with its segment of the last bar
    const cx = 8.2, cw = 1.2, last = n - 1;
    t("CAGR", cx, plotTop - 0.48, cw, 0.22, { size: 14, underline: true, align: "center" });
    t("2015-2021", cx, plotTop - 0.24, cw, 0.22, { size: 14, align: "center" });
    t(s.cagr.jur, cx, (yOf(s.total[last]) + yOf(s.pola[last])) / 2 - 0.13, cw, 0.26, { size: 14, align: "center" });
    t(s.cagr.pola, cx, (yOf(s.pola[last]) + plotBot) / 2 - 0.13, cw, 0.26, { size: 14, align: "center" });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
