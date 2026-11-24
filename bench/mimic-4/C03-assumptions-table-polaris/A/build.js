// Build A: the slide frame from the Polaris profile (title, red rule, source, page number),
// plus the deck's grey footer rule and the logo slot as text labels (no logo file in Brand/logos or the store).
// The table itself is the stored object case19-polaris-022, placed by build.py.
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));
(async () => {
  const { pres, slide } = L.start({ ref: "Case-2019-Polaris", title: "Backup: Key assumptions for financial analysis", source: "Source: Polaris Analysis" });
  // grey footer rule, as on every Polaris content slide (measured: y 7.205 in, x 0 to 12.96 in, #B4B4B4)
  slide.addShape("line", { x: 0, y: 7.205, w: 12.96, h: 0, line: { color: "B4B4B4", width: 1 } });
  // logo slot: company names as text labels (images.md: no official logo file supplied)
  slide.addText("PANDORA", { x: 10.62, y: 7.25, w: 1.25, h: 0.24, fontFace: "Arial", fontSize: 13, color: "000000", align: "right", valign: "middle", margin: 0, charSpacing: 1, objectName: "logo label" });
  slide.addShape("line", { x: 11.95, y: 7.24, w: 0, h: 0.2, line: { color: "B4B4B4", width: 0.75 } });
  slide.addText("Polaris", { x: 12.02, y: 7.25, w: 0.66, h: 0.24, fontFace: "Arial", fontSize: 13, bold: true, color: "CC0000", align: "left", valign: "middle", margin: 0, objectName: "logo label" });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
