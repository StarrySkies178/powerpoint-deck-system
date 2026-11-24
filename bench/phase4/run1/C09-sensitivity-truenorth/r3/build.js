// C09 sensitivity analysis, TrueNorth Pola deck style (deck as reference, leave-one-out).
// Layout taken from the deck's backup scenario slide (Pessimistic scenario, slide-map "small-multiples"):
// bold scenario heading, native stacked columns (pola grey under Jurlique red, white seams), totals over the bars,
// dashed lines joining the bar tops, underlined CAGR 2015-2021 header with one value per segment at the right.
// Two scenarios here, so that block is stacked twice in the body.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, HOUSE } = L.start({
  ref: "Case-2016-TrueNorth-Pola-China-growth",
  title: "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic",
});

const RED = HOUSE.STYLE ? HOUSE.STYLE.roles.main : "CC0000";
const GREY = "A2A2A2", TXT = "000000", FONT = "Calibri";
const years = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const scen = [
  { name: "Normal Scenario", totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" } },
];
const r2 = (v) => Math.round(v * 100) / 100;

function block(s, top) {
  // scenario heading (bold 18 pt, as on the deck's scenario slide)
  slide.addText(s.name, { x: 0.4, y: top, w: 4, h: 0.33, fontFace: FONT, fontSize: 18, bold: true, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  const jur = s.totals.map((t, i) => r2(t - s.pola[i]));
  const max = Math.ceil(Math.max(...s.totals) / 0.5) * 0.5;
  // chart frame and manual inner plot area, so the overlays (totals, dashed lines, CAGR) can be placed exactly
  const cx = 0.3, cy = top + 0.42, cw = 7.75, ch = 2.45;
  const lay = { x: 0.105, y: 0.1, w: 0.885, h: 0.76 };
  const px = cx + cw * lay.x, py = cy + ch * lay.y, pw = cw * lay.w, ph = ch * lay.h;
  slide.addChart(pres.ChartType.bar, [
    { name: "pola", labels: years, values: s.pola },
    { name: "Jurlique", labels: years, values: jur },
  ], {
    x: cx, y: cy, w: cw, h: ch, layout: lay, barDir: "col", barGrouping: "stacked", barGapWidthPct: 50, chartColors: [GREY, RED],
    dataBorder: { pt: 1, color: "FFFFFF" }, showValue: false, showLegend: false,
    valAxisMinVal: 0, valAxisMaxVal: max, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: `[>=${max}]"¥"0.0"M";0.0`,
    valAxisLabelFontSize: 12, valAxisLabelFontFace: FONT, valAxisLabelColor: TXT, valAxisLineShow: true, valAxisLineColor: "777777",
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: 12, catAxisLabelFontFace: FONT, catAxisLabelColor: TXT, catAxisLineShow: true, catAxisLineColor: "777777",
  });
  const n = years.length, cat = pw / n, bw = cat / 1.5, yOf = (v) => py + ph * (1 - v / max);
  const xL = (i) => px + i * cat + (cat - bw) / 2;
  // legend inside the plot, top left (pola, Jurlique)
  [["pola", GREY], ["Jurlique", RED]].forEach(([nm, col], k) => {
    const lx = px + 0.55 + k * 0.95;
    slide.addShape("rect", { x: lx, y: py - 0.02, w: 0.1, h: 0.1, fill: { color: col }, line: { type: "none" } });
    slide.addText(nm, { x: lx + 0.12, y: py - 0.12, w: 0.9, h: 0.28, fontFace: FONT, fontSize: 14, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  });
  // totals over the bars (body size, as the deck's chart totals)
  s.totals.forEach((t, i) => slide.addText(t.toFixed(1), { x: xL(i) - 0.1, y: yOf(t) - 0.33, w: bw + 0.2, h: 0.3, fontFace: FONT, fontSize: 14, color: TXT, align: "center", valign: "bottom", margin: 0, isTextBox: true }));
  // dashed lines joining the tops of the totals and of the pola segment
  [s.totals, s.pola].forEach((v) => {
    for (let i = 0; i < n - 1; i++) {
      const x1 = xL(i) + bw, x2 = xL(i + 1), y1 = yOf(v[i]), y2 = yOf(v[i + 1]);
      slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(Math.abs(y2 - y1), 0.001), flipV: y2 < y1,
        line: { color: TXT, width: 0.75, dashType: "dash" } });
    }
  });
  // CAGR 2015-2021 at the right, each value level with its segment of the last bar
  const rx = 8.25, rw = 1.25;
  slide.addText([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "2015-2021" }],
    { x: rx, y: cy - 0.36, w: rw, h: 0.52, fontFace: FONT, fontSize: 14, color: TXT, align: "center", valign: "top", margin: 0, isTextBox: true });
  const last = n - 1;
  [[s.cagr.jur, (yOf(s.totals[last]) + yOf(s.pola[last])) / 2], [s.cagr.pola, (yOf(s.pola[last]) + yOf(0)) / 2]].forEach(([v, y]) =>
    slide.addText(v, { x: rx, y: y - 0.15, w: rw, h: 0.3, fontFace: FONT, fontSize: 14, color: TXT, align: "center", valign: "middle", margin: 0, isTextBox: true }));
}
(async () => {
  // deck frame the style profile does not carry: grey bottom bar (as on every slide of the deck; backup slides show no page number)
  // and the TrueNorth logo top right, read from the reference deck's own media at build time (the logo picture every slide carries)
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
  const path = require("path"), fs = require("fs");
  const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs"))] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, "../../../../../Templates/Case-2016-TrueNorth-Pola-China-growth.pptx")));
  const logo = await zip.file("ppt/media/image1.jpg").async("base64");
  slide.addImage({ data: "image/jpeg;base64," + logo, x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
  block(scen[0], 1.5);
  block(scen[1], 4.33);
  await L.save(pres, __dirname + "/candidate.pptx");
})();
