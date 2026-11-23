const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Deloitte-timesaver", title: "柱形图", subtitle: "成对比较", source: "来源:公司财报,团队分析" });
P.txt(slide, "三个区域的销售额对比", 0.4, 1.62, 6, 0.3, { fontSize: 10, keepSize: true, bold: true, margin: 0 });
L.save(pres, __dirname + "/candidate.pptx");
