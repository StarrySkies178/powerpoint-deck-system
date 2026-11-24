// C05 timeline, deck as reference (Case-2019-E-Cluster), leave-one-out rebuild 3.
// Approach: the deck's style profile through the harness (title band, crumb, fonts, colour roles), then a Gantt drawn
// in the deck's own furniture: section headers in bold 10366C with a 1.5 pt rule (deck slides 9, 11, 13, 16),
// light-blue table bands (profile table.body_fill DFECF5), dashed row separators (slide 4 / 7 style), and a grey
// F1F1F1 band of icon columns split by thin vertical rules for the risks (the constraint band of slide 4).
// The layout's measured rule (x 4.6 to 13.09, y 1.74) is used as the underline of the year header.
// Logo pictures come from the object store media (frame furniture of the deck's other slides).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P } = L.start({
  ref: "Case-2019-E-Cluster", title: "Implementation Timeline",
  crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
});
const C = P.C, T = P.txt;
const NAVY = "10366C", DARK = "202C4F", BAND = "DFECF5", PANEL = "F1F1F1";
const BAR1 = "10366C", BAR2 = "63A4CC", GREYLINE = "A6A6A6";   // bars in the deck's chart colours (waterfall and stack of its financial slide)
const k = { keepSize: true, margin: 0 };

// ---- frame furniture of the deck: logo top right, thin rule above the source line ----
slide.addImage({ path: path.join(__dirname, "ecluster-icon.jpg"), x: 11.57, y: 0.06, w: 0.30, h: 0.328 });
slide.addImage({ path: path.join(__dirname, "ecluster-wordmark.jpg"), x: 11.94, y: 0.12, w: 1.09, h: 0.22 });
slide.addShape("line", { x: 0, y: 7.25, w: 13.333, h: 0, line: { color: DARK, width: 0.75 } });

// ---- Gantt ----
const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
const LX = 0.3, GX = 4.6, GR = 13.09, PW = (GR - GX) / years.length;
const top = 1.43;
years.forEach((y, i) => T(slide, y, GX + i * PW, top, PW, 0.3, { ...k, fontSize: 17, bold: true, color: NAVY, align: "center", valign: "bottom" }));

// rows: from/to are year indexes (inclusive); group rows carry a band
const rows = [
  { label: "New Product R&D", from: 0, to: 0, h: 0.4, bold: true },
  { label: "Marketing & Reshaping Brand", from: 0, to: 2, h: 0.4, bold: true },
  { group: "Offline: City Penetration Steps", h: 0.38 },
  { label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 2, h: 0.5, step: 1 },
  { label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 5, h: 0.5, step: 2 },
  { group: "Omni Channel Building", h: 0.38 },
  { label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 1, h: 0.5, step: 1 },
  { label: "Further integrate online and offline channels", from: 2, to: 5, h: 0.5, step: 2 },
];
let y = 1.8;
const y0 = y, totalH = rows.reduce((a, r) => a + r.h, 0);
// year columns: light zebra so each year reads as a column, dashed dividers
years.forEach((_, i) => { if (i % 2 === 1) slide.addShape("rect", { x: GX + i * PW, y: y0, w: PW, h: totalH, fill: { color: "F7F7F7" }, line: { type: "none" } }); });
rows.forEach((r, i) => {
  if (r.group) {
    slide.addShape("rect", { x: LX, y: y + 0.04, w: GR - LX, h: r.h - 0.08, fill: { color: BAND }, line: { type: "none" } });
    T(slide, r.group, LX + 0.08, y, GX - LX, r.h, { ...k, fontSize: 15, bold: true, color: NAVY, valign: "middle" });
  } else {
    const ind = r.step ? 0.3 : 0;
    if (r.step) T(slide, "\u2022", LX + 0.08, y, 0.2, r.h, { ...k, fontSize: 14, color: C.text, valign: "middle" });
    T(slide, r.label, LX + 0.08 + ind, y, GX - LX - 0.25 - ind, r.h, { ...k, fontSize: 14, bold: !!r.bold, color: r.bold ? DARK : C.text, valign: "middle" });
    const bx = GX + r.from * PW + 0.06, bw = (r.to - r.from + 1) * PW - 0.12, bh = 0.3;
    slide.addShape("homePlate", { x: bx, y: y + (r.h - bh) / 2, w: bw, h: bh, fill: { color: r.step === 2 ? BAR2 : BAR1 }, line: { type: "none" }, rectRadius: 0 });
  }
  y += r.h;
  const next = rows[i + 1];
  if (next && !next.group && !r.group) slide.addShape("line", { x: LX, y, w: GR - LX, h: 0, line: { color: GREYLINE, width: 0.75, dashType: "dash" } });
});
for (let i = 1; i < years.length; i++) slide.addShape("line", { x: GX + i * PW, y: y0, w: 0, h: totalH, line: { color: "C3C6CA", width: 0.75, dashType: "dash" } });
slide.addShape("line", { x: GX, y: y0, w: 0, h: totalH, line: { color: GREYLINE, width: 0.75 } });

// ---- Potential risks: header with rule, then the grey icon band ----
const ry = y + 0.06;
T(slide, "Potential Risks", LX, ry, 6, 0.32, { ...k, fontSize: 17, bold: true, color: NAVY, valign: "bottom" });
slide.addShape("line", { x: LX, y: ry + 0.35, w: GR - LX, h: 0, line: { color: NAVY, width: 1.5 } });
const py = ry + 0.45, ph = 7.16 - py, risks = [
  { icon: "trending-down", wt: 0.72, text: [{ text: "Economy downturn" }] },
  { icon: "hourglass", wt: 1, text: [{ text: "Suffer from slow ramp up problem when entering the new market" }] },
  { icon: "diamond", wt: 1.2, text: [{ text: "Potential brand image cannibalization, fail to launch new products in the market as expected" }] },
  { icon: "users", wt: 1.08, text: [{ text: "Market dynamics: ", options: { bold: true } }, { text: "customer behavior change, competitors’ response, etc." }] },
];
slide.addShape("rect", { x: LX, y: py, w: GR - LX, h: ph, fill: { color: PANEL }, line: { type: "none" } });
const wsum = risks.reduce((a, r) => a + r.wt, 0);
let x = LX;
risks.forEach((r, i) => {
  const cw = (GR - LX) * r.wt / wsum;
  if (i) slide.addShape("line", { x, y: py + 0.12, w: 0, h: ph - 0.24, line: { color: GREYLINE, width: 0.75 } });
  P.icon(slide, r.icon, x + 0.14, py + ph / 2 - 0.2, 0.4, { color: "7E7E7E" });
  T(slide, r.text, x + 0.62, py + 0.1, cw - 0.7, ph - 0.2, { ...k, fontSize: 15, color: C.text, valign: "middle" });
  x += cw;
});
// page number as the deck shows it (bold, main blue); the layout's slide-number field is removed in build.py
T(slide, "12", 12.3, 7.27, 0.72, 0.22, { ...k, fontSize: 10, bold: true, color: NAVY, align: "right", valign: "middle" });

L.save(pres, __dirname + "/candidate.pptx");
