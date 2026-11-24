// C03 rebuild: backup slide, three stacked scenario tables, in the style of Case-2019-Polaris.
// Approach: the deck's style profile (title, red rule, footer, source line) via the harness, and the
// deck's own backup-table form (other backup slides of the deck, layout code TABLE in the slide map):
// red bold header text with no fill, black 1.5 pt rule under the header, grey 0.75 pt row rules,
// bold first column, 12 pt Arial, numbers centred, full body width.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P } = L.start({
  ref: "Case-2019-Polaris",
  title: "Backup: Key assumptions for financial analysis",
  source: "Source: Polaris Analysis",
});
const C = P.C, S = L.HOUSE.STYLE;
const ts = S.table, M = S.margins;
const RED = C.navy, TXT = C.text, GREY = ts.row_rule[0];

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

const x = M.left, w = S.title.rule.w - M.left;       // full body width, right edge on the title rule's end, as on the deck's other backup tables
const firstW = 3.0, colW = [firstW, ...years.map(() => (w - firstW) / years.length)];
const headH = 0.42, rowH = 0.4, gap = 0.36;
const tableH = headH + rowH * 3;
const top = M.body_top + 0.05;
const none = { type: "none" };
const line = (c, pt) => ({ type: "solid", color: c, pt });

cases.forEach((cs, k) => {
  const y = top + k * (tableH + gap);
  const head = [cs.name, ...years].map((t, j) => ({ text: t, options: {
    bold: true, color: RED, align: j ? "center" : "left", valign: "bottom",
    border: [none, none, line(TXT, ts.header_rule[1]), none] } }));
  const body = cs.rows.map((r, i) => r.map((t, j) => ({ text: t, options: {
    bold: j === 0, color: TXT, align: j ? "center" : "left", valign: "middle",
    border: [i === 0 ? line(TXT, ts.header_rule[1]) : none, none,
             i === cs.rows.length - 1 ? line(TXT, 0.75) : line(GREY, ts.row_rule[1]), none] } })));
  slide.addTable([head, ...body], {
    x, y, w, colW, rowH: [headH, rowH, rowH, rowH], h: tableH,
    fontFace: P.THEME.bodyFontFace, fontSize: ts.pt, color: TXT, margin: [0.03, 0.1, 0.03, 0.1],
  });
});

// footer furniture of every content slide in the deck: thin grey line above the source line, and a
// grey separator between the two logos (the logos themselves are added by build.py)
slide.addShape("line", { x: 0, y: 7.217, w: S.title.rule.w, h: 0, line: { color: GREY, width: 0.72 } });
slide.addShape("line", { x: 11.913, y: 7.257, w: 0, h: 0.208, line: { color: GREY, width: 0.72 } });

L.save(pres, __dirname + "/candidate.pptx");
