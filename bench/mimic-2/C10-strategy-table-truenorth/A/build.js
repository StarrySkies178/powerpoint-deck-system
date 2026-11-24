// C10 open-book mimic, build A (same content).
// build.js draws the frame (title band, title, source) with the harness and the reference profile,
// plus the few frame pieces the profile does not cover (red-separator breadcrumb, grey source band,
// column header labels). build.py then places the slide's stored object (case-truenorth-pola-008),
// refilled with clean text, and the deck's logo picture (from case-truenorth-pola-004).
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));

const CONTENT = {
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  crumb: ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], current: 1,
  source: "Source: TrueNorth Analysis",
  // header labels, centred on the four grey header boxes of the stored object (x, w in inches)
  heads: [["Current situation", 0.097, 3.048], ["Key strategies & initiatives", 3.195, 3.651],
          ["Risks", 6.896, 1.527], ["Mitigation", 8.473, 1.364]],
};

async function drawFrame(C, out) {
  const { pres, slide } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: C.title, source: C.source });
  // breadcrumb as the deck draws it: grey sections, current one black, red triangles between
  const runs = [];
  C.crumb.forEach((t, i) => {
    if (i) runs.push({ text: "  ►  ", options: { color: "CC1B00", fontSize: 12 } });
    runs.push({ text: t, options: { color: i === C.current ? "000000" : "BEBEBE" } });
  });
  slide.addText(runs, { x: 0.37, y: 0.045, w: 7.6, h: 0.3, fontFace: "Calibri", fontSize: 14, margin: 0, valign: "middle", isTextBox: true, objectName: "crumb" });
  // grey band behind the source line (moved behind the source by build.py)
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" }, objectName: "srcBand" });
  // column header labels (white bold on the object's grey header boxes; brought to the front by build.py)
  C.heads.forEach(([t, x, w]) => slide.addText(t, { x, y: 1.45, w, h: 0.36, fontFace: "Calibri", fontSize: 14, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "hdr" }));
  await L.save(pres, out);
}
module.exports = { CONTENT, drawFrame };

if (require.main === module) drawFrame(CONTENT, path.join(__dirname, "candidate.pptx"));
