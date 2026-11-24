// C08 risk matrix in the Mindcraft deck style (deck as reference, leave-one-out).
// Layout: two numbered panels side by side (HALF2), panel boxes taken from Mindcraft slide 14
// (scripts/layout_skeleton.py: [0.36,1.37,6.02,5.4] and [6.66,1.37,6.35,5.4]), the split moved left
// because the table carries more text than the heat map.
// Panel 1: 3x3 heat map (likelihood x severity) with numbered dots and a dashed "Top priority" zone (riskMatrix form,
// drawn 3x3 because the brief gives three levels per axis). Panel 2: Risks | Solutions table with the same numbers;
// [Avoid] / [Mitigate] tags in bold red, as the deck tags [Aim] / [How] (Mindcraft slide 8).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S, HOUSE } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: "Source: MindCraft Analysis",
});
const C = P.C, F = P.THEME.bodyFontFace;
const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 12, color: o.color || C.text,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03, isTextBox: true,
  rotate: o.rotate, paraSpaceAfter: o.psa || 0 });

// ---------- panel 1: risk mapping ----------
function heatMap(sl, box) {
  t("Risks by likelihood and severity", box.x, box.y, box.w, 0.3, { size: 14, italic: true });
  const lw = 1.28, top = box.y + 0.8, gx = box.x + lw, gw = box.w - lw - 0.05, legH = 1.05, gh = box.y + box.h - legH - 0.68 - top;
  const cw = gw / 3, ch = gh / 3, lv = ["Low", "Medium", "High"];
  const shade = (li, si) => { const s = li + si; return s >= 3 ? "A6A6A6" : s === 2 ? "D5D5D5" : "F1F1F1"; };
  for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++)
    sl.addShape("rect", { x: gx + si * cw, y: top + (2 - li) * ch, w: cw, h: ch, fill: { color: shade(li, si) }, line: { color: "FFFFFF", width: 2 } });
  // axes
  lv.forEach((v, i) => {
    t(v, gx - 0.88, top + (2 - i) * ch, 0.84, ch, { align: "right", size: 14 });
    t(v, gx + i * cw, top + gh + 0.03, cw, 0.3, { align: "center", size: 14 });
  });
  t("Likelihood", box.x - gh / 2 + 0.13, top + gh / 2 - 0.15, gh, 0.3, { bold: true, rotate: 270, align: "center", size: 14 });
  t("Severity", gx, top + gh + 0.32, gw, 0.3, { bold: true, align: "center", size: 14 });
  // top-priority zone: medium + high likelihood, high severity; its label sits in the zone's head above the grid
  const zx = gx + 2 * cw - 0.02, zy = top - 0.38, zw = cw + 0.04, zh = 2 * ch + 0.4;
  sl.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: C.accent, width: 2, dashType: "dash" } });
  t("Top priority", zx, zy + 0.02, zw, 0.34, { bold: true, italic: true, color: C.accent, align: "center", size: 12, margin: 0 });
  const d = 0.44;
  const dot = (id, cx, cy, hot, dd = d, pt = 14) => {
    sl.addShape("ellipse", { x: cx - dd / 2, y: cy - dd / 2, w: dd, h: dd, fill: { color: hot ? C.accent : "5C5C5C" }, line: { color: "FFFFFF", width: 1 } });
    t(String(id), cx - dd / 2, cy - dd / 2, dd, dd, { bold: true, color: "FFFFFF", align: "center", margin: 0, size: pt });
  };
  const at = (si, li, fx = 0.5) => [gx + (si + fx) * cw, top + (2.5 - li) * ch];
  dot(1, ...at(2, 2, 0.28), true); dot(2, ...at(2, 2, 0.72), true);
  dot(3, ...at(2, 1, 0.28), true); dot(4, ...at(2, 1, 0.72), true);
  dot(6, ...at(0, 2), false); dot(8, ...at(0, 1), false); dot(7, ...at(1, 0), false); dot(5, ...at(2, 0), false);
  // key for the risks outside the zone (the zone's risks are named in the table, panel 2)
  const ly = top + gh + 0.72, rh = legH / 4;
  [[5, "Customer information safety"], [6, "Competitor's response"], [7, "Customer preference change"], [8, "Cannibalization"]].forEach(([id, n], i) => {
    dot(id, gx + 0.14, ly + i * rh + rh / 2, false, 0.24, 11);
    t(n, gx + 0.34, ly + i * rh, gw - 0.3, rh, { size: 12 });
  });
}

// ---------- panel 2: solutions for important risks ----------
const RISKS = [
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
function solutions(sl, box) {
  const rw = box.w * 0.38, sx = box.x + rw + 0.1, sw = box.w - rw - 0.1, hh = 0.42;
  t("Risks", box.x, box.y, rw, hh, { size: 14, bold: true, italic: true, align: "center" });
  t("Solutions", sx, box.y, sw, hh, { size: 14, bold: true, italic: true, align: "center" });
  sl.addShape("line", { x: box.x, y: box.y + hh, w: rw, h: 0, line: { color: "808080", width: 1.2 } });
  sl.addShape("line", { x: sx, y: box.y + hh, w: sw, h: 0, line: { color: "808080", width: 1.2 } });
  // row heights from the lines each row takes at 14 pt in this panel (rendered and counted): the taller of risk and solutions
  const need = [5.6, 4, 3.1, 5.9].map((n) => 0.14 + 0.245 * n);
  const tot = need.reduce((a, b) => a + b, 0), avail = box.h - hh - 0.1;
  let y = box.y + hh + 0.1;
  RISKS.forEach(([name, desc, avoid, mitig], i) => {
    const h = avail * need[i] / tot;
    const d = 0.34;
    sl.addShape("ellipse", { x: box.x + 0.04, y: y + (h - 0.08) / 2 - d / 2, w: d, h: d, fill: { color: C.accent }, line: { color: "FFFFFF", width: 1 } });
    t(String(i + 1), box.x + 0.04, y + (h - 0.08) / 2 - d / 2, d, d, { bold: true, color: "FFFFFF", align: "center", margin: 0, size: 14 });
    slide.addText([{ text: name, options: { bold: true, breakLine: true, fontSize: 14 } }, { text: desc, options: { fontSize: 14 } }],
      { x: box.x + 0.46, y: y + 0.04, w: rw - 0.46, h: h - 0.12, fontFace: F, color: C.text, valign: "middle", margin: 0.03, isTextBox: true });
    sl.addShape("rect", { x: sx, y: y + 0.04, w: sw, h: h - 0.12, fill: { color: C.g1 }, line: { type: "none" } });
    slide.addText([
      { text: "[Avoid] ", options: { bold: true, color: C.accent } }, { text: avoid, options: { breakLine: true } },
      { text: "[Mitigate] ", options: { bold: true, color: C.accent } }, { text: mitig },
    ], { x: sx + 0.08, y: y + 0.04, w: sw - 0.16, h: h - 0.12, fontFace: F, fontSize: 14, color: C.text, valign: "middle", margin: 0.03, paraSpaceAfter: 3, isTextBox: true });
    y += h;
    if (i < RISKS.length - 1) sl.addShape("line", { x: box.x, y: y - 0.04, w: box.w, h: 0, line: { color: "A6A6A6", width: 0.75, dashType: "sysDot" } });
  });
}

S.composeSlide(pres, slide, {
  regions: [{ x: 0.36, y: 1.37, w: 4.55, h: 5.68 }, { x: 5.15, y: 1.37, w: 7.85, h: 5.68 }],
  panels: [
    { headline: "Risk mapping", draw: heatMap },
    { headline: "Solutions for important risks", draw: solutions },
  ],
});
// Section tracker as the deck draws it (Mindcraft 8, 12, 14): bold italic 14 pt items at fixed places, grey, the current one
// red, with red right-pointing triangles between. P.frame's crumb writes one text line with "\u25B6" glyphs instead.
[["Market Analysis", 0.33, false], ["Growth Strategy", 2.84, false], ["Risk & Mitigation", 5.51, true]].forEach(([s, x, on]) =>
  t(s, x, 0.03, 3.0, 0.32, { size: 14, bold: true, italic: true, color: on ? C.accent : "A6A6A6", margin: 0.03 }));
[2.43, 5.18].forEach((x) => slide.addShape("triangle", { x, y: 0.06, w: 0.25, h: 0.27, rotate: 90, fill: { color: C.accent }, line: { type: "none" } }));
// The deck's master frame: thin grey rule above the source line and the MindCraft logo bottom right (reference master, not a slide)
slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });
const logo = path.join(__dirname, "mindcraft-logo.png");
require("child_process").execSync(`unzip -p "${path.join(__dirname, "../../../../../Templates/Case-2019-Mindcraft.pptx")}" ppt/media/image1.png > "${logo}"`);
slide.addImage({ path: logo, x: 11.64, y: 7.17, w: 1.14, h: 0.32, altText: "MindCraft logo" });

L.save(pres, __dirname + "/candidate.pptx");
