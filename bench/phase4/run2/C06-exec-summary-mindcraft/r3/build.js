// C06 run2 r3: "Executive Summary" text slide in the Mindcraft deck's style (deck as reference, leave-one-out).
// Look from Style/refs/Case-2019-Mindcraft.profile.json (Verdana, 26 pt black title over the red rule, 14 pt body,
// red square number chips with white bold italic numerals as on the deck's numbered panels, grey F1F1F1 boxes as
// on its agenda and reading boxes). Four numbered rows, one per paragraph of the prompt, in story order.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  const C = P.C, F = P.THEME.bodyFontFace, pt = prof.body.pt;           // 14 pt body, as the profile measures
  const red = prof.roles.main, panel = prof.roles.panel;

  // body area: left/right margins of the profile, from under the title rule to above the footer rule
  const x0 = prof.margins.left + 0.05, x1 = 13.333 - prof.margins.right - 0.1, top = 1.62, bottom = 6.95;
  const chipS = 0.5, gapX = 0.2, bx = x0 + chipS + gapX, bw = x1 - bx, gap = 0.2;

  // paragraphs from the prompt, word for word; b = the one key phrase per paragraph, bold in the main colour
  const paras = [
    [{ t: "Fine jewelry market expects " }, { t: "attractive growth in next five years", b: 1 },
     { t: ", mainly driven by the strong demands from millennials in tier 1 and 2 cities and emerging middle class from tier 3 and 4 cities. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class." }],
    [{ t: "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address " },
     { t: "branding, offline expansion and omni-channel development", b: 1 },
     { t: " with differentiations accommodating to two primary customers." }],
    [{ t: "Moreover, the proposed top-line growth strategy is expected to deliver " }, { t: "12% annual growth", b: 1 },
     { t: ", largely driven by offline expansion strategy." }],
    [{ t: "Finally, the strategy will impose " }, { t: "affordable financial pressure", b: 1 },
     { t: " and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified." }],
  ];

  // row heights follow each paragraph's length (Verdana ~0.6 em per character), filling the body
  const cpl = Math.floor(((bw - 0.4) * 72) / (pt * 0.6));
  const lines = paras.map((p) => Math.max(2, Math.ceil(p.map((r) => r.t).join("").length / cpl)));
  const tot = lines.reduce((a, b) => a + b, 0), avail = bottom - top - gap * (paras.length - 1);
  let y = top;
  paras.forEach((p, i) => {
    const h = avail * lines[i] / tot;
    // number chip: red square, white bold italic numeral (the deck's panel chip)
    const cy = y + (h - chipS) / 2;
    slide.addShape("rect", { x: x0, y: cy, w: chipS, h: chipS, fill: { color: red }, line: { type: "none" } });
    slide.addText(String(i + 1), { x: x0, y: cy, w: chipS, h: chipS, fontFace: F, fontSize: 18, bold: true, italic: true, color: "FFFFFF",
      align: "center", valign: "middle", margin: 0, isTextBox: true });
    // paragraph in a grey box
    slide.addShape("rect", { x: bx, y, w: bw, h, fill: { color: panel }, line: { type: "none" } });
    slide.addText(p.map((r) => ({ text: r.t, options: r.b ? { bold: true, color: red } : {} })),
      { x: bx + 0.18, y, w: bw - 0.36, h, fontFace: F, fontSize: pt, color: C.text, align: "left", valign: "middle",
        margin: 0, lineSpacingMultiple: 1.1, isTextBox: true });
    y += h + gap;
  });

  // the deck's footer rule: thin grey line across the slide above the source / page line (renders of its other slides)
  slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
