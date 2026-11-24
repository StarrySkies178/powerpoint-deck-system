// C06 Executive Summary, deck-as-reference (Case-2019-Mindcraft), leave-one-out build.
// Form: four numbered rows, each a dark-grey italic number chip (the deck's agenda chip, grey2) beside the paragraph in a
// light-grey box (the deck's panel grey F1F1F1, as in its agenda and reading boxes). White slide, Verdana, body 14 pt.
// Row heights follow each paragraph's line count so no box carries empty space; the rows fill the body.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const paras = [
  [["Fine jewelry market expects ", 0], ["attractive growth in next five years", 1], [", mainly driven by the strong demands from ", 0], ["millennials in tier 1 and 2 cities", 1], [" and ", 0], ["emerging middle class from tier 3 and 4 cities", 1], [". These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.", 0]],
  [["However, CSS faces challenges in seizing growth in the two primary customer groups: ", 0], ["low penetration of the youth brands in high tiers", 1], [" and ", 0], ["limited access and brand awareness in low tiers", 1], [". Therefore, CSS's five-year growth strategy should address ", 0], ["branding, offline expansion and omni-channel development", 1], [" with differentiations accommodating to two primary customers.", 0]],
  [["Moreover, the proposed top-line growth strategy is expected to deliver ", 0], ["12% annual growth", 1], [", largely driven by ", 0], ["offline expansion strategy", 1], [".", 0]],
  [["Finally, the strategy will impose ", 0], ["affordable financial pressure", 1], [" and the implementation risks including ", 0], ["internal resistance, talent and supply chain management and IT system", 1], [" have been preliminarily identified.", 0]],
];

(async () => {
  const { pres, slide, B, P, HOUSE, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  const C = P.C, pt = prof.body.pt, font = HOUSE.FONT.latin;
  const chipS = 0.5, tx = B.x + chipS + 0.15, tw = B.w - chipS - 0.15, pad = 0.18;
  // line estimate for Verdana (~0.56 em average advance) to size each row to its text
  const cpl = Math.floor(((tw - 2 * pad) * 72) / (pt * 0.56));
  const lines = paras.map((p) => {
    const words = p.map((r) => r[0]).join("").split(/\s+/); let n = 1, cur = 0;
    for (const w of words) { const l = w.length + 1; if (cur + l > cpl) { n++; cur = l; } else cur += l; }
    return n;
  });
  const gap = 0.22, total = lines.reduce((a, b) => a + b, 0), free = B.h - gap * (paras.length - 1);
  let y = B.y;
  paras.forEach((p, i) => {
    const h = free * (lines[i] + 1) / (total + paras.length);   // proportional to lines, one line of padding each
    slide.addShape("rect", { x: B.x, y, w: chipS, h: chipS, fill: { color: C.g4 }, line: { type: "none" } });
    slide.addText(String(i + 1), { x: B.x, y, w: chipS, h: chipS, fontFace: font, fontSize: 16, bold: true, italic: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    slide.addShape("rect", { x: tx, y, w: tw, h, fill: { color: C.g1 }, line: { type: "none" } });
    slide.addText(p.map(([t, k]) => ({ text: t, options: k ? { bold: true, color: C.navy } : {} })),
      { x: tx + pad, y, w: tw - 2 * pad, h, fontFace: font, fontSize: pt, color: C.text, valign: "middle", margin: 0, isTextBox: true, lineSpacingMultiple: 1.1 });
    y += h + gap;
  });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
