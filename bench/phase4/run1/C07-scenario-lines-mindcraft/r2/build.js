// C07 rebuild r2: two scenario line charts in the Mindcraft deck style (deck as reference, leave-one-out).
// Layout taken from the deck's other two-panel analysis slides (HALF2: Mindcraft 4, 5, 8): numbered red chip + bold
// panel headline over a grey rule, an italic chart title, the exhibit, then a grey reading box with bullets.
// Annotation forms from the same deck: CAGR column beside the chart with the key value circled in red (slides 4, 5),
// a red bold-italic ratio row under the categories (the "Pull-up ratio" row of slide 8), note line above the source.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const SOURCE = "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg";
const NOTE = "Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store";

const { pres, slide, P, S, prof } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE, source: SOURCE });
const C = P.C, R = prof.roles;
const RED = R.main, DARK = R.grey2, MID = R.grey3, LIGHT = R.grey4, PANEL = R.panel, FONT = prof.fonts.latin;
const BODY = prof.body.pt, LAB = prof.body.pt;   // the deck sets its chart labels at body size too (slides 4, 5, 8)

// ---- section breadcrumb (deck form: bold italic, grey items, current in red, red triangles between) ----
(() => {
  const cs = prof.crumb, items = ["Market Analysis", "Growth Strategy", "Financial Forecasting"], cur = 2;
  const runs = [];
  items.forEach((it, i) => {
    if (i) runs.push({ text: "   ▶   ", options: { color: RED, italic: false, bold: false } });
    runs.push({ text: it, options: { color: i === cur ? RED : LIGHT, bold: true, italic: true } });
  });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 10, h: 0.3, fontFace: FONT, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });
})();

const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || BODY, color: o.color || R.text,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0, isTextBox: true,
  underline: o.underline ? { style: "sng" } : undefined });

// panel boxes, measured from the deck's two-panel slides (left panel 0.37-6.43 in, right panel 6.67-12.95 in)
const TOP = 1.39, BOT = 6.93, RD = 5.78;   // RD: top of the reading boxes
const PANELS = [{ x: 0.37, y: TOP, w: 6.06, h: BOT - TOP }, { x: 6.67, y: TOP, w: 6.2, h: BOT - TOP }];

// numbered panel headline: the deck's chip + bold headline + grey rule (generator: subhead with the reference panel style)
const head = (n, text, b) => TOP + S.subhead(slide, n, text, b.x, b.y, b.w);

// grey reading box with round bullets at body size (deck form: slides 4 and 8)
function reading(bullets, b) {
  slide.addShape("rect", { ...b, fill: { color: PANEL }, line: { type: "none" } });
  slide.addText(bullets.map((s, i) => ({ text: s, options: { bullet: { indent: 14 }, breakLine: i < bullets.length - 1 } })),
    { x: b.x + 0.06, y: b.y + 0.04, w: b.w - 0.12, h: b.h - 0.08, fontFace: FONT, fontSize: BODY, color: R.text, valign: "middle", margin: 0.04, isTextBox: true, paraSpaceAfter: 2 });
}

// native line chart (editable data) with a fixed plot area, so the labels drawn beside it sit on the points
const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const SERIES_COL = [RED, DARK, LIGHT];
function lineChart(series, box, min, max, labels) {
  const plot = { x: 0.02, y: 0.02, w: 0.96, h: 0.84 };               // inner plot area as a share of the chart box
  slide.addChart(pres.ChartType.line, series.map((s) => ({ name: s.name, labels: YEARS, values: s.values })), {
    ...box, layout: plot, chartColors: SERIES_COL, lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: min, valAxisMaxVal: max,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: true, catAxisLineColor: MID,
    catAxisLabelFontSize: prof.body.label_pt, catAxisLabelColor: R.text, catAxisLabelFontFace: FONT,
  });
  const px = box.x + box.w * plot.x, pw = box.w * plot.w, py = box.y + box.h * plot.y, ph = box.h * plot.h;
  const X = (i) => px + pw * (i + 0.5) / YEARS.length, Y = (v) => py + ph * (1 - (v - min) / (max - min));
  // value labels: top series above its points, the others below, the middle one only where it has room
  const lw = 0.7, lh = 0.27;
  series.forEach((s, k) => s.values.forEach((v, i) => {
    if (i === 0 && k > 0) return;                                    // the three cases share the 2018 actual
    const pos = labels[k](i); if (!pos) return;
    const y = pos === "above" ? Y(v) - lh - 0.04 : Y(v) + 0.05;
    const dx = pos === "above" && i > 0 && i < 5 ? -0.14 : 0;          // labels above a rising line step left, off the line
    t(labels.fmt(v), X(i) - lw / 2 + dx, y, lw, lh, { size: LAB, color: k === 0 ? RED : R.text, align: "center", bold: k === 0 && i === 5 });
  }));
  return { X, Y, px, pw };
}

// ================= panel 1: top line =================
{
  const b = PANELS[0]; let y = head(1, "Resilient growth under scenario analysis", b);
  t("CSS Top Line Scenario Analysis (¥ Bn)", b.x, y, b.w - 1.3, 0.3, { italic: true });
  const cagrX = b.x + b.w - 1.05;
  t("CAGR", cagrX, y, 1.05, 0.28, { bold: true, underline: true, align: "center" });
  t("18-23E", cagrX, y + 0.27, 1.05, 0.26, { align: "center" });
  const ch = { x: b.x, y: y + 0.55, w: b.w - 2.35, h: 3.3 };
  const s = [{ name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2] }, { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6] },
    { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2] }];
  const g = lineChart(s, ch, 6.5, 19, Object.assign([() => "above", (i) => (i >= 3 ? "below" : null), () => "below"], { fmt: (v) => v.toFixed(1) }));
  // case names at the line ends, then the CAGR of each case (deck form: CAGR column beside the chart)
  const endX = ch.x + ch.w + 0.05;
  [["Optimistic", 18.2, "17%"], ["Base", 14.6, "12%"], ["Crush", 12.2, "8%"]].forEach(([n, v, c], k) => {
    const yy = g.Y(v) - 0.13 + (k === 2 ? 0.08 : 0);
    t(n, endX, yy, 1.3, 0.26, { size: LAB, color: k === 0 ? RED : R.text, bold: k === 0 });
    t(c, cagrX, yy, 1.05, 0.26, { align: "center", color: k === 0 ? RED : R.text, bold: k === 0 });
  });
  // the optimistic CAGR circled in red, as the deck circles its key growth rate
  slide.addShape("ellipse", { x: cagrX + 0.12, y: g.Y(18.2) - 0.23, w: 0.81, h: 0.46, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
  // the market's own growth as the last row of the CAGR column, the benchmark the three cases beat
  slide.addShape("line", { x: endX, y: g.Y(12.2) + 0.32, w: b.x + b.w - endX, h: 0, line: { color: LIGHT, width: 0.75, dashType: "dash" } });
  t("Market", endX, g.Y(12.2) + 0.4, 1.1, 0.26, { size: LAB, italic: true, color: DARK });
  t("7%", cagrX, g.Y(12.2) + 0.4, 1.05, 0.26, { italic: true, color: DARK, align: "center" });
  reading(["Three cases all indicate above-market growth (7%)",
    "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"],
    { x: b.x, y: RD, w: b.w, h: BOT - RD });
}

// ================= panel 2: capex =================
{
  const b = PANELS[1]; let y = head(2, "Guaranteed financial feasibility", b);
  t("Required Annual Capex Scenario Analysis (¥ Mn)", b.x, y, b.w, 0.3, { italic: true });
  const ch = { x: b.x + 0.95, y: y + 0.4, w: b.w - 0.95 - 1.3, h: 2.45 };
  const s = [{ name: "Optimistic", values: [200, 231, 244, 255, 292, 309] }, { name: "Base", values: [200, 209, 216, 233, 268, 277] },
    { name: "Crush", values: [200, 175, 180, 201, 228, 243] }];
  const g = lineChart(s, ch, 140, 325, Object.assign([() => "above", (i) => (i >= 1 ? "below" : null), () => "below"], { fmt: (v) => String(v) }));
  [["Optimistic", 309], ["Base", 277], ["Crush", 243]].forEach(([n, v], k) =>
    t(n, ch.x + ch.w + 0.05, g.Y(v) - 0.13, 1.3, 0.26, { size: LAB, color: k === 0 ? RED : R.text, bold: k === 0 }));
  // ratio rows under the years, red bold italic labels (deck form: slide 8's pull-up ratio row)
  // the row label runs over the empty 2018 slot (as slide 8's label sits under its start bar)
  const r1 = ch.y + ch.h + 0.08, lab = 1.75;
  t("Capex burden¹", b.x, r1, lab, 0.3, { size: LAB, bold: true, italic: true, color: RED });
  ["26%", "22%", "20%", "19%", "17%"].forEach((v, i) => t(v, g.X(i + 1) - 0.35, r1, 0.7, 0.3, { size: LAB, bold: true, italic: true, align: "center" }));
  slide.addShape("line", { x: b.x, y: r1 + 0.36, w: b.w, h: 0, line: { color: LIGHT, width: 0.75, dashType: "dash" } });
  const r2 = r1 + 0.44;
  t("Return on capex²", b.x, r2, 2.0, 0.3, { size: LAB, bold: true, italic: true, color: RED });
  t("~1.6 years under base case", b.x + 2.05, r2, 3.6, 0.3, { size: LAB, bold: true, italic: true });
  reading(["Increasing capital expenditure is required to support the offline expansion strategy",
    "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"],
    { x: b.x, y: RD, w: b.w, h: BOT - RD });
}

t(NOTE, 0.39, 6.96, 12.4, 0.24, { size: 10, italic: true });

L.save(pres, __dirname + "/candidate.pptx");
