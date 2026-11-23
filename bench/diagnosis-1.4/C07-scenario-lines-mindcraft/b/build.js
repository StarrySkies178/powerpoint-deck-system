// C07 variant b: two-panel scenario slide (twin line charts with commentary boxes), Mindcraft deck style.
// Style: Style/refs/Case-2019-Mindcraft.profile.json (via the harness). Panel geometry read off the deck's
// other two-panel slides (renders 04, 05: halves at x 0.37 and 6.70, chips at the body top 1.39 in).
// Generators: frame + crumb (harness), S.subhead (profile chip + rule), S.chartIn (native line charts),
// S.readingBox (grey reading boxes). Point labels, CAGR column, legend and capex rows are placed from the
// chart's fixed plot area (manual layout), so they sit exactly on the categories and line ends.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
  const { pres, slide, P, S } = L.start({
    ref: "Case-2019-Mindcraft", title: TITLE,
    source: [{ text: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg", options: { italic: true } }],
  });
  const C = P.C, txt = P.txt;
  const RED = C.navy;                       // profile main = C00000
  slide.slideNumber = null;                 // this slide carries no page number (logo only at the bottom right)
  // breadcrumb tracker: bold italic steps at the profile's crumb place and size, red triangle markers between them,
  // the current step in red (crumbLine() greys the markers when main = the current colour, and sets no italic)
  ["Market Analysis", "Growth Strategy", "Financial Forecasting"].forEach((t, i) => {
    const x = 0.36 + i * 2.62, cur = i === 2;
    slide.addText(t, { x, y: 0.05, w: cur ? 3.2 : 2.0, h: 0.3, fontFace: P.THEME.bodyFontFace, fontSize: 14, bold: true, italic: true,
      color: cur ? RED : "A6A6A6", margin: 0, valign: "middle", isTextBox: true, objectName: "crumb " + (i + 1) });
    if (i) slide.addShape("triangle", { x: x - 0.45, y: 0.08, w: 0.2, h: 0.24, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  });
  const SER = [
    { name: "Optimistic", col: RED, lab: RED, bold: true },
    { name: "Base", col: "5C5C5C", lab: "000000" },
    { name: "Crush", col: "A6A6A6", lab: "000000" },
  ];
  const YEARS = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];

  // ---- panel frames (halves of the body, as on the deck's other two-panel slides)
  const PL = { x: 0.37, w: 6.08 }, PR = { x: 6.70, w: 6.06 }, TOP = 1.39;
  const hh = S.subhead(slide, 1, "Resilient growth under scenario analysis", PL.x, TOP, PL.w);
  S.subhead(slide, 2, "Guaranteed financial feasibility", PR.x, TOP, PR.w);
  const yT = TOP + hh - 0.02;              // chart title line
  const italic = (t, x, y, w, h, o = {}) => slide.addText(t, { x, y, w, h, fontFace: P.THEME.bodyFontFace, fontSize: o.pt || 13, italic: true,
    bold: !!o.bold, color: o.color || "000000", align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
  italic("CSS Top Line Scenario Analysis (¥ Bn)", PL.x, yT, PL.w, 0.3);
  italic("Required Annual Capex Scenario Analysis (¥ Mn)", PR.x, yT, PR.w, 0.3);

  // ---- line chart with a fixed plot area; returns a point -> slide position mapper
  const CH_Y = yT + 0.36, CH_H = 2.62;
  function lineChart(box, values, min, max, plotX, plotW) {
    const lay = { x: plotX / box.w, y: 0.06, w: plotW / box.w, h: 0.8 };
    S.chartIn(pres, slide, {
      type: "line", labels: YEARS, series: SER.map((s, i) => ({ name: s.name, values: values[i] })), highlight: 0,
      colors: SER.map((s) => s.col), showValue: false,
      options: { showLegend: false, layout: lay, valAxisMinVal: min, valAxisMaxVal: max, valAxisHidden: true, valGridLine: { style: "none" },
        catAxisLineShow: true, catAxisLineColor: "A6A6A6", catAxisLabelFontSize: 12, catAxisLabelColor: "000000", lineSize: 2,
        lineDataSymbol: "circle", lineDataSymbolSize: 7 },
    }, { x: box.x, y: box.y, w: box.w, h: box.h });
    const px = box.x + plotX, py = box.y + box.h * lay.y, ph = box.h * lay.h;
    return (i, v) => ({ x: px + (i + 0.5) * plotW / 6, y: py + ph * (1 - (v - min) / (max - min)) });
  }
  // point labels: optimistic above, base and crush below; the shared start value once
  function pointLabels(pos, values, fmt, skipBase = []) {
    const lw = 0.7, lh = 0.2;
    const p0 = pos(0, values[0][0]);
    txt(slide, fmt(values[0][0]), p0.x - lw - 0.06, p0.y - lh / 2, lw, lh, { fontSize: 11, keepSize: true, align: "right", valign: "middle", margin: 0 });
    values.forEach((vals, s) => vals.forEach((v, i) => {
      if (i === 0 || (s === 1 && skipBase.includes(i))) return;
      const p = pos(i, v), above = s === 0;
      txt(slide, fmt(v), p.x - lw / 2, above ? p.y - lh - 0.06 : p.y + 0.06, lw, lh,
        { fontSize: 11, keepSize: true, align: "center", margin: 0, bold: !!SER[s].bold, color: SER[s].lab });
    }));
  }

  // ---- panel 1: top line
  const V1 = [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]];
  const box1 = { x: PL.x, y: CH_Y, w: 4.95, h: CH_H };
  const pos1 = lineChart(box1, V1, 7.4, 18.9, 0.05, 4.85);
  pointLabels(pos1, V1, (v) => v.toFixed(1), [1, 2]);
  // base 2019E-2020E sit close to the other two lines: their labels go right of the point
  [1, 2].forEach((i) => { const p = pos1(i, V1[1][i]);
    slide.addText(V1[1][i].toFixed(1), { x: p.x + 0.08, y: p.y - 0.085, w: 0.4, h: 0.17, fontFace: P.THEME.bodyFontFace, fontSize: 10, color: "000000",
      fill: { color: "FFFFFF" }, align: "center", valign: "middle", margin: 0, isTextBox: true }); });
  // CAGR column beside the line ends
  const cx = box1.x + box1.w + 0.12, cw = PL.x + PL.w - cx;
  slide.addText([{ text: "CAGR", options: { bold: true, underline: { style: "sng" }, breakLine: true } }, { text: "18-23E" }],
    { x: cx, y: yT, w: cw, h: 0.46, fontFace: P.THEME.bodyFontFace, fontSize: 12, color: "000000", align: "center", valign: "top", margin: 0, isTextBox: true });
  ["17%", "12%", "8%"].forEach((g, s) => {
    const p = pos1(5, V1[s][5]);
    txt(slide, g, cx, p.y - 0.13, cw, 0.26, { fontSize: 12, keepSize: true, align: "center", valign: "middle", margin: 0, bold: s === 0, color: s === 0 ? RED : "000000" });
  });
  // legend: one row, line-and-marker swatches
  const yLg = CH_Y + CH_H + 0.04;
  SER.forEach((s, i) => {
    const x = PL.x + 0.7 + i * 1.75, y = yLg + 0.14;
    slide.addShape("line", { x, y, w: 0.42, h: 0, line: { color: s.col, width: 2 } });
    slide.addShape("ellipse", { x: x + 0.21 - 0.05, y: y - 0.05, w: 0.1, h: 0.1, fill: { color: s.col }, line: { color: s.col, width: 0.75 } });
    txt(slide, s.name, x + 0.5, yLg, 1.25, 0.28, { fontSize: 12, keepSize: true, valign: "middle", margin: 0 });
  });

  // ---- panel 2: capex
  const V2 = [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]];
  const LBW = 1.15;                                       // row-label column on the left of the plot
  const box2 = { x: PR.x, y: CH_Y, w: PR.w, h: CH_H };
  const pos2 = lineChart(box2, V2, 150, 318, LBW, PR.w - LBW - 0.05);
  pointLabels(pos2, V2, (v) => String(v));
  // labelled rows under the chart: capex burden per forecast year, then the payback figure
  const yR1 = CH_Y + CH_H + 0.02, rh = 0.3;
  slide.addShape("rect", { x: PR.x, y: yR1, w: PR.w, h: rh, fill: { color: "FFFFFF" }, line: { type: "none" } });
  txt(slide, [{ text: "Capex burden" }, { text: "1", options: { superscript: true } }], PR.x, yR1, LBW + 0.6, rh, { fontSize: 11, keepSize: true, bold: true, valign: "middle", margin: 0 });
  ["26%", "22%", "20%", "19%", "17%"].forEach((v, k) => {
    const p = pos2(k + 1, 0);
    italic(v, p.x - 0.4, yR1, 0.8, rh, { pt: 12, align: "center" });
  });
  const yR2 = yR1 + rh + 0.02;
  slide.addShape("line", { x: PR.x, y: yR2 - 0.01, w: PR.w, h: 0, line: { color: "D5D5D5", width: 0.75, dashType: "dash" } });
  txt(slide, [{ text: "Return on capex under base case" }, { text: "2", options: { superscript: true } }], PR.x, yR2, 4.2, rh, { fontSize: 11, keepSize: true, bold: true, valign: "middle", margin: 0 });
  { const p = pos2(5, 0); italic("~1.6 years", p.x - 0.75, yR2, 1.2, rh, { pt: 12, bold: true, color: RED, align: "center" }); }

  // ---- reading boxes (same height and line on both panels)
  const yB = yR2 + rh + 0.1, hB = 6.86 - yB;
  S.readingBox(slide, ["Three cases all indicate **above-market growth (7%)**",
    "Under the optimistic case, **~17% 5-year** could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"],
    { x: PL.x, y: yB, w: PL.w, h: hB }, { size: 12 });
  S.readingBox(slide, ["**Increasing capital expenditure** is required to support the offline expansion strategy",
    "Yearly capex accounts for **~20% of liquidity**, with quick return (1.6yrs), indicating a good financial feasibility"],
    { x: PR.x, y: yB, w: PR.w, h: hB }, { size: 12 });

  // ---- footer: notes line over the source, thin rule, firm name in the logo slot (no logo file in Objects/Brand)
  italic("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
    0.39, 6.92, 12.3, 0.24, { pt: 10 });
  slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "D5D5D5", width: 0.75 } });
  txt(slide, "MindCraft", 11.55, 7.22, 1.45, 0.26, { fontSize: 13, keepSize: true, bold: true, color: RED, align: "right", valign: "middle", margin: 0, name: "logo (firm name)" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
