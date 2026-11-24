// C08 risk matrix, Mindcraft deck as the reference (leave-one-out).
// Approach: Mindcraft style profile (Verdana, red C00000 rule and chips, grey F1F1F1 panels), HALF2 regions
// measured from a sibling HALF2 slide of the deck (scripts/layout_skeleton.py on the Financial Forecasting slide:
// panels at x 0.36 / 6.66, top 1.37), numbered panel heads by composeSlide/subhead in the deck's own panel style.
// Panel 1: 3 x 3 likelihood x severity heat map drawn here (riskMatrix is a 2 x 2 with a list attached, the prompt asks
// for Low/Medium/High on both axes); panel 2: risk -> [Avoid]/[Mitigate] table with the same numbers as the map,
// in the deck's table look ([Aim]/[How] red bold tags, grey cells, dashed row rules, as on the strategy-overview slide).
const path = require("path"), fs = require("fs"), { execFileSync } = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE, source: "Source: MindCraft Analysis" });
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = "C00000", BLACK = "000000", G_LIGHT = "F1F1F1", G_MID = "D5D5D5", G_DARK = "A6A6A6", G_TEXT = "5C5C5C";

// ---- deck furniture from the reference master: section tracker (bold italic, red triangles), footer rule, logo, page no.
(function tracker(items, cur) {
  let x = 0.36;
  const w = [2.05, 2.15, 2.6];
  items.forEach((it, i) => {
    slide.addText(it, { x, y: 0.05, w: w[i], h: 0.32, fontFace: FONT, fontSize: 14, bold: true, italic: true, color: i === cur ? RED : G_DARK, margin: 0, valign: "middle" });
    x += w[i];
    if (i < items.length - 1) { slide.addShape("triangle", { x: x + 0.05, y: 0.1, w: 0.24, h: 0.22, rotate: 90, fill: { color: RED }, line: { type: "none" } }); x += 0.55; }
  });
})(["Market Analysis", "Growth Strategy", "Risk & Mitigation"], 2);
slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });
const logo = path.join(__dirname, "mindcraft-logo.png");
if (!fs.existsSync(logo)) fs.writeFileSync(logo, execFileSync("unzip", ["-p", path.join(__dirname, "../../../../../Templates/Case-2019-Mindcraft.pptx"), "ppt/media/image1.png"]));
slide.addImage({ path: logo, x: 11.64, y: 7.175, w: 1.137, h: 0.325 });
// page number: build.py replaces the layout's slide-number field with the page number "12" (plain text, as the deck's page numbers do not follow the slide index) and sets the source line italic, as in the deck

// ---- panel 1: risk heat map -------------------------------------------------------------
function heatMap(s, b) {
  const yl = 0.36, rl = 0.76, xl = 0.62;            // y-axis title, row labels, x labels + title
  const gx = b.x + yl + rl, gy = b.y + 0.12, gw = b.x + b.w - gx, gh = b.y + b.h - xl - gy, cw = gw / 3, ch = gh / 3;
  const lv = ["Low", "Medium", "High"];
  const shade = (li, si) => [G_LIGHT, G_LIGHT, G_MID, G_DARK, G_DARK][li + si];   // risk level = likelihood + severity
  for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++)
    s.addShape("rect", { x: gx + si * cw, y: gy + (2 - li) * ch, w: cw, h: ch, fill: { color: shade(li, si) }, line: { color: "FFFFFF", width: 2 } });
  lv.forEach((t, i) => {
    s.addText(t, { x: b.x + yl, y: gy + (2 - i) * ch, w: rl - 0.08, h: ch, fontFace: FONT, fontSize: 12, color: BLACK, align: "right", valign: "middle", margin: 0 });
    s.addText(t, { x: gx + i * cw, y: gy + gh + 0.04, w: cw, h: 0.26, fontFace: FONT, fontSize: 12, color: BLACK, align: "center", valign: "top", margin: 0 });
  });
  s.addText("Severity", { x: gx, y: gy + gh + 0.3, w: gw, h: 0.3, fontFace: FONT, fontSize: 14, bold: true, color: BLACK, align: "center", valign: "middle", margin: 0 });
  s.addText("Likelihood", { x: b.x + yl / 2 - gh / 2, y: gy + gh / 2 - 0.15, w: gh, h: 0.3, rotate: 270, fontFace: FONT, fontSize: 14, bold: true, color: BLACK, align: "center", valign: "middle", margin: 0 });
  // "Top priority" zone: severity High x likelihood Medium-High
  const zx = gx + 2 * cw, zy = gy, zw = cw, zh = 2 * ch;
  s.addShape("rect", { x: zx + 0.03, y: zy + 0.03, w: zw - 0.06, h: zh - 0.06, fill: { type: "none" }, line: { color: RED, width: 2, dashType: "dash" } });
  s.addText("Top priority", { x: zx, y: zy + 0.06, w: zw, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, italic: true, color: RED, align: "center", valign: "middle", margin: 0 });
  const d = 0.42;
  const dot = (id, cx, cy, hot) => {
    s.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : G_TEXT }, line: { color: "FFFFFF", width: 1 } });
    s.addText(String(id), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fontFace: FONT, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  };
  const cell = (li, si) => ({ x: gx + si * cw, y: gy + (2 - li) * ch });
  // top priority risks: two per cell, side by side
  [[[1, 2], 2], [[3, 4], 1]].forEach(([ids, li]) => { const c = cell(li, 2);
    ids.forEach((id, k) => dot(id, c.x + cw * (k ? 0.7 : 0.3), c.y + ch * (li === 2 ? 0.62 : 0.5), true)); });
  // other risks: dot + name in the cell
  [[6, "Competitor's response", 2, 0], [8, "Cannibalization", 1, 0], [7, "Customer preference change", 0, 1], [5, "Customer information safety", 0, 2]]
    .forEach(([id, name, li, si]) => { const c = cell(li, si);
      dot(id, c.x + cw / 2, c.y + 0.1 + d / 2, false);
      s.addText(name, { x: c.x, y: c.y + 0.16 + d, w: cw, h: ch - d - 0.2, fontFace: FONT, fontSize: 12, color: BLACK, align: "center", valign: "top", margin: 0 }); });
}

// ---- panel 2: risks -> solutions table ---------------------------------------------------
const RISKS = [
  ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  ["Talent management", "Insufficient supply of trained salespersons for rapid expansion", "Make recruitment plan in advance", "Reduce labor demand with technology"],
  ["Supply chain mgmt.", "Rapid store expansion requires agile logistics", "Optimize logistics network", "Find reliable third-party logistic partner"],
  ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
function solutions(s, b) {
  const nw = 0.46, rw = 2.5, sx = b.x + nw + rw + 0.1, sw = b.x + b.w - sx, hh = 0.38;
  s.addText("Risks", { x: b.x + nw, y: b.y, w: rw, h: hh, fontFace: FONT, fontSize: 14, bold: true, italic: true, color: G_TEXT, align: "center", valign: "middle", margin: 0 });
  s.addText("Solutions", { x: sx, y: b.y, w: sw, h: hh, fontFace: FONT, fontSize: 14, bold: true, italic: true, color: G_TEXT, align: "center", valign: "middle", margin: 0 });
  s.addShape("line", { x: b.x + nw, y: b.y + hh, w: b.w - nw, h: 0, line: { color: BLACK, width: 1 } });
  // row heights from greedy word-wrap estimates (13 pt solutions ~35 characters a line, 12 pt descriptions ~24), slack shared evenly
  const lh13 = 13 * 1.2 / 72, lh12 = 12 * 1.2 / 72;
  const ln = (t, k) => t.split(" ").reduce((st, w) => (st.c && st.c + 1 + w.length <= k ? { n: st.n, c: st.c + 1 + w.length } : { n: st.n + 1, c: w.length }), { n: 0, c: 0 }).n;
  const need = RISKS.map((r) => Math.max(ln(r[0], 19) * lh13 + ln(r[1], 24) * lh12, (ln("[Avoid] " + r[2], 35) + ln("[Mitigate] " + r[3], 35)) * lh13 + 0.06) + 0.14);
  const avail = b.y + b.h - (b.y + hh + 0.06), slack = (avail - need.reduce((a, c) => a + c, 0)) / RISKS.length;
  let y = b.y + hh + 0.06;
  RISKS.forEach((r, i) => {
    const h = need[i] + slack;
    s.addShape("ellipse", { x: b.x + 0.04, y: y + h / 2 - 0.21, w: 0.42, h: 0.42, fill: { color: RED }, line: { color: "FFFFFF", width: 1 } });
    s.addText(String(i + 1), { x: b.x + 0.04, y: y + h / 2 - 0.21, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    s.addShape("rect", { x: b.x + nw, y: y + 0.04, w: rw, h: h - 0.08, fill: { color: G_LIGHT }, line: { type: "none" } });
    s.addText([{ text: r[0], options: { bold: true, fontSize: 13, breakLine: true } }, { text: r[1], options: { italic: true, color: G_TEXT } }],
      { x: b.x + nw + 0.06, y: y + 0.04, w: rw - 0.12, h: h - 0.08, fontFace: FONT, fontSize: 12, color: BLACK, valign: "middle", margin: 0.03 });
    s.addText([{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: r[2], options: { breakLine: true } },
      { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: r[3] }],
      { x: sx, y: y + 0.04, w: sw, h: h - 0.08, fontFace: FONT, fontSize: 13, color: BLACK, valign: "middle", margin: 0.03, paraSpaceAfter: 4 });
    if (i < RISKS.length - 1) s.addShape("line", { x: b.x, y: y + h, w: b.w, h: 0, line: { color: G_DARK, width: 0.75, dashType: "dash" } });
    y += h;
  });
}

S.composeSlide(pres, slide, {
  regions: [{ x: 0.36, y: 1.37, w: 5.45, h: 5.62 }, { x: 6.06, y: 1.37, w: 6.96, h: 5.62 }],
  panels: [{ headline: "Risk mapping", draw: heatMap }, { headline: "Solutions for important risks", draw: solutions }],
});

L.save(pres, __dirname + "/candidate.pptx");
