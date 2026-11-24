// C06 rebuild 3: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Style: the deck's profile (Verdana, 26 pt black title over the red rule, 14 pt body, red C00000 main, F1F1F1 panels).
// Form: one numbered row per paragraph, built from the deck's own furniture seen on its other slides:
// the red square chip with an italic white number (panel heads, e.g. slides 4 and 8) and the light-grey
// text box (agenda boxes on slide 2, reading boxes under exhibits). Key phrases bold in the main colour.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
(async () => {
  const { pres, slide, prof, P } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  const C = prof.roles, FONT = prof.fonts.latin, PT = prof.body.pt;
  const x0 = prof.margins.left, x1 = prof.size[0] - prof.margins.right;
  const top = prof.margins.body_top + 0.12, bottom = 7.0;

  const B = (t) => ({ text: t, options: { bold: true, color: C.main } });
  const N = (t) => ({ text: t, options: {} });
  const paras = [
    [N("Fine jewelry market expects "), B("attractive growth in next five years"), N(", mainly driven by the strong demands from "),
     B("millennials in tier 1 and 2 cities"), N(" and "), B("emerging middle class from tier 3 and 4 cities"),
     N(". These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.")],
    [N("However, CSS faces challenges in seizing growth in the two primary customer groups: "), B("low penetration of the youth brands in high tiers"),
     N(" and "), B("limited access and brand awareness in low tiers"), N(". Therefore, CSS's five-year growth strategy should address "),
     B("branding, offline expansion and omni-channel development"), N(" with differentiations accommodating to two primary customers.")],
    [N("Moreover, the proposed top-line growth strategy is expected to deliver "), B("12% annual growth"), N(", largely driven by "),
     B("offline expansion strategy"), N(".")],
    [N("Finally, the strategy will impose "), B("affordable financial pressure"), N(" and the implementation risks including "),
     B("internal resistance, talent and supply chain management and IT system"), N(" have been preliminarily identified.")],
  ];

  // row heights follow each paragraph's length (Verdana 14 pt: ~0.118 in per character, 1.2 line height)
  const chipS = 0.5, tx = x0 + chipS + 0.18, tw = x1 - tx, pad = 0.14;
  const cpl = Math.floor((tw - 2 * 0.17) / (PT * 0.6 / 72));
  const lines = paras.map((p) => Math.ceil(p.map((r) => r.text).join("").length / cpl));
  const gap = 0.22, lineH = PT * 1.25 / 72;
  const need = lines.map((n) => n * lineH + 2 * pad);
  const spare = (bottom - top - gap * (paras.length - 1)) - need.reduce((a, b) => a + b, 0);
  const hs = need.map((h) => h + spare / paras.length);

  let y = top;
  paras.forEach((p, i) => {
    const h = hs[i];
    const cy = y + (h - chipS) / 2;
    slide.addShape("rect", { x: x0, y: cy, w: chipS, h: chipS, fill: { color: C.main }, line: { type: "none" } });
    slide.addText(String(i + 1), { x: x0, y: cy, w: chipS, h: chipS, fontFace: FONT, fontSize: 18, bold: true, italic: true, color: "FFFFFF",
      align: "center", valign: "middle", margin: 0, isTextBox: true });
    slide.addShape("rect", { x: tx, y, w: tw, h, fill: { color: C.panel }, line: { type: "none" } });
    slide.addText(p, { x: tx, y, w: tw, h, fontFace: FONT, fontSize: PT, color: C.text, align: "left", valign: "middle",
      margin: [12, 12, 6, 6], lineSpacingMultiple: 1.1, isTextBox: true });
    y += h + gap;
  });

  // the deck's footer rule (thin light-grey line across the page above the source line, as on every other slide)
  slide.addShape("line", { x: 0, y: 7.21, w: prof.size[0], h: 0, line: { color: "A6A6A6", width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
