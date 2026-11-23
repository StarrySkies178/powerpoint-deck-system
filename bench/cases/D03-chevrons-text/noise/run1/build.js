// D03 chevrons with text boxes, noise run 1. Frame in the Deloitte reference style; the chevrons are
// slide 14's own stored object (del-014), placed by build.py. Here: the bullet boxes under each chevron.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, HOUSE } = L.start({ ref: "Deloitte-timesaver", title: "Text boxes", subtitle: "Chevrons with text boxes" });

// chevron columns of the stored object del-014 (bbox 0.43 in left, 1.85 in top, 9.14 in wide, 0.64 in tall; 4 chevrons, 2.41 in wide)
const x0 = 392113 / 914400, top = 1691640 / 914400, chevH = 584200 / 914400, chevW = 2206625 / 914400;
const pitch = (8355012 / 914400 - chevW) / 3;
const line = "This is dummy text it is not here to be read";
for (let i = 0; i < 4; i++) {
  const x = x0 + i * pitch;
  slide.addText([0, 1, 2].map((k) => ({ text: line, options: { bullet: { indent: 14 }, breakLine: k < 2 } })), {
    x, y: top + chevH + 0.16, w: chevW - 0.27, h: 1.3, fontFace: "Arial", fontSize: 11, color: P.C.text,
    valign: "top", margin: 0, paraSpaceBefore: 4, isTextBox: true, objectName: "Bullets " + (i + 1),
  });
}
L.save(pres, __dirname + "/candidate.pptx");
