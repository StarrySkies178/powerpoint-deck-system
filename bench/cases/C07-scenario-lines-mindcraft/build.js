const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-Mindcraft", crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2, sep: "   \u25B6   " }, title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility", source: "Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store. Source: MindCraft Analysis, Wind, Expert interview, Bloomberg" });
const yrs = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
// layout: sibling slide 9 of the deck (two halves split at x 6.64, exhibit over a takeaway box in each)
S.composeSlide(pres, slide, { regions: [{ x: 0.35, y: 1.37, w: 6.0, h: 5.66 }, { x: 6.64, y: 1.37, w: 6.4, h: 5.66 }], panels: [
  { headline: "Resilient growth under scenario analysis", chart: { type: "line", labels: yrs, highlight: 0, format: "0.0", series: [{ name: "Optimistic case", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2] }, { name: "Base case", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6] }, { name: "Crush case", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2] }] },
    takeaway: "Three cases all indicate above-market growth (7%); under the optimistic case ~17% 5-year CAGR (base 12%, crush 8%)" },
  { headline: "Guaranteed financial feasibility", chart: { type: "line", labels: yrs, highlight: 0, series: [{ name: "Optimistic case", values: [200, 231, 244, 255, 292, 309] }, { name: "Base case", values: [200, 209, 216, 233, 268, 277] }, { name: "Crush case", values: [200, 175, 180, 201, 228, 243] }] },
    takeaway: "Yearly capex accounts for ~20% of liquidity (capex burden 26% → 17%), with quick return (~1.6 yrs), indicating a good financial feasibility" }] });
L.save(pres, __dirname + "/candidate.pptx");
