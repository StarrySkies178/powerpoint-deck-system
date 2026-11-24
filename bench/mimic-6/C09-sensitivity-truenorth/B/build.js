// Build B (changed content): the frame in the reference's style; build.py then places the stored chart object and the labels.
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));
(async () => {
  const { pres, slide } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth",
    title: "Even the conservative scenario triples combined sales by 2023e, while the optimistic one reaches ¥5.4M" });
  // grey footer bar of the reference master (CCCCCC, full width, 0.29 in high)
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
