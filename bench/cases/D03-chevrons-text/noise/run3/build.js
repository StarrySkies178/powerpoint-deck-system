// D03 chevrons with text boxes, run 3: Deloitte timesaver slide 14 look.
// build.js draws the frame (title, footer, page) in the reference style and the four bullet text boxes;
// build.py places slide 14's own chevron object (del-014) with its original colours and refills it.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, HOUSE } = L.start({ ref: "Deloitte-timesaver", title: "Text boxes", subtitle: "Chevrons with text boxes" });

// Columns under the chevrons: same left edges as the stored chevrons (del-014 bbox 0.43 in, 4 x 2.41 in, step ~2.24 in)
const xs = [0.43, 2.68, 4.91, 7.15], colW = 2.14, y = 2.65, h = 1.5;
const dummy = "This is dummy text it is not here to be read";
for (const x of xs) {
  const runs = [0, 1, 2].map((i) => ({
    text: dummy,
    options: { bullet: { indent: 14 }, breakLine: i < 2, paraSpaceBefore: i ? 4 : 0 },
  }));
  slide.addText(runs, {
    x, y, w: colW, h, fontFace: HOUSE.FONT.latin, fontSize: 11, color: P.C.text,
    align: "left", valign: "top", margin: 0, isTextBox: true,
  });
}
L.save(pres, __dirname + "/candidate.pptx");
