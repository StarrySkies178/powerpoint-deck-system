// C01 rebuild 2: executive summary as a decision framework (stage arrows x "analysis dimensions / implications"
// -> one goal bar), in the Polaris 2019 deck's look (style profile). Exec-summary form: "decision framework"
// (Style/refs/case-competitions.md section 2). Furniture taken from the deck's other slides:
// red header bars with white bold text and red-outlined boxes (slide 9), grey filled boxes for the "so what"
// (slide 16 mitigation boxes), grey line + grey down chevron into a full red conclusion bar (slide 12),
// red bold key words (slide 8), "-" sub-items (slides 8, 9).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora’s growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P, prof } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });

const RED = prof.roles.main, BLACK = prof.roles.text, PANEL = prof.roles.panel, G_MID = prof.roles.grey3, G_RULE = "D5D5D5";
const FONT = "Arial", BODY_PT = prof.body.pt, SUB_PT = prof.body.label_pt;

// ---------- grid ----------
const X0 = prof.margins.left, X1 = 13.333 - prof.margins.right;      // body edges from the profile
const LW = 1.55, GAP = 0.14, CX = X0 + LW + GAP, CW = (X1 - CX - 2 * GAP) / 3;
const col = (j) => CX + j * (CW + GAP);
const HY = 1.17, HH = 0.58;              // stage arrows
const AY = 1.92, AH = 2.78;              // analysis dimensions row
const IY = 5.0, IH = 1.12;               // implications row
const LY = 6.3;                           // convergence line
const BY = 6.52, BH = 0.5;               // goal bar

const tb = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || BODY_PT, color: o.color || BLACK,
  bold: !!o.bold, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? [3, 6, 3, 6], isTextBox: true, ...o.extra });
// **key words** -> red bold runs (the deck marks key words in red bold)
const runs = (s) => String(s).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: RED } } : { text: p, options: {} });

// ---------- stage arrows (column headers) ----------
const stages = ["Market", "Strategy Design", "Implementation"];
stages.forEach((s, j) => {
  const x = col(j), first = j === 0, last = j === stages.length - 1;
  slide.addShape(first ? "homePlate" : "chevron", { x, y: HY, w: CW + (last ? 0 : GAP + 0.12), h: HH, fill: { color: RED }, line: { color: "FFFFFF", width: 1.5 }, objectName: "stage " + s });
  tb(s, x + (first ? 0.1 : 0.35), HY, CW - 0.45, HH, { bold: true, color: "FFFFFF", align: "center", valign: "middle", size: 16 });
});

// ---------- row labels ----------
[["Analysis Dimensions", AY, AH], ["Implications", IY, IH]].forEach(([t, y, h]) => {
  slide.addShape("rect", { x: X0, y, w: LW, h, fill: { color: G_MID }, line: { type: "none" } });
  tb(t, X0, y, LW, h, { bold: true, color: "FFFFFF", align: "center", valign: "middle", size: BODY_PT });
});

// ---------- analysis dimensions ----------
// each item: red outline icon beside a bold head, "-" sub-items under it (icons as on the deck's slides 12 and 14)
const analysis = [
  [["Market Overview", ["Industry Trends", "Key Drivers"], "chart-line"], ["Customer Analysis", [], "users"], ["Competitive Analysis", [], "target"]],
  [["Offline Strategy", ["Store Expansion", "Sales Per Store Improvement"], "building-store"], ["Online Strategy", ["Enter new platforms", "Optimize operations"], "device-laptop"], ["Omni-channel Strategy", [], "affiliate"]],
  [["Implementation Timeline", [], "calendar"], ["Risk & Mitigation", [], "shield-check"], ["Financial Forecast", [], "coins"]],
];
const HEAD_H = 0.32, SUB_H = 0.25, ICON = 0.42, PAD = 0.14;
analysis.forEach((items, j) => {
  const x = col(j);
  slide.addShape("rect", { x, y: AY, w: CW, h: AH, fill: { color: "FFFFFF" }, line: { color: RED, width: 1 } });
  const hs = items.map(([, subs]) => Math.max(ICON, HEAD_H + subs.length * SUB_H));
  const gap = (AH - 2 * PAD - hs.reduce((a, b) => a + b, 0)) / (items.length - 1 || 1);
  let y = AY + PAD;
  items.forEach(([head, subs, ic], k) => {
    if (k) slide.addShape("line", { x: x + 0.15, y: y - gap / 2, w: CW - 0.3, h: 0, line: { color: G_RULE, width: 0.75, dashType: "dash" } });
    P.icon(slide, ic, x + 0.16, y + (subs.length ? 0 : (hs[k] - ICON) / 2), ICON, { color: RED });
    const tx = x + 0.16 + ICON + 0.12, tw = CW - (tx - x) - 0.1;
    tb(head, tx, y + (subs.length ? 0 : (hs[k] - HEAD_H) / 2), tw, HEAD_H, { bold: true, valign: "middle", margin: 0 });
    subs.forEach((s, i) => tb([{ text: s, options: { bullet: { characterCode: "2013", indent: 12 } } }], tx, y + HEAD_H + i * SUB_H, tw, SUB_H, { size: SUB_PT, valign: "middle", margin: 0 }));
    y += hs[k] + gap;
  });
});

// ---------- down arrows analysis -> implication, and implications ----------
const implications = [
  "Pandora should follow **market trends** and **customer needs** to find growth opportunities",
  "Based on position of “**a warm jewelry brand**”, Pandora should implement strategies to regain **healthy growth** in Mainland China",
];
const chevDown = (cx, y, w = 0.42, h = 0.2) => slide.addShape("chevron", { x: cx - h / 2, y: y + h / 2 - w / 2, w: h, h: w, rotate: 90, fill: { color: "A6A6A6" }, line: { type: "none" } });
implications.forEach((t, j) => {
  const x = col(j);
  chevDown(x + CW / 2, AY + AH + 0.04, 0.5, 0.22);
  slide.addShape("rect", { x, y: IY, w: CW, h: IH, fill: { color: PANEL }, line: { type: "none" } });
  tb(runs(t), x + 0.06, IY, CW - 0.12, IH, { valign: "middle" });
});

// ---------- convergence: every column feeds one line, one chevron into the goal bar ----------
const cxs = [0, 1, 2].map((j) => col(j) + CW / 2);
[0, 1].forEach((j) => slide.addShape("line", { x: cxs[j], y: IY + IH, w: 0, h: LY - IY - IH, line: { color: "A6A6A6", width: 1.5 } }));
slide.addShape("line", { x: cxs[2], y: AY + AH, w: 0, h: LY - AY - AH, line: { color: "A6A6A6", width: 1.5 } });
slide.addShape("line", { x: cxs[0], y: LY, w: cxs[2] - cxs[0], h: 0, line: { color: "A6A6A6", width: 1.5 } });
chevDown((CX + X1) / 2, LY - 0.02, 0.5, 0.22);
slide.addShape("rect", { x: CX, y: BY, w: X1 - CX, h: BH, fill: { color: RED }, line: { type: "none" }, rectRadius: 0 });
tb("Achieve healthy revenue growth in Mainland China jewelry market", CX, BY, X1 - CX, BH, { bold: true, color: "FFFFFF", align: "center", valign: "middle", size: 16 });

// thin grey rule over the footer, as on every slide of the deck
slide.addShape("line", { x: 0, y: 7.2, w: 13.333, h: 0, line: { color: G_RULE, width: 0.75 } });

L.save(pres, __dirname + "/candidate.pptx");
