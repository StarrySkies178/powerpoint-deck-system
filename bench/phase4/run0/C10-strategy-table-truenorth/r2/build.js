// C10 strategy overview table, TrueNorth Pola deck style (deck as reference, leave-one-out).
// Style: the deck's measured profile (red title band, Calibri, CC0000 / greys) through bench_lib; the deck's own
// frame furniture that the profile does not carry (grey footer bar, TrueNorth logo of the slide layout, red ► breadcrumb)
// is added here. Table form follows the deck's other tables: red header cells with white text (Pola 6, 15),
// grey vertical row labels (Pola 9), grey body cells, one boxed/highlighted row (Pola 15).
const path = require("path"), { execSync } = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const ROOT = path.join(__dirname, "../../../../..");
const REF = "Case-2016-TrueNorth-Pola-China-growth";

const TITLE = "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis";
const { pres, slide, P, HOUSE } = L.start({ ref: REF, title: TITLE });
const RED = "CC0000", PINK = "EBC6C5", G1 = "F1F1F1", GD = "777777", TX = "000000", WH = "FFFFFF", BAR = "CCCCCC";
const FONT = "Calibri";

// ---- deck frame furniture ----
slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: BAR }, line: { type: "none" } });
slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });
try {   // TrueNorth logo, from the reference deck's slide layout (not from any slide)
  const logo = execSync(`unzip -p "${path.join(ROOT, "Templates", REF + ".pptx")}" ppt/media/image1.jpg`, { maxBuffer: 1 << 20 });
  if (logo.length > 1000) slide.addImage({ data: "image/jpeg;base64," + logo.toString("base64"), x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
} catch (e) { /* logo optional */ }
const crumb = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], cur = 1, runs = [];
crumb.forEach((c, i) => { if (i) runs.push({ text: " ► ", options: { color: RED } }); runs.push({ text: c, options: { color: i === cur ? TX : BAR } }); });
slide.addText(runs, { x: 0.35, y: 0.05, w: 8.1, h: 0.3, fontFace: FONT, fontSize: 14, margin: 0, valign: "top" });

// ---- helpers ----
const PT = 10.5;
const bullets = (items, o = {}) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: i < items.length - 1, ...o } }));
function cell(x, y, w, h, fill) { slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } }); }
function text(runs, x, y, w, h, o = {}) {
  slide.addText(runs, { x, y, w, h, fontFace: FONT, fontSize: o.pt || PT, color: o.color || TX, bold: !!o.bold, align: o.align || "left",
    valign: o.valign || "middle", margin: o.margin ?? [2, 4, 2, 4], paraSpaceAfter: o.after || 0, rotate: o.rotate, objectName: o.name });
}
const arrow = (x, y, w, h, color = RED) => slide.addShape("rightArrow", { x, y, w, h, fill: { color }, line: { type: "none" } });

// ---- grid ----
const X0 = 0.25, XR = 9.84, gap = 0.06;
const cols = [
  { x: X0, w: 2.78 },            // current situation
  { x: 3.27, w: 3.14 },          // key strategies & initiatives (0.24 arrow lane before it)
  { x: 6.47, w: 1.72 },          // risks
  { x: 8.43, w: XR - 8.43 },     // mitigation (0.24 arrow lane before it)
];
const heads = ["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"];
const yH = 1.5, hH = 0.4;
heads.forEach((t, j) => { cell(cols[j].x, yH, cols[j].w, hH, RED); text(t, cols[j].x, yH, cols[j].w, hH, { color: WH, bold: true, pt: 14, align: "center" }); });

// ---- top highlighted row: the summary of each column ----
const yS = yH + hH + gap, hS = 0.8;
cell(X0, yS, XR - X0, hS, PINK);
slide.addShape("rect", { x: X0, y: yS, w: XR - X0, h: hS, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
const top = [
  ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
  ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
  ["Market Risks", "Political Risks"],
  ["R&D Process", "Product Intro", "Re-evaluation"],
];
top.forEach((items, j) => text(bullets(items, { bold: true }), cols[j].x, yS, cols[j].w, hS, { pt: 11 }));
[0, 2].forEach((j) => arrow(cols[j].x + cols[j].w + 0.03, yS + hS / 2 - 0.1, cols[j + 1].x - cols[j].x - cols[j].w - 0.06, 0.2));

// ---- consumer phase -> strategy rows ----
const rows = [
  { phase: "Planning\nphase", needs: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
    strat: "Brand position", acts: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"], h: 0.98 },
  { phase: "Awareness\nphase", needs: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
    strat: "Marketing strategy", acts: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"], h: 0.98 },
  { phase: "Purchase\nphase", needs: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
    strat: "Channel optimization", acts: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"], h: 1.17 },
  { phase: "Aftersales\nphase", needs: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
    strat: "Loyalty management", acts: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"], h: 0.98 },
];
const yR0 = yS + hS + gap, yEnd = 7.12;
const free = yEnd - yR0 - gap * (rows.length - 1), hSum = rows.reduce((a, r) => a + r.h, 0);
rows.forEach((r) => (r.h = (r.h * free) / hSum));
const LW = 0.42;   // vertical phase label
let y = yR0;
rows.forEach((r, i) => {
  const c0 = cols[0], c1 = cols[1];
  cell(c0.x, y, LW, r.h, GD);   // darker grey of the deck palette: white label stays readable
  text(r.phase, c0.x + LW / 2 - r.h / 2, y + r.h / 2 - LW / 2, r.h, LW, { color: WH, bold: true, pt: 11, align: "center", rotate: 270, margin: 0, name: "phase " + (i + 1) });   // box drawn unrotated (w = row height), then turned
  cell(c0.x + LW, y, c0.w - LW, r.h, G1);
  text(bullets(r.needs), c0.x + LW + 0.04, y, c0.w - LW - 0.06, r.h);
  arrow(c0.x + c0.w + 0.03, y + r.h / 2 - 0.1, c1.x - c0.x - c0.w - 0.06, 0.2);
  cell(c1.x, y, c1.w, r.h, G1);
  text([{ text: r.strat, options: { bold: true, color: RED, breakLine: true } }, ...bullets(r.acts)], c1.x + 0.02, y, c1.w - 0.04, r.h);
  y += r.h + gap;
});

// ---- risks -> mitigation (spans the four rows) ----
const c2 = cols[2], c3 = cols[3], hAll = yEnd - yR0, hMk = hAll * 0.56, hPo = hAll - hMk - gap;
const risks = [
  { name: "Market Risks", items: ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"], y: yR0, h: hMk,
    mit: ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs", "Prioritize channel management for weak channels"] },
  { name: "Political Risks", items: ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"], y: yR0 + hMk + gap, h: hPo,
    mit: ["Re-consider manufacturing strategy in 2 years and consider option of building factory in China"] },
];
risks.forEach((k) => {
  cell(c2.x, k.y, c2.w, k.h, G1);
  text([{ text: k.name, options: { bold: true, color: RED, breakLine: true } }, ...bullets(k.items)], c2.x + 0.02, k.y, c2.w - 0.04, k.h, { after: 2 });
  arrow(c2.x + c2.w + 0.03, k.y + k.h / 2 - 0.1, c3.x - c2.x - c2.w - 0.06, 0.2);
  cell(c3.x, k.y, c3.w, k.h, G1);
  text(bullets(k.mit), c3.x + 0.02, k.y, c3.w - 0.04, k.h, { after: 4 });
});

L.save(pres, __dirname + "/candidate.pptx").then(() => console.log("saved"));
