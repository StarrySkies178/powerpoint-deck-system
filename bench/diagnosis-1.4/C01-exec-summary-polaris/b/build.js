// C01 variant b: executive summary as a decision framework (stage tabs x two rows -> goal bar),
// built in the Case-2019-Polaris style profile. Layout follows the layout description; sizes,
// colours and line styles come from the profile and the deck's other slides (5: filled row-label
// boxes; 12/13: grey double-chevron marker on a rule, red rounded conclusion bar, dotted dividers).
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C, F = "Arial";
const RED = C.navy;            // profile main colour (CC0000)
const GREY_D = "5C5C5C", GREY_M = "7E7E7E", GREY_L = "A2A2A2", RULE = "B4B4B4";

// footer rule (thin grey, full width above the source line, as on every content slide of the deck)
slide.addShape("line", { x: 0, y: 7.22, w: 12.97, h: 0, line: { color: "B4B4B4", width: 0.72 } });

// ---------- grid ----------
const X0 = 0.39, XR = 12.95;          // body left / right
const LW = 1.45;                       // row-label column
const CX = X0 + LW + 0.12;             // content left
const CW = (XR - CX) / 3;              // column width
const colX = (j) => CX + j * CW;

const T_Y = 1.17, T_H = 0.5;           // stage tracker
const R1_Y = 1.8, R1_H = 3.0;          // row 1 (analysis dimensions)
const SEP1_Y = R1_Y + R1_H + 0.2;      // rule with double chevrons between rows
const R2_Y = SEP1_Y + 0.25, R2_H = 0.86; // row 2 (implications)
const SEP2_Y = R2_Y + R2_H + 0.2;      // convergence rule
const BAR_Y = SEP2_Y + 0.22, BAR_H = 0.5;

// ---------- helpers ----------
const line = (x, y, w, h, o = {}) => slide.addShape("line", { x, y, w, h, line: { color: o.color || GREY_D, width: o.width || 0.75, dashType: o.dash } });
// downward chevron(s), grey, as one editable freeform (the deck's marker: 0.38 x 0.23 in)
function chevrons(cx, cy, n) {
  const w = 0.38, hh = 0.12, t = 0.06, d = 0.11, h = n === 2 ? hh + d : hh, pts = [];
  const one = (oy) => {
    pts.push({ x: 0, y: oy, moveTo: true }, { x: w / 2, y: oy + hh - t }, { x: w, y: oy }, { x: w, y: oy + t },
      { x: w / 2, y: oy + hh }, { x: 0, y: oy + t }, { close: true });
  };
  one(0); if (n === 2) one(d);
  slide.addShape("custGeom", { x: cx - w / 2, y: cy - h / 2, w, h, points: pts, fill: { color: GREY_M }, line: { type: "none" }, objectName: "chevron marker" });
}
const bulletList = (items, x, y, w, h, fs = 14) => {
  const runs = [];
  items.forEach((it, i) => {
    const last = i === items.length - 1;
    runs.push({ text: it.h, options: { bold: true, bullet: { indent: 14 }, breakLine: true, paraSpaceBefore: i ? 16 : 0 } });
    (it.sub || []).forEach((s, k) => runs.push({ text: s, options: { bullet: { code: "2013", indent: 14 }, indentLevel: 1, breakLine: !(last && k === it.sub.length - 1), paraSpaceBefore: 2 } }));
    if (!(it.sub || []).length && !last) runs[runs.length - 1].options.breakLine = true;
  });
  runs[runs.length - 1].options.breakLine = false;
  slide.addText(runs, { x, y, w, h, fontFace: F, fontSize: fs, color: C.text, valign: "top", margin: [2, 4, 2, 4], isTextBox: true });
};

// ---------- stage tracker: outlined arrow tabs (flat left, pointed right) ----------
["Market", "Strategy Design", "Implementation"].forEach((s, j) => {
  const x = colX(j) + 0.06, w = CW - 0.12;
  slide.addShape("homePlate", { x, y: T_Y, w, h: T_H, fill: { color: "FFFFFF" }, line: { color: RED, width: 1.5 }, rectRadius: 0 });
  slide.addText(s, { x, y: T_Y, w: w - 0.2, h: T_H, fontFace: F, fontSize: 16, bold: true, color: C.text, align: "center", valign: "middle", margin: 0 });
});

// ---------- row labels: filled boxes ----------
const label = (t, y, h, fill) => {
  slide.addShape("rect", { x: X0, y, w: LW, h, fill: { color: fill }, line: { type: "none" } });
  slide.addText(t, { x: X0, y, w: LW, h, fontFace: F, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 2 });
};
label("Analysis Dimensions", R1_Y, R1_H, GREY_D);
label("Implications", R2_Y, R2_H, RED);

// ---------- row 1: three columns of bold headings, dotted dividers ----------
const cols = [
  [{ h: "Market Overview", sub: ["Industry Trends", "Key Drivers"] }, { h: "Customer Analysis" }, { h: "Competitive Analysis" }],
  [{ h: "Offline Strategy", sub: ["Store Expansion", "Sales Per Store Improvement"] }, { h: "Online Strategy", sub: ["Enter new platforms", "Optimize operations"] }, { h: "Omni-channel Strategy" }],
  [{ h: "Implementation Timeline" }, { h: "Risk & Mitigation" }, { h: "Financial Forecast" }],
];
cols.forEach((items, j) => bulletList(items, colX(j) + 0.12, R1_Y + 0.06, CW - 0.24, R1_H - 0.08, 16));
[1, 2].forEach((j) => line(colX(j), R1_Y, 0, R1_H, { dash: "sysDot" }));

// ---------- between the rows: two rules, each with a double chevron ----------
line(colX(0) + 0.12, SEP1_Y, CW - 0.24, 0);
line(colX(1) + 0.12, SEP1_Y, 2 * CW - 0.24, 0);
chevrons(colX(0) + CW / 2, SEP1_Y, 2);
chevrons(colX(1) + CW, SEP1_Y, 2);

// ---------- row 2: implications (left cell, right cell spanning two columns) ----------
// (pptxgenjs 4.0.1 writes a stray <a:pPr> after each later run of a bulleted mixed-run paragraph; build.py removes it)
const sentence = (runs, x, w) => slide.addText(runs.map((r, i) => ({ text: r.t, options: { bold: !!r.b, bullet: i === 0 ? { indent: 14 } : undefined } })),
  { x, y: R2_Y, w, h: R2_H, fontFace: F, fontSize: 16, color: C.text, valign: "middle", margin: [2, 4, 2, 4], isTextBox: true });
sentence([{ t: "Pandora should follow market trends and customer needs to find growth opportunities" }], colX(0) + 0.12, CW - 0.24);
sentence([{ t: "Based on position of " }, { t: "“a warm jewelry brand”", b: true }, { t: ", Pandora should implement strategies to regain healthy growth in Mainland China" }], colX(1) + 0.12, 2 * CW - 0.24);
line(colX(1), R2_Y, 0, R2_H, { dash: "sysDot" });

// ---------- convergence and takeaway bar ----------
line(X0, SEP2_Y, XR - X0, 0);
chevrons((X0 + XR) / 2, SEP2_Y, 1);
slide.addShape("roundRect", { x: X0, y: BAR_Y, w: XR - X0, h: BAR_H, rectRadius: 0.08, fill: { color: RED }, line: { type: "none" } });
slide.addText("Achieve healthy revenue growth in Mainland China jewelry market", { x: X0, y: BAR_Y, w: XR - X0, h: BAR_H, fontFace: F, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
