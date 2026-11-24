// C08 risk matrix, in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Layout: HALF2 as on the deck's other two-panel slides (Mindcraft 8 and 14, panel boxes from scripts/layout_skeleton.py),
// left panel a numbered 3x3 risk heat map with a dashed priority zone, right panel the risk -> solution list with the
// same numbers (storytelling rule: risks are a numbered heat map with the same numbers in the mitigation list).
// Row form of the solution list ([Avoid]/[Mitigate] labels in red bold, grey and white sub-rows, dashed separators)
// follows the [Aim]/[How] matrix of Mindcraft 8.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, S, HOUSE } = L.start({
    ref: "Case-2019-Mindcraft",
    title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
  });
  // source line in the reference's italic, in the layout's source placeholder
  slide.addText([{ text: "Source: MindCraft Analysis", options: { italic: true } }], { placeholder: "source" });
  const C = P.C, F = HOUSE.FONT.latin;
  const RED = C.navy, G1 = "F1F1F1", G2 = "D5D5D5", G3 = "A6A6A6", G5 = "5C5C5C";
  const T = (s, text, x, y, w, h, o = {}) => s.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 12, color: o.color || "000000",
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0, isTextBox: true, rotate: o.rotate });
  // breadcrumb as on the deck's other slides: grey bold italic sections, red triangles between, current section in red
  const crumb = ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], cw0 = [2.0, 2.15, 2.4];
  let cx0 = 0.36;
  crumb.forEach((t, i) => {
    if (i) { slide.addShape("triangle", { x: cx0, y: 0.1, w: 0.2, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } }); cx0 += 0.42; }
    T(slide, t, cx0, 0.03, cw0[i], 0.32, { size: 14, bold: true, italic: true, color: i === 2 ? RED : G3 });
    cx0 += cw0[i] + 0.2;
  });
  const dot = (s, n, cx, cy, d, fill) => {
    s.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: fill }, line: { color: "FFFFFF", width: 1 } });
    T(s, String(n), cx - d / 2, cy - d / 2, d, d, { size: 12, bold: true, italic: true, color: "FFFFFF", align: "center" });
  };

  // ---------- panel 1: risk heat map ----------
  const heat = (s, b) => {
    const lab = 0.5, tick = 0.32;                                  // axis title + tick label bands
    const gx = b.x + lab + tick + 0.05, gw = b.w - lab - tick - 0.05, legendH = 1.6;
    const gy = b.y + 0.36, gh = b.h - legendH - 1.06, cw = gw / 3, ch = gh / 3;
    const lv = ["Low", "Medium", "High"];
    // cell shade = risk level (likelihood + severity): light grey to dark grey
    const shade = [G1, G2, G3, "808080"];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {       // r: likelihood (0 = high, top), c: severity (0 = low)
      const lvl = (2 - r) + c, k = lvl <= 1 ? 0 : lvl === 2 ? 1 : lvl === 3 ? 2 : 3;
      s.addShape("rect", { x: gx + c * cw, y: gy + r * ch, w: cw, h: ch, fill: { color: shade[k] }, line: { color: "FFFFFF", width: 2 } });
    }
    // axes
    s.addShape("line", { x: gx, y: gy + gh, w: gw, h: 0, line: { color: "000000", width: 1.25, endArrowType: "triangle" } });
    s.addShape("line", { x: gx, y: gy, w: 0, h: gh, line: { color: "000000", width: 1.25, beginArrowType: "triangle" } });
    lv.forEach((t, i) => {
      T(s, t, gx + i * cw, gy + gh + 0.04, cw, tick, { align: "center" });
      T(s, t, b.x + lab - 0.62, gy + (2 - i) * ch + ch / 2 - tick / 2, tick + 0.62 + 0.3, tick, { align: "center", rotate: 270 });
    });
    T(s, "Severity", gx, gy + gh + 0.36, gw, 0.3, { bold: true, italic: true, color: G5, align: "center" });
    T(s, "Likelihood", b.x - gh / 2 + 0.16, gy + gh / 2 - 0.15, gh, 0.3, { bold: true, italic: true, color: G5, align: "center", rotate: 270 });
    // top-priority zone: high severity x medium-high likelihood
    const zx = gx + 2 * cw + 0.04, zy = gy + 0.04, zw = cw - 0.08, zh = 2 * ch - 0.08;
    s.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 1.75, dashType: "dash" } });
    T(s, "Top priority", zx - 0.6, gy - 0.32, zw + 0.65, 0.28, { size: 12, bold: true, italic: true, color: RED, align: "right" });
    // risks: [id, severity col, likelihood row (0 = high), dx, dy] positions inside the cell
    const d = 0.4, pos = (c, r, fx, fy) => [gx + c * cw + fx * cw, gy + r * ch + fy * ch];
    [[1, 2, 0, 0.29, 0.5], [2, 2, 0, 0.71, 0.5], [3, 2, 1, 0.29, 0.5], [4, 2, 1, 0.71, 0.5]].forEach(([n, c, r, fx, fy]) => dot(s, n, ...pos(c, r, fx, fy), d, RED));
    [[6, 0, 0], [8, 0, 1], [7, 1, 2], [5, 2, 2]].forEach(([n, c, r]) => dot(s, n, ...pos(c, r, 0.5, 0.5), d, G5));
    // legend of the other risks (1-4 are named in the solution table), one per line at body size
    const ly = gy + gh + 0.74, others = [[5, "Customer information safety"], [6, "Competitor's response"], [7, "Customer preference change"], [8, "Cannibalization"]];
    s.addShape("rect", { x: b.x, y: ly, w: b.w, h: b.y + b.h - ly, fill: { color: G1 }, line: { type: "none" } });
    T(s, "Other risks", b.x + 0.12, ly + 0.05, 2, 0.28, { size: 12, bold: true, italic: true, color: G5 });
    others.forEach(([n, t], i) => {
      const y = ly + 0.36 + i * 0.3;
      dot(s, n, b.x + 0.27, y + 0.14, 0.27, G5);
      T(s, t, b.x + 0.5, y, b.w - 0.6, 0.28, { size: 14 });
    });
  };

  // ---------- panel 2: solutions table ----------
  const rows = [
    { n: 1, risk: "Internal resistance", desc: "Changes in functions and work relationships cause anger and panic",
      avoid: "Strengthen internal communication and provide employee training",
      mit: "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary" },
    { n: 2, risk: "Talent management", desc: "Insufficient supply of trained salespersons for rapid expansion",
      avoid: "Make recruitment plan in advance", mit: "Reduce labor demand with technology" },
    { n: 3, risk: "Supply chain mgmt.", desc: "Rapid store expansion requires agile logistics",
      avoid: "Optimize logistics network", mit: "Find reliable third-party logistic partner" },
    { n: 4, risk: "IT system upgrade", desc: "Low compatibility between old and new system may cause slow upgrade and delay implementation",
      avoid: "Make upgrade plan in advance; careful selection of new system supplier", mit: "Hire external technology experts for help" },
  ];
  const table = (s, b) => {
    const cw = 0.42, rw = 2.75, sx = b.x + cw + rw + 0.12, sw = b.x + b.w - sx, hh = 0.36, LH = 0.233;   // 14 pt line height / char width
    T(s, "Risks", b.x, b.y, cw + rw, hh, { size: 14, bold: true, italic: true, color: G5, align: "center" });
    T(s, "Solutions", sx, b.y, sw, hh, { size: 14, bold: true, italic: true, color: G5, align: "center" });
    s.addShape("line", { x: b.x, y: b.y + hh, w: b.w, h: 0, line: { color: "000000", width: 1 } });
    // line counts at 14 pt in these widths, measured with the render font's metrics (risk name + description; [Avoid]; [Mitigate])
    const ld = [4, 4, 3, 5], la = [2, 1, 1, 2], lm = [3, 2, 2, 2];
    const need = rows.map((r, i) => Math.max(ld[i] * LH + 0.12, (la[i] + lm[i]) * LH + 0.24));
    const avail = b.y + b.h - (b.y + hh + 0.06), extra = (avail - need.reduce((x, y) => x + y, 0)) / rows.length;
    let y = b.y + hh + 0.06;
    rows.forEach((r, i) => {
      const h = need[i] + extra;
      dot(s, r.n, b.x + 0.19, y + 0.2, 0.36, RED);
      s.addText([{ text: r.risk, options: { bold: true, breakLine: true } }, { text: r.desc }],
        { x: b.x + cw, y: y + 0.04, w: rw, h: h - 0.1, fontFace: F, fontSize: 14, color: "000000", valign: "top", margin: 0, isTextBox: true });
      const na = la[i] * LH + 0.1, nm = lm[i] * LH + 0.1, ah = (h - 0.1) * na / (na + nm);
      s.addShape("rect", { x: sx, y: y + 0.02, w: sw, h: ah, fill: { color: G1 }, line: { type: "none" } });
      s.addText([{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: r.avoid }],
        { x: sx + 0.08, y: y + 0.02, w: sw - 0.16, h: ah, fontFace: F, fontSize: 14, color: "000000", valign: "middle", margin: 0, isTextBox: true });
      s.addText([{ text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: r.mit }],
        { x: sx + 0.08, y: y + 0.04 + ah, w: sw - 0.16, h: h - 0.12 - ah, fontFace: F, fontSize: 14, color: "000000", valign: "middle", margin: 0, isTextBox: true });
      if (i < rows.length - 1) s.addShape("line", { x: b.x, y: y + h - 0.03, w: b.w, h: 0, line: { color: "7E7E7E", width: 0.75, dashType: "dash" } });
      y += h;
    });
  };

  S.composeSlide(pres, slide, {
    regions: [{ x: 0.36, y: 1.37, w: 4.45, h: 5.7 }, { x: 5.08, y: 1.37, w: 7.97, h: 5.7 }],
    panels: [{ headline: "Risk mapping", draw: heat }, { headline: "Solutions for important risks", draw: table }],
  });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
