// C03 (deck as reference, leave-one-out): "Backup: Key assumptions for financial analysis" in the Case-2019-Polaris style.
// Approach: Polaris style profile (title, red rule, source, page, fonts, colours) + three native tables drawn in the form of
// the deck's other backup tables (Polaris 19-21: red bold header text, black 1.5 pt header rule, grey 0.75 pt row rules,
// bold first column, centred numbers, 12 pt). The footer furniture the profile does not carry (grey footer rule,
// client | team logos, page number) is copied from the same backup slides' frame.
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs"))] }));

const TITLE = "Backup: Key assumptions for financial analysis";
const YEARS = ["2019", "2020", "2021", "2022", "2023"];
const CASES = [
  { name: "High Case", rows: [["#stores", "261", "321", "381", "441", "551"], ["Organic Growth(%)", "4%", "8%", "10%", "12%", "15%"], ["Online Growth(%)", "31%", "41%", "40%", "45%", "38%"]] },
  { name: "Base Case", rows: [["#stores", "261", "306", "351", "396", "441"], ["Organic Growth(%)", "4%", "8%", "10%", "10%", "12%"], ["Online Growth(%)", "31%", "32%", "32%", "30%", "30%"]] },
  { name: "Low Base", rows: [["#stores", "261", "306", "351", "391", "431"], ["Organic Growth(%)", "4%", "4%", "4%", "3%", "5%"], ["Online Growth(%)", "31%", "29%", "29%", "27%", "25%"]] },
];

(async () => {
  const { pres, slide, P, HOUSE, prof } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
  const C = P.C, F = P.THEME.bodyFontFace, W = P.W;
  const red = C.accent, black = C.text, ruleGrey = (prof.table.row_rule || ["B4B4B4"])[0];
  const pt = prof.table.pt || 12;

  // ---- three stacked tables, full content width
  const x = prof.margins.left, w = W - prof.margins.left - (W - 12.97);   // ends where the title rule ends (12.97 in)
  const top = 1.12, bottom = 6.98, hdrH = 0.46, rowH = 0.42;
  const tH = hdrH + 3 * rowH, gap = (bottom - top - 3 * tH) / 2;
  const firstW = 3.1, colW = [firstW, ...YEARS.map(() => (w - firstW) / YEARS.length)];
  const NONE = { type: "none" };
  const hdrB = [NONE, NONE, { type: "solid", color: black, pt: 1.5 }, NONE];
  const rowB = [NONE, NONE, { type: "solid", color: ruleGrey, pt: 0.75 }, NONE];
  const M = [0.02, 0.1, 0.02, 0.1];
  CASES.forEach((cs, k) => {
    const y = top + k * (tH + gap);
    const head = [cs.name, ...YEARS].map((t, j) => ({ text: t, options: { bold: true, color: red, fontSize: pt, align: j ? "center" : "left", valign: "bottom", border: hdrB, margin: M } }));
    const body = cs.rows.map((r) => r.map((t, j) => ({ text: t, options: { bold: j === 0, color: black, fontSize: pt, align: j ? "center" : "left", valign: "middle", border: rowB, margin: M } })));
    slide.addTable([head, ...body], { x, y, w, colW, rowH: [hdrH, rowH, rowH, rowH], h: tH, fontFace: F, fontSize: pt, color: black });
  });

  // ---- footer frame of the deck's backup slides (Polaris 19-21): grey rule, logos, page number
  slide.addShape("line", { x: 0, y: 7.217, w: 12.97, h: 0, line: { color: ruleGrey, width: 0.72 } });
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, "../../../../../Templates/Case-2019-Polaris.pptx")));
  const media = async (n) => "data:image/" + (n.endsWith("png") ? "png" : "jpeg") + ";base64," + (await zip.file("ppt/media/" + n).async("base64"));
  slide.addImage({ data: await media("image5.jpg"), x: 10.749, y: 7.242, w: 1.07, h: 0.213 });   // client logo
  slide.addShape("line", { x: 11.914, y: 7.257, w: 0, h: 0.208, line: { color: ruleGrey, width: 0.72 } });
  slide.addImage({ data: await media("image4.png"), x: 11.855, y: 7.117, w: 0.958, h: 0.383 });  // team logo
  // page number: the layout slide-number field; build.py turns it into the page the prompt gives

  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
