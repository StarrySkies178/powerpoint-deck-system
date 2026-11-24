// C07 scenario lines, Mindcraft deck as the style (leave-one-out build).
// Approach: the deck's style profile (frame, title, rule), the HALF2 arrangement the deck uses for its two-panel
// analysis slides (map rows 5, 7, 8: numbered red chip + bold sub-headline + grey rule, italic exhibit title, chart,
// CAGR block beside the chart as on map rows 4 and 8, a ratio row under the chart as the "Pull-up ratio" row of map
// row 8, grey reading box with round bullets under the exhibit, italic note line, italic source).
// The line charts are drawn as shapes so each label can sit above / below its own line (the deck's charts are drawn).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE });
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.navy, DARK = "5C5C5C", MID = "808080", LIGHT = "A6A6A6", GREYBOX = "F1F1F1";
const LBL = 14;                                   // chart labels at the deck's body size (its drawn charts label at ~14 pt)
const BODYPT = 14;                                // deck body size (profile body.pt)

function t(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || LBL, color: o.color || C.text, bold: !!o.bold, italic: !!o.italic,
    underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
}

// ---------- section crumb (deck form: bold italic grey items, current one red, red triangles between) ----------
{
  const items = ["Market Analysis", "Growth Strategy", "Financial Forecasting"], cur = 2, step = 2.6, y = 0.06, h = 0.26;
  items.forEach((it, i) => {
    const x = 0.36 + i * step;
    t(it, x, y, 2.4, h, { size: 14, bold: true, italic: true, color: i === cur ? RED : LIGHT });
    if (i) slide.addShape("triangle", { x: x - 0.4, y: y + 0.03, w: 0.2, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  });
}
// source line in the deck's place, italic like the deck's
slide.addText([{ text: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg", options: { italic: true } }], { placeholder: "source" });

// ---------- drawn scenario line chart ----------
function lineChart(spec, box) {
  const n = spec.years.length, padL = 0.3, padR = 0.3, axisH = 0.3;
  const px = (i) => box.x + padL + (i * (box.w - padL - padR)) / (n - 1);
  const plotTop = box.y + (spec.topPad || 0.3), plotBot = box.y + box.h - axisH - (spec.botPad || 0.3);
  const py = (v) => plotBot - ((v - spec.min) / (spec.max - spec.min)) * (plotBot - plotTop);
  slide.addShape("line", { x: box.x, y: box.y + box.h - axisH, w: box.w, h: 0, line: { color: LIGHT, width: 1 } });
  spec.years.forEach((yv, i) => t(yv, px(i) - 0.45, box.y + box.h - axisH + 0.05, 0.9, axisH - 0.05, { align: "center" }));
  [...spec.series].reverse().forEach((s) => {
    const pts = s.values.map((v, i) => ({ x: px(i), y: py(v) }));
    const x0 = Math.min(...pts.map((p) => p.x)), y0 = Math.min(...pts.map((p) => p.y));
    const w = Math.max(...pts.map((p) => p.x)) - x0, h = Math.max(0.01, Math.max(...pts.map((p) => p.y)) - y0);
    slide.addShape("custGeom", { x: x0, y: y0, w, h, points: pts.map((p, i) => ({ x: p.x - x0, y: p.y - y0, ...(i ? {} : { moveTo: true }) })),
      fill: { type: "none" }, line: { color: s.color, width: s.width || 2 }, objectName: "line " + s.name });
    pts.forEach((p, i) => { if (!i) return; const d = 0.09;
      slide.addShape("ellipse", { x: p.x - d / 2, y: p.y - d / 2, w: d, h: d, fill: { color: s.color }, line: { color: "FFFFFF", width: 0.75 } }); });
  });
  const p0 = { x: px(0), y: py(spec.series[0].values[0]) }, d0 = 0.12;
  slide.addShape("ellipse", { x: p0.x - d0 / 2, y: p0.y - d0 / 2, w: d0, h: d0, fill: { color: DARK }, line: { color: "FFFFFF", width: 0.75 } });
  const lh = 0.26, lw = 0.7;
  t(spec.fmt(spec.series[0].values[0]), p0.x - lw / 2, p0.y - lh - 0.07, lw, lh, { align: "center" });
  spec.series.forEach((s) => s.values.forEach((v, i) => {
    if (i === 0) return;
    const pos = (s.posAt && s.posAt[i]) || s.pos, x = px(i), y = py(v);
    let bx = x - lw / 2, by = pos === "below" ? y + 0.07 : y - lh - 0.07;
    if (pos === "right") { bx = x + 0.08; by = y - lh / 2 + ((s.dyAt && s.dyAt[i]) || 0); }
    if (pos === "left") { bx = x - lw - 0.08; by = y - lh / 2; }
    t(spec.fmt(v), bx, by, lw, lh, { align: pos === "right" ? "left" : pos === "left" ? "right" : "center", bold: !!s.bold, color: s.bold ? RED : C.text });
  }));
  return { px, py, axisY: box.y + box.h - axisH };
}
const legendNames = (series, chart, x, lastI, nudge = {}) => series.forEach((s, i) => {
  const y = chart.py(s.values[lastI]) + (nudge[i] || 0);
  t(s.name, x, y - 0.14, 1.3, 0.28, { color: s.color === LIGHT ? MID : s.color, bold: i === 0 });
});
// circled figure block (deck form: "CAGR / 19E-23E / 12%" beside the waterfall, hand-drawn red circle on the key figure)
function figureBlock(x, y, w, head, sub, rows) {
  if (head) t(head, x, y, w, 0.26, { bold: true, underline: true, align: "center" });
  if (sub) t(sub, x, y + 0.26, w, 0.26, { align: "center" });
  rows.forEach((r) => {
    t(r.value, x, r.y - 0.13, w, 0.26, { align: "center", bold: !!r.hi, color: r.hi ? RED : C.text });
    if (r.hi) slide.addShape("ellipse", { x: x + w / 2 - 0.6, y: r.y - 0.24, w: 1.2, h: 0.48, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
  });
}
function reading(bullets, box) {           // deck form: light grey box, round bullets, body size, plain text
  slide.addShape("rect", { ...box, fill: { color: GREYBOX }, line: { type: "none" } });
  slide.addText(bullets.map((b, i) => ({ text: b, options: { bullet: { indent: 14 }, breakLine: i < bullets.length - 1 } })),
    { x: box.x + 0.08, y: box.y + 0.04, w: box.w - 0.16, h: box.h - 0.08, fontFace: FONT, fontSize: BODYPT, color: C.text, valign: "middle", margin: 0, isTextBox: true, paraSpaceAfter: 2 });
}

// ---------- geometry (HALF2 on the deck's margins) ----------
const top = B.y + 0.02, noteH = 0.26, bot = B.y + B.h - noteH - 0.04;
const gap = 0.35, pw = (B.w - gap) / 2;
const X1 = B.x, X2 = B.x + pw + gap;
const readH = 1.08, unitH = 0.3;
const years = ["2018", "2019", "2020", "2021", "2022", "2023E"], lastI = 5;

// ---------- panel 1: top line scenarios ----------
// legend in the empty top-left of the plot (deck form: legend squares top-left of the chart, map row 4), CAGR column at the
// right with each value level with its line end, the key one circled in red
{
  const x = X1, hh = S.subhead(slide, 1, "Resilient growth under scenario analysis", x, top, pw);
  let y = top + hh + 0.02;
  t("CSS Top Line Scenario Analysis (¥ Bn)", x, y, pw, unitH, { italic: true, size: BODYPT });
  const sideW = 1.05;
  t("CAGR", x + pw - sideW, y, sideW, unitH, { bold: true, underline: true, align: "center" });
  y += unitH + 0.02;
  t("18-23E", x + pw - sideW, y, sideW, 0.24, { align: "center" });
  const cw = pw - sideW - 0.05, ch = bot - readH - 0.12 - y;
  const series = [
    { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], color: RED, width: 2.5, pos: "above", bold: true },
    { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], color: DARK, width: 2, pos: "above", posAt: { 1: "right", 2: "right" }, dyAt: { 1: -0.06 } },
    { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2], color: LIGHT, width: 2, pos: "below" },
  ];
  const chart = lineChart({ years, min: 8.0, max: 18.2, topPad: 0.48, botPad: 0.3, fmt: (v) => v.toFixed(1), series }, { x, y, w: cw, h: ch });
  series.forEach((s, i) => {
    const ly = y + 0.1 + i * 0.32;
    slide.addShape("line", { x: x + 0.1, y: ly + 0.13, w: 0.35, h: 0, line: { color: s.color, width: s.width } });
    t(s.name + " case", x + 0.55, ly, 2.4, 0.28, { color: C.text, bold: i === 0 });
  });
  figureBlock(x + pw - sideW, y, sideW, "", "",
    series.map((s, i) => ({ y: chart.py(s.values[lastI]), value: ["17%", "12%", "8%"][i], hi: i === 0 })));
  reading(["Three cases all indicate above-market growth (7%)",
    "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"],
    { x, y: bot - readH, w: pw, h: readH });
}

// ---------- panel 2: capex scenarios ----------
// series names at the line ends, payback figure circled top-left, capex burden as a ratio row under the axis
// (deck form: red bold italic row label, values under their years, as the "Pull-up ratio" row)
{
  const x = X2, hh = S.subhead(slide, 2, "Guaranteed financial feasibility", x, top, pw);
  let y = top + hh + 0.02;
  t("Required Annual Capex Scenario Analysis (¥ Mn)", x, y, pw, unitH, { italic: true, size: BODYPT });
  y += unitH + 0.04;
  const leftW = 1.3, sideW = 1.3, rowH = 0.36;
  const cx = x + leftW, cw = pw - leftW - sideW, ch = bot - readH - 0.12 - rowH - y;
  const series = [
    { name: "Optimistic", values: [200, 231, 244, 255, 292, 309], color: RED, width: 2.5, pos: "above", bold: true },
    { name: "Base", values: [200, 209, 216, 233, 268, 277], color: DARK, width: 2, pos: "below" },
    { name: "Crush", values: [200, 175, 180, 201, 228, 243], color: LIGHT, width: 2, pos: "below" },
  ];
  const chart = lineChart({ years, min: 165, max: 309, topPad: 0.3, botPad: 0.32, fmt: (v) => String(v), series }, { x: cx - 0.1, y, w: cw + 0.1, h: ch });
  legendNames(series, chart, cx + cw + 0.08, lastI);
  const sx = x, sxW = leftW - 0.1, by = y + 0.05;   // payback block top-left, as the CAGR block left of the deck's waterfall
  t([{ text: "Return on", options: { breakLine: true } }, { text: "Capex²" }], sx, by, sxW, 0.5, { bold: true, underline: true, align: "center", valign: "top" });
  t("base case", sx, by + 0.52, sxW, 0.28, { align: "center" });
  figureBlock(sx, by, sxW, "", "", [{ y: by + 1.1, value: "~1.6 yrs", hi: true }]);
  const ry = chart.axisY + 0.34;
  t("Capex burden¹", x, ry, leftW + 0.6, rowH, { bold: true, italic: true, color: RED, align: "left" });
  ["26%", "22%", "20%", "19%", "17%"].forEach((v, k) => t(v, chart.px(k + 1) - 0.35, ry, 0.7, rowH, { italic: true, bold: true, align: "center" }));
  reading(["Increasing capital expenditure is required to support the offline expansion strategy",
    "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"],
    { x, y: bot - readH, w: pw, h: readH });
}

// note line (deck form: italic note just above the source line)
t("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  B.x, bot + 0.04, B.w, noteH, { italic: true, size: 12 });

L.save(pres, __dirname + "/candidate.pptx");
