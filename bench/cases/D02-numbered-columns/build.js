const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Deloitte-timesaver", title: "Text boxes", subtitle: "Two columns of numbered points for each point" });
const t = "This is dummy text it is not here to be read";
[0, 1].forEach((c) => [0, 1, 2, 3, 4].forEach((r) => P.txt(slide, [{ text: t, options: { bullet: true, breakLine: true } }, { text: t, options: { bullet: { indent: 12 }, indentLevel: 1 } }],
  0.9 + c * 4.7, 1.9 + r * 1.1, 4.1, 0.7, { fontSize: 11, keepSize: true, margin: 0 })));
L.save(pres, __dirname + "/candidate.pptx");
