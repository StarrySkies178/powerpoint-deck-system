const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Case-2019-Polaris", title: "Backup: Key assumptions for financial analysis", source: "Source: Polaris Analysis" });
const T = [["High Case", [261, 321, 381, 441, 551], ["4%", "8%", "10%", "12%", "15%"], ["31%", "41%", "40%", "45%", "38%"]],
  ["Base Case", [261, 306, 351, 396, 441], ["4%", "8%", "10%", "10%", "12%"], ["31%", "32%", "32%", "30%", "30%"]],
  ["Low Base", [261, 306, 351, 391, 431], ["4%", "4%", "4%", "3%", "5%"], ["31%", "29%", "29%", "27%", "25%"]]];
const h = (B.h - 0.4) / 3;
T.forEach(([name, s, o, on], i) => P.dataTable(slide, { header: [name, "2019", "2020", "2021", "2022", "2023"], rows: [["#stores", ...s], ["Organic Growth(%)", ...o], ["Online Growth(%)", ...on]] }, { x: B.x, y: B.y + i * (h + 0.2), w: B.w, h }));
L.save(pres, __dirname + "/candidate.pptx");
