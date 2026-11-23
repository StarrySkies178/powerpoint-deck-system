const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic" });
// layout: sibling slide 23 of the deck (scenario heading, stacked chart 7.33 in wide, CAGR column at x 8.38), used twice one above the other
const yrs = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const mk = (tot, pola) => [{ name: "pola", values: pola }, { name: "Jurlique", values: tot.map((t, i) => +(t - pola[i]).toFixed(2)) }];
const scen = [["Normal Scenario", [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], ["15%", "25%"]],
              ["Optimistic Scenario", [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], ["19%", "27%"]]];
const top = B.y, bh = (B.h - 0.1) / 2;
scen.forEach(([name, tot, pola, cagr], i) => {
  const y = top + i * (bh + 0.1);
  P.txt(slide, name, 0.6, y, 4, 0.35, { fontSize: 18, noScale: true, bold: true, margin: 0 });
  S.chartIn(pres, slide, { type: "stacked", labels: yrs, highlight: 1, format: "0.0", legendPos: "t", series: mk(tot, pola) }, { x: 0.6, y: y + 0.35, w: 7.33, h: bh - 0.35 });
  P.txt(slide, "CAGR\n2015-2021", 8.38, y + 0.2, 1.0, 0.45, { fontSize: 11, noScale: true, align: "center", margin: 0, color: P.C.g5 });
  cagr.forEach((c, j) => P.txt(slide, c, 8.38, y + 0.9 + j * 0.55, 1.0, 0.35, { fontSize: 12, noScale: true, align: "center", margin: 0 }));
});
L.save(pres, __dirname + "/candidate.pptx");
