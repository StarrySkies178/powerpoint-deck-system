const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-Polaris", title: "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy", source: "Source: Polaris Analysis" });
S.decisionFramework(slide, { rowLabels: ["Analysis Dimensions", "Implications"], goal: "Achieve healthy revenue growth in Mainland China jewelry market", stages: [
  { name: "Market", dims: ["Market Overview", "– Industry Trends", "– Key Drivers", "Customer Analysis", "Competitive Analysis"], solution: "Pandora should follow market trends and customer needs to find growth opportunities" },
  { name: "Strategy Design", dims: ["Offline Strategy", "– Store Expansion", "– Sales Per Store Improvement", "Online Strategy", "– Enter new platforms", "– Optimize operations", "Omni-channel Strategy"], solution: "Based on position of “a warm jewelry brand”, Pandora should implement strategies to regain healthy growth in Mainland China" },
  { name: "Implementation", dims: ["Implementation Timeline", "Risk & Mitigation", "Financial Forecast"], solution: "" }] });
L.save(pres, __dirname + "/candidate.pptx");
