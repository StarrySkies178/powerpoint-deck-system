// C10 strategy overview, deck as reference (TrueNorth Pola deck), leave-one-out.
// Look taken from the deck's style profile and its other slides: red title band, breadcrumb with red
// separators, red table header row with white text (slides 12, 15), F1F1F1 banded cells (slide 15),
// pink highlight (slide 7 boxes, EBC6C5), grey footer band and logo (every content slide).
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const REF = "Case-2016-TrueNorth-Pola-China-growth";
const { pres, slide, B, P } = L.start({ ref: REF,
  title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis" });
const C = P.C, FONT = P.THEME.bodyFontFace, prof = L.HOUSE.STYLE;
const RED = C.navy, GREY = C.g1, PINK = C.g2, WHITE = "FFFFFF", TXT = C.text;
const PT = prof.body.pt - 1;                       // 13 pt: within 1 pt of the profile's body size (deck_lint body-size rule), never smaller
const W = 10, H = 7.5;

// ---- frame furniture of the deck: grey footer band, logo, breadcrumb with red separators ----
slide.addShape("rect", { x: 0, y: 7.2, w: W, h: H - 7.2, fill: { color: "CCCCCC" }, line: { type: "none" } });
slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });
async function addLogo() {     // the TrueNorth logo that sits top-right on every content slide of the reference
  const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, "../../../../../Templates", REF + ".pptx")));
  const f = zip.file("ppt/media/image1.jpg");
  if (f) slide.addImage({ data: "image/jpeg;base64," + (await f.async("base64")), x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
}
{
  const cs = prof.crumb, items = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1;
  const runs = [];
  items.forEach((t, i) => {
    if (i) runs.push({ text: " ► ", options: { color: RED } });
    runs.push({ text: t, options: { color: i === cur ? TXT : "CCCCCC" } });
  });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 8.1, h: 0.3, fontFace: FONT, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });
}

// ---- text helpers ----
const bul = (items, o = {}) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 9 }, breakLine: i < items.length - 1, ...o } }));
function cell(x, y, w, h, fill, runs, o = {}) {
  if (fill) slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
  slide.addText(runs, { x, y, w, h, fontFace: FONT, fontSize: PT, color: TXT, valign: o.valign || "middle", align: o.align || "left",
    margin: [2, 3, 2, 3], lineSpacingMultiple: 0.9, paraSpaceAfter: o.psa || 0, isTextBox: true });
}
const head = (t, color = TXT) => ({ text: t, options: { bold: true, color, breakLine: true } });

// ---- grid ----
const x0 = B.x, right = B.x + B.w, gap = 0.05, arr = 0.2;
const wA = 2.62, wB = 3.68, wC = 1.5;
const xA = x0, xB = xA + wA + arr, xC = xB + wB + gap, xD = xC + wC + gap, wD = right - xD;
const yH = 1.44, hH = 0.32;                // header row
const yT = yH + hH + 0.05, hT = 1.05;            // highlighted summary row
const yR = yT + hT + 0.07, yEnd = 7.14;            // phase rows

// header row: red fill, white bold text (slides 12, 15)
slide.addShape("rect", { x: x0, y: yH, w: right - x0, h: hH, fill: { color: RED }, line: { type: "none" } });
[["Current situation", xA, wA], ["Key strategies & initiatives", xB, wB], ["Risks", xC, wC], ["Mitigation", xD, wD]]
  .forEach(([t, x, w]) => cell(x, yH, w, hH, null, [{ text: t, options: { bold: true, color: WHITE, fontSize: prof.body.pt } }], { align: "center" }));
[xC, xD].forEach((x) => slide.addShape("line", { x: x - gap / 2, y: yH, w: 0, h: hH, line: { color: WHITE, width: 1.5 } }));

// highlighted summary row (pink, red outline, as the chosen row is boxed on slide 15)
slide.addShape("rect", { x: x0, y: yT, w: right - x0, h: hT, fill: { color: PINK }, line: { color: RED, width: 1.5 } });
cell(xA, yT, wA, hT, null, bul(["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"], { bold: true }));
cell(xB, yT, wB, hT, null, bul(["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"], { bold: true }));
cell(xC, yT, wC, hT, null, bul(["Market Risks", "Political Risks"], { bold: true }));
cell(xD, yT, wD, hT, null, bul(["R&D Process", "Product Intro", "Re-evaluation"], { bold: true }));
const rArrow = (x, y, w, h, col = C.g3) => slide.addShape("rightArrow", { x, y, w, h, fill: { color: col }, line: { type: "none" } });
rArrow(xA + wA + 0.02, yT + hT / 2 - 0.13, arr - 0.04, 0.26, RED);

// four rows: consumer phase -> strategy
const rows = [
  ["Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing potential consumer needs"],
   "Brand position", ["Launch POLA & Jurlique for specific groups", "Tag brands with fancy & explicit concepts", "Design product diversification roadmaps"]],
  ["Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
   "Marketing strategy", ["Compose fascinating stories or hot topics", "Social media-focused marketing initiatives", "Invite celebrity as spokespersons"]],
  ["Purchase phase", ["Desire for experience shopping", "Higher offline store expectations", "More impulsive shopping", "Frequent mobile shopping"],
   "Channel optimization", ["Provide various service like massage", "Build experience shops & digitalize stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"]],
  ["Aftersales phase", ["Low brand loyalty", "Desire for value identification", "Fans culture"],
   "Loyalty management", ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"]],
];
// row heights follow their line counts: a heading line plus one line per item (the planning row has one item that wraps)
const need = rows.map((r, i) => 1 + Math.max(r[1].length, r[3].length) + (i === 0 ? 0.6 : 0));
const rg = 0.05, avail = yEnd - yR - rg * (rows.length - 1), tot = need.reduce((a, b) => a + b, 0);
let y = yR;
rows.forEach((r, i) => {
  const h = (avail * need[i]) / tot;
  cell(xA, y, wA, h, GREY, [head(r[0]), ...bul(r[1])]);
  cell(xB, y, wB, h, GREY, [head(r[2], RED), ...bul(r[3])]);
  rArrow(xA + wA + 0.02, y + h / 2 - 0.13, arr - 0.04, 0.26);
  y += h + rg;
});

// risks and mitigation span the four rows
const hR = yEnd - yR;
cell(xC, yR, wC, hR, GREY, [head("Market Risks"),
  ...bul(["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not aligned with consumer trends"]).map((r, i, a) => (i === a.length - 1 ? { ...r, options: { ...r.options, breakLine: true } } : r)),
  { text: " ", options: { fontSize: 6, breakLine: true } },
  head("Political Risks"),
  ...bul(["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"])], { valign: "top" });
cell(xD, yR, wD, hR, GREY, bul(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
  "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"]), { valign: "top", psa: 4 });

addLogo().then(() => L.save(pres, __dirname + "/candidate.pptx"));
