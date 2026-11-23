// C06 variant b: "Executive Summary" text slide in the style of Case-2019-Mindcraft (deck as reference, leave-one-out).
// Layout from the layout description: full-bleed background fading left to right (drawn first, so it covers the
// master's title rule and page number), title at the deck's title position, one block of four prose paragraphs
// on the left, right side left empty. Fonts, sizes, colours and the title position come from the deck's style
// profile (Style/refs/Case-2019-Mindcraft.profile.json). The fade itself is set by build.py (pptxgenjs has no
// gradient fill); its end colours are the deck's own neutrals (profile neutrals_ranked).
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const fs = require("fs"), path = require("path");
const { P, HOUSE } = L;

(async () => {
  const prof = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../../Style/refs/Case-2019-Mindcraft.profile.json"), "utf8"));
  P.useStyle(prof);
  const pres = HOUSE.newDeck(require("pptxgenjs"), "Executive Summary");
  const slide = pres.addSlide({ masterName: HOUSE.LAYOUT.titleOnly });
  const W = HOUSE.W, H = HOUSE.H;

  // 1. full-bleed background (solid here; build.py turns it into a linear left-to-right fade)
  slide.addShape("rect", { x: 0, y: 0, w: W, h: H, fill: { color: "F1F1F1" }, line: { type: "none" }, objectName: "background fade" });

  // 2. title on the background, in the master's title placeholder (profile: Verdana 26 pt, black, not bold)
  P.frame(pres, slide, { title: "Executive Summary" });

  // 3. one text block, four prose paragraphs, same left edge as the title, left part of the slide only
  const paras = [
    "Fine jewelry market expects attractive growth in next five years, mainly driven by the strong demands from millennials in tier 1 and 2 cities and emerging middle class from tier 3 and 4 cities. These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.",
    "However, CSS faces challenges in seizing growth in the two primary customer groups: low penetration of the youth brands in high tiers and limited access and brand awareness in low tiers. Therefore, CSS’s five-year growth strategy should address branding, offline expansion and omni-channel development with differentiations accommodating to two primary customers.",
    "Moreover, the proposed top-line growth strategy is expected to deliver 12% annual growth, largely driven by offline expansion strategy.",
    "Finally, the strategy will impose affordable financial pressure and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.",
  ];
  const T = prof.title, x = T.x, y = 1.55, w = 8.6, h = 5.45;
  slide.addText(paras.map((t, i) => ({ text: t, options: { breakLine: i < paras.length - 1, paraSpaceAfter: 12 } })), {
    x, y, w, h, fontFace: HOUSE.FONT.latin, fontSize: prof.body.pt, color: prof.body.text, align: "left", valign: "top",
    margin: [0, 0.07, 0, 0.0], lineSpacingMultiple: 1.3, isTextBox: true, objectName: "executive summary text",
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
