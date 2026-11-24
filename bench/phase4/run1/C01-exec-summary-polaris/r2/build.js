// C01 exec summary (deck as reference: Case-2019-Polaris, leave-one-out).
// Form: decision-framework executive summary (Style/refs/case-competitions.md §2: stage chevrons as columns,
// "analysis dimensions" -> "implication" rows, goal bar at the bottom; the team's 2017 GREE deck uses it too).
// Look taken from the deck's other slides: red filled header bars with white bold text (slide 9), vertical row-group
// bands in grey / red (slides 5, 11), dashed column dividers (slides 6, 11, 12), grey line + down chevron leading to a
// full-colour red conclusion bar with white bold text (slide 12), sub-points as en-dash lines (slides 8, 16).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const title = "Executive Summary: Pandora’s growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
  const { pres, slide, P, S } = L.start({ ref: "Case-2019-Polaris", title, source: "Source: Polaris Analysis" });
  const C = P.C, F = P.THEME.bodyFontFace;
  const RED = C.navy, GREY = C.g5, PANEL = C.g1;
  // flat grey chevron pointing down, centred on (cx, cy): spread = visual width, depth = visual height
  const downChev = (cx, cy, spread, depth) => slide.addShape("chevron", { x: cx - depth / 2, y: cy - spread / 2, w: depth, h: spread, rotate: 90, fill: { color: C.g3 }, line: { type: "none" } });

  // ---- grid ----
  const X0 = 0.37, XR = 12.96;                 // body margins of the reference
  const bandW = 0.5, gx = 0.12;                // vertical row-label band
  const cx0 = X0 + bandW + gx, cw = (XR - cx0) / 3, pad = 0.14;
  const hy = 1.2, hh = 0.62;                   // header arrows
  const ay = hy + hh + 0.14, ah = 2.3;        // analysis row
  const ly = ay + ah + 0.1;                    // line + chevron
  const iy = ly + 0.32, ih = 1.3;              // implications row
  const gy = 6.42, gh = 0.6;                   // goal bar

  // ---- column header arrows (Market | Strategy Design | Implementation) ----
  const heads = ["Market", "Strategy Design", "Implementation"];
  heads.forEach((h, j) => {
    const x = cx0 + j * cw;
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: hy, w: cw + (j < 2 ? 0.12 : 0) - 0.04, h: hh,
      fill: { color: RED }, line: { type: "none" }, adjustments: [0.32] });
    P.txt(slide, h, x + (j ? 0.35 : 0.1), hy, cw - (j ? 0.6 : 0.45), hh,
      { fontSize: 18, noScale: true, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  });

  // ---- row-label bands ----
  // vertical band with rotated white bold label (S.vlabel shrinks a short label below the label size, so drawn here at 14 pt)
  const band = (text, y, h, fill) => {
    slide.addShape("rect", { x: X0, y, w: bandW, h, fill: { color: fill }, line: { type: "none" } });
    P.txt(slide, text, X0 + bandW / 2 - h / 2, y + h / 2 - bandW / 2, h, bandW, { fontSize: 14, noScale: true, bold: true, color: C.white, onDark: true, align: "center", valign: "middle", rotate: 270, margin: 0 });
  };
  band("Analysis Dimensions", ay, ah, GREY);
  band("Implications", iy, ih, RED);

  // ---- analysis dimensions ----
  const B = (t) => ({ text: t, options: { bold: true, bullet: { indent: 14 }, indentLevel: 0, paraSpaceBefore: 6 } });
  const D = (t) => ({ text: t, options: { bullet: { code: "2013", indent: 14 }, indentLevel: 1, paraSpaceBefore: 2 } });
  const cells = [
    [B("Market Overview"), D("Industry Trends"), D("Key Drivers"), B("Customer Analysis"), B("Competitive Analysis")],
    [B("Offline Strategy"), D("Store Expansion"), D("Sales Per Store Improvement"), B("Online Strategy"), D("Enter new platforms"), D("Optimize operations"), B("Omni-channel Strategy")],
    [B("Implementation Timeline"), B("Risk & Mitigation"), B("Financial Forecast")],
  ];
  cells.forEach((runs, j) => {
    const x = cx0 + j * cw;
    slide.addShape("rect", { x: x + 0.04, y: ay, w: cw - 0.12, h: ah, fill: { color: PANEL }, line: { type: "none" } });
    slide.addText(runs.map((r, i) => (i < runs.length - 1 ? { ...r, options: { ...r.options, breakLine: true } } : r)),
      { x: x + pad, y: ay + 0.1, w: cw - 2 * pad, h: ah - 0.2, fontFace: F, fontSize: 16, color: C.text, valign: "top", margin: 0.04, isTextBox: true });
  });

  // ---- grey line + down chevron per column (analysis leads to implication) ----
  [0, 1, 2].forEach((j) => {
    const x = cx0 + j * cw;
    slide.addShape("line", { x: x + 0.04, y: ly + 0.04, w: cw - 0.12, h: 0, line: { color: C.g3, width: 1.5 } });
    downChev(x + cw / 2 - 0.04, ly + 0.08, 0.6, 0.2);
  });

  // ---- implications (strategy implication carries the strategy design and its implementation) ----
  const K = (t, b) => ({ text: t, options: b ? { bold: true, color: RED } : {} });
  const imps = [
    { x: cx0, w: cw, runs: [K("Pandora should follow "), K("market trends", 1), K(" and "), K("customer needs", 1), K(" to find "), K("growth opportunities", 1)] },
    { x: cx0 + cw, w: 2 * cw, runs: [K("Based on position of "), K("“a warm jewelry brand”", 1), K(", Pandora should implement strategies to "), K("regain healthy growth", 1), K(" in Mainland China")] },
  ];
  imps.forEach((m) => {
    slide.addShape("rect", { x: m.x + 0.04, y: iy, w: m.w - 0.12, h: ih, fill: { color: C.white }, line: { color: RED, width: 1.5 } });
    slide.addText(m.runs, { x: m.x + pad, y: iy, w: m.w - 2 * pad, h: ih, fontFace: F, fontSize: 16, color: C.text, align: "center", valign: "middle", margin: 0.04, isTextBox: true });
  });

  // ---- dashed column dividers through both rows ----
  [1, 2].forEach((j) => slide.addShape("line", { x: cx0 + j * cw - 0.04, y: ay, w: 0, h: ly - ay - 0.08, line: { color: C.g3, width: 1, dashType: "dash" } }));

  // ---- everything converges into the goal bar ----
  const ty = iy + ih, my = gy - 0.24;
  const mids = [cx0 + cw / 2 - 0.04, cx0 + 2 * cw - 0.04];
  mids.forEach((mx) => slide.addShape("line", { x: mx, y: ty, w: 0, h: my - ty, line: { color: C.g3, width: 1.5 } }));
  slide.addShape("line", { x: mids[0], y: my, w: mids[1] - mids[0], h: 0, line: { color: C.g3, width: 1.5 } });
  const gm = (X0 + XR) / 2;
  downChev(gm, my + 0.06, 0.7, 0.22);
  slide.addShape("roundRect", { x: X0, y: gy, w: XR - X0, h: gh, fill: { color: RED }, line: { type: "none" }, rectRadius: 0.08 });
  P.txt(slide, "Achieve healthy revenue growth in Mainland China jewelry market", X0, gy, XR - X0, gh,
    { fontSize: 20, noScale: true, bold: true, color: C.white, onDark: true, align: "center", valign: "middle", margin: 0 });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
