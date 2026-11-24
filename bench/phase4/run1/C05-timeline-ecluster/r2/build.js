// C05 rebuild 2: "Implementation Timeline" in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Look taken from the deck's own other slides: the band table of the appendix tables (navy header row, light-blue /
// grey group bands, white rules, italic group labels) carries the Gantt; the "Key Assumptions" heading + rule and
// round navy bullets of the financial slide carry the risk list. Style profile: Style/refs/Case-2019-E-Cluster.profile.json.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, prof } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Implementation Timeline",
});
// breadcrumb in the deck's form: past sections grey, arrows grey, current section bold navy (profile crumb box);
// drawn here because crumbLine() colours the arrows like the current item
{ const cs = prof.crumb, items = ["Market Overview", "Strategy Design", "Implementation: Timeline"], runs = [];
  items.forEach((t, i) => { if (i) runs.push({ text: " → ", options: { color: cs.colours[1] } });
    runs.push({ text: t, options: { color: i === items.length - 1 ? cs.colours[0] : cs.colours[1] } }); });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 10.5, h: 0.3, fontFace: "Arial", fontSize: cs.pt, bold: true, margin: 0, valign: "top", isTextBox: true, objectName: "breadcrumb" }); }

const C = { head: "283954", band1: "DFECF5", band2: "F1F1F1", bar: "354B70", bar2: "63A4CC", rule: "10366C", text: "000000", white: "FFFFFF" };
const FONT = "Arial";
const BODY_PT = prof.body.pt;          // 15
const LABEL_PT = prof.body.label_pt;   // 14

// ---------------- Gantt table ----------------
const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
// kind: "item" (own band), "group" (group head), "sub" (row inside a group). from/to = year indexes, inclusive
const rows = [
  { kind: "item", label: "New Product R&D", from: 0, to: 0, band: C.band1 },
  { kind: "item", label: "Marketing & Reshaping Brand", from: 0, to: 2, band: C.band2 },
  { kind: "group", label: "Offline: City Penetration Steps", band: C.band1 },
  { kind: "sub", label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 2, band: C.band1, step: 0 },
  { kind: "sub", label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 5, band: C.band1, step: 1 },
  { kind: "group", label: "Omni Channel Building", band: C.band2 },
  { kind: "sub", label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 1, band: C.band2, step: 0 },
  { kind: "sub", label: "Further integrate online and offline channels", from: 2, to: 5, band: C.band2, step: 1 },
];

const X0 = 0.27, X1 = 13.06, TOP = 1.55;
const LW = 6.55, YW = (X1 - X0 - LW) / years.length;
const HH = 0.42, RH = 0.385;
const white = { type: "solid", color: C.white, pt: 1.5 };
const none = { type: "none" };
const cell = (text, o = {}) => ({ text, options: { fontFace: FONT, fontSize: LABEL_PT, color: C.text, valign: "middle", margin: [0.02, 0.1, 0.02, 0.1], ...o } });

const tbl = [];
tbl.push([cell("", { fill: { color: C.head }, border: [none, white, white, none] }),
  ...years.map((y, j) => cell(y, { fill: { color: C.head }, color: C.white, bold: true, fontSize: BODY_PT, align: "center",
    border: [none, j === years.length - 1 ? none : white, white, white] }))]);
rows.forEach((r, i) => {
  const last = i === rows.length - 1, nextBand = last ? null : rows[i + 1].band;
  const bot = last ? { type: "solid", color: C.head, pt: 1.5 } : (nextBand !== r.band ? white : none);
  const lab = r.kind === "group"
    ? cell(r.label, { bold: true, color: C.rule, fill: { color: r.band }, border: [none, white, bot, none] })
    : r.kind === "sub"
      ? cell(r.label, { fill: { color: r.band }, border: [none, white, bot, none], margin: [0.02, 0.1, 0.02, 0.38] })
      : cell(r.label, { bold: true, color: C.rule, fill: { color: r.band }, border: [none, white, bot, none] });
  tbl.push([lab, ...years.map((_, j) => cell("", { fill: { color: r.band }, border: [none, j === years.length - 1 ? none : { type: "dash", color: "C3C6CA", pt: 0.75 }, bot, none] }))]);
});
slide.addTable(tbl, { x: X0, y: TOP, w: X1 - X0, colW: [LW, ...years.map(() => YW)], rowH: [HH, ...rows.map(() => RH)], autoPage: false });

// bars: arrow-shaped (pentagon) bars over the year cells; follow-on steps of a group in the lighter blue
rows.forEach((r, i) => {
  if (r.from == null) return;
  const y = TOP + HH + i * RH, x = X0 + LW + r.from * YW + 0.07, w = (r.to - r.from + 1) * YW - 0.14, h = 0.26;
  slide.addShape("homePlate", { x, y: y + (RH - h) / 2, w, h, fill: { color: r.step === 1 ? C.bar2 : C.bar }, line: { type: "none" }, objectName: "gantt bar " + (i + 1) });
});
// group brackets: a thin navy line under each group head spanning the group's years
rows.forEach((r, i) => {
  if (r.kind !== "group") return;
  const kids = []; for (let k = i + 1; k < rows.length && rows[k].kind === "sub"; k++) kids.push(rows[k]);
  const f = Math.min(...kids.map((k) => k.from)), t = Math.max(...kids.map((k) => k.to));
  const y = TOP + HH + i * RH + RH / 2, x = X0 + LW + f * YW + 0.07, w = (t - f + 1) * YW - 0.14;
  slide.addShape("line", { x, y, w, h: 0, line: { color: C.head, width: 1.5, beginArrowType: "oval", endArrowType: "triangle" }, objectName: "group span " + r.label });
});

// ---------------- Potential Risks ----------------
const gEnd = TOP + HH + rows.length * RH;
const RY = gEnd + 0.16;
P.txt(slide, "Potential Risks", X0, RY, 6, 0.36, { fontSize: 17, keepSize: true, noScale: true, bold: true, color: C.rule, valign: "bottom", margin: 0.02 });
slide.addShape("line", { x: X0, y: RY + 0.4, w: X1 - X0, h: 0, line: { color: C.rule, width: 1.5 } });
const risks = [
  "Economy downturn",
  "Suffer from slow ramp up problem when entering the new market",
  "Potential brand image cannibalization, fail to launch new products in the market as expected",
  "Market dynamics: customer behavior change, competitors' response, etc.",
];
const by0 = RY + 0.47, bh = 0.355;
risks.forEach((t, i) => {
  const y = by0 + i * bh;
  slide.addShape("ellipse", { x: X0 + 0.12, y: y + bh / 2 - 0.055, w: 0.11, h: 0.11, fill: { color: C.head }, line: { type: "none" } });
  P.txt(slide, t, X0 + 0.42, y, X1 - X0 - 0.42, bh, { fontSize: BODY_PT, keepSize: true, noScale: true, valign: "middle", margin: 0.02 });
});

// bottom rule above the footer, as on the deck's content slides
slide.addShape("line", { x: 0, y: 7.24, w: 13.33, h: 0, line: { color: C.head, width: 0.75 } });

L.save(pres, __dirname + "/candidate.pptx");
