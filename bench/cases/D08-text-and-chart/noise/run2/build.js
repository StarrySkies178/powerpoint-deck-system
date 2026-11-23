// D08 text + chart, attempt 2: Deloitte-timesaver slide 59 look.
// Frame from the reference style profile; left bullets drawn here; the chart is the slide's own stored object (build.py).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P } = L.start({
  ref: "Deloitte-timesaver",
  title: "Column charts",
  subtitle: "Stacked bar chart and text",
  source: "Quote source descriptor: This is dummy text",
});
const C = P.C;
const L1 = "This is a level one bullet this is dummy text it is not here to be read";
const L2 = "This is a level two bullet";
const runs = [];
for (let i = 0; i < 3; i++) runs.push({ text: L1, options: { bullet: { indent: 21.6 }, paraSpaceBefore: 12, breakLine: true } });
for (let i = 0; i < 3; i++) runs.push({ text: L2, options: { bullet: { characterCode: "2212", indent: 21.6 }, indentLevel: 1, paraSpaceBefore: 12, breakLine: i < 2 } });
// left text column: same box as the reference's body text, reference body size for this layout (18 pt)
slide.addText(runs, {
  x: 0.41, y: 1.98, w: 4.53, h: 4.6, fontFace: "Arial", fontSize: 18, color: C.text,
  valign: "top", margin: 0, isTextBox: true, objectName: "Bullets",
});
L.save(pres, __dirname + "/candidate.pptx");
