// C03 variant b: "Backup: Key assumptions for financial analysis", deck as reference (Case-2019-Polaris), leave-one-out.
// Approach: the deck's style profile (title, red title rule, source, page number) via the harness; the body is three
// stacked native tables drawn in the deck's backup-table style (as on the deck's other backup slides 19-21:
// 12 pt Arial, bold red headings, black 1.5 pt rule under the header, grey 0.75 pt row rule, no fills, no verticals).
// The layout description asks for a rule under the header and under the first data row only, so the table is
// drawn here with addTable (P.dataTable "lines" rules every row). Footer furniture (grey rule, client | firm logos)
// is taken from the deck's own backup slides; the logos are read from the reference deck's media at build time.
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));
const ROOT = path.resolve(__dirname, "../../../..");
const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs"))] }));

(async () => {
  const { pres, slide, B, P, prof } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, font = P.THEME.bodyFontFace, tb = prof.table;
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const cases = [
    { name: "High Case", rows: [["#stores", 261, 321, 381, 441, 551], ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"], ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]] },
    { name: "Base Case", rows: [["#stores", 261, 306, 351, 396, 441], ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"], ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]] },
    { name: "Low Base", rows: [["#stores", 261, 306, 351, 391, 431], ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"], ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]] },
  ];

  // geometry: full content width, label column + 5 equal year columns shared by all three tables
  const x = B.x, w = B.w, labelW = 3.2, yrW = (w - labelW) / 5, colW = [labelW, ...years.map(() => yrW)];
  const rowH = 0.34, gap = 0.42, y0 = B.y + 0.12, pt = tb.pt || 12;
  const none = { type: "none" };
  const hdrRule = { type: "solid", color: tb.header_rule[0], pt: tb.header_rule[1] };
  const rowRule = { type: "solid", color: tb.row_rule[0], pt: tb.row_rule[1] };
  const cell = (text, o) => ({ text: String(text), options: { margin: [0, 0.1, 0, 0.1], valign: "middle", ...o } });

  cases.forEach((cs, k) => {
    const head = [cs.name, ...years].map((t, j) => cell(t, {
      bold: true, color: C.navy, align: j ? "right" : "left", border: [none, none, hdrRule, none] }));
    const body = cs.rows.map((r, i) => r.map((t, j) => cell(t, {
      color: C.text, align: j ? "right" : "left", border: [none, none, i === 0 ? rowRule : none, none] })));
    const y = y0 + k * (4 * rowH + gap);
    slide.addTable([head, ...body], { x, y, w, colW, rowH, h: 4 * rowH, fontFace: font, fontSize: pt, color: C.text, valign: "middle",
      objectName: "table " + cs.name });
  });

  // footer furniture of the deck's backup slides: thin grey rule, then client logo | firm logo left of the page number
  const ft = prof.source_line, pg = prof.page;
  slide.addShape(pres.shapes.LINE, { x: 0, y: ft.y - 0.02, w: pg.right - 0.01, h: 0, line: { color: tb.row_rule[0], width: 0.72 } });
  const zip = await JSZip.loadAsync(require("fs").readFileSync(path.join(ROOT, "Templates/Case-2019-Polaris.pptx")));
  const img = async (p, mime) => mime + ";base64," + (await zip.file(p).async("base64"));
  const client = await img("ppt/media/image5.jpg", "image/jpeg"), firm = await img("ppt/media/image4.png", "image/png");
  slide.addImage({ data: client, x: 10.749, y: 7.242, w: 1.07, h: 0.213 });
  slide.addShape(pres.shapes.LINE, { x: 11.914, y: 7.257, w: 0, h: 0.208, line: { color: tb.row_rule[0], width: 0.72 } });
  slide.addImage({ data: firm, x: 11.855, y: 7.117, w: 0.958, h: 0.383 });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
