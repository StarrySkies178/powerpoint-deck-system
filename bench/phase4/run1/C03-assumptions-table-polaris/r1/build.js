// C03 run1 r1: "Backup: Key assumptions for financial analysis", deck as reference (Case-2019-Polaris, leave-one-out).
// Approach: the deck's style profile (title, red rule, source, page number) + native tables in the look of the deck's
// other backup tables (slides 19-21, appendix TABLE layout): red bold header text, no fill, black rule under the header,
// grey hairlines between rows, bold first column, values centred. Three scenario tables stacked over the body.
// Footer furniture of the deck (grey footer line, PANDORA | Polaris logos) taken from slide 19 (logo files in this folder).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, HOUSE, prof } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});

const RED = prof.roles.main;                       // CC0000
const TXT = prof.roles.text;                       // 000000
const ROW = prof.table.row_rule;                   // ["B4B4B4", 0.75]
const HDR = [TXT, 1.5];                            // header rule as on the deck's backup tables
const PT = prof.table.pt;                          // 12 pt, the deck's table size
const FONT = prof.fonts.latin;

const years = ["2019", "2020", "2021", "2022", "2023"];
const cases = [
  { name: "High Case", rows: [
    ["#stores", "261", "321", "381", "441", "551"],
    ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"],
    ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]] },
  { name: "Base Case", rows: [
    ["#stores", "261", "306", "351", "396", "441"],
    ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"],
    ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]] },
  { name: "Low Base", rows: [
    ["#stores", "261", "306", "351", "391", "431"],
    ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"],
    ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]] },
];

// geometry: the deck's backup tables run from the left margin to the slide's right edge area (0.37 .. 12.97 in)
const X = prof.margins.left, Wt = 12.97 - X;
const firstW = 3.1, colW = [firstW, ...years.map(() => (Wt - firstW) / years.length)];
const rowH = 0.42, gap = 0.36;
const top = prof.title.rule.y + 0.18;              // just under the red title rule
const none = { type: "none" };
const cell = (text, o, bottom) => ({ text, options: { fontFace: FONT, fontSize: PT, color: TXT, valign: "middle",
  margin: [0, 0.1, 0, 0.1], border: [none, none, bottom, none], ...o } });

cases.forEach((c, k) => {
  const hRule = { type: "solid", color: HDR[0], pt: HDR[1] }, rRule = { type: "solid", color: ROW[0], pt: ROW[1] };
  const header = [cell(c.name, { bold: true, color: RED, align: "left" }, hRule),
    ...years.map((y) => cell(y, { bold: true, color: RED, align: "center" }, hRule))];
  const body = c.rows.map((r) => r.map((v, j) => cell(v, { bold: j === 0, align: j ? "center" : "left" }, rRule)));
  const y = top + k * (4 * rowH + gap);
  slide.addTable([header, ...body], { x: X, y, w: Wt, colW, rowH, h: 4 * rowH, fontFace: FONT, fontSize: PT, objectName: "table " + c.name });
});

// deck footer: grey hairline over the footer, client | team logos at the bottom right
const here = (f) => path.join(__dirname, f);
slide.addShape("line", { x: 0, y: 7.217, w: 12.967, h: 0, line: { color: "B4B4B4", width: 0.72 } });
slide.addImage({ path: here("logo-pandora.jpg"), x: 10.749, y: 7.242, w: 1.070, h: 0.213 });
slide.addShape("line", { x: 11.913, y: 7.257, w: 0, h: 0.208, line: { color: "B4B4B4", width: 0.72 } });
slide.addImage({ path: here("logo-polaris.png"), x: 11.855, y: 7.117, w: 0.958, h: 0.383 });

L.save(pres, __dirname + "/candidate.pptx");
