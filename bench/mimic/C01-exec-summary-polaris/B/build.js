// C01 open-book mimic, build B (changed content, one stage column more: 4 instead of 3).
// build.js: frame + the lines the stored object lost, laid out for n columns; writes layout.json (geometry + content)
// for build.py, which places the stored object case19-polaris-002 re-laid out for 4 columns and refilled.
const path = require("path"), fs = require("fs");
const ROOT = path.resolve(__dirname, "../../../..");
const L = require(path.join(ROOT, "bench/lib/bench_lib.js"));
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));

const CONTENT = {
  title: "Executive Summary: Lumière’s path to profitable growth in Southeast Asia skincare through hero products, social commerce and a loyalty program",
  source: "Source: Polaris Analysis; Euromonitor 2026",
  rowLabels: [["Analysis", "Modules"], ["Implications"]],
  columns: [
    { head: "Market", items: [["Market Sizing", 0], ["Category Growth", 1], ["Price Tiers", 1], ["Channel Mix", 0], ["Competitors", 0]] },
    { head: "Customer", items: [["Segments", 0], ["Purchase Journey", 1], ["Discovery", 1], ["Repeat Buying", 1], ["Pain Points", 0]] },
    { head: "Strategy Design", items: [["Product Focus", 0], ["Hero SKUs", 1], ["Bundles", 1], ["Channel Shift", 0], ["Social Commerce", 1], ["Pharmacy Chains", 1], ["Loyalty Program", 0]] },
    { head: "Roll-out", items: [["Launch Waves", 0], ["Budget & ROI", 0], ["Risk Controls", 0]] },
  ],
  // implications: which columns each one spans, and its text as runs [text, bold]
  implications: [
    { cols: [0, 1], runs: [["Lumière should target the mid-price tier, where young urban buyers switch brands most", false]] },
    { cols: [2, 3], runs: [["As “", false], ["clean science you can feel", true], ["”, Lumière should lead with hero SKUs and social selling", false]] },
  ],
  bar: "Reach US$120M revenue and break-even in Southeast Asia skincare by 2027",
};

// geometry (EMU), from the original slide: the arrows span X0..X1, gaps and tip depth kept, widths shared out
const E = 914400, emu = (v) => v / E;
const X0 = 2113026, X1 = 11857736, GAP = 448056, n = CONTENT.columns.length;
const wA = Math.round((X1 - X0 - (n - 1) * GAP) / n);
const arrows = CONTENT.columns.map((_, i) => X0 + i * (wA + GAP));
const dividers = arrows.slice(0, -1).map((x) => x + wA + GAP / 2);
const spanEdge = (c) => [arrows[c[0]], arrows[c[c.length - 1]] + wA];
const longDiv = CONTENT.implications.slice(0, -1).map((im) => dividers[im.cols[im.cols.length - 1]]);
const geo = { n, wA, arrows, dividers, longDiv,
  spans: CONTENT.implications.map((im) => spanEdge(im.cols)) };
geo.rules = geo.spans.map(([a], k) => [k === 0 ? a + 64769 : longDiv[k - 1] + 333756,     // offsets as on the original
  k === geo.spans.length - 1 ? 11746864 : longDiv[k] - 300863]);

const GREY = "5C5C5C", RULE = "B4B4B4";
(async () => {
  const { pres, slide } = L.start({ ref: "Case-2019-Polaris", title: CONTENT.title, source: CONTENT.source });
  const line = (x, y, w, h, color, dash) => slide.addShape("line", {
    x: emu(x), y: emu(y), w: emu(w), h: emu(h), line: { color, width: 0.72, dashType: dash || "solid" } });
  // dashed dividers: through both rows where an implication ends, through the analysis row elsewhere
  dividers.forEach((x) => line(x, 1862327, 0, longDiv.includes(x) ? 3827145 : 2379980, GREY, "sysDash"));
  // grey rules under the analysis row, one per implication (the double chevrons sit on them), and over the bar
  geo.rules.forEach(([x0, x1]) => line(x0, 4407408, x1 - x0, 0, GREY));
  line(2177795, 5818632, 9530080, 0, GREY);
  line(0, 6598919, 11857355, 0, RULE);
  // team logo (a picture in the reference deck); the client logo of the original is not this client's, so it is left out
  const z = await JSZip.loadAsync(fs.readFileSync(path.join(ROOT, "Templates/Case-2019-Polaris.pptx")));
  slide.addImage({ data: "image/png;base64," + (await z.file("ppt/media/image4.png").async("base64")),
    x: emu(10840211), y: emu(6507480), w: emu(876300), h: emu(350518) });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
  fs.writeFileSync(path.join(__dirname, "layout.json"), JSON.stringify({ content: CONTENT, geo }, null, 1));
})();
