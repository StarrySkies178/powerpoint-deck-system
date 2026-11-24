// C09 sensitivity analysis, TrueNorth Pola deck as the style reference (deck as reference, leave-one-out).
// Form: the deck's own backup scenario chart (stacked columns pola + Jurlique, totals on top, dashed connectors between
// the column tops, "CAGR 2015-2021" column on the right; Style/slide-map "Pessimistic scenario", backup small-multiples),
// here two scenarios stacked one above the other. Look from Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";

(async () => {
  const { pres, slide, P, HOUSE, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
  const C = P.C, F = P.THEME.bodyFontFace, BODYPT = prof.body.pt, LBL = BODYPT;   // chart text at the deck body size (deck_lint body size)
  const RED = C.navy, GREY = C.g3, INK = C.text;
  const W = HOUSE.W, H = HOUSE.H;

  // deck frame: the grey footer band every slide of the reference carries
  slide.addShape("rect", { x: 0, y: 7.19, w: W, h: H - 7.19, fill: { color: "D9D9D9" }, line: { type: "none" } });
  P.txt(slide, "Source: TrueNorth Analysis", prof.source_line.x, 7.22, 6, 0.24, { fontSize: prof.source_line.pt, keepSize: true, noScale: true, color: INK, valign: "middle", margin: 0 });

  const periods = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
  const scenarios = [
    { name: "Normal Scenario (¥M)", totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" } },
    { name: "Optimistic Scenario (¥M)", totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" } },
  ];
  const MAX = 2.5;                    // one scale for both scenarios, so the two charts compare at a glance
  const n = periods.length, GAPPCT = 50;

  // geometry (inches): two bands, each = sub-headline + chart, CAGR column on the right
  const bands = [{ y: 1.52, h: 2.78 }, { y: 4.36, h: 2.78 }];
  const CH = { x: 0.3, w: 7.95 };                 // chart frame
  const LAY = { x: 0.085, y: 0.17, w: 0.905, h: 0.68 };   // plot area inside the chart frame (fractions)
  const CAGRX = 8.35, CAGRW = 1.5;

  scenarios.forEach((s, k) => {
    const B = bands[k];
    // sub-headline (the deck's bold black scenario heading)
    P.txt(slide, s.name, 0.4, B.y, 5, 0.32, { fontSize: BODYPT, keepSize: true, noScale: true, bold: true, color: INK, valign: "middle", margin: 0 });
    const cy = B.y + 0.36, chh = B.h - 0.36;
    const jur = s.totals.map((t, i) => Math.round((t - s.pola[i]) * 100) / 100);
    slide.addChart(pres.ChartType.bar, [
      { name: "pola", labels: periods, values: s.pola },
      { name: "Jurlique", labels: periods, values: jur },
    ], {
      x: CH.x, y: cy, w: CH.w, h: chh, barDir: "col", barGrouping: "stacked", chartColors: [GREY, RED], barGapWidthPct: GAPPCT,
      layout: LAY, showLegend: false, showValue: false,
      valAxisMinVal: 0, valAxisMaxVal: MAX, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: "0.0", valAxisHidden: false,
      valAxisLabelFontSize: LBL, valAxisLabelColor: INK, valAxisLabelFontFace: F, valAxisLineShow: true, valAxisLineColor: INK,
      valGridLine: { style: "none" }, catGridLine: { style: "none" },
      catAxisLabelFontSize: LBL, catAxisLabelColor: INK, catAxisLabelFontFace: F, catAxisLineShow: true, catAxisLineColor: INK,
      dataBorder: { pt: 0.75, color: "FFFFFF" },
    });
    // plot area in slide inches
    const px = CH.x + LAY.x * CH.w, pw = LAY.w * CH.w, py = cy + LAY.y * chh, ph = LAY.h * chh;
    const cw = pw / n, bw = cw / (1 + GAPPCT / 100), cx = (i) => px + (i + 0.5) * cw, yv = (v) => py + ph * (1 - v / MAX);

    // legend, top left inside the chart (as the deck's scenario chart)
    [["pola", GREY], ["Jurlique", RED]].forEach(([nm, col], j) => {
      const lx = px + 0.35 + j * 0.9, ly = cy + 0.06;
      slide.addShape("rect", { x: lx, y: ly + 0.07, w: 0.13, h: 0.13, fill: { color: col }, line: { type: "none" } });
      P.txt(slide, nm, lx + 0.17, ly, 0.75, 0.27, { fontSize: LBL, keepSize: true, noScale: true, color: INK, valign: "middle", margin: 0 });
    });

    // totals on top of each column
    s.totals.forEach((t, i) => P.txt(slide, t.toFixed(1), cx(i) - 0.35, yv(t) - 0.3, 0.7, 0.27, { fontSize: LBL, keepSize: true, noScale: true, color: INK, align: "center", valign: "bottom", margin: 0 }));
    // dashed connectors between neighbouring column tops (totals and pola)
    [s.totals, s.pola].forEach((vals) => {
      for (let i = 0; i < n - 1; i++) {
        const x1 = cx(i) + bw / 2, x2 = cx(i + 1) - bw / 2, y1 = yv(vals[i]), y2 = yv(vals[i + 1]);
        const up = y2 < y1;
        slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(0.001, Math.abs(y2 - y1)), flipV: up, line: { color: INK, width: 1, dashType: "dash" } });
      }
    });

    // CAGR 2015-2021 column, each value level with its segment of the 2021 column
    P.txt(slide, [{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "2015-2021" }], CAGRX, cy - 0.02, CAGRW, 0.5,
      { fontSize: LBL, keepSize: true, noScale: true, color: INK, align: "center", valign: "top", margin: 0 });
    const last = n - 1, t = s.totals[last], p = s.pola[last];
    P.txt(slide, s.cagr.jur, CAGRX, (yv(t) + yv(p)) / 2 - 0.15, CAGRW, 0.3, { fontSize: LBL, keepSize: true, noScale: true, color: INK, align: "center", valign: "middle", margin: 0 });
    P.txt(slide, s.cagr.pola, CAGRX, (yv(p) + yv(0)) / 2 - 0.15, CAGRW, 0.3, { fontSize: LBL, keepSize: true, noScale: true, color: INK, align: "center", valign: "middle", margin: 0 });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
