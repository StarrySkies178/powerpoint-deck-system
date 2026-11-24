// C06 exec summary, deck-as-reference (Case-2019-Mindcraft), leave-one-out build.
// Form: four numbered conclusions, one per row, each paragraph in the deck's grey reading box (F1F1F1, as under the
// charts of the deck's market slide) with the deck's own number chip (dark grey square, white bold italic number, as on its
// agenda), centred on the row. Key words bold in the main colour. Text exactly as given in the prompt.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, S, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary", source: "Source: MindCraft Analysis" });
const C = P.C, R = prof.roles, font = prof.fonts.body, pt = prof.body.pt;

const paras = [
  "Fine jewelry market expects **attractive growth in next five years**, mainly driven by the strong demands from **millennials in tier 1 and 2 cities** and **emerging middle class from tier 3 and 4 cities**. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
  "However, CSS faces challenges in seizing growth in the two primary customer groups: **low penetration of the youth brands in high tiers** and **limited access and brand awareness in low tiers**. Therefore, CSS's five-year growth strategy should address **branding, offline expansion and omni-channel development** with differentiations accommodating to two primary customers.",
  "Moreover, the proposed top-line growth strategy is expected to deliver **12% annual growth**, largely driven by **offline expansion strategy**.",
  "Finally, the strategy will impose **affordable financial pressure** and the implementation risks including internal resistance, talent and supply chain management and IT system have been **preliminarily identified**.",
];
const runs = (t) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: R.main } } : { text: p, options: {} }));

// body box from the deck's measured margins, down to just above the source line
const x0 = prof.margins.left, x1 = 13.333 - prof.margins.right, top = prof.margins.body_top + 0.12, bottom = 7.0;
const chipS = 0.42, gapX = 0.2, gapY = 0.16, tx = x0 + chipS + gapX, tw = x1 - tx;
// row heights in proportion to the lines each paragraph needs at body size (Verdana ~0.6 em per character)
const cpl = (tw - 0.4) * 72 / (pt * 0.6);
const lines = paras.map((t) => Math.max(2, Math.ceil(t.replace(/\*\*/g, "").length / cpl)));
const extra = 0.3, avail = bottom - top - gapY * (paras.length - 1);
const base = lines.map((l) => l * pt * 1.3 / 72 + extra), scale = avail / base.reduce((a, c) => a + c, 0);
let y = top;
paras.forEach((t, i) => {
  const h = base[i] * scale;
  const cy = y + (h - chipS) / 2;
  slide.addShape("rect", { x: x0, y: cy, w: chipS, h: chipS, fill: { color: R.grey2 }, line: { type: "none" } });
  slide.addText(String(i + 1), { x: x0, y: cy, w: chipS, h: chipS, fontFace: font, fontSize: prof.panel.chip_pt, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  slide.addShape("rect", { x: tx, y, w: tw, h, fill: { color: R.panel }, line: { type: "none" } });
  slide.addText(runs(t), { x: tx + 0.15, y: y + 0.06, w: tw - 0.3, h: h - 0.12, fontFace: font, fontSize: pt, color: R.text, valign: "middle", margin: 0, isTextBox: true, lineSpacingMultiple: 1.05 });
  y += h + gapY;
});

L.save(pres, __dirname + "/candidate.pptx");
