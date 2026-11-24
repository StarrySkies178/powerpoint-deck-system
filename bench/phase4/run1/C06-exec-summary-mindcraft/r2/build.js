// C06 rebuild 2: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Form: the deck's own numbered-list form from its agenda (slide 2): dark-grey square chip with a bold italic white
// number beside a light-grey (F1F1F1) box, here holding one summary paragraph per row. Type, title, rule, colours
// come from the deck's style profile (Style/refs/Case-2019-Mindcraft.profile.json) through the harness.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const paras = [
  "Fine jewelry market expects attractive growth in next five years, mainly driven by the strong demands from millennials in tier 1 and 2 cities and emerging middle class from tier 3 and 4 cities. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
  "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address branding, offline expansion and omni-channel development with differentiations accommodating to two primary customers.",
  "Moreover, the proposed top-line growth strategy is expected to deliver 12% annual growth, largely driven by offline expansion strategy.",
  "Finally, the strategy will impose affordable financial pressure and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.",
];

(async () => {
  const { pres, slide, P, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary", source: [{ text: "Source: MindCraft Analysis", options: { italic: true } }] });   // italic, as on the deck's other slides
  const pt = prof.body.pt;                               // 14 pt, the deck's body size
  const font = prof.fonts.body;                          // Verdana
  const R = prof.roles;
  const left = prof.margins.left, right = 13.333 - prof.margins.right;
  const top = 1.62, bottom = 6.98;                       // body between the red title rule and the footer rule
  const chipS = 0.58, gapX = 0.2, gapY = 0.24;
  const tx = left + chipS + gapX, tw = right - tx;

  // row heights follow the number of lines each paragraph needs (Verdana ~0.58 em per character)
  const cpl = Math.floor(((tw - 0.36) * 72) / (pt * 0.58));
  const lines = paras.map((p) => Math.ceil(p.length / cpl));
  const lineH = (pt * 1.35) / 72, pad = 0.3;
  const need = lines.map((n) => n * lineH + pad);
  const free = bottom - top - gapY * (paras.length - 1) - need.reduce((a, b) => a + b, 0);
  const hs = need.map((h) => h + free / paras.length);

  let y = top;
  paras.forEach((p, i) => {
    const h = hs[i];
    slide.addShape("rect", { x: left, y, w: chipS, h: chipS, fill: { color: R.grey2 }, line: { type: "none" } });
    slide.addText(String(i + 1), { x: left, y, w: chipS, h: chipS, fontFace: font, fontSize: 16, bold: true, italic: true,
      color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
    slide.addShape("rect", { x: tx, y, w: tw, h, fill: { color: R.panel }, line: { type: "none" } });
    slide.addText(p, { x: tx + 0.14, y: y + 0.08, w: tw - 0.28, h: h - 0.16, fontFace: font, fontSize: pt, color: R.text,
      valign: "middle", margin: 0.04, lineSpacingMultiple: 1.1, isTextBox: true });
    y += h + gapY;
  });

  // the deck's thin grey footer rule above the source line (on every slide of the deck; not drawn by the master)
  slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: R.grey4, width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
