// C05 rebuild (deck as reference, leave-one-out): "Implementation Timeline" in the style of Case-2019-E-Cluster.
// Approach: the deck's style profile (title band, crumb, type sizes, palette) through the harness, and the deck's own
// furniture from its slide master (logo top right, navy rule over the footer). The Gantt is a native table in the form of
// the deck's appendix tables (navy header row, light blue / grey bands per group, white rules, italic group cells that span
// their rows; E-Cluster 23), with bars drawn over the year columns. "Potential Risks" sits under it as a panel head with
// its navy rule and bullets on a grey panel, as the deck's "Key Assumptions" blocks (E-Cluster 16) and reading panels (2, 14).
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const ROOT = path.join(__dirname, "../../../../..");

const { pres, slide, P } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Implementation Timeline",
  crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const NAVY = "253449", RULE = "10366C", BLUE = "DFECF5", GREY = "F1F1F1", BAR = "354B70";

// ---- deck furniture from the reference's slide master (logo, footer rule) -------------------------------------------
const media = path.join(__dirname, "media");
function masterMedia() {
  // the master's two logo pictures (gear mark + word mark), read from the reference deck itself
  fs.mkdirSync(media, { recursive: true });
  const py = `import zipfile,sys\nz=zipfile.ZipFile(sys.argv[1])\nfor n in ("image2.jpg","image3.jpg"):\n    open(sys.argv[2]+"/"+n,"wb").write(z.read("ppt/media/"+n))`;
  require("child_process").execFileSync("python3", ["-c", py, path.join(ROOT, "Templates/Case-2019-E-Cluster.pptx"), media]);
}
masterMedia();
slide.addImage({ path: path.join(media, "image3.jpg"), x: 11.557, y: 0.027, w: 0.3375, h: 0.371 });
slide.addImage({ path: path.join(media, "image2.jpg"), x: 11.915, y: 0.108, w: 1.118, h: 0.2275 });
slide.addShape("line", { x: 0, y: 7.252, w: 13.333, h: 0, line: { color: "202C4F", width: 0.75 } });

// ---- Gantt table --------------------------------------------------------------------------------------------------
const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
const X0 = 0.27, TW = 12.83, colA = 2.45, colB = 3.75, yw = (TW - colA - colB) / years.length;
const Y0 = 1.5, HH = 0.42;
// rows: [group or null, label, from, to] (from/to in year columns, 0 = start of 2019)
const rows = [
  [null, "New Product R&D", 0, 1, BLUE, 0.4],
  [null, "Marketing & Reshaping Brand", 0, 3, GREY, 0.4],
  ["Offline: City Penetration Steps", "Set up 3~5 monobrand stores in prioritized and secondary cities", 0, 3, BLUE, 0.6],
  ["Offline: City Penetration Steps", "Further expand into the tertiary cities with ~50 more stores", 2, 6, BLUE, 0.6],
  ["Omni Channel Building", "Adjust the product offering and enter key e-commerce platforms", 0, 2, GREY, 0.6],
  ["Omni Channel Building", "Further integrate online and offline channels", 2, 6, GREY, 0.6],
];
const W1 = { type: "solid", color: "FFFFFF", pt: 1.5 }, NONE = { type: "none" };
const cell = (text, fill, o = {}) => ({ text, options: { fill: { color: fill }, border: [W1, W1, W1, W1], valign: "middle", ...o } });
const tbl = [[
  cell("", NAVY), cell("", NAVY),
  ...years.map((y) => cell(y, NAVY, { bold: true, color: "FFFFFF", align: "center" })),
]];
tbl[0][0].options.colspan = 2; tbl[0].splice(1, 1);
rows.forEach((r, i) => {
  const [g, label, , , fill] = r, first = g && (i === 0 || rows[i - 1][0] !== g), span = rows.filter((x) => x[0] === g).length;
  const line = [];
  if (!g) line.push(cell(label, fill, { colspan: 2, bold: true, color: RULE }));
  else {
    if (first) line.push(cell(g, fill, { rowspan: span, italic: true, bold: true, color: RULE }));
    line.push(cell(label, fill, { color: C.text }));
  }
  years.forEach(() => line.push(cell("", fill)));
  tbl.push(line);
});
const rowH = [HH, ...rows.map((r) => r[5])];
slide.addTable(tbl, { x: X0, y: Y0, w: TW, colW: [colA, colB, ...years.map(() => yw)], rowH, fontFace: FONT, fontSize: 14, color: C.text, margin: [0.03, 0.08, 0.03, 0.08] });

// bars over the year columns: arrows in the deck's secondary navy
let y = Y0 + HH;
const gx = X0 + colA + colB;
rows.forEach((r) => {
  const h = r[5], bh = 0.24;
  slide.addShape("homePlate", { x: gx + r[2] * yw + 0.08, y: y + h / 2 - bh / 2, w: (r[3] - r[2]) * yw - 0.16, h: bh, fill: { color: BAR }, line: { type: "none" } });
  y += h;
});
const tableBottom = y;

// ---- Potential Risks ----------------------------------------------------------------------------------------------
const ry = tableBottom + 0.16;
slide.addText("Potential Risks", { x: X0, y: ry, w: 5, h: 0.36, fontFace: FONT, fontSize: 17, bold: true, color: RULE, margin: [0, 0.04, 0, 0.04], valign: "bottom", isTextBox: true });
slide.addShape("line", { x: X0, y: ry + 0.4, w: TW, h: 0, line: { color: RULE, width: 1.5 } });
const py = ry + 0.5, ph = 7.17 - py;
slide.addShape("rect", { x: X0, y: py, w: TW, h: ph, fill: { color: GREY }, line: { type: "none" } });
const risks = [
  "Economy downturn",
  "Suffer from slow ramp up problem when entering the new market",
  "Potential brand image cannibalization, fail to launch new products in the market as expected",
  "Market dynamics: customer behavior change, competitors’ response, etc.",
];
const bul = (t, last) => ({ text: t, options: { bullet: { code: "25CF", indent: 22 }, paraSpaceAfter: last ? 0 : 6, breakLine: !last } });
slide.addText(risks.map((t, i) => bul(t, i === risks.length - 1)), { x: X0 + 0.15, y: py + 0.06, w: TW - 0.3, h: ph - 0.12, fontFace: FONT, fontSize: 15, color: C.text, valign: "middle", margin: [0.02, 0.06, 0.02, 0.06], isTextBox: true });

L.save(pres, path.join(__dirname, "candidate.pptx"));
