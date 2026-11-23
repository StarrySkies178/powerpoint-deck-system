// C09 variant b: sensitivity analysis, two stacked scenario charts with CAGR column, TrueNorth Pola deck style.
// Style: Style/refs/Case-2016-TrueNorth-Pola-China-growth.profile.json (title band, Calibri, red CC0000 / grey).
// Layout: the layout description of the case; chart form and furniture (logo top right, grey bottom strip,
// bold section heading, stacked columns with dashed connectors, total labels, small legend inside the plot,
// value axis with the unit on its top tick, CAGR column on the right) follow the deck's backup scenario
// slide 23 ("Pessimistic scenario", small-multiples), the closest other slide in the brief's slide map.
// No generator draws stacked columns with dashed connectors and a value axis, so the chart is drawn with shapes
// in the deck's measured geometry (column 0.51 in, pitch 0.76 in, 12 pt labels, 18 pt bold heading).
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));

const TITLE = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
const RED = "CC0000", GREY = "A2A2A2", BLACK = "000000", STRIP = "CCCCCC", FONT = "Calibri";
const YEARS = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
const SCEN = [
  { name: "Normal Scenario", max: 2.0, totals: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { Jurlique: "15%", pola: "25%" } },
  { name: "Optimistic Scenario", max: 2.5, totals: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { Jurlique: "19%", pola: "27%" } },
];

function text(slide, t, x, y, w, h, o = {}) {
  slide.addText(t, { x, y, w, h, fontFace: FONT, fontSize: o.size || 12, color: o.color || BLACK, bold: !!o.bold, underline: o.underline ? { style: "sng" } : undefined,
    align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
}
function dashed(slide, x1, y1, x2, y2) {
  const up = y2 < y1;
  slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(0.001, Math.abs(y2 - y1)), flipV: up, line: { color: BLACK, width: 0.75, dashType: "dash" } });
}

function section(slide, s, y0) {
  const AX = 1.09, COL0 = 1.22, PITCH = 0.76, CW = 0.51, RIGHT = 7.94;
  const top = y0 + 0.56, base = y0 + 2.46, k = (base - top) / s.max;   // inches per ¥M
  text(slide, s.name, 0.37, y0, 4.5, 0.36, { size: 18, bold: true, valign: "top" });
  // value axis: line, ticks every 0.5, unit on the top tick
  slide.addShape("line", { x: AX, y: top, w: 0, h: base - top, line: { color: BLACK, width: 0.75 } });
  for (let v = 0; v <= s.max + 1e-9; v += 0.5) {
    const y = base - v * k, top1 = Math.abs(v - s.max) < 1e-9;
    slide.addShape("line", { x: AX - 0.05, y, w: 0.05, h: 0, line: { color: BLACK, width: 0.75 } });
    text(slide, top1 ? `¥${v.toFixed(1)}M` : v.toFixed(1), AX - 0.75, y - 0.1, 0.68, 0.2, { align: "right" });
  }
  // legend inside the plot, top left
  slide.addShape("rect", { x: 1.67, y: top - 0.05, w: 0.1, h: 0.1, fill: { color: GREY }, line: { type: "none" } });
  text(slide, "pola", 1.81, top - 0.1, 0.38, 0.2);
  slide.addShape("rect", { x: 2.21, y: top - 0.05, w: 0.1, h: 0.1, fill: { color: RED }, line: { type: "none" } });
  text(slide, "Jurlique", 2.35, top - 0.1, 0.7, 0.2);
  // stacked columns: pola (grey) at the bottom, Jurlique (red) on top; white edges as in the deck
  const pts = s.totals.map((t, i) => {
    const x = COL0 + i * PITCH, yT = base - t * k, yP = base - s.pola[i] * k;
    slide.addShape("rect", { x, y: yP, w: CW, h: base - yP, fill: { color: GREY }, line: { color: "FFFFFF", width: 0.75 } });
    slide.addShape("rect", { x, y: yT, w: CW, h: yP - yT, fill: { color: RED }, line: { color: "FFFFFF", width: 0.75 } });
    text(slide, t.toFixed(1), x - 0.15, yT - 0.26, CW + 0.3, 0.22, { align: "center", valign: "bottom" });
    text(slide, YEARS[i], x - 0.15, base + 0.04, CW + 0.3, 0.22, { align: "center", valign: "top" });
    return { x, yT, yP };
  });
  slide.addShape("line", { x: AX, y: base, w: RIGHT - AX, h: 0, line: { color: BLACK, width: 0.75 } });   // category axis over the bars' white edges
  for (let i = 0; i + 1 < pts.length; i++) {
    dashed(slide, pts[i].x + CW, pts[i].yT, pts[i + 1].x, pts[i + 1].yT);
    dashed(slide, pts[i].x + CW, pts[i].yP, pts[i + 1].x, pts[i + 1].yP);
  }
  // growth-rate column: CAGR 2015-2021, each figure level with its series in the last column
  const cx = 8.27, cw = 1.0, last = pts[pts.length - 1];
  text(slide, "CAGR", cx, y0 + 0.42, cw, 0.2, { align: "center", underline: true });
  text(slide, "2015-2021", cx, y0 + 0.62, cw, 0.2, { align: "center" });
  text(slide, s.cagr.Jurlique, cx, (last.yT + last.yP) / 2 - 0.11, cw, 0.22, { align: "center" });
  text(slide, s.cagr.pola, cx, (last.yP + base) / 2 - 0.11, cw, 0.22, { align: "center" });
}

(async () => {
  const { pres, slide } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title: TITLE });
  // team logo top right (the deck's own logo file, taken from the reference deck's media)
  const zip = await JSZip.loadAsync(fs.readFileSync(path.resolve(__dirname, "../../../../Templates/Case-2016-TrueNorth-Pola-China-growth.pptx")));
  const logo = await zip.file("ppt/media/image1.jpg").async("base64");
  slide.addImage({ data: "image/jpeg;base64," + logo, x: 8.54, y: 0.0, w: 1.42, h: 0.41 });
  // plain grey strip along the bottom edge, no text
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: STRIP }, line: { type: "none" } });
  section(slide, SCEN[0], 1.5);
  section(slide, SCEN[1], 4.33);
  const out = __dirname + "/candidate.pptx";
  await L.save(pres, out);
  // the deck's slides carry no page number: drop the slide-number field the layout adds to the slide
  const z = await JSZip.loadAsync(fs.readFileSync(out)), sp = "ppt/slides/slide1.xml";
  const x = (await z.file(sp).async("string")).replace(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?type="sldNum"[\s\S]*?<\/p:sp>/g, "");
  z.file(sp, x);
  fs.writeFileSync(out, await z.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
})();
