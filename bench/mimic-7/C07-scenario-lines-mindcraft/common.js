// common.js: draws the C07 slide (two scenario line charts) from a content spec. Used by A/build.js and B/build.js.
// Geometry is measured on original-1920.png (px / 144 = inches). The stored objects of case19-mindcraft-014
// (panel headers, crumb arrows, chart titles, takeaway boxes, return label) are placed afterwards by common.py.
const L = require("../../lib/bench_lib.js");

function build(spec) {
  const { pres, slide, P } = L.start({ ref: "Case-2019-Mindcraft", title: spec.title });
  const F = P.THEME.bodyFontFace;
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: 12, color: "000000", margin: 0, valign: "middle", isTextBox: true, ...o });

  // breadcrumb: bold italic, grey items and the current one in the main colour; the red arrows are stored objects
  spec.crumb.items.forEach((t, i) => T(t, spec.crumb.x[i], 0.05, 3.2, 0.3, { fontSize: 14, bold: true, italic: true, color: i === spec.crumb.current ? "C00000" : "A6A6A6", valign: "top" }));

  // native line chart with its own value axis, markers, no gridlines; plot box given in inches
  function lineChart(c) {
    const fx = c.frame, pb = c.plot;   // frame and inner plot box (inches)
    const data = c.series.map((s) => ({ name: s.name, labels: c.cats, values: s.values }));
    slide.addChart(pres.charts.LINE, data, {
      x: fx.x, y: fx.y, w: fx.w, h: fx.h,
      layout: { x: (pb.x - fx.x) / fx.w, y: (pb.y - fx.y) / fx.h, w: pb.w / fx.w, h: pb.h / fx.h },
      chartColors: c.series.map((s) => s.color), lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 7,
      lineDataSymbolLineSize: 1,
      valAxisMinVal: c.min, valAxisMaxVal: c.max, valAxisMajorUnit: c.step, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      valAxisLabelFontSize: 12, catAxisLabelFontSize: 12, valAxisLabelFontFace: F, catAxisLabelFontFace: F, valAxisLabelColor: "000000", catAxisLabelColor: "000000",
      valAxisLineShow: true, catAxisLineShow: true, valAxisLineColor: "000000", catAxisLineColor: "000000", valAxisLineSize: 0.75, catAxisLineSize: 0.75,
      valAxisMajorTickMark: "out", catAxisMajorTickMark: "none", showLegend: false, showValue: false, objectName: c.name,
    });
    const n = c.cats.length, X = (i) => pb.x + (i / (n - 1)) * pb.w, Y = (v) => pb.y + pb.h - ((v - c.min) / (c.max - c.min)) * pb.h;
    return { X, Y };
  }

  // plot box measured from the original for the axis range [lo, top]; a data point above `top` lifts the box top so it is not clipped
  function plotBox(pb, c) {
    const top = c.top ?? c.max; if (c.max <= top) return pb;
    const k = pb.h / (top - c.min), dy = (c.max - top) * k;
    return { x: pb.x, y: pb.y - dy, w: pb.w, h: pb.h + dy };
  }
  // ---- panel 1: scenario lines, CAGR column level with the line ends, legend under the chart
  const a = spec.p1, g1 = lineChart({ ...a, name: "chart scenario top line", frame: { x: 0.40, y: 2.25, w: 5.30, h: 2.95 }, plot: plotBox({ x: 0.94, y: 2.45, w: 4.42, h: 2.34 }, a) });
  T([{ text: a.cagrHead[0], options: { bold: true, underline: { style: "sng" }, breakLine: true } }, { text: a.cagrHead[1] }],
    5.55, 1.80, 0.9, 0.48, { fontSize: 14, align: "center", valign: "top", lineSpacing: 19 });
  const ends = a.series.map((s) => g1.Y(s.values[s.values.length - 1]));
  const order = ends.map((y, k) => [y, k]).sort((p, q) => p[0] - q[0]), ey = [];
  let prev = 2.15; order.forEach(([y, k]) => { const yy = Math.max(y, prev + 0.3); ey[k] = yy; prev = yy; });
  a.series.forEach((s, k) => T(s.cagr, 5.55, ey[k] - 0.11, 0.9, 0.32, { fontSize: 14, align: "center" }));
  // legend (drawn, as the original): line with a dot, then the name
  let lx = 1.01;
  a.legend.forEach((k) => {
    const s = a.series[k], y = 5.34;
    slide.addShape("line", { x: lx, y, w: 0.47, h: 0, line: { color: s.color, width: 3.5 }, objectName: "legend line" });
    slide.addShape("ellipse", { x: lx + 0.235 - 0.05, y: y - 0.05, w: 0.1, h: 0.1, fill: { color: s.color }, line: { color: s.color, width: 0.75 }, objectName: "legend dot" });
    const w = s.name.length * 0.09 + 0.05;
    T(s.name, lx + 0.53, y - 0.15, w, 0.3);
    lx += 0.53 + w + 0.12;
  });

  // ---- panel 2: capex lines, burden row and return line under the chart
  const b = spec.p2, g2 = lineChart({ ...b, name: "chart capex scenarios", frame: { x: 6.80, y: 2.20, w: 6.25, h: 2.95 }, plot: plotBox({ x: 7.38, y: 2.36, w: 5.40, h: 2.43 }, b) });
  T([{ text: b.burdenLabel, options: { bold: true, italic: true } }, { text: " 1)", options: { bold: true, italic: true, superscript: true } }], 6.74, 5.08, 1.9, 0.3);
  b.burden.forEach((v, i) => T(v, g2.X(i + 1) - 0.42 + (spec.burdenNudge ? spec.burdenNudge[i] : 0), 5.08, 0.84, 0.3, { bold: true, italic: true, align: "center" }));
  T(b.returnVal, 10.38, 5.37, 1.6, 0.3, { bold: true, italic: true, color: "C00000" });

  // ---- foot: note, grey rule, source, deck name
  T([{ text: "Note: " }, { text: spec.note }], 0.39, 6.93, 12.5, 0.24, { italic: true, valign: "middle", fontSize: 10 });
  slide.addShape("line", { x: 0, y: 7.21, w: 13.333, h: 0, line: { color: "A6A6A6", width: 0.75 }, objectName: "foot rule" });
  T(spec.source, 0.39, 7.18, 9, 0.26, { italic: true, valign: "middle", fontSize: 10 });
  T("MindCraft", 11.60, 7.24, 1.07, 0.26, { bold: true, color: "C00000", align: "right", fontSize: 11 });
  return { pres, slide };
}
module.exports = { build, save: L.save };
