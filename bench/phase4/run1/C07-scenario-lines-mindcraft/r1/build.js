// C07 rebuild 1: two scenario line charts in the Mindcraft financial-slide form (HALF2), deck as reference.
// Form taken from the deck's other slides: numbered red chip + bold panel head + grey rule (4, 5, 8), italic chart title,
// CAGR column with underlined bold header and a red hand-drawn circle on the key value (4), red bold italic row label
// under the chart axis (8 "Pull-up ratio"), grey reading box with round bullets (4, 8), italic note line above the source.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, P, S, prof } = L.start({
  ref: "Case-2019-Mindcraft", title: TITLE,
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
});
const F = "Verdana", RED = "C00000", BLACK = "000000", G2 = "5C5C5C", G3 = "808080", G4 = "A6A6A6", PANEL = "F1F1F1";
const BODY = prof.body.pt, LAB = prof.body.label_pt;   // 14 / 12

// ---- breadcrumb: grey bold italic items, red triangles between, current item red ----
const crumb = [["Market Analysis", 0.36], ["Growth Strategy", 2.88], ["Financial Forecasting", 5.56]];
crumb.forEach(([t, x], i) => {
  slide.addText(t, { x, y: 0.04, w: 2.6, h: 0.3, fontFace: F, fontSize: 14, bold: true, italic: true, color: i === 2 ? RED : G4, margin: 0, valign: "middle" });
  if (i) slide.addShape("triangle", { x: x - 0.5, y: 0.08, w: 0.22, h: 0.2, rotate: 90, fill: { color: RED }, line: { type: "none" } });
});

const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || BODY, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
  underline: o.u ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const COLS = [RED, G2, G4];   // optimistic (the point), base, crush

// line chart drawn as editable shapes (the deck's charts are drawn, not native: profile chart = none), so labels sit on the points
function scenarioChart(box, series, o) {
  const axisH = 0.34, ph = box.h - axisH, n = YEARS.length, step = box.w / n;
  const X = (i) => box.x + (i + 0.5) * step, Y = (v) => box.y + ph * (1 - (v - o.min) / (o.max - o.min));
  const fmt = o.fmt || ((v) => String(v));
  slide.addShape("line", { x: box.x, y: box.y + ph, w: box.w, h: 0, line: { color: G3, width: 0.75 } });
  YEARS.forEach((yr, i) => T(yr, X(i) - step / 2 - 0.05, box.y + ph + 0.06, step + 0.1, 0.26, { size: LAB, align: "center" }));
  [...series].reverse().forEach((s) => { const k = series.indexOf(s), col = COLS[k];
    s.values.slice(1).forEach((v, j) => { const x1 = X(j), y1 = Y(s.values[j]), x2 = X(j + 1), y2 = Y(v);
      slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1), flipV: y2 < y1, line: { color: col, width: 2.25 } }); });
    s.values.forEach((v, i) => { if (i === 0 && k) return; const d = 0.09;
      slide.addShape("ellipse", { x: X(i) - d / 2, y: Y(v) - d / 2, w: d, h: d, fill: { color: k && i === 0 ? COLS[0] : col }, line: { type: "none" } }); });
  });
  // start value once (all cases share it), left of the first point
  T(fmt(series[0].values[0]), X(0) - 0.32, Y(series[0].values[0]) - 0.33, 0.64, 0.24, { align: "center" });
  series.forEach((s, k) => {
    s.values.forEach((v, i) => {
      if (i === 0) return;
      const last = i === n - 1;
      if (last) { T(fmt(v), X(i) + 0.1, Y(v) - 0.13, 0.6, 0.26, { color: k === 0 ? RED : BLACK, bold: k === 0 }); return; }
      if (k === 1) return;                                 // base case: end value only (it runs between the other two)
      T(fmt(v), X(i) - 0.32, k === 0 ? Y(v) - 0.33 : Y(v) + 0.08, 0.64, 0.24, { align: "center", color: k === 0 ? RED : BLACK });
    });
  });
  return { X, Y, step };
}

const top = 1.39, gap = 0.32, xL = 0.37, xR = 13.05, half = (xR - xL - gap) / 2;
const boxes = [{ x: xL, w: half }, { x: xL + half + gap, w: half }];
const readTop = 5.42, readH = 1.48;

function reading(box, bullets) {
  slide.addShape("rect", { x: box.x, y: readTop, w: box.w, h: readH, fill: { color: PANEL }, line: { type: "none" } });
  slide.addText(bullets.map((b) => ({ text: b, options: { bullet: { indent: 14 }, breakLine: true } })),
    { x: box.x + 0.06, y: readTop + 0.04, w: box.w - 0.12, h: readH - 0.08, fontFace: F, fontSize: BODY, color: BLACK, valign: "middle", margin: 0.04, paraSpaceAfter: 2, isTextBox: true });
}

// ---------- panel 1: top line ----------
{
  const b = boxes[0];
  S.subhead(slide, 1, "Resilient growth under scenario analysis", b.x, top, b.w);
  T("CSS Top Line Scenario Analysis (¥ Bn)", b.x, 1.93, 4.3, 0.3, { size: BODY, italic: true });
  const cagrX = b.x + b.w - 0.8, nameX = cagrX - 1.3;
  T("CAGR", cagrX, 1.93, 0.82, 0.28, { size: BODY, bold: true, u: true, align: "center" });
  T("18-23E", cagrX, 2.2, 0.82, 0.26, { size: LAB, align: "center" });
  const ser = [{ name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2] }, { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6] },
    { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2] }];
  const c = scenarioChart({ x: b.x, y: 2.72, w: nameX - 0.66 - b.x, h: 2.52 }, ser, { min: 7, max: 18.6, fmt: (v) => v.toFixed(1) });
  const cg = ["17%", "12%", "8%"];
  ser.forEach((s, k) => {
    const y = c.Y(s.values[5]) - 0.13;
    T(s.name, nameX, y, 1.3, 0.26, { color: k === 0 ? RED : BLACK, bold: k === 0 });
    T(cg[k], cagrX, y, 0.82, 0.26, { size: BODY, color: k === 0 ? RED : BLACK, bold: k === 0, align: "center" });
  });
  // the hand-drawn red circle the deck puts round the number that makes the point
  const y0 = c.Y(18.2) - 0.2;
  slide.addShape("ellipse", { x: cagrX - 0.02, y: y0, w: 0.86, h: 0.4, rotate: -6, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
  // market benchmark under the cases, divided by a thin rule
  const ym = c.Y(12.2) + 0.42;
  slide.addShape("line", { x: nameX, y: ym, w: b.x + b.w - nameX, h: 0, line: { color: G3, width: 0.75, dashType: "dash" } });
  T("Market", nameX, ym + 0.06, 1.3, 0.26, { italic: true, color: G3 });
  T("7%", cagrX, ym + 0.06, 0.82, 0.26, { size: BODY, italic: true, color: G3, align: "center" });
  reading(b, ["Three cases all indicate above-market growth (7%)",
    "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"]);
}

// ---------- panel 2: capex ----------
{
  const b = boxes[1];
  S.subhead(slide, 2, "Guaranteed financial feasibility", b.x, top, b.w);
  T("Required Annual Capex Scenario Analysis (¥ Mn)", b.x, 1.93, b.w, 0.3, { size: BODY, italic: true });
  const lead = 0.98;
  const ser = [{ name: "Optimistic", values: [200, 231, 244, 255, 292, 309] }, { name: "Base", values: [200, 209, 216, 233, 268, 277] },
    { name: "Crush", values: [200, 175, 180, 201, 228, 243] }];
  const box = { x: b.x + lead, y: 2.62, w: b.w - lead - 0.66, h: 2.2 };
  const c = scenarioChart(box, ser, { min: 128, max: 312 });
  let lx = b.x + lead;                                  // legend: line swatch + case name
  ser.forEach((s, k) => { slide.addShape("line", { x: lx, y: 2.38, w: 0.32, h: 0, line: { color: COLS[k], width: 2.25 } });
    T(s.name, lx + 0.4, 2.25, 1.3, 0.26, { size: LAB, color: k === 0 ? RED : BLACK, bold: k === 0 }); lx += [1.42, 0.95, 1.0][k]; });
  // rows under the axis: capex burden per year (2019-2023E), return on capex under the base case
  const r1 = 4.84, r2 = 5.12;
  const labW = c.X(1) - c.step / 2 - b.x;
  T("Capex burden¹", b.x, r1, labW, 0.26, { bold: true, italic: true, color: RED });
  ["26%", "22%", "20%", "19%", "17%"].forEach((v, i) => T(v, c.X(i + 1) - 0.32, r1, 0.64, 0.26, { italic: true, bold: true, align: "center" }));
  T("Return on capex²", b.x, r2, labW + 0.4, 0.26, { bold: true, italic: true, color: RED });
  T("~1.6 years (base case)", c.X(2) - 0.32, r2, c.X(5) - c.X(2) + 0.64, 0.26, { italic: true, bold: true, align: "center" });
  reading(b, ["Increasing capital expenditure is required to support the offline expansion strategy",
    "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"]);
}

// note line above the source, as on the deck's other financial slides
T("Note: 1) Capex burden = Capex / cash flow from operations; 2) Return on capex = capex per store / avg. operational income per store",
  0.39, 6.95, 12.6, 0.24, { size: 10, italic: true });

L.save(pres, __dirname + "/candidate.pptx");
