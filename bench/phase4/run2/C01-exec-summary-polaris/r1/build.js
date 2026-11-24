// C01 exec summary in the Case-2019-Polaris style (deck as reference, leave-one-out).
// Form: decision framework (stage arrows x "analysis dimensions / implications" -> converging goal bar),
// the studied exec-summary form (Style/refs/case-competitions.md §2), drawn with the deck's own furniture
// seen on its other slides: red filled header bars with white bold text (slide 9), red label boxes (slides 8, 16),
// light grey F1F1F1 panels (slides 14, 16), red-outlined boxes (slide 12), grey down-triangle into a red
// conclusion bar (slide 12). Layout geometry follows the 2017 GREE deck's executive summary (another deck by the same team).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, RED = C.navy, GREY = C.g1, DARK = C.g5;
  const T = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { keepSize: true, ...o });

  // grid
  const lw = 1.45, gap = 0.22, x0 = B.x + lw + 0.2;
  const cw = (B.x + B.w - x0 - 2 * gap) / 3;
  const colX = (j) => x0 + j * (cw + gap);
  const hy = 1.22, hh = 0.58;            // header arrows
  const ay = hy + hh + 0.17, ah = 2.3;   // analysis row
  const sy = ay + ah + 0.12;             // separator with triangle
  const iy = sy + 0.24, ih = 1.25;       // implication row
  const by = 6.45, bh = 0.52;             // goal bar

  // ---- column headers as arrows (one continuous red arrow band, white separators)
  const heads = ["Market", "Strategy Design", "Implementation"];
  heads.forEach((h, j) => {
    const x = colX(j), w = cw + (j < 2 ? gap + 0.12 : 0);
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: hy, w, h: hh, fill: { color: RED }, line: { color: "FFFFFF", width: 1.5 }, objectName: "stage " + (j + 1) });
    T(h, x + (j ? 0.35 : 0.1), hy, cw - 0.4, hh, { fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  });

  // ---- row labels (red boxes, white bold text)
  const label = (t, y, h) => {
    slide.addShape("rect", { x: B.x, y, w: lw, h, fill: { color: RED }, line: { type: "none" } });
    T(t, B.x, y, lw, h, { fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  };
  label("Analysis Dimensions", ay, ah);
  label("Implications", iy, ih);

  // ---- analysis cells: grey panels, bold dimension + dash sub-points
  const dims = [
    [["Market Overview", ["Industry Trends", "Key Drivers"]], ["Customer Analysis"], ["Competitive Analysis"]],
    [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]], ["Online Strategy", ["Enter new platforms", "Optimize operations"]], ["Omni-channel Strategy"]],
    [["Implementation Timeline"], ["Risk & Mitigation"], ["Financial Forecast"]],
  ];
  const icons = ["chart-line", "bulb", "calendar"];
  dims.forEach((col, j) => {
    const x = colX(j);
    slide.addShape("rect", { x, y: ay, w: cw, h: ah, fill: { color: GREY }, line: { type: "none" }, objectName: "analysis " + (j + 1) });
    const runs = [];
    col.forEach(([main, subs = []], k) => {
      runs.push({ text: main, options: { bold: true, fontSize: 14, bullet: { indent: 14 }, breakLine: true, paraSpaceBefore: k ? 10 : 0 } });
      subs.forEach((s) => runs.push({ text: s, options: { fontSize: 12, color: DARK, indentLevel: 1, bullet: { characterCode: "2013", indent: 12 }, breakLine: true, paraSpaceBefore: 3 } }));
    });
    runs[runs.length - 1].options.breakLine = false;
    slide.addText(runs, { x: x + 0.12, y: ay + 0.14, w: cw - 0.62, h: ah - 0.24, fontFace: P.THEME.bodyFontFace, color: C.text, valign: "top", margin: 0.04, isTextBox: true });
    P.icon(slide, icons[j], x + cw - 0.5, ay + 0.14, 0.36, { color: RED });
  });

  // ---- separator: thin rule per column with a down triangle
  [0, 1, 2].forEach((j) => {
    const x = colX(j);
    slide.addShape("line", { x, y: sy + 0.06, w: cw, h: 0, line: { color: DARK, width: 1 } });
    slide.addShape("triangle", { x: x + cw / 2 - 0.16, y: sy + 0.06, w: 0.32, h: 0.15, rotate: 180, fill: { color: DARK }, line: { type: "none" } });
  });

  // ---- implications: red-outlined boxes (market, strategy); implementation feeds the goal directly
  const impl = [
    "Pandora should follow market trends and customer needs to find growth opportunities",
    "Based on position of “a warm jewelry brand”, Pandora should implement strategies to regain healthy growth in Mainland China",
  ];
  impl.forEach((t, j) => {
    const x = colX(j);
    slide.addShape("rect", { x, y: iy, w: cw, h: ih, fill: { color: "FFFFFF" }, line: { color: RED, width: 1.5 }, objectName: "implication " + (j + 1) });
    T(t, x + 0.1, iy, cw - 0.2, ih, { fontSize: 14, align: "center", valign: "middle" });
  });
  // implementation column: a dashed connector straight down through the implication row
  slide.addShape("line", { x: colX(2) + cw / 2, y: iy, w: 0, h: ih, line: { color: DARK, width: 1.25, dashType: "dash" } });

  // ---- converge: short drops from each column onto one rule, grey triangle, red goal bar
  const cy = iy + ih + 0.2;
  [0, 1, 2].forEach((j) => slide.addShape("line", { x: colX(j) + cw / 2, y: iy + ih, w: 0, h: cy - iy - ih, line: { color: DARK, width: 1.25 } }));
  slide.addShape("line", { x: colX(0) + cw / 2, y: cy, w: colX(2) - colX(0), h: 0, line: { color: DARK, width: 1.25 } });
  slide.addShape("triangle", { x: B.x + B.w / 2 - 0.3, y: cy, w: 0.6, h: by - cy - 0.04, rotate: 180, fill: { color: DARK }, line: { type: "none" } });
  slide.addShape("roundRect", { x: B.x, y: by, w: B.w, h: bh, rectRadius: 0.08, fill: { color: RED }, line: { type: "none" }, objectName: "goal" });
  T("Achieve healthy revenue growth in Mainland China jewelry market", B.x, by, B.w, bh, { fontSize: 18, bold: true, color: "FFFFFF", align: "center", valign: "middle" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
