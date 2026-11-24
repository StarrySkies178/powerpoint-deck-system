// C05 rebuild (run7 r1): implementation timeline in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Layout BAND2 (case-competitions-2019-2020 §4b: "timeline over risk table"): Gantt over the full width, risks band under it.
// Form taken from the deck's other slides: table look of the appendix tables (navy header row with white bold years,
// light-blue / grey row blocks with white rules, group labels in merged left cells), "Key Assumptions" heading
// (bold navy text over a navy rule, navy round bullets) for the risks, grey F1F1F1 panel as on the executive summary.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, prof } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Implementation Timeline",
  crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
});
const C = P.C, R = prof.roles;
const BODY_PT = prof.body.pt, LABEL_PT = prof.body.label_pt;
const NAVY = C.navy, MID = R.secondary.toUpperCase(), LIGHT = "63A4CC", BLUEROW = prof.table.body_fill || "DFECF5", GREY = R.panel.toUpperCase();
const t = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { keepSize: true, fontSize: LABEL_PT, ...o });

// ---------- Gantt ----------
const x0 = prof.margins.left, x1 = 13.333 - prof.margins.right, lw = 2.75, gx = x0 + lw, years = ["2019", "2020", "2021", "2022", "2023", "2024"];
const yw = (x1 - gx) / years.length, top = 1.52, hh = 0.42;
slide.addShape("rect", { x: x0, y: top, w: x1 - x0 + 0.03, h: hh, fill: { color: NAVY }, line: { type: "none" } });
years.forEach((yr, i) => t(yr, gx + i * yw, top, yw, hh, { bold: true, color: "FFFFFF", align: "center", valign: "middle", fontSize: BODY_PT }));

// rows: single-row initiatives, then two groups of two steps; from/to are year indexes (inclusive)
const blocks = [
  { label: "New Product R&D", rows: [{ from: 0, to: 0 }], h: 0.5 },
  { label: "Marketing & Reshaping Brand", rows: [{ from: 0, to: 2 }], h: 0.5 },
  { label: "Offline: City Penetration Steps", h: 0.62, rows: [
    { text: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 2 },
    { text: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 5, later: true } ] },
  { label: "Omni Channel Building", h: 0.62, rows: [
    { text: "Adjust the product offering and\nenter key e-commerce platforms", from: 0, to: 1 },
    { text: "Further integrate online and offline channels", from: 2, to: 5, later: true } ] },
];
// pass 1: row blocks, labels and rules; pass 2: year dividers; pass 3: bars on top (dividers never cross bar text)
let y = top + hh;
const bars = [];
blocks.forEach((b, bi) => {
  const bh = b.h * b.rows.length, fill = bi % 2 ? GREY : BLUEROW;
  slide.addShape("rect", { x: x0, y, w: x1 - x0, h: bh, fill: { color: fill }, line: { type: "none" } });
  t(b.label, x0 + 0.1, y, lw - 0.2, bh, { bold: true, color: NAVY, valign: "middle", fontSize: LABEL_PT });
  b.rows.forEach((r, ri) => {
    const ry = y + ri * b.h;
    bars.push({ ...r, ry, h: b.h });
    if (ri) slide.addShape("line", { x: gx, y: ry, w: x1 - gx, h: 0, line: { color: "FFFFFF", width: 1, dashType: "dash" } });
  });
  y += bh;
  slide.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: "FFFFFF", width: 1.5 } });
});
const gBottom = y;
// year dividers and the label-column rule (white, as in the deck's tables)
for (let i = 0; i <= years.length - 1; i++) slide.addShape("line", { x: gx + i * yw, y: top + hh, w: 0, h: gBottom - top - hh, line: { color: "FFFFFF", width: i ? 0.75 : 1.5, dashType: i ? "dash" : "solid" } });
// bars: first steps in the deck's mid navy, follow-on steps in its light blue
bars.forEach((r) => {
  const bx = gx + r.from * yw + 0.06, bw = (r.to - r.from + 1) * yw - 0.12;
  const barH = r.text ? r.h - 0.1 : 0.26, by = r.ry + (r.h - barH) / 2;
  slide.addShape("homePlate", { x: bx, y: by, w: bw, h: barH, fill: { color: r.later ? LIGHT : MID }, line: { type: "none" } });
  if (r.text) t(r.text, bx + 0.04, by, bw - 0.2, barH, { color: r.later ? NAVY : "FFFFFF", valign: "middle" });
});

// ---------- Potential Risks (heading over a navy rule, navy round bullets, as "Key Assumptions") ----------
const ry0 = gBottom + 0.14;
P.icon(slide, "alert-triangle", x0 + 0.02, ry0 + 0.02, 0.3, { color: NAVY });
t("Potential Risks", x0 + 0.4, ry0, 5, 0.36, { bold: true, color: NAVY, fontSize: BODY_PT, valign: "middle" });
slide.addShape("line", { x: x0, y: ry0 + 0.38, w: x1 - x0, h: 0, line: { color: NAVY, width: 1 } });
const risks = [
  [{ text: "Economy downturn" }],
  [{ text: "Suffer from " }, { text: "slow ramp up", bold: true }, { text: " problem when entering the new market" }],
  [{ text: "Potential " }, { text: "brand image cannibalization", bold: true }, { text: ", fail to launch new products in the market as expected" }],
  [{ text: "Market dynamics", bold: true }, { text: ": customer behavior change, competitors’ response, etc." }],
];
const py = ry0 + 0.46, ph = 7.17 - py;
slide.addShape("rect", { x: x0, y: py, w: x1 - x0, h: ph, fill: { color: GREY }, line: { type: "none" } });
const rowH = (ph - 0.12) / risks.length;
risks.forEach((rk, i) => {
  const yy = py + 0.06 + i * rowH;
  slide.addShape("ellipse", { x: x0 + 0.22, y: yy + rowH / 2 - 0.05, w: 0.1, h: 0.1, fill: { color: NAVY }, line: { type: "none" } });
  slide.addText(rk.map((r) => ({ text: r.text, options: { bold: !!r.bold, color: r.bold ? NAVY : C.text } })),
    { x: x0 + 0.45, y: yy, w: x1 - x0 - 0.6, h: rowH, fontFace: "Arial", fontSize: BODY_PT, color: C.text, valign: "middle", margin: 0.02, isTextBox: true });
});

L.save(pres, __dirname + "/candidate.pptx");
