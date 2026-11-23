const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Deloitte-timesaver", title: "Waterfall", subtitle: "Columns", source: "Quote source descriptor: This is dummy text" });
P.txt(slide, "Chart title goes here", 0.4, 1.62, 6, 0.3, { fontSize: 10, keepSize: true, bold: true, margin: 0 });
L.save(pres, __dirname + "/candidate.pptx");
