// C04 rebuild 3: two charts + three driver boxes, in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Layout T2B1 taken from the deck's closest OTHER slide (E-Cluster slide 5 in the slide map: stacked column with CAGR
// columns and a red circle, a second chart, three icon driver cards in a grey band), panel boxes measured on its render.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, S } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const C = P.C;
const DARK = "10366C", LIGHT = "C1DBEB", RED = "CC0000", NOTE = "585858";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: "Arial", fontSize: o.fontSize, color: o.color || C.text,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true });

// ---------- panel boxes (T2B1, from the deck's sibling slide) ----------
const R1 = { x: 0.27, y: 1.32, w: 6.13 }, R2 = { x: 6.87, y: 1.32, w: 6.2 }, R3 = { x: 0.27, y: 4.8, w: 12.8 };   // headline rules on the deck's rule line (1.74 in)

// ---------- 1  stacked columns + CAGR table ----------
let y = R1.y + S.subhead(slide, 1, "Fine jewelry has a lower growth rate", R1.x, R1.y, R1.w);
T("China fine jewelry annual market size and growth", R1.x + 0.35, y, 5.6, 0.27, { fontSize: 15 });
T("CNY Billion", R1.x + 0.35, y + 0.25, 3, 0.27, { fontSize: 15, italic: true });
const totals = [532, 722, 998], share = [0.15, 0.18, 0.24];            // fashion share as drawn in the brief
const fashion = totals.map((t, i) => Math.round(t * share[i])), fine = totals.map((t, i) => t - fashion[i]);
const periods = ["2013", "2018", "2023E"];
const cb = { x: R1.x + 0.25, y: 2.4, w: 3.2, h: 2.4 };                // chart box
const PL = { x: 0.04, y: 0.12, w: 0.92, h: 0.74 }, VMAX = 1000;        // plot area (fractions of the box) and value scale
slide.addChart(pres.ChartType.bar, [
  { name: "Fine jewelry", labels: periods, values: fine },
  { name: "Fashion jewelry", labels: periods, values: fashion },
], { ...cb, barDir: "col", barGrouping: "stacked", chartColors: [LIGHT, DARK], barGapWidthPct: 55, showLegend: false, showValue: false,
  valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: VMAX, valGridLine: { style: "none" }, catGridLine: { style: "none" },
  catAxisLabelFontSize: 15, catAxisLabelColor: C.text, catAxisLabelFontFace: "Arial", catAxisLineShow: true, catAxisLineColor: "000000",
  layout: PL });
const px = cb.x + PL.x * cb.w, pw = PL.w * cb.w, py = cb.y + PL.y * cb.h, ph = PL.h * cb.h;
totals.forEach((t, i) => {                                             // total above each column
  const cx = px + (i + 0.5) * pw / 3, top = py + (1 - t / VMAX) * ph;
  T(String(t), cx - 0.45, top - 0.3, 0.9, 0.27, { fontSize: 15, align: "center", valign: "bottom" });
});
// CAGR table beside the stack: rows read top to bottom like the stack (fashion on top), total last
const tx = 3.85, lw = 1.12, cw = 0.78, c1 = tx + lw, c2 = c1 + cw;
["13-18", "18-23"].forEach((h, j) => {
  const x = c1 + j * cw;
  slide.addText([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: h, options: {} }],
    { x, y: 2.45, w: cw, h: 0.55, fontFace: "Arial", fontSize: 15, color: C.text, align: "center", valign: "top", margin: 0, isTextBox: true });
});
const rows = [["Fashion jewelry", "9%", "13%", DARK], ["Fine jewelry", "4%", "5%", LIGHT], ["Total", "4%", "7%", null]];
const ry0 = 3.1, rh = 0.52;
rows.forEach(([name, a, b, col], k) => {
  const ry = ry0 + k * rh + (k === 2 ? 0.12 : 0);
  if (k === 2) slide.addShape("line", { x: tx, y: ry - 0.06, w: lw + 2 * cw, h: 0, line: { color: C.g2, width: 0.75 } });
  if (col) slide.addShape("rect", { x: tx, y: ry + rh / 2 - 0.07, w: 0.14, h: 0.14, fill: { color: col }, line: { type: "none" } });
  T(name, tx + (col ? 0.2 : 0), ry, lw - 0.2 + (col ? 0 : 0.2), rh, { fontSize: 14, valign: "middle", bold: k === 2 });
  T(a, c1, ry, cw, rh, { fontSize: 15, align: "center", valign: "middle", bold: k === 2 });
  T(b, c2, ry, cw, rh, { fontSize: 15, align: "center", valign: "middle", bold: k === 2 });
});
slide.addShape("ellipse", { x: c1 + 0.1, y: ry0 + rh + 0.04, w: cw - 0.2, h: rh - 0.08, fill: { type: "none" }, line: { color: RED, width: 1.75 } });

// ---------- 2  CTF revenue: two years with CAGR, and the 2018 split ----------
y = R2.y + S.subhead(slide, 2, "Fine jewelry accounts for the majority of CTF*", R2.x, R2.y, R2.w);
// 2a revenue 2013 vs 2018
T("CTF's annual revenue", R2.x + 0.1, y, 3.2, 0.27, { fontSize: 15 });
T("CNY Billion", R2.x + 0.1, y + 0.25, 2.5, 0.27, { fontSize: 15, italic: true });
const rb = { x: R2.x + 0.1, y: 2.75, w: 2.9, h: 2.05 }, RPL = { x: 0.05, y: 0.3, w: 0.9, h: 0.56 }, RMAX = 60;
slide.addChart(pres.ChartType.bar, [{ name: "Revenue", labels: ["2013", "2018"], values: [47, 48] }],
  { ...rb, barDir: "col", chartColors: [DARK], barGapWidthPct: 70, showLegend: false, showValue: true, dataLabelPosition: "outEnd",
    dataLabelFontSize: 15, dataLabelColor: C.text, dataLabelFontFace: "Arial", dataLabelFormatCode: "#,##0",
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: RMAX, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: 15, catAxisLabelColor: C.text, catAxisLabelFontFace: "Arial", catAxisLineShow: true, catAxisLineColor: "000000", layout: RPL });
// CAGR callout: arrow over the two columns with the rate in an ellipse (the deck's growth callout, E-Cluster 16)
const rx = rb.x + RPL.x * rb.w, rw = RPL.w * rb.w, ry = rb.y + RPL.y * rb.h;
slide.addShape("line", { x: rx + rw * 0.15, y: ry - 0.33, w: rw * 0.7, h: 0, line: { color: "000000", width: 1.5, endArrowType: "triangle" } });
slide.addShape("ellipse", { x: rx + rw / 2 - 0.62, y: ry - 0.52, w: 1.24, h: 0.38, fill: { color: "FFFFFF" }, line: { color: "000000", width: 1 } });
T("CAGR 1%", rx + rw / 2 - 0.62, ry - 0.52, 1.24, 0.38, { fontSize: 14, bold: true, align: "center", valign: "middle" });
// 2b 2018 revenue by segment: one 100% column, fashion (dark) on top as in panel 1
const sx = 9.85;
T("CTF's 2018 revenue by segment", sx, y, 3.22, 0.27, { fontSize: 15 });
T("%", sx, y + 0.25, 1, 0.27, { fontSize: 15, italic: true });
const col = { x: sx + 0.25, y: 2.6, w: 1.0, h: 1.9 }, fH = col.h * 0.11;
slide.addShape("rect", { x: col.x, y: col.y, w: col.w, h: fH, fill: { color: DARK }, line: { color: "FFFFFF", width: 0.75 } });
slide.addShape("rect", { x: col.x, y: col.y + fH, w: col.w, h: col.h - fH, fill: { color: LIGHT }, line: { color: "FFFFFF", width: 0.75 } });
T("89%", col.x, col.y + fH, col.w, col.h - fH, { fontSize: 15, bold: true, align: "center", valign: "middle" });
T("2018", col.x - 0.1, col.y + col.h + 0.04, col.w + 0.2, 0.27, { fontSize: 15, align: "center" });
slide.addShape("line", { x: col.x - 0.1, y: col.y + col.h, w: col.w + 0.2, h: 0, line: { color: "000000", width: 0.75 } });
const lx = col.x + col.w + 0.15;
T([{ text: "Fashion jewelry ", options: {} }, { text: "11%", options: { bold: true } }], lx, col.y - 0.1, 1.85, 0.55, { fontSize: 14, valign: "middle" });
T([{ text: "Fine jewelry ", options: {} }, { text: "89%", options: { bold: true } }], lx, col.y + fH + (col.h - fH) / 2 - 0.2, 1.85, 0.4, { fontSize: 14, valign: "middle" });

// ---------- 3  constraints: three icon boxes in a grey band ----------
const y3 = R3.y + S.subhead(slide, 3, "Major constraints limit the further development of fine jewelry", R3.x, R3.y, R3.w);
const band = { x: 0.65, y: y3 - 0.02, w: 12.42, h: 7.0 - (y3 - 0.02) };
slide.addShape("rect", { ...band, fill: { color: C.g1 }, line: { type: "none" } });
const items = [
  ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
  ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
  ["trending-down", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
];
const bw = band.w / 3;
items.forEach(([ic, head, body], i) => {
  const x = band.x + i * bw + 0.12;
  if (i) slide.addShape("line", { x: band.x + i * bw - 0.05, y: band.y + 0.18, w: 0, h: band.h - 0.36, line: { color: C.g4, width: 0.75 } });
  P.icon(slide, ic, x, band.y + 0.2, 0.34, { color: C.g4 });
  T(head, x + 0.45, band.y + 0.08, bw - 0.6, 0.58, { fontSize: 16, bold: true, valign: "middle" });
  T(body, x + 0.05, band.y + 0.72, bw - 0.3, band.h - 0.8, { fontSize: 15, italic: true });
});

// note line above the sources (the deck puts its footnote there)
T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.05, 8, 0.22, { fontSize: 10, italic: true, color: NOTE });

L.save(pres, __dirname + "/candidate.pptx");
