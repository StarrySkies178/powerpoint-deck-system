// C02 rebuild (run7 r1): Gantt + challenges/mitigations in the style of Case-2019-Polaris (deck as reference).
// Layout: HALF2-like split (about 60/40) with a dashed divider, as the deck's other two-panel slides (11-13, 17) do:
// centred bold panel heads over a red rule, grey section bands, red circled numbers/letters, red-outlined boxes,
// grey down chevrons between steps. Built with the deck's style profile; colours are the profile's roles only.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const prof = require(require("path").join(__dirname, "../../../../../Style/refs/Case-2019-Polaris.profile.json"));
const RED = prof.roles.main, BLACK = prof.roles.text, G1 = prof.roles.grey1, G3 = prof.roles.grey3, G4 = prof.roles.grey4,
  PANEL = prof.roles.panel, RULE = "D5D5D5", WHITE = "FFFFFF", BODY = prof.body.pt, LAB = prof.body.label_pt, FONT = prof.fonts.latin;

function T(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || BODY, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.04, isTextBox: true, rotate: o.rotate, paraSpaceAfter: o.after || 0 });
}
function chip(label, x, y, d) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
  T(label, x, y, d, d, { pt: LAB, bold: true, color: WHITE, align: "center", margin: 0 });
}
function head(text, x, w, y) {
  T(text, x, y, w, 0.34, { pt: BODY + 2, bold: true, align: "center" });
  slide.addShape("line", { x, y: y + 0.36, w, h: 0, line: { color: RED, width: 1.5 } });
}

const TOP = 1.16, BOT = 7.06;
const LX = 0.37, LW = 7.45, DIV = 8.02, RX = 8.2, RW = 13.01 - 8.2;
slide.addShape("line", { x: DIV, y: TOP + 0.05, w: 0, h: BOT - TOP - 0.05, line: { color: G3, width: 1, dashType: "dash" } });

// ---------------- left: Implementation Timeline (Gantt 2019-2023) ----------------
head("Implementation Timeline", LX, LW, TOP);
const years = ["2019", "2020", "2021", "2022", "2023"];
const BX = LX + 3.0, BW = LX + LW - BX, PW = BW / years.length;   // bar area
const BAND = 0.5, LAB_X = LX + BAND + 0.08;                            // vertical sub-group bands, then row labels
let y = TOP + 0.5;
const yh = 0.36;
years.forEach((t, i) => T(t, BX + i * PW, y, PW, yh, { pt: BODY, bold: true, align: "center" }));
slide.addShape("line", { x: LX, y: y + yh + 0.02, w: LW, h: 0, line: { color: BLACK, width: 1.5 } });
y += yh + 0.08;

const P = "p", I = "i";   // prioritised (red) / implementation (grey); spans in years, inclusive
const groups = [
  { letter: "a", name: "Offline Strategy", subs: [
    { name: "Store Expansion", rows: [
      { label: "Open new concept stores", bars: [[P, 2019, 2023]] },
      { label: "Open theme stores", bars: [[I, 2020, 2021], [P, 2020, 2023]] },
      { label: "Open digital stores", bars: [[P, 2021, 2021]] } ] },
    { name: "Sales per Store Improvement", rows: [
      { label: "Loyal customer AD", bars: [[P, 2020, 2023]] },
      { label: "Charity series", bars: [[P, 2019, 2023]] },
      { label: "Personalized offerings", bars: [[I, 2021, 2023]] },
      { label: "Design competence", bars: [[I, 2021, 2023]] } ] } ] },
  // periods for b and c are not given in the prompt: assumed (see report)
  { letter: "b", name: "Online Strategy", subs: [{ rows: [
      { label: "Enter new platforms", bars: [[P, 2019, 2020]] },
      { label: "Optimize operations", bars: [[I, 2020, 2023]] } ] }] },
  { letter: "c", name: "Omni-channel Strategy", subs: [{ rows: [
      { label: "Data synchronization", bars: [[P, 2020, 2021]] },
      { label: "Product mgt. & CRM", bars: [[I, 2021, 2023]] } ] }] },
];
const nRows = groups.reduce((a, g) => a + 1 + g.subs.reduce((b, s) => b + s.rows.length, 0), 0);
const LEG = 0.42, RH = (BOT - LEG - y) / nRows;
const gridTop = y;
for (let i = 1; i < years.length; i++)
  slide.addShape("line", { x: BX + i * PW, y: gridTop, w: 0, h: nRows * RH, line: { color: G4, width: 0.75, dashType: "dash" } });

function bar(kind, from, to, by, bh) {
  const x = BX + (from - 2019) * PW + 0.04, w = (to - from + 1) * PW - 0.08;
  slide.addShape("homePlate", { x, y: by, w, h: bh, fill: { color: kind === P ? RED : G4 }, line: { type: "none" } });
}
groups.forEach((g) => {
  slide.addShape("rect", { x: LX, y: y + 0.03, w: LW, h: RH - 0.06, fill: { color: PANEL }, line: { type: "none" } });
  chip(g.letter, LX + 0.06, y + (RH - 0.26) / 2, 0.26);
  T(g.name, LX + 0.38, y, 2.6, RH, { pt: BODY, bold: true });
  y += RH;
  g.subs.forEach((s) => {
    const n = s.rows.length;
    if (s.name) {
      slide.addShape("rect", { x: LX, y: y + 0.03, w: BAND, h: n * RH - 0.06, fill: { color: G3 }, line: { type: "none" } });
      const bh = n * RH - 0.06;
      T(s.name, LX + BAND / 2 - bh / 2, y + 0.03 + bh / 2 - BAND / 2, bh, BAND, { pt: LAB, bold: true, color: WHITE, align: "center", rotate: 270, margin: 0 });
    }
    s.rows.forEach((r, k) => {
      T(r.label, LAB_X, y, BX - LAB_X - 0.05, RH, { pt: LAB });
      if (r.bars.length === 1) bar(r.bars[0][0], r.bars[0][1], r.bars[0][2], y + RH * 0.24, RH * 0.52);
      else r.bars.forEach((b, j) => bar(b[0], b[1], b[2], y + RH * 0.12 + j * RH * 0.4, RH * 0.34));
      slide.addShape("line", { x: LAB_X, y: y + RH, w: LX + LW - LAB_X, h: 0, line: { color: RULE, width: 0.5 } });
      y += RH;
    });
  });
});
// legend
const ly = BOT - LEG + 0.1;
slide.addShape("homePlate", { x: LX + 0.05, y: ly + 0.07, w: 0.5, h: 0.18, fill: { color: RED }, line: { type: "none" } });
T("Period for prioritized strategy", LX + 0.62, ly, 3.0, 0.32, { pt: LAB });
slide.addShape("homePlate", { x: LX + 3.75, y: ly + 0.07, w: 0.5, h: 0.18, fill: { color: G4 }, line: { type: "none" } });
T("Period for implementation", LX + 4.32, ly, 3.0, 0.32, { pt: LAB });

// ---------------- right: Main Challenges and Potential Mitigations ----------------
head("Main Challenges and Potential Mitigations", RX, RW, TOP);
const blocks = [
  { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", chH: 0.92, mH: 0.9 },
  { ch: ["Competition from emerging players in entry luxury jewelry market"],
    mit: "Keep sustainability of a differentiate in product and positioning", chH: 0.6, mH: 0.6 },
  { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
    mit: "Negotiate with platforms and outsource market analytics", chH: 0.8, mH: 0.6 },
];
const CHV = 0.18, GAP = 0.12, NX = RX, TX = RX + 0.42, TW = RX + RW - TX;
const need = blocks.reduce((a, b) => a + b.chH + CHV + b.mH, 0) + GAP * (blocks.length - 1);
let ry = TOP + 0.5 + Math.max(0, (BOT - 0.2 - TOP - 0.5 - need) / 2);
blocks.forEach((b, i) => {
  chip(String(i + 1), NX + 0.02, ry + (b.chH - 0.32) / 2, 0.32);
  slide.addShape("rect", { x: TX, y: ry, w: TW, h: b.chH, fill: { color: PANEL }, line: { type: "none" } });
  T(b.ch.map((c, k) => ({ text: c, options: { bullet: { indent: 14 }, breakLine: k < b.ch.length - 1 } })), TX + 0.06, ry, TW - 0.1, b.chH, { pt: BODY });
  ry += b.chH;
  slide.addShape("chevron", { x: TX + TW / 2 - (CHV - 0.04) / 2, y: ry + CHV / 2 - 0.22, w: CHV - 0.04, h: 0.44, rotate: 90, fill: { color: G4 }, line: { type: "none" } });
  ry += CHV;
  slide.addShape("rect", { x: TX, y: ry, w: TW, h: b.mH, fill: { color: WHITE }, line: { color: RED, width: 1.25 } });
  T([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit }], TX + 0.08, ry, TW - 0.14, b.mH, { pt: BODY });
  ry += b.mH + GAP;
});

L.save(pres, __dirname + "/candidate.pptx");
