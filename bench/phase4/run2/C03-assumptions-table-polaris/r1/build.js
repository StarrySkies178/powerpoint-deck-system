// C03 rebuild: "Backup: Key assumptions for financial analysis", deck as reference (Case-2019-Polaris).
// Form: the deck's backup-table form (Polaris backup tables 19-21: native "lines" table, red bold header text,
// black 1.5 pt rule under the header, grey 0.75 pt row rules, bold first column, centred numbers, 12 pt).
// Three cases are three stacked tables of the same columns, the case name heading each table.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, prof } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});

const RED = prof.roles.main, TXT = prof.roles.text;
const [hrC, hrW] = prof.table.header_rule, [rrC, rrW] = prof.table.row_rule;
const PT = prof.table.pt;   // 12 pt, the deck's table size
const NONE = { type: "none" };
const rule = (c, w) => ({ type: "solid", color: c, pt: w });

const years = ["2019E", "2020E", "2021E", "2022E", "2023E"];
const cases = [
  { name: "High Case", rows: [
    ["#stores", "261", "321", "381", "441", "551"],
    ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"],
    ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"] ] },
  { name: "Base Case", rows: [
    ["#stores", "261", "306", "351", "396", "441"],
    ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"],
    ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"] ] },
  { name: "Low Base", rows: [
    ["#stores", "261", "306", "351", "391", "431"],
    ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"],
    ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"] ] },
];

// body: left/right margins of the profile, from just under the title rule to above the source line
const x = prof.margins.left, w = prof.page.right - x;           // 0.37 .. 12.98 (the backup tables' span)
const top = prof.title.rule.y + 0.17, bottom = prof.source_line.y - 0.2;
const gap = 0.32, n = cases.length;
const rowH = 0.42, headH = 0.46;
const tabH = headH + 3 * rowH;
const y0 = top;   // top-aligned, like the deck's backup tables
const labW = 3.0, colW = [labW, ...years.map(() => (w - labW) / years.length)];

cases.forEach((c, k) => {
  const y = y0 + k * (tabH + gap);
  const head = [c.name, ...years].map((t, j) => ({ text: t, options: {
    bold: true, color: RED, align: j ? "center" : "left", valign: "bottom",
    margin: j ? [0, 0, 0.05, 0] : [0, 0, 0.05, 0.1],
    border: [NONE, NONE, rule(hrC, hrW), NONE] } }));
  const body = c.rows.map((r) => r.map((t, j) => ({ text: t, options: {
    bold: j === 0, color: TXT, align: j ? "center" : "left", valign: "middle",
    margin: j ? 0 : [0, 0, 0, 0.1],
    border: [NONE, NONE, rule(rrC, rrW), NONE] } })));
  slide.addTable([head, ...body], {
    x, y, w, colW, rowH: [headH, rowH, rowH, rowH], h: tabH,
    fontFace: prof.fonts.body, fontSize: PT, color: TXT, objectName: "table " + c.name,
  });
});

// Deck footer furniture, as on every content slide of the deck (e.g. the backup tables 19-21): a thin grey rule
// over the source line and the client | team logo pair at the bottom right. The style profile has no footer
// (profile.footer = null), so it is drawn here, with the logos taken from the reference deck's own media.
const E = 914400;
slide.addShape("line", { x: 0, y: 6598919 / E, w: 11857355 / E, h: 0, line: { color: rrC, width: 0.72 } });
slide.addShape("line", { x: 10893552 / E, y: 6635495 / E, w: 0, h: 190500 / E, line: { color: rrC, width: 0.72 } });
(async () => {
  const path = require("path"), fs = require("fs");
  const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs"))] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, "../../../../../Templates/Case-2019-Polaris.pptx")));
  const img = async (n, mime) => "data:" + mime + ";base64," + (await zip.file("ppt/media/" + n).async("base64"));
  slide.addImage({ data: await img("image5.jpg", "image/jpeg"), x: 9828317 / E, y: 6621778 / E, w: 978323 / E, h: 195071 / E, altText: "client logo" });
  slide.addImage({ data: await img("image4.png", "image/png"), x: 10840211 / E, y: 6507480 / E, w: 876300 / E, h: 350518 / E, altText: "team logo" });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
