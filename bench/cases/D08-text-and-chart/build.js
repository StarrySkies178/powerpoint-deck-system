const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Deloitte-timesaver", title: "Column charts", subtitle: "Stacked bar chart and text", source: "Quote source descriptor: This is dummy text" });
const l1 = "This is a level one bullet this is dummy text it is not here to be read", l2 = "This is a level two bullet";
P.txt(slide, [...[l1, l1, l1].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } })), ...[l2, l2, l2].map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, indentLevel: 1, breakLine: i < 2 } }))], 0.42, 1.95, 4.7, 4.6, { fontSize: 18, keepSize: true });
L.save(pres, __dirname + "/candidate.pptx");
