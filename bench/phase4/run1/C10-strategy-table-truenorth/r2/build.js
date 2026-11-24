// C10 rebuild r2: strategy overview table in the TrueNorth (Pola) deck style.
// Deck given as the style reference (leave-one-out): the deck's style profile, plus the forms its other slides use:
// red header row with white text (the Harvey tables, Pola 12 and 15), grey F1F1F1 row bands separated by white gaps,
// bold red labels, red breadcrumb triangles, the grey footer band and logo of the deck's master.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, P, HOUSE } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
const prof = HOUSE.STYLE;
const RED = prof.roles.main, BAND = prof.roles.panel, HI = prof.roles.grey4, TXT = prof.roles.text;
const FONT = prof.fonts.latin;

// ---- deck furniture: grey footer band (master of the reference), source on it, logo top right ----
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" }, objectName: "footer band" });
slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });
slide.addImage({ path: path.join(__dirname, "logo.jpg"), x: 8.54, y: 0.0, w: 1.42, h: 0.41, objectName: "logo" });

// ---- breadcrumb as the deck draws it: grey sections, current one black, red triangles ----
const cs = prof.crumb;
const crumbItems = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
const runs = [];
crumbItems.forEach((t, i) => {
  if (i) runs.push({ text: " ► ", options: { color: RED } });
  runs.push({ text: t, options: { color: i === cur ? "000000" : "CCCCCC" } });
});
slide.addText(runs, { x: cs.x, y: cs.y, w: 8.0, h: 0.3, fontFace: FONT, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });

// ---- text measuring with Carlito (= Calibri metrics) advance widths, 1/1000 em, chars 32..126 ----
const AW = {
  r: [226,326,401,498,507,715,682,221,303,303,498,498,250,306,252,386,507,507,507,507,507,507,507,507,507,507,268,268,498,498,498,463,894,579,544,533,615,488,459,631,623,252,319,520,420,855,646,662,517,673,543,459,487,642,567,890,519,487,468,307,386,307,498,498,291,479,525,423,525,498,305,471,525,230,239,455,230,799,525,527,525,525,349,391,335,525,452,715,433,453,395,314,460,314,498],
  b: [226,326,438,498,507,729,705,233,312,312,498,498,258,306,267,430,507,507,507,507,507,507,507,507,507,507,276,276,498,498,498,463,898,606,561,529,630,488,459,637,631,267,331,547,423,874,659,676,532,686,563,473,495,653,591,906,551,520,478,325,430,325,498,498,300,494,537,418,537,503,316,474,537,246,255,480,246,813,537,538,537,537,355,399,347,537,473,745,459,474,397,344,475,344,498],
};
const strW = (s, pt, bold) => [...s].reduce((a, ch) => a + ((AW[bold ? "b" : "r"][ch.charCodeAt(0) - 32]) || 500), 0) * pt / 1000; // points
function nLines(text, wIn, pt, bold) {
  const max = wIn * 72 * 0.97, sp = strW(" ", pt, bold);
  let n = 1, cur = 0;
  for (const word of text.split(/\s+/)) {
    const w = strW(word, pt, bold);
    if (cur && cur + sp + w > max) { n++; cur = w; } else cur += (cur ? sp : 0) + w;
  }
  return n;
}
const MARG = 4 / 72, IND = 0.15;       // text box inner margin (in), bullet hanging indent (in)
const LHK = 1.2;                       // Carlito line height / size (measured on the render: 1.19)
// a cell = optional heading + bullets; returns height in inches at size pt for box width w
function cellH(c, w, pt, hpt) {
  let h = 0;
  for (const g of c.groups) {
    if (g.head) h += nLines(g.head, w - 2 * MARG, hpt, true) * hpt * LHK + (g.sep || 0);
    g.items.forEach((t, i) => { h += nLines(t, w - 2 * MARG - IND, pt, !!c.bold) * pt * LHK + (i || g.head ? (c.gap || 0) : 0); });
  }
  return h / 72 + 2 * MARG + 0.08;
}
function cellRuns(c, pt, hpt) {
  const r = [];
  c.groups.forEach((g, gi) => {
    if (g.head) r.push({ text: g.head, options: { bold: true, color: c.headColor || RED, fontSize: hpt, breakLine: true, paraSpaceBefore: gi ? (g.sep || 0) : 0 } });
    g.items.forEach((t, i) => r.push({ text: t, options: { bullet: { indent: IND * 72 }, bold: !!c.bold, color: TXT, fontSize: pt, breakLine: true,
      paraSpaceBefore: (i || g.head) ? (c.gap || 0) : 0 } }));
  });
  r[r.length - 1].options.breakLine = false;
  return r;
}
function put(c, x, y, w, h, pt, hpt, name) {
  slide.addText(cellRuns(c, pt, hpt), { x, y, w, h, fontFace: FONT, fontSize: pt, color: TXT, valign: "middle", align: "left",
    margin: 4, isTextBox: true, objectName: name });
}
const rect = (x, y, w, h, fill, name) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" }, objectName: name });

// ---- content (from the prompt) ----
const TOP = [
  { bold: true, groups: [{ items: ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"] }] },
  { bold: true, groups: [{ items: ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"] }] },
  { bold: true, groups: [{ items: ["Market Risks", "Political Risks"] }] },
  { bold: true, groups: [{ items: ["R&D Process", "Product Intro", "Re-evaluation"] }] },
];
const ROWS = [
  [{ headColor: TXT, groups: [{ head: "Planning phase", items: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"] }] },
   { groups: [{ head: "Brand position", items: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] }] }],
  [{ headColor: TXT, groups: [{ head: "Awareness phase", items: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"] }] },
   { groups: [{ head: "Marketing strategy", items: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] }] }],
  [{ headColor: TXT, groups: [{ head: "Purchase phase", items: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"] }] },
   { groups: [{ head: "Channel optimization", items: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] }] }],
  [{ headColor: TXT, groups: [{ head: "Aftersales phase", items: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"] }] },
   { groups: [{ head: "Loyalty management", items: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] }] }],
];
const RISKS = { gap: 2, groups: [
  { head: "Market Risks", items: ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"] },
  { head: "Political Risks", sep: 9, items: ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"] }] };
const MITIG = { gap: 8, groups: [{ items: ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"] }] };

// ---- grid: pick the largest type size (deck body 14 pt, labels 12 pt, never under 11) and the column split with most room ----
const X0 = prof.margins.left, X1 = 10 - prof.margins.right;      // 0.25 .. 9.84
const Y0 = Math.max(prof.margins.body_top, HOUSE.GRID.bodyTop || 0), YEND = 7.13;
const HH = 0.36, ARW = 0.24, GAP = 0.06, TGAP = 0.06, RG = 0.06;
let best = null;
for (const pt of [14, 13, 12.5, 12, 11.5, 11]) {
  const hpt = Math.max(pt, 12);   // headings at the deck's label size at least
  for (let w3 = 1.3; w3 <= 2.3; w3 += 0.05) for (let w4 = 1.3; w4 <= 2.3; w4 += 0.05) for (let w1 = 1.9; w1 <= 3.0; w1 += 0.05) {
    const w2 = X1 - X0 - w1 - ARW - GAP * 2 - w3 - w4; if (w2 < 2.4) continue;
    const ws = [w1, w2, w3, w4];
    const hT = Math.max(...TOP.map((c, i) => cellH(c, ws[i], pt, hpt)));
    const rows = ROWS.map((r) => Math.max(cellH(r[0], w1, pt, hpt), cellH(r[1], w2, pt, hpt)));
    const yR0 = Y0 + HH + TGAP + hT + TGAP;
    const avail = YEND - yR0, need = rows.reduce((a, b) => a + b, 0) + RG * 3;
    const side = Math.max(cellH(RISKS, w3, pt, hpt), cellH(MITIG, w4, pt, hpt));
    const slack = Math.min(avail - need, avail - side);
    if (slack >= 0 && (!best || slack > best.slack)) best = { pt, hpt, ws, hT, rows, yR0, slack };
  }
  if (best) break;
}
if (!best) throw new Error("content does not fit at 11 pt");
const { pt, hpt, ws, hT, rows, yR0 } = best;
const [w1, w2, w3, w4] = ws;
const x1 = X0, x2 = x1 + w1 + ARW, x3 = x2 + w2 + GAP, x4 = x3 + w3 + GAP;
console.log(`type ${pt} pt, headings ${hpt} pt, columns ${ws.map((w) => w.toFixed(2)).join(" / ")}, slack ${best.slack.toFixed(2)} in`);

// header row
const HEADS = [["Current situation", x1, w1], ["Key strategies & initiatives", x2 - ARW, w2 + ARW], ["Risks", x3, w3], ["Mitigation", x4, w4]];
HEADS.forEach(([t, x, w], i) => {
  const xx = i === 1 ? x + 0.03 : x, ww = i === 1 ? w - 0.03 : w;
  rect(xx, Y0, ww, HH, RED, "header " + t);
  slide.addText(t, { x: xx, y: Y0, w: ww, h: HH, fontFace: FONT, fontSize: prof.body.pt, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
});

// top highlighted row (issues → answers → risk and mitigation themes)
const yT = Y0 + HH + TGAP;
rect(x1, yT, X1 - x1, hT, HI, "highlight row");
TOP.forEach((c, i) => put(c, [x1, x2, x3, x4][i], yT, ws[i], hT, pt, hpt, "top " + i));
slide.addShape("rightArrow", { x: x1 + w1 + 0.04, y: yT + hT / 2 - 0.13, w: ARW - 0.08, h: 0.26, fill: { color: RED }, line: { type: "none" }, objectName: "arrow top" });

// four rows: consumer phase → strategy; the leftover height is shared out in proportion
const avail = YEND - yR0 - RG * 3, kH = avail / rows.reduce((a, b) => a + b, 0);
let y = yR0;
ROWS.forEach((r, i) => {
  const h = rows[i] * kH;
  rect(x1, y, w1, h, BAND, "phase " + r[0].groups[0].head);
  put(r[0], x1, y, w1, h, pt, hpt, "phase text " + i);
  slide.addShape("rightArrow", { x: x1 + w1 + 0.04, y: y + h / 2 - 0.13, w: ARW - 0.08, h: 0.26, fill: { color: RED }, line: { type: "none" }, objectName: "arrow " + i });
  rect(x2, y, w2, h, BAND, "strategy " + r[1].groups[0].head);
  put(r[1], x2, y, w2, h, pt, hpt, "strategy text " + i);
  y += h + RG;
});

// risks and mitigation span the four rows
const hR = YEND - yR0;
rect(x3, yR0, w3, hR, BAND, "risks");
put(RISKS, x3, yR0, w3, hR, pt, hpt, "risks text");
rect(x4, yR0, w4, hR, BAND, "mitigation");
put(MITIG, x4, yR0, w4, hR, pt, hpt, "mitigation text");

L.save(pres, __dirname + "/candidate.pptx");
