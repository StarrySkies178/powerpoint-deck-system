// C07 rebuild 3 (run7): scenario lines in the Mindcraft deck style (deck as reference, leave-one-out).
// Layout HALF2 (two numbered halves), as the deck's other two-exhibit analysis slides (Mindcraft slide-map: HALF2 / R2L1 rows).
// Each half: numbered sub-headline, italic unit line, lines labelled at their ends (S.lineEnds, no axis, no legend box),
// then the reading in a grey box at the foot of the panel, as on the deck's slides 4, 5 and 8.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const title = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const { pres, slide, B, P, S, HOUSE } = L.start({
  ref: "Case-2019-Mindcraft",
  title,
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
});
const C = P.C, PT = HOUSE.STYLE.body.pt, LPT = HOUSE.STYLE.body.label_pt;
const years = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
const it = (t, o = {}) => [{ text: t, options: { italic: true, ...o } }];
const plain = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: P.THEME.bodyFontFace, fontSize: o.fontSize || LPT, color: o.color || C.text,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });

// reading box as the deck draws it: grey fill, round bullets, body-size text, key words bold in the main colour.
// One text box per bullet (pptxgenjs writes a paragraph break into mixed runs when a bullet is set on them).
function reading(items, box) {
  slide.addShape("rect", { ...box, fill: { color: C.g1 }, line: { type: "none" } });
  const iw = box.w - 0.42, cpl = Math.floor((iw * 72) / (PT * 0.6)), lh = (PT * 1.2) / 72;
  const lines = items.map((t) => { let n = 1, cur = 0; String(t).replace(/\*\*/g, "").split(" ").forEach((w) => { if (cur + w.length > cpl) { n++; cur = w.length + 1; } else cur += w.length + 1; }); return n; });
  const gap = 0.06, tot = lines.reduce((a, n) => a + n * lh, 0) + gap * (items.length - 1);
  let y = box.y + Math.max(0.05, (box.h - tot) / 2);
  items.forEach((t, i) => {
    const runs = String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => p.startsWith("**")
      ? { text: p.slice(2, -2), options: { bold: true, color: C.navy } } : { text: p, options: {} });
    plain("\u2022", box.x + 0.1, y, 0.2, lh, { fontSize: PT, valign: "top" });
    plain(runs, box.x + 0.3, y, iw, lines[i] * lh, { fontSize: PT, valign: "top" });
    y += lines[i] * lh + gap;
  });
}

// x positions of lineEnds' periods, worked out the way S.lineEnds places them (same font metrics), so a row can sit under each year
function periodX(box, series, fmt, sideW) {
  const pt = LF, em = (t) => (String(t).length * pt * 0.62) / 72;
  const nameW = Math.min(box.w * 0.3, Math.max(...series.map((s) => em(fmt(s.values[s.values.length - 1]) + "  " + s.name) + 0.15)));
  const startW = Math.max(0.45, ...series.map((s) => em(fmt(s.values[0])) + 0.12));
  const px0 = box.x + startW, px1 = box.x + box.w - sideW - nameW - 0.12;
  return (i) => px0 + (i / (years.length - 1)) * (px1 - px0);
}

const half = (B.w - 0.3) / 2, top = B.y, H = B.h - 0.3;          // the last 0.3 in holds the note line
const LF = LPT * 12.5 / HOUSE.TYPE.body;                            // lineEnds' txt() scales by body/12.5: this lands at the label size
const P1 = { x: B.x, y: top, w: half, h: H }, P2 = { x: B.x + half + 0.3, y: top, w: half, h: H };
const readH = 1.3;

// ---------- 1 Resilient growth under scenario analysis ----------
S.subhead(slide, 1, "Resilient growth under scenario analysis", P1.x, P1.y, P1.w);
plain(it("CSS Top Line Scenario Analysis (¥ Bn)"), P1.x, P1.y + 0.55, P1.w, 0.34, { fontSize: PT });
const top1 = [
  { name: "Optimistic", values: [8.3, 10.1, 11.8, 13.6, 15.6, 18.2], hi: true },
  { name: "Base", values: [8.3, 9.6, 10.7, 12.0, 13.3, 14.6] },
  { name: "Crush", values: [8.3, 9.2, 9.7, 10.5, 11.3, 12.2] },
];
S.lineEnds(slide, {
  labels: years, series: top1, format: (v) => v.toFixed(1), min: 7, fontSize: LF,
  side: { header: "CAGR\n18-23E", values: ["17%", "12%", "8%"], circle: 0 },
}, { x: P1.x, y: P1.y + 0.95, w: P1.w, h: H - 0.95 - readH - 0.2 });
reading([
  "Three cases all indicate **above-market growth** (7%)",
  "Under the optimistic case, **~17%** 5-year CAGR could be expected; **offline expansion roadmap** and **ramp-up speed** are two key value creation levers",
], { x: P1.x, y: P1.y + H - readH, w: P1.w, h: readH });

// ---------- 2 Guaranteed financial feasibility ----------
S.subhead(slide, 2, "Guaranteed financial feasibility", P2.x, P2.y, P2.w);
plain(it("Required Annual Capex Scenario Analysis (¥ Mn)"), P2.x, P2.y + 0.55, P2.w, 0.34, { fontSize: PT });
const capex = [
  { name: "Optimistic", values: [200, 231, 244, 255, 292, 309], hi: true },
  { name: "Base", values: [200, 209, 216, 233, 268, 277] },
  { name: "Crush", values: [200, 175, 180, 201, 228, 243] },
];
const rowsH = 0.95, lab = 0.55, chart2 = { x: P2.x + lab, y: P2.y + 0.95, w: P2.w - lab, h: H - 0.95 - readH - rowsH - 0.25 };
S.lineEnds(slide, { labels: years, series: capex, format: (v) => String(v), min: 160, fontSize: LF }, chart2);

// capex burden row under the years it belongs to (2019E-2023E), then the base-case return on capex
const X = periodX(chart2, capex, (v) => String(v), 0), ry = chart2.y + chart2.h + 0.1;
slide.addShape("line", { x: P2.x, y: ry - 0.02, w: P2.w, h: 0, line: { color: C.g2, width: 0.75, dashType: "dash" } });
plain([{ text: "Capex burden" }, { text: "1", options: { superscript: true } }], P2.x, ry + 0.02, X(1) - 0.42 - P2.x, 0.38, { fontSize: LPT, italic: true });
["26%", "22%", "20%", "19%", "17%"].forEach((v, k) => plain(v, X(k + 1) - 0.4, ry + 0.02, 0.8, 0.38, { fontSize: LPT, align: "center" }));
plain([{ text: "Return on Capex under base case" }, { text: "2", options: { superscript: true } }], P2.x, ry + 0.47, 4.4, 0.38, { fontSize: LPT, italic: true });
const rx = P2.x + P2.w - 1.75;
plain("~1.6 years", rx, ry + 0.47, 1.7, 0.38, { fontSize: PT, bold: true, color: C.navy, align: "center" });
slide.addShape("ellipse", { x: rx - 0.05, y: ry + 0.42, w: 1.8, h: 0.48, fill: { type: "none" }, line: { color: C.accent, width: 1.75 } });
reading([
  "Increasing capital expenditure is required to support the **offline expansion** strategy",
  "Yearly capex accounts for **~20% of liquidity**, with quick return (**1.6 yrs**), indicating a good financial feasibility",
], { x: P2.x, y: P2.y + H - readH, w: P2.w, h: readH });

// note line above the source, as the deck places its notes (slides 5 and 8)
plain(it("Note: 1) Capex burden = Capex / cash flow from operations; 2) Return on capex = capex store / avg. operational income per store"),
  B.x, B.y + B.h - 0.28, B.w, 0.28, { fontSize: LPT });

L.save(pres, __dirname + "/candidate.pptx");
