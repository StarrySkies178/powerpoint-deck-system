// C02 (run7, rebuild 3): implementation Gantt (left, ~60%) + challenges and mitigations (right),
// in the style of Templates/Case-2019-Polaris.pptx (deck as reference, leave-one-out).
// Forms taken from the deck's other slides: two panels with bold centred headers over a red rule and a dashed
// vertical divider (slides 11, 12, 13); grey header cells with white bold text (13); grey row bands (13);
// red numbered circles (8); grey reading boxes with a red bold lead-in (10, 12).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });

const RED = "CC0000", BLACK = "000000", G1 = "5C5C5C", G3 = "7E7E7E", G4 = "A2A2A2", PANEL = "F1F1F1", RULE = "D5D5D5", WHITE = "FFFFFF";
const PT = 14, LAB = 12;
const T = (text, x, y, w, h, o = {}) => slide.addText(text, {
  x, y, w, h, fontFace: "Arial", fontSize: o.size || PT, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03, isTextBox: true,
  paraSpaceAfter: o.psa || 0, rotate: o.rotate,
});

// ---------- frame of the two panels ----------
const TOP = 1.13, BOT = 6.92;
const LX = 0.37, LW = 7.55;                 // left panel (~60 %)
const DIV = 8.17;                           // dashed divider
const RX = 8.42, RW = 13.0 - RX;            // right panel
function panelHead(text, x, w) {
  T(text, x, TOP, w, 0.36, { bold: true, align: "center" });
  slide.addShape("line", { x, y: TOP + 0.4, w, h: 0, line: { color: RED, width: 1.5 } });
}
panelHead("Implementation Timeline", LX, LW);
panelHead("Main Challenges and Potential Mitigations", RX, RW);
slide.addShape("line", { x: DIV, y: TOP + 0.05, w: 0, h: BOT - TOP - 0.05, line: { color: G3, width: 0.75, dashType: "dash" } });

// ---------- left: Gantt 2019-2023 ----------
const years = ["2019", "2020", "2021", "2022", "2023"];
const SGW = 1.34, AW = 2.24;                // sub-group column, activity column
const GX = LX + SGW + AW, YW = (LX + LW - GX) / years.length;
const HY = TOP + 0.58, HH = 0.38;           // year header row
years.forEach((y, i) => {
  slide.addShape("rect", { x: GX + i * YW + 0.02, y: HY, w: YW - 0.04, h: HH, fill: { color: G3 }, line: { type: "none" } });
  T(y, GX + i * YW + 0.02, HY, YW - 0.04, HH, { bold: true, color: WHITE, align: "center", margin: 0 });
});
slide.addShape("rect", { x: LX, y: HY, w: SGW + AW - 0.04, h: HH, fill: { color: G3 }, line: { type: "none" } });
T("Strategy", LX, HY, SGW + AW - 0.04, HH, { bold: true, color: WHITE, align: "center", margin: 0 });

// bars: [from, to] in year columns (inclusive), kind "p" = prioritised (red), "i" = implementation (grey)
const groups = [
  { name: "a. Offline Strategy", subs: [
    { name: "Store Expansion", rows: [
      { label: "Open new concept stores", bars: [[0, 4, "p"]] },
      { label: "Open theme stores", bars: [[1, 2, "i"], [1, 4, "p"]] },
      { label: "Open digital stores", bars: [[2, 2, "p"]] } ] },
    { name: "Sales per Store Improvement", rows: [
      { label: "Loyal customer AD", bars: [[1, 4, "p"]] },
      { label: "Charity series", bars: [[0, 4, "p"]] },
      { label: "Personalized offerings", bars: [[2, 4, "i"]] },
      { label: "Design competence", bars: [[2, 4, "i"]] } ] } ] },
  // assumption: the prompt gives no periods for b and c; spans chosen to follow the store roll-out
  { name: "b. Online Strategy", subs: [{ name: null, rows: [
      { label: "Enter new platforms", bars: [[0, 1, "p"]] },
      { label: "Optimize operations", bars: [[1, 4, "i"]] } ] }] },
  { name: "c. Omni-channel Strategy", subs: [{ name: null, rows: [
      { label: "Data synchronization", bars: [[1, 2, "p"]] },
      { label: "Product mgt. & CRM", bars: [[2, 4, "i"]] } ] }] },
];
const nRows = groups.reduce((a, g) => a + 1 + g.subs.reduce((b, s) => b + s.rows.length, 0), 0);
const LEGH = 0.36, GY0 = HY + HH + 0.06, RH = (BOT - LEGH - 0.06 - GY0) / nRows;
// dashed year separators behind the bars
for (let i = 1; i < years.length; i++)
  slide.addShape("line", { x: GX + i * YW, y: GY0, w: 0, h: nRows * RH, line: { color: G4, width: 0.5, dashType: "dash" } });
let y = GY0;
groups.forEach((g, gi) => {
  slide.addShape("rect", { x: LX, y: y + 0.02, w: LW, h: RH - 0.04, fill: { color: PANEL }, line: { type: "none" } });
  T(g.name, LX + 0.06, y, LW - 0.1, RH, { bold: true, color: RED });
  y += RH;
  g.subs.forEach((s, si) => {
    const sy = y, n = s.rows.length;
    if (s.name) T(s.name, LX + 0.02, sy, SGW - 0.08, n * RH, { bold: true, size: PT, align: "left" });
    s.rows.forEach((r, ri) => {
      const ax = s.name ? LX + SGW : LX + 0.2, aw = s.name ? AW : SGW + AW - 0.2;
      T(r.label, ax, y, aw, RH);
      const dual = r.bars.length > 1, bh = dual ? RH * 0.3 : RH * 0.5;
      r.bars.forEach(([f, t, k], bi) => {
        const by = dual ? y + RH * 0.16 + bi * (bh + RH * 0.08) : y + (RH - bh) / 2;
        slide.addShape("rect", { x: GX + f * YW + 0.06, y: by, w: (t - f + 1) * YW - 0.12, h: bh, fill: { color: k === "p" ? RED : G4 }, line: { type: "none" } });
      });
      y += RH;
      if (ri < n - 1) slide.addShape("line", { x: ax, y, w: LX + LW - ax, h: 0, line: { color: RULE, width: 0.5 } });
    });
    if (si < g.subs.length - 1) slide.addShape("line", { x: LX, y, w: LW, h: 0, line: { color: G4, width: 0.75 } });
  });
});
slide.addShape("line", { x: LX, y, w: LW, h: 0, line: { color: G1, width: 1 } });
// legend
const ly = BOT - LEGH + 0.04;
slide.addShape("rect", { x: LX + 0.9, y: ly + 0.1, w: 0.45, h: 0.16, fill: { color: RED }, line: { type: "none" } });
T("Period for prioritized strategy", LX + 1.42, ly, 2.9, 0.36, { size: LAB });
slide.addShape("rect", { x: LX + 4.3, y: ly + 0.1, w: 0.45, h: 0.16, fill: { color: G4 }, line: { type: "none" } });
T("Period for implementation", LX + 4.82, ly, 2.6, 0.36, { size: LAB });

// ---------- right: three numbered challenges, each with its mitigation ----------
const blocks = [
  { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers" },
  { ch: ["Competition from emerging players in entry luxury jewelry market"],
    mit: "Keep sustainability of a differentiate in product and positioning" },
  { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
    mit: "Negotiate with platforms and outsource market analytics" },
];
// heights from the text: ~31 chars per line at 14 pt in the text width
const TW = RW - 0.55, cpl = Math.floor((TW - 0.3) * 72 / (PT * 0.5));
const lines = (s, w = cpl) => Math.max(1, Math.ceil(s.length / w));
const need = blocks.map((b) => ({ c: b.ch.reduce((a, s) => a + lines(s), 0), m: lines("Mitigation: " + b.mit) }));
const BY0 = TOP + 0.58, GAPB = 0.16, avail = BOT - BY0 - GAPB * 2;
const tot = need.reduce((a, n) => a + n.c + n.m, 0), unit = avail / (tot + blocks.length * 1.6);
let by = BY0;
blocks.forEach((b, i) => {
  const ch = need[i].c * unit + 0.5 * unit, mh = need[i].m * unit + 1.1 * unit, h = ch + mh;
  // number circle in the main colour (slide 8 form)
  slide.addShape("ellipse", { x: RX, y: by + 0.04, w: 0.34, h: 0.34, fill: { color: RED }, line: { type: "none" } });
  T(String(i + 1), RX, by + 0.04, 0.34, 0.34, { bold: true, color: WHITE, align: "center", margin: 0 });
  slide.addText(b.ch.map((s, k) => ({ text: s, options: { bullet: { indent: 14 }, breakLine: k < b.ch.length - 1 } })),
    { x: RX + 0.45, y: by, w: TW + 0.1, h: ch, fontFace: "Arial", fontSize: PT, color: BLACK, bold: true, valign: "middle", margin: 0.03, isTextBox: true });
  // mitigation in a grey box with a red lead-in (slides 10 and 12)
  const my = by + ch;
  slide.addShape("rect", { x: RX + 0.45, y: my, w: TW + 0.1, h: mh - 0.06, fill: { color: PANEL }, line: { type: "none" } });
  slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit, options: { color: BLACK } }],
    { x: RX + 0.55, y: my, w: TW - 0.1, h: mh - 0.06, fontFace: "Arial", fontSize: PT, valign: "middle", margin: 0.03, isTextBox: true });
  by += h + GAPB;
  if (i < blocks.length - 1) slide.addShape("line", { x: RX, y: by - GAPB / 2, w: RW, h: 0, line: { color: G3, width: 0.75, dashType: "dash" } });
});

L.save(pres, path.join(__dirname, "candidate.pptx"));
