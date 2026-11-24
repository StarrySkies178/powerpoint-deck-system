// C05 rebuild (run7 r2): Implementation timeline in the Case-2019-E-Cluster style.
// Deck as reference, leave-one-out: style profile + generators' frame; the Gantt is drawn in the deck's own
// furniture seen on its other slides: navy header boxes with white bold text (promotion matrix, slide 12),
// grey label blocks, dashed row rules (capability table, slide 7), panel heading with a rule and an icon row
// in a grey band (situation slide 4).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Implementation Timeline",
  crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
});

const NAVY = "253449", MID = "354B70", LIGHT = "C1DBEB", PANEL = "F1F1F1", RULE = "10366C", GREY = "C3C6CA", INK = "000000";
const FONT = "Arial";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, {
  x, y, w, h, fontFace: FONT, fontSize: o.size || 15, color: o.color || INK, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.05, isTextBox: true, objectName: o.name,
});
const box = (x, y, w, h, fill, shape = "rect") => slide.addShape(shape, { x, y, w, h, fill: { color: fill }, line: { type: "none" } });

// ---------- grid ----------
const X0 = 0.27, X1 = 13.07, LW = 2.75, GX = X0 + LW + 0.08, years = ["2019", "2020", "2021", "2022", "2023", "2024"];
const CW = (X1 - GX) / years.length;
const yx = (i) => GX + i * CW;

// header: one navy band split into years by white rules (white bold years)
const HY = 1.47, HH = 0.42;
box(GX, HY, X1 - GX + 0.03, HH, NAVY);
years.forEach((y, i) => { if (i) slide.addShape("line", { x: yx(i), y: HY, w: 0, h: HH, line: { color: "FFFFFF", width: 1.5 } }); T(y, yx(i), HY, CW, HH, { bold: true, color: "FFFFFF", align: "center" }); });

// rows: single workstreams, then grouped steps (group name in a block over its sub-rows)
const rows = [
  { name: "New Product R&D", h: 0.5, bars: [{ from: 0, to: 1 }] },
  { name: "Marketing & Reshaping Brand", h: 0.5, bars: [{ from: 0, to: 3 }] },
  { name: "Offline: City Penetration Steps", sub: [
    { h: 0.56, bars: [{ from: 0, to: 3, text: "Set up 3~5 monobrand stores in prioritized and secondary cities" }] },
    { h: 0.56, bars: [{ from: 2, to: 6, text: "Further expand into the tertiary cities with ~50 more stores", later: true }] } ] },
  { name: "Omni Channel Building", sub: [
    { h: 0.56, bars: [{ from: 0, to: 2, text: "Adjust the product offering and enter key e-commerce platforms" }] },
    { h: 0.56, bars: [{ from: 2, to: 6, text: "Further integrate online and offline channels", later: true }] } ] },
];
const GAP = 0.05;
let y = HY + HH + GAP;
const top = y;
// year separators first, so the bars sit on top of them: thin dashed verticals over the whole Gantt
const gH = rows.reduce((a, r) => a + (r.sub ? r.sub.reduce((b, s) => b + s.h, 0) : r.h), 0) + GAP * (rows.length - 1);
for (let i = 1; i < years.length; i++) slide.addShape("line", { x: yx(i), y: top, w: 0, h: gH, line: { color: GREY, width: 0.5, dashType: "sysDash" } });
const drawBar = (b, ry, rh) => {
  const x = yx(b.from) + 0.06, w = (b.to - b.from) * CW - 0.12, bh = rh - 0.1;
  slide.addShape("homePlate", { x, y: ry + 0.05, w, h: bh, fill: { color: b.later ? LIGHT : MID }, line: { type: "none" } });
  if (b.text) T(b.text, x + 0.06, ry + 0.05, w - 0.3, bh, { size: 14, color: b.later ? NAVY : "FFFFFF", margin: 0.03 });
};
rows.forEach((r, k) => {
  const subs = r.sub || [{ h: r.h, bars: r.bars }];
  const gh = subs.reduce((a, s) => a + s.h, 0);
  box(X0, y, LW, gh, PANEL);
  T(r.name, X0 + 0.1, y, LW - 0.2, gh, { bold: true, color: NAVY });
  let sy = y;
  subs.forEach((s, j) => {
    if (j) slide.addShape("line", { x: GX, y: sy, w: X1 - GX, h: 0, line: { color: GREY, width: 0.75, dashType: "dash" } });
    s.bars.forEach((b) => drawBar(b, sy, s.h));
    sy += s.h;
  });
  y += gh;
  if (k < rows.length - 1) { slide.addShape("line", { x: X0, y: y + GAP / 2, w: X1 - X0, h: 0, line: { color: GREY, width: 1, dashType: "dash" } }); y += GAP; }
});

// ---------- Potential Risks: panel heading with rule, then an icon row in a grey band ----------
const RY = y + 0.1;
T("Potential Risks", X0, RY, 6, 0.36, { size: 17, bold: true, color: RULE, margin: 0 });
slide.addShape("line", { x: X0, y: RY + 0.38, w: X1 - X0, h: 0, line: { color: RULE, width: 1.5 } });
const BY = RY + 0.46, BH = 7.2 - BY;
box(X0, BY, X1 - X0, BH, PANEL);
const risks = [
  { icon: "trending-down", text: "Economy downturn" },
  { icon: "hourglass", text: "Suffer from slow ramp up problem when entering the new market" },
  { icon: "alert-triangle", text: "Potential brand image cannibalization, fail to launch new products in the market as expected" },
  { icon: "users", text: [{ text: "Market dynamics: ", options: { bold: true, color: NAVY } }, { text: "customer behavior change, competitors' response, etc." }] },
];
const share = [0.2, 0.25, 0.3, 0.25];   // column widths follow the length of each risk
risks.forEach((r, i) => {
  const RW = share[i] * (X1 - X0), x = X0 + share.slice(0, i).reduce((a, b) => a + b, 0) * (X1 - X0);
  if (i) slide.addShape("line", { x, y: BY + 0.12, w: 0, h: BH - 0.24, line: { color: GREY, width: 1 } });
  P.icon(slide, r.icon, x + 0.14, BY + (BH - 0.42) / 2, 0.42, { color: MID });
  T(r.text, x + 0.64, BY + 0.04, RW - 0.74, BH - 0.08, { size: 15 });
});

L.save(pres, __dirname + "/candidate.pptx");
