// C06 variant c: Executive Summary in the Case-2019-Mindcraft style.
// Closest other slide: Mindcraft slide 2 (Agenda). It is the deck's other text-only meta slide with a plain
// one-word title and no breadcrumb, and its left half is exactly a list of four numbered items
// (dark-grey number square + light-grey F1F1F1 bar). The four summary paragraphs map one-to-one onto
// those four items. build.py takes that slide's stored object (case19-mindcraft-002), drops its
// abbreviations box, stretches the four squares and bars across the body and refills the bars with the
// paragraphs. build.js only draws the deck frame (title, red rule, logo, page) from the style profile.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
(async () => {
  const { pres, slide } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  // grey footer rule the deck carries above its logo line (not in the profile's master)
  slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "D5D5D5", width: 0.75 } });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
