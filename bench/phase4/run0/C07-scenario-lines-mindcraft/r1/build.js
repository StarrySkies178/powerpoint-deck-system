// C07 rebuild r1: two scenario line charts in the Mindcraft deck's look (deck as reference, leave-one-out).
// Layout: HALF2 (two numbered panels, as on the deck's other two-panel financial / analysis slides 4, 5 and 8):
// each panel = numbered sub-headline, italic chart title, drawn line chart with end labels, grey reading box.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
});
const C = P.C, F = P.THEME.bodyFontFace;
const RED = C.navy;                      // the deck's main colour (C00000)
const DARK = "5C5C5C", LIGHT = "A6A6A6", BOX = "F1F1F1";
const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.pt || 14, color: o.color || "000000",
  bold: !!o.bold, italic: !!o.italic, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

// the deck's breadcrumb: italic bold 14 pt, past sections grey, current one red, red triangles between (drawn here:
// the framework's crumbLine has no italic and no triangle shapes)
[["Market Analysis", 0.36, "A6A6A6"], ["Growth Strategy", 2.88, "A6A6A6"], ["Financial Forecasting", 5.56, RED]].forEach(([s, x, c]) =>
  t(s, x, 0.04, 3.2, 0.3, { pt: 14, bold: true, italic: true, color: c }));
[2.42, 5.12].forEach((x) => slide.addShape("triangle", { x, y: 0.07, w: 0.22, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } }));
// source line in the master's source placeholder, italic as on every slide of the deck
slide.addText([{ text: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg", options: { italic: true } }], { placeholder: "source" });
// team mark in the footer, written as text (no logo file in Objects/Brand)
t("MindCraft", 11.2, 7.2, 1.45, 0.26, { pt: 12, bold: true, color: RED, align: "right" });

// the deck's reading box: light grey fill, round bullets, 14 pt black text
function reading(items, x, y, w, h) {
  slide.addShape("rect", { x, y, w, h, fill: { color: BOX }, line: { type: "none" } });
  slide.addText(items.map((s, i) => ({ text: s, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1 } })),
    { x: x + 0.08, y: y + 0.04, w: w - 0.16, h: h - 0.08, fontFace: F, fontSize: 14, color: "000000", valign: "middle", margin: 0, paraSpaceAfter: 2, isTextBox: true });
}

// drawn line chart (the deck's charts are drawn, not native): segments + markers, value labels, year axis
function lines(spec, box) {
  const { years, series, min, max } = spec, n = years.length;
  const x0 = box.x + 0.3, x1 = box.x + box.w - 0.3, dx = (x1 - x0) / (n - 1);
  const yTop = box.y + 0.3, yBot = box.y + box.h - 0.42, Y = (v) => yBot - ((v - min) / (max - min)) * (yBot - yTop);
  const X = (i) => x0 + i * dx;
  slide.addShape("line", { x: box.x, y: box.y + box.h - 0.36, w: box.w, h: 0, line: { color: "000000", width: 0.75 } });   // category axis
  years.forEach((yr, i) => t(yr, X(i) - 0.45, box.y + box.h - 0.32, 0.9, 0.3, { pt: 12, align: "center" }));
  series.forEach((s) => {
    for (let i = 0; i + 1 < n; i++) {
      const ya = Y(s.values[i]), yb = Y(s.values[i + 1]);
      slide.addShape("line", { x: X(i), y: Math.min(ya, yb), w: dx, h: Math.abs(yb - ya), flipV: yb < ya, line: { color: s.color, width: s.width || 2.25 } });
    }
    s.values.forEach((v, i) => slide.addShape("ellipse", { x: X(i) - 0.045, y: Y(v) - 0.045, w: 0.09, h: 0.09, fill: { color: s.color }, line: { type: "none" } }));
  });
  // value labels: top series above, bottom series below, middle series only where there is room between the lines
  const top = series[0], mid = series[1], bot = series[2], LH = 0.24;
  for (let i = 0; i < n; i++) {
    if (i === 0) { t(String(top.values[0]), X(0) - 0.4, Y(top.values[0]) - LH - 0.04, 0.8, LH, { pt: 12, align: "center" }); continue; }
    t(spec.fmt(top.values[i]), X(i) - 0.4, Y(top.values[i]) - LH - 0.05, 0.8, LH, { pt: 12, align: "center", color: RED, bold: true });
    t(spec.fmt(bot.values[i]), X(i) - 0.4, Y(bot.values[i]) + 0.06, 0.8, LH, { pt: 12, align: "center", color: DARK });
    const gapUp = Y(mid.values[i]) - Y(top.values[i]), gapDn = Y(bot.values[i]) - Y(mid.values[i]);
    if (gapUp > LH + 0.1) t(spec.fmt(mid.values[i]), X(i) - 0.4, Y(mid.values[i]) - LH - 0.04, 0.8, LH, { pt: 12, align: "center", color: "000000" });
    else if (gapDn > LH + 0.1) t(spec.fmt(mid.values[i]), X(i) - 0.4, Y(mid.values[i]) + 0.04, 0.8, LH, { pt: 12, align: "center", color: "000000" });
  }
  return { X, Y };
}
// hand-drawn style red circle the deck puts round the number that matters
const circle = (x, y, w, h) => slide.addShape("ellipse", { x, y, w, h, fill: { type: "none" }, line: { color: RED, width: 1.75 } });

const years = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
const B = { x: 0.37, y: 1.39, w: 12.68, h: 5.3 };
const half = (B.w - 0.3) / 2, LX = B.x, RX = B.x + half + 0.3;

// numbered sub-headlines (the deck's red square chip + bold line + grey rule), via the framework
const hh = S.subhead(slide, 1, "Resilient growth under scenario analysis", LX, B.y, half);
S.subhead(slide, 2, "Guaranteed financial feasibility", RX, B.y, half);
const cy = B.y + hh + 0.02;

// ---- panel 1: top line scenarios + CAGR column
t("CSS Top Line Scenario Analysis (¥ Bn)", LX, cy, half - 1.4, 0.32, { italic: true });
const s1 = [
  { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], color: RED, cagr: "17%" },
  { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], color: DARK, cagr: "12%" },
  { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2], color: LIGHT, cagr: "8%" },
];
const ch1 = { x: LX, y: cy + 0.34, w: half - 2.35, h: 3.2 };
const g1 = lines({ years, series: s1, min: 7, max: 18.6, fmt: (v) => v.toFixed(1) }, ch1);
const nx = ch1.x + ch1.w + 0.05, cx = LX + half - 0.95;
t("CAGR", cx, cy, 0.95, 0.28, { pt: 14, bold: true, underline: true, align: "center" });
t("18-23E", cx, cy + 0.28, 0.95, 0.26, { pt: 12, align: "center" });
s1.forEach((s, i) => {
  const yy = g1.Y(s.values[5]) - 0.14;
  t(s.name, nx, yy, 1.3, 0.28, { pt: 12, color: i === 0 ? RED : "000000", bold: i === 0 });
  t(s.cagr, cx, yy, 0.95, 0.28, { pt: 14, align: "center", color: i === 0 ? RED : "000000", bold: i === 0 });
});
circle(cx + 0.02, g1.Y(18.2) - 0.25, 0.9, 0.5);
reading([
  "Three cases all indicate above-market growth (7%)",
  "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers",
], LX, 5.55, half, 1.15);

// ---- panel 2: capex scenarios + burden row + return on capex
t("Required Annual Capex Scenario Analysis (¥ Mn)", RX, cy, half, 0.32, { italic: true });
const s2 = [
  { name: "Optimistic", values: [200, 231, 244, 255, 292, 309], color: RED },
  { name: "Base", values: [200, 209, 216, 233, 268, 277], color: DARK },
  { name: "Crush", values: [200, 175, 180, 201, 228, 243], color: LIGHT },
];
const lab = 0.85;
const ch2 = { x: RX + lab, y: cy + 0.34, w: half - lab - 1.2, h: 2.05 };
const g2 = lines({ years, series: s2, min: 140, max: 318, fmt: (v) => String(v) }, ch2);
s2.forEach((s, i) => t(s.name, ch2.x + ch2.w + 0.05, g2.Y(s.values[5]) - 0.14, 1.2, 0.28, { pt: 12, color: i === 0 ? RED : "000000", bold: i === 0 }));
// legend-free row labels in the left gutter, aligned with the years
const ry = ch2.y + ch2.h + 0.12;
t([{ text: "Capex", options: { breakLine: true } }, { text: "burden" }, { text: "1", options: { superscript: true } }], RX, ry - 0.08, lab + 0.2, 0.46, { pt: 12, bold: true });
[26, 22, 20, 19, 17].forEach((v, i) => t(v + "%", g2.X(i + 1) - 0.4, ry, 0.8, 0.3, { pt: 12, align: "center" }));
slide.addShape("line", { x: RX, y: ry + 0.44, w: half, h: 0, line: { color: LIGHT, width: 0.75, dashType: "dash" } });
const r2 = ry + 0.56;
t([{ text: "Return on capex under base case" }, { text: "2", options: { superscript: true } }], RX, r2, 4.1, 0.34, { pt: 12, bold: true });
t("~1.6 years", RX + 4.3, r2, 1.5, 0.34, { pt: 14, bold: true, color: RED, align: "center" });
circle(RX + 4.25, r2 - 0.07, 1.6, 0.48);
reading([
  "Increasing capital expenditure is required to support the offline expansion strategy",
  "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility",
], RX, 5.55, half, 1.15);

// note line above the source, as on the deck's slides 5 and 8
t([{ text: "Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store" }],
  0.39, 6.78, 12.4, 0.26, { pt: 10, italic: true, align: "left" });

L.save(pres, __dirname + "/candidate.pptx");
