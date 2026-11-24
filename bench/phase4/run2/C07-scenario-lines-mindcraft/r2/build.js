// C07 run2 rebuild 2: scenario line charts, in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Approach: the deck's style profile for the frame (title, red rule, fonts, source), the deck's own furniture drawn to
// match its other slides: italic breadcrumb with red triangles, red numbered chip + grey rule panel heads (Mindcraft 4, 8),
// italic chart titles, CAGR column with a hand-drawn red circle (Mindcraft 4, 5), a red bold italic ratio row under a
// chart (the "Pull-up ratio" row of Mindcraft 8), a dashed red callout (Mindcraft 5, 7) and grey reading boxes with
// plain bullets (Mindcraft 4, 8). Layout HALF2 as on Mindcraft 4 and 8. Charts are native line charts (editable data);
// value labels are placed over them from a fixed plot-area layout.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const RED = "C00000", DK = "5C5C5C", MID = "A6A6A6", RULE = "7E7E7E", BOX = "F1F1F1", BLACK = "000000";
const FONT = "Verdana";

(async () => {
  const { pres, slide } = L.start({
    ref: "Case-2019-Mindcraft",
    title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
    source: [{ text: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg", options: { italic: true } }],
  });
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: 14, color: BLACK, margin: 0,
    valign: "middle", isTextBox: true, ...o });

  // ---- breadcrumb: italic bold, grey items, current one red, red triangles between (as on every Mindcraft content slide)
  const crumb = [["Market Analysis", 0.36], ["Growth Strategy", 2.88], ["Financial Forecasting", 5.56]];
  crumb.forEach(([t, x], i) => T(t, x, 0.04, 2.9, 0.3, { bold: true, italic: true, color: i === 2 ? RED : MID }));
  [2.43, 5.19].forEach((x) => slide.addShape("triangle", { x, y: 0.08, w: 0.2, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } }));

  // ---- deck logo word mark, bottom right (on every slide of the deck)
  T("MindCraft", 11.25, 7.22, 1.5, 0.24, { bold: true, color: RED, fontSize: 13, align: "right" });

  // ---- panel heads: red square chip (italic white number), bold sentence, grey rule from the chip to the panel's end
  const head = (n, text, x, w) => {
    slide.addShape("rect", { x, y: 1.42, w: 0.35, h: 0.32, fill: { color: RED }, line: { type: "none" } });
    T(String(n), x, 1.42, 0.35, 0.32, { bold: true, italic: true, color: "FFFFFF", align: "center" });
    T(text, x + 0.45, 1.42, w - 0.45, 0.32, { bold: true });
    slide.addShape("line", { x: x + 0.35, y: 1.74, w: w - 0.35, h: 0, line: { color: RULE, width: 1.2 } });
  };
  const P1 = { x: 0.37, w: 6.05 }, P2 = { x: 6.68, w: 6.05 };
  head(1, "Resilient growth under scenario analysis", P1.x, P1.w);
  head(2, "Guaranteed financial feasibility", P2.x, P2.w);

  // ---- a native line chart with labels placed from a fixed plot area
  const years = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
  const LAY = { x: 0.03, y: 0.02, w: 0.94, h: 0.84 };      // inner plot area as fractions of the chart frame
  function lines(frame, series, min, max, fmt, labelPos) {
    slide.addChart(pres.ChartType.line, series.map((s) => ({ name: s.name, labels: years, values: s.values })), {
      ...frame, layout: LAY, chartColors: series.map((s) => s.color), lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 7,
      showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: min, valAxisMaxVal: max, valGridLine: { style: "none" },
      catGridLine: { style: "none" }, catAxisLabelFontSize: 12, catAxisLabelFontFace: FONT, catAxisLabelColor: BLACK,
      catAxisLineShow: true, catAxisLineColor: MID, valAxisLineShow: false,
    });
    const n = years.length;
    const px = (i) => frame.x + (LAY.x + ((i + 0.5) / n) * LAY.w) * frame.w;
    const py = (v) => frame.y + (LAY.y + (1 - (v - min) / (max - min)) * LAY.h) * frame.h;
    series.forEach((s, k) => s.values.forEach((v, i) => {
      if (i === 0 && k > 0) return;                          // the shared start value is labelled once
      const pos = (labelPos[k] && labelPos[k][i]) || (k === 0 ? "a" : "b");
      const lw = 0.7, lh = 0.25;
      const d = typeof pos === "object" ? pos : pos === "a" ? { dx: 0, dy: -(lh / 2 + 0.07) } : { dx: 0, dy: lh / 2 + 0.06 };
      if (d.leader) slide.addShape("line", { x: px(i) + d.leader[0], y: py(v) + d.leader[1], w: d.leader[2], h: d.leader[3], line: { color: DK, width: 0.75 } });
      T(fmt(v), px(i) + d.dx - lw / 2, py(v) + d.dy - lh / 2, lw, lh, { fontSize: 14, align: "center", color: i === 0 ? BLACK : s.label, bold: k === 0 && i === n - 1 });
    }));
    return { px, py };
  }

  // ======== panel 1: top line scenarios + CAGR column
  T("CSS Top Line Scenario Analysis (¥ Bn)", P1.x, 1.88, 4.6, 0.3, { italic: true });
  T([{ text: "CAGR", options: { bold: true, underline: { style: "sng" }, breakLine: true } }, { text: "18-23E" }], P1.x + 5.15, 1.8, 0.95, 0.5, { align: "center", valign: "top" });
  const top = [
    { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], color: RED, label: RED, cagr: "17%" },
    { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], color: DK, label: DK, cagr: "12%" },
    { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2], color: MID, label: "808080", cagr: "8%" },
  ];
  const F1 = { x: P1.x, y: 2.28, w: 4.0, h: 3.36 };
  // 2019E and 2020E: the three lines are too close for labels above or below the base points, so those two base labels
  // sit just right of their points; every label takes its line's colour so it reads with its scenario
  const g1 = lines(F1, top, 8.0, 18.7, (v) => v.toFixed(1),
    [{ 1: { dx: -0.14, dy: -0.2 } }, { 1: { dx: 0.29, dy: -0.03 }, 2: { dx: 0.33, dy: 0 }, 3: { dx: 0.1, dy: -0.205 }, 4: { dx: 0.05, dy: -0.205 }, 5: "a" }, null]);
  // series names at the line ends, CAGR beside them; the optimistic CAGR circled by hand as on Mindcraft 4 and 5
  const yEnd1 = [g1.py(18.2), g1.py(14.6), g1.py(12.2)];
  top.forEach((s, k) => {
    T(s.name, F1.x + F1.w - 0.08, yEnd1[k] - 0.13, 1.15, 0.26, { fontSize: 14, color: k === 0 ? RED : BLACK, bold: k === 0 });
    T(s.cagr, P1.x + 5.22, yEnd1[k] - 0.13, 0.8, 0.26, { fontSize: 14, align: "center", color: k === 0 ? RED : BLACK, bold: k === 0 });
  });
  slide.addShape("ellipse", { x: P1.x + 5.2, y: yEnd1[0] - 0.23, w: 0.84, h: 0.46, rotate: -6, fill: { type: "none" }, line: { color: RED, width: 2 } });

  // ======== panel 2: capex scenarios, capex burden row, return-on-capex callout
  T("Required Annual Capex Scenario Analysis (¥ Mn)", P2.x, 1.88, 6.0, 0.3, { italic: true });
  const capex = [
    { name: "Optimistic", values: [200, 231, 244, 255, 292, 309], color: RED, label: RED },
    { name: "Base", values: [200, 209, 216, 233, 268, 277], color: DK, label: DK },
    { name: "Crush", values: [200, 175, 180, 201, 228, 243], color: MID, label: "808080" },
  ];
  const F2 = { x: P2.x + 0.95, y: 2.3, w: 3.85, h: 2.85 };
  const g2 = lines(F2, capex, 140, 330, (v) => String(v), [null, { 1: "b", 2: "b", 3: "b", 4: "b", 5: "b" }, null]);
  [309, 277, 243].forEach((v, k) => T(capex[k].name, F2.x + F2.w - 0.08, g2.py(v) - 0.13, 1.3, 0.26, { fontSize: 14, color: k === 0 ? RED : BLACK, bold: k === 0 }));
  // dashed red callout in the free upper-left of the chart (form of Mindcraft 5 and 7)
  slide.addShape("rect", { x: P2.x + 0.05, y: 2.28, w: 1.95, h: 0.9, fill: { type: "none" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  T([{ text: "Return on capex", options: { breakLine: true } }, { text: "under base case²", options: { breakLine: true } }, { text: "~1.6 years", options: { bold: true, color: RED, fontSize: 14 } }],
    P2.x + 0.08, 2.31, 1.89, 0.84, { fontSize: 12, italic: true, align: "center" });
  // capex burden row under the years it covers (the "Pull-up ratio" row of Mindcraft 8)
  const rowY = F2.y + F2.h + 0.08;
  T("Capex burden¹", P2.x, rowY, 1.72, 0.3, { fontSize: 14, bold: true, italic: true, color: RED });
  ["26%", "22%", "20%", "19%", "17%"].forEach((t, i) => T(t, g2.px(i + 1) - 0.35, rowY, 0.7, 0.3, { fontSize: 14, bold: true, italic: true, align: "center" }));

  // ======== grey reading boxes with plain bullets, same height on both panels (Mindcraft 4 and 8)
  const rb = (x, w, bullets) => {
    slide.addShape("rect", { x, y: 5.68, w, h: 1.2, fill: { color: BOX }, line: { type: "none" } });
    slide.addText(bullets.map((b) => ({ text: b, options: { bullet: { indent: 14 }, breakLine: true } })), {
      x: x + 0.08, y: 5.7, w: w - 0.14, h: 1.16, fontFace: FONT, fontSize: 14, color: BLACK, margin: 0, valign: "middle", isTextBox: true, paraSpaceAfter: 2 });
  };
  rb(P1.x, P1.w, ["Three cases all indicate above-market growth (7%)",
    "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"]);
  rb(P2.x, P2.w, ["Increasing capital expenditure is required to support the offline expansion strategy",
    "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"]);

  // ---- note line above the source (as on Mindcraft 5 and 8)
  T("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
    0.39, 6.93, 12.4, 0.25, { fontSize: 11, italic: true });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
