// Build A: same content as the original slide (case19-mindcraft slide 14).
const path = require("path");
const { build, save } = require("../common.js");
const spec = {
  title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], x: [0.38, 2.88, 5.56], current: 2 },
  p1: {
    cats: ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"], min: 8, max: 18.2, top: 18, step: 2,
    series: [
      { name: "Crush case", color: "D5D5D5", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2], cagr: "8%" },
      { name: "Base case", color: "5C5C5C", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], cagr: "12%" },
      { name: "Optimistic case", color: "C00000", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], cagr: "17%" },
    ],
    legend: [1, 2, 0], cagrHead: ["CAGR", "18-23"],
  },
  p2: {
    cats: ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"], min: 160, max: 320, step: 20,
    series: [
      { name: "Crush case", color: "D5D5D5", values: [200, 175, 180, 201, 228, 243] },
      { name: "Base case", color: "5C5C5C", values: [200, 209, 216, 233, 268, 277] },
      { name: "Optimistic case", color: "C00000", values: [200, 231, 244, 255, 292, 309] },
    ],
    burdenLabel: "Capex burden", burden: ["26%", "22%", "20%", "19%", "17%"], returnVal: "~1.6 years",
  },
  burdenNudge: [0.08, 0.07, 0.03, 0.08, 0.02],
  note: "1) capex burden = Capex/ cash flow from operations;  2) return on capex= capex store/avg. operational income per store",
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
};
(async () => { const { pres } = build(spec); await save(pres, path.join(__dirname, "candidate.pptx")); })();
