// C07 rebuild 3: scenario lines in the Mindcraft deck style (deck as reference, leave-one-out).
// Layout: HALF2 with numbered panels, as the deck's two-panel analysis slides (Mindcraft 4, 8):
// chip + sub-headline + grey rule, italic exhibit title, chart, then a grey reading box with bullets.
// Charts are native line charts (editable data); point labels, CAGR column and the capex rows are drawn
// on the chart's fixed plot area, the way the deck's charts carry a CAGR column and a red ratio row (Mindcraft 4, 8).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility";
const SOURCE = "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg";
const { pres, slide, B, P, S, prof } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE });
slide.addText(SOURCE, { placeholder: "source", italic: true });
const F = P.THEME.bodyFontFace, C = P.C;
const RED = prof.roles.main, BLACK = prof.roles.text, G2 = prof.roles.grey2, G4 = prof.roles.grey4, PANEL = prof.roles.panel;

// ---- section tracker (deck form: bold italic, grey items, current in red, red triangles between) ----
const crumb = ["Market Analysis", "Growth Strategy", "Financial Forecasting"], cur = 2;
const cs = prof.crumb;
const runs = [];
crumb.forEach((t, i) => {
  if (i) runs.push({ text: "   ▶   ", options: { color: RED, italic: false } });
  runs.push({ text: t, options: { color: i === cur ? RED : G4 } });
});
slide.addText(runs, { x: cs.x, y: cs.y, w: 9, h: 0.3, fontFace: F, fontSize: cs.pt, bold: true, italic: true, margin: 0, valign: "top", isTextBox: true });

// ---- deck mark bottom right, beside the page number ----
slide.addText([{ text: "MindCraft", options: { color: RED } }], { x: 11.2, y: 7.21, w: 1.6, h: 0.25, fontFace: F, fontSize: 12, bold: true, align: "right", margin: 0, valign: "top", isTextBox: true });

// ---- panel geometry (HALF2) ----
const gap = 0.3, half = (B.w - gap) / 2;
const panels = [{ x: B.x, y: B.y, w: half }, { x: B.x + half + gap, y: B.y, w: half }];
const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023E"];
const SER = [
  { name: "Optimistic", color: RED },
  { name: "Base", color: G2 },
  { name: "Crush", color: G4 },
];
const READ_Y = 5.5, READ_H = 1.38;

function t(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 12, color: o.color || BLACK, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true, underline: o.underline ? { style: "sng" } : undefined });
}
function legend(x, y) {
  let lx = x;
  SER.forEach((s) => {
    slide.addShape("line", { x: lx, y: y + 0.12, w: 0.32, h: 0, line: { color: s.color, width: 2.25 } });
    slide.addShape("ellipse", { x: lx + 0.12, y: y + 0.08, w: 0.08, h: 0.08, fill: { color: s.color }, line: { type: "none" } });
    const w = 0.15 + s.name.length * 0.105;
    t(s.name + " case", lx + 0.4, y, w + 0.5, 0.24, { size: 12 });
    lx += 0.4 + w + 0.62;
  });
}
// native line chart in a fixed plot area; returns the point position function
function lineChart(box, data, min, max, fmt) {
  const lay = { x: 0.02, y: 0.06, w: 0.96, h: 0.8 };
  slide.addChart(pres.ChartType.line, SER.map((s, i) => ({ name: s.name, labels: YEARS, values: data[i] })), {
    ...box, layout: lay, chartColors: SER.map((s) => s.color), lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 7,
    showLegend: false, showValue: false, valAxisHidden: true, valAxisMinVal: min, valAxisMaxVal: max, valGridLine: { style: "none" },
    catGridLine: { style: "none" }, catAxisLineShow: true, catAxisLineColor: G4, catAxisLabelFontSize: 12, catAxisLabelColor: BLACK,
    catAxisLabelFontFace: F, valAxisLabelFontFace: F,
  });
  const px = box.x + lay.x * box.w, py = box.y + lay.y * box.h, pw = lay.w * box.w, ph = lay.h * box.h;
  const pt = (i, v) => ({ x: px + ((i + 0.5) * pw) / YEARS.length, y: py + ph * (1 - (v - min) / (max - min)) });
  // labels: common start once; optimistic above its points, crush below; ends go to the right column
  const s0 = pt(0, data[0][0]);
  t(fmt(data[0][0]), s0.x - 0.35, s0.y - 0.34, 0.7, 0.24, { align: "center", bold: true });
  for (let i = 1; i < YEARS.length - 1; i++) {
    const a = pt(i, data[0][i]); t(fmt(data[0][i]), a.x - 0.35, a.y - 0.32, 0.7, 0.24, { align: "center", color: RED });
    const c = pt(i, data[2][i]); t(fmt(data[2][i]), c.x - 0.35, c.y + 0.08, 0.7, 0.24, { align: "center", color: G2 });
  }
  return { pt, px, pw, plotBottom: py + ph };
}
function readingBox(p, bullets) {
  slide.addShape("rect", { x: p.x, y: READ_Y, w: p.w, h: READ_H, fill: { color: PANEL }, line: { type: "none" } });
  const paras = [];
  bullets.forEach((b, i) => {
    String(b).split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach((part, j, arr) => {
      const key = part.startsWith("**");
      const o = { bold: key, color: key ? RED : BLACK };
      if (j === 0) o.bullet = { indent: 14 };
      if (j === arr.length - 1 && i < bullets.length - 1) o.breakLine = true;
      paras.push({ text: key ? part.slice(2, -2) : part, options: o });
    });
  });
  slide.addText(paras, { x: p.x + 0.1, y: READ_Y + 0.06, w: p.w - 0.2, h: READ_H - 0.12, fontFace: F, fontSize: 13, color: BLACK,
    valign: "middle", margin: 0, paraSpaceAfter: 4, isTextBox: true });
}

// ================= panel 1: top line =================
{
  const p = panels[0];
  let y = p.y + S.subhead(slide, 1, "Resilient growth under scenario analysis", p.x, p.y, p.w);
  t("CSS Top Line Scenario Analysis (¥ Bn)", p.x, y, p.w, 0.3, { size: 14, italic: true });
  legend(p.x, y + 0.36);
  const cw = p.w - 1.55, box = { x: p.x, y: y + 0.72, w: cw, h: 5.3 - (y + 0.72) };
  const D = [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]];
  const ch = lineChart(box, D, 5.5, 19.5, (v) => v.toFixed(1));
  // right column: end values + CAGR 18-23E, at the height of each line's end
  const ex = p.x + cw + 0.02, cx = p.x + p.w - 0.85;
  t("CAGR", cx, box.y - 0.38, 0.85, 0.22, { size: 12, bold: true, underline: true, align: "center" });
  t("18-23E", cx, box.y - 0.16, 0.85, 0.22, { size: 12, align: "center" });
  const cagr = ["17%", "12%", "8%"];
  SER.forEach((s, i) => {
    const e = ch.pt(5, D[i][5]);
    t(D[i][5].toFixed(1), ex, e.y - 0.12, 0.62, 0.24, { bold: true, color: i === 0 ? RED : BLACK });
    t(cagr[i], cx, e.y - 0.12, 0.85, 0.24, { align: "center", bold: i === 0, color: i === 0 ? RED : BLACK });
  });
  const e0 = ch.pt(5, D[0][5]);
  slide.addShape("ellipse", { x: cx + 0.05, y: e0.y - 0.22, w: 0.75, h: 0.44, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
  // market growth benchmark under the CAGR column
  const m = ch.pt(0, 7.0);
  t("Market", cx - 0.05, m.y - 0.14, 0.95, 0.22, { size: 12, italic: true, color: G2, align: "center" });
  t("7%", cx, m.y + 0.08, 0.85, 0.22, { size: 12, italic: true, color: G2, align: "center" });
  readingBox(p, [
    "Three cases all indicate **above-market growth** (7%)",
    "Under the optimistic case, **~17%** 5-year could be expected, offline expansion roadmap and ramp-up speed are two key value creation levers",
  ]);
}

// ================= panel 2: capex =================
{
  const p = panels[1];
  let y = p.y + S.subhead(slide, 2, "Guaranteed financial feasibility", p.x, p.y, p.w);
  t("Required Annual Capex Scenario Analysis (¥ Mn)", p.x, y, p.w, 0.3, { size: 14, italic: true });
  legend(p.x, y + 0.36);
  const cw = p.w - 0.75, box = { x: p.x, y: y + 0.72, w: cw, h: 4.42 - (y + 0.72) };
  const D = [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]];
  const ch = lineChart(box, D, 130, 330, (v) => String(v));
  const ex = p.x + cw + 0.02;
  SER.forEach((s, i) => { const e = ch.pt(5, D[i][5]); t(String(D[i][5]), ex, e.y - 0.12, 0.7, 0.24, { bold: true, color: i === 0 ? RED : BLACK }); });
  // rows under the chart, aligned with the year columns (deck form: red bold italic row label, Mindcraft 8 "Pull-up ratio")
  const r1 = box.y + box.h + 0.04, r2 = r1 + 0.5;
  t("Capex burden¹", p.x, r1, 1.05, 0.46, { size: 12, bold: true, italic: true, color: RED, valign: "middle" });
  ["26%", "22%", "20%", "19%", "17%"].forEach((v, k) => { const q = ch.pt(k + 1, 0); t(v, q.x - 0.4, r1 + 0.1, 0.8, 0.26, { size: 13, bold: true, italic: true, align: "center" }); });
  slide.addShape("line", { x: p.x, y: r2 - 0.03, w: p.w, h: 0, line: { color: G4, width: 0.75, dashType: "dash" } });
  t("Return on capex\u00B2", p.x, r2, 1.0, 0.46, { size: 12, bold: true, italic: true, color: RED, valign: "middle" });
  const q2 = ch.pt(2, 0);   // value under 2020, clear of the row label
  t("~1.6 years", q2.x - 0.7, r2 + 0.1, 1.4, 0.26, { size: 13, bold: true, italic: true, color: RED, align: "center" });
  slide.addShape("ellipse", { x: q2.x - 0.78, y: r2 + 0.01, w: 1.56, h: 0.44, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
  t("under base case", q2.x + 0.85, r2 + 0.1, 2.4, 0.26, { size: 13, italic: true });
  readingBox(p, [
    "Increasing capital expenditure is required to support the **offline expansion** strategy",
    "Yearly capex accounts for **~20% of liquidity**, with quick return (1.6yrs), indicating a **good financial feasibility**",
  ]);
}

// ---- note line above the source (deck form: italic note, Mindcraft 5 and 8) ----
t("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store",
  B.x, 6.94, B.w, 0.24, { size: 10, italic: true, valign: "top" });

// pptxgenjs writes a <a:pPr> before every run of a paragraph (the later ones say "no bullet"), which drops the bullets of
// mixed-format bullet paragraphs and is not valid DrawingML: keep only each paragraph's first pPr.
(async () => {
  const out = __dirname + "/candidate.pptx";
  await L.save(pres, out);
  const fs = require("fs"), JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(out));
  for (const n of Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    let x = await zip.file(n).async("string");
    x = x.replace(/(<\/a:r>)<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, "$1");
    zip.file(n, x);
  }
  fs.writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
})();
