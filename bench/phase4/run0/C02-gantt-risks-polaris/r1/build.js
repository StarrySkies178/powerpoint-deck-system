// C02 rebuild 1: implementation timeline (Gantt) + challenges and mitigations, in the style of Case-2019-Polaris.
// Approach: the deck's style profile (title, red rule, source, page number from the master), hand-drawn panels in the
// deck's forms seen on its other slides: bold panel header over a red rule, dashed grey divider between halves (11-13, 17),
// grey header cells with white text (13), vertical rotated row-group labels (5, 11), red number circles (9-14),
// red-outlined boxes (12, 17), grey double chevrons (12, 13), PANDORA | Polaris footer logos (every content slide).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide, P, HOUSE } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const F = P.THEME.bodyFontFace;
const RED = "CC0000", G1 = "5C5C5C", G3 = "7E7E7E", G4 = "A2A2A2", PANEL = "F1F1F1", LINE = "D5D5D5", BLACK = "000000", WHITE = "FFFFFF";

function T(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.pt || 12, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03, rotate: o.rotate, isTextBox: true,
    paraSpaceAfter: o.after || 0, lineSpacingMultiple: o.ls || undefined });
}
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });
const hline = (x, y, w, color, width = 1, dash) => slide.addShape("line", { x, y, w, h: 0, line: { color, width, dashType: dash } });
const vline = (x, y, h, color, width = 1, dash) => slide.addShape("line", { x, y, w: 0, h, line: { color, width, dashType: dash } });
function numCircle(n, x, y, d = 0.3) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
  T(String(n), x, y, d, d, { pt: 12, bold: true, color: WHITE, align: "center", margin: 0 });
}

// ---------------- geometry ----------------
const X0 = 0.39, XR = 12.98, TOP = 1.13, BOT = 7.0;
const LW = 7.55, DIV = X0 + LW + 0.2, RX = DIV + 0.2, RW = XR - RX;

// panel headers (bold, centred, red rule under them) and the dashed divider
T("Implementation Timeline", X0, TOP, LW, 0.34, { pt: 14, bold: true, align: "center" });
hline(X0, TOP + 0.36, LW, RED, 1.25);
T("Main Challenges and Potential Mitigations", RX, TOP, RW, 0.34, { pt: 14, bold: true, align: "center" });
hline(RX, TOP + 0.36, RW, RED, 1.25);
vline(DIV, TOP + 0.05, BOT - TOP - 0.1, G4, 1, "dash");

// ---------------- left: Gantt 2019-2023 ----------------
const years = ["2019", "2020", "2021", "2022", "2023"];
const VL = 0.42;                              // vertical row-group label band
const LBX = X0 + VL + 0.08, LBW = 2.55;       // row labels
const GX = LBX + LBW + 0.05, GW = X0 + LW - GX, YW = GW / years.length;
let y = TOP + 0.5;
const HH = 0.34;
years.forEach((yr, i) => { rect(GX + i * YW + 0.02, y, YW - 0.04, HH, G3); T(yr, GX + i * YW, y, YW, HH, { pt: 12, bold: true, color: WHITE, align: "center" }); });
rect(X0, y, GX - X0 - 0.02, HH, G3);
T("Strategy", X0, y, GX - X0 - 0.02, HH, { pt: 12, bold: true, color: WHITE, align: "center" });
y += HH + 0.06;

const RH = 0.335, GH = 0.32;                  // row height, group-header height
const P_ = "p", I_ = "i";                     // prioritised (red) / implementation (grey)
const groups = [
  { name: "a. Offline Strategy", subs: [
    { name: "Store Expansion", rows: [
      { label: "Open new concept stores", bars: [[2019, 2023, P_]] },
      { label: "Open theme stores", bars: [[2020, 2021, I_], [2020, 2023, P_]] },
      { label: "Open digital stores", bars: [[2021, 2021, P_]] } ] },
    { name: "Sales per Store Improvement", rows: [
      { label: "Loyal customer AD", bars: [[2020, 2023, P_]] },
      { label: "Charity series", bars: [[2019, 2023, P_]] },
      { label: "Personalized offerings", bars: [[2021, 2023, I_]] },
      { label: "Design competence", bars: [[2021, 2023, I_]] } ] } ] },
  // b and c: the prompt gives no periods; bars are an assumption (stated in the report)
  { name: "b. Online Strategy", subs: [{ rows: [
      { label: "Enter new platforms", bars: [[2019, 2020, P_]] },
      { label: "Optimize operations", bars: [[2020, 2023, I_]] } ] }] },
  { name: "c. Omni-channel Strategy", subs: [{ rows: [
      { label: "Data synchronization", bars: [[2020, 2021, P_]] },
      { label: "Product mgt. & CRM", bars: [[2021, 2023, I_]] } ] }] },
];
const ganttTop = y;
const yx = (yr) => GX + (yr - 2019) * YW;
function bar(y0, h, a, b, kind) {
  rect(yx(a) + 0.05, y0, (b - a + 1) * YW - 0.1, h, kind === P_ ? RED : G4);
}
const blockTops = [];
groups.forEach((g, gi) => {
  blockTops.push(y);
  rect(X0, y, LW, GH, PANEL);
  T(g.name, X0 + 0.04, y, LW - 0.1, GH, { pt: 12, bold: true, color: RED });
  y += GH;
  g.subs.forEach((s) => {
    const sTop = y;
    s.rows.forEach((r, ri) => {
      T(r.label, LBX, y, LBW, RH, { pt: 12 });
      if (r.bars.length === 2) {           // two periods in one row: implementation then priority, as two lanes
        const lh = (RH - 0.1) / 2;
        bar(y + 0.04, lh, r.bars[0][0], r.bars[0][1], r.bars[0][2]);
        bar(y + 0.06 + lh, lh, r.bars[1][0], r.bars[1][1], r.bars[1][2]);
      } else r.bars.forEach((b) => bar(y + 0.07, RH - 0.14, b[0], b[1], b[2]));
      y += RH;
      if (ri < s.rows.length - 1) hline(LBX, y, X0 + LW - LBX, LINE, 0.75);
    });
    if (s.name) {                          // vertical group label (rotated), grey band like the deck's row labels
      const h = y - sTop - 0.04;
      rect(X0, sTop + 0.02, VL, h, G3);
      const sz = 10;
      T(s.name, X0 + VL / 2 - h / 2, sTop + 0.02 + h / 2 - VL / 2, h, VL, { pt: sz, bold: true, color: WHITE, align: "center", rotate: 270, margin: 0 });
    }
  });
  y += 0.04;
});
const ganttBot = y - 0.04;
for (let i = 1; i < years.length; i++) vline(GX + i * YW, ganttTop, ganttBot - ganttTop, G4, 0.75, "dash");

// legend
const LY = ganttBot + 0.12;
rect(GX - 1.9, LY + 0.06, 0.35, 0.16, RED);
T("Period for prioritized strategy", GX - 1.5, LY, 2.6, 0.28, { pt: 11 });
rect(GX + 1.3, LY + 0.06, 0.35, 0.16, G4);
T("Period for implementation", GX + 1.7, LY, 2.4, 0.28, { pt: 11 });

// ---------------- right: challenges -> mitigations, numbered ----------------
const items = [
  { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    mi: ["**Intensive staff training**", "Work with **local teams** to conduct in-depth **regional research**", "**Clear unauthorized suppliers**"] },
  { ch: ["Competition from **emerging players** in entry luxury jewelry market"],
    mi: ["Keep **sustainability of a differentiate** in product and positioning"] },
  { ch: ["**Data availability** from various platforms", "High **technical requirements** for data synchronization and analytics"],
    mi: ["**Negotiate with platforms** and **outsource** market analytics"] },
];
const runs = (bullets, pt) => bullets.flatMap((b, bi) => {
  const parts = b.split("**"), out = [];
  parts.forEach((p, k) => { if (p) out.push({ text: p, options: { bold: k % 2 === 1 } }); });
  out[0].options.bullet = { indent: 12 }; out[0].options.paraSpaceBefore = bi ? 3 : 0;   // build.py removes the stray mid-paragraph pPr pptxgenjs writes
  out[out.length - 1].options.breakLine = bi < bullets.length - 1;
  return out;
});
const NX = RX, NW = 0.36, CX = RX + NW + 0.04, CW = (XR - RX - NW - 0.04 - 0.3) / 2, AW = 0.3, MX = CX + CW + AW, MW = XR - MX;
let ry = TOP + 0.5;
rect(CX, ry, CW, HH, G3); T("Challenges", CX, ry, CW, HH, { pt: 12, bold: true, color: WHITE, align: "center" });
rect(MX, ry, MW, HH, RED); T("Mitigations", MX, ry, MW, HH, { pt: 12, bold: true, color: WHITE, align: "center" });
ry += HH + 0.1;
const avail = BOT - ry - 0.05, hs = [2.05, 1.25, 1.55], k = (avail - 0.2) / hs.reduce((a, b) => a + b, 0);
items.forEach((it, i) => {
  const h = hs[i] * k;
  numCircle(i + 1, NX + 0.02, ry + h / 2 - 0.15);
  rect(CX, ry, CW, h, PANEL);
  slide.addText(runs(it.ch), { x: CX + 0.05, y: ry, w: CW - 0.1, h, fontFace: F, fontSize: 12, color: BLACK, valign: "middle", margin: 0.04, isTextBox: true });
  slide.addShape("chevron", { x: CX + CW + 0.06, y: ry + h / 2 - 0.2, w: 0.18, h: 0.4, fill: { color: G3 }, line: { type: "none" } });
  rect(MX, ry, MW, h, WHITE, { color: RED, width: 1.25 });
  slide.addText(runs(it.mi), { x: MX + 0.05, y: ry, w: MW - 0.1, h, fontFace: F, fontSize: 12, color: BLACK, valign: "middle", margin: 0.04, isTextBox: true });
  ry += h;
  if (i < items.length - 1) { hline(RX, ry + 0.05, RW, G4, 0.75, "dash"); ry += 0.1; }
});

// footer logos, as on every content slide of the deck
slide.addImage({ path: path.join(__dirname, "logo-pandora.jpg"), x: 10.748, y: 7.242, w: 1.07, h: 0.213 });
vline(11.913, 7.257, 0.208, "B4B4B4", 0.72);
slide.addImage({ path: path.join(__dirname, "logo-polaris.png"), x: 11.855, y: 7.117, w: 0.958, h: 0.383 });

L.save(pres, path.join(__dirname, "candidate.pptx"));
