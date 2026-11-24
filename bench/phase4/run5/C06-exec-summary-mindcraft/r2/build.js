// C06 rebuild 2: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Form: label-block rows (Style/refs/case-competitions-2019-2020.md §2: TNT 2, E-Cluster 2, Vaccine 2), one row per
// paragraph of the prompt. Furniture from the deck's other slides: numbered chip + grey F1F1F1 box (Mindcraft agenda,
// slide 2), dark grey chip with white italic bold number (agenda, slide 2), dotted separators (slide 8),
// row labels taken from the deck's own section names (agenda / breadcrumb). Body text at the profile's 14 pt.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, S, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
const C = P.C, FONT = P.THEME.bodyFontFace, PT = prof.body.pt;

const rows = [
  { label: "Market\nAnalysis",
    text: "Fine jewelry market expects **attractive growth in next five years**, mainly driven by the strong demands from **millennials in tier 1 and 2 cities** and **emerging middle class from tier 3 and 4 cities**. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class." },
  { label: "Growth\nStrategy",
    text: "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address **branding, offline expansion and omni-channel development** with differentiations accommodating to two primary customers." },
  { label: "Financial\nImpact",
    text: "Moreover, the proposed top-line growth strategy is expected to deliver **12% annual growth**, largely driven by **offline expansion strategy**." },
  { label: "Risks",
    text: "Finally, the strategy will impose **affordable financial pressure** and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified." },
];

// body box: from under the title rule to above the footer line, at the reference's margins
const x0 = prof.margins.left, x1 = 13.333 - prof.margins.right - 0.1, top = prof.margins.body_top + 0.12, bottom = 6.95;
const chipS = 0.5, labW = 1.6, gapX = 0.15, tx = x0 + chipS + 0.12 + labW + gapX, tw = x1 - tx;
// height per row from the number of lines its paragraph needs at 14 pt Verdana (avg glyph ~0.6 em)
const cpl = Math.floor((tw - 0.3) * 72 / (PT * 0.6));
const plain = (t) => t.replace(/\*\*/g, "");
const lineCount = (t) => { let n = 1, cur = 0; for (const w of plain(t).split(/\s+/)) { const l = w.length + 1; if (cur + l > cpl) { n++; cur = l; } else cur += l; } return n; };
const lh = PT * 1.25 / 72, pad = 0.12, gapY = 0.18;
const need = rows.map((r) => lineCount(r.text) * lh + 2 * pad);
const free = (bottom - top) - need.reduce((a, b) => a + b, 0) - gapY * (rows.length - 1);

const extra = Math.max(0, free) / rows.length;          // spread spare height evenly, so no row is a tall box with little in it
let y = top;
rows.forEach((r, i) => {
  const h = need[i] + extra;
  // number chip (dark grey, white italic bold number, as on the agenda) and section label
  slide.addShape("rect", { x: x0, y: y + (h - chipS) / 2, w: chipS, h: chipS, fill: { color: C.g4 }, line: { type: "none" } });
  slide.addText(String(i + 1), { x: x0, y: y + (h - chipS) / 2, w: chipS, h: chipS, fontFace: FONT, fontSize: 16, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  slide.addText(r.label, { x: x0 + chipS + 0.12, y, w: labW, h, fontFace: FONT, fontSize: PT, bold: true, color: C.text, align: "left", valign: "middle", margin: 0.04, isTextBox: true });
  // paragraph in the deck's grey reading box, key words bold in the main colour
  slide.addShape("rect", { x: tx, y, w: tw, h, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addText(S.keyRuns(r.text), { x: tx + 0.15, y, w: tw - 0.3, h, fontFace: FONT, fontSize: PT, color: C.text, valign: "middle", margin: 0, isTextBox: true, lineSpacingMultiple: 1.0 });
  y += h;
  if (i < rows.length - 1) slide.addShape("line", { x: x0, y: y + gapY / 2, w: x1 - x0, h: 0, line: { color: C.g2, width: 0.75, dashType: "sysDot" } });
  y += gapY;
});

L.save(pres, __dirname + "/candidate.pptx");
