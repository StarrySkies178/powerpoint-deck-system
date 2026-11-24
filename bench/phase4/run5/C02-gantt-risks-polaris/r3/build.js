// C02 rebuild r3: implementation Gantt (left, ~60%) + challenges and mitigations (right), in the Case-2019-Polaris style.
// Approach: the deck's style profile (title, rule, source, page number, colours, 14 pt body / 12 pt labels) and the
// deck's HALF2 two-panel arrangement (panel header centred in bold over a red rule, dashed divider between panels,
// as on the deck's recommendation slides 12 and 13). The Gantt and the challenge rows are drawn here because the
// generators' gantt() has one group level only, and this one needs strategy > sub-area > initiative.
// Assumption (stated): the prompt gives no periods for the online and omni-channel rows; they are set to
// plausible periods (enter platforms first, data sync before product mgt. & CRM) and should be checked.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide, P, S } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C;
const RED = C.navy, GREY_BAR = C.g2, DARK = C.g5, PANEL = C.g1;
const T = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { keepSize: true, fontSize: 14, ...o });

// ---------- panel frame ----------
const top = 1.15, bottom = 7.08;
const LX = 0.4, LW = 7.1;                 // left panel (~57 %, the challenge text needs the rest at 14 pt)
const RX = 7.85, RW = 13.0 - 7.85;        // right panel
const divX = (LX + LW + RX) / 2;
slide.addShape("line", { x: divX, y: top + 0.05, w: 0, h: bottom - top - 0.05, line: { color: C.g2, width: 0.75, dashType: "dash" } });
function panelHead(text, x, w) {
  T(text, x, top, w, 0.38, { bold: true, align: "center", valign: "middle" });
  slide.addShape("line", { x, y: top + 0.42, w, h: 0, line: { color: RED, width: 1.25 } });
}
panelHead("Implementation Timeline", LX, LW);
panelHead("Main Challenges and Potential Mitigations", RX, RW);

// ---------- left: Gantt 2019-2023 ----------
const years = ["2019", "2020", "2021", "2022", "2023"];
const bandW = 1.2, labX = LX + bandW + 0.1, labW = 1.95;
const gx = labX + labW, gw = LX + LW - gx, cw = gw / years.length;
const yh = 0.34, yTop = top + 0.58;
years.forEach((yr, i) => {
  slide.addShape("rect", { x: gx + i * cw + 0.03, y: yTop, w: cw - 0.06, h: yh, fill: { color: C.g3 }, line: { type: "none" } });
  T(yr, gx + i * cw + 0.03, yTop, cw - 0.06, yh, { fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
});
// rows: kind "group" (strategy header), "task"; band = vertical sub-area label spanning its tasks
// bars: [from, to, kind] with years as indexes (inclusive), kind "p" = prioritized (red), "i" = implementation (grey)
const groups = [
  { name: "a. Offline Strategy", subs: [
    { band: "Store Expansion", tasks: [
      { label: "Open new concept stores", bars: [[0, 4, "p"]] },
      { label: "Open theme stores", bars: [[1, 2, "i"], [1, 4, "p"]], stacked: true },
      { label: "Open digital stores", bars: [[2, 2, "p"]] } ] },
    { band: "Sales per Store Improvement", tasks: [
      { label: "Loyal customer AD", bars: [[1, 4, "p"]] },
      { label: "Charity series", bars: [[0, 4, "p"]] },
      { label: "Personalized offerings", bars: [[2, 4, "i"]] },
      { label: "Design competence", bars: [[2, 4, "i"]] } ] } ] },
  { name: "b. Online Strategy", subs: [
    { band: null, tasks: [
      { label: "Enter new platforms", bars: [[0, 1, "p"]] },
      { label: "Optimize operations", bars: [[1, 4, "i"]] } ] } ] },
  { name: "c. Omni-channel Strategy", subs: [
    { band: null, tasks: [
      { label: "Data synchronization", bars: [[1, 2, "i"]] },
      { label: "Product mgt. & CRM", bars: [[2, 4, "i"]] } ] } ] },
];
const legendH = 0.36;
const gTop = yTop + yh + 0.1, gBottom = bottom - legendH - 0.12;
const nTasks = groups.reduce((a, g) => a + g.subs.reduce((b, s) => b + s.tasks.length, 0), 0);
const gh = 0.36, th = (gBottom - gTop - groups.length * gh) / nTasks;   // group header and task row heights
// year separators
for (let i = 1; i < years.length; i++) slide.addShape("line", { x: gx + i * cw, y: gTop, w: 0, h: gBottom - gTop, line: { color: C.g2, width: 0.5, dashType: "dash" } });
let y = gTop;
groups.forEach((g, gi) => {
  slide.addShape("rect", { x: LX, y: y + 0.03, w: LW, h: gh - 0.06, fill: { color: PANEL }, line: { type: "none" } });
  T(g.name, LX + 0.08, y + 0.03, labW + bandW, gh - 0.06, { bold: true, color: RED, valign: "middle", margin: 0 });
  y += gh;
  g.subs.forEach((s) => {
    const sTop = y, sh = s.tasks.length * th;
    if (s.band) {
      slide.addShape("rect", { x: LX, y: sTop + 0.04, w: bandW, h: sh - 0.08, fill: { color: DARK }, line: { type: "none" } });
      T(s.band, LX + 0.04, sTop + 0.04, bandW - 0.08, sh - 0.08, { fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    }
    s.tasks.forEach((t) => {
      T(t.label, labX, y, labW - 0.05, th, { fontSize: 12, valign: "middle", margin: 0 });
      const bh = Math.min(0.2, th * 0.55);
      t.bars.forEach((b, bi) => {
        const h = t.stacked ? bh * 0.62 : bh, by = t.stacked ? y + th / 2 - h - 0.015 + bi * (h + 0.03) : y + (th - bh) / 2;
        slide.addShape("rect", { x: gx + b[0] * cw + 0.06, y: by, w: (b[1] - b[0] + 1) * cw - 0.12, h, fill: { color: b[2] === "p" ? RED : GREY_BAR }, line: { type: "none" } });
      });
      y += th;
    });
    // thin rule under each block of tasks
    slide.addShape("line", { x: labX, y, w: LX + LW - labX, h: 0, line: { color: "D5D5D5", width: 0.5 } });
  });
});
// legend
const ly = bottom - legendH;
slide.addShape("rect", { x: labX, y: ly + 0.1, w: 0.42, h: 0.16, fill: { color: RED }, line: { type: "none" } });
T("Period for prioritized strategy", labX + 0.5, ly, 3.0, legendH, { fontSize: 12, valign: "middle", margin: 0 });
slide.addShape("rect", { x: labX + 3.05, y: ly + 0.1, w: 0.42, h: 0.16, fill: { color: GREY_BAR }, line: { type: "none" } });
T("Period for implementation", labX + 3.55, ly, 2.8, legendH, { fontSize: 12, valign: "middle", margin: 0 });

// ---------- right: three challenge -> mitigation rows ----------
const nW = 0.36, cX = RX + nW + 0.08, arrowW = 0.2, chW = 2.12, mX = cX + chW + arrowW + 0.1, mW = RX + RW - mX;
const hY = top + 0.52;
T("Challenges", cX, hY, chW, 0.34, { bold: true, align: "center", valign: "middle" });
T("Mitigations", mX, hY, mW, 0.34, { bold: true, color: RED, align: "center", valign: "middle" });
const risks = [
  { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    mi: ["Intensive staff training", "Work with local teams to conduct in-depth regional research", "Clear unauthorized suppliers"] },
  { ch: ["Competition from emerging players in entry luxury jewelry market"],
    mi: ["Keep sustainability of a differentiate in product and positioning"] },
  { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
    mi: ["Negotiate with platforms and outsource market analytics"] },
];
// weights checked on the render: LibreOffice wraps the first two rows to 7 and 4 lines, the third to 5
const need = [1.95, 1.3, 1.6];
const rTop = hY + 0.4, gap = 0.12, avail = bottom - rTop - gap * (risks.length - 1);
const k = avail / need.reduce((a, b) => a + b, 0);
const bullets = (items) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1 } }));
let ry = rTop;
risks.forEach((r, i) => {
  const rh = need[i] * k;
  // number badge, as the deck's title badges (red circle, white number)
  slide.addShape("ellipse", { x: RX, y: ry + rh / 2 - nW / 2, w: nW, h: nW, fill: { color: RED }, line: { type: "none" } });
  T(String(i + 1), RX, ry + rh / 2 - nW / 2, nW, nW, { bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  slide.addShape("rect", { x: cX, y: ry, w: chW, h: rh, fill: { color: PANEL }, line: { type: "none" } });
  slide.addText(bullets(r.ch), { x: cX + 0.06, y: ry + 0.04, w: chW - 0.12, h: rh - 0.08, fontFace: "Arial", fontSize: 14, color: C.text, valign: "middle", margin: 0.04, paraSpaceAfter: 2, isTextBox: true });
  slide.addShape("chevron", { x: cX + chW + 0.05, y: ry + rh / 2 - 0.22, w: arrowW, h: 0.44, fill: { color: C.g2 }, line: { type: "none" } });
  slide.addShape("rect", { x: mX, y: ry, w: mW, h: rh, fill: { color: "FFFFFF" }, line: { color: RED, width: 1.25 } });
  slide.addText(bullets(r.mi), { x: mX + 0.06, y: ry + 0.04, w: mW - 0.12, h: rh - 0.08, fontFace: "Arial", fontSize: 14, color: C.text, valign: "middle", margin: 0.04, paraSpaceAfter: 2, isTextBox: true });
  ry += rh + gap;
});

L.save(pres, __dirname + "/candidate.pptx");
