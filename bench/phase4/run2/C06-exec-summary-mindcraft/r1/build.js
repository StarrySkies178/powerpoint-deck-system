// C06 run2 r1: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Approach: the deck's style profile for the frame (Verdana, black 26 pt title on the red rule, 14 pt body), and the
// deck's own numbered-list form from its Agenda slide (2): a dark-grey square chip with an italic bold white number
// beside a light-grey F1F1F1 box. Each paragraph of the prompt sits in one box at the profile's body size (14 pt),
// key phrases bold in the main colour, as the deck marks its key figures. Grey footer rule as on every deck slide.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, S, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
const R = prof.roles, FONT = prof.fonts.body, PT = prof.body.pt;   // 14 pt body, never shrunk

const paras = [
  "Fine jewelry market expects **attractive growth** in next five years, mainly driven by the strong demands from **millennials in tier 1 and 2 cities** and **emerging middle class from tier 3 and 4 cities**. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
  "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address **branding, offline expansion and omni-channel development** with differentiations accommodating to two primary customers.",
  "Moreover, the proposed top-line growth strategy is expected to deliver **12% annual growth**, largely driven by offline expansion strategy.",
  "Finally, the strategy will impose **affordable financial pressure** and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.",
];
const runs = (t) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) =>
  p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: R.main } } : { text: p, options: {} });

// body area: under the title rule, above the deck's grey footer rule (7.21 in)
const top = prof.margins.body_top + 0.12, bottom = 6.98;
const chipX = prof.margins.left + 0.02, chipS = 0.58, boxX = chipX + chipS + 0.2, boxR = prof.page.right, boxW = boxR - boxX;
const gap = 0.22, padX = 0.2, padY = 0.12, LS = 1.25;               // line spacing as the deck's grey text boxes
// line estimate for Verdana 14 pt (average glyph ~0.6 em), so each box gets the height its text needs
const cpl = ((boxW - 2 * padX) * 72) / (PT * 0.56);
const lines = paras.map((t) => Math.ceil(t.replace(/\*\*/g, "").length / cpl - 0.15));
const lineH = (PT * 1.2 * LS) / 72;
const need = lines.map((n) => n * lineH + 2 * padY);
const free0 = bottom - top - gap * (paras.length - 1) - need.reduce((a, b) => a + b, 0);
const free = Math.max(0, free0);
// spare height goes to the gaps first (white space between the four points), then evenly to the boxes
const g = Math.min(0.42, gap + free / (paras.length - 1)), extra = Math.max(0, free - (g - gap) * (paras.length - 1)) / paras.length;

let y = top;
paras.forEach((t, i) => {
  const h = need[i] + extra;
  const cy = y + (h - chipS) / 2;                                     // chip centred on its box
  slide.addShape("rect", { x: chipX, y: cy, w: chipS, h: chipS, fill: { color: R.grey2 }, line: { type: "none" } });
  slide.addText(String(i + 1), { x: chipX, y: cy, w: chipS, h: chipS, fontFace: FONT, fontSize: 16, bold: true, italic: true,
    color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
  slide.addShape("rect", { x: boxX, y, w: boxW, h, fill: { color: R.panel }, line: { type: "none" } });
  slide.addText(runs(t), { x: boxX + padX, y: y + padY, w: boxW - 2 * padX, h: h - 2 * padY, fontFace: FONT, fontSize: PT,
    color: prof.body.text, valign: "middle", align: "left", margin: 0, lineSpacingMultiple: LS, isTextBox: true });
  y += h + g;
});

// grey footer rule across the page, as on every slide of the deck
slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: R.grey4, width: 0.75 } });

L.save(pres, __dirname + "/candidate.pptx");
