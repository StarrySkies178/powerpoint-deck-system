// C01 run2 r3: executive summary as a decision framework (stage arrows x "analysis dimensions / implications",
// converging into one goal bar), in the Polaris 2019 look via its style profile.
// Form: decisionFramework (Style/refs/case-competitions.md §2). Drawn here with the framework's helpers instead of
// S.decisionFramework because the prompt needs two labelled rows, one implication spanning two stages and a coloured
// goal bar, which that generator does not take. Visual vocabulary taken from the deck's other slides: red header bars
// with white bold text and red-outlined white boxes under them (Polaris 9), grey down chevrons into a rounded red
// conclusion bar (Polaris 12, 13), grey label blocks with white bold text (Polaris 8), "•" / "–" bullets (Polaris 9).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, prof } = L.start({
    ref: "Case-2019-Polaris",
    title: "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, F = P.THEME.bodyFontFace;
  const BODY_PT = prof.body.pt;            // 14
  const LBL_PT = prof.body.label_pt;       // 12
  const left = prof.margins.left, right = 13.333 - prof.margins.right, top = prof.margins.body_top;

  // ---- grid ----
  const lw = 1.7, gx = 0.15;                                   // row-label column, gap between stage columns
  const x0 = left + lw + gx, cw = (right - x0 - 2 * gx) / 3;   // three stage columns
  const colX = (j) => x0 + j * (cw + gx);
  const yArrow = top + 0.07, hArrow = 0.62;
  const yAna = yArrow + hArrow + 0.13, hAna = 2.4;
  const yImp = yAna + hAna + 0.4, hImp = 1.25;
  const yGoal = yImp + hImp + 0.4, hGoal = 0.6;

  // ---- column headers as arrows ----
  const stages = ["Market", "Strategy Design", "Implementation"];
  stages.forEach((s, j) => {
    const x = colX(j), w = cw + (j < 2 ? gx + 0.18 : 0);
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: yArrow, w, h: hArrow, fill: { color: C.navy }, line: { color: "FFFFFF", width: 1.5 },
      objectName: j === 0 ? "form:decisionFramework stage arrows" : "stage arrow" });
    slide.addText(s, { x: x + (j ? 0.32 : 0.1), y: yArrow, w: cw - 0.45, h: hArrow, fontFace: F, fontSize: 16, bold: true, color: "FFFFFF",
      align: "center", valign: "middle", margin: 0, isTextBox: true });
  });

  // ---- row labels ----
  const rowLabel = (t, y, h) => {
    slide.addShape("rect", { x: left, y, w: lw, h, fill: { color: C.g3 }, line: { type: "none" } });
    slide.addText(t, { x: left + 0.08, y, w: lw - 0.16, h, fontFace: F, fontSize: BODY_PT, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  };
  rowLabel("Analysis Dimensions", yAna, hAna);
  rowLabel("Implications", yImp, hImp);

  // ---- analysis dimensions: red-outlined boxes, "•" items with "–" sub-items ----
  const analysis = [
    [["Market Overview", ["Industry Trends", "Key Drivers"]], ["Customer Analysis"], ["Competitive Analysis"]],
    [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"]], ["Online Strategy", ["Enter new platforms", "Optimize operations"]], ["Omni-channel Strategy"]],
    [["Implementation Timeline"], ["Risk & Mitigation"], ["Financial Forecast"]],
  ];
  analysis.forEach((items, j) => {
    const x = colX(j);
    slide.addShape("rect", { x, y: yAna, w: cw, h: hAna, fill: { color: "FFFFFF" }, line: { color: C.navy, width: 1 } });
    const runs = [];
    items.forEach(([head, subs]) => {
      runs.push({ text: head, options: { bold: true, bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceBefore: runs.length ? 6 : 0 } });
      (subs || []).forEach((s) => runs.push({ text: s, options: { bullet: { code: "2013", indent: 14 }, indentLevel: 1, breakLine: true } }));
    });
    runs[runs.length - 1].options.breakLine = false;
    slide.addText(runs, { x: x + 0.12, y: yAna + 0.08, w: cw - 0.24, h: hAna - 0.16, fontFace: F, fontSize: BODY_PT, color: C.text, valign: "middle", margin: 0.04, isTextBox: true });
  });

  // ---- down chevrons between the rows (grey, as Polaris 12/13) ----
  // a chevron turned to point down, centred in the 0.4 in gap below the row that ends at yEnd
  const chev = (cx, yEnd) => slide.addShape("chevron", { x: cx - 0.14, y: yEnd + 0.2 - 0.21, w: 0.28, h: 0.42, rotate: 90, fill: { color: C.g2 }, line: { type: "none" } });
  [0, 1, 2].forEach((j) => chev(colX(j) + cw / 2, yAna + hAna));

  // ---- implications: grey filled boxes; the strategy implication covers Strategy Design and Implementation ----
  const imp = (x, w, t) => {
    slide.addShape("rect", { x, y: yImp, w, h: hImp, fill: { color: C.g1 }, line: { type: "none" } });
    slide.addText(t, { x: x + 0.15, y: yImp, w: w - 0.3, h: hImp, fontFace: F, fontSize: BODY_PT, bold: true, color: C.text, align: "center", valign: "middle", margin: 0, isTextBox: true });
  };
  imp(colX(0), cw, "Pandora should follow market trends and customer needs to find growth opportunities");
  imp(colX(1), 2 * cw + gx, "Based on position of “a warm jewelry brand”, Pandora should implement strategies to regain healthy growth in Mainland China");

  // ---- everything converges into one goal bar ----
  const yc = yImp + hImp;
  chev(colX(0) + cw / 2, yc);
  chev(colX(1) + cw + gx / 2, yc);
  slide.addShape("roundRect", { x: x0, y: yGoal, w: right - x0, h: hGoal, rectRadius: 0.08, fill: { color: C.navy }, line: { type: "none" }, objectName: "goal bar" });
  slide.addText("Achieve healthy revenue growth in Mainland China jewelry market", { x: x0 + 0.2, y: yGoal, w: right - x0 - 0.4, h: hGoal, fontFace: F, fontSize: 18, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
