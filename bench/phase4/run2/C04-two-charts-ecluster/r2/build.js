// C04 (deck as reference, leave-one-out): two chart panels on top + three constraint cards below (T2B1),
// in the look of Case-2019-E-Cluster. Style from the deck's profile; panel geometry, chip / headline / rule,
// stacked columns with a CAGR table and a red circle, and the grey icon-card band follow the deck's slide 5
// (same layout family, T2B1); dotted connector lines and the arrow + oval growth label follow slide 16.
// Charts are native (editable data); labels are overlaid at computed positions. Every number is from the prompt.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P } = L.start({ ref: "Case-2019-E-Cluster",
  title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " } });

const FONT = "Arial";
const NAVY = "10366C", CHIP = "283954", LIGHT = "C1DBEB", GREY = "A6A6A6", RED = "CC0000", BOXG = "F1F1F1", INK = "000000", FOOT = "585858", RULE = "202C4F";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || INK, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true, underline: o.underline ? { style: "sng" } : undefined, lineSpacingMultiple: o.ls });

// numbered sub-headline: ellipse chip + bold headline + rule under the headline text (deck's panel form)
function head(n, text, x, y, ruleTo, o = {}) {
  const d = 0.31;
  slide.addShape("ellipse", { x, y: y + 0.03, w: d, h: d, fill: { color: CHIP }, line: { type: "none" } });
  T(String(n), x, y + 0.03, d, d, { pt: 15, color: "FFFFFF", align: "center", valign: "middle" });
  T(text, x + 0.38, y - 0.02, ruleTo - x - 0.38, 0.4, { pt: o.pt || 17, bold: true, color: NAVY, valign: "middle" });
  if (o.rule !== false) slide.addShape("line", { x: x + 0.38, y: y + 0.4, w: ruleTo - x - 0.38, h: 0, line: { color: NAVY, width: 1.5 } });
}
// native stacked column chart with a fixed plot area, so overlay labels can be placed on the bars
const PLOT = { top: 0.12, h: 0.76 };
function columns(box, labels, series, colors, max, gap = 60) {
  slide.addChart(pres.ChartType.bar, series.map((s) => ({ name: s.name, labels, values: s.values })), {
    ...box, barDir: "col", barGrouping: "stacked", chartColors: colors, showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: max,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontSize: 14, catAxisLabelFontFace: FONT, catAxisLabelColor: INK,
    catAxisLineShow: true, catAxisLineColor: INK, catAxisMajorTickMark: "none", barGapWidthPct: gap, layout: { x: 0, y: PLOT.top, w: 1, h: PLOT.h } });
  const n = labels.length, slot = box.w / n, bw = slot / (1 + gap / 100), base = box.y + box.h * (PLOT.top + PLOT.h), k = (box.h * PLOT.h) / max;
  return { cx: (i) => box.x + slot * (i + 0.5), bw, base, yOf: (v) => base - v * k };
}

// ---------- 1  Fine jewelry has a lower growth rate ----------
head(1, "Fine jewelry has a lower growth rate", 0.27, 1.38, 6.38);
T("China fine jewelry annual market size and growth", 0.65, 1.88, 5.7, 0.26, { pt: 14 });
T("CNY Billion", 0.65, 2.12, 3, 0.26, { pt: 14, italic: true });
const yrs = ["2013", "2018", "2023E"], fine = [53, 72, 99], fash = [2, 2, 8];
const c1 = columns({ x: 0.6, y: 2.38, w: 3.05, h: 2.4 }, yrs, [{ name: "Fine jewelry", values: fine }, { name: "Fashion jewelry", values: fash }], [LIGHT, NAVY], 110);
yrs.forEach((_, i) => {
  const yTop = c1.yOf(fine[i] + fash[i]);
  T(String(fine[i]), c1.cx(i) - 0.4, (c1.yOf(fine[i]) + c1.base) / 2 - 0.13, 0.8, 0.26, { pt: 14, align: "center", valign: "middle" });
  T(String(fash[i]), c1.cx(i) - 0.4, yTop - 0.3, 0.8, 0.26, { pt: 14, bold: true, color: NAVY, align: "center", valign: "bottom" });
});
// CAGR table beside the stack, rows level with their segments; the highlighted row's first CAGR is circled in red
const nx = 3.78, nw = 1.25, cw = 0.72, cxs = [5.36, 6.02];
["13-18", "18-23"].forEach((h, j) => {
  T("CAGR", cxs[j] - cw / 2, 2.42, cw, 0.25, { pt: 14, align: "center", underline: true });
  T(h, cxs[j] - cw / 2, 2.67, cw, 0.25, { pt: 14, align: "center" });
});
const rows = [["Fashion\njewelry", "23%", "18%", 3.15, true], ["Fine\njewelry", "4%", "5%", 3.74, false], ["Total", "4%", "7%", 4.33, false]];
rows.forEach(([name, a, b, yc, hi]) => {
  T(name, nx, yc - 0.25, nw, 0.5, { pt: 14, bold: hi, color: hi ? NAVY : INK, valign: "middle" });
  [a, b].forEach((v, j) => T(v, cxs[j] - cw / 2, yc - 0.15, cw, 0.3, { pt: 14, bold: hi, color: hi ? NAVY : INK, align: "center", valign: "middle" }));
});
slide.addShape("line", { x: nx, y: 4.06, w: 6.38 - nx, h: 0, line: { color: GREY, width: 0.75 } });
slide.addShape("ellipse", { x: cxs[0] - 0.33, y: 3.15 - 0.21, w: 0.66, h: 0.42, fill: { type: "none" }, line: { color: RED, width: 1.5 } });

// ---------- 2  Fine jewelry accounts for the majority of CTF* ----------
head(2, "Fine jewelry accounts for the majority of CTF*", 6.88, 1.38, 13.07);
T("CTF's annual revenue", 7.26, 1.88, 2.7, 0.26, { pt: 14 });
T("CNY Billion", 7.26, 2.12, 2.5, 0.26, { pt: 14, italic: true });
const rv = [47, 48];
const c2 = columns({ x: 7.3, y: 2.38, w: 2.3, h: 2.4 }, ["2013", "2018"], [{ name: "CTF revenue", values: rv }], [GREY], 72);
rv.forEach((v, i) => T(String(v), c2.cx(i) - 0.4, c2.yOf(v) - 0.3, 0.8, 0.26, { pt: 14, align: "center", valign: "bottom" }));
// growth arrow with the CAGR in an oval (deck's form for growth over a column series)
const ay0 = c2.yOf(rv[0]) - 0.48, ay1 = c2.yOf(rv[1]) - 0.5;
slide.addShape("line", { x: c2.cx(0) - 0.25, y: ay1, w: c2.cx(1) - c2.cx(0) + 0.5, h: ay0 - ay1, flipV: true, line: { color: INK, width: 2, endArrowType: "triangle" } });
slide.addShape("ellipse", { x: (c2.cx(0) + c2.cx(1)) / 2 - 0.55, y: (ay0 + ay1) / 2 - 0.18, w: 1.1, h: 0.36, fill: { color: "FFFFFF" }, line: { color: INK, width: 1 } });
T("CAGR 1%", (c2.cx(0) + c2.cx(1)) / 2 - 0.55, (ay0 + ay1) / 2 - 0.18, 1.1, 0.36, { pt: 14, bold: true, align: "center", valign: "middle" });

T("CTF's 2018 revenue by segment", 10.05, 1.88, 3.0, 0.26, { pt: 14 });
T("%", 10.05, 2.12, 2.5, 0.26, { pt: 14, italic: true });
const c3 = columns({ x: 10.1, y: 2.38, w: 1.2, h: 2.4 }, ["2018"], [{ name: "Fine jewelry", values: [89] }, { name: "Fashion jewelry", values: [11] }], [LIGHT, NAVY], 100);
T("89%", c3.cx(0) - 0.4, (c3.yOf(89) + c3.base) / 2 - 0.13, 0.8, 0.26, { pt: 14, align: "center", valign: "middle" });
T("11%", c3.cx(0) - 0.4, (c3.yOf(100) + c3.yOf(89)) / 2 - 0.12, 0.8, 0.24, { pt: 14, color: "FFFFFF", bold: true, align: "center", valign: "middle" });
T("Fashion jewelry", c3.cx(0) + c3.bw / 2 + 0.12, (c3.yOf(100) + c3.yOf(89)) / 2 - 0.15, 1.6, 0.3, { pt: 14, bold: true, color: NAVY, valign: "middle" });
T("Fine jewelry", c3.cx(0) + c3.bw / 2 + 0.12, (c3.yOf(89) + c3.base) / 2 - 0.15, 1.6, 0.3, { pt: 14, valign: "middle" });
// dotted lines: the 2018 revenue column broken down by segment
const rx = c2.cx(1) + c2.bw / 2, lx = c3.cx(0) - c3.bw / 2;
slide.addShape("line", { x: rx, y: c3.yOf(100), w: lx - rx, h: c2.yOf(48) - c3.yOf(100), flipV: true, line: { color: "7F7F7F", width: 1, dashType: "sysDot" } });
slide.addShape("line", { x: rx, y: c2.base - 0.005, w: lx - rx, h: 0, line: { color: "7F7F7F", width: 1, dashType: "sysDot" } });

// ---------- 3  Major constraints limit the further development of fine jewelry ----------
head(3, "Major constraints limit the further development of fine jewelry", 0.27, 4.93, 13.07, { pt: 16, rule: false });
const band = { x: 0.64, y: 5.32, w: 13.07 - 0.64, h: 1.69 };
slide.addShape("rect", { ...band, fill: { color: BOXG }, line: { type: "none" } });
const cards = [
  ["users-group", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
  ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
  ["flame", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
];
const colW = band.w / 3;
cards.forEach(([ic, label, text], i) => {
  const x = band.x + i * colW;
  if (i) slide.addShape("line", { x, y: band.y + 0.12, w: 0, h: band.h - 0.24, line: { color: GREY, width: 0.75 } });
  P.icon(slide, ic, x + 0.12, band.y + 0.12, 0.3, { color: "354B70", width: 1.25 });
  T(label, x + 0.5, band.y + 0.1, colW - 0.6, 0.34, { pt: 15, bold: true, valign: "middle" });
  T(text, x + 0.55, band.y + 0.5, colW - 0.75, band.h - 0.58, { pt: 15, italic: true, ls: 0.95 });
});

// note and the deck's footer rule
T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.04, 8, 0.2, { pt: 10, italic: true, color: FOOT });
slide.addShape("line", { x: 0, y: 7.25, w: 13.333, h: 0, line: { color: RULE, width: 0.75 } });

L.save(pres, __dirname + "/candidate.pptx");
