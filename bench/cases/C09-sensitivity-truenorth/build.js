const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic" });
const yrs = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const mk = (tot, pola) => [{ name: "pola", values: pola }, { name: "Jurlique", values: tot.map((t, i) => +(t - pola[i]).toFixed(2)) }];
S.composeSlide(pres, slide, { layout: "BAND2", numbered: false, panels: [
  { headline: "Normal Scenario (¥M; CAGR 2015-2021: Jurlique 15%, pola 25%)", chart: { type: "stacked", labels: yrs, highlight: 1, format: "0.0", series: mk([0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58]) } },
  { headline: "Optimistic Scenario (¥M; CAGR 2015-2021: Jurlique 19%, pola 27%)", chart: { type: "stacked", labels: yrs, highlight: 1, format: "0.0", series: mk([0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78]) } }] });
L.save(pres, __dirname + "/candidate.pptx");
