// C06 rebuild 3: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Form: the deck's own numbered rows (agenda slide 2: dark grey square chip with a white bold italic number,
// light grey bar beside it), one row per paragraph; title-only header like the deck's agenda/appendix slides (no crumb).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
// deck furniture seen on its other slides: italic source line, thin grey footer rule above it; the deck's
// non-section slides (agenda, appendix) carry no breadcrumb and no page number
slide.addText("Source: MindCraft Analysis", { placeholder: "source", italic: true });
slide.slideNumber = null;
const S = L.HOUSE.STYLE, C = P.C;
const FONT = S.fonts.latin, PT = S.body.pt;                 // Verdana 14
const CHIP = S.roles.grey2 || "5C5C5C", BAR = S.roles.panel || "F1F1F1";

// paragraphs as runs: key phrases bold (the deck bolds key words in its readings, black)
const B = (t) => ({ text: t, options: { bold: true } }), N = (t) => ({ text: t });
const paras = [
  [N("Fine jewelry market expects "), B("attractive growth in next five years"), N(", mainly driven by the strong demands from "), B("millennials in tier 1 and 2 cities"), N(" and "), B("emerging middle class from tier 3 and 4 cities"), N(". These two primary customer groups have different key purchasing criteria: "), B("individuality and youthful image"), N(" for high-tier millennials and "), B("brand recognition"), N(" for low-tier middle class.")],
  [N("However, CSS faces challenges in seizing growth in the two primary customer groups: "), B("low penetration of the youth brands in high tiers"), N(" and "), B("limited access and brand awareness in low tiers"), N(". Therefore, CSS's five-year growth strategy should address "), B("branding, offline expansion and omni-channel development"), N(" with differentiations accommodating to two primary customers.")],
  [N("Moreover, the proposed top-line growth strategy is expected to deliver "), B("12% annual growth"), N(", largely driven by "), B("offline expansion strategy"), N(".")],
  [N("Finally, the strategy will impose "), B("affordable financial pressure"), N(" and the implementation risks including "), B("internal resistance, talent and supply chain management and IT system"), N(" have been preliminarily identified.")],
];

// geometry: body between the title rule and the source line, reference margins
const left = S.margins.left, right = S.size[0] - S.margins.right;
const top = S.margins.body_top + 0.12, bottom = 7.02;
const chip = 0.55, gapX = 0.16, gapY = 0.2;
const tx = left + chip + gapX, tw = right - tx;
// row height from estimated wrapped lines (Verdana ~0.55 em per char, measured on the render), spare height shared out evenly
const cpl = Math.floor(((tw - 0.3) * 72) / (PT * 0.55));
const lines = paras.map((r) => Math.ceil(r.map((x) => x.text).join("").length / cpl));
const lineH = (PT * 1.5) / 72;
const base = lines.map((n) => n * lineH + 0.3);
const spare = (bottom - top - gapY * (paras.length - 1) - base.reduce((a, b) => a + b, 0)) / paras.length;
let y = top;
paras.forEach((runs, i) => {
  const h = base[i] + Math.max(0, spare);
  slide.addShape("rect", { x: tx, y, w: tw, h, fill: { color: BAR }, line: { type: "none" }, objectName: `para-bar-${i + 1}` });
  slide.addText(runs, { x: tx + 0.1, y, w: tw - 0.2, h, fontFace: FONT, fontSize: PT, color: S.body.text, valign: "middle", align: "left",
    margin: 0.06, lineSpacingMultiple: 1.2, isTextBox: true, objectName: `para-text-${i + 1}` });
  const cy = y + (h - chip) / 2;
  slide.addShape("rect", { x: left, y: cy, w: chip, h: chip, fill: { color: CHIP }, line: { type: "none" }, objectName: `para-chip-${i + 1}` });
  slide.addText(String(i + 1), { x: left, y: cy, w: chip, h: chip, fontFace: FONT, fontSize: PT, bold: true, italic: true, color: "FFFFFF",
    align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: `para-num-${i + 1}` });
  y += h + gapY;
});

slide.addShape("line", { x: 0, y: 7.21, w: S.size[0], h: 0, line: { color: S.roles.grey4 || "A6A6A6", width: 0.75 }, objectName: "footer-rule" });

L.save(pres, __dirname + "/candidate.pptx");
