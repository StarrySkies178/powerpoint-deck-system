// patterns_story.js — generators learned from the 10 case-competition decks (2016-17).
// Story devices (executive-summary forms, evidence panels, insight / so-what boxes, issue→goal→strategy)
// and the exhibits those decks use to turn a message into a figure (stacked columns with a CAGR table,
// growth pairs, combo growth, donut KPIs, positioning maps, personas, customer journeys).
// Same rules as patterns.js: any count, grey does the work, ONE highlight makes the point, house colours only.

const G = require("./patterns.js");
const { C, txt, fitSize, BODY } = G;

// ---------- small helpers ----------
function chip(slide, label, x, y, s = 0.3, fill = C.navy) {           // numbered / lettered square chip
  slide.addShape("rect", { x, y, w: s, h: s, fill: { color: fill }, line: { type: "none" } });
  txt(slide, String(label), x, y, s, s, { fontSize: s > 0.4 ? 16 : 11, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
}
function subhead(slide, n, text, x, y, w) {                            // [n] sub-headline sentence + rule (the panel's point)
  chip(slide, n, x, y + 0.02, 0.28);
  txt(slide, text, x + 0.36, y, w - 0.36, 0.5, { max: 13, min: 10, bold: true, color: C.text, valign: "middle" });
  slide.addShape("line", { x, y: y + 0.52, w, h: 0, line: { color: C.navy, width: 1 } });
}
function insightBox(slide, spec, box) {                                // "Insights" label + bullets; **key words** in bold
  txt(slide, spec.label || "Insights", box.x, box.y, box.w, 0.34, { fontSize: 12, bold: true, color: C.navy });
  slide.addShape("line", { x: box.x, y: box.y + 0.36, w: box.w, h: 0, line: { color: C.navy, width: 1 } });
  const items = spec.bullets || [], n = Math.max(1, items.length);
  const plainAll = items.map((b) => String(b).replace(/\*\*/g, "")).join(" ");
  const size = fitSize(plainAll, box.w - 0.4, (box.h - 0.5) * 0.85, 13, 10);
  // one text box per bullet, so bold runs stay inside their paragraph; the marker is a small square shape
  const lines = items.map((b) => Math.max(1, Math.ceil(String(b).replace(/\*\*/g, "").length * size * 0.52 / ((box.w - 0.3) * 72))));
  const tot = lines.reduce((a, c) => a + c, 0), avail = box.h - 0.5;
  let y = box.y + 0.46;
  items.forEach((b, i) => {
    const h = Math.min(avail * lines[i] / tot, lines[i] * size * 1.3 / 72 + 0.12);
    slide.addShape("rect", { x: box.x + 0.02, y: y + size / 72 * 0.45, w: 0.07, h: 0.07, fill: { color: C.navy }, line: { type: "none" } });
    const runs = String(b).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => ({ text: p.startsWith("**") ? p.slice(2, -2) : p, options: { bold: p.startsWith("**") } }));
    slide.addText(runs, { x: box.x + 0.18, y, w: box.w - 0.18, h, fontFace: "Arial", fontSize: size, color: C.text, valign: "top", margin: 0, isTextBox: true });
    y += h + 0.06;
  });
}
function soWhat(slide, text, box) {                                     // fixed-place recommendation box (bottom right)
  slide.addShape("roundRect", { ...box, rectRadius: 0.08, fill: { color: C.hiBand }, line: { type: "none" } });
  slide.addShape("rect", { x: box.x, y: box.y + 0.12, w: 0.07, h: box.h - 0.24, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, text, box.x + 0.2, box.y + 0.06, box.w - 0.3, box.h - 0.12, { max: 14, min: 10, bold: true, color: C.navy, valign: "middle" });
}

// ---------- charts (native, editable data) ----------
function chartIn(pres, slide, c, box) {
  // c: {type:'column'|'bar'|'stacked'|'stacked100'|'line'|'pie'|'donut', labels, series:[{name,values}], highlight (series or point index), format}
  const t = c.type || "column", n = c.series.length, single = n === 1;
  const greys = [C.g4, C.g5, C.g3, C.g4, C.g5];
  let colors = c.series.map((_, i) => (c.highlight === i ? C.navy : greys[i % greys.length]));
  if (single && ["column", "bar"].includes(t) && c.highlight != null) {   // one series: highlight one point via two stacked series
    const v = c.series[0].values;
    const s2 = [{ name: "Others", labels: c.labels, values: v.map((x, i) => (i === c.highlight ? 0 : x)) }, { name: c.series[0].name, labels: c.labels, values: v.map((x, i) => (i === c.highlight ? x : 0)) }];
    slide.addChart(pres.ChartType.bar, s2, { ...box, barDir: t === "bar" ? "bar" : "col", barGrouping: "stacked", chartColors: [C.g3, C.navy], showLegend: false, showValue: true,
      dataLabelPosition: "inEnd", dataLabelFontSize: 10, dataLabelColor: C.white, dataLabelFormatCode: (c.format || "#,##0") + ";;;", catAxisLabelFontSize: 10, catAxisLabelColor: C.text,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 50 });
    return;
  }
  if (single && ["column", "bar", "line"].includes(t)) colors = [C.navy];
  const common = { ...box, chartColors: colors, showLegend: n > 1, legendPos: "b", legendFontSize: 9, legendColor: C.text, catAxisLabelFontSize: 10, catAxisLabelColor: C.text,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, dataLabelFontSize: 9, showValue: true, dataLabelFormatCode: c.format || "#,##0" };
  const data = c.series.map((s) => ({ name: s.name, labels: c.labels, values: s.values }));
  if (t === "radar") { slide.addChart(pres.ChartType.radar, data, { ...common, showValue: false, radarStyle: "filled", chartColors: c.series.map((_, i) => (c.highlight === i ? C.navy : [C.g3, C.cyan, C.g4][i % 3])), catAxisLabelFontSize: 10 }); return; }
  if (t === "line") slide.addChart(pres.ChartType.line, data, { ...common, lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 6, dataLabelPosition: "t" });
  else if (t === "pie" || t === "donut") {
    const v = c.series[0].values, pc = v.map((_, i) => (c.highlight === i ? C.navy : greys[i % greys.length]));
    slide.addChart(t === "pie" ? pres.ChartType.pie : pres.ChartType.doughnut, data.slice(0, 1), { ...box, chartColors: pc, showLegend: true, legendPos: "r", legendFontSize: 9, showPercent: true, showValue: false, dataLabelColor: C.white, dataLabelFontSize: 10, holeSize: 55 });
  } else {
    const stacked = t === "stacked" || t === "stacked100";
    slide.addChart(pres.ChartType.bar, data, { ...common, barDir: t === "bar" ? "bar" : "col", barGrouping: t === "stacked100" ? "percentStacked" : stacked ? "stacked" : "clustered",
      dataLabelPosition: stacked ? "ctr" : "outEnd", dataLabelColor: stacked ? C.white : C.text, barGapWidthPct: 50 });
  }
}

// stacked columns + CAGR table on the right; the highlighted segment is navy and its CAGR row is circled
function stackedCagr(pres, slide, spec, box = BODY) {
  // spec.periods:[..], spec.series:[{name, values}] (bottom→top), spec.cagr:{headers:[..], rows:[[..]] per series}, spec.highlight, spec.unit
  const tw = Math.min(3.4, box.w * 0.4), cw = box.w - tw - 0.15, n = spec.series.length;
  const greys = [C.g4, C.g5, C.g3, C.g4, C.g5];
  const colors = spec.series.map((_, i) => (spec.highlight === i ? C.navy : greys[i % greys.length]));
  if (spec.unit) txt(slide, spec.unit, box.x, box.y, 2.5, 0.3, { fontSize: 10, color: C.g5 });
  const data = spec.series.map((s) => ({ name: s.name, labels: spec.periods, values: s.values }));
  slide.addChart(pres.ChartType.bar, data, { x: box.x, y: box.y + 0.3, w: cw, h: box.h - 0.3, barDir: "col", barGrouping: "stacked", chartColors: colors, showLegend: false,
    showValue: true, dataLabelPosition: "ctr", dataLabelFontSize: 9, dataLabelColor: C.white, dataLabelFormatCode: "#,##0;;;", catAxisLabelFontSize: 11, catAxisLabelColor: C.text,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 60 });
  // legend + CAGR table, rows in the same top→bottom order as the stack
  const hdr = spec.cagr?.headers || [], x0 = box.x + cw + 0.15, rowH = Math.min(0.42, (box.h - 0.7) / n);
  const nameW = tw - hdr.length * 0.8;
  txt(slide, "CAGR", x0 + nameW, box.y + 0.05, hdr.length * 0.8, 0.28, { fontSize: 11, bold: true, color: C.navy, align: "center" });
  hdr.forEach((h, j) => txt(slide, h, x0 + nameW + j * 0.8, box.y + 0.32, 0.8, 0.28, { fontSize: 9, color: C.g5, align: "center" }));
  [...spec.series].map((s, i) => [s, i]).reverse().forEach(([s, i], k) => {
    const y = box.y + 0.7 + k * rowH, hi = spec.highlight === i;
    slide.addShape("rect", { x: x0, y: y + rowH / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: colors[i] }, line: { type: "none" } });
    txt(slide, s.name, x0 + 0.22, y, nameW - 0.25, rowH, { max: 11, min: 8, bold: hi, color: C.text, valign: "middle" });
    (spec.cagr?.rows?.[i] || []).forEach((v, j) => txt(slide, v, x0 + nameW + j * 0.8, y, 0.8, rowH, { fontSize: 11, bold: hi, color: hi ? C.navy : C.text, align: "center", valign: "middle" }));
    if (hi) slide.addShape("ellipse", { x: x0 + nameW + 0.02, y: y + 0.02, w: hdr.length * 0.8 - 0.04, h: rowH - 0.04, fill: { type: "none" }, line: { color: C.accent, width: 1.75 } });
  });
}

// paired columns (before / after) with "+x%" growth callouts above each pair; one pair highlighted
function growthPairs(pres, slide, spec, box = BODY) {
  // spec.labels:[..], spec.a:{name, values}, spec.b:{name, values}, spec.highlight (pair index)
  const n = spec.labels.length;
  slide.addChart(pres.ChartType.bar, [{ name: spec.a.name, labels: spec.labels, values: spec.a.values }, { name: spec.b.name, labels: spec.labels, values: spec.b.values }], {
    x: box.x, y: box.y + 0.6, w: box.w, h: box.h - 0.6, barDir: "col", barGrouping: "clustered", chartColors: [C.g3, C.navy], showLegend: true, legendPos: "t", legendFontSize: 10,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelColor: C.text, catAxisLabelFontSize: 11, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    barGapWidthPct: 70, layout: { x: 0.02, y: 0.12, w: 0.96, h: 0.76 } });
  const pw = box.w * 0.96 / n;
  spec.labels.forEach((_, i) => {
    const g = spec.a.values[i] ? Math.round((spec.b.values[i] / spec.a.values[i] - 1) * 100) : 0, hi = spec.highlight === i;
    const x = box.x + box.w * 0.02 + i * pw + pw / 2 - 0.42;
    slide.addShape("ellipse", { x, y: box.y + 0.05, w: 0.84, h: 0.42, fill: { color: hi ? C.accent : C.white }, line: { color: hi ? C.accent : C.g4, width: 1 } });
    txt(slide, (g >= 0 ? "+" : "") + g + "%", x, box.y + 0.05, 0.84, 0.42, { fontSize: 12, bold: true, color: hi ? C.white : C.text, align: "center", valign: "middle", margin: 0 });
  });
}

// history + forecast bars with a CAGR callout over each period — "the market grows, but more slowly"
// (a growth line on a second axis renders unreliably outside PowerPoint, so the growth is written as CAGR callouts)
function growthBars(pres, slide, spec, box = BODY) {
  // spec.labels, spec.values, spec.forecastFrom (index where forecast starts), spec.name, spec.format
  const n = spec.labels.length, ff = spec.forecastFrom ?? n;
  const hist = spec.values.map((v, i) => (i < ff ? v : 0)), fc = spec.values.map((v, i) => (i >= ff ? v : 0));
  const top = 0.75, ch = { x: box.x, y: box.y + top, w: box.w, h: box.h - top };
  slide.addChart(pres.ChartType.bar, [{ name: spec.name || "Actual", labels: spec.labels, values: hist }, { name: (spec.name || "") + " forecast", labels: spec.labels, values: fc }], {
    ...ch, barDir: "col", barGrouping: "stacked", chartColors: [C.navy, C.cyan], showLegend: false, showValue: true, dataLabelPosition: "inEnd", dataLabelColor: C.white,
    dataLabelFontSize: 10, dataLabelFormatCode: (spec.format || "#,##0") + ";;;", catAxisLabelFontSize: 11, catAxisLabelColor: C.text, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 45, layout: { x: 0.01, y: 0.02, w: 0.98, h: 0.88 } });
  const cagr = (a, b, yrs) => (yrs > 0 && a > 0 ? Math.round((Math.pow(b / a, 1 / yrs) - 1) * 1000) / 10 : null);
  const pw = box.w * 0.98 / n, cx = (i) => box.x + box.w * 0.01 + i * pw + pw / 2;
  const seg = [[0, Math.min(ff, n) - 1, C.navy, "Actual"], [Math.max(ff - 1, 0), n - 1, C.cyan, "Forecast"]].filter((s) => s[1] > s[0]);
  seg.forEach(([i0, i1, col, lab]) => {
    const g = cagr(spec.values[i0], spec.values[i1], i1 - i0); if (g == null) return;
    const x0 = cx(i0), x1 = cx(i1), y = box.y + 0.42;
    slide.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: col, width: 1.5, endArrowType: "triangle" } });
    slide.addShape("roundRect", { x: (x0 + x1) / 2 - 0.85, y: box.y, w: 1.7, h: 0.34, rectRadius: 0.17, fill: { color: C.white }, line: { color: col, width: 1.25 } });
    txt(slide, `CAGR ${spec.labels[i0]}–${spec.labels[i1]}: ${g}%`, (x0 + x1) / 2 - 0.85, box.y, 1.7, 0.34, { fontSize: 10, bold: true, color: col === C.cyan ? C.navy : col, align: "center", valign: "middle", margin: 0 });
  });
}

// donut KPIs with icon/label — survey results or drivers (72%, 53%…)
function donutKpis(pres, slide, spec, box = BODY) {
  // spec.items:[{value (0-100), label, note?}], spec.highlight
  const n = spec.items.length, cols = Math.min(n, 4), rows = Math.ceil(n / cols), w = box.w / cols, d = Math.min(w * 0.6, box.h / rows - 1.1, 2.6);
  const h = d + 1.1, oy = (box.h - rows * h) / 2; box = { ...box, y: box.y + Math.max(0, oy) };
  spec.items.forEach((it, i) => {
    const c = i % cols, r = Math.floor(i / cols), x = box.x + c * w, y = box.y + r * h, hi = spec.highlight === i || spec.highlight == null;
    slide.addChart(pres.ChartType.doughnut, [{ name: it.label, labels: ["v", "rest"], values: [it.value, 100 - it.value] }], {
      x: x + (w - d) / 2, y, w: d, h: d, chartColors: [hi ? C.navy : C.g4, C.g1], holeSize: 70, showLegend: false, showValue: false, showPercent: false, dataBorder: { pt: 0, color: "FFFFFF" } });
    txt(slide, it.value + "%", x + (w - d) / 2, y, d, d, { fontSize: Math.max(14, Math.min(28, d * 11)), bold: true, color: hi ? C.navy : C.g5, align: "center", valign: "middle", margin: 0 });
    txt(slide, it.label, x + 0.1, y + d + 0.05, w - 0.2, 0.36, { max: 13, min: 10, bold: true, align: "center" });
    if (it.note) txt(slide, it.note, x + 0.1, y + d + 0.4, w - 0.2, h - d - 0.45, { max: 11, min: 9, color: C.g5, align: "center" });
  });
}

// positioning map: two axes, optional shaded target zone, bubbles sized by value, client highlighted
function positioningMap(slide, spec, box = BODY) {
  // spec.x:{label, low, high}, spec.y:{label, low, high}, spec.points:[{label, x(0-1), y(0-1), size?}], spec.highlight (label), spec.zone:{x0,x1,y0,y1,label}
  const ax = box.x + 0.6, ay = box.y + 0.1, aw = box.w - 0.9, ah = box.h - 0.7;
  if (spec.zone) { const z = spec.zone;
    slide.addShape("rect", { x: ax + z.x0 * aw, y: ay + (1 - z.y1) * ah, w: (z.x1 - z.x0) * aw, h: (z.y1 - z.y0) * ah, fill: { color: C.hiBand }, line: { color: C.cyan, width: 1, dashType: "dash" } });
    if (z.label) txt(slide, z.label, ax + z.x0 * aw + 0.08, ay + (1 - z.y1) * ah + 0.05, (z.x1 - z.x0) * aw - 0.16, 0.3, { fontSize: 10, bold: true, color: C.navy }); }
  slide.addShape("line", { x: ax, y: ay + ah, w: aw, h: 0, line: { color: C.g5, width: 1.25, endArrowType: "triangle" } });
  slide.addShape("line", { x: ax, y: ay, w: 0, h: ah, line: { color: C.g5, width: 1.25, beginArrowType: "triangle" } });
  txt(slide, spec.x.label, ax, ay + ah + 0.3, aw, 0.3, { fontSize: 11, bold: true, color: C.g5, align: "center" });
  txt(slide, spec.x.low || "Low", ax, ay + ah + 0.03, 1.2, 0.26, { fontSize: 10, color: C.g5 });
  txt(slide, spec.x.high || "High", ax + aw - 1.2, ay + ah + 0.03, 1.2, 0.26, { fontSize: 10, color: C.g5, align: "right" });
  txt(slide, spec.y.label, box.x + 0.2 - ah / 2, ay + ah / 2 - 0.17, ah, 0.34, { fontSize: 11, bold: true, color: C.g5, align: "center", valign: "middle", rotate: 270 });
  txt(slide, spec.y.high || "High", box.x + 0.35, ay, 0.6, 0.26, { fontSize: 10, color: C.g5 });
  const maxS = Math.max(...spec.points.map((p) => p.size || 1));
  spec.points.forEach((p) => {
    const d = 0.25 + 0.75 * Math.sqrt((p.size || 1) / maxS), hi = p.label === spec.highlight;
    const cx = ax + p.x * aw, cy = ay + (1 - p.y) * ah;
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hi ? C.navy : C.g3, transparency: hi ? 0 : 15 }, line: { color: C.white, width: 0.75 } });
    txt(slide, p.label, cx + d / 2 + 0.03, cy - 0.15, 1.8, 0.3, { fontSize: 10, bold: hi, color: hi ? C.navy : C.text });
  });
}

// ---------- personas, journey ----------
function personaCards(slide, spec, box = BODY) {
  // spec.personas:[{name, image? (path), caption?, rows:{Age:'25-35', Income:'…', Needs:['…'], Drivers:['…']}, option?}], spec.rowLabels:[...], spec.highlight
  const n = spec.personas.length, lw = 1.3, gap = 0.15, cw = (box.w - lw - (n - 1) * gap) / n;
  const labels = spec.rowLabels || Object.keys(spec.personas[0].rows || {});
  const ph = Math.min(1.35, box.h * 0.28), nh = 0.5, rh = (box.h - ph - nh - 0.1) / Math.max(1, labels.length);
  spec.personas.forEach((p, i) => {
    const x = box.x + lw + i * (cw + gap), hi = spec.highlight === i;
    const d = Math.min(ph, cw * 0.7);
    if (p.image) slide.addImage({ path: p.image, x: x + (cw - d) / 2, y: box.y, w: d, h: d, rounding: true });
    else { slide.addShape("ellipse", { x: x + (cw - d) / 2, y: box.y, w: d, h: d, fill: { color: hi ? C.navy : C.g3 }, line: { type: "none" } });
      txt(slide, p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase(), x + (cw - d) / 2, box.y, d, d, { fontSize: 22, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 }); }
    slide.addShape("rect", { x, y: box.y + ph + 0.05, w: cw, h: nh, fill: { color: hi ? C.navy : C.g2 }, line: { type: "none" } });
    txt(slide, p.name, x, box.y + ph + 0.05, cw, nh, { max: 14, min: 10, bold: true, color: hi ? C.white : C.navy, align: "center", valign: "middle" });
    labels.forEach((L, k) => {
      const y = box.y + ph + nh + 0.1 + k * rh, v = p.rows?.[L];
      if (k % 2 === 0) slide.addShape("rect", { x, y, w: cw, h: rh, fill: { color: hi ? C.hiBand : C.g1 }, line: { type: "none" } });
      const t = Array.isArray(v) ? v.map((s) => "• " + s).join("\n") : (v || "");
      txt(slide, t, x + 0.08, y + 0.03, cw - 0.16, rh - 0.06, { max: 12, min: 9, align: Array.isArray(v) ? "left" : "center", valign: "middle" });
    });
  });
  labels.forEach((L, k) => txt(slide, L, box.x, box.y + ph + nh + 0.1 + k * rh, lw - 0.1, rh, { max: 12, min: 9, bold: true, color: C.navy, valign: "middle" }));
}

function customerJourney(slide, spec, box = BODY) {
  // spec.stages:[..], spec.lanes:[{label, cells:[text|null per stage], key?:[stage idx]}], spec.highlightStage
  const ns = spec.stages.length, lw = 1.6, sw = (box.w - lw) / ns, hh = 0.55, pt = 0.22;
  spec.stages.forEach((s, j) => {
    const x = box.x + lw + j * sw, hi = spec.highlightStage === j;
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: box.y, w: sw + (j < ns - 1 ? pt * 0.6 : 0), h: hh, fill: { color: hi ? C.navy : C.g3 }, line: { color: C.white, width: 1.5 } });
    txt(slide, s, x + (j ? pt : 0.06), box.y, sw - pt - 0.06, hh, { max: 12, min: 9, bold: true, color: hi ? C.white : C.text, align: "center", valign: "middle", margin: 0 });
  });
  const nl = spec.lanes.length, lh = (box.h - hh - 0.15) / nl;
  spec.lanes.forEach((l, i) => {
    const y = box.y + hh + 0.15 + i * lh, cy = y + 0.18;
    if (i % 2 === 0) slide.addShape("rect", { x: box.x, y, w: box.w, h: lh, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, l.label, box.x + 0.06, y, lw - 0.12, lh, { max: 13, min: 9, bold: true, color: C.navy, valign: "middle" });
    slide.addShape("line", { x: box.x + lw + 0.1, y: cy, w: box.w - lw - 0.2, h: 0, line: { color: C.g4, width: 1.25, endArrowType: "triangle" } });
    spec.stages.forEach((_, j) => {
      const t = l.cells?.[j], key = (l.key || []).includes(j) || spec.highlightStage === j && t;
      const cx = box.x + lw + j * sw + sw / 2;
      slide.addShape("ellipse", { x: cx - 0.08, y: cy - 0.08, w: 0.16, h: 0.16, fill: { color: t ? (key ? C.accent : C.navy) : C.g3 }, line: { color: C.white, width: 1 } });
      if (t) txt(slide, t, cx - sw / 2 + 0.06, cy + 0.12, sw - 0.12, lh - 0.36, { max: 11, min: 8, align: "center", bold: key });
    });
  });
}

// ---------- evidence panels: the case-deck content layout ----------
function evidencePanels(pres, slide, spec, box = BODY) {
  // spec.panels:[{headline, chart?:{...chartIn spec}, bullets?:[..], note?}] (1-3), spec.insights:[..], spec.soWhat
  const side = spec.insights || spec.soWhat ? Math.min(3.6, box.w * 0.3) : 0;
  const n = spec.panels.length, gx = 0.3, mainW = box.w - (side ? side + gx : 0);
  const cols = n === 3 ? 2 : n, rows = n === 3 ? 2 : 1;
  const pw = (mainW - (cols - 1) * gx) / cols, phh = (box.h - (rows - 1) * 0.25) / rows;
  spec.panels.forEach((p, i) => {
    let c = i % cols, r = Math.floor(i / cols); if (n === 3 && i === 2) { c = 0; r = 1; }
    const w = n === 3 && i === 2 ? mainW : pw;
    const x = box.x + c * (pw + gx), y = box.y + r * (phh + 0.25);
    subhead(slide, i + 1, p.headline, x, y, w);
    const inner = { x, y: y + 0.62, w, h: phh - 0.62 - (p.note ? 0.25 : 0) };
    if (p.chart) chartIn(pres, slide, p.chart, inner);
    else if (p.bullets) txt(slide, p.bullets.map((b) => "• " + b).join("\n"), inner.x, inner.y, inner.w, inner.h, { max: 13, min: 10 });
    if (p.note) txt(slide, p.note, x, y + phh - 0.25, w, 0.25, { fontSize: 9, color: C.g5 });
  });
  if (side) {
    const sx = box.x + mainW + gx, sh = spec.soWhat ? Math.min(1.5, box.h * 0.3) : 0;
    if (spec.insights) insightBox(slide, { bullets: spec.insights }, { x: sx, y: box.y, w: side, h: box.h - sh - (sh ? 0.2 : 0) });
    if (spec.soWhat) soWhat(slide, spec.soWhat, { x: sx, y: box.y + box.h - sh, w: side, h: sh });
  }
}

// chart → chevron → takeaway box (Jaguar): evidence and its conclusion side by side
function chartTakeaway(pres, slide, spec, box = BODY) {
  // spec.headline?, spec.chart (chartIn spec), spec.takeaway:[bullets] or string
  let y = box.y; if (spec.headline) { subhead(slide, spec.n || 1, spec.headline, box.x, y, box.w); y += 0.62; }
  const h = box.y + box.h - y, cw = box.w * 0.58, tw = box.w - cw - 0.55;
  chartIn(pres, slide, spec.chart, { x: box.x, y, w: cw, h });
  slide.addShape("chevron", { x: box.x + cw + 0.1, y: y + h / 2 - 0.45, w: 0.32, h: 0.9, fill: { color: C.g3 }, line: { type: "none" } });
  const t = Array.isArray(spec.takeaway) ? spec.takeaway.map((b) => "• " + b).join("\n") : spec.takeaway;
  const n_ = Array.isArray(spec.takeaway) ? spec.takeaway.length : 2, th = Math.min(h - 0.2, 0.6 + n_ * 0.55);
  slide.addShape("rect", { x: box.x + cw + 0.55, y: y + (h - th) / 2, w: tw, h: th, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addShape("rect", { x: box.x + cw + 0.55, y: y + (h - th) / 2, w: 0.07, h: th, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, t, box.x + cw + 0.75, y + (h - th) / 2 + 0.1, tw - 0.3, th - 0.2, { max: 15, min: 10, valign: "middle" });
}

// ---------- strategy overview: issue (question) → goal → strategy ----------
function issueGoalStrategy(slide, spec, box = BODY) {
  // spec.columns:[{issue, goal, strategy}], spec.rowLabels?:[3], spec.highlight
  const n = spec.columns.length, lw = 1.5, gap = 0.25, cw = (box.w - lw - (n - 1) * gap) / n;
  const rl = spec.rowLabels || ["Key issues", "Key goals", "Key strategies"], rh = (box.h - 0.6) / 3;
  rl.forEach((L, k) => txt(slide, L, box.x, box.y + k * (rh + 0.3), lw - 0.1, rh, { max: 14, min: 10, bold: true, color: C.g5, valign: "middle" }));
  spec.columns.forEach((c, i) => {
    const x = box.x + lw + i * (cw + gap), hi = spec.highlight === i;
    [c.issue, c.goal, c.strategy].forEach((t, k) => {
      const y = box.y + k * (rh + 0.3), fill = k === 0 ? (hi ? C.accent : C.navy) : k === 1 ? C.g1 : (hi ? C.hiBand : C.white);
      slide.addShape("roundRect", { x, y, w: cw, h: rh, rectRadius: 0.1, fill: { color: fill }, line: { color: k === 2 ? C.navy : fill, width: k === 2 ? 1.25 : 0 } });
      txt(slide, t, x + 0.12, y + 0.06, cw - 0.24, rh - 0.12, { max: 14, min: 9, bold: k === 0, color: k === 0 ? C.white : C.text, valign: "middle", align: k === 0 ? "center" : "left" });
      if (k < 2) slide.addShape("downArrow", { x: x + cw / 2 - 0.22, y: y + rh + 0.03, w: 0.44, h: 0.24, fill: { color: C.g3 }, line: { type: "none" } });
    });
  });
}

// ---------- executive summary forms ----------
function letteredSummary(slide, spec, box = BODY) {
  // spec.items:[{letter?, conclusion, points:[..]}], spec.highlight — A/B/C conclusions reused later in section titles
  const n = spec.items.length, gap = 0.18, h = (box.h - (n - 1) * gap) / n;
  spec.items.forEach((it, i) => {
    const y = box.y + i * (h + gap), L = it.letter || String.fromCharCode(65 + i);
    chip(slide, L, box.x, y + 0.02, 0.42, spec.highlight === i ? C.accent : C.navy);
    txt(slide, it.conclusion, box.x + 0.6, y, box.w - 0.6, 0.5, { max: 16, min: 11, bold: true, color: C.navy, valign: "middle" });
    txt(slide, (it.points || []).map((p) => "› " + p).join("\n"), box.x + 0.6, y + 0.52, box.w - 0.6, h - 0.55, { max: 15, min: 10, color: C.text });
  });
}
function decisionFramework(slide, spec, box = BODY) {
  // spec.stages:[{name, dims:[..], solution}], spec.goal, spec.rowLabels?:[3]
  const n = spec.stages.length, lw = 1.5, sw = (box.w - lw) / n, hh = 0.6;
  const rl = spec.rowLabels || ["Decision stage", "What we analysed", "Answer"];
  const nd = Math.max(...spec.stages.map((s) => (s.dims || []).length), 1), bh = box.h - hh - 0.55 - 0.2, ah = Math.min(bh * 0.5, 0.35 + nd * 0.34), sh = Math.min(bh - ah - 0.25, 1.1);
  txt(slide, rl[0], box.x, box.y, lw - 0.1, hh, { max: 12, bold: true, color: C.navy, valign: "middle" });
  txt(slide, rl[1], box.x, box.y + hh + 0.1, lw - 0.1, ah, { max: 12, bold: true, color: C.navy, valign: "top" });
  txt(slide, rl[2], box.x, box.y + hh + 0.1 + ah + 0.25, lw - 0.1, sh, { max: 12, bold: true, color: C.navy, valign: "middle" });
  spec.stages.forEach((s, j) => {
    const x = box.x + lw + j * sw;
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: box.y, w: sw + (j < n - 1 ? 0.15 : 0), h: hh, fill: { color: C.white }, line: { color: C.navy, width: 1.25 } });
    chip(slide, j + 1, x + (j ? 0.28 : 0.1), box.y + hh / 2 - 0.14, 0.28);
    txt(slide, s.name, x + (j ? 0.62 : 0.44), box.y, sw - 0.85, hh, { max: 13, min: 9, bold: true, color: C.navy, valign: "middle" });
    txt(slide, (s.dims || []).map((d) => "• " + d).join("\n"), x + 0.1, box.y + hh + 0.15, sw - 0.25, ah - 0.1, { max: 15, min: 10 });
    slide.addShape("line", { x: x + 0.1, y: box.y + hh + 0.1 + ah + 0.05, w: sw - 0.25, h: 0, line: { color: C.navy, width: 1 } });
    slide.addShape("downArrow", { x: x + sw / 2 - 0.12, y: box.y + hh + 0.1 + ah + 0.02, w: 0.24, h: 0.2, fill: { color: C.navy }, line: { type: "none" } });
    txt(slide, s.solution, x + 0.1, box.y + hh + 0.1 + ah + 0.25, sw - 0.25, sh, { max: 16, min: 10, bold: true, color: C.text, valign: "middle" });
  });
  slide.addShape("rect", { x: box.x, y: box.y + box.h - 0.5, w: box.w, h: 0.5, fill: { color: C.g1 }, line: { type: "none" } });
  slide.addShape("downArrow", { x: box.x + box.w / 2 - 0.15, y: box.y + box.h - 0.68, w: 0.3, h: 0.2, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, spec.goal, box.x, box.y + box.h - 0.5, box.w, 0.5, { max: 15, bold: true, color: C.navy, align: "center", valign: "middle" });
}
function storyDiagram(slide, spec, box = BODY) {
  // spec.findings:[{fact, implication}], spec.target, spec.strategies:[..], spec.next:[..]
  const n = spec.findings.length, gap = 0.3, fw = (box.w - (n - 1) * gap) / n, fh = Math.min(2.1, box.h * 0.4);
  slide.addShape("rightArrow", { x: box.x - 0.1, y: box.y + fh / 2 - 0.2, w: box.w + 0.2, h: 0.4, fill: { color: C.g2 }, line: { type: "none" } });
  spec.findings.forEach((f, i) => {
    const x = box.x + i * (fw + gap);
    slide.addShape("roundRect", { x, y: box.y, w: fw, h: fh, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.navy, width: 1.25 } });
    txt(slide, f.fact, x + 0.1, box.y + 0.06, fw - 0.2, fh / 2 - 0.12, { max: 13, min: 9, align: "center", valign: "middle" });
    slide.addShape("line", { x: x + 0.2, y: box.y + fh / 2, w: fw - 0.4, h: 0, line: { color: C.g3, width: 0.75 } });
    txt(slide, f.implication, x + 0.1, box.y + fh / 2 + 0.06, fw - 0.2, fh / 2 - 0.12, { max: 13, min: 9, bold: true, color: C.navy, align: "center", valign: "middle" });
  });
  let y = box.y + fh + 0.2;
  slide.addShape("rect", { x: box.x, y, w: box.w, h: 0.55, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, spec.target, box.x + 0.2, y, box.w - 0.4, 0.55, { max: 15, bold: true, color: C.white, align: "center", valign: "middle" });
  y += 0.75; const m = spec.strategies.length, sw = (box.w - (m - 1) * gap) / m, sh = Math.min(0.9, box.h - (y - box.y) - (spec.next ? 0.8 : 0));
  spec.strategies.forEach((s, i) => {
    const x = box.x + i * (sw + gap);
    slide.addShape("roundRect", { x, y, w: sw, h: sh, rectRadius: 0.1, fill: { color: C.hiBand }, line: { color: C.cyan, width: 1, dashType: "dash" } });
    txt(slide, s, x + 0.1, y, sw - 0.2, sh, { max: 14, min: 9, bold: true, color: C.navy, align: "center", valign: "middle" });
  });
  if (spec.next) { y += sh + 0.2; const k = spec.next.length, nw = box.w / k;
    spec.next.forEach((t, i) => { slide.addShape(i === 0 ? "homePlate" : "chevron", { x: box.x + i * nw, y, w: nw + (i < k - 1 ? 0.15 : 0), h: 0.5, fill: { color: C.g3 }, line: { color: C.white, width: 1.5 } });
      txt(slide, t, box.x + i * nw + 0.3, y, nw - 0.45, 0.5, { max: 12, min: 9, color: C.text, align: "center", valign: "middle" }); }); }
}
function pyramidSummary(slide, spec, box = BODY) {
  // spec.main, spec.keys:[{text, supports:[..]}], spec.plan?  — governing thought → key lines → supports
  const mh = 0.75; let y = box.y;
  slide.addShape("rect", { x: box.x + box.w * 0.1, y, w: box.w * 0.8, h: mh, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, spec.main, box.x + box.w * 0.1 + 0.2, y, box.w * 0.8 - 0.4, mh, { max: 18, min: 12, bold: true, color: C.white, align: "center", valign: "middle" });
  y += mh + 0.3; const nk = spec.keys.length, kw = box.w / nk, kh = 0.85;
  const allS = spec.keys.reduce((a, k) => a + Math.max(1, (k.supports || []).length), 0), sw = box.w / allS;
  let si = 0;
  spec.keys.forEach((k, i) => {
    const x = box.x + i * kw + 0.1;
    slide.addShape("line", { x: box.x + box.w / 2, y: y - 0.3, w: x + kw / 2 - 0.1 - (box.x + box.w / 2), h: 0.3, line: { color: C.g4, width: 1 } });
    slide.addShape("rect", { x, y, w: kw - 0.2, h: kh, fill: { color: C.g1 }, line: { color: C.navy, width: 1 } });
    txt(slide, k.text, x + 0.1, y, kw - 0.4, kh, { max: 14, min: 9, bold: true, color: C.navy, align: "center", valign: "middle" });
    (k.supports || []).forEach((s) => {
      const sx = box.x + si * sw + 0.08, sy = y + kh + 0.35;
      slide.addShape("line", { x: x + (kw - 0.2) / 2, y: y + kh, w: sx + (sw - 0.16) / 2 - (x + (kw - 0.2) / 2), h: 0.35, line: { color: C.g4, width: 1 } });
      slide.addShape("rect", { x: sx, y: sy, w: sw - 0.16, h: Math.min(1.3, box.h - (sy - box.y) - (spec.plan ? 0.8 : 0)), fill: { color: C.white }, line: { color: C.cyan, width: 1, dashType: "dash" } });
      txt(slide, s, sx + 0.06, sy + 0.04, sw - 0.28, Math.min(1.3, box.h - (sy - box.y) - (spec.plan ? 0.8 : 0)) - 0.08, { max: 12, min: 8, align: "center", valign: "middle" });
      si++;
    });
  });
  if (spec.plan) { const py = box.y + box.h - 0.6;
    slide.addShape("rect", { x: box.x, y: py, w: box.w, h: 0.6, fill: { color: C.hiBand }, line: { type: "none" } });
    txt(slide, spec.plan, box.x + 0.2, py, box.w - 0.4, 0.6, { max: 14, min: 10, bold: true, color: C.navy, align: "center", valign: "middle" }); }
}

module.exports = { chip, subhead, insightBox, soWhat, chartIn, stackedCagr, growthPairs, growthBars, donutKpis, positioningMap,
  personaCards, customerJourney, evidencePanels, chartTakeaway, issueGoalStrategy, letteredSummary, decisionFramework, storyDiagram, pyramidSummary };
