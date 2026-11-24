// C06 run2 rebuild 2: "Executive Summary" text slide in the style of Templates/Case-2019-Mindcraft.pptx
// (deck as reference, leave-one-out). Frame from the deck's style profile (title, red rule, source line).
// Body form taken from the same deck's Agenda (slide 2): dark-grey square with an italic bold white number,
// beside a light-grey F1F1F1 bar holding the text; here one numbered row per paragraph, text at the profile's
// body size (14 pt Verdana). Grey footer line and logo are drawn as on the deck's master.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, prof, P } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
const FONT = (prof && prof.fonts && prof.fonts.latin) || "Verdana";
const PT = (prof && prof.body && prof.body.pt) || 14;
const R = prof.roles;

// master furniture of the reference: grey footer rule and logo bottom right
slide.addShape("rect", { x: 0, y: 7.212, w: 13.333, h: 0.01, fill: { color: "B4B4B4" }, line: { type: "none" } });
slide.addImage({ path: path.join(__dirname, "mindcraft-logo.png"), x: 11.642, y: 7.175, w: 1.137, h: 0.325 });

// the four paragraphs of the prompt; one key phrase per paragraph bold in the main colour (the deck uses red sparingly)
const paras = [
  [["Fine jewelry market expects ", 0], ["attractive growth in next five years", 1], [", mainly driven by the strong demands from ", 0],
   ["millennials in tier 1 and 2 cities", 0], [" and ", 0], ["emerging middle class from tier 3 and 4 cities", 0],
   [". These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.", 0]],
  [["However, CSS faces ", 0], ["challenges in seizing growth", 0], [" in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address ", 0],
   ["branding, offline expansion and omni-channel development", 1], [" with differentiations accommodating to two primary customers.", 0]],
  [["Moreover, the proposed top-line growth strategy is expected to deliver ", 0], ["12% annual growth", 1], [", largely driven by offline expansion strategy.", 0]],
  [["Finally, the strategy will impose ", 0], ["affordable financial pressure", 1], [" and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.", 0]],
];

// layout: rows sized by their line count, filling the body between the red rule and the footer
const X = 0.62, RIGHT = 12.72, CHIP = 0.56, GAP = 0.2, TX = X + CHIP + GAP, TW = RIGHT - TX;
const TOP = 1.55, BOTTOM = 6.98, ROWGAP = 0.22, PADV = 0.16, PADH = 0.16;
const LS = 1.2, lineH = (PT * LS) / 72;
const cpl = Math.floor(((TW - 2 * PADH) * 72) / (PT * 0.62));      // Verdana is wide: ~0.62 em per character
const lines = paras.map((p) => {
  const words = p.map((r) => r[0]).join("").split(/\s+/); let n = 1, cur = 0;
  for (const w of words) { const l = w.length + 1; if (cur + l > cpl) { n++; cur = l; } else cur += l; }
  return n;
});
const need = lines.reduce((a, n) => a + n * lineH + 2 * PADV, 0) + ROWGAP * (paras.length - 1);
const extra = Math.max(0, (BOTTOM - TOP - need) / paras.length);   // spare height shared by the rows
let y = TOP;
paras.forEach((p, i) => {
  const h = lines[i] * lineH + 2 * PADV + extra;
  slide.addShape("rect", { x: X, y, w: CHIP, h, fill: { color: R.grey2 }, line: { type: "none" } });
  slide.addText(String(i + 1), { x: X, y, w: CHIP, h, fontFace: FONT, fontSize: 16, bold: true, italic: true, color: "FFFFFF",
    align: "center", valign: "middle", margin: 0, isTextBox: true });
  slide.addShape("rect", { x: TX, y, w: TW, h, fill: { color: R.panel }, line: { type: "none" } });
  slide.addText(p.map(([t, k]) => ({ text: t, options: k ? { bold: true, color: R.main } : {} })),
    { x: TX + PADH, y, w: TW - 2 * PADH, h, fontFace: FONT, fontSize: PT, color: R.text, valign: "middle", margin: 0,
      lineSpacingMultiple: LS, isTextBox: true });
  y += h + ROWGAP;
});

L.save(pres, __dirname + "/candidate.pptx");
