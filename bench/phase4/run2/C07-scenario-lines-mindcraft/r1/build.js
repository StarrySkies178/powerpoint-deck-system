// C07 rebuild (run2 r1): two scenario line charts in the Mindcraft deck style.
// Layout: HALF2 with numbered panel heads, as the deck's two-panel analysis slides (Mindcraft 8 and 13: chip + bold headline
// + grey rule, italic chart title, grey reading box with round bullets at the bottom; a red bold italic label row under a
// chart, as the "Pull-up ratio" row of Mindcraft 8; a red ring around the key figure, as Mindcraft 4 and 5; note line above the source).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

// jszip ships with pptxgenjs: resolve it from where the harness finds pptxgenjs
const jszip = () => { const req = require("module").createRequire(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
  return require(req.resolve("jszip", { paths: [require("path").dirname(req.resolve("pptxgenjs"))] })); };

(async () => {
  const { pres, slide, P, S, B } = L.start({
    ref: "Case-2019-Mindcraft",
    title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
    source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
  });
  const C = P.C, F = P.THEME.bodyFontFace;
  const RED = C.navy, DARK = "5C5C5C", LIGHT = "A6A6A6", TXT = "000000";
  const years = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
  const serCol = [DARK, RED, LIGHT];   // optimistic, base, crush
  const labCol = [DARK, RED, "808080"];

  // tracker in the deck's form (Mindcraft 4, 8, 15): bold italic sections, red triangles between, current one in red
  const cr = ["Market Analysis", "Growth Strategy", "Financial Forecasting"], crX = [0.36, 2.88, 5.55];
  cr.forEach((c, i) => {
    slide.addText(c, { x: crX[i], y: 0.04, w: 3.0, h: 0.3, fontFace: F, fontSize: 14, bold: true, italic: true, color: i === 2 ? RED : "A6A6A6", margin: 0, valign: "middle", isTextBox: true });
    if (i) slide.addShape("triangle", { x: crX[i] - 0.45, y: 0.08, w: 0.2, h: 0.22, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  });
  // footer of the deck's master: grey rule above the source, logo bottom right (taken from the reference deck's master)
  slide.addShape("line", { x: 0, y: 7.212, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });
  const zip = await jszip().loadAsync(require("fs").readFileSync(require("path").join(__dirname, "../../../../../Templates/Case-2019-Mindcraft.pptx")));
  const logo = await zip.file("ppt/media/image1.png").async("base64");
  slide.addImage({ data: "image/png;base64," + logo, x: 11.642, y: 7.175, w: 1.137, h: 0.325 });

  // two panels, the deck's half-and-half split
  const top = B.y, bot = 6.86;
  const panels = [{ x: 0.37, y: top, w: 6.0, h: bot - top }, { x: 6.67, y: top, w: 6.06, h: bot - top }];
  S.composeSlide(pres, slide, {
    regions: panels,
    panels: [
      { headline: "Resilient growth under scenario analysis", draw: () => {} },
      { headline: "Guaranteed financial feasibility", draw: () => {} },
    ],
  });

  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 13, color: o.color || TXT, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true, underline: o.underline ? { style: "sng" } : undefined });

  // line chart: native lines (editable data) with the deck's look (no value axis, no gridlines); value labels are text boxes
  // placed on the points so the three close series stay readable (top series above, bottom series below, middle beside).
  function scenarioChart(px, py, pw, ph, series, vmin, vmax, fmt, stackK = 1) {
    const plot = { x: 0.08, y: 0.04, w: 0.86, h: 0.8 };   // inner plot area as a share of the chart frame
    slide.addChart(pres.ChartType.line, series.map((s) => ({ name: s.name, labels: years, values: s.values })), {
      x: px, y: py, w: pw, h: ph, layout: plot, chartColors: serCol, lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 6,
      showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: vmin, valAxisMaxVal: vmax, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      catAxisLabelFontSize: 12, catAxisLabelFontFace: F, catAxisLabelColor: TXT, catAxisLineShow: true, catAxisLineColor: LIGHT,
    });
    const ix = px + pw * plot.x, iy = py + ph * plot.y, iw = pw * plot.w, ih = ph * plot.h, n = years.length;
    const X = (i) => ix + (i + 0.5) * iw / n, Y = (v) => iy + ih * (1 - (v - vmin) / (vmax - vmin));
    // lines rise to the right, so a label above a point sits to its upper left and one below to its lower right
    const lw = 0.6, lh = 0.21, gap = 0.03, unit = ih / (vmax - vmin), need = (lh + 0.02) / unit;
    const above = (k, x, y) => t(fmt(series[k].values[i_]), x - lw + 0.06, y - gap - lh, lw, lh, { align: "right", color: labCol[k], bold: k === 1 });
    const below = (k, x, y) => t(fmt(series[k].values[i_]), x - 0.06, y + gap, lw, lh, { align: "left", color: labCol[k], bold: k === 1 });
    let i_ = 0;
    series[0].values.forEach((_, i) => {
      i_ = i; const v = series.map((s) => s.values[i]), x = X(i);
      if (i === 0) return t(fmt(v[0]), x - lw - 0.06, Y(v[0]) - lh / 2, lw, lh, { align: "right" });   // 2018: one shared point
      if (Math.min(v[0] - v[1], v[1] - v[2]) < stackK * need) { [0, 1, 2].forEach((k) => above(k, x, Y(v[0]) - (2 - k) * lh)); return; }   // too close: stack the three above the top point
      above(0, x, Y(v[0])); below(2, x, Y(v[2]));
      if (v[0] - v[1] > v[1] - v[2]) above(1, x, Y(v[1])); else below(1, x, Y(v[1]));   // middle series: on the side with more room
    });
    return { X, Y, ix, iw };
  }

  // ---------- panel 1: top line ----------
  const p1 = panels[0];
  t("CSS Top Line Scenario Analysis (¥ Bn)", p1.x, top + 0.5, p1.w, 0.32, { size: 14, italic: true });
  const s1 = [
    { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], cagr: "17%" },
    { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], cagr: "12%" },
    { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2], cagr: "8%" },
  ];
  const c1y = top + 0.9, c1h = 3.3, c1w = 4.2;
  const g1 = scenarioChart(p1.x, c1y, c1w, c1h, s1, 7.4, 19.0, (v) => v.toFixed(1), 1.15);
  // series names at the line ends + CAGR column (Mindcraft 4: underlined bold "CAGR" header beside the chart)
  const nameX = p1.x + c1w - 0.08, cagrX = p1.x + p1.w - 0.7;
  t("CAGR", cagrX, c1y - 0.12, 0.7, 0.26, { size: 14, bold: true, underline: true, align: "center" });
  const endY1 = [g1.Y(18.2) - 0.03, g1.Y(14.6), g1.Y(12.2) + 0.08];
  s1.forEach((s, k) => {
    t(s.name, nameX, endY1[k] - 0.13, 1.1, 0.26, { size: 14, color: k === 1 ? RED : TXT, bold: k === 1 });
    t(s.cagr, cagrX, endY1[k] - 0.13, 0.7, 0.26, { size: 14, align: "center", color: k === 1 ? RED : TXT, bold: k === 1 });
  });
  slide.addShape("ellipse", { x: cagrX + 0.02, y: endY1[0] - 0.2, w: 0.66, h: 0.4, fill: { type: "none" }, line: { color: RED, width: 1.5 } });

  // ---------- panel 2: capex ----------
  const p2 = panels[1];
  t("Required Annual Capex Scenario Analysis (¥ Mn)", p2.x, top + 0.5, p2.w, 0.32, { size: 14, italic: true });
  const s2 = [
    { name: "Optimistic", values: [200, 231, 244, 255, 292, 309] },
    { name: "Base", values: [200, 209, 216, 233, 268, 277] },
    { name: "Crush", values: [200, 175, 180, 201, 228, 243] },
  ];
  const c2y = top + 0.9, c2h = 2.35, c2w = 4.55, c2x = p2.x + 0.7;
  const g2 = scenarioChart(c2x, c2y, c2w, c2h, s2, 160, 322, (v) => String(v));
  const endY2 = [g2.Y(309) - 0.04, g2.Y(277), g2.Y(243) + 0.06];
  s2.forEach((s, k) => t(s.name, c2x + c2w - 0.08, endY2[k] - 0.13, 1.2, 0.26, { size: 14, color: k === 1 ? RED : TXT, bold: k === 1 }));
  // rows under the chart, aligned with the years (Mindcraft 8 "Pull-up ratio" row: red bold italic label, bold italic values)
  const rowY = c2y + c2h + 0.02, lab = { x: p2.x, w: 1.05 };
  slide.addText([{ text: "Capex burden" }, { text: "1", options: { superscript: true } }], { x: lab.x, y: rowY, w: lab.w + 0.6, h: 0.3, fontFace: F, fontSize: 14, bold: true, italic: true, color: RED, margin: 0, valign: "middle" });
  ["26%", "22%", "20%", "19%", "17%"].forEach((v, i) => t(v, g2.X(i + 1) - 0.35, rowY, 0.7, 0.3, { size: 14, bold: true, italic: true, align: "center" }));
  slide.addShape("line", { x: p2.x, y: rowY + 0.33, w: p2.w, h: 0, line: { color: LIGHT, width: 0.75, dashType: "dash" } });
  slide.addText([{ text: "Return on Capex under base case" }, { text: "2", options: { superscript: true } }], { x: lab.x, y: rowY + 0.37, w: 4.2, h: 0.3, fontFace: F, fontSize: 14, bold: true, italic: true, color: RED, margin: 0, valign: "middle" });
  t("~1.6 years", p2.x + 3.95, rowY + 0.37, 1.6, 0.3, { size: 14, bold: true, italic: true });

  // ---------- readings: grey box, round bullets, body size (Mindcraft 4 and 8) ----------
  const rd = (box, items) => {
    slide.addShape("rect", { ...box, fill: { color: C.g1 }, line: { type: "none" } });
    slide.addText(items.map((s) => ({ text: s, options: { bullet: { indent: 14 }, breakLine: true } })), { x: box.x + 0.08, y: box.y + 0.04, w: box.w - 0.16, h: box.h - 0.08,
      fontFace: F, fontSize: 14, color: TXT, valign: "middle", margin: 0, isTextBox: true, paraSpaceAfter: 0 });
  };
  const rdY = 5.55, rdH = bot - rdY;
  rd({ x: p1.x, y: rdY, w: p1.w, h: rdH }, ["Three cases all indicate above-market growth (7%)",
    "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"]);
  rd({ x: p2.x, y: rdY, w: p2.w, h: rdH }, ["Increasing capital expenditure is required to support the offline expansion strategy",
    "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"]);

  // note line above the source (Mindcraft 5 and 8)
  t("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store", 0.39, 6.93, 12.3, 0.26, { size: 10, italic: true, valign: "top" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
