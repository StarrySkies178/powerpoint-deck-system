// C08 risk matrix, deck as reference (Case-2019-Mindcraft), leave-one-out.
// Look taken from the deck's style profile and its other two-panel analysis slides (numbered red chip + bold sub-headline
// + grey rule; italic unit lines; [Aim]/[How] red bold tags with a grey band on the first line, strategy-overview panel).
// Panel 1: 3x3 risk heat map (likelihood x severity) with numbered dots and a dashed "Top priority" zone.
// Panel 2: the same numbers in a Risks | Solutions list, [Avoid] / [Mitigate] tags.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, S } = L.start({ ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion" });
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.accent, G1 = "F1F1F1", G2 = "D5D5D5", G3 = "A6A6A6", G4 = "808080", G5 = "5C5C5C", BLACK = "000000";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 12, color: o.color || BLACK,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true, rotate: o.rotate, fill: o.fill ? { color: o.fill } : undefined });

// ---- breadcrumb in the deck's form: bold italic section names, red triangles between, current section red
const crumb = [["Market Analysis", 0.37], ["Growth Strategy", 2.88], ["Risk & Mitigation", 5.56]];
crumb.forEach(([t, x], i) => T(t, x, 0.04, 2.4, 0.3, { size: 14, bold: true, italic: true, color: i === 2 ? RED : G3, valign: "middle" }));
[2.45, 5.18].forEach((x) => slide.addShape("triangle", { x, y: 0.08, w: 0.22, h: 0.22, rotate: 90, fill: { color: RED }, line: { type: "none" } }));

// ---- footer: grey rule, italic source line, team mark at the right (page number from the master, set to 12 in build.py)
slide.addShape("line", { x: 0, y: 7.2, w: 13.333, h: 0, line: { color: G2, width: 0.75 } });
T("Source: MindCraft Analysis", 0.39, 7.23, 6, 0.22, { size: 10, italic: true, valign: "middle" });
T([{ text: "MindCraft", options: { bold: true, color: RED } }], 11.25, 7.23, 1.45, 0.22, { size: 12, align: "right", valign: "middle" });

// ---- two panels (regions measured by eye from the deck's other HALF2 slides, left panel narrowed for the heat map)
const top = 1.4, bot = 7.1;
const R1 = { x: 0.37, y: top, w: 4.25, h: bot - top }, R2 = { x: 4.9, y: top, w: 12.98 - 4.9, h: bot - top };

S.composeSlide(pres, slide, { regions: { panels: [R1, R2] }, panels: [
  { headline: "Risk mapping", draw: (sl, b) => heatMap(b) },
  { headline: "Solutions for important risks", draw: (sl, b) => solutions(b) },
] });

function heatMap(b) {
  // axes: severity across (Low -> High), likelihood up (Low -> High)
  const ylab = 0.62, gx = b.x + ylab, gw = b.w - ylab - 0.05, cw = gw / 3;
  const gy = b.y + 0.12, gh = b.h - 0.12 - 0.85, ch = gh / 3;
  const lv = ["Low", "Medium", "High"];
  const fill = (l, s) => [G1, G1, G2, G3, G3][l + s];
  for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++)
    slide.addShape("rect", { x: gx + s * cw, y: gy + (2 - l) * ch, w: cw, h: ch, fill: { color: fill(l, s) }, line: { color: "FFFFFF", width: 2 } });
  lv.forEach((t, i) => {
    T(t, gx + i * cw, gy + gh + 0.04, cw, 0.28, { size: 12, italic: true, align: "center" });
    T(t, b.x + 0.43 - ch / 2, gy + (2.5 - i) * ch - 0.15, ch, 0.3, { size: 12, italic: true, align: "center", valign: "middle", rotate: 270 });
  });
  T("Severity", gx, gy + gh + 0.34, gw, 0.3, { size: 12, bold: true, italic: true, color: G5, align: "center" });
  T("Likelihood", b.x + 0.12 - gh / 2, gy + gh / 2 - 0.15, gh, 0.3, { size: 12, bold: true, italic: true, color: G5, align: "center", rotate: 270 });
  slide.addShape("line", { x: gx, y: gy + gh, w: gw, h: 0, line: { color: G5, width: 1.25, endArrowType: "triangle" } });
  slide.addShape("line", { x: gx, y: gy, w: 0, h: gh, line: { color: G5, width: 1.25, beginArrowType: "triangle" } });

  // top-priority zone: high severity x medium-to-high likelihood
  const zx = gx + 2 * cw + 0.06, zy = gy + 0.06, zw = cw - 0.12, zh = 2 * ch - 0.12;
  slide.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 2, dashType: "dash" } });
  T("Top priority", zx, zy + 0.06, zw, 0.28, { size: 12, bold: true, italic: true, color: RED, align: "center" });

  const d = 0.4;
  const dot = (n, cx, cy, hot) => {
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : G4 }, line: { color: "FFFFFF", width: 1 } });
    T(String(n), cx - d / 2, cy - d / 2, d, d, { size: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  };
  const cell = (l, s) => ({ x: gx + s * cw, y: gy + (2 - l) * ch });
  // 1, 2: high / high; 3, 4: medium likelihood / high severity
  [[1, 2, 0.3], [2, 2, 0.7], [3, 1, 0.3], [4, 1, 0.7]].forEach(([n, l, fx]) => { const c = cell(l, 2); dot(n, c.x + fx * cw, c.y + ch * (l === 2 ? 0.6 : 0.45), true); });
  // monitored risks, named under their dot
  [[6, "Competitor's response", 2, 0], [8, "Cannibalization", 1, 0], [7, "Customer preference change", 0, 1], [5, "Customer information safety", 0, 2]].forEach(([n, name, l, s]) => {
    const c = cell(l, s); dot(n, c.x + cw / 2, c.y + 0.3, false);
    T(name, c.x - 0.1, c.y + 0.54, cw + 0.2, ch - 0.58, { size: 12, align: "center" });
  });
}

function solutions(b) {
  // text at the deck's body size (14 pt); the [Avoid] / [Mitigate] tags lead their line, as the deck's [Aim] / [How] tags
  const pt = 14, lh = pt * 1.2 / 72, em = 0.5;   // Verdana mixed case, measured on the render: about 0.5 em a character
  const lines = (t, w, e = em) => { const cap = (w * 72) / (pt * e); let n = 1, cur = 0;
    t.split(" ").forEach((word) => { const k = word.length + 1; if (cur + k > cap && cur) { n++; cur = k; } else cur += k; }); return n; };
  const cN = 0.45, cR = 2.75, gap = 0.12, cS = b.w - cN - cR - gap;
  const xR = b.x + cN, xS = xR + cR + gap;
  const hh = 0.32;
  T("Risks", b.x, b.y, cN + cR, hh, { size: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
  T("Solutions", xS, b.y, cS, hh, { size: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
  slide.addShape("line", { x: b.x, y: b.y + hh + 0.03, w: b.w, h: 0, line: { color: G4, width: 1 } });
  const rows = [
    ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
      "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
    ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
      "Make recruitment plan in advance", "Reduce labor demand with technology"],
    ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
      "Optimize logistics network", "Find reliable third-party logistic partner"],
    ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
      "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
  ];
  const pad = 0.08, need = rows.map(([n, d, a, m]) => {
    const r = (lines(n, cR - 0.08) + lines(d, cR - 0.08)) * lh;
    const qa = lines("[Avoid] " + a, cS - 0.16, 0.56) * lh + pad, qm = lines("[Mitigate] " + m, cS - 0.16, 0.56) * lh + pad;   // tags are bold: a wider measure
    return { a: qa, m: qm, h: Math.max(r, qa + qm + 0.04) + 0.06 };
  });
  const y0 = b.y + hh + 0.06, avail = b.y + b.h - y0, extra = (avail - need.reduce((s, q) => s + q.h, 0)) / rows.length;
  let y = y0;
  rows.forEach(([name, desc, avoid, mit], i) => {
    const q = need[i], h = q.h + extra, ys = y + (h - q.a - q.m - 0.04) / 2;
    slide.addShape("ellipse", { x: b.x + 0.02, y: y + h / 2 - 0.2, w: 0.4, h: 0.4, fill: { color: RED }, line: { type: "none" } });
    T(String(i + 1), b.x + 0.02, y + h / 2 - 0.2, 0.4, 0.4, { size: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    T([{ text: name, options: { bold: true, breakLine: true } }, { text: desc, options: {} }], xR, y + 0.03, cR, h - 0.06, { size: pt, valign: "middle", margin: 0.04 });
    // [Avoid] on a grey band, [Mitigate] on white, as the deck's [Aim] / [How] rows
    slide.addShape("rect", { x: xS, y: ys, w: cS, h: q.a, fill: { color: G1 }, line: { type: "none" } });
    T([{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: avoid, options: { italic: true } }], xS + 0.08, ys, cS - 0.12, q.a, { size: pt, valign: "middle" });
    T([{ text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: mit, options: {} }], xS + 0.08, ys + q.a + 0.04, cS - 0.12, q.m, { size: pt, valign: "middle" });
    if (i < rows.length - 1) slide.addShape("line", { x: b.x, y: y + h, w: b.w, h: 0, line: { color: G4, width: 0.75, dashType: "sysDot" } });
    y += h;
  });
}

L.save(pres, __dirname + "/candidate.pptx");
