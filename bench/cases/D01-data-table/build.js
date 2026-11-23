const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Deloitte-timesaver", title: "Tables", subtitle: "Data table" });
L.save(pres, __dirname + "/candidate.pptx");
