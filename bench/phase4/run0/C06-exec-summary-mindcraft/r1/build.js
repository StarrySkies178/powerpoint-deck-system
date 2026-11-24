// C06 rebuild 1: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Form: the deck's own numbered-row form (Agenda slide 2: dark grey italic number chip + light grey F1F1F1 bar),
// one row per paragraph, Verdana 14 pt body as the profile measures. Title as on the deck's plain-title slides
// (Agenda, Appendix 1): one line, no breadcrumb. Key phrases bold in the deck's red, as its [Aim]/[Avoid] labels are.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, HOUSE } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
const C = P.C, FONT = HOUSE.FONT.latin;

const paras = [
  "Fine jewelry market expects **attractive growth in next five years**, mainly driven by the strong demands from **millennials in tier 1 and 2 cities** and **emerging middle class from tier 3 and 4 cities**. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
  "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address **branding, offline expansion and omni-channel development** with differentiations accommodating to two primary customers.",
  "Moreover, the proposed top-line growth strategy is expected to deliver **12% annual growth**, largely driven by offline expansion strategy.",
  "Finally, the strategy will impose **affordable financial pressure** and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.",
];
const runs = (t) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith("**")
  ? { text: p.slice(2, -2), options: { bold: true, color: C.navy } } : { text: p, options: {} }));

// row heights follow the text length (Verdana 14 pt: ~0.6 em per character)
const pt = 14, chipW = 0.56, gapX = 0.2, x0 = B.x, tx = x0 + chipW + gapX, tw = B.x + B.w - tx;
const cpl = Math.floor(((tw - 0.3) * 72) / (pt * 0.6));
const lines = paras.map((t) => Math.ceil(t.replace(/\*\*/g, "").length / cpl));
const lh = (pt * 1.2) / 72, pad = 0.3;
const need = lines.map((n) => n * lh + pad);
const top = B.y + 0.25, bottom = B.y + B.h - 0.1, gapY = 0.28;
const spare = (bottom - top) - need.reduce((a, b) => a + b, 0) - gapY * (paras.length - 1);
const hs = need.map((h) => h + Math.max(0, spare) / paras.length);
let y = top;
paras.forEach((t, i) => {
  const h = hs[i];
  slide.addShape("rect", { x: x0, y, w: chipW, h, fill: { color: C.g4 }, line: { type: "none" } });
  slide.addText(String(i + 1), { x: x0, y, w: chipW, h, fontFace: FONT, fontSize: 16, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  slide.addShape("rect", { x: tx, y, w: tw, h, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addText(runs(t), { x: tx + 0.12, y, w: tw - 0.24, h, fontFace: FONT, fontSize: pt, color: C.text, valign: "middle", margin: 0.04, isTextBox: true, lineSpacingMultiple: 1.0 });
  y += h + gapY;
});

// footer rule: the thin grey line across the full width above the footer on every other slide of the deck (measured on their renders: 7.21 in, B4B4B4)
slide.addShape("line", { x: 0, y: 7.21, w: P.W, h: 0, line: { color: "B4B4B4", width: 0.75 } });
// no page number: the deck numbers its pages from the first content slide after the agenda (build.py drops the placeholder)
L.save(pres, __dirname + "/candidate.pptx");
