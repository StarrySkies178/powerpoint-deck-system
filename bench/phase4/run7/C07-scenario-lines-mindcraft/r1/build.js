// C07 rebuild (run7 r1): two scenario line charts in the Mindcraft deck's style (deck as reference, leave-one-out).
// Layout: HALF2, panel boxes from the deck's own two-half chart slide (Mindcraft 4, via scripts/layout_skeleton.py:
// halves at x 0.36 / 6.67, body from 1.39). Each half: numbered sub-headline (deck chip + rule), italic unit line,
// lines labelled at their ends (S.lineEnds, no axis, no gridlines, as the deck draws charts), grey reading box at the foot.
// Right half adds the capex burden row under the years (form of the "Pull-up ratio" row under Mindcraft 8's waterfall)
// and the return on capex circled in red (the deck's circled-value callout, Mindcraft 4).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
});
const C = P.C, FONT = "Verdana", PT = 14, LPT = 11;     // LPT: chart label spec size; the style scales it to 12.5 pt, above the deck's 12 pt label size

const years = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const colours = { Optimistic: C.accent, Base: "5C5C5C", Crush: "A6A6A6" };   // same colour per case in both halves
const ser = (name, values, hi) => ({ name, values, hi, color: colours[name] });

const TOP = 1.39, BOT = 6.74;
const LP = { x: 0.37, w: 6.0 }, RP = { x: 6.72, w: 6.2 };
const READ_H = 1.3, READ_Y = BOT - READ_H;

function text(t, x, y, w, h, o = {}) {
  slide.addText(t, { x, y, w, h, fontFace: FONT, fontSize: o.size || PT, color: o.color || C.text, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
}
function reading(panel, bullets) {        // grey box with plain bullets at the body size (Mindcraft 4 and 8)
  slide.addShape("rect", { x: panel.x, y: READ_Y, w: panel.w, h: READ_H, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addText(bullets.map((b) => ({ text: b, options: { bullet: { indent: 14 }, paraSpaceAfter: 2 } })),
    { x: panel.x + 0.08, y: READ_Y + 0.05, w: panel.w - 0.16, h: READ_H - 0.1, fontFace: FONT, fontSize: PT, color: C.text, valign: "middle", margin: 0, isTextBox: true });
}
function head(panel, n, headline, unit) { // numbered sub-headline + italic unit line; returns the y under them
  const h = S.subhead(slide, n, headline, panel.x, TOP, panel.w);
  const y = TOP + h + 0.08;
  text(unit, panel.x, y, panel.w, 0.32, { italic: true });
  return y + 0.36;
}

// ---------- 1: top line ----------
{
  const y = head(LP, 1, "Resilient growth under scenario analysis", "CSS Top Line Scenario Analysis (¥ Bn)");
  S.lineEnds(slide, {
    labels: years, fontSize: LPT, format: (v) => v.toFixed(1),
    series: [ser("Optimistic", [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], true), ser("Base", [8.3, 9.6, 10.7, 12.0, 13.3, 14.6]), ser("Crush", [8.3, 9.2, 9.7, 10.5, 11.3, 12.2])],
    side: { header: "CAGR 18-23E", values: ["17%", "12%", "8%"], circle: 0 },
  }, { x: LP.x, y, w: LP.w, h: READ_Y - y - 0.15 });
  reading(LP, ["Three cases all indicate above-market growth (7%)",
    "Under the optimistic case, ~17% 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers"]);
}

// ---------- 2: capex ----------
{
  const y = head(RP, 2, "Guaranteed financial feasibility", "Required Annual Capex Scenario Analysis (¥ Mn)");
  const indent = 0.95;                    // room at the left for the row labels under the chart
  const rowH = 0.34, ret = READ_Y - 0.12 - rowH, burden = ret - rowH - 0.06;
  const box = { x: RP.x + indent, y, w: RP.w - indent, h: burden - y - 0.04 };
  const series = [ser("Optimistic", [200, 231, 244, 255, 292, 309], true), ser("Base", [200, 209, 216, 233, 268, 277]), ser("Crush", [200, 175, 180, 201, 228, 243])];
  S.lineEnds(slide, { labels: years, fontSize: LPT, series }, box);
  // x of each year, as lineEnds places them (no side column)
  const em = (t) => (String(t).length * LPT * 0.62) / 72;
  const nameW = Math.min(box.w * 0.3, Math.max(...series.map((s) => em(s.values[s.values.length - 1] + "  " + s.name) + 0.15)));
  const startW = Math.max(0.45, ...series.map((s) => em(s.values[0]) + 0.12));
  const px0 = box.x + startW, px1 = box.x + box.w - nameW - 0.12, X = (i) => px0 + (i / (years.length - 1)) * (px1 - px0);
  slide.addShape("line", { x: RP.x, y: burden - 0.02, w: px1 + 0.3 - RP.x, h: 0, line: { color: C.g2, width: 0.75, dashType: "dash" } });
  text("Capex burden¹", RP.x, burden, X(1) - 0.4 - RP.x, rowH, { bold: true, italic: true, color: C.accent, size: 13 });
  ["26%", "22%", "20%", "19%", "17%"].forEach((v, k) => text(v, X(k + 1) - 0.45, burden, 0.9, rowH, { bold: true, italic: true, color: C.accent, align: "center" }));
  text("Return on capex under base case²:", RP.x, ret, 3.55, rowH, { bold: true, italic: true, color: C.accent, size: 13 });
  text("~1.6 years", RP.x + 3.75, ret, 1.35, rowH, { bold: true, color: C.text, align: "center" });
  slide.addShape("ellipse", { x: RP.x + 3.67, y: ret - 0.07, w: 1.51, h: rowH + 0.14, fill: { type: "none" }, line: { color: C.accent, width: 1.75 } });
  reading(RP, ["Increasing capital expenditure is required to support the offline expansion strategy",
    "Yearly capex accounts for ~20% of liquidity, with quick return (1.6yrs), indicating a good financial feasibility"]);
}

// note line above the source, as on Mindcraft 8
text("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  0.39, 6.84, 12.5, 0.3, { italic: true, size: 10 });

L.save(pres, __dirname + "/candidate.pptx");
