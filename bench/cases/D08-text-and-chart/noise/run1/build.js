// D08 text + chart, noise run 1: Deloitte timesaver slide 59 ("Column charts / Stacked bar chart and text").
// Frame (two-line title, source, footer, page number) from the reference's style profile;
// left: the level-one / level-two bullet text in the reference's body style (no generator for plain bullets, built by hand);
// right: chart title + stacked column chart come from the slide's own stored object, placed by build.py.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P } = L.start({
  ref: "Deloitte-timesaver",
  title: "Column charts",
  subtitle: "Stacked bar chart and text",
  source: "Quote source descriptor: This is dummy text",
});
const L1 = "This is a level one bullet this is dummy text it is not here to be read";
const L2 = "This is a level two bullet";
const para = (t, lvl) => ({
  text: t,
  options: {
    bullet: lvl ? { characterCode: "2212", indent: 13.1 } : { code: "2022", indent: 21.6 },
    indentLevel: lvl, paraSpaceBefore: 12, breakLine: true,
  },
});
const paras = [para(L1, 0), para(L1, 0), para(L1, 0), para(L2, 1), para(L2, 1), para(L2, 1)];
paras[paras.length - 1].options.breakLine = false;
slide.addText(paras, {
  x: 0.41, y: 1.98, w: 4.53, h: 4.6, fontFace: "Arial", fontSize: 18, color: "313131",
  margin: 0, valign: "top", isTextBox: true, objectName: "Body text",
});
L.save(pres, __dirname + "/candidate.pptx");
