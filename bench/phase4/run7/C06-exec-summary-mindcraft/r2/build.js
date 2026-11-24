// C06 rebuild (run7 r2): "Executive Summary", four paragraphs, in the style of Case-2019-Mindcraft.
// Form: label-block rows (Style/refs/case-competitions-2019-2020.md §2), drawn with this deck's own furniture:
// numbered dark-grey square chip + light-grey label block as on the deck's agenda (slide 2), body at the profile's 14 pt
// Verdana, key words bold in the main colour, thin grey rules between rows as in the deck's matrix slide (slide 12).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, B, P } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
const C = P.C, FONT = P.THEME.bodyFontFace;

const rows = [
  { label: "Market Outlook", text: "Fine jewelry market expects **attractive growth** in next five years, mainly driven by the strong demands from **millennials in tier 1 and 2 cities** and **emerging middle class from tier 3 and 4 cities**. These two primary customer groups have different key purchasing criteria: **individuality and youthful image** for high-tier millennials and **brand recognition** for low-tier middle class." },
  { label: "Growth Strategy", text: "However, CSS faces challenges in seizing growth in the two primary customer groups: **low penetration of the youth brands** in high tiers and **limited access and brand awareness** in low tiers. Therefore, CSS's five-year growth strategy should address **branding, offline expansion and omni-channel development** with differentiations accommodating to two primary customers." },
  { label: "Financials", text: "Moreover, the proposed top-line growth strategy is expected to deliver **12% annual growth**, largely driven by **offline expansion strategy**." },
  { label: "Risks", text: "Finally, the strategy will impose **affordable financial pressure** and the implementation risks including **internal resistance, talent and supply chain management and IT system** have been preliminarily identified." },
];

const runs = (s) => String(s).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) =>
  p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: C.navy } } : { text: p, options: {} });

// geometry
const pt = 14, chip = 0.56, labW = 2.55, gapX = 0.3, gap = 0.22;
const x0 = B.x + 0.4, xLab = x0 + chip, xTxt = xLab + labW + gapX, wTxt = B.x + B.w - 0.25 - xTxt;
const top = B.y + 0.2, avail = B.y + B.h - 0.15 - top;
// row heights follow each paragraph's line count (Verdana ~0.56 em per character, as rendered)
const cpl = Math.floor((wTxt - 0.15) * 72 / (pt * 0.56));
const lines = rows.map((r) => Math.ceil(r.text.replace(/\*\*/g, "").length / cpl));
const lineH = pt * 1.27 / 72, need = lines.map((n) => Math.max(chip + 0.2, n * lineH + 0.24));
const extra = (avail - (rows.length - 1) * gap - need.reduce((a, c) => a + c, 0)) / rows.length;
const hs = need.map((h) => h + Math.max(0, extra));
if (process.env.DBG) console.log({cpl, lines, need, extra, avail});
if (extra < 0) throw new Error("rows do not fit: cut words, never shrink type");

let y = top;
rows.forEach((r, i) => {
  const h = hs[i];
  // label block: square number chip + light-grey block with the section name (agenda form of this deck)
  slide.addShape("rect", { x: xLab, y, w: labW, h, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addShape("rect", { x: x0, y, w: chip, h, fill: { color: C.g4 }, line: { type: "none" } });
  slide.addText(String(i + 1), { x: x0, y, w: chip, h, fontFace: FONT, fontSize: 16, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  slide.addText(r.label, { x: xLab + 0.12, y, w: labW - 0.2, h, fontFace: FONT, fontSize: pt, bold: true, color: C.text, valign: "middle", margin: 0.04, isTextBox: true });
  // paragraph
  slide.addText(runs(r.text), { x: xTxt, y, w: wTxt, h, fontFace: FONT, fontSize: pt, color: C.text, valign: "middle", margin: 0.05, lineSpacingMultiple: 1.05, isTextBox: true });
  // thin grey rule between rows
  if (i < rows.length - 1) slide.addShape("line", { x: xTxt, y: y + h + gap / 2, w: wTxt, h: 0, line: { color: C.g2, width: 0.75 } });
  y += h + gap;
});

L.save(pres, path.join(__dirname, "candidate.pptx"));
