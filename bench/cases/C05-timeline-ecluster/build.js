const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-E-Cluster", crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " \u2192 " }, title: "Implementation Timeline", subtitle: "Market Overview → Strategy Design → Implementation: Timeline" });
const gh = B.h * 0.7;
S.gantt(slide, { periods: ["2019", "2020", "2021", "2022", "2023", "2024"], legend: false, groups: [
  { name: "New Product R&D", rows: [{ label: "New Product R&D", from: 0, to: 1, hi: true }] },
  { name: "Marketing & Reshaping Brand", rows: [{ label: "Marketing & Reshaping Brand", from: 0, to: 3, hi: true }] },
  { name: "Offline: City Penetration Steps", rows: [{ label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 3 }, { label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 6 }] },
  { name: "Omni Channel Building", rows: [{ label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 2 }, { label: "Further integrate online and offline channels", from: 2, to: 6 }] }] }, { ...B, h: gh });
S.insightBox(slide, { label: "Potential Risks", bullets: ["Economy downturn", "Suffer from slow ramp up problem when entering the new market", "Potential brand image cannibalization, fail to launch new products in the market as expected", "Market dynamics: customer behavior change, competitors' response, etc."] }, { x: B.x, y: B.y + gh + 0.15, w: B.w, h: B.h - gh - 0.15 });
L.save(pres, __dirname + "/candidate.pptx");
