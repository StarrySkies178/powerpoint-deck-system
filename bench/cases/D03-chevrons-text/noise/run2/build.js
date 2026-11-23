// D03 chevrons with text, attempt 2: Deloitte timesaver slide 14 look.
// build.js draws the frame in the reference style and the bullets; build.py places slide 14's own
// stored chevron object (del-014) with its original colours (first chevron highlighted) and refills it.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, HOUSE, prof } = L.start({ ref: "Deloitte-timesaver", title: "Text boxes", subtitle: "Chevrons with text boxes" });

// chevron row of the stored object del-014: x 0.43 in, top 1.85 in, w 9.14 in, h 0.64 in, 4 chevrons
const EMU = 914400, bb = [392113, 1691640, 8355012, 584200].map((v) => v / EMU);
const n = 4, chevW = 2206625 / EMU, pitch = (bb[2] - chevW) / (n - 1);
const top = bb[1] + bb[3] + 0.16;
const body = (prof && prof.body) || { pt: 11, text: "313131" };
const line = "This is dummy text it is not here to be read";
for (let i = 0; i < n; i++) {
  const runs = [0, 1, 2].map(() => ({ text: line, options: { bullet: { indent: 14 }, breakLine: true, paraSpaceBefore: 6 } }));
  slide.addText(runs, {
    x: bb[0] + i * pitch, y: top, w: pitch - 0.1, h: 1.3,
    fontFace: HOUSE.FONT.latin, fontSize: body.pt, color: body.text,
    valign: "top", align: "left", margin: 0, isTextBox: true, objectName: "chevron text " + (i + 1),
  });
}
L.save(pres, __dirname + "/candidate.pptx");
