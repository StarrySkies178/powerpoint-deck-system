// C02 run2 r3: implementation Gantt (left ~60%) + challenges and mitigations (right), in the Polaris deck style.
// Layout: HALF2 as on the deck's other two-panel slides (bold centred panel heads over a red rule, dashed grey
// divider between panels, grey boxes, red-outlined boxes, grey double chevrons, red number circles).
// Style: Style/refs/Case-2019-Polaris.profile.json through the harness (title, rule, source, fonts, colours).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P } = L.start({
  ref: "Case-2019-Polaris",
  title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
  source: "Source: Polaris Analysis",
});

const RED = "CC0000", G_PANEL = "F1F1F1", G_BOX = "D5D5D5", G_DARK = "7E7E7E", G_BAR = "A2A2A2", G_LINE = "B4B4B4", BLACK = "000000", WHITE = "FFFFFF";
const BODY_PT = 14, LABEL_PT = 12;
const T = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { noScale: true, fontSize: o.fontSize || BODY_PT, margin: o.margin ?? 0.04, ...o });
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });
const hline = (x, y, w, color, width = 1, dash) => slide.addShape("line", { x, y, w, h: 0, line: { color, width, dashType: dash } });
const vline = (x, y, h, color, width = 1, dash) => slide.addShape("line", { x, y, w: 0, h, line: { color, width, dashType: dash } });
// grey double chevron pointing down (the deck's connector between a block and its consequence)
function downChevrons(cx, y, w = 0.42) {
  [0, 0.09].forEach((dy) => slide.addShape("chevron", { x: cx - 0.06, y: y + dy - w / 2 + 0.06, w: 0.12, h: w, rotate: 90, fill: { color: G_DARK }, line: { type: "none" } }));
}

// ---------- panels ----------
const LX = 0.37, LW = 7.33, RX = 8.08, RW = 13.01 - 8.08, HEAD_Y = 1.06, RULE_Y = 1.42;
function panelHead(text, x, w) {
  T(text, x, HEAD_Y, w, 0.34, { bold: true, align: "center", valign: "bottom" });
  hline(x, RULE_Y, w, RED, 1.25);
}
panelHead("Implementation Timeline", LX, LW);
panelHead("Main Challenges and Potential Mitigations", RX, RW);
vline(7.89, 1.12, 5.85, G_DARK, 0.75, "dash");

// ---------- left: Gantt 2019–2023 ----------
const years = ["2019", "2020", "2021", "2022", "2023"];
const GX = LX, SUBW = 1.12, ITEMX = GX + SUBW + 0.05, ITEMW = 2.05, YX = ITEMX + ITEMW + 0.02, YW = (LX + LW - YX) / years.length;
const HY = 1.58, HH = 0.32, RH = 0.315;
// header row
rect(GX, HY, SUBW + 0.05 + ITEMW - 0.03, HH, G_DARK);
T("Strategy", GX, HY, SUBW + ITEMW, HH, { fontSize: LABEL_PT, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
years.forEach((yr, j) => { rect(YX + j * YW + 0.02, HY, YW - 0.04, HH, G_DARK);
  T(yr, YX + j * YW, HY, YW, HH, { fontSize: LABEL_PT, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 }); });

// rows: kind g = strategy group, i = initiative (sub = sub-group label cell spanning its items)
// bars: [start, end, "p" prioritised | "i" implementation], year indexes 0..4 (2019..2023)
const rows = [
  { g: "a. Offline Strategy" },
  { sub: "Store Expansion", n: 3, i: "Open new concept stores", bars: [[0, 4, "p"]] },
  { i: "Open theme stores", bars: [[1, 2, "i"], [3, 4, "p"]] },
  { i: "Open digital stores", bars: [[2, 2, "p"]] },
  { sub: "Sales per Store Improvement", n: 4, i: "Loyal customer AD", bars: [[1, 4, "p"]] },
  { i: "Charity series", bars: [[0, 4, "p"]] },
  { i: "Personalized offerings", bars: [[2, 4, "i"]] },
  { i: "Design competence", bars: [[2, 4, "i"]] },
  { g: "b. Online Strategy" },
  { i: "Enter new platforms", full: true, bars: [[0, 1, "p"]] },
  { i: "Optimize operations", full: true, bars: [[1, 4, "i"]] },
  { g: "c. Omni-channel Strategy" },
  { i: "Data synchronization", full: true, bars: [[1, 3, "i"]] },
  { i: "Product mgt. & CRM", full: true, bars: [[2, 4, "i"]] },
];
let y = HY + HH + 0.06;
const rowY = [];
rows.forEach((r) => {
  if (r.g && y > HY + HH + 0.1) y += 0.05;
  rowY.push(y); y += RH;
});
const gridBottom = y;
// group rows: light grey band across the panel
rows.forEach((r, k) => { if (r.g) rect(GX, rowY[k], LW, RH, G_PANEL); });
// year separators (dashed, light), drawn over the bands
for (let j = 1; j < years.length; j++) vline(YX + j * YW, HY + HH + 0.04, gridBottom - HY - HH - 0.04, G_BAR, 0.5, "dash");
rows.forEach((r, k) => {
  const ry = rowY[k];
  if (r.g) { T(r.g, GX + 0.06, ry, LW - 0.1, RH, { fontSize: LABEL_PT, bold: true, valign: "middle", margin: 0.02 }); return; }
  if (r.sub) { rect(GX, ry + 0.02, SUBW, r.n * RH - 0.04, G_BOX);
    T(r.sub, GX, ry + 0.02, SUBW, r.n * RH - 0.04, { fontSize: LABEL_PT, bold: true, align: "center", valign: "middle", margin: 0.03 }); }
  const lx = r.full ? GX + 0.18 : ITEMX, lw = r.full ? ITEMX + ITEMW - GX - 0.18 : ITEMW;
  T(r.i, lx, ry, lw, RH, { fontSize: LABEL_PT, valign: "middle", margin: 0.03 });
  hline(r.full ? GX : ITEMX, ry + RH, LX + LW - (r.full ? GX : ITEMX), G_LINE, 0.5);
  r.bars.forEach(([s, e, kind]) => rect(YX + s * YW + 0.05, ry + RH / 2 - 0.085, (e - s + 1) * YW - 0.1, 0.17, kind === "p" ? RED : G_BAR));
});
// legend
const LGY = gridBottom + 0.2;
[["Period for prioritized strategy", RED], ["Period for implementation", G_BAR]].forEach(([lab, col], k) => {
  const lx = LX + 0.55 + k * 3.55;
  rect(lx, LGY + 0.07, 0.45, 0.16, col);
  T(lab, lx + 0.52, LGY, 2.9, 0.3, { fontSize: LABEL_PT, valign: "middle", margin: 0 });
});

// ---------- right: three challenge -> mitigation blocks ----------
const CX = RX + 0.46, CW = RX + RW - CX;
const blocks = [
  { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"], chH: 0.8,
    mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", mitH: 0.8 },
  { ch: ["Competition from emerging players in entry luxury jewelry market"], chH: 0.6,
    mit: "Keep sustainability of a differentiate in product and positioning", mitH: 0.6 },
  { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"], chH: 0.8,
    mit: "Negotiate with platforms and outsource market analytics", mitH: 0.6 },
];
const CHEV = 0.24, GAP = 0.2;
let by = 1.58;
blocks.forEach((b, k) => {
  // number circle
  slide.addShape("ellipse", { x: RX, y: by + 0.06, w: 0.34, h: 0.34, fill: { color: RED }, line: { type: "none" } });
  T(String(k + 1), RX, by + 0.06, 0.34, 0.34, { bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
  // challenge: grey box with bullets
  rect(CX, by, CW, b.chH, G_PANEL);
  slide.addText(b.ch.map((c, i) => ({ text: c, options: { bullet: { indent: 12 }, breakLine: i < b.ch.length - 1 } })), {
    x: CX + 0.06, y: by, w: CW - 0.1, h: b.chH, fontFace: "Arial", fontSize: BODY_PT, color: BLACK, valign: "middle", margin: 0.04, isTextBox: true });
  // connector
  downChevrons(CX + CW / 2, by + b.chH + 0.02, 0.4);
  // mitigation: red-outlined box
  const my = by + b.chH + CHEV;
  rect(CX, my, CW, b.mitH, WHITE, { color: RED, width: 1.25 });
  // added directly: P.txt turns runs in the accent colour (red here) into the house's text-safe green
  slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit, options: { color: BLACK } }], {
    x: CX + 0.08, y: my, w: CW - 0.14, h: b.mitH, fontFace: "Arial", fontSize: BODY_PT, valign: "middle", margin: 0.04, isTextBox: true });
  by = my + b.mitH + GAP;
});

L.save(pres, __dirname + "/candidate.pptx");
