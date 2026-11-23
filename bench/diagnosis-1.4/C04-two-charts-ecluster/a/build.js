// C04 (variant a): two-exhibit market slide + three constraint boxes, in the E-Cluster deck's style.
// Approach: E-Cluster style profile (P.useStyle via L.start). Layout taken from the deck's closest OTHER slide,
// E-Cluster 5 (its T2B1 arrangement, read from its shapes): numbered panel heads at the same places, two exhibits on top,
// a grey band of three icon columns underneath. Charts are native (editable data); totals, the CAGR table and the
// callouts are drawn over them at positions computed from a fixed plot area.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const { pres, slide, P, prof } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const F = P.THEME.bodyFontFace;
const ps = prof.panel;                        // measured panel head: ellipse chip, 17 pt bold headline, rule
const HEAD = ps.colour;                       // 10366C, headline / rule colour
const BAR = "10366C", LIGHT = "C1DBEB", RED = "CC0000", GREY = "7E7E7E", TXT = "000000";
const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || TXT, bold: !!o.bold, italic: !!o.italic,
  underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true, paraSpaceAfter: o.psa || 0 });

// ---------- numbered panel head (E-Cluster: ellipse chip left, headline, rule under the headline) ----------
function head(n, text, x, y, ruleX1, tw = 6.0) {
  slide.addShape("ellipse", { x, y, w: ps.size, h: ps.size, fill: { color: ps.fill }, line: { type: "none" } });
  t(String(n), x, y, ps.size, ps.size, { size: ps.chip_pt, color: "FFFFFF", align: "center", valign: "middle" });
  t(text, x + 0.35, y - 0.02, tw, 0.34, { size: ps.pt, bold: true, color: HEAD, valign: "middle" });
  if (ruleX1) slide.addShape("line", { x: x + 0.37, y: y + 0.33, w: ruleX1 - x - 0.37, h: 0, line: { color: ps.rule[0], width: ps.rule[1] } });
}
head(1, "Fine jewelry has a lower growth rate", 0.27, 1.43, 6.39);
head(2, "Fine jewelry accounts for the majority of CTF*", 6.86, 1.43, 13.08);
head(3, "Major constraints limit the further development of fine jewelry", 0.27, 4.91, null, 12.3);

// ---------- native stacked/plain columns with a fixed plot area, so labels can be placed over them ----------
// returns the geometry: column centre x and y of a value
function columns(series, labels, colors, box, max, gap = 70) {
  const pl = { x: 0.02, y: 0.02, w: 0.96, h: 0.84 };
  slide.addChart(pres.ChartType.bar, series.map((s) => ({ name: s.name, labels, values: s.values })), {
    ...box, barDir: "col", barGrouping: series.length > 1 ? "stacked" : "clustered", chartColors: colors, showLegend: false, showValue: false,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: 14, catAxisLabelColor: TXT, catAxisLabelFontFace: F, catAxisLineShow: true, catAxisLineColor: GREY,
    barGapWidthPct: gap, layout: pl });
  const pw = box.w * pl.w, n = labels.length, cw = pw / n, bw = cw / (1 + gap / 100);
  return { cx: (i) => box.x + box.w * pl.x + cw * (i + 0.5), bw, y: (v) => box.y + box.h * pl.y + box.h * pl.h * (1 - v / max), base: box.y + box.h * (pl.y + pl.h) };
}

// ---------- panel 1: market size stack + CAGR table ----------
t([{ text: "China fine jewelry annual market size and growth", options: { breakLine: true } }, { text: "CNY Billion", options: { italic: true } }], 0.64, 1.86, 5.7, 0.5, { size: 14 });
const yrs = ["2013", "2018", "2023E"], fine = [53, 72, 99], fash = [2, 2, 8];
const g1 = columns([{ name: "Fine jewelry", values: fine }, { name: "Fashion jewelry", values: fash }], yrs, [LIGHT, BAR], { x: 0.55, y: 2.55, w: 3.05, h: 2.2 }, 112);
yrs.forEach((_, i) => {
  const tot = fine[i] + fash[i];
  t(String(tot), g1.cx(i) - 0.4, g1.y(tot) - 0.3, 0.8, 0.28, { size: 14, bold: true, align: "center", valign: "bottom" });
  t(String(fine[i]), g1.cx(i) - 0.4, (g1.y(fine[i]) + g1.base) / 2 - 0.14, 0.8, 0.28, { size: 14, align: "center", valign: "middle" });
  t(String(fash[i]), g1.cx(i) + g1.bw / 2 + 0.03, g1.y(tot) - 0.03, 0.3, 0.24, { size: 12, color: BAR, bold: true, valign: "middle" });
});
// CAGR table beside the stack: underlined headers, legend squares as row labels, the key CAGR circled in red
const tx = 3.75, c1 = 5.0, c2 = 5.75, cw = 0.66;
t([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "13-18" }], c1, 2.3, cw, 0.5, { size: 14, align: "center" });
t([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "18-23" }], c2, 2.3, cw, 0.5, { size: 14, align: "center" });
slide.addShape("line", { x: tx, y: 2.86, w: c2 + cw - tx, h: 0, line: { color: GREY, width: 0.75 } });
const rows = [["Fashion jewelry", "23%", "18%", BAR, true], ["Fine jewelry", "4%", "5%", LIGHT, false], ["Total", "4%", "7%", null, false]];
rows.forEach(([nm, a, b, col, hi], k) => {
  const y = 3.0 + k * 0.52;
  if (col) slide.addShape("rect", { x: tx, y: y + 0.13, w: 0.16, h: 0.16, fill: { color: col }, line: { type: "none" } });
  t(nm, tx + 0.22, y, 1.05, 0.42, { size: 14, bold: !col, valign: "middle" });
  t(a, c1, y, cw, 0.42, { size: 14, bold: hi, color: hi ? BAR : TXT, align: "center", valign: "middle" });
  t(b, c2, y, cw, 0.42, { size: 14, bold: hi, color: hi ? BAR : TXT, align: "center", valign: "middle" });
  if (k === 1) slide.addShape("line", { x: tx, y: y + 0.47, w: c2 + cw - tx, h: 0, line: { color: GREY, width: 0.75, dashType: "dash" } });
});
slide.addShape("ellipse", { x: c1 - 0.02, y: 3.0, w: cw + 0.04, h: 0.42, fill: { type: "none" }, line: { color: RED, width: 1.75 } });

// ---------- panel 2: CTF revenue + revenue split ----------
t([{ text: "CTF's annual revenue", options: { breakLine: true } }, { text: "CNY Billion", options: { italic: true } }], 7.23, 1.86, 2.9, 0.5, { size: 14 });
t([{ text: "CTF's 2018 revenue by segment", options: { breakLine: true } }, { text: "%", options: { italic: true } }], 9.98, 1.86, 3.1, 0.5, { size: 14 });
const g2 = columns([{ name: "Revenue", values: [47, 48] }], ["2013", "2018"], [BAR], { x: 7.2, y: 2.75, w: 2.4, h: 2.0 }, 58, 80);
[47, 48].forEach((v, i) => t(String(v), g2.cx(i) - 0.4, g2.y(v) - 0.3, 0.8, 0.28, { size: 14, bold: true, align: "center", valign: "bottom" }));
// CAGR arrow over the two columns with the rate in an oval (E-Cluster 16)
const ay = g2.y(48) - 0.5;
slide.addShape("line", { x: g2.cx(0), y: ay, w: g2.cx(1) - g2.cx(0), h: 0, line: { color: TXT, width: 1.5, endArrowType: "triangle" } });
slide.addShape("ellipse", { x: (g2.cx(0) + g2.cx(1)) / 2 - 0.55, y: ay - 0.2, w: 1.1, h: 0.4, fill: { color: "FFFFFF" }, line: { color: TXT, width: 1 } });
t([{ text: "CAGR ", options: {} }, { text: "1%", options: { bold: true } }], (g2.cx(0) + g2.cx(1)) / 2 - 0.55, ay - 0.2, 1.1, 0.4, { size: 13, align: "center", valign: "middle" });
// separator between the two exhibits of panel 2
slide.addShape("line", { x: 9.8, y: 2.0, w: 0, h: 2.7, line: { color: "C3C6CA", width: 0.75, dashType: "dash" } });
// 100% column: fine (light) under fashion (highlighted), labels to the right
const g3 = columns([{ name: "Fine jewelry", values: [89] }, { name: "Fashion jewelry", values: [11] }], ["2018"], [LIGHT, BAR], { x: 10.15, y: 2.55, w: 1.4, h: 2.2 }, 100, 60);
t("89%", g3.cx(0) - 0.4, (g3.y(89) + g3.base) / 2 - 0.14, 0.8, 0.28, { size: 14, align: "center", valign: "middle" });
t("11%", g3.cx(0) - 0.4, (g3.y(100) + g3.y(89)) / 2 - 0.14, 0.8, 0.28, { size: 14, color: "FFFFFF", bold: true, align: "center", valign: "middle" });
const lx = g3.cx(0) + g3.bw / 2 + 0.1;
slide.addShape("line", { x: g3.cx(0) + g3.bw / 2, y: g3.y(100), w: 0.1, h: 0, line: { color: GREY, width: 0.75, dashType: "dash" } });
t("Fashion jewelry", lx + 0.02, (g3.y(100) + g3.y(89)) / 2 - 0.2, 1.75, 0.4, { size: 14, bold: true, color: BAR, valign: "middle" });
t("Fine jewelry", lx + 0.02, (g3.y(89) + g3.base) / 2 - 0.2, 1.75, 0.4, { size: 14, valign: "middle" });

// ---------- panel 3: grey band, three constraint columns with icons ----------
const band = { x: 0.64, y: 5.28, w: 12.45, h: 1.72 };
slide.addShape("rect", { ...band, fill: { color: prof.roles.panel }, line: { type: "none" } });
slide.addShape("line", { x: band.x, y: band.y, w: band.w, h: 0, line: { color: HEAD, width: 1.5 } });
const items = [
  ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
  ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
  ["trophy", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
];
const colW = band.w / 3;
items.forEach(([ic, lab, body], i) => {
  const x = band.x + i * colW;
  if (i) slide.addShape("line", { x, y: band.y + 0.33, w: 0, h: 1.27, line: { color: "A6A6A6", width: 0.5 } });
  P.icon(slide, ic, x + 0.13, band.y + 0.2, 0.3, { color: GREY });
  // label and reading in one box, as the reference band does, so a two-line label pushes the text down
  t([{ text: lab, options: { bold: true, fontSize: 16, breakLine: true } }, { text: body, options: { italic: true, fontSize: 15 } }],
    x + 0.49, band.y + 0.1, colW - 0.62, band.h - 0.18, { size: 15, color: TXT, psa: 2 });
});
// footer rule over the note / source lines, as on every E-Cluster content slide
slide.addShape("rect", { x: 0, y: 7.25, w: 13.333, h: 0.01, fill: { color: "202C4F" }, line: { type: "none" } });
t("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.05, 6, 0.19, { size: 10, italic: true, color: "585858" });

L.save(pres, __dirname + "/candidate.pptx");
