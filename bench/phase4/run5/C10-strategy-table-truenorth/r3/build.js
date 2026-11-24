// C10 rebuild (run5 r3): strategy overview matrix in the TrueNorth (Pola 2016) style.
// Deck as reference, leave-one-out: built from the deck's style profile (Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json)
// and the forms of the deck's other slides: red header boxes over grey cells with white gaps (the Harvey table on slide 15,
// table form "panels" in Style/table-forms.md), breadcrumb and red title band from the profile, grey source band of the master.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, HOUSE } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
});
const C = P.C, FONT = HOUSE.FONT.latin;
const RED = C.navy, PINK = "EBC6C5", GREY = "F1F1F1", BLACK = "000000", WHITE = "FFFFFF";
// type: phase rows at 13 pt (the deck's body less 1 pt); the summary row, risks and mitigation at the deck's label size (12 pt, 13 pt overflows the two spanning columns);
// labels 13 pt bold, column headers 14 pt (the deck's body size). Line spacing 0.92.
const RP = 13, BP = 12, TP = 12, LP = 13, HP = 14, LS = 0.9;
// breadcrumb drawn here in the deck's own form (grey sections, current one black, red ► separators; profile crumb x, y, pt)
{
  const cs = HOUSE.STYLE.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1, runs = [];
  items.forEach((t, i) => { if (i) runs.push({ text: " \u25BA ", options: { color: "CC0000" } }); runs.push({ text: t, options: { color: i === cur ? "000000" : "CCCCCC" } }); });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 9.0, h: 0.3, fontFace: HOUSE.FONT.latin, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });
}

// ---------- content (prompt) ----------
const top = [
  ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
  ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
  ["Market Risks", "Political Risks"],
  ["R&D Process", "Product Intro", "Re-evaluation"],
];
const rows = [
  { phase: "Planning phase", needs: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    strat: "Brand position", acts: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] },
  { phase: "Awareness phase", needs: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", acts: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] },
  { phase: "Purchase phase", needs: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", acts: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] },
  { phase: "Aftersales phase", needs: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    strat: "Loyalty management", acts: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] },
];
const risks = [
  { head: "Market Risks", items: ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"] },
  { head: "Political Risks", items: ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"] },
];
const mitigation = ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"];

// ---------- geometry (10 x 7.5 in; body 1.48 to 7.12 from the profile) ----------
const B = P.BODY, X0 = B.x, RIGHT = 9.84, GAP = 0.06, ARW = 0.2;
const wC1 = 2.72, wC2 = 3.8, wC3 = 1.45;
const wC4 = RIGHT - X0 - wC1 - ARW - wC2 - wC3 - 2 * GAP;
const xC1 = X0, xC2 = xC1 + wC1 + ARW, xC3 = xC2 + wC2 + GAP, xC4 = xC3 + wC3 + GAP;
const LH = (pt) => (pt * 1.22 * LS) / 72;
// lines a text needs at pt in a width w (Calibri ~0.385 em, measured on the render a character)
const linesOf = (t, w, pt) => { const cap = Math.floor((w * 72) / (pt * 0.385)); let n = 1, cur = 0;
  for (const word of String(t).split(" ")) { const l = word.length + (cur ? 1 : 0); if (cur + l > cap && cur) { n++; cur = word.length; } else cur += l; } return n; };
const MARG = [0.05, 0.07, 0.04, 0.07], IND = 0.13;     // text insets; bullet indent (in)
const listH = (items, w, pt) => items.reduce((a, t) => a + linesOf(t, w - 0.14 - IND, pt), 0) * LH(pt);
const bullet = { indent: IND * 72 };

function box(x, y, w, h, fill) { slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } }); }
// one text box: optional bold red label line, then bullets
function cellText(x, y, w, h, label, items, pt, o = {}) {
  const runs = [];
  if (label) runs.push({ text: label, options: { bold: true, color: RED, fontSize: LP, breakLine: true } });
  items.forEach((t, i) => runs.push({ text: t, options: { bullet, fontSize: pt, color: BLACK, bold: !!o.bold, breakLine: i < items.length - 1, paraSpaceAfter: o.after || 0 } }));
  slide.addText(runs, { x, y, w, h, fontFace: FONT, valign: o.valign || "top", margin: MARG, lineSpacingMultiple: LS, isTextBox: true });
}

// 1. column headers: red boxes with white text and white gaps (the header boxes of the deck's slide 15)
const yH = B.y + 0.02, hH = 0.32;
const cols = [["Current situation", xC1, wC1 + ARW - GAP], ["Key strategies & initiatives", xC2 - GAP + GAP, wC2], ["Risks", xC3, wC3], ["Mitigation", xC4, wC4]];
cols.forEach(([t, x, w]) => {
  box(x, yH, w, hH, RED);
  slide.addText(t, { x, y: yH, w, h: hH, fontFace: FONT, fontSize: HP, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0.02 });
});

// 2. top row, highlighted: pink cells, bold text, the whole row outlined in red (the deck's chosen-row outline)
const yT = yH + hH + 0.07;
const hT = Math.max(...cols.map(([, , w], k) => listH(top[k], w - 0.25, TP))) + 0.14;   // bold: a little wider than the estimate
cols.forEach(([, x, w], k) => { box(x, yT, w, hT, PINK); cellText(x, yT, w, hT, null, top[k], TP, { bold: true, valign: "middle" }); });
slide.addShape("rect", { x: X0 - 0.03, y: yT - 0.03, w: RIGHT - X0 + 0.06, h: hT + 0.06, fill: { type: "none" }, line: { color: RED, width: 1.75 } });

// 3. four phase rows: consumer phase -> strategy, grey cells, a red arrow between them
const yR = yT + hT + 0.09, yEnd = B.y + B.h + 0.04;
const need = rows.map((r) => Math.max(LH(LP) + listH(r.needs, wC1, RP), LH(LP) + listH(r.acts, wC2, RP)) + 0.08);

const spare = (yEnd - yR - 3 * GAP) - need.reduce((a, b) => a + b, 0);
if (spare < -0.05) console.warn("rows need " + (-spare).toFixed(2) + " in more than the body has");
const rowH = need.map((h) => h + spare / rows.length);
let y = yR;
rows.forEach((r, i) => {
  const h = rowH[i];
  box(xC1, y, wC1, h, GREY); cellText(xC1, y, wC1, h, r.phase, r.needs, RP);
  slide.addShape("rightArrow", { x: xC1 + wC1 + 0.025, y: y + h / 2 - 0.13, w: ARW - 0.05, h: 0.26, fill: { color: RED }, line: { type: "none" } });
  box(xC2, y, wC2, h, GREY); cellText(xC2, y, wC2, h, r.strat, r.acts, RP);
  y += h + GAP;
});

// 4. risks and mitigation span the four rows
const hSpan = yEnd - yR;
box(xC3, yR, wC3, hSpan, GREY);
{
  const runs = [];
  risks.forEach((g, k) => {
    runs.push({ text: g.head, options: { bold: true, color: RED, fontSize: LP, breakLine: true, paraSpaceBefore: k ? 12 : 0 } });
    g.items.forEach((t, i) => runs.push({ text: t, options: { bullet, fontSize: BP, color: BLACK, breakLine: !(k === risks.length - 1 && i === g.items.length - 1), paraSpaceAfter: 4 } }));
  });
  slide.addText(runs, { x: xC3, y: yR, w: wC3, h: hSpan, fontFace: FONT, valign: "top", margin: [0.07, 0.07, 0.04, 0.07], lineSpacingMultiple: LS, isTextBox: true });
}
box(xC4, yR, wC4, hSpan, GREY);
cellText(xC4, yR + 0.03, wC4, hSpan - 0.03, null, mitigation, BP, { after: 10 });

// 5. deck furniture: grey source band with the source line (profile source_line), TrueNorth logo top right, as on the deck's
// other slides (the logo is read from the reference deck at build time, the picture its slides 7 and 15 use)
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
{ const sl = HOUSE.STYLE.source_line;
  slide.addText("Source: TrueNorth Analysis", { x: sl.x, y: sl.y, w: 8.0, h: 0.22, fontFace: FONT, fontSize: sl.pt, color: sl.colour, margin: 0, valign: "middle", isTextBox: true }); }

(async () => {
  const fs = require("fs"), JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const ref = path.join(__dirname, "../../../../../Templates/Case-2016-TrueNorth-Pola-China-growth.pptx");
  const zip = await JSZip.loadAsync(fs.readFileSync(ref));
  const jpg = await zip.file("ppt/media/image1.jpg").async("base64");
  slide.addImage({ data: "image/jpeg;base64," + jpg, x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
