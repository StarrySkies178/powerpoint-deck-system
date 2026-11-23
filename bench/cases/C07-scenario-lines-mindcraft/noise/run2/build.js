// C07 run2: Mindcraft financial forecasting slide (HALF2: scenario line chart + CAGR column | capex line chart + burden/return rows)
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Resilient growth performance is expected under scenario analysis, affordable capex indicates a good financial feasibility",
  source: "Source: MindCraft Analysis, Wind, Expert interview, Bloomberg",
  crumb: { items: ["Market Analysis", "Growth Strategy", "Financial Forecasting"], current: 2 },
});
const C = P.C, txt = P.txt, FONT = P.THEME.bodyFontFace;
const YEARS = ["2018", "2019E", "2020E", "2021E", "2022E", "2023E"];
const SER = [
  { name: "Optimistic", color: C.navy },   // the case the takeaway is about: deck red
  { name: "Base", color: C.g4 },
  { name: "Crush", color: C.g2 },
];
const LEG_W = 1.3;          // left column: legend (and, in panel 2, the row labels)
const PL = { x: 0.03, y: 0.1, w: 0.94, h: 0.76 };   // plot area inside the chart frame (fractions), so labels and rows can align

const it = (t) => [{ text: t, options: { italic: true } }];   // txt() has no italic flag: italic goes on the run
function unitLine(slide, text, x, y, w) {
  txt(slide, it(text), x, y, w, 0.3, { fontSize: 12, italic: true, color: C.text, valign: "middle", margin: 0, noScale: true });
}
function legend(slide, x, y) {
  SER.forEach((s, i) => {
    const yy = y + i * 0.34;
    slide.addShape("line", { x, y: yy + 0.15, w: 0.32, h: 0, line: { color: s.color, width: 2 } });
    slide.addShape("ellipse", { x: x + 0.11, y: yy + 0.1, w: 0.1, h: 0.1, fill: { color: s.color }, line: { type: "none" } });
    txt(slide, s.name, x + 0.4, yy, LEG_W - 0.42, 0.3, { fontSize: 11, color: C.text, valign: "middle", margin: 0, noScale: true });
  });
}
function lineChart(slide, series, box, min, max, fmt) {
  S.chartIn(pres, slide, {
    type: "line", labels: YEARS, series: series.map((v, i) => ({ name: SER[i].name, values: v })), colors: SER.map((s) => s.color), format: fmt,
    options: { showLegend: false, valAxisMinVal: min, valAxisMaxVal: max, layout: PL, dataLabelFontSize: 11, catAxisLabelFontSize: 12,
      dataLabelColor: C.text, catAxisLineShow: true, catAxisLineColor: C.g2, lineSize: 2.25, lineDataSymbolSize: 6 },
  }, box);
  const px = box.x + PL.x * box.w, pw = PL.w * box.w, py = box.y + PL.y * box.h, ph = PL.h * box.h;
  return { slotX: (i) => px + (i + 0.5) * pw / YEARS.length, slotW: pw / YEARS.length, valY: (v) => py + ph * (max - v) / (max - min), right: px + pw };
}
const TK_H = 1.3;

S.composeSlide(pres, slide, {
  layout: "HALF2",
  panels: [
    {
      headline: "Resilient growth under scenario analysis",
      draw: (sl, b) => {
        unitLine(sl, "CSS Top Line Scenario Analysis, 2018-2023E (¥ Bn)", b.x, b.y, b.w);
        const tkY = b.y + b.h - TK_H, cy = b.y + 0.4, ch = tkY - 0.12 - cy;
        const cagrW = 1.1, cb = { x: b.x + LEG_W, y: cy, w: b.w - LEG_W - cagrW, h: ch };
        legend(sl, b.x, cy + 0.15);
        const g = lineChart(sl, [[8.3, 10.1, 11.8, 13.6, 15.6, 18.2], [8.3, 9.6, 10.7, 12.0, 13.3, 14.6], [8.3, 9.2, 9.7, 10.5, 11.3, 12.2]], cb, 7, 21, "0.0");
        // CAGR column beside the line ends, each value in its case's colour (deck form: CAGR column next to the chart, slide 4)
        const cx = b.x + b.w - cagrW + 0.1, cw = cagrW - 0.1;
        txt(sl, [{ text: "CAGR", options: { bold: true, underline: { style: "sng" }, breakLine: true } }, { text: "18-23E", options: {} }], cx, cy - 0.05, cw, 0.48, { fontSize: 12, color: C.text, align: "center", valign: "top", margin: 0, noScale: true });
        [18.2, 14.6, 12.2].forEach((v, i) => txt(sl, ["17%", "12%", "8%"][i], cx, g.valY(v) - 0.15, cw, 0.3, { fontSize: 12, bold: true, color: SER[i].color === C.g2 ? C.g3 : SER[i].color, align: "center", valign: "middle", margin: 0, noScale: true }));
        // the optimistic CAGR circled in red, as the deck circles the value that matters
        sl.addShape("ellipse", { x: cx + 0.08, y: g.valY(18.2) - 0.19, w: cw - 0.16, h: 0.38, fill: { type: "none" }, line: { color: C.navy, width: 1.5 } });
        S.readingBox(sl, [
          "Three cases all indicate **above-market growth** (7%)",
          "Under the optimistic case, **~17% 5-year** could be expected, **offline expansion roadmap** and **ramp-up speed** are two key value creation levers",
        ], { x: b.x, y: tkY, w: b.w, h: TK_H }, { size: 12 });
      },
    },
    {
      headline: "Guaranteed financial feasibility",
      draw: (sl, b) => {
        unitLine(sl, "Required Annual Capex Scenario Analysis, 2018-2023E (¥ Mn)", b.x, b.y, b.w);
        const tkY = b.y + b.h - TK_H, rowH = 0.42, rowsY = tkY - 0.1 - 2 * rowH, cy = b.y + 0.4, ch = rowsY - 0.04 - cy;
        const cb = { x: b.x + LEG_W, y: cy, w: b.w - LEG_W, h: ch };
        legend(sl, b.x, cy + 0.15);
        const g = lineChart(sl, [[200, 231, 244, 255, 292, 309], [200, 209, 216, 233, 268, 277], [200, 175, 180, 201, 228, 243]], cb, 150, 330, "#,##0");
        // rows under the chart, values aligned to the years (deck form: the "Pull-up ratio" row, slide 8)
        const red = { fontSize: 12, bold: true, italic: true, color: C.navy, valign: "middle", margin: 0, noScale: true };
        sl.addShape("line", { x: b.x, y: rowsY, w: b.w, h: 0, line: { color: C.g2, width: 0.75, dashType: "dash" } });
        txt(sl, it("Capex burden¹"), b.x, rowsY, LEG_W + g.slotW, rowH, red);
        ["26%", "22%", "20%", "19%", "17%"].forEach((v, i) => txt(sl, it(v), g.slotX(i + 1) - 0.4, rowsY, 0.8, rowH, { ...red, align: "center" }));
        txt(sl, [{ text: "Return on capex", options: { italic: true, breakLine: true } }, { text: "under base case²", options: { italic: true } }], b.x, rowsY + rowH, LEG_W + g.slotW, rowH, { ...red, fontSize: 10 });
        const mx = (g.slotX(1) + g.slotX(5)) / 2;
        txt(sl, it("~1.6 years"), mx - 0.8, rowsY + rowH, 1.6, rowH, { ...red, align: "center" });
        sl.addShape("ellipse", { x: mx - 0.85, y: rowsY + rowH + 0.01, w: 1.7, h: rowH - 0.02, fill: { type: "none" }, line: { color: C.navy, width: 1.5 } });
        S.readingBox(sl, [
          "Increasing capital expenditure is required to support the **offline expansion strategy**",
          "Yearly capex accounts for **~20% of liquidity**, with quick return (**1.6yrs**), indicating a **good financial feasibility**",
        ], { x: b.x, y: tkY, w: b.w, h: TK_H }, { size: 12 });
      },
    },
  ],
}, { x: P.BODY.x, y: P.BODY.y, w: P.BODY.w, h: 5.47 });

// note line above the source, as on the deck's other financial slide (slide 8)
txt(slide, it("Note: 1) capex burden = Capex / cash flow from operations; 2) return on capex = capex store / avg. operational income per store"),
  P.BODY.x, 6.9, P.BODY.w, 0.24, { fontSize: 10, italic: true, color: C.text, valign: "middle", margin: 0, noScale: true });

L.save(pres, __dirname + "/candidate.pptx");
