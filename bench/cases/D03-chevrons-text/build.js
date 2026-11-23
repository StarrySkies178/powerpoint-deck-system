const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Deloitte-timesaver", title: "Text boxes", subtitle: "Chevrons with text boxes" });
const cw = 9.14 / 4;
for (let i = 0; i < 4; i++) P.txt(slide, [{ text: "This is dummy text it is not here to be read", options: { breakLine: true } }, { text: "This is dummy text it is not here to be read", options: { bullet: true, breakLine: true } }, { text: "This is dummy text it is not here to be read", options: { bullet: { indent: 10 } } }], 0.43 + i * cw, 2.6, cw - 0.12, 1.6, { fontSize: 11, keepSize: true, margin: 0 });
L.save(pres, __dirname + "/candidate.pptx");
