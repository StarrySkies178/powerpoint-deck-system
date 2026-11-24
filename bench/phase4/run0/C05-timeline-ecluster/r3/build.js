// C05 timeline, deck-as-reference (Case-2019-E-Cluster), leave-one-out rebuild 3.
// Approach: E-Cluster style profile (title band, crumb, page number) through the harness; the Gantt is a native
// table in the deck's own table form (dark header row, light-blue / grey banded groups, italic merged group cell,
// as in the deck's appendix city-expansion table) with arrow bars drawn over the year columns; the risks sit under
// a panel heading with its rule and round bullets, as the "Key Assumptions" blocks of the financial-forecast slide.
// Logo: the E-Cluster wordmark + gear pictures from the stored object of the appendix slide (case19-ecluster-022).
const path = require("path");
const { execFileSync } = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const ROOT = path.resolve(__dirname, "../../../../..");

const { pres, slide, P } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Implementation Timeline",
});
const C = { dark: "253449", band: "08163B", navy: "354B70", head: "10366C", blue: "DFECF5", grey: "F1F1F1",
  line: "7E7E7E", crumbOn: "202C4F", crumbOff: "BEBEBE", text: "000000", white: "FFFFFF" };
const FONT = "Arial";
const W = 13.333;

// ---- breadcrumb (each arrow takes the colour of the item before it, current item bold dark) ----
const items = ["Market Overview", "Strategy Design", "Implementation: Timeline"], cur = 2, runs = [];
items.forEach((it, i) => {
  const col = i === cur ? C.crumbOn : C.crumbOff;
  runs.push({ text: it, options: { color: col, bold: true } });
  if (i < items.length - 1) runs.push({ text: " → ", options: { color: col, bold: true } });
});
slide.addText(runs, { x: 0.3, y: 0.06, w: 9.5, h: 0.32, fontFace: FONT, fontSize: 15, margin: 0, valign: "middle" });

// ---- logo (pictures from the deck's stored appendix object) ----
const media = (f) => "data:image/jpeg;base64," + execFileSync("unzip", ["-p", path.join(ROOT, "Objects/store/media.zip"), f]).toString("base64");
slide.addImage({ data: media("be0ee93660a28c8a.jpg"), x: 11.557, y: 0.027, w: 0.3375, h: 0.371 });
slide.addImage({ data: media("2062e202a8d83254.jpg"), x: 11.915, y: 0.108, w: 1.118, h: 0.227 });

// ---- Gantt table ----
const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
const X0 = 0.27, TW = 12.8, cG = 2.25, cA = 3.85, cY = (TW - cG - cA) / years.length;
const TY = 1.52, hH = 0.46, hS = 0.5, hD = 0.62;
const noB = { type: "none" }, wB = { type: "solid", color: C.white, pt: 1.5 }, gB = { type: "solid", color: C.line, pt: 1 };
const cell = (text, fill, o = {}) => ({ text, options: { fill: { color: fill }, fontFace: FONT, fontSize: 14, color: C.text, valign: "middle",
  margin: [0.02, 0.08, 0.02, 0.08], border: [noB, noB, noB, noB], ...o } });
const rowsSpec = [
  { label: "New Product R&D", from: 0, to: 1, fill: C.blue },
  { label: "Marketing & Reshaping Brand", from: 0, to: 3, fill: C.grey },
  { group: "Offline: City Penetration Steps", fill: C.blue, sub: [
    { label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 3 },
    { label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 6 }] },
  { group: "Omni Channel Building", fill: C.grey, sub: [
    { label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 2 },
    { label: "Further integrate online and offline channels", from: 2, to: 6 }] },
];
const sep = (o) => ({ ...o, border: [gB, noB, noB, noB] });   // grey rule above each block, as between the deck table's groups
const head = [cell("", C.dark, { colspan: 2, border: [noB, wB, noB, noB] }),
  ...years.map((y) => cell(y, C.dark, { color: C.white, bold: true, fontSize: 15, align: "center" }))];
const rows = [head], heights = [hH], bars = [];
let y = TY + hH;
rowsSpec.forEach((r, bi) => {
  const top = bi > 0;
  if (!r.group) {
    rows.push([cell(r.label, r.fill, { colspan: 2, bold: true, color: C.dark, border: [top ? gB : noB, gB, noB, noB] }),
      ...years.map(() => cell("", r.fill, top ? sep({}) : {}))]);
    heights.push(hS); bars.push({ y, h: hS, from: r.from, to: r.to }); y += hS;
  } else {
    r.sub.forEach((s, k) => {
      const row = [];
      if (k === 0) row.push(cell(r.group, r.fill, { rowspan: r.sub.length, bold: true, color: C.dark, border: [gB, gB, noB, noB] }));
      row.push(cell([{ text: s.label, options: { bullet: { indent: 12 } } }], r.fill, { fontSize: 13, border: [k === 0 ? gB : noB, gB, noB, noB] }));
      years.forEach(() => row.push(cell("", r.fill, k === 0 ? sep({}) : {})));
      rows.push(row); heights.push(hD); bars.push({ y, h: hD, from: s.from, to: s.to }); y += hD;
    });
  }
});
slide.addTable(rows, { x: X0, y: TY, w: TW, colW: [cG, cA, ...years.map(() => cY)], rowH: heights, fontFace: FONT });
const gEnd = y;
// faint year dividers over the body rows
for (let j = 1; j < years.length; j++) {
  const x = X0 + cG + cA + j * cY;
  slide.addShape("line", { x, y: TY + hH, w: 0, h: gEnd - TY - hH, line: { color: C.white, width: 1.5 } });
}
// arrow bars spanning the years of each activity
bars.forEach((b) => {
  const x = X0 + cG + cA + b.from * cY + 0.08, w = (b.to - b.from) * cY - 0.16, bh = 0.3;
  slide.addShape("homePlate", { x, y: b.y + (b.h - bh) / 2, w, h: bh, fill: { color: C.navy }, line: { type: "none" }, adjustPoint: 0.4 });
});
// closing rule under the table
slide.addShape("line", { x: X0, y: gEnd, w: TW, h: 0, line: { color: C.line, width: 1 } });

// ---- Potential risks (panel heading + rule + round bullets) ----
const RY = gEnd + 0.2;
slide.addText("Potential Risks", { x: X0, y: RY, w: 6, h: 0.38, fontFace: FONT, fontSize: 17, bold: true, color: C.head, margin: [0, 4, 0, 4], valign: "bottom" });
slide.addShape("line", { x: X0, y: RY + 0.42, w: TW, h: 0, line: { color: C.head, width: 1.5 } });
const risks = [
  [{ text: "Economy downturn" }],
  [{ text: "Suffer from slow ramp up problem when entering the new market" }],
  [{ text: "Potential brand image cannibalization, fail to launch new products in the market as expected" }],
  [{ text: "Market dynamics: customer behavior change, competitors’ response, etc." }],
];
const colW = TW / 2, by = RY + 0.52, bh = (7.05 - by) / 2;
risks.forEach((r, i) => {
  const cx = X0 + (i % 2) * colW, cy = by + Math.floor(i / 2) * bh;
  slide.addText(r, { x: cx + 0.05, y: cy, w: colW - 0.2, h: bh, fontFace: FONT, fontSize: 14, color: C.text, margin: 0, valign: "top",
    bullet: { characterCode: "25CF", indent: 22 } });
});

// ---- bottom rule of the deck frame ----
slide.addShape("line", { x: 0, y: 7.25, w: W, h: 0, line: { color: C.dark, width: 0.75 } });

L.save(pres, __dirname + "/candidate.pptx");
