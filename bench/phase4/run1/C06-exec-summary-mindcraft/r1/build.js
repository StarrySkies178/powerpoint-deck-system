// C06 exec summary in the Mindcraft deck style (deck as reference, leave-one-out).
// Style: Case-2019-Mindcraft profile (Verdana, 26 pt title + red rule, 14 pt body, F1F1F1 panels).
// Form: the deck's own text-slide furniture, taken from its agenda (slide 2): dark-grey numbered
// squares with italic bold white numerals beside light-grey F1F1F1 bars, no breadcrumb (like the
// agenda and appendix slides). One numbered row per paragraph; the answer phrase of each row bold in the deck's red.
// Footer: grey rule and MindCraft logo as on the deck's master (logo = master picture image1.png).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P } = L.start({ ref: "Case-2019-Mindcraft", title: "Executive Summary" });
  const C = P.C, FONT = "Verdana";
  const R = (t) => ({ text: t, options: {} });
  const K = (t) => ({ text: t, options: { bold: true, color: "C00000" } });

  const paras = [
    [R("Fine jewelry market expects "), K("attractive growth"), R(" in next five years, mainly driven by the strong demands from "),
     R("millennials in tier 1 and 2 cities"), R(" and "), R("emerging middle class from tier 3 and 4 cities"),
     R(". These two primary customer groups have different key purchasing criteria: individuality and youthful image for high-tier millennials and brand recognition for low-tier middle class.")],
    [R("However, CSS faces challenges in seizing growth in the two primary customer groups: "),
     R("low penetration of the youth brands in high tiers"), R(" and "), R("limited access and brand awareness in low tiers"),
     R(". Therefore, CSS’s five-year growth strategy should address "), K("branding, offline expansion and omni-channel development"),
     R(" with differentiations accommodating to two primary customers.")],
    [R("Moreover, the proposed top-line growth strategy is expected to deliver "), K("12% annual growth"),
     R(", largely driven by "), R("offline expansion strategy"), R(".")],
    [R("Finally, the strategy will impose "), K("affordable financial pressure"),
     R(" and the implementation risks including internal resistance, talent and supply chain management and IT system have been preliminarily identified.")],
  ];
  // row heights follow the text length (4, 4, 2, 2 lines at 14 pt over the bar width)
  const weights = [4.3, 4.3, 2.3, 2.3];
  const top = 1.55, bottom = 6.98, gap = 0.2, chip = 0.58;
  const xChip = 0.62, xBar = xChip + chip + 0.2, wBar = 12.72 - xBar;
  const avail = bottom - top - gap * (paras.length - 1), sumW = weights.reduce((a, b) => a + b, 0);
  let y = top;
  paras.forEach((runs, i) => {
    const h = (avail * weights[i]) / sumW;
    slide.addShape("rect", { x: xChip, y, w: chip, h: chip, fill: { color: "5C5C5C" }, line: { type: "none" }, objectName: `num${i + 1}` });
    slide.addText(String(i + 1), { x: xChip, y, w: chip, h: chip, fontFace: FONT, fontSize: 16, bold: true, italic: true,
      color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
    slide.addShape("rect", { x: xBar, y, w: wBar, h, fill: { color: "F1F1F1" }, line: { type: "none" }, objectName: `para${i + 1} box` });
    slide.addText(runs, { x: xBar, y, w: wBar, h, fontFace: FONT, fontSize: 14, color: "000000", align: "left", valign: "middle",
      margin: [4, 12, 4, 12], lineSpacingMultiple: 1.15, isTextBox: true, objectName: `para${i + 1}` });
    y += h + gap;
  });

  // master footer of the reference deck: thin grey rule and the MindCraft logo bottom right
  slide.addShape("line", { x: 0, y: 7.212, w: 13.333, h: 0, line: { color: "B4B4B4", width: 0.75 }, objectName: "footer rule" });
  slide.addImage({ path: path.join(__dirname, "mindcraft-logo.png"), x: 11.642, y: 7.175, w: 1.137, h: 0.325, objectName: "logo" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
