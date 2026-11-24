// C08 risk matrix, in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Layout: HALF2-type split of the deck's own two-panel slides (Mindcraft 8 and 14: numbered red chip + bold
// sub-headline over a grey rule), the left panel narrowed so the solutions table keeps the deck's 14 pt body.
// Panel 1: heat map (generator idea of riskMatrix, redrawn as the 3 x 3 Low/Medium/High grid the prompt asks for,
//          in the deck's greys, numbered red dots, dashed red "Top priority" zone as in Mindcraft 7's dashed callouts).
// Panel 2: risk -> solutions table in the deck's [Aim]/[How] form (Mindcraft 8): red bold bracket labels, first line
//          in a light grey band, second over a black rule, groups split by dotted grey lines.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S, HOUSE } = L.start({
  ref: "Case-2019-Mindcraft", title: TITLE,
  source: [{ text: "Source: MindCraft Analysis", options: { italic: true } }],
});

const RED = "C00000", BLACK = "000000", G1 = "F1F1F1", G2 = "D5D5D5", G3 = "A6A6A6", G4 = "808080", G5 = "5C5C5C", WHITE = "FFFFFF";
const FONT = "Verdana";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, {
  x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.03, isTextBox: true, rotate: o.rotate,
  paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm,
});

// ---- breadcrumb tracker (deck form: grey bold italic sections, current one red, red triangles between)
{
  const items = ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], cur = 2, xs = [0.37, 2.88, 5.48];
  items.forEach((it, i) => {
    T(it, xs[i], 0.04, 2.4, 0.3, { pt: 14, bold: true, italic: true, color: i === cur ? RED : G3, margin: 0 });
    if (i) slide.addShape("triangle", { x: xs[i] - 0.5, y: 0.08, w: 0.2, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  });
}

// ---- master furniture of the deck: grey footer rule and the team logo (from the reference deck's slide master)
slide.addShape("line", { x: 0, y: 7.212, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });
slide.addImage({ path: path.join(__dirname, "mindcraft-logo.png"), x: 11.642, y: 7.175, w: 1.137, h: 0.325, altText: "MindCraft logo" });

// ---- panel boxes
const TOP = 1.39, BOT = 7.06;
const LP = { x: 0.37, y: TOP, w: 4.4, h: BOT - TOP };
const RP = { x: 5.02, y: TOP, w: 13.05 - 5.02, h: BOT - TOP };

S.composeSlide(pres, slide, {
  regions: [LP, RP],
  panels: [
    { headline: "Risk mapping", draw: (s, b) => heatMap(b) },
    { headline: "Solutions for important risks", draw: (s, b) => solutions(b) },
  ],
});

// ---- 1 heat map: likelihood (rows, High on top) x severity (columns)
function heatMap(b) {
  const lab = 0.82, xl = b.x + lab, gw = b.x + b.w - xl, bottomLab = 0.62, top = 0.36;
  const y0 = b.y + top, gh = b.y + b.h - bottomLab - y0, cw = gw / 3, ch = gh / 3;
  const lv = ["Low", "Medium", "High"];
  // cell shade by likelihood + severity: the deck's grey steps, darker = more critical
  const shade = (li, si) => [G1, G1, G2, G3, G3][li + si];
  for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++) {
    const x = xl + si * cw, y = y0 + (2 - li) * ch;
    slide.addShape("rect", { x, y, w: cw, h: ch, fill: { color: shade(li, si) }, line: { color: WHITE, width: 2 } });
  }
  // axes: row labels + rotated "Likelihood"; column labels + "Severity"
  lv.forEach((t, li) => T(t, b.x, y0 + (2 - li) * ch, lab - 0.08, ch, { pt: 12, align: "right", valign: "middle", margin: 0 }));
  T("Likelihood", b.x, b.y, 2.0, 0.28, { pt: 12, bold: true, italic: true, color: G5, valign: "middle", margin: 0 });
  lv.forEach((t, si) => T(t, xl + si * cw, y0 + gh + 0.04, cw, 0.28, { pt: 12, align: "center", margin: 0 }));
  T("Severity", xl, y0 + gh + 0.32, gw, 0.28, { pt: 12, bold: true, italic: true, color: G5, align: "center", margin: 0 });
  slide.addShape("line", { x: xl, y: y0 + gh, w: gw, h: 0, line: { color: G5, width: 1, endArrowType: "triangle" } });
  slide.addShape("line", { x: xl, y: y0, w: 0, h: gh, line: { color: G5, width: 1, beginArrowType: "triangle" } });

  // top-priority zone: medium-to-high likelihood x high severity, dashed red as the deck's callouts
  const zx = xl + 2 * cw, zy = y0, zw = cw, zh = 2 * ch;
  slide.addShape("rect", { x: zx + 0.04, y: zy + 0.04, w: zw - 0.08, h: zh - 0.08, fill: { type: "none" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  T("Top priority", zx + 0.04, zy + 0.15, zw - 0.08, 0.28, { pt: 12, bold: true, italic: true, color: RED, align: "center", margin: 0 });

  const d = 0.36;
  const dot = (n, cx, cy, hot) => {
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : G5 }, line: { color: WHITE, width: 1 } });
    T(String(n), cx - d / 2, cy - d / 2, d, d, { pt: 12, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
  };
  const cell = (li, si) => ({ x: xl + si * cw, y: y0 + (2 - li) * ch });
  // priority risks: numbers only, their names and solutions are in panel 2
  let c = cell(2, 2); dot(1, c.x + cw * 0.32, c.y + ch * 0.62, true); dot(2, c.x + cw * 0.68, c.y + ch * 0.62, true);
  c = cell(1, 2); dot(3, c.x + cw * 0.32, c.y + ch * 0.45, true); dot(4, c.x + cw * 0.68, c.y + ch * 0.45, true);
  // other risks: dot + name in their cell
  const other = [[6, "Competitor\u2019s response", 2, 0], [8, "Cannibali-zation", 1, 0], [7, "Customer preference change", 0, 1], [5, "Customer information safety", 0, 2]];
  other.forEach(([n, name, li, si]) => {
    const q = cell(li, si);
    dot(n, q.x + cw / 2, q.y + 0.1 + d / 2, false);
    T(name.replace("-", "­"), q.x + 0.04, q.y + 0.14 + d, cw - 0.08, ch - d - 0.18, { pt: 12, align: "center", margin: 0 });
  });
}

// ---- 2 solutions table: Risks | Solutions, [Avoid] / [Mitigate]
function solutions(b) {
  const risks = [
    ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
      "Strengthen internal communication and provide employee training",
      "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
    ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
      "Make recruitment plan in advance", "Reduce labor demand with technology"],
    ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
      "Optimize logistics network", "Find reliable third-party logistic partner"],
    ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
      "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
  ];
  const rw = 3.15, gx = b.x + rw + 0.12, gw = b.x + b.w - gx, hh = 0.3;
  T("Risks", b.x + 0.45, b.y, rw - 0.45, hh, { pt: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
  T("Solutions", gx, b.y, gw, hh, { pt: 14, bold: true, italic: true, color: G5, align: "center", valign: "middle" });
  // row heights by text length (14 pt Verdana: ~0.235 in a line)
  const lh = 0.235, cpl = (w) => Math.floor((w * 72) / 7.6);
  const lines = (t, w) => t.split(" ").reduce((a, wd) => { const L = a[a.length - 1]; if ((L + " " + wd).trim().length > cpl(w)) a.push(wd); else a[a.length - 1] = (L + " " + wd).trim(); return a; }, [""]).length;
  const ln = risks.map(([n, d, a, m]) => ({ left: lines(n, rw - 0.5) + lines(d, rw - 0.5), av: lines("[Avoid] " + a, gw - 0.16), mi: lines("[Mitigate] " + m, gw - 0.16) }));
  const need = ln.map((q) => Math.max(q.left * lh + 0.1, (q.av + q.mi) * lh + 0.26));
  const avail = b.y + b.h - (b.y + hh + 0.02), extra = (avail - need.reduce((x, y) => x + y, 0)) / risks.length;
  let y = b.y + hh + 0.02;
  risks.forEach(([name, desc, av, mi], i) => {
    const h = need[i] + extra;
    // number chip, same red dot as on the heat map
    const d = 0.36;
    slide.addShape("ellipse", { x: b.x, y: y + 0.08, w: d, h: d, fill: { color: RED }, line: { color: WHITE, width: 1 } });
    T(String(i + 1), b.x, y + 0.08, d, d, { pt: 12, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    slide.addText([{ text: name, options: { bold: true, breakLine: true } }, { text: desc, options: {} }],
      { x: b.x + 0.45, y: y + 0.04, w: rw - 0.45, h: h - 0.08, fontFace: FONT, fontSize: 14, color: BLACK, valign: "top", margin: 0.03, isTextBox: true });
    // [Avoid] on a light grey band, [Mitigate] over a black rule (Mindcraft 8's Aim / How rows)
    const ah = ln[i].av * lh + 0.1 + extra / 3, mh = h - ah - 0.14;
    slide.addShape("rect", { x: gx, y: y + 0.04, w: gw, h: ah, fill: { color: G1 }, line: { type: "none" } });
    slide.addText([{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: av, options: {} }],
      { x: gx + 0.05, y: y + 0.04, w: gw - 0.1, h: ah, fontFace: FONT, fontSize: 14, color: BLACK, valign: "middle", margin: 0.03, isTextBox: true });
    slide.addText([{ text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: mi, options: {} }],
      { x: gx + 0.05, y: y + 0.04 + ah, w: gw - 0.1, h: mh, fontFace: FONT, fontSize: 14, color: BLACK, valign: "middle", margin: 0.03, isTextBox: true });
    slide.addShape("line", { x: gx, y: y + 0.04 + ah + mh, w: gw, h: 0, line: { color: BLACK, width: 0.75 } });
    if (i < risks.length - 1) slide.addShape("line", { x: b.x, y: y + h, w: b.w, h: 0, line: { color: G3, width: 0.75, dashType: "sysDot" } });
    y += h;
  });
}

L.save(pres, path.join(__dirname, "candidate.pptx"));
