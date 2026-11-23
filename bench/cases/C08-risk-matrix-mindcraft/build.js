const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-Mindcraft", crumb: { items: ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], current: 2, sep: "   \u25B6   " }, title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion", source: "Source: MindCraft Analysis" });
S.riskMatrix(slide, { x: { label: "Severity" }, y: { label: "Likelihood" }, zone: { x0: 0.6, x1: 1, y0: 0.35, y1: 1, label: "Top priority" }, riskHeader: "Risks", mitigationHeader: "Solutions", risks: [
  { id: 1, x: 0.9, y: 0.85, name: "Internal resistance", mitigation: ["[Avoid] Strengthen internal communication and provide employee training", "[Mitigate] Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"] },
  { id: 2, x: 0.8, y: 0.7, name: "Talent management", mitigation: ["[Avoid] Make recruitment plan in advance", "[Mitigate] Reduce labor demand with technology"] },
  { id: 3, x: 0.65, y: 0.6, name: "Supply chain mgmt.", mitigation: ["[Avoid] Optimize logistics network", "[Mitigate] Find reliable third-party logistic partner"] },
  { id: 4, x: 0.75, y: 0.45, name: "IT system upgrade", mitigation: ["[Avoid] Make upgrade plan in advance; careful selection of new system supplier", "[Mitigate] Hire external technology experts for help"] }] });
L.save(pres, __dirname + "/candidate.pptx");
