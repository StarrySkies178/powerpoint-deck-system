// C06 rebuild 3: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Form: four numbered paragraph rows, each a chip + grey filled box (the deck's agenda rows: numbered chip beside an
// F1F1F1 bar, slide 2; red number chips of the panel heads, slides 4 and 8). Text is the prompt's, verbatim, at the
// profile's body size; one key phrase per paragraph bold in the main colour (DECK-SYSTEM §3 reading rule).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, B, P, S, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
const C = P.C, FONT = P.THEME.bodyFontFace, PT = prof.body.pt;

const paras = [
  "Fine jewelry market expects **attractive growth in next five years**, mainly driven by the strong demands from millennials in tier 1 and 2 cities and emerging middle class from tier 3 and 4 cities. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
  "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address **branding, offline expansion and omni-channel development** with differentiations accommodating to two primary customers.",
  "Moreover, the proposed top-line growth strategy is expected to deliver **12% annual growth**, largely driven by offline expansion strategy.",
  "Finally, the strategy will impose **affordable financial pressure** and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.",
];
const runs = (t) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) =>
  p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: C.navy } } : { text: p, options: {} });

// geometry: body from under the title rule to above the footer; chip column on the left margin
const top = B.y + 0.15, bottom = 6.95, x0 = B.x, chipS = 0.5, bx = x0 + chipS + 0.15, bw = 12.95 - bx;
const padX = 0.18, padY = 0.14, lineH = (PT * 1.3) / 72;
const cpl = Math.floor(((bw - 2 * padX) * 72) / (PT * 0.55));          // Verdana is wide: ~0.55 em per character (checked on the render)
const lineCount = (t) => { let n = 1, cur = 0;
  for (const w of t.replace(/\*\*/g, "").split(/\s+/)) { const l = w.length + 1; if (cur + l > cpl) { n++; cur = l; } else cur += l; } return n; };
const hs = paras.map((t) => lineCount(t) * lineH + 2 * padY);
const free = bottom - top - hs.reduce((a, b) => a + b, 0);
const gap = Math.min(0.35, Math.max(0.15, free / (paras.length - 1)));
const extra = Math.max(0, (free - gap * (paras.length - 1)) / paras.length);   // leftover height goes into each box, not into white gaps

let y = top;
paras.forEach((t, i) => {
  const h = hs[i] + extra;
  slide.addShape("rect", { x: x0, y, w: chipS, h: chipS, fill: { color: C.navy }, line: { type: "none" } });
  slide.addText(String(i + 1), { x: x0, y, w: chipS, h: chipS, fontFace: FONT, fontSize: PT, bold: true, italic: true, color: C.white, align: "center", valign: "middle", margin: 0, isTextBox: true });
  slide.addShape("rect", { x: bx, y, w: bw, h, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addText(runs(t), { x: bx + padX, y: y + padY - 0.04, w: bw - 2 * padX, h: h - 2 * padY + 0.08, fontFace: FONT, fontSize: PT, color: C.text, valign: "middle", margin: 0, lineSpacingMultiple: 1.1, isTextBox: true });
  y += h + gap;
});

L.save(pres, __dirname + "/candidate.pptx");
