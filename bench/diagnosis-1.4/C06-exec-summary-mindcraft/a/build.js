// C06 variant a: executive summary in the Case-2019-Mindcraft style (deck as reference, leave-one-out).
// Approach: the deck's style profile (useStyle via L.start) + the labelled-rows exec-summary form
// (Style/refs/case-competitions-2019-2020.md §2 "Label-block rows", generator P.labelledRows).
// Row labels reuse the deck's own section names (agenda, slide 2); numbered red chips and F1F1F1 grey
// text panels as on the deck's other slides (agenda 2, panels on 4/7/8). No stored objects reused.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const { pres, slide, B, P } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });

// Key words bold in the main colour. Lower-case hex on purpose: patterns.js txt() swaps any run whose colour
// equals C.accent ("C00000" here) for the house text-green 4D7100, even under a reference style.
const hi = (t) => ({ text: t, options: { bold: true, color: "c00000" } });
const pl = (t) => ({ text: t });

const items = [
  { label: "Market Analysis", text: [
    pl("Fine jewelry market expects "), hi("attractive growth in next five years"),
    pl(", mainly driven by the strong demands from "), hi("millennials in tier 1 and 2 cities"),
    pl(" and "), hi("emerging middle class from tier 3 and 4 cities"),
    pl(". These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.") ] },
  { label: "Growth Strategy", text: [
    pl("However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS's five-year growth strategy should address "),
    hi("branding, offline expansion and omni-channel development"),
    pl(" with differentiations accommodating to two primary customers.") ] },
  { label: "Financial Impact", text: [
    pl("Moreover, the proposed top-line growth strategy is expected to deliver "), hi("12% annual growth"),
    pl(", largely driven by "), hi("offline expansion strategy"), pl(".") ] },
  { label: "Risks", text: [
    pl("Finally, the strategy will impose "), hi("affordable financial pressure"),
    pl(" and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.") ] },
];

P.labelledRows(slide, { items }, { x: B.x, y: B.y + 0.05, w: B.w, h: B.h - 0.05 });
// footer rule the deck carries on its slides (thin light grey line above the source line); not in the profile
slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "D5D5D5", width: 0.75 } });
L.save(pres, __dirname + "/candidate.pptx");
