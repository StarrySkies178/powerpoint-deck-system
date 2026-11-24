// C08 risk matrix, deck as reference (Case-2019-Mindcraft), fresh build.
// Plan: HALF2-type split like the deck's other two-panel analysis slides (Mindcraft 8, 13, 14): numbered red chips with bold
// sub-headlines over a grey rule. Panel 1 = numbered risk heat map (storytelling rule: risks as a numbered heat map, the same
// numbers in the mitigation list); panel 2 = risk -> solutions table in the rowblocks form, with the deck's red bracket labels
// ([Aim]/[How] on Mindcraft 8 -> [Avoid]/[Mitigate] here).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, B, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: "Source: MindCraft Analysis",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], current: 2 },
});
const C = P.C, FONT = P.THEME.bodyFontFace;

// ---------- panel 1: risk heat map (likelihood x severity, 3 x 3) ----------
const LV = ["Low", "Medium", "High"];
const risks = [
  { id: 1, li: 2, se: 2, hot: true }, { id: 2, li: 2, se: 2, hot: true },
  { id: 3, li: 1, se: 2, hot: true }, { id: 4, li: 1, se: 2, hot: true },
  { id: 5, li: 0, se: 2, name: "Customer information safety" },
  { id: 6, li: 2, se: 0, name: "Competitor's response" },
  { id: 7, li: 0, se: 1, name: "Customer preference change" },
  { id: 8, li: 1, se: 0, name: "Cannibalization" },
];
function dot(sl, r, cx, cy, d = 0.36) {
  sl.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: r.hot ? C.accent : C.g4 }, line: { color: C.white, width: 1 } });
  sl.addText(String(r.id), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fontFace: FONT, fontSize: d > 0.3 ? 14 : 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
}
function heatMap(sl, box) {
  const legendH = 1.2, axL = 1.4, topPad = 0.32, xLab = 0.3, xTitle = 0.3;
  const gx = box.x + axL, gy = box.y + topPad, gw = box.w - axL, gh = box.h - topPad - xLab - xTitle - legendH - 0.1;
  const g = 0.05, cw = (gw - 2 * g) / 3, ch = (gh - 2 * g) / 3;
  const cellX = (s) => gx + s * (cw + g), cellY = (l) => gy + (2 - l) * (ch + g);
  const heat = (l, s) => (l + s >= 3 ? P.tint(C.accent, 0.86) : l + s === 2 ? "D5D5D5" : C.g1);
  for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++)
    sl.addShape("rect", { x: cellX(s), y: cellY(l), w: cw, h: ch, fill: { color: heat(l, s) }, line: { type: "none" } });
  // axes: likelihood up, severity right
  sl.addShape("line", { x: gx - 0.08, y: gy + gh + 0.04, w: gw + 0.08, h: 0, line: { color: C.g5, width: 1.25, endArrowType: "triangle" } });
  sl.addShape("line", { x: gx - 0.08, y: gy - 0.05, w: 0, h: gh + 0.09, line: { color: C.g5, width: 1.25, beginArrowType: "triangle" } });
  LV.forEach((t, l) => P.txt(sl, t, box.x + 0.3, cellY(l), axL - 0.42, ch, { fontSize: 14, keepSize: true, noScale: true, align: "right", valign: "middle", margin: 0 }));
  LV.forEach((t, s) => P.txt(sl, t, cellX(s), gy + gh + 0.08, cw, xLab, { fontSize: 14, keepSize: true, noScale: true, align: "center", valign: "middle", margin: 0 }));
  P.txt(sl, "Severity", gx, gy + gh + 0.08 + xLab, gw, xTitle, { fontSize: 14, keepSize: true, noScale: true, bold: true, align: "center", valign: "middle", margin: 0 });
  P.txt(sl, "Likelihood", box.x + 0.14 - gh / 2, gy + gh / 2 - 0.15, gh, 0.3, { fontSize: 14, keepSize: true, noScale: true, bold: true, align: "center", valign: "middle", margin: 0, rotate: 270 });
  // top-priority zone: high severity x medium/high likelihood
  const zx = cellX(2) - 0.06, zy = cellY(2) - 0.06, zw = cw + 0.12, zh = 2 * ch + g + 0.12;
  sl.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: C.accent, width: 1.75, dashType: "dash" } });
  sl.addText("Top priority", { x: cellX(1), y: box.y - 0.04, w: cw * 2 + g + 0.06, h: topPad - 0.08, fontFace: FONT, fontSize: 14, bold: true, italic: true, color: C.accent, align: "right", valign: "bottom", margin: 0 });
  // dots, side by side when two share a cell
  const byCell = {};
  risks.forEach((r) => (byCell[r.li + "," + r.se] = byCell[r.li + "," + r.se] || []).push(r));
  Object.values(byCell).forEach((rs) => rs.forEach((r, k) => {
    const cx = cellX(r.se) + cw / 2 + (k - (rs.length - 1) / 2) * 0.5, cy = cellY(r.li) + ch / 2;
    dot(sl, r, cx, cy, 0.4);
  }));
  // legend: names of the risks outside the priority zone (1-4 are named in the table)
  const ly = gy + gh + 0.08 + xLab + xTitle + 0.1, others = risks.filter((r) => !r.hot), rh = legendH / others.length;
  others.forEach((r, i) => {
    const x = box.x + axL - 0.3, y = ly + i * rh;
    dot(sl, r, x + 0.14, y + rh / 2, 0.28);
    P.txt(sl, r.name, x + 0.36, y, box.w - axL - 0.1, rh, { fontSize: 14, keepSize: true, noScale: true, valign: "middle", margin: 0 });
  });
}

// ---------- panel 2: risks -> solutions, rowblocks form with the deck's red bracket labels ----------
const rows = [
  ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
    "Make recruitment plan in advance", "Reduce labor demand with technology"],
  ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
    "Optimize logistics network", "Find reliable third-party logistic partner"],
  ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
const PT = 14;
function solutions(sl, box) {
  const none = { type: "none" }, white = (w) => ({ type: "solid", color: "FFFFFF", pt: w }), rule = (c, w) => ({ type: "solid", color: c, pt: w });
  const colW = [0.42, box.w * 0.37, 0], hH = 0.36; colW[2] = box.w - colW[0] - colW[1];
  const head = [
    { text: "", options: { border: [none, none, rule(C.text, 1), none] } },
    { text: "Risks", options: { bold: true, color: C.accent, valign: "bottom", border: [none, none, rule(C.text, 1), none] } },
    { text: "Solutions", options: { bold: true, color: C.accent, valign: "bottom", border: [none, none, rule(C.text, 1), none] } },
  ];
  const body = rows.map((r, i) => [
    { text: String(i + 1), options: { bold: true, color: C.white, align: "center", fill: { color: C.accent }, border: [none, white(3), white(4), none] } },
    { text: [{ text: r[0], options: { bold: true, breakLine: true } }, { text: r[1] }],
      options: { fill: { color: C.g1 }, border: [none, white(3), white(4), white(3)] } },
    { text: [{ text: "[Avoid] ", options: { bold: true, color: C.accent } }, { text: r[2], options: { breakLine: true } },
             { text: "[Mitigate] ", options: { bold: true, color: C.accent } }, { text: r[3] }],
      options: { border: [none, none, i < rows.length - 1 ? rule(C.g2, 0.75) : none, none] } },
  ]);
  const need = rows.map((r) => Math.max(1 + Math.ceil(r[1].length / 22), Math.ceil((r[2].length + 8) / 34) + Math.ceil((r[3].length + 11) / 34)));
  const tot = need.reduce((a, b) => a + b, 0), rH = need.map((n) => ((box.h - hH) * n) / tot);
  sl.addTable([head, ...body], { x: box.x, y: box.y, w: box.w, colW, rowH: [hH, ...rH], h: box.h, fontFace: FONT, fontSize: PT, color: C.text,
    valign: "middle", margin: [0.03, 0.1, 0.03, 0.1], autoPage: false, objectName: "risk solutions table" });
}

S.composeSlide(pres, slide, {
  regions: [
    { x: B.x, y: B.y, w: 4.75, h: B.h },
    { x: B.x + 5.05, y: B.y, w: B.w - 5.05, h: B.h },
  ],
  panels: [
    { headline: "Risk mapping", unit: "Potential risks by likelihood and severity", draw: heatMap },
    { headline: "Solutions for important risks", draw: solutions },
  ],
}, B);

(async () => {
  const out = __dirname + "/candidate.pptx";
  await L.save(pres, out);
  // the prompt's page number: the deck's slide-number field starts at 12 on this one-slide file
  const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs"))] })), fs = require("fs");
  const zip = await JSZip.loadAsync(fs.readFileSync(out)), f = "ppt/presentation.xml";
  let x = await zip.file(f).async("string");
  x = x.replace(/<p:presentation\b([^>]*?)(\s*firstSlideNum="\d+")?>/, (m, a) => `<p:presentation${a} firstSlideNum="12">`);
  zip.file(f, x); fs.writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
})();
