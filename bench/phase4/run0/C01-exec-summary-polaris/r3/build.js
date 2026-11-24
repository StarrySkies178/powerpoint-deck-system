// C01 rebuild 3: executive summary as a decision framework (stages x analysis dimensions / implications -> goal bar),
// form from Style/refs/case-competitions.md §2 ("Decision framework": stage chevrons x analysing dimensions ->
// implication -> goal bar), drawn in the Case-2019-Polaris style profile. Deck furniture taken from the deck's OTHER
// slides: red header blocks with white bold text (9), grey blocks with white bold labels (8), red-outlined text boxes (8, 9, 12), "•" / "–" bullet levels (9),
// thin grey rule + grey down chevron over a red rounded conclusion bar (12), dashed grey separators (4, 6, 12).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora’s growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C, F = "Arial";
const RED = C.navy, GREY = "A2A2A2", PANEL = "F1F1F1", TXT = "000000";

// ---------- grid ----------
const X0 = 0.37, X1 = 13.01;                  // body margins of the profile
const LW = 1.75;                               // row-label column
const CX = X0 + LW + 0.1, CW = X1 - CX;        // the three stage columns
const GAP = 0.18, SW = (CW - 2 * GAP) / 3;
const colX = (j) => CX + j * (SW + GAP);

const HY = 1.22, HH = 0.62;                    // header arrows
const AY = HY + HH + 0.18, AH = 2.72;          // analysis row
const IY = AY + AH + 0.2, IH = 1.0;            // implication row
const BY = 6.42, BH = 0.56;                    // goal bar

const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || TXT, bold: !!o.bold,
  align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.05, isTextBox: true, paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm });

// a grey chevron pointing down, w wide and h tall, centred on (cx, cy): a right-pointing chevron turned 90 degrees
const downChev = (cx, cy, w, h) => slide.addShape("chevron", { x: cx - h / 2, y: cy - w / 2, w: h, h: w, rotate: 90, fill: { color: GREY }, line: { type: "none" } });

// ---------- column headers: arrows ----------
const heads = ["Market", "Strategy Design", "Implementation"];
heads.forEach((h, j) => {
  const x = colX(j), w = SW + (j < 2 ? GAP + 0.12 : 0);
  slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: HY, w, h: HH, fill: { color: RED }, line: { color: "FFFFFF", width: 1.5 }, adjustPoint: 0.35 });
  t(h, x + (j ? 0.3 : 0.1), HY, SW - (j ? 0.3 : 0.15), HH, { size: 16, bold: true, color: "FFFFFF", align: "center" });
});

// ---------- row labels ----------
const rowLabel = (text, y, h) => {
  slide.addShape("rect", { x: X0, y, w: LW, h, fill: { color: "7E7E7E" }, line: { type: "none" } });   // grey label block, white bold text (slide 8's channel blocks)
  t(text, X0 + 0.08, y, LW - 0.16, h, { size: 16, bold: true, color: "FFFFFF", align: "center" });
};
rowLabel("Analysis Dimensions", AY, AH);
rowLabel("Implications", IY, IH);

// ---------- analysis dimensions (bullets, "–" second level) ----------
const B1 = (text, last) => ({ text, options: { bold: true, bullet: { code: "2022", indent: 14 }, indentLevel: 0, breakLine: !last, paraSpaceBefore: 10 } });
const B2 = (text, last) => ({ text, options: { bullet: { code: "2013", indent: 14 }, indentLevel: 1, breakLine: !last } });
const cells = [
  [B1("Market Overview"), B2("Industry Trends"), B2("Key Drivers"), B1("Customer Analysis"), B1("Competitive Analysis", true)],
  [B1("Offline Strategy"), B2("Store Expansion"), B2("Sales Per Store Improvement"), B1("Online Strategy"), B2("Enter new platforms"), B2("Optimize operations"), B1("Omni-channel Strategy", true)],
  [B1("Implementation Timeline"), B1("Risk & Mitigation"), B1("Financial Forecast", true)],
];
cells.forEach((runs, j) => {
  const x = colX(j);
  slide.addShape("rect", { x, y: AY, w: SW, h: AH, fill: { color: PANEL }, line: { type: "none" } });
  slide.addText(runs, { x: x + 0.12, y: AY + 0.08, w: SW - 0.2, h: AH - 0.16, fontFace: F, fontSize: 14, color: TXT, valign: "middle", margin: 0.05, isTextBox: true, lineSpacingMultiple: 1.1 });
});
// dashed separators between the stage columns (the deck's panel divider)
[0, 1].forEach((j) => {
  const x = colX(j) + SW + GAP / 2;
  slide.addShape("line", { x, y: AY, w: 0, h: IY + IH - AY, line: { color: GREY, width: 0.75, dashType: "dash" } });
});

// ---------- implications (red-outlined boxes; the strategy one spans design and implementation) ----------
const impl = [
  { x: colX(0), w: SW, runs: [{ text: "Pandora should follow market trends and customer needs to find growth opportunities" }] },
  { x: colX(1), w: 2 * SW + GAP, runs: [{ text: "Based on position of " }, { text: "“a warm jewelry brand”", options: { bold: true, color: RED } },
    { text: ", Pandora should implement strategies to regain healthy growth in Mainland China" }] },
];
impl.forEach((b) => {
  slide.addShape("rect", { x: b.x, y: IY, w: b.w, h: IH, fill: { color: "FFFFFF" }, line: { color: RED, width: 1.5 } });
  slide.addText(b.runs, { x: b.x + 0.12, y: IY + 0.04, w: b.w - 0.24, h: IH - 0.08, fontFace: F, fontSize: 14, color: TXT, align: "center", valign: "middle", margin: 0.05, isTextBox: true });
});
// small grey down chevrons from each analysis cell into its implication
[0, 1, 2].forEach((j) => {
  const cx = colX(j) + SW / 2;
  downChev(cx, AY + AH + 0.1, 0.5, 0.16);
});

// ---------- convergence into the goal bar ----------
const LY = IY + IH + 0.18;                                    // the rule the implications converge on
[impl[0].x + impl[0].w / 2, impl[1].x + impl[1].w / 2].forEach((cx) =>
  slide.addShape("line", { x: cx, y: IY + IH, w: 0, h: LY - IY - IH, line: { color: GREY, width: 1.5 } }));
slide.addShape("line", { x: X0, y: LY, w: X1 - X0, h: 0, line: { color: GREY, width: 1.5 } });
downChev((X0 + X1) / 2, LY + 0.13, 0.7, 0.2);
slide.addShape("roundRect", { x: X0, y: BY, w: X1 - X0, h: BH, rectRadius: 0.08, fill: { color: RED }, line: { type: "none" } });
t("Achieve healthy revenue growth in Mainland China jewelry market", X0, BY, X1 - X0, BH, { size: 18, bold: true, color: "FFFFFF", align: "center" });

L.save(pres, __dirname + "/candidate.pptx");
