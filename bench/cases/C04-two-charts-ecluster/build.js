const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-E-Cluster", crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " \u2192 " }, title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition", source: "Note: *CTF is the abbreviation for Chow Tai Fook. Sources: Euromonitor International, Lit research, E-Cluster Analysis" });
S.composeSlide(pres, slide, { layout: "T2B1", panels: [
  { headline: "Fine jewelry has a lower growth rate", chart: { type: "stacked", labels: ["2013", "2018", "2023E"], highlight: 1, series: [{ name: "Fine jewelry", values: [53, 72, 99] }, { name: "Fashion jewelry", values: [2, 2, 8] }] },
    note: "CNY Billion. CAGR 13-18 / 18-23: Fashion 23% / 18%, Fine 4% / 5%, Total 4% / 7%" },
  { headline: "Fine jewelry accounts for the majority of CTF*", chart: { type: "column", labels: ["2013", "2018"], highlight: 1, series: [{ name: "CTF's annual revenue", values: [47, 48] }] }, note: "CTF's annual revenue, CNY Billion (CAGR 1%); 2018 revenue: Fine jewelry 89%, Fashion jewelry 11%" },
  { headline: "Major constraints limit the further development of fine jewelry", draw: (s, b) => P.textColumns(s, { items: [
    { label: "Customer changing preference", text: "New emerging customers value the fashion design more and show different preference" },
    { label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption" },
    { label: "Increasingly fierce competition", text: "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment" }] }, b) }] });
L.save(pres, __dirname + "/candidate.pptx");
