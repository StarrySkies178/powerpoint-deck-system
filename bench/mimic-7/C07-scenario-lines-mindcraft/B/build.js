// Build B: same design, new content, and a fourth scenario line in both charts.
const path = require("path");
const { build, save } = require("../common.js");
const cats = ["2019", "2020E", "2021E", "2022E", "2023E", "2024E"];
const spec = {
  title: "Growth stays above market in all four scenarios, and a falling capex burden keeps the store rollout self-funded",
  crumb: { items: ["Market Sizing", "Go-to-Market", "Financial Plan"], x: [0.38, 2.88, 5.56], current: 2 },
  p1: {
    cats, min: 4, max: 14, step: 2,
    series: [
      { name: "Stress", color: "D5D5D5", values: [5.1, 5.0, 5.2, 5.4, 5.6, 5.8], cagr: "3%" },
      { name: "Bear", color: "A6A6A6", values: [5.1, 5.6, 6.1, 6.6, 7.1, 7.6], cagr: "8%" },
      { name: "Base", color: "5C5C5C", values: [5.1, 6.0, 6.9, 7.9, 8.9, 10.0], cagr: "14%" },
      { name: "Bull", color: "C00000", values: [5.1, 6.4, 7.9, 9.6, 11.5, 13.7], cagr: "22%" },
    ],
    legend: [2, 3, 1, 0], cagrHead: ["CAGR", "19-24"],
  },
  p2: {
    cats, min: 80, max: 260, step: 20,
    series: [
      { name: "Stress", color: "D5D5D5", values: [120, 105, 98, 110, 121, 130] },
      { name: "Bear", color: "A6A6A6", values: [120, 126, 133, 141, 158, 169] },
      { name: "Base", color: "5C5C5C", values: [120, 138, 152, 166, 189, 205] },
      { name: "Bull", color: "C00000", values: [120, 150, 171, 190, 224, 246] },
    ],
    burdenLabel: "Capex / OCF", burden: ["31%", "27%", "24%", "21%", "18%"], returnVal: "~2.1 years",
  },
  note: "1) capex burden = capex / operating cash flow;  2) payback = capex per store / avg. operating income per store",
  source: "Source: Team analysis, company filings, Wind, store-manager interviews",
};
(async () => { const { pres } = build(spec); await save(pres, path.join(__dirname, "candidate.pptx")); })();
