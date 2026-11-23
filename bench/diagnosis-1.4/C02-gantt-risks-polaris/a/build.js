// C02 variant a: implementation Gantt (left ~60%) + challenges -> mitigations (right), in the style of Case-2019-Polaris.
// Approach: the deck's style profile (bench_lib start, ref Case-2019-Polaris) for title, rule, source, page number, colours,
// fonts; panel furniture taken from the deck's own forms on OTHER slides (rendered siblings in other-slides/):
//   - panel headers: bold left-aligned header with a red rule under it and a dashed vertical divider (slide 17)
//   - grey header bars with bold black text (slide 13), red numbered circles (slides 8, 11-14), grey down/right chevrons (12, 13)
//   - red-outlined boxes (slides 12, 17), grey F1F1F1 boxes, table style "lines" from the profile (black header rule, B4B4B4 rows)
//   - footer: grey rule, Pandora | Polaris logos (images taken from slide 17 of the reference deck, saved in this folder)
// The Gantt is drawn with the framework's text helper (P.txt); patterns_story.gantt has no sub-groups and no
// second bar per row, which this prompt needs (theme stores: implementation and prioritised periods).
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide, P, S } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C, txt = P.txt;
const RED = C.navy, BLACK = "000000", GREY_BAR = "A2A2A2", PANEL = "F1F1F1", LINE = "B4B4B4", DARK = "5C5C5C";
const T = (text, x, y, w, h, o = {}) => txt(slide, text, x, y, w, h, { noScale: true, margin: 0.03, ...o });
const line = (x, y, w, h, color, width, dash) => slide.addShape("line", { x, y, w, h, line: { color, width, ...(dash ? { dashType: dash } : {}) } });

// ---------- panel headers (slide 17 form) ----------
const LX = 0.37, LW = 7.45, RX = 8.2, RW = 13.0 - 8.2, HY = 1.03;
function header(text, x, w) {
  T(text, x, HY, w, 0.36, { fontSize: 16, bold: true, valign: "middle" });
  line(x - 0.05, HY + 0.4, w + 0.05, 0, RED, 1.5);
}
header("Implementation Timeline", LX, LW);
header("Main Challenges and Potential Mitigations", RX, RW);
line(7.98, 1.08, 0, 5.85, DARK, 0.75, "dash");          // dashed divider between the panels (slides 11-14, 17)

// ---------- Gantt ----------
const years = ["2019", "2020", "2021", "2022", "2023"];
const SGX = LX, SGW = 1.42;                 // sub-group column (Store Expansion / Sales per Store Improvement)
const ILX = SGX + SGW + 0.08, ILW = 2.05;   // item label column
const GX = ILX + ILW + 0.05, GW = LX + LW - GX, YW = GW / years.length;
let y = 1.58;
const yh = 0.34;
years.forEach((t, i) => T(t, GX + i * YW, y, YW, yh, { fontSize: 12, bold: true, align: "center", valign: "middle" }));
T("Strategy", LX, y, SGW + ILW, yh, { fontSize: 12, bold: true, valign: "middle" });
line(LX, y + yh + 0.02, LW, 0, BLACK, 1.5);   // table header rule (profile: header_rule 000000, 1.5)
y += yh + 0.08;

// groups: rows with periods; p = prioritised [from,to] years, i = implementation [from,to]
// Online and omni-channel rows carry no years in the prompt: periods below are assumptions (see report).
const groups = [
  { name: "a. Offline Strategy", subs: [
    { name: "Store Expansion", rows: [
      { label: "Open new concept stores", bars: [["p", 2019, 2023]] },
      { label: "Open theme stores", bars: [["i", 2020, 2021], ["p", 2020, 2023]] },
      { label: "Open digital stores", bars: [["p", 2021, 2021]] }] },
    { name: "Sales per Store Improvement", rows: [
      { label: "Loyal customer AD", bars: [["p", 2020, 2023]] },
      { label: "Charity series", bars: [["p", 2019, 2023]] },
      { label: "Personalized offerings", bars: [["i", 2021, 2023]] },
      { label: "Design competence", bars: [["i", 2021, 2023]] }] }] },
  { name: "b. Online Strategy", subs: [{ name: null, rows: [
      { label: "Enter new platforms", bars: [["p", 2019, 2020]] },
      { label: "Optimize operations", bars: [["i", 2020, 2023]] }] }] },
  { name: "c. Omni-channel Strategy", subs: [{ name: null, rows: [
      { label: "Data synchronization", bars: [["p", 2020, 2021]] },
      { label: "Product mgt. & CRM", bars: [["i", 2021, 2023]] }] }] },
];
const nRows = groups.reduce((a, g) => a + 1 + g.subs.reduce((b, s) => b + s.rows.length, 0), 0);
const legendH = 0.4, gBottom = 6.92 - legendH;
const rh = (gBottom - y) / nRows;
const gTop = y;
// year grid: light dashed lines between the years
for (let i = 1; i < years.length; i++) line(GX + i * YW, gTop + 0.04, 0, gBottom - gTop - 0.04, LINE, 0.75, "dash");
groups.forEach((g, gi) => {
  // group header row: grey bar with bold text (slide 13 "SKU Selection" form)
  slide.addShape("rect", { x: LX, y: y + 0.03, w: LW, h: rh - 0.06, fill: { color: PANEL }, line: { type: "none" } });
  T(g.name, LX + 0.05, y, LW - 0.1, rh, { fontSize: 12, bold: true, color: RED, valign: "middle" });
  y += rh;
  g.subs.forEach((s) => {
    const sTop = y;
    s.rows.forEach((r, ri) => {
      T(r.label, ILX, y, ILW, rh, { fontSize: 12, valign: "middle" });
      const two = r.bars.length > 1, bh = two ? rh * 0.3 : rh * 0.46;
      r.bars.forEach(([kind, a, b], bi) => {
        const by = two ? y + rh * 0.14 + bi * (bh + rh * 0.1) : y + (rh - bh) / 2;
        slide.addShape("rect", { x: GX + (a - 2019) * YW + 0.05, y: by, w: (b - a + 1) * YW - 0.1, h: bh,
          fill: { color: kind === "p" ? RED : GREY_BAR }, line: { type: "none" } });
      });
      y += rh;
      if (ri < s.rows.length - 1) line(ILX, y, LX + LW - ILX, 0, LINE, 0.5);
    });
    if (s.name) {   // sub-group label: dark grey block with white bold text (slide 8 driver-tree boxes)
      slide.addShape("rect", { x: SGX, y: sTop + 0.04, w: SGW, h: y - sTop - 0.08, fill: { color: "7E7E7E" }, line: { type: "none" } });
      T(s.name, SGX + 0.05, sTop + 0.04, SGW - 0.1, y - sTop - 0.08, { fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    }
  });
});
line(LX, y, LW, 0, LINE, 0.75);
// legend
const ly = gBottom + 0.12;
slide.addShape("rect", { x: GX - 1.6, y: ly + 0.06, w: 0.42, h: 0.16, fill: { color: RED }, line: { type: "none" } });
T("Period for prioritized strategy", GX - 1.12, ly, 2.4, 0.28, { fontSize: 11, valign: "middle" });
slide.addShape("rect", { x: GX + 1.45, y: ly + 0.06, w: 0.42, h: 0.16, fill: { color: GREY_BAR }, line: { type: "none" } });
T("Period for implementation", GX + 1.93, ly, 2.0, 0.28, { fontSize: 11, valign: "middle" });

// ---------- challenges -> mitigations ----------
const NX = RX, ND = 0.32, CX = RX + 0.42, CW = 2.05, AX = CX + CW + 0.05, AW = 0.2, MX = AX + AW + 0.07, MW = RX + RW - MX;
let ry = 1.58;
slide.addShape("rect", { x: CX, y: ry, w: CW, h: yh, fill: { color: "D5D5D5" }, line: { type: "none" } });
T("Main Challenges", CX, ry, CW, yh, { fontSize: 12, bold: true, align: "center", valign: "middle" });
slide.addShape("rect", { x: MX, y: ry, w: MW, h: yh, fill: { color: "D5D5D5" }, line: { type: "none" } });
T("Potential Mitigations", MX, ry, MW, yh, { fontSize: 12, bold: true, align: "center", valign: "middle" });
ry += yh + 0.14;
const b = (t) => ({ text: t, options: { bold: true } });
const n = (t) => ({ text: t, options: {} });
const blocks = [
  { lines: 7, challenges: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    mitigation: [b("Intensive staff training"), n("; work with "), b("local teams"), n(" to conduct in-depth regional research; "), b("clear unauthorized suppliers")] },
  { lines: 4, challenges: ["Competition from emerging players in entry luxury jewelry market"],
    mitigation: [n("Keep "), b("sustainability"), n(" of a differentiate in "), b("product and positioning")] },
  { lines: 6, challenges: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
    mitigation: [b("Negotiate with platforms"), n(" and "), b("outsource market analytics")] },
];
const gap = 0.16, avail = 6.92 - ry - gap * (blocks.length - 1), unitH = avail / blocks.reduce((a, k) => a + k.lines, 0);
blocks.forEach((k, i) => {
  const h = k.lines * unitH;
  slide.addShape("ellipse", { x: NX, y: ry + h / 2 - ND / 2, w: ND, h: ND, fill: { color: RED }, line: { type: "none" } });
  T(String(i + 1), NX, ry + h / 2 - ND / 2, ND, ND, { fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  slide.addShape("rect", { x: CX, y: ry, w: CW, h, fill: { color: PANEL }, line: { type: "none" } });
  const runs = [];
  k.challenges.forEach((c, j) => runs.push({ text: c, options: { bullet: { indent: 12 }, breakLine: j < k.challenges.length - 1, paraSpaceAfter: 3 } }));
  slide.addText(runs, { x: CX + 0.06, y: ry, w: CW - 0.1, h, fontFace: "Arial", fontSize: 13, color: BLACK, valign: "middle", margin: 0.04 });
  slide.addShape("chevron", { x: AX, y: ry + h / 2 - 0.25, w: AW, h: 0.5, fill: { color: "7E7E7E" }, line: { type: "none" } });
  slide.addShape("rect", { x: MX, y: ry, w: MW, h, fill: { color: "FFFFFF" }, line: { color: RED, width: 1.5 } });
  slide.addText(k.mitigation, { x: MX + 0.08, y: ry, w: MW - 0.14, h, fontFace: "Arial", fontSize: 13, color: BLACK, valign: "middle", margin: 0.04 });
  ry += h + gap;
});

// ---------- footer furniture of the reference deck (slide 17): grey rule, Pandora | Polaris logos ----------
line(0, 7.22, 12.97, 0, LINE, 0.72);
slide.addImage({ path: path.join(__dirname, "logo-pandora.jpg"), x: 10.75, y: 7.24, w: 1.07, h: 0.21 });
line(11.91, 7.26, 0, 0.21, LINE, 0.72);
slide.addImage({ path: path.join(__dirname, "logo-polaris.png"), x: 11.855, y: 7.117, w: 0.958, h: 0.383 });

L.save(pres, path.join(__dirname, "candidate.pptx")).then(() => console.log("saved"));
