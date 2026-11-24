// C01 rebuild (run5 r1): executive summary of the Pandora deck, in the style of Case-2019-Polaris (deck as reference).
// Form: decision framework (Style/refs/case-competitions.md §2): stage arrows x "analysis dimensions / implications",
// converging into one goal bar. Drawn with the deck's own furniture seen on its other slides: red filled header boxes and
// grey arrows (slide 9), grey F1F1F1 boxes with black text (slide 16 mitigation boxes), outlined down arrow (slide 8),
// red filled label boxes with white bold text (slides 8, 16). Style from the deck's profile (P.useStyle via L.start).
// The generator S.decisionFramework was tried first: it leaves the lower half of the body empty and has no room for
// sub-dimensions, so the grid is laid out here with the same structure and the profile's colours and sizes.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy",
    source: "Source: Polaris Analysis",
  });
  const { C, txt } = P;
  const RED = C.navy, GREY = C.g1, WHITE = "FFFFFF", BLACK = C.text;
  const PT = 14;                                    // the deck's body size (profile body.pt)

  // grid
  const lx = B.x + 0.02, lw = 1.5, gx = 0.12;
  const x0 = lx + lw + gx, right = 12.98, cw = (right - x0 - 2 * gx) / 3;
  const colX = (j) => x0 + j * (cw + gx);
  const hY = 1.22, hH = 0.55;                       // stage arrows
  const aY = 1.92, aH = 2.8;                        // analysis dimensions
  const arY = aY + aH + 0.04, arH = 0.26;            // down arrows
  const iY = arY + arH + 0.04, iH = 0.95;            // implications
  const bY = 6.5, bH = 0.55;                         // goal bar

  // 1. column headers as arrows
  const stages = ["Market", "Strategy Design", "Implementation"];
  stages.forEach((s, j) => {
    const x = colX(j);
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: hY, w: cw + (j < 2 ? 0.1 : 0), h: hH, fill: { color: RED }, line: { type: "none" } });
    txt(slide, s, x + (j ? 0.3 : 0.1), hY, cw - (j ? 0.5 : 0.3), hH, { fontSize: 16, keepSize: true, bold: true, color: WHITE, onDark: true, align: "center", valign: "middle", margin: 0 });
  });

  // 2. row labels
  const label = (t, y, h) => {
    slide.addShape("rect", { x: lx, y, w: lw, h, fill: { color: RED }, line: { type: "none" } });
    txt(slide, t, lx, y, lw, h, { fontSize: PT, keepSize: true, bold: true, color: WHITE, onDark: true, align: "center", valign: "middle" });
  };
  label("Analysis Dimensions", aY, aH);
  label("Implications", iY, iH);

  // 3. analysis dimensions: three grey boxes per stage, sub-dimensions as dashes
  const dims = [
    [["Market Overview", ["Industry Trends", "Key Drivers"]], ["Customer Analysis"], ["Competitive Analysis"]],
    [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]], ["Online Strategy", ["Enter new platforms", "Optimize operations"]], ["Omni-channel Strategy"]],
    [["Implementation Timeline"], ["Risk & Mitigation"], ["Financial Forecast"]],
  ];
  const dg = 0.1, dh = (aH - 2 * dg) / 3;
  dims.forEach((col, j) => col.forEach(([name, subs], k) => {
    const x = colX(j), y = aY + k * (dh + dg);
    slide.addShape("rect", { x, y, w: cw, h: dh, fill: { color: GREY }, line: { type: "none" } });
    const runs = [{ text: name, options: { bold: true, color: subs ? RED : BLACK, breakLine: !!subs } }];
    (subs || []).forEach((s, i) => runs.push({ text: "– " + s, options: { breakLine: i < subs.length - 1 } }));
    txt(slide, runs, x + 0.12, y, cw - 0.2, dh, { fontSize: PT, keepSize: true, color: BLACK, valign: "middle", margin: 0.04, onDark: true });   // onDark: keeps the deck's red on key words (txt would recolour main-colour runs)
  }));

  // 4. analysis leads to implications: outlined down arrows (as on the deck's driver-tree slide)
  stages.forEach((_, j) => slide.addShape("downArrow", { x: colX(j) + cw / 2 - 0.2, y: arY, w: 0.4, h: arH, fill: { color: WHITE }, line: { color: RED, width: 1.25 } }));

  // 5. implications: Market alone; Strategy Design carries through Implementation (one box over both columns)
  const imp = [
    { x: colX(0), w: cw, runs: [{ text: "Pandora should follow " }, { text: "market trends", options: { color: RED } }, { text: " and " }, { text: "customer needs", options: { color: RED } }, { text: " to find growth opportunities" }] },
    { x: colX(1), w: 2 * cw + gx, runs: [{ text: "Based on position of " }, { text: "“a warm jewelry brand”", options: { color: RED } }, { text: ", Pandora should implement strategies to " }, { text: "regain healthy growth", options: { color: RED } }, { text: " in Mainland China" }] },
  ];
  imp.forEach((m) => {
    slide.addShape("rect", { x: m.x, y: iY, w: m.w, h: iH, fill: { color: WHITE }, line: { color: RED, width: 1.5 } });
    txt(slide, m.runs.map((r) => ({ text: r.text, options: { bold: true, ...(r.options || {}) } })), m.x + 0.15, iY, m.w - 0.3, iH, { fontSize: PT, keepSize: true, color: BLACK, align: "center", valign: "middle", onDark: true });
  });

  // 6. everything converges into one goal bar
  const cy = iY + iH, mid = x0 + (right - x0) / 2, jy = cy + 0.12;
  const lc = imp[0].x + imp[0].w / 2, rc = imp[1].x + imp[1].w / 2, ln = { color: RED, width: 1.5 };
  [lc, rc].forEach((x) => slide.addShape("line", { x, y: cy, w: 0, h: jy - cy, line: ln }));
  slide.addShape("line", { x: lc, y: jy, w: rc - lc, h: 0, line: ln });
  slide.addShape("downArrow", { x: mid - 0.2, y: jy, w: 0.4, h: bY - jy - 0.03, fill: { color: WHITE }, line: { color: RED, width: 1.25 } });
  slide.addShape("rect", { x: lx, y: bY, w: right - lx, h: bH, fill: { color: RED }, line: { type: "none" } });
  txt(slide, "Achieve healthy revenue growth in Mainland China jewelry market", lx, bY, right - lx, bH, { fontSize: 18, keepSize: true, bold: true, color: WHITE, onDark: true, align: "center", valign: "middle" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
