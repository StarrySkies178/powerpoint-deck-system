// C05 rebuild 1: "Implementation Timeline" in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Frame from the deck's style profile (navy title band, breadcrumb, page number). Body forms taken from the deck's
// other slides: the banded navy-header table with an italic merged category column (E-Cluster 23), the
// "Key Assumptions" label + navy rule + round navy bullets under an exhibit (E-Cluster 16).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const crumb = { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " };
const { pres, slide, P, HOUSE } = L.start({ ref: "Case-2019-E-Cluster", title: "Implementation Timeline", crumb });

const F = "Arial";
const NAVY = "202C4F", HEAD = "283954", BLUE = "354B70", LIGHT = "63A4CC", BAND = "DFECF5", GREY = "F1F1F1", HEADC = "10366C";
const W = HOUSE.W, left = 0.27, right = W - 0.26, cw = right - left;

// ---------- 1. Gantt table (native table, bars drawn over the year cells) ----------
const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
const catW = 2.55, actW = 4.45, yw = (cw - catW - actW) / years.length;
const top = 1.55, hh = 0.46, rh = 0.55;
// rows: [category (null = merged with activity), activity, from, to, group band, step]
const rows = [
  { cat: null, act: "New Product R&D", from: 2019, to: 2019, band: BAND, colour: BLUE },
  { cat: null, act: "Marketing & Reshaping Brand", from: 2019, to: 2021, band: GREY, colour: BLUE },
  { cat: "Offline: City Penetration Steps", span: 2, act: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 2019, to: 2021, band: BAND, colour: BLUE },
  { cat: "", act: "Further expand into the tertiary cities with ~50 more stores", from: 2021, to: 2024, band: BAND, colour: LIGHT },
  { cat: "Omni Channel Building", span: 2, act: "Adjust the product offering and enter key e-commerce platforms", from: 2019, to: 2020, band: GREY, colour: BLUE },
  { cat: "", act: "Further integrate online and offline channels", from: 2021, to: 2024, band: GREY, colour: LIGHT },
];
const white = { type: "solid", color: "FFFFFF", pt: 1.5 };
const cellB = [white, white, white, white];
const hdr = (t, o = {}) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: HEAD }, align: "center", valign: "middle", border: cellB, ...o } });
const table = [[hdr("Initiative", { colspan: 2 }), ...years.map((y) => hdr(y))]];
rows.forEach((r) => {
  const base = { fill: { color: r.band }, valign: "middle", border: cellB, color: "000000" };
  const line = [];
  if (r.cat === null) line.push({ text: r.act, options: { ...base, colspan: 2, bold: true, color: HEADC, margin: [0, 0.08, 0, 0.12] } });
  else {
    if (r.cat) line.push({ text: r.cat, options: { ...base, rowspan: r.span, italic: true, bold: true, color: HEADC, align: "center", margin: [0, 0.08, 0, 0.08] } });
    line.push({ text: r.act, options: { ...base, margin: [0, 0.08, 0, 0.12] } });
  }
  years.forEach(() => line.push({ text: "", options: { ...base } }));
  table.push(line);
});
slide.addTable(table, { x: left, y: top, w: cw, colW: [catW, actW, ...years.map(() => yw)], rowH: [hh, ...rows.map(() => rh)],
  fontFace: F, fontSize: 14, color: "000000", margin: 0.04 });

// dashed year guides and arrow bars
const gx = left + catW + actW;
for (let i = 1; i < years.length; i++)
  slide.addShape("line", { x: gx + i * yw, y: top + hh, w: 0, h: rows.length * rh, line: { color: "C3C6CA", width: 0.75, dashType: "dash" } });
rows.forEach((r, i) => {
  const a = r.from - 2019, b = r.to - 2019 + 1, y = top + hh + i * rh + rh * 0.22;
  slide.addShape("homePlate", { x: gx + a * yw + 0.08, y, w: (b - a) * yw - 0.16, h: rh * 0.56, fill: { color: r.colour }, line: { type: "none" } });
});
// ---------- 2. Potential Risks (label + navy rule + round bullets, two columns) ----------
const ry = top + hh + rows.length * rh + 0.16;
slide.addText("Potential Risks", { x: left, y: ry, w: 4, h: 0.36, fontFace: F, fontSize: 15, bold: true, color: HEADC, margin: 0, valign: "middle" });
slide.addShape("line", { x: left, y: ry + 0.4, w: cw, h: 0, line: { color: NAVY, width: 1.25 } });
const risks = [
  "Economy downturn",
  "Suffer from slow ramp up problem when entering the new market",
  "Potential brand image cannibalization, fail to launch new products in the market as expected",
  "Market dynamics: customer behavior change, competitors\u2019 response, etc.",
];
const by = ry + 0.48;
slide.addText(risks.map((t) => ({ text: t, options: { bullet: { code: "25CF", indent: 22 }, breakLine: true } })),
  { x: left + 0.05, y: by, w: cw - 0.05, h: 7.08 - by, fontFace: F, fontSize: 15, color: "000000", valign: "middle", margin: 0, lineSpacingMultiple: 1.3 });

// deck footer rule (on every content slide of the deck, not in the style profile)
slide.addShape("line", { x: 0, y: 7.25, w: W, h: 0, line: { color: NAVY, width: 1 } });

L.save(pres, __dirname + "/candidate.pptx");
