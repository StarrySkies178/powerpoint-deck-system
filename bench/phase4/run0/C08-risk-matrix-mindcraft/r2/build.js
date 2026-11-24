// C08 rebuild 2: risk heat map + risk -> solutions table, in the style of Case-2019-Mindcraft (deck as reference).
// Layout: HALF2 as on the deck's other two-panel analysis slides (panel boxes from scripts/layout_skeleton.py on
// Mindcraft slide 14: [0.36, 1.37, 6.02, 5.4] | [6.66, 1.37, 6.35, 5.4]), re-split 45/55 because the table carries more text.
// Deck furniture copied from the other slides' renders: red numbered chip (italic number) + bold sub-headline + grey rule (own head(),
// since S.subhead cannot set the italic number), italic grey column headers over a black rule and [Aim]/[How]-style red bold tags (Mindcraft 8),
// red dashed callout box with red bold italic label (Mindcraft 7), F1F1F1 panel fill.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, S, B } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
});
const C = P.C, F = P.THEME.bodyFontFace;
const RED = C.navy /* main = C00000 */, DG = "5C5C5C", MG = "A6A6A6", LG = "F1F1F1", MID = "D5D5D5";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 12, color: o.color || "000000", bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.02, isTextBox: true, rotate: o.rotate, objectName: o.name });

// ---------- deck frame, as on the other slides' renders: italic bold tracker with red triangles at fixed slots,
// grey footer rule, italic source, MindCraft logo (the master's own picture) and the page number
const crumb = [["Market Analysis", 0.36], ["Growth Strategy", 2.885], ["Risk & Mitigation", 5.56]];
crumb.forEach(([t, x], k) => {
  T(t, x, 0.04, 2.6, 0.32, { size: 14, bold: true, italic: true, color: k === 2 ? RED : MG, margin: 0, valign: "top" });
  if (k < 2) slide.addShape("triangle", { x: [2.42, 5.18][k], y: 0.085, w: 0.27, h: 0.25, rotate: 90, fill: { color: RED }, line: { type: "none" } });
});
slide.addText([{ text: "Source: MindCraft Analysis", options: { italic: true } }], { placeholder: "source" });
slide.addShape("line", { x: 0, y: 7.212, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });
// the logo is a picture on the reference deck's master (bg object 18, ppt/media/image1.png); read from there at build time
const LOGO = require("path").join(__dirname, "../../../../../Templates/Case-2019-Mindcraft.pptx");
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));

// numbered sub-headline as on the deck: red square chip with an italic white number, bold 14 pt headline, grey rule
function head(n, text, x, y, w) {
  slide.addShape("rect", { x, y, w: 0.35, h: 0.3, fill: { color: RED }, line: { type: "none" } });
  T(String(n), x, y, 0.35, 0.3, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", margin: 0 });
  T(text, x + 0.43, y - 0.04, w - 0.45, 0.38, { size: 14, bold: true, margin: 0 });
  slide.addShape("line", { x: x + 0.35, y: y + 0.32, w: w - 0.35, h: 0, line: { color: "7E7E7E", width: 1.2 } });
  return 0.45;
}
// panel boxes
const top = 1.43, bot = 6.98, lx = 0.36, lw = 5.5, rx = 6.16, rw = 13.333 - 0.28 - rx;
const h1 = head(1, "Risk mapping", lx, top, lw);
const h2 = head(2, "Solutions for important risks", rx, top, rw);

// ---------- 1 heat map: likelihood (y) x severity (x), 3 x 3 ----------
const gx = lx + 1.05, gy = top + h1 + 0.25, gw = lw - 1.15, gh = bot - gy - 0.75, cw = gw / 3, ch = gh / 3;
// cell shade rises with likelihood x severity, in the deck's greys
const shade = (i, j) => { const s = i + j; return s >= 4 ? "BFBFBF" : s === 3 ? MID : s === 2 ? "E3E3E3" : LG; };
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)   // i = severity col (0 low), j = likelihood row (0 low)
  slide.addShape("rect", { x: gx + i * cw, y: gy + (2 - j) * ch, w: cw, h: ch, fill: { color: shade(i, j) }, line: { color: "FFFFFF", width: 2 } });
const lev = ["Low", "Medium", "High"];
lev.forEach((t, j) => T(t, gx - 0.72, gy + (2 - j) * ch, 0.68, ch, { size: 12, align: "right" }));
lev.forEach((t, i) => T(t, gx + i * cw, gy + gh + 0.04, cw, 0.28, { size: 12, align: "center" }));
// axis arrows and titles
slide.addShape("line", { x: gx - 0.02, y: gy + gh + 0.36, w: gw, h: 0, line: { color: DG, width: 1.25, endArrowType: "triangle" } });
T("Severity", gx, gy + gh + 0.38, gw, 0.3, { size: 12, bold: true, italic: true, color: DG, align: "center" });
slide.addShape("line", { x: lx + 0.06, y: gy, w: 0, h: gh, line: { color: DG, width: 1.25, beginArrowType: "triangle" } });
T("Likelihood", lx + 0.1 - gh / 2 + 0.06, gy + gh / 2 - 0.15, gh, 0.3, { size: 12, bold: true, italic: true, color: DG, align: "center", rotate: 270 });

// top priority zone: high severity column, medium + high likelihood
const zx = gx + 2 * cw + 0.06, zy = gy + 0.06, zw = cw - 0.12, zh = 2 * ch - 0.12;
slide.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 1.5, dashType: "dash" }, objectName: "form:riskMatrix priority zone" });
T("Top priority", zx, zy + 0.04, zw, 0.3, { size: 12, bold: true, italic: true, color: RED, align: "center" });

// risks: id, severity col, likelihood row, offset within cell (0-1), label
const d = 0.42;
const risks = [
  { id: 1, i: 2, j: 2, fx: 0.32, fy: 0.62 }, { id: 2, i: 2, j: 2, fx: 0.7, fy: 0.62 },
  { id: 3, i: 2, j: 1, fx: 0.32, fy: 0.5 }, { id: 4, i: 2, j: 1, fx: 0.7, fy: 0.5 },
  { id: 5, i: 2, j: 0, fx: 0.5, fy: 0.3, name: "Customer information safety" },
  { id: 6, i: 0, j: 2, fx: 0.5, fy: 0.3, name: "Competitor's response" },
  { id: 7, i: 1, j: 0, fx: 0.5, fy: 0.3, name: "Customer preference change" },
  { id: 8, i: 0, j: 1, fx: 0.5, fy: 0.3, name: "Cannibalization" },
];
risks.forEach((r) => {
  const cx = gx + r.i * cw + r.fx * cw, cy = gy + (2 - r.j) * ch + r.fy * ch, hot = !r.name;
  slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : DG }, line: { color: "FFFFFF", width: 1 } });
  T(String(r.id), cx - d / 2, cy - d / 2, d, d, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", margin: 0 });
  if (r.name) T(r.name, gx + r.i * cw + 0.04, cy + d / 2 + 0.02, cw - 0.08, ch * (1 - r.fy) - d / 2 - 0.06, { size: 11, align: "center", valign: "top" });
});

// ---------- 2 risks -> solutions table ----------
const tx = rx, ty = top + h2 + 0.08, nW = 0.42, kW = 2.55, sW = rw - nW - kW - 0.1;
T("Risks", tx + nW, ty, kW, 0.4, { size: 14, bold: true, italic: true, color: DG, align: "center" });
T("Solutions", tx + nW + kW + 0.1, ty, sW, 0.4, { size: 14, bold: true, italic: true, color: DG, align: "center" });
slide.addShape("line", { x: tx + nW, y: ty + 0.42, w: kW, h: 0, line: { color: "000000", width: 1 } });
slide.addShape("line", { x: tx + nW + kW + 0.1, y: ty + 0.42, w: sW, h: 0, line: { color: "000000", width: 1 } });
const rows = [
  { name: "Internal resistance", desc: "Changes in functions and work relationships cause anger and panic",
    avoid: "Strengthen internal communication and provide employee training", mitigate: "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary" },
  { name: "Talent management", desc: "Insufficient supply of trained salespersons for rapid expansion",
    avoid: "Make recruitment plan in advance", mitigate: "Reduce labor demand with technology" },
  { name: "Supply chain mgmt.", desc: "Rapid store expansion requires agile logistics",
    avoid: "Optimize logistics network", mitigate: "Find reliable third-party logistic partner" },
  { name: "IT system upgrade", desc: "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    avoid: "Make upgrade plan in advance; careful selection of new system supplier", mitigate: "Hire external technology experts for help" },
];
const weight = [1.42, 0.95, 0.8, 1.25], wsum = weight.reduce((a, b) => a + b, 0), y0 = ty + 0.52, avail = bot - y0;
let y = y0;
rows.forEach((r, k) => {
  const h = (avail * weight[k]) / wsum;
  // risk cell: grey fill, number chip, bold name over the description
  slide.addShape("rect", { x: tx + nW, y: y + 0.04, w: kW, h: h - 0.08, fill: { color: LG }, line: { type: "none" } });
  slide.addShape("ellipse", { x: tx + 0.02, y: y + h / 2 - 0.19, w: 0.38, h: 0.38, fill: { color: RED }, line: { color: "FFFFFF", width: 1 } });
  T(String(k + 1), tx + 0.02, y + h / 2 - 0.19, 0.38, 0.38, { size: 14, bold: true, italic: true, color: "FFFFFF", align: "center", margin: 0 });
  slide.addText([{ text: r.name, options: { bold: true, breakLine: true } }, { text: r.desc, options: { fontSize: 12 } }],
    { x: tx + nW + 0.08, y: y + 0.04, w: kW - 0.14, h: h - 0.08, fontFace: F, fontSize: 13, color: "000000", valign: "middle", margin: 0.02, isTextBox: true });
  // solutions: [Avoid] / [Mitigate] tags in red bold, as the [Aim] / [How] tags on Mindcraft 8
  slide.addText([
    { text: "[Avoid] ", options: { bold: true, color: RED } }, { text: r.avoid, options: { breakLine: true } },
    { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: r.mitigate },
  ], { x: tx + nW + kW + 0.16, y: y + 0.04, w: sW - 0.1, h: h - 0.08, fontFace: F, fontSize: 12, color: "000000", valign: "middle", margin: 0.02, paraSpaceAfter: 4, isTextBox: true });
  if (k < rows.length - 1) slide.addShape("line", { x: tx + nW, y: y + h, w: rw - nW, h: 0, line: { color: MG, width: 0.75, dashType: "dash" } });
  y += h;
});

(async () => {
  const fs = require("fs"), out = __dirname + "/candidate.pptx";
  if (fs.existsSync(LOGO)) {
    const z = await JSZip.loadAsync(fs.readFileSync(LOGO));
    const b64 = await z.file("ppt/media/image1.png").async("base64");
    slide.addImage({ data: "image/png;base64," + b64, x: 11.642, y: 7.175, w: 1.137, h: 0.325, altText: "MindCraft logo" });
  }
  await L.save(pres, out);
  // page 12 (prompt): the page-number field of this one-slide file would read 1, so it becomes the plain text 12
  const z = await JSZip.loadAsync(fs.readFileSync(out)), sp = "ppt/slides/slide1.xml";
  z.file(sp, (await z.file(sp).async("string")).replace(/<a:fld [^>]*type="slidenum">(<a:rPr[^>]*\/>)<a:t>\d+<\/a:t><\/a:fld>/, "<a:r>$1<a:t>12</a:t></a:r>"));
  fs.writeFileSync(out, await z.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
})();
