// C02 rebuild: implementation timeline (Gantt) + challenges and mitigations, in the Polaris deck's style.
// Deck as reference: style profile Case-2019-Polaris; layout taken from the deck's two-panel implementation slides
// (left/right panels with a bold header over a red rule, dashed vertical divider, grey text boxes, red-outlined boxes).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide, P, prof } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });

const RED = prof.roles.main, GREY = "A2A2A2", DGREY = prof.roles.grey1, PANEL = prof.roles.panel, MID = "D5D5D5", BLACK = "000000";
const FONT = "Arial", LBL = prof.body.label_pt;          // 12 pt labels (profile), 14 pt body
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || LBL, color: o.color || BLACK,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03, isTextBox: true,
  paraSpaceAfter: o.psa || 0, objectName: o.name });
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });

// ---------- frame of the body: two panels, header text over a red rule, dashed divider ----------
const X0 = prof.margins.left, X1 = 13.333 - prof.margins.right, TOP = 1.08, BOT = 7.0;
const LW = 7.55, DIV = X0 + LW + 0.22, RX = DIV + 0.22, RW = X1 - RX;
function header(text, x, w) {
  T(text, x, TOP, w, 0.4, { size: 16, bold: true, align: "left", valign: "bottom", name: "panel header" });
  slide.addShape("line", { x, y: TOP + 0.45, w, h: 0, line: { color: RED, width: 1.5 } });
}
header("Implementation Timeline", X0, LW);
header("Main Challenges and Potential Mitigations", RX, RW);
slide.addShape("line", { x: DIV, y: TOP, w: 0, h: BOT - TOP, line: { color: DGREY, width: 1, dashType: "dash" } });

// ---------- left: Gantt 2019-2023 ----------
const years = ["2019", "2020", "2021", "2022", "2023"];
const SUBW = 1.45, TASKW = 2.3, GX = X0 + SUBW + TASKW + 0.1, GW = X0 + LW - GX, CW = GW / years.length;
const YH = 0.34, YY = TOP + 0.6;
years.forEach((y, i) => { rect(GX + i * CW + 0.02, YY, CW - 0.04, YH, "7E7E7E"); T(y, GX + i * CW + 0.02, YY, CW - 0.04, YH, { bold: true, color: "FFFFFF", align: "center", margin: 0 }); });
T("Strategy", X0, YY, SUBW + TASKW, YH, { bold: true, color: DGREY });

// rows: bars as [from, to, kind] with years as numbers; "p" = prioritized (red), "i" = implementation (grey)
// Online and omni-channel rows carry no years in the brief: periods assumed (see report).
const groups = [
  { id: "a", name: "Offline Strategy", subs: [
    { name: "Store Expansion", rows: [
      { label: "Open new concept stores", bars: [[2019, 2023, "p"]] },
      { label: "Open theme stores", bars: [[2020, 2021, "i"], [2020, 2023, "p"]] },
      { label: "Open digital stores", bars: [[2021, 2021, "p"]] } ] },
    { name: "Sales per Store Improvement", rows: [
      { label: "Loyal customer AD", bars: [[2020, 2023, "p"]] },
      { label: "Charity series", bars: [[2019, 2023, "p"]] },
      { label: "Personalized offerings", bars: [[2021, 2023, "i"]] },
      { label: "Design competence", bars: [[2021, 2023, "i"]] } ] } ] },
  { id: "b", name: "Online Strategy", subs: [ { name: null, rows: [
      { label: "Enter new platforms", bars: [[2019, 2020, "p"]] },
      { label: "Optimize operations", bars: [[2020, 2023, "i"]] } ] } ] },
  { id: "c", name: "Omni-channel Strategy", subs: [ { name: null, rows: [
      { label: "Data synchronization", bars: [[2020, 2021, "p"]] },
      { label: "Product mgt. & CRM", bars: [[2021, 2023, "i"]] } ] } ] },
];
const LEGH = 0.32, GY0 = YY + YH + 0.08, GY1 = BOT - LEGH - 0.08;
const nRows = groups.reduce((a, g) => a + 1 + g.subs.reduce((b, s) => b + s.rows.length, 0), 0), RH = (GY1 - GY0) / nRows;
// year dividers
for (let i = 1; i < years.length; i++) slide.addShape("line", { x: GX + i * CW, y: GY0, w: 0, h: GY1 - GY0, line: { color: MID, width: 0.75, dashType: "dash" } });
const bx = (yr) => GX + (yr - 2019) * CW;
let y = GY0;
groups.forEach((g) => {
  // group row: letter chip (red circle, as the deck's a/b markers) + bold name on a light grey band
  rect(X0, y + 0.03, LW, RH - 0.06, PANEL);
  const d = Math.min(0.26, RH - 0.08);
  slide.addShape("ellipse", { x: X0 + 0.06, y: y + (RH - d) / 2, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
  T(g.id, X0 + 0.06, y + (RH - d) / 2, d, d, { bold: true, color: "FFFFFF", align: "center", margin: 0 });
  T(g.name, X0 + 0.4, y, SUBW + TASKW, RH, { bold: true, color: RED });
  y += RH;
  g.subs.forEach((s) => {
    const sh = s.rows.length * RH;
    if (s.name) { rect(X0, y + 0.04, SUBW - 0.06, sh - 0.08, "7E7E7E"); T(s.name, X0, y + 0.04, SUBW - 0.06, sh - 0.08, { bold: true, color: "FFFFFF", align: "center", margin: 0.05 }); }
    s.rows.forEach((r, k) => {
      const tx = s.name ? X0 + SUBW + 0.04 : X0 + 0.4, tw = s.name ? TASKW : SUBW + TASKW - 0.36;
      T(r.label, tx, y, tw, RH, { name: "gantt task" });
      if (k < s.rows.length - 1) slide.addShape("line", { x: tx, y: y + RH, w: X0 + LW - tx, h: 0, line: { color: MID, width: 0.5 } });
      const two = r.bars.length > 1, bh = two ? Math.min(0.13, RH * 0.32) : Math.min(0.2, RH * 0.5);
      r.bars.forEach(([a, b, kind], j) => {
        const by = two ? y + RH / 2 - bh - 0.015 + j * (bh + 0.03) : y + (RH - bh) / 2;
        rect(bx(a) + 0.05, by, bx(b + 1) - bx(a) - 0.1, bh, kind === "p" ? RED : GREY);
      });
      y += RH;
    });
  });
});
// legend
const ly = BOT - LEGH;
rect(X0 + 0.05, ly + 0.1, 0.42, 0.14, RED); T("Period for prioritized strategy", X0 + 0.55, ly, 3.0, LEGH, {});
rect(X0 + 3.65, ly + 0.1, 0.42, 0.14, GREY); T("Period for implementation", X0 + 4.15, ly, 3.0, LEGH, {});

// ---------- right: three challenge blocks, each challenge (grey box) -> mitigation (red-outlined box) ----------
const risks = [
  { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers" },
  { ch: ["Competition from emerging players in entry luxury jewelry market"],
    mit: "Keep sustainability of a differentiate in product and positioning" },
  { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
    mit: "Negotiate with platforms and outsource market analytics" },
];
const BS = 13, CX = RX + 0.42, CWID = X1 - CX;                       // block text size; content column
const lines = (t, w, pt) => Math.max(1, Math.ceil(t.length * pt * 0.5 / 72 / (w - 0.3)));
const lh = BS * 1.2 / 72;
const need = risks.map((r) => ({ c: r.ch.reduce((a, t) => a + lines(t, CWID - 0.2, BS), 0) * lh + 0.2, m: lines("Mitigation: " + r.mit, CWID, BS) * lh + 0.2 }));
const ARR = 0.22, GAPB = 0.2, avail = BOT - (TOP + 0.6) - GAPB * (risks.length - 1) - ARR * risks.length;
const tot = need.reduce((a, n) => a + n.c + n.m, 0), k = avail / tot;
let ry = TOP + 0.6;
risks.forEach((r, i) => {
  const ch = need[i].c * k, mh = need[i].m * k;
  const d = 0.32;
  slide.addShape("ellipse", { x: RX, y: ry + 0.04, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
  T(String(i + 1), RX, ry + 0.04, d, d, { bold: true, color: "FFFFFF", align: "center", margin: 0, size: 14 });
  rect(CX, ry, CWID, ch, PANEL);
  slide.addText(r.ch.map((t, j) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < r.ch.length - 1 } })),
    { x: CX + 0.08, y: ry, w: CWID - 0.16, h: ch, fontFace: FONT, fontSize: BS, color: BLACK, valign: "middle", margin: 0.04, isTextBox: true, objectName: "challenge" });
  ry += ch;
  slide.addShape("triangle", { x: CX + CWID / 2 - 0.2, y: ry + 0.04, w: 0.4, h: ARR - 0.08, rotate: 180, fill: { color: "7E7E7E" }, line: { type: "none" } });
  ry += ARR;
  rect(CX, ry, CWID, mh, "FFFFFF", { color: RED, width: 1.5 });
  slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: r.mit, options: { color: BLACK } }],
    { x: CX + 0.08, y: ry, w: CWID - 0.16, h: mh, fontFace: FONT, fontSize: BS, valign: "middle", margin: 0.04, isTextBox: true, objectName: "mitigation" });
  ry += mh + GAPB;
});

L.save(pres, __dirname + "/candidate.pptx");
