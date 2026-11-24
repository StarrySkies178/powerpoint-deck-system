// C09 rebuild (run1 r1): sensitivity analysis, two scenario charts stacked, in the TrueNorth Pola deck's style.
// Deck as reference, leave-one-out. Layout taken from the deck's closest other slide: the backup scenario chart
// (slide-map: "small-multiples | backup | scenario chart", slide 23): bold 18 pt scenario heading, stacked columns
// pola (grey) + Jurlique (red) with totals on top and dashed lines joining the bar tops, value axis in ¥M with the
// currency on the top tick, legend at the plot's top left, and a "CAGR 2015-2021" column at the right whose values
// sit level with their segment of the last bar. Two of those panels, one above the other, fill the body.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const SCEN = [
  { name: "Normal Scenario", max: 2.0, totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7],
    pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { Jurlique: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", max: 2.5, totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1],
    pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { Jurlique: "19%", pola: "27%" } },
];

(async () => {
  const { pres, slide, P, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
  const C = P.C, FONT = (prof && prof.fonts.latin) || "Calibri";
  const RED = C.navy, GREY = C.g3, TXT = C.text;                // main colour CC0000, grey A2A2A2, text black
  const LBL = prof.body.label_pt, BODYPT = prof.body.pt;          // 12 / 14 pt
  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || BODYPT, color: o.color || TXT,
    bold: !!o.bold, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

  // deck furniture of every slide: grey band at the foot (the logo is added by build.py)
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });

  // panel geometry (inches): two panels, each = heading, chart, CAGR column
  const PX = 1.1, PW = 6.84, n = YEARS.length, pitch = PW / n, barW = pitch * 0.67, gap = Math.round((pitch - barW) / barW * 100);
  const panels = [{ head: 1.5, top: 2.02, bot: 3.92 }, { head: 4.28, top: 4.8, bot: 6.72 }];

  SCEN.forEach((s, k) => {
    const g = panels[k], PH = g.bot - g.top, yv = (v) => g.bot - (v / s.max) * PH;
    const jur = s.totals.map((v, i) => Math.round((v - s.pola[i]) * 100) / 100);
    t(s.name, 0.4, g.head, 3.5, 0.36, { size: 18, bold: true, valign: "top" });

    // chart box: plot area placed exactly (inner layout), axis labels outside it
    const cb = { x: 0.35, y: g.top - 0.12, w: 7.75, h: PH + 0.47 };
    const lay = { x: (PX - cb.x) / cb.w, y: (g.top - cb.y) / cb.h, w: PW / cb.w, h: PH / cb.h };
    slide.addChart(pres.ChartType.bar, [
      { name: "pola", labels: YEARS, values: s.pola },
      { name: "Jurlique", labels: YEARS, values: jur },
    ], { ...cb, layout: lay, barDir: "col", barGrouping: "stacked", chartColors: [GREY, RED], barGapWidthPct: gap,
      dataBorder: { pt: 0.75, color: "FFFFFF" }, showLegend: false, showValue: false, dataLabelFontSize: BODYPT, legendFontSize: BODYPT,
      catAxisLabelFontSize: BODYPT, catAxisLabelColor: TXT, catAxisLabelFontFace: FONT, catAxisLineShow: true, catAxisLineColor: TXT,
      catAxisMajorTickMark: "none",
      valAxisHidden: false, valAxisMinVal: 0, valAxisMaxVal: s.max, valAxisMajorUnit: 0.5, valAxisLineShow: true, valAxisLineColor: TXT,
      valAxisLabelFontSize: BODYPT, valAxisLabelColor: TXT, valAxisLabelFontFace: FONT, valAxisMajorTickMark: "out",
      valAxisLabelFormatCode: `[=${s.max}]"¥${s.max.toFixed(1)}M";0.0`,
      valGridLine: { style: "none" }, catGridLine: { style: "none" } });
    // right edge of the plot frame, as in the deck's scenario chart
    slide.addShape("line", { x: PX + PW, y: g.top, w: 0, h: PH, line: { color: TXT, width: 0.75 } });

    // legend at the plot's top left
    const ly = g.top + 0.03;
    [["pola", GREY, 0.42], ["Jurlique", RED, 0.75]].reduce((x, [nm, col, w]) => {
      slide.addShape("rect", { x, y: ly + 0.06, w: 0.11, h: 0.11, fill: { color: col }, line: { type: "none" } });
      t(nm, x + 0.15, ly, w, 0.23, { size: LBL });
      return x + 0.15 + w + 0.08;
    }, PX + 0.55);

    // totals on top, dashed lines joining the tops of the totals and of the pola segments
    s.totals.forEach((v, i) => {
      const cx = PX + pitch * (i + 0.5);
      t(v.toFixed(1), cx - 0.35, yv(v) - 0.27, 0.7, 0.25, { size: BODYPT, align: "center", valign: "bottom" });
      if (i < n - 1) [[v, s.totals[i + 1]], [s.pola[i], s.pola[i + 1]]].forEach(([a, b]) => {
        const x1 = cx + barW / 2, x2 = cx + pitch - barW / 2, y1 = yv(a), y2 = yv(b);
        slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1), flipV: y2 < y1,
          line: { color: TXT, width: 1, dashType: "dash" } });
      });
    });

    // CAGR 2015-2021 column, each value level with its segment of the last bar
    const cx = 8.77, last = n - 1;
    t("CAGR", cx - 0.5, g.head + 0.02, 1.0, 0.24, { size: LBL, align: "center", underline: true });
    t("2015-2021", cx - 0.5, g.head + 0.25, 1.0, 0.24, { size: LBL, align: "center" });
    t(s.cagr.Jurlique, cx - 0.4, yv((s.totals[last] + s.pola[last]) / 2) - 0.13, 0.8, 0.26, { size: BODYPT, align: "center" });
    t(s.cagr.pola, cx - 0.4, yv(s.pola[last] / 2) - 0.13, 0.8, 0.26, { size: BODYPT, align: "center" });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
