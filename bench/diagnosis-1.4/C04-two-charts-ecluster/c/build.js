// C04 two charts (E-Cluster), roadmap 1.4 diagnosis, variant c: edit the closest OTHER slide of the deck.
// Slide taken: Case-2019-E-Cluster slide 5 (store id case19-ecluster-005), slide-map layout T2B1:
// panel 1 stacked columns with a CAGR table, panel 2 a second chart, panel 3 three icon cards in a grey band.
// That is exactly the prompt's shape (two chart panels over three icon boxes), so it is the closest slide.
// build.js draws the frame in the deck's style profile and the charts slide 5 cannot carry (its columns and
// bubbles are vectorised drawings, not chart data): native stacked columns, CTF revenue columns, 100% split.
// build.py then places slide 5's own stored pieces (panel chips, sub-headlines, unit lines, CAGR table cells,
// grey band with dividers, the three card texts, logo) at their original boxes and refills their text.
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
    crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
    source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  });
  const S = require(path.join(__dirname, "../../../../Generators/patterns_story.js"));
  const NAVY = "10366C", LIGHT = "C1DBEB", TXT = "000000", GREY = "7E7E7E";
  const T = (t, x, y, w, h, o = {}) => P.txt(slide, t, x, y, w, h, { noScale: true, margin: 0, ...o });
  const line = (x, y, w, h, color, width) => slide.addShape("line", { x, y, w, h, line: { color, width } });

  // sub-headline rules of panels 1 and 2 (stripped from the stored slide as repeated frame lines)
  line(0.27, 1.76, 6.13, 0, NAVY, 1.5);
  line(6.86, 1.76, 5.95, 0, NAVY, 1.5);

  // ---- panel 1: stacked columns, fashion jewelry highlighted
  const yrs = ["2013", "2018", "2023E"], fine = [53, 72, 99], fash = [2, 2, 8];
  const c1 = { x: 0.45, y: 2.45, w: 2.7, h: 2.35 }, MAX = 115;
  S.chartIn(pres, slide, { type: "stacked", labels: yrs, series: [{ name: "Fine jewelry", values: fine }, { name: "Fashion jewelry", values: fash }],
    colors: [LIGHT, NAVY], showValue: false,
    options: { showLegend: false, valAxisMinVal: 0, valAxisMaxVal: MAX, barGapWidthPct: 70, catAxisLabelFontSize: 14, catAxisLineShow: true, catAxisLineColor: GREY,
      layout: { x: 0.0, y: 0.0, w: 1.0, h: 0.86 } } }, c1);
  // totals over the columns (the deck writes them above each bar)
  const pw = c1.w / 3;
  yrs.forEach((_, i) => {
    const tot = fine[i] + fash[i], top = c1.y + c1.h * 0.86 * (1 - tot / MAX) * 0.93 + 0.02;
    T(String(tot), c1.x + i * pw, top - 0.3, pw, 0.28, { fontSize: 14, align: "center", color: TXT });
  });
  // legend / CAGR row labels, rows lined up with the stored CAGR cells
  const rows = [["Fashion jewelry", NAVY, 2.98], ["Fine jewelry", LIGHT, 3.58], ["Total", null, 4.18]];
  rows.forEach(([lab, col, y]) => {
    if (col) slide.addShape("rect", { x: 3.26, y: y + 0.07, w: 0.16, h: 0.16, fill: { color: col }, line: { type: "none" } });
    T(lab, 3.47, y, 1.5, 0.3, { fontSize: 14, bold: lab === "Fashion jewelry", color: lab === "Fashion jewelry" ? NAVY : TXT, valign: "middle" });
  });
  line(3.26, 4.08, 3.14, 0, "C3C6CA", 0.75);

  // ---- panel 2a: CTF annual revenue, CAGR callout
  const c2 = { x: 7.0, y: 2.75, w: 2.6, h: 2.05 };
  S.chartIn(pres, slide, { type: "column", labels: ["2013", "2018"], series: [{ name: "CTF revenue", values: [47, 48] }], colors: [NAVY],
    options: { showValue: true, dataLabelPosition: "inEnd", dataLabelColor: "FFFFFF", dataLabelFontSize: 15, valAxisMinVal: 0, valAxisMaxVal: 52,
      barGapWidthPct: 60, catAxisLabelFontSize: 14, catAxisLineShow: true, catAxisLineColor: GREY, layout: { x: 0.0, y: 0.0, w: 1.0, h: 0.84 } } }, c2);
  slide.addShape("line", { x: 7.45, y: 2.62, w: 1.7, h: 0, line: { color: TXT, width: 1.25, endArrowType: "triangle" } });
  slide.addShape("ellipse", { x: 7.67, y: 2.42, w: 1.26, h: 0.4, fill: { color: "FFFFFF" }, line: { color: TXT, width: 1 } });
  T("CAGR 1%", 7.67, 2.42, 1.26, 0.4, { fontSize: 13, bold: true, align: "center", valign: "middle", color: TXT });

  // divider between the two exhibits of panel 2 (the deck separates side-by-side exhibits with thin grey rules)
  line(9.85, 1.95, 0, 2.85, "C3C6CA", 0.75);

  // ---- panel 2b: CTF 2018 revenue by segment, 100% column
  const c3 = { x: 10.05, y: 2.45, w: 1.25, h: 2.35 };
  S.chartIn(pres, slide, { type: "stacked100", labels: ["2018"], series: [{ name: "Fine jewelry", values: [89] }, { name: "Fashion jewelry", values: [11] }],
    colors: [LIGHT, NAVY], showValue: false,
    options: { showLegend: false, barGapWidthPct: 25, catAxisLabelFontSize: 14, catAxisLineShow: true, catAxisLineColor: GREY, layout: { x: 0.0, y: 0.0, w: 1.0, h: 0.86 } } }, c3);
  const ph = c3.h * 0.86 * 0.93, py = c3.y + 0.04;
  T("11%", c3.x, py, c3.w, ph * 0.11, { fontSize: 14, bold: true, align: "center", valign: "middle", color: "FFFFFF" });
  T("89%", c3.x, py + ph * 0.11, c3.w, ph * 0.89, { fontSize: 15, bold: true, align: "center", valign: "middle", color: TXT });
  T("Fashion jewelry", 11.4, py - 0.05, 1.6, 0.3, { fontSize: 14, bold: true, color: NAVY, valign: "middle" });
  T("Fine jewelry", 11.4, py + ph * 0.5 - 0.15, 1.6, 0.3, { fontSize: 14, color: TXT, valign: "middle" });

  // ---- panel 3 icons (generator icons; the stored slide's icons belong to its own drivers)
  [["users", 0.76], ["gavel", 4.8], ["trophy", 9.3]].forEach(([n, x]) => P.icon(slide, n, x, 5.47, 0.36, { color: "253449" }));

  // ---- note and bottom rule
  slide.addText("Note: *CTF is the abbreviation for Chow Tai Fook", { x: 0.27, y: 7.04, w: 8, h: 0.2, fontFace: "Arial", fontSize: 10, color: "585858", italic: true, margin: 0, valign: "top", isTextBox: true });
  line(0, 7.25, 13.333, 0, NAVY, 0.75);

  await L.save(pres, __dirname + "/candidate.pptx");
})();
