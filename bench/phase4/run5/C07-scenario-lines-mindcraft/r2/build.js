// C07 rebuild (run5 r2): scenario line charts in the style of the Mindcraft deck (deck as reference, leave-one-out).
// Layout: HALF2 (two numbered panels side by side), as the deck's analysis slides use it (slides 4, 5, 7, 8 of the deck).
// Each panel: numbered sentence sub-headline, italic exhibit title with its unit, a native line chart (three scenarios,
// the optimistic case in the deck's red, the others grey), labels at the line ends, a CAGR column with a red circle
// (deck slides 4 and 5), a ratio row under the chart (the "Pull-up ratio" row of deck slide 8), and a grey reading box
// with two bullets (deck slides 4 and 8). Note and source lines at the foot as on deck slides 5 and 8.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, B, P, S, HOUSE } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const BODY_PT = HOUSE.TYPE.body, LAB_PT = HOUSE.TYPE.label;   // 14 / 12 pt, from the deck's profile
const RED = C.navy, DARK = C.g4, LIGHT = C.g2;                 // C00000, 5C5C5C, A6A6A6

const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || BODY_PT, color: o.color || C.text,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0, isTextBox: true, underline: o.underline });
const keyRuns = (s) => String(s).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: RED } } : { text: p, options: {} }));

const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const SERIES_COL = [RED, DARK, LIGHT];

// a native line chart with a fixed plot area and fixed axis range, so labels can be placed on the line ends
function lineChart(box, series, vmin, vmax) {
  const lay = { x: 0.03, y: 0.04, w: 0.94, h: 0.8 };
  slide.addChart(pres.ChartType.line, series.map((s) => ({ name: s.name, labels: YEARS, values: s.values })), {
    ...box, chartColors: SERIES_COL, lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 7,
    showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: vmin, valAxisMaxVal: vmax,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: true, catAxisLineColor: C.g2,
    catAxisLabelFontSize: LAB_PT, catAxisLabelFontFace: FONT, catAxisLabelColor: C.text, layout: lay,
  });
  const px = box.x + lay.x * box.w, pw = lay.w * box.w, py = box.y + lay.y * box.h, ph = lay.h * box.h;
  return { X: (i) => px + ((i + 0.5) * pw) / YEARS.length, Y: (v) => py + ((vmax - v) / (vmax - vmin)) * ph, px, pw, py, ph };
}
function circle(x, y, w, h) { slide.addShape("ellipse", { x, y, w, h, fill: { type: "none" }, line: { color: RED, width: 1.75 } }); }
function reading(bullets, box) {
  // grey reading box, one text box per bullet (a run-level bullet in pptxgenjs breaks the paragraph), "•" in its own box
  slide.addShape("rect", { ...box, fill: { color: C.g1 }, line: { type: "none" } });
  const iw = box.w - 0.5, cpl = Math.floor((iw * 72) / (BODY_PT * 0.53)), lh = (BODY_PT * 1.22) / 72;
  const lines = bullets.map((b) => { let n = 1, cur = 0; String(b).replace(/\*\*/g, "").split(" ").forEach((w) => { if (cur + w.length > cpl) { n++; cur = w.length + 1; } else cur += w.length + 1; }); return n; });
  const gap = 0.08, tot = lines.reduce((x, y) => x + y, 0) * lh + gap * (bullets.length - 1);
  let y = box.y + 0.1;   // same top padding in both boxes, so the readings line up across the slide
  bullets.forEach((b, i) => { const h = lines[i] * lh;
    t("\u2022", box.x + 0.12, y, 0.2, lh, { valign: "top" });
    slide.addText(keyRuns(b), { x: box.x + 0.34, y, w: iw + 0.04, h, fontFace: FONT, fontSize: BODY_PT, color: C.text, valign: "top", margin: 0, isTextBox: true });
    y += h + gap; });
}

// ---------- panel boxes: HALF2 ----------
const GAP = 0.4, PW = (B.w - GAP) / 2, X1 = B.x, X2 = B.x + PW + GAP;
const TOP = B.y + 0.03, NOTE_Y = 6.86, READ_H = 1.2, READ_Y = NOTE_Y - 0.06 - READ_H;
const head = (n, text, x) => S.subhead(slide, n, text, x, TOP, PW);
const h1 = head(1, "Resilient growth under scenario analysis", X1);
head(2, "Guaranteed financial feasibility", X2);
const UNIT_Y = TOP + h1 + 0.02;

// ---------- panel 1: top line scenarios ----------
const top = [
  { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], cagr: "17%" },
  { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], cagr: "12%" },
  { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2], cagr: "8%" },
];
t("CSS Top Line Scenario Analysis, 2018-2023E (¥ Bn)", X1, UNIT_Y, PW, 0.32, { italic: true });
const CAGR_W = 1.0, LBL_W = 1.65;
const c1box = { x: X1, y: UNIT_Y + 0.6, w: PW - CAGR_W - LBL_W, h: READ_Y - (UNIT_Y + 0.6) - 0.1 };
const m1 = lineChart(c1box, top, 6, 20.5);
// CAGR column header, as on deck slide 4
const cx1 = X1 + PW - CAGR_W;
t("CAGR", cx1, UNIT_Y + 0.36, CAGR_W, 0.26, { bold: true, align: "center", underline: { style: "sng" } });
t("18-23E", cx1, UNIT_Y + 0.62, CAGR_W, 0.24, { size: LAB_PT, align: "center" });
// start value and end labels (value + scenario name), then each scenario's CAGR on the same line
const x0 = m1.X(0), xe = m1.X(5);
t("8.3", x0 - 0.4, m1.Y(8.3) - 0.36, 0.8, 0.26, { size: LAB_PT, align: "center" });
const endY1 = [m1.Y(18.2), m1.Y(14.6), m1.Y(12.2)];
top.forEach((s, i) => {
  const y = endY1[i];
  t([{ text: s.values[5].toFixed(1) + " ", options: { bold: i === 0, color: i === 0 ? RED : C.text } }, { text: s.name, options: { color: i === 0 ? RED : C.text, bold: i === 0 } }],
    xe + 0.14, y - 0.14, c1box.x + c1box.w + LBL_W - xe - 0.14, 0.28, { size: LAB_PT });
  t(s.cagr, cx1, y - 0.14, CAGR_W, 0.28, { align: "center", bold: i === 0, color: i === 0 ? RED : C.text });
});
circle(cx1 + 0.12, endY1[0] - 0.22, CAGR_W - 0.24, 0.44);
reading([
  "Three cases all indicate **above-market growth** (7%)",
  "Under the optimistic case, **~17% 5-year** CAGR could be expected; **offline expansion roadmap** and **ramp-up speed** are two key value creation levers",
], { x: X1, y: READ_Y, w: PW, h: READ_H });

// ---------- panel 2: capex scenarios ----------
const capex = [
  { name: "Optimistic", values: [200, 231, 244, 255, 292, 309] },
  { name: "Base", values: [200, 209, 216, 233, 268, 277] },
  { name: "Crush", values: [200, 175, 180, 201, 228, 243] },
];
t("Required Annual Capex Scenario Analysis, 2018-2023E (¥ Mn)", X2, UNIT_Y, PW, 0.32, { italic: true });
const RLAB = 1.3, ROW_H = 0.34, ROW2_H = 0.46;
// the chart sits right of the ratio row labels so its year columns line up with the ratio values below
const c2y = UNIT_Y + 0.42;
const c2 = { x: X2 + 0.5, y: c2y, w: PW - 0.5 - 1.5, h: READ_Y - c2y - ROW2_H - ROW_H - 0.24 };
const m2 = lineChart(c2, capex, 150, 330);
t("200", m2.X(0) - 0.4, m2.Y(200) - 0.36, 0.8, 0.26, { size: LAB_PT, align: "center" });
const endY2 = [m2.Y(309), m2.Y(277), m2.Y(243)];
capex.forEach((s, i) => {
  t([{ text: String(s.values[5]) + " ", options: { bold: i === 0, color: i === 0 ? RED : C.text } }, { text: s.name, options: { color: i === 0 ? RED : C.text, bold: i === 0 } }],
    m2.X(5) + 0.14, endY2[i] - 0.14, X2 + PW - m2.X(5) - 0.14, 0.28, { size: LAB_PT });
});
// ratio rows under the chart (form of the "Pull-up ratio" row, deck slide 8)
const r1y = c2.y + c2.h + 0.06, r2y = r1y + ROW2_H + 0.06;
slide.addShape("line", { x: X2, y: r1y - 0.02, w: PW, h: 0, line: { color: C.g2, width: 0.75, dashType: "dash" } });
t([{ text: "Capex burden" }, { text: "1", options: { superscript: true } }], X2, r1y, RLAB, ROW2_H, { size: LAB_PT, bold: true, italic: true, color: RED });
["26%", "22%", "20%", "19%", "17%"].forEach((v, i) => t(v, m2.X(i + 1) - 0.35, r1y, 0.7, ROW2_H, { size: LAB_PT, italic: true, bold: true, align: "center" }));
t([{ text: "Return on capex" }, { text: "2", options: { superscript: true } }, { text: " (base case)" }], X2, r2y, 3.6, ROW_H, { size: LAB_PT, bold: true, italic: true, color: RED });
const kx = X2 + 3.75;
t("~1.6 years", kx, r2y, 1.5, ROW_H, { size: LAB_PT, bold: true, italic: true, align: "center" });
circle(kx - 0.02, r2y - 0.06, 1.54, ROW_H + 0.12);
reading([
  "Increasing **capital expenditure** is required to support the offline expansion strategy",
  "Yearly capex accounts for **~20% of liquidity**, with **quick return (1.6 yrs)**, indicating a good financial feasibility",
], { x: X2, y: READ_Y, w: PW, h: READ_H });

// ---------- note line (above the source, as on deck slides 5 and 8) ----------
t("Note: 1) Capex burden = capex / cash flow from operations; 2) Return on capex = capex per store / avg. operational income per store",
  B.x, NOTE_Y, B.w, 0.3, { size: 10, italic: true, valign: "top" });

L.save(pres, __dirname + "/candidate.pptx");
