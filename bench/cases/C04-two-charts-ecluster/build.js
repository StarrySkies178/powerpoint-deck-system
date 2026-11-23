const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-E-Cluster", crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " \u2192 " }, title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition", source: "Note: *CTF is the abbreviation for Chow Tai Fook. Sources: Euromonitor International, Lit research, E-Cluster Analysis" });
// layout: sibling slide 5 of the deck (scripts/layout_skeleton.py + its panel numbers): panels at x 0.26 / 6.86, third panel from y 4.92
S.composeSlide(pres, slide, { regions: [{ x: 0.26, y: 1.43, w: 6.4, h: 3.35 }, { x: 6.86, y: 1.43, w: 6.2, h: 3.35 }, { x: 0.26, y: 4.92, w: 12.8, h: 1.75 }], panels: [
  { headline: "Fine jewelry has a lower growth rate", draw: (s, b) => S.stackedCagr(pres, s, { unit: "China fine jewelry annual market size and growth, CNY Billion", periods: ["2013", "2018", "2023E"],
      series: [{ name: "Fine jewelry", values: [53, 72, 99] }, { name: "Fashion jewelry", values: [2, 2, 8] }], highlight: 1,
      cagr: { headers: ["13-18", "18-23"], rows: [["4%", "5%"], ["23%", "18%"]] } }, b) },
  { headline: "Fine jewelry accounts for the majority of CTF*", draw: (s, b) => {
      const hw = b.w * 0.52;
      S.chartIn(pres, s, { type: "column", labels: ["2013", "2018"], series: [{ name: "CTF's annual revenue, CNY Billion", values: [47, 48] }], highlight: 1 }, { x: b.x, y: b.y + 0.45, w: hw - 0.2, h: b.h - 0.45 });
      P.txt(s, "CTF's annual revenue, CNY Billion (CAGR 1%)", b.x, b.y, hw - 0.2, 0.45, { max: 14, min: 11, noScale: true, margin: 0 });
      S.chartIn(pres, s, { type: "stacked100", labels: ["2018"], series: [{ name: "Fashion jewelry", values: [11] }, { name: "Fine jewelry", values: [89] }], highlight: 1, format: "0\"%\"" }, { x: b.x + hw, y: b.y + 0.45, w: b.w - hw, h: b.h - 0.45 });
      P.txt(s, "CTF's 2018 revenue by segment, %", b.x + hw, b.y, b.w - hw, 0.45, { max: 14, min: 11, noScale: true, margin: 0 }); } },
  { headline: "Major constraints limit the further development of fine jewelry", draw: (s, b) => {
    // the deck's cards: grey band, bold label + body text at the deck's body size (14 pt), thin dividers
    const it = [["Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
      ["Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
      ["Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"]];
    s.addShape("rect", { x: b.x, y: b.y, w: b.w, h: b.h, fill: { color: P.C.g1 }, line: { type: "none" } });
    const cw = b.w / 3;
    it.forEach(([l, t], k) => { const x = b.x + k * cw;
      if (k) s.addShape("line", { x, y: b.y + 0.1, w: 0, h: b.h - 0.2, line: { color: P.C.g3, width: 0.75 } });
      P.txt(s, l, x + 0.15, b.y + 0.05, cw - 0.3, 0.35, { fontSize: 14, noScale: true, bold: true, margin: 0 });
      P.txt(s, t, x + 0.35, b.y + 0.42, cw - 0.55, b.h - 0.47, { fontSize: 14, noScale: true, italic: true, margin: 0, valign: "top" }); }); } }] });
L.save(pres, __dirname + "/candidate.pptx");
