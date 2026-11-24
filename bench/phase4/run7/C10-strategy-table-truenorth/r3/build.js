// C10 rebuild (run7 r3): strategy overview table in the TrueNorth (Pola 2016) deck style.
// Deck given as the reference: built with the deck's style profile; the form follows the deck's own tables
// (red header boxes with white gaps over grey cells, the key row outlined in red, as in the deck's entry-mode
// table; bold red key words as in its insight panels). Drawn as shapes so that the Risks and Mitigation
// columns can span the four phase rows.
// Type: the deck's table text is 13 pt and its labels 12 pt (profile). The prompt's text does not fit a 4:3
// page at those sizes, so words were cut (DECK-SYSTEM rule 10: never shrink type to fit), never the type:
// strategies and mitigation at 13 pt, situation and risks at the deck's 12 pt label size.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, B, P } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  source: "Source: TrueNorth Analysis",
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.navy, GREY = C.g1, TXT = C.text, WHITE = "FFFFFF";
// section breadcrumb as the deck draws it (profile crumb: 14 pt; current section black, others light grey, red ► between)
const prof = L.P.HOUSE.STYLE, cs = prof.crumb;
const CRUMB = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], CUR = 1;
const crumbRuns = [];
CRUMB.forEach((t, i) => { if (i) crumbRuns.push({ text: " \u25BA ", options: { color: RED } }); crumbRuns.push({ text: t, options: { color: i === CUR ? TXT : "CCCCCC" } }); });
slide.addText(crumbRuns, { x: cs.x, y: cs.y, w: 8.2, h: 0.3, fontFace: FONT, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true, objectName: "breadcrumb" });

// ---- geometry (inches) ----
const X0 = B.x, X1 = B.x + B.w;           // 0.25 .. 9.84
const gap = 0.05, GAPS = [0.2, 0.05, 0.05];   // wider gap after the situation column holds the pairing arrows
const colW = [2.75, 3.45, 1.55, 1.54];     // situation | strategies | risks | mitigation
const sx = (X1 - X0 - GAPS.reduce((a, b) => a + b, 0)) / colW.reduce((a, b) => a + b, 0);
const W = colW.map((w) => w * sx);
const XS = W.map((_, i) => X0 + W.slice(0, i).reduce((a, b) => a + b, 0) + GAPS.slice(0, i).reduce((a, b) => a + b, 0));
const PTS = [12, 13, 12, 13], TOPPTS = [12, 12, 13, 13], HPT = 14, lh = (pt) => (pt * 1.22) / 72;
const PADX = 0.05, PADY = 0.03, BUL = 0.16;

// line count for Calibri, from Carlito's advance widths (Calibri's metric twin; 1/1000 em, ASCII 32-126)
const CW = {"r":[226,326,401,498,507,715,682,221,303,303,498,498,250,306,252,386,507,507,507,507,507,507,507,507,507,507,268,268,498,498,498,463,894,579,544,533,615,488,459,631,623,252,319,520,420,855,646,662,517,673,543,459,487,642,567,890,519,487,468,307,386,307,498,498,291,479,525,423,525,498,305,471,525,230,239,455,230,799,525,527,525,525,349,391,335,525,452,715,433,453,395,314,460,314,498],
  "b":[226,326,438,498,507,729,705,233,312,312,498,498,258,306,267,430,507,507,507,507,507,507,507,507,507,507,276,276,498,498,498,463,898,606,561,529,630,488,459,637,631,267,331,547,423,874,659,676,532,686,563,473,495,653,591,906,551,520,478,325,430,325,498,498,300,494,537,418,537,503,316,474,537,246,255,480,246,813,537,538,537,537,355,399,347,537,473,745,459,474,397,344,475,344,498]};
const textW = (t, pt, bold) => [...t].reduce((a, ch) => a + ((CW[bold ? "b" : "r"][ch.charCodeAt(0) - 32]) || 500), 0) / 1000 * pt / 72;
function lines(text, wIn, pt, bold) {
  let n = 1, cur = "";
  for (const w of String(text).split(" ")) { const c = cur ? cur + " " + w : w; if (textW(c, pt, bold) > wIn - 0.02 && cur) { n++; cur = w; } else cur = c; }
  return n;
}
function cellH(head, items, wIn, pt, bold) {   // inches a cell needs
  let n = head ? lines(head, wIn - 2 * PADX, pt, true) : 0;
  items.forEach((t) => (n += lines(t, wIn - 2 * PADX - BUL, pt, !!bold)));
  return n * lh(pt) + 2 * PADY + 0.06;
}
// rich text: optional bold red heading, then bullets
function runs(blocks, o = {}) {
  const r = [];
  blocks.forEach((b, k) => {
    if (b.head) r.push({ text: b.head, options: { bold: true, color: o.headColor || RED, breakLine: true, paraSpaceBefore: k ? 6 : 0 } });
    b.items.forEach((t) => r.push({ text: t, options: { bullet: { indent: BUL * 72 }, bold: !!o.bold, color: TXT, breakLine: true, paraSpaceBefore: o.space || 0 } }));
  });
  if (r.length) delete r[r.length - 1].options.breakLine;
  return r;
}
const box = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
const text = (r, x, y, w, h, o = {}) => slide.addText(r, { x, y, w, h, fontFace: FONT, fontSize: o.pt, color: o.color || TXT, bold: !!o.bold,
  align: o.align || "left", valign: o.valign || "middle", margin: [PADY, PADX, PADY, PADX].map((v) => v * 72), isTextBox: true, objectName: o.name });

// ---- 1. column header boxes ----
const HEAD = ["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"];
let y = B.y;
const hH = 0.36;
HEAD.forEach((h, i) => { box(XS[i], y, W[i], hH, RED); text(h, XS[i], y, W[i], hH, { pt: HPT, color: WHITE, bold: true, align: "center", name: "header " + i }); });
y += hH + gap;

// ---- 2. top row (the overall picture), outlined in red and bold ----
const TOP = [
  ["Growing mid & high-end skincare", "Emerging consumer preferences", "POLA's poor performance in China"],
  ["Improve penetration by product reposition", "Enhance brand recognition, image & memory along the decision journey"],
  ["Market Risks", "Political Risks"],
  ["R&D Process", "Product Intro", "Re-evaluation"],
];
const topH = Math.max(...TOP.map((it, i) => cellH(null, it, W[i], TOPPTS[i], true)));
TOP.forEach((it, i) => { box(XS[i], y, W[i], topH, GREY); text(runs([{ items: it }], { bold: true }), XS[i], y, W[i], topH, { pt: TOPPTS[i], name: "overview " + i }); });
slide.addShape("rect", { x: X0, y, w: X1 - X0, h: topH, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
y += topH + 0.1;

// ---- 3. consumer phase -> strategy rows ----
const ROWS = [
  { phase: "Planning phase", sit: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing potential consumer needs"],
    strat: "Brand position", acts: ["Launch POLA & Jurlique for specific groups", "Tag brands with fancy & explicit concepts", "Different product diversification roadmaps"] },
  { phase: "Awareness phase", sit: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", acts: ["Compose fascinating stories or hot topics", "Social media-focused marketing initiatives", "Invite celebrity as spokespersons"] },
  { phase: "Purchase phase", sit: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", acts: ["Provide various service like massage", "Build experience shops, digitalize stores", "Stimulate purchase via multiple channels", "Optimize mobile-end shopping experience"] },
  { phase: "Aftersales phase", sit: ["Low brand loyalty", "Seek personal & value identification", "Fans culture"],
    strat: "Loyalty management", acts: ["Full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media (WeChat)"] },
];
const bottom = B.y + B.h;
const need = ROWS.map((r) => Math.max(cellH(r.phase, r.sit, W[0], PTS[0]), cellH(r.strat, r.acts, W[1], PTS[1])));
const room = bottom - y - gap * (ROWS.length - 1), used = need.reduce((a, b) => a + b, 0);
if (used > room + 0.05) console.warn(`rows need ${used.toFixed(2)} in, room ${room.toFixed(2)} in`);
const rowH = need.map((h) => h + (room - used) / ROWS.length);
const yRows = y;
const AW = 0.14;   // pairing arrow in the white gap: each phase leads to its strategy
ROWS.forEach((r, k) => {
  const h = rowH[k];
  box(XS[0], y, W[0], h, GREY); text(runs([{ head: r.phase, items: r.sit }]), XS[0], y, W[0], h, { pt: PTS[0], name: "phase " + k });
  box(XS[1], y, W[1], h, GREY); text(runs([{ head: r.strat, items: r.acts }]), XS[1], y, W[1], h, { pt: PTS[1], name: "strategy " + k });
  slide.addShape("triangle", { x: XS[1] - GAPS[0] / 2 - AW / 2 + 0.01, y: y + h / 2 - AW / 2, w: AW, h: AW, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  y += h + gap;
});
const spanH = y - gap - yRows;

// ---- 4. risks and mitigation span the four rows ----
const RISKS = [
  { head: "Market Risks", items: ["Competitor responses to anti-hero products", "Four channels take management effort", "R&D not fully aligned with consumer trends"] },
  { head: "Political Risks", items: ["Import tax increase for premium cosmetics", "Floating exchange rate", "Political outrage in south Asia"] },
];
const MITI = ["Collect consumer feedback to steer R&D", "Roll out products quickly to meet consumer needs", "Prioritize management of weak channels",
  "Re-consider manufacturing in 2 years; option of a factory in China"];
box(XS[2], yRows, W[2], spanH, GREY);
text(runs(RISKS, { space: 3 }), XS[2], yRows, W[2], spanH, { pt: PTS[2], name: "risks" });
box(XS[3], yRows, W[3], spanH, GREY);
text(MITI.map((t, i) => ({ text: t, options: { bullet: { indent: BUL * 72 }, breakLine: i < MITI.length - 1, paraSpaceBefore: i ? 10 : 0 } })), XS[3], yRows, W[3], spanH, { pt: PTS[3], name: "mitigation" });

L.save(pres, path.join(__dirname, "candidate.pptx"));
