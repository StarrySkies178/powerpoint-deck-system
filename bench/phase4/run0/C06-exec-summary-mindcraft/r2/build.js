// C06 rebuild 2: "Executive Summary", four paragraphs, in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Look: the deck's style profile (Verdana, black title with red rule, 14 pt body, F1F1F1 panels).
// Form: numbered rows as on the deck's agenda (slide 2: numbered dark chip + light-grey box) and its numbered panels
// (slides 4, 8, 15: red square chip with white bold italic number), one row per paragraph, filling the body.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const paras = [
  "Fine jewelry market expects attractive growth in next five years, mainly driven by the strong demands from millennials in tier 1 and 2 cities and emerging middle class from tier 3 and 4 cities. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
  "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address branding, offline expansion and omni-channel development with differentiations accommodating to two primary customers.",
  "Moreover, the proposed top-line growth strategy is expected to deliver 12% annual growth, largely driven by offline expansion strategy.",
  "Finally, the strategy will impose affordable financial pressure and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.",
];

(async () => {
  const { pres, slide, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  const font = prof.fonts.body, red = prof.roles.main, panel = prof.roles.panel;
  const pt = prof.body.pt;                       // 14 pt
  const left = prof.margins.left, right = 13.333 - prof.margins.right;
  const top = 1.6, bottom = 6.95, gap = 0.22;
  const chip = 0.5, chipGap = 0.18;
  const bx = left + chip + chipGap, bw = right - bx;

  // row heights in proportion to the lines each paragraph needs (Verdana 14 pt: ~0.118 in per character)
  const cpl = Math.floor((bw - 0.4) / (pt / 72 * 0.61));
  const lines = paras.map((p) => Math.ceil(p.length / cpl));
  const lineH = pt / 72 * 1.5;
  const need = lines.map((n) => n * lineH + 0.3);
  const free = bottom - top - gap * (paras.length - 1) - need.reduce((a, b) => a + b, 0);
  const hs = need.map((h) => h + free / paras.length);

  let y = top;
  paras.forEach((p, i) => {
    const h = hs[i];
    slide.addShape("rect", { x: left, y, w: chip, h: chip, fill: { color: red }, line: { type: "none" } });
    slide.addText(String(i + 1), { x: left, y, w: chip, h: chip, fontFace: font, fontSize: 16, bold: true, italic: true,
      color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    slide.addShape("rect", { x: bx, y, w: bw, h, fill: { color: panel }, line: { type: "none" } });
    slide.addText(p, { x: bx + 0.15, y: y + 0.08, w: bw - 0.3, h: h - 0.16, fontFace: font, fontSize: pt, color: "000000",
      align: "left", valign: "middle", margin: 0.04, lineSpacingMultiple: 1.2 });
    y += h + gap;
  });
  // the deck's footer rule: a thin light-grey line across the slide above the source / logo row (on every other slide)
  slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: prof.neutrals_ranked[1], width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
