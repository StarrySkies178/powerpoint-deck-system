// C03 rebuild 2: backup slide with the key assumptions of the financial analysis, in the style of Case-2019-Polaris.
// Approach: the deck's style profile (title, red rule, source line, page number) via the harness, and three native
// tables drawn in the deck's backup-table look (as on the deck's other backup slides, 19-21): no fills, header text
// bold in the main red at 12 pt, a 1.5 pt black rule under the header row, 0.75 pt grey rules between body rows,
// first column bold. Footer logos are the deck's own frame pictures, taken from the deck file.
const path = require("path");
const { execFileSync } = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Backup: Key assumptions for financial analysis";
const { pres, slide, P, HOUSE } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const S = HOUSE.STYLE, C = P.C;
const RED = S.roles.main, BLACK = S.roles.text;
const [hrC, hrW] = S.table.header_rule, [rrC, rrW] = S.table.row_rule;
const PT = S.table.pt;   // 12 pt, the deck's table size

const YEARS = ["2019", "2020", "2021", "2022", "2023"];
const CASES = [
  { name: "High Case", rows: [["#stores", 261, 321, 381, 441, 551], ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"], ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]] },
  { name: "Base Case", rows: [["#stores", 261, 306, 351, 396, 441], ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"], ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]] },
  { name: "Low Base", rows: [["#stores", 261, 306, 351, 391, 431], ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"], ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]] },
];

const X = S.margins.left, Wt = 12.97 - X;           // table spans the width under the title rule, as on the deck's backup tables
const firstW = 3.1, colW = [firstW, ...YEARS.map(() => (Wt - firstW) / YEARS.length)];
const hdrH = 0.42, rowH = 0.40, gap = 0.36;
const none = { type: "none" };
const bottom = (c, w) => [none, none, { type: "solid", color: c, pt: w }, none];

let y = S.margins.body_top + 0.05;
CASES.forEach((cs, k) => {
  const head = [cs.name, ...YEARS].map((t, j) => ({ text: t, options: { bold: true, color: RED, align: j ? "center" : "left", valign: "bottom", border: bottom(hrC, hrW) } }));
  const body = cs.rows.map((r, i) => r.map((v, j) => ({ text: String(v), options: { bold: j === 0, color: BLACK, align: j ? "center" : "left", valign: "middle",
    border: bottom(rrC, rrW) } })));
  slide.addTable([head, ...body], { x: X, y, w: Wt, colW, rowH: [hdrH, ...body.map(() => rowH)], h: hdrH + rowH * body.length,
    fontFace: HOUSE.FONT.latin, fontSize: PT, color: BLACK, margin: [0.03, 0.1, 0.03, 0.1], objectName: "assumptions-" + cs.name.toLowerCase().replace(/\s+/g, "-") });
  y += hdrH + rowH * body.length + gap;
});

// footer rule (thin grey line across the slide above the source line, on every content slide of the deck)
slide.addShape("line", { x: 0, y: 7.217, w: 12.97, h: 0, line: { color: "B4B4B4", width: 0.72 } });

// footer logos (the deck's frame pictures, bottom right next to the page number), from the deck file itself
try {
  const deck = path.join(__dirname, "../../../../../Templates/Case-2019-Polaris.pptx");
  const pic = (name, mime) => "data:" + mime + ";base64," + execFileSync("unzip", ["-p", deck, "ppt/media/" + name]).toString("base64");
  slide.addImage({ data: pic("image5.jpg", "image/jpeg"), x: 10.75, y: 7.24, w: 1.07, h: 0.21 });
  slide.addShape("line", { x: 11.91, y: 7.26, w: 0, h: 0.21, line: { color: "B4B4B4", width: 0.72 } });
  slide.addImage({ data: pic("image4.png", "image/png"), x: 11.85, y: 7.12, w: 0.96, h: 0.38 });
} catch (e) { console.error("logos skipped:", e.message); }

L.save(pres, __dirname + "/candidate.pptx").then(() => console.log("saved"));
