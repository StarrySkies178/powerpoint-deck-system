const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
P.txt(slide, [
  "Fine jewelry market expects attractive growth in next five years, mainly driven by the strong demands from millennials in tier 1 and 2 cities and emerging middle class from tier 3 and 4 cities. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
  "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address branding, offline expansion and omni-channel development with differentiations accommodating to two primary customers.",
  "Moreover, the proposed top-line growth strategy is expected to deliver 12% annual growth, largely driven by offline expansion strategy.",
  "Finally, the strategy will impose affordable financial pressure and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified."].join("\n"), B.x, B.y, B.w * 0.8, B.h, { max: 16, paraSpaceAfter: 10 });
L.save(pres, __dirname + "/candidate.pptx");
