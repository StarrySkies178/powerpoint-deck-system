// C01 rebuild: executive summary as a decision framework (stage arrows x analysis dimensions / implications -> goal bar).
// Form: "Decision framework" from Style/refs/case-competitions.md §2 (GREE Polaris deck, Sparkle). The generator
// decisionFramework() draws three answer cells; this brief has two implications and a converging goal bar, so the grid
// is drawn here on the deck's style profile (Case-2019-Polaris), with the deck's own furniture: red filled headers,
// lettered red circles for the strategy pillars (deck slide 16), red outlined statement boxes (deck slide 8), F1F1F1 panels.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const title = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
  const { pres, slide, P, HOUSE } = L.start({ ref: "Case-2019-Polaris", title, source: "Source: Polaris Analysis" });
  const C = P.C, F = HOUSE.FONT.latin;
  const RED = C.navy, PANEL = C.g1, DARK = C.g5, TEXT = C.text, WHITE = "FFFFFF", TINT = C.hiBand;
  const B = HOUSE.GRID.body;                       // x 0.37, right edge 13.01
  const x0 = B.x, xr = B.x + B.w;
  const lw = 1.7, gap = 0.12, cx = x0 + lw + gap, cw = (xr - cx - 2 * gap) / 3;
  const colX = (j) => cx + j * (cw + gap);
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || TEXT, bold: !!o.bold,
    align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.06, isTextBox: true, paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm });

  // 1. column headers as arrows
  const hy = B.y + 0.1, hh = 0.6;
  ["Market", "Strategy Design", "Implementation"].forEach((name, j) => {
    const x = colX(j), w = cw + (j < 2 ? gap + 0.18 : 0);
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: hy, w, h: hh, fill: { color: RED }, line: { color: WHITE, width: 1.5 } });
    T(name, x + (j ? 0.3 : 0.05), hy, cw - 0.3, hh, { size: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
  });

  // 2. row labels
  const ay = hy + hh + 0.15, ah = 2.6;           // analysis dimensions row
  const iy = ay + ah + 0.42, ih = 1.0;           // implications row
  const rowLabel = (text, y, h) => {
    slide.addShape("rect", { x: x0, y, w: lw, h, fill: { color: DARK }, line: { type: "none" } });
    T(text, x0, y, lw, h, { size: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
  };
  rowLabel("Analysis Dimensions", ay, ah);
  rowLabel("Implications", iy, ih);

  // 3. analysis dimensions: one grey panel per stage, items spread evenly down the panel
  // Strategy design carries the deck's lettered pillars (a / b / c in red circles, as in the deck's roadmap)
  const cols = [
    [{ name: "Market Overview", subs: ["Industry Trends", "Key Drivers"] }, { name: "Customer Analysis", subs: [] }, { name: "Competitive Analysis", subs: [] }],
    [{ l: "a", name: "Offline Strategy", subs: ["Store Expansion", "Sales Per Store Improvement"] },
     { l: "b", name: "Online Strategy", subs: ["Enter new platforms", "Optimize operations"] },
     { l: "c", name: "Omni-channel Strategy", subs: [] }],
    [{ name: "Implementation Timeline", subs: [] }, { name: "Risk & Mitigation", subs: [] }, { name: "Financial Forecast", subs: [] }],
  ];
  const nh = 0.34, sh = 0.29, d = 0.3;
  cols.forEach((items, j) => {
    slide.addShape("rect", { x: colX(j), y: ay, w: cw, h: ah, fill: { color: PANEL }, line: { type: "none" } });
    const used = items.reduce((a, it) => a + nh + it.subs.length * sh, 0);
    const free = (ah - 0.2 - used) / items.length;        // equal space per item, item block centred in its share
    let y = ay + 0.1 + free / 2;
    const sx = colX(j) + 0.16;
    items.forEach((it) => {
      if (it.l) {
        slide.addShape("ellipse", { x: sx, y: y + (nh - d) / 2, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
        T(it.l, sx, y + (nh - d) / 2, d, d, { size: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
      } else {
        slide.addShape("rect", { x: sx + 0.08, y: y + nh / 2 - 0.06, w: 0.12, h: 0.12, fill: { color: DARK }, line: { type: "none" } });
      }
      T(it.name, sx + d + 0.1, y, cw - d - 0.4, nh, { size: 14, bold: true, color: it.l ? RED : TEXT, valign: "middle", margin: 0 });
      y += nh;
      it.subs.forEach((s2) => { T("\u2013 " + s2, sx + d + 0.1, y, cw - d - 0.4, sh, { size: 13, valign: "middle", margin: 0 }); y += sh; });
      y += free;
    });
  });

  // 4. arrows from the analysis to the implications
  const arrow = (x, y, w, h) => slide.addShape("downArrow", { x, y, w, h, fill: { color: C.g3 }, line: { type: "none" } });
  [0, 1, 2].forEach((j) => arrow(colX(j) + cw / 2 - 0.16, ay + ah + 0.07, 0.32, 0.28));

  // 5. implications: Market under its stage, Strategy across strategy design and implementation
  const R = (t, hi) => ({ text: t, options: hi ? { bold: true, color: RED } : {} });
  const stmt = (runs, x, w) => {
    slide.addShape("rect", { x, y: iy, w, h: ih, fill: { color: WHITE }, line: { color: RED, width: 1.5 } });
    slide.addText(runs, { x: x + 0.1, y: iy, w: w - 0.2, h: ih, fontFace: F, fontSize: 14, color: TEXT, align: "center", valign: "middle", margin: 0.04, isTextBox: true });
  };
  stmt([R("Pandora should follow "), R("market trends", 1), R(" and "), R("customer needs", 1), R(" to find "), R("growth opportunities", 1)], colX(0), cw);
  stmt([R("Based on position of “"), R("a warm jewelry brand", 1), R("”, Pandora should implement strategies to "), R("regain healthy growth", 1), R(" in Mainland China")], colX(1), 2 * cw + gap);

  // 6. everything converges into the goal bar
  const gy = iy + ih + 0.42, gh = 0.55;
  const fy = iy + ih + 0.06;
  { const fw = xr - cx, fh = gy - fy - 0.04, ins = cw / 2;   // funnel: full width under the implications, narrowing into the goal bar
    slide.addShape("custGeom", { x: cx, y: fy, w: fw, h: fh, fill: { color: TINT }, line: { type: "none" },
      points: [{ x: 0, y: 0 }, { x: fw, y: 0 }, { x: fw - ins, y: fh }, { x: ins, y: fh }, { close: true }] }); }
  slide.addShape("rect", { x: x0, y: gy, w: xr - x0, h: gh, fill: { color: RED }, line: { type: "none" } });
  T("Achieve healthy revenue growth in Mainland China jewelry market", x0, gy, xr - x0, gh, { size: 16, bold: true, color: WHITE, align: "center", valign: "middle" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
