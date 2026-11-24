// Build B: same frame as A, new title and source. The table is case19-polaris-022, refilled and widened in build.py.
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));
(async () => {
  const { pres, slide } = L.start({ ref: "Case-2019-Polaris", title: "Backup: Key assumptions behind the revenue model", source: "Source: Company filings; team analysis" });
  slide.addShape("line", { x: 0, y: 7.205, w: 12.96, h: 0, line: { color: "B4B4B4", width: 1 } });
  // B names no client: the original's client label (PANDORA) and its divider are left out; the team name (Polaris) stays
  slide.addText("Polaris", { x: 12.02, y: 7.25, w: 0.66, h: 0.24, fontFace: "Arial", fontSize: 13, bold: true, color: "CC0000", align: "left", valign: "middle", margin: 0, objectName: "logo label" });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
