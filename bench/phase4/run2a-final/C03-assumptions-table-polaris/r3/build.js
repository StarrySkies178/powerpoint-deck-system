// C03 rebuild 3: backup table of scenario assumptions, in the style of Case-2019-Polaris (deck as reference, leave-one-out).
// Form: three stacked `ruled` tables, the deck's own backup-table form (Style/table-forms.md: Polaris backup tables are ruled,
// red bold header text over one black rule, grey row rules, first column bold, numbers centred).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "Backup: Key assumptions for financial analysis",
    source: "Source: Polaris Analysis",
  });
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const cases = [
    ["High Case", ["261", "321", "381", "441", "551"], ["4%", "8%", "10%", "12%", "15%"], ["31%", "41%", "40%", "45%", "38%"]],
    ["Base Case", ["261", "306", "351", "396", "441"], ["4%", "8%", "10%", "10%", "12%"], ["31%", "32%", "32%", "30%", "30%"]],
    ["Low Base", ["261", "306", "351", "391", "431"], ["4%", "4%", "4%", "3%", "5%"], ["31%", "29%", "29%", "27%", "25%"]],
  ];
  const W = 12.6;                       // tables end under the end of the title rule (12.97 in), as the deck's backup tables do
  const gap = 0.3, n = cases.length, h = (B.h - (n - 1) * gap) / n;
  const colW = [0.28, 0.144, 0.144, 0.144, 0.144, 0.144];
  cases.forEach(([name, st, org, onl], i) => {
    P.table(slide, {
      form: "ruled",
      header: [name, ...years],
      rows: [["#stores", ...st], ["Organic Growth(%)", ...org], ["Online Growth(%)", ...onl]],
      colW,
    }, { x: B.x, y: B.y + i * (h + gap), w: W, h });
  });
  // the deck's footer on every content slide: PANDORA | Polaris logos bottom right, grey hairline between them
  // (the profile has no footer, so they are placed here; logo files taken from the reference deck's media)
  const path = require("path");
  slide.addImage({ path: path.join(__dirname, "logo-pandora.jpg"), x: 10.749, y: 7.242, w: 1.07, h: 0.213 });
  slide.addShape("line", { x: 11.913, y: 7.257, w: 0, h: 0.208, line: { color: "B4B4B4", width: 0.72 } });
  slide.addImage({ path: path.join(__dirname, "logo-polaris.png"), x: 11.855, y: 7.117, w: 0.958, h: 0.383 });
  const out = __dirname + "/candidate.pptx";
  await L.save(pres, out);
  // page number as in the prompt ("Page 22"): the deck numbers its pages, so this one-slide file starts counting at 22
  const fs = require("fs"), JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));   // as Generators/house.js loads it
  const zip = await JSZip.loadAsync(fs.readFileSync(out));
  let px = await zip.file("ppt/presentation.xml").async("string");
  px = px.replace(/<p:presentation\b([^>]*?)(\s*firstSlideNum="\d+")?>/, (m, a) => `<p:presentation${a} firstSlideNum="22">`);
  zip.file("ppt/presentation.xml", px);
  // LibreOffice ignores firstSlideNum, so the slide's own number field also carries 22 as plain text
  let sx = await zip.file("ppt/slides/slide1.xml").async("string");
  sx = sx.replace(/<a:fld\b[^>]*type="slidenum"[^>]*>(<a:rPr\b[^>]*\/>)<a:t>\d+<\/a:t><\/a:fld>/, (m, r) => `<a:r>${r}<a:t>22</a:t></a:r>`);
  zip.file("ppt/slides/slide1.xml", sx);
  fs.writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
})();
