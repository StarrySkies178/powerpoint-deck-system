// C02 gantt + risks, Polaris style. Variant c: edit the closest OTHER slide of the reference deck.
// Source slide: Case-2019-Polaris slide 13 (store object case19-polaris-013).
// Why it is the closest: it is the deck's HALF2 slide with a grid on the left (dark-grey header cells over
// grey-banded rows with a label column, i.e. the same row x column structure a Gantt needs) and stacked
// blocks on the right (grey bar headers over white shadowed cards), under two bold centred section headers
// with red rules and a dotted divider. The prompt needs exactly that: a row-by-year grid on the left and
// three stacked challenge/mitigation blocks on the right. Slide 17 (same section) is two charts, slides
// 11/12 are photo and process slides, so 13 carries the most of this content.
// build.js draws the frame (title, source, page) in the Polaris profile plus the section rules and the
// divider, which the stored object does not hold; build.py places and refills the slide-13 shapes.
// Assumption (not in the prompt): the online and omni-channel rows had no years, so they get
// Enter new platforms 2019-20 and Data synchronization 2020-21 as prioritised, the rest as implementation.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
// geometry shared with build.py (keep in step): left panel 60%, right panel 40%
const G = { left: { x: 0.37, w: 7.63 }, right: { x: 8.33, w: 4.68 }, divX: 8.165, ruleY: 1.46 };

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });
  const red = "CC0000", grey = "5C5C5C";
  // section rules under the two headers (slide 13: 1.5 pt red), dotted divider between the halves
  slide.addShape("line", { x: G.left.x, y: G.ruleY, w: G.left.w, h: 0, line: { color: red, width: 1.5 } });
  slide.addShape("line", { x: G.right.x, y: G.ruleY, w: G.right.w, h: 0, line: { color: red, width: 1.5 } });
  slide.addShape("line", { x: G.divX, y: 1.12, w: 0, h: 5.8, line: { color: grey, width: 0.75, dashType: "sysDot" } });
  await L.save(pres, __dirname + "/candidate.pptx");
})();
