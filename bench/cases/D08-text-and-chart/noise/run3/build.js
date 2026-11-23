// D08 text and chart, noise run 3. Named slide: Deloitte timesaver slide 59.
// build.js draws the frame in the reference style and the left bullet text;
// build.py places slide 59's own stored chart object (del-059) on the right and refills its data.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P } = L.start({
  ref: "Deloitte-timesaver",
  title: "Column charts",
  subtitle: "Stacked bar chart and text",
  source: "Quote source descriptor: This is dummy text",
});

// Left: bullets in the reference's body list style (18 pt, dark grey text slot, 12 pt before each paragraph,
// level one "•", level two "−" further in), box at the reference's left text column.
const TEXT = "313131";
const L1 = "This is a level one bullet this is dummy text it is not here to be read";
const L2 = "This is a level two bullet";
const runs = [];
for (let i = 0; i < 3; i++) runs.push({ text: L1, options: { bullet: { code: "2022", indent: 21.6 }, indentLevel: 0, breakLine: true } });
for (let i = 0; i < 3; i++) runs.push({ text: L2, options: { bullet: { code: "2212", indent: 13.1 }, indentLevel: 1, breakLine: i < 2 } });
slide.addText(runs, {
  x: 0.41, y: 1.98, w: 4.53, h: 4.6,
  fontFace: "Arial", fontSize: 18, color: TEXT,
  margin: 0, valign: "top", paraSpaceBefore: 12, isTextBox: true, objectName: "Body bullets",
});

L.save(pres, __dirname + "/candidate.pptx");
