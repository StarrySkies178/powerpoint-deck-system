// C06 rebuild r3: Executive Summary in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Form: the deck's own numbered-row form (Agenda, slide 2: dark grey number squares with italic white numbers,
// each beside a light grey F1F1F1 bar), stretched across the body so the four paragraphs read as four
// numbered conclusions. Body text at the profile's 14 pt Verdana; key phrases bold in the main red.
// Title-only meta frame like the deck's Agenda and Team pages: no breadcrumb, no source line (the page number comes from the layout).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, HOUSE, prof } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  const C = P.C, R = prof.roles;
  const B = P.BODY;
  const left = prof.margins.left + 0.02, right = HOUSE.W - prof.margins.right;
  const top = prof.margins.body_top + 0.12, bottom = 6.98;

  const red = (t) => ({ text: t, options: { bold: true, color: R.main } });
  const n = (t) => ({ text: t });
  const paras = [
    [n("Fine jewelry market expects "), red("attractive growth in next five years"), n(", mainly driven by the strong demands from "),
     red("millennials in tier 1 and 2 cities"), n(" and "), red("emerging middle class from tier 3 and 4 cities"),
     n(". These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.")],
    [n("However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address "),
     red("branding, offline expansion and omni-channel development"), n(" with differentiations accommodating to two primary customers.")],
    [n("Moreover, the proposed top-line growth strategy is expected to deliver "), red("12% annual growth"),
     n(", largely driven by offline expansion strategy.")],
    [n("Finally, the strategy will impose "), red("affordable financial pressure"),
     n(" and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.")],
  ];

  // row heights follow each paragraph's line count (Verdana 14 pt is wide: ~0.115 in per character)
  const chipW = 0.56, gapX = 0.2, boxX = left + chipW + gapX, boxW = right - boxX, padX = 0.18;
  const cpl = Math.floor((boxW - 2 * padX - 0.1) / 0.118);
  const lines = paras.map((p) => {
    const t = p.map((r) => r.text).join("");
    let k = 1, cur = 0;
    for (const w of t.split(/\s+/)) { const l = w.length + 1; if (cur + l > cpl) { k++; cur = l; } else cur += l; }
    return k;
  });
  const lineH = (14 * 1.32) / 72, gapY = 0.24, avail = bottom - top - gapY * (paras.length - 1);
  const base = lines.map((k) => k * lineH + 0.34), extra = (avail - base.reduce((a, b) => a + b, 0)) / paras.length;
  let y = top;
  paras.forEach((runs, i) => {
    const h = base[i] + extra;
    const cy = y + (h - chipW) / 2;
    slide.addShape("rect", { x: left, y: cy, w: chipW, h: chipW, fill: { color: R.grey2 }, line: { type: "none" } });
    slide.addText(String(i + 1), { x: left, y: cy, w: chipW, h: chipW, fontFace: "Verdana", fontSize: 16, bold: true, italic: true,
      color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
    slide.addShape("rect", { x: boxX, y, w: boxW, h, fill: { color: R.panel }, line: { type: "none" } });
    slide.addText(runs, { x: boxX + padX, y: y + 0.1, w: boxW - 2 * padX, h: h - 0.2, fontFace: "Verdana", fontSize: 14,
      color: R.text, valign: "middle", margin: 0, lineSpacingMultiple: 1.1, isTextBox: true });
    y += h + gapY;
  });

  // the deck's thin grey footer rule across every page (renders of slides 2, 4, 33)
  slide.addShape("line", { x: 0, y: 7.2, w: HOUSE.W, h: 0, line: { color: "A6A6A6", width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
  console.log("lines", lines, "cpl", cpl, "BODY", JSON.stringify(B));
})();
