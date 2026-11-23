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
function subhead(slide, n, text, x, y, w, rpad = 0) {             // rpad: room kept free at the right end for the panel's icon                            // [n] sub-headline sentence + rule (the panel's point); returns its height
  const ps = G.HOUSE.STYLE && G.HOUSE.STYLE.panel;
  if (ps) {                                                             // the reference deck's own sub-headline: chip shape/colour, headline size/colour, rule
    const s = Math.max(0.24, Math.min(0.4, ps.size || 0.3)), hh = Math.max(0.4, (ps.pt * 1.25) / 72 + 0.08);
    slide.addShape(ps.chip === "ellipse" ? "ellipse" : "rect", { x, y: y + (hh - s) / 2, w: s, h: s, fill: { color: ps.fill || C.navy }, line: { type: "none" } });
    txt(slide, String(n), x, y + (hh - s) / 2, s, s, { fontSize: Math.min(ps.chip_pt || 12, s * 72 * 0.6), noScale: true, bold: true, color: ps.text || C.white, align: "center", valign: "middle", margin: 0 });
    txt(slide, text, x + s + 0.1, y, w - s - 0.1 - rpad, hh, { max: ps.pt, min: Math.max(9, ps.pt - 3), noScale: true, bold: ps.bold !== false, color: ps.colour || C.text, valign: "middle", margin: 0 });
    const ry = y + Math.max(hh + 0.02, ps.rule ? ps.rule[2] : 0);
    if (ps.rule) slide.addShape("line", { x, y: ry, w, h: 0, line: { color: ps.rule[0], width: ps.rule[1] } });
    return ry - y + 0.12;
  }
  chip(slide, n, x, y + 0.02, 0.28);
  txt(slide, text, x + 0.36, y, w - 0.36 - rpad, 0.5, { max: 13, min: 10, bold: true, color: C.text, valign: "middle" });
  slide.addShape("line", { x, y: y + 0.52, w, h: 0, line: { color: C.navy, width: 1 } });
  return 0.62;
}
function insightBox(slide, spec, box) {                                // "Insights" label + bullets; **key words** in bold
  txt(slide, spec.label || "Insights", box.x, box.y, box.w, 0.34, { fontSize: 12, bold: true, color: C.navy });
  slide.addShape("line", { x: box.x, y: box.y + 0.36, w: box.w, h: 0, line: { color: C.navy, width: 1 } });
  const items = spec.bullets || [], n = Math.max(1, items.length);
  const plainAll = items.map((b) => String(b).replace(/\*\*/g, "")).join(" ");
  let size = fitSize(plainAll, box.w - 0.4, (box.h - 0.5) * 0.85, 13, 10);
  const need = (sz) => items.reduce((a, b) => a + Math.max(1, Math.ceil(String(b).replace(/\*\*/g, "").length * sz * 0.52 / ((box.w - 0.3) * 72))) * sz * 1.25 / 72, 0);
  while (size > 10 && need(size) + 0.06 * n > box.h - 0.5) size -= 0.5;
  // one text box per bullet, so bold runs stay inside their paragraph; the marker is a small square shape
  const lines = items.map((b) => Math.max(1, Math.ceil(String(b).replace(/\*\*/g, "").length * size * 0.52 / ((box.w - 0.3) * 72))));
  const tot = lines.reduce((a, c) => a + c, 0), avail = box.h - 0.5 - 0.06 * n;
  let y = box.y + 0.46;
  items.forEach((b, i) => {
    const h = Math.min(avail * lines[i] / tot, lines[i] * size * 1.3 / 72 + 0.12);
    slide.addShape("rect", { x: box.x + 0.02, y: y + size / 72 * 0.45, w: 0.07, h: 0.07, fill: { color: C.navy }, line: { type: "none" } });
    slide.addText(keyRuns(b), { x: box.x + 0.18, y, w: box.w - 0.18, h, fontFace: G.THEME.bodyFontFace, fontSize: size, color: C.text, valign: "top", margin: 0, isTextBox: true });
    y += h + 0.06;
  });
}
// **key words** are bold and in the main colour, as the references mark them (2026-11-24 audit: bold alone was not their habit)
const keyRuns = (b) => String(b).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith("**") ? { text: p.slice(2, -2), options: { bold: true, color: C.navy } } : { text: p, options: {} }));
// the reading of an exhibit: a grey filled box with 2-4 bullets, under or beside the figure (reference form: Mindcraft
// financial slides, Baincraft 5, E-Cluster 1). Returns nothing; box is the grey box itself.
function readingBox(slide, bullets, box, o = {}) {
  slide.addShape("rect", { ...box, fill: { color: C.g1 }, line: { type: "none" } });
  const items = [].concat(bullets), inner = { x: box.x + 0.12, y: box.y + 0.07, w: box.w - 0.24, h: box.h - 0.14 };
  const plain = items.map((t) => String(t).replace(/\*\*/g, "")).join(" "), size = o.size || fitSize(plain, inner.w - 0.25, inner.h * 0.8, o.bold ? 12 : 11, 10);   // 11 pt on every panel, so the readings look alike across a slide
  const lines = items.map((t) => Math.max(1, Math.ceil(String(t).replace(/\*\*/g, "").length * size * 0.52 / ((inner.w - 0.2) * 72)))), tot = lines.reduce((a, c) => a + c, 0);
  let y = inner.y; const lh = Math.min(size * 1.28 / 72, inner.h / tot);
  items.forEach((t, i) => { const h = lines[i] * lh;
    if (items.length > 1 || o.bullet) slide.addShape("rect", { x: inner.x, y: y + size / 72 * 0.42, w: 0.06, h: 0.06, fill: { color: C.navy }, line: { type: "none" } });
    slide.addText(o.bold ? [{ text: String(t).replace(/\*\*/g, ""), options: { bold: true, color: C.navy } }] : keyRuns(t), { x: inner.x + (items.length > 1 || o.bullet ? 0.15 : 0), y, w: inner.w - (items.length > 1 || o.bullet ? 0.15 : 0), h, fontFace: G.THEME.bodyFontFace, fontSize: size, color: C.text, valign: items.length > 1 ? "top" : "middle", margin: 0, isTextBox: true });
    y += h + Math.max(0, (inner.h - tot * lh) / Math.max(1, items.length)) * 0.5; });
}
const readingHeight = (bullets, w, size = 11) => { const items = [].concat(bullets); return 0.2 + items.reduce((a, t) => a + Math.max(1, Math.ceil(String(t).replace(/\*\*/g, "").length * size * 0.56 / ((w - 0.44) * 72))), 0) * size * 1.3 / 72; };
// icon columns in a grey box: icon + bold label + one or two lines (reference form: E-Cluster 1 panel 3, TNT 13)
function iconPoints(slide, items, box) {
  slide.addShape("rect", { ...box, fill: { color: C.g1 }, line: { type: "none" } });
  const n = items.length, w = box.w / n;
  items.forEach((it, i) => { const x = box.x + i * w + 0.15, s = Math.min(0.36, box.h * 0.3);
    if (i) slide.addShape("line", { x: box.x + i * w, y: box.y + 0.12, w: 0, h: box.h - 0.24, line: { color: C.g3, width: 0.75 } });
    const has = it.icon && G.icon(slide, it.icon, x, box.y + 0.12, s, { color: C.navy });
    txt(slide, it.label, x + (has ? s + 0.1 : 0), box.y + 0.1, w - 0.3 - (has ? s + 0.1 : 0), s + 0.04, { max: 12, min: 10, bold: true, color: C.navy, valign: "middle", margin: 0 });
    slide.addText(keyRuns(it.text), { x, y: box.y + 0.2 + s, w: w - 0.3, h: box.h - s - 0.3, fontFace: G.THEME.bodyFontFace, fontSize: fitSize(String(it.text), w - 0.35, (box.h - s - 0.3) * 0.9, 12, 10), color: C.text, valign: "top", margin: 0, isTextBox: true });
  });
}
function soWhat(slide, text, box) {                                     // fixed-place recommendation box (bottom right)
  // a full-colour bar with the recommendation in white (reference form: the goal bar, Polaris 2, DoubleClick 3). The box with
  // an accent bar on its left edge that stood here until v2.15 is in no reference.
  slide.addShape("rect", { ...box, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, text, box.x + 0.15, box.y + 0.04, box.w - 0.3, box.h - 0.08, { max: 14, min: 10, bold: true, color: C.white, onDark: true, valign: "middle" });
}

// ---------- charts (native, editable data) ----------
function chartIn(pres, slide, c, box) {
  // c: {type:'column'|'bar'|'stacked'|'stacked100'|'line'|'pie'|'donut', labels, series:[{name,values}], highlight (series or point index), format}
  const t = c.type || "column", n = c.series.length, single = n === 1;
  const greys = [C.g4, C.g5, C.g3, C.g4, C.g5];
  let colors = c.colors || c.series.map((_, i) => (c.highlight === i ? C.chartHi : greys[i % greys.length]));
  if (single && ["column", "bar"].includes(t) && c.highlight != null) {   // one series: highlight one point via two stacked series
    const v = c.series[0].values;
    const s2 = [{ name: "Others", labels: c.labels, values: v.map((x, i) => (i === c.highlight ? 0 : x)) }, { name: c.series[0].name, labels: c.labels, values: v.map((x, i) => (i === c.highlight ? x : 0)) }];
    slide.addChart(pres.ChartType.bar, s2, { ...box, barDir: t === "bar" ? "bar" : "col", barGrouping: "stacked", chartColors: [C.g3, C.chartHi], showLegend: false, showValue: true,
      dataLabelPosition: "inEnd", dataLabelFontSize: 10, dataLabelColor: C.white, dataLabelFormatCode: (c.format || "#,##0") + ";;;", catAxisLabelFontSize: 10, catAxisLabelColor: C.text,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 50,
      ...(({ dataLabelFontSize, catAxisLabelFontSize, catAxisLabelFontFace, dataLabelFontFace }) => (dataLabelFontSize ? { dataLabelFontSize, catAxisLabelFontSize, catAxisLabelFontFace, dataLabelFontFace } : {}))(G.chartStyle()) });
    return;
  }
  if (single && ["column", "bar", "line"].includes(t) && !c.colors) colors = [C.chartHi];
  const common = { ...box, chartColors: colors, showLegend: n > 1, legendPos: "b", legendFontSize: 9, legendColor: C.text, catAxisLabelFontSize: 10, catAxisLabelColor: C.text,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, dataLabelFontSize: 9, showValue: c.showValue !== false, dataLabelFormatCode: c.format || "#,##0",
    ...G.chartStyle(), ...(c.legendPos ? { legendPos: c.legendPos } : {}), ...(c.options || {}) };
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
  // in a narrow panel the CAGR columns shrink and the table takes a larger share, so the series names still fit on two lines
  const K = box.w < 5 ? 0.55 : 0.8, nH = (spec.cagr?.headers || []).length;
  const tw = Math.min(box.w * 0.55, Math.max(Math.min(3.4, box.w * 0.4), 1.15 + nH * K)), cw = box.w - tw - 0.15, n = spec.series.length;
  const greys = [C.g4, C.g5, C.g3, C.g4, C.g5];
  const colors = spec.series.map((_, i) => (spec.highlight === i ? C.navy : greys[i % greys.length]));
  if (spec.unit) txt(slide, spec.unit, box.x, box.y, 2.5, 0.3, { fontSize: 10, color: C.g5 });
  const data = spec.series.map((s) => ({ name: s.name, labels: spec.periods, values: s.values }));
  slide.addChart(pres.ChartType.bar, data, { x: box.x, y: box.y + 0.3, w: cw, h: box.h - 0.3, barDir: "col", barGrouping: "stacked", chartColors: colors, showLegend: false,
    showValue: true, dataLabelPosition: "ctr", dataLabelFontSize: 9, dataLabelColor: C.white, dataLabelFormatCode: "#,##0;;;", catAxisLabelFontSize: 11, catAxisLabelColor: C.text,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 60,
    ...(({ dataLabelFontSize, catAxisLabelFontSize, catAxisLabelFontFace, dataLabelFontFace }) => (dataLabelFontSize ? { dataLabelFontSize, catAxisLabelFontSize, catAxisLabelFontFace, dataLabelFontFace } : {}))(G.chartStyle()) });
  // legend + CAGR table, rows in the same top→bottom order as the stack
  const hdr = spec.cagr?.headers || [], x0 = box.x + cw + 0.15, rowH = Math.min(0.42, (box.h - 0.7) / n);
  const nameW = tw - hdr.length * K;
  txt(slide, "CAGR", x0 + nameW, box.y + 0.05, hdr.length * K, 0.28, { fontSize: 11, bold: true, color: C.navy, align: "center" });
  hdr.forEach((h, j) => txt(slide, h, x0 + nameW + j * K, box.y + 0.32, K, 0.28, { fontSize: 9, color: C.g5, align: "center" }));
  [...spec.series].map((s, i) => [s, i]).reverse().forEach(([s, i], k) => {
    const y = box.y + 0.7 + k * rowH, hi = spec.highlight === i;
    slide.addShape("rect", { x: x0, y: y + rowH / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: colors[i] }, line: { type: "none" } });
    txt(slide, s.name, x0 + 0.22, y, nameW - 0.25, rowH, { max: 11, min: 8, bold: hi, color: C.text, valign: "middle" });
    (spec.cagr?.rows?.[i] || []).forEach((v, j) => txt(slide, v, x0 + nameW + j * K, y, K, rowH, { fontSize: 11, bold: hi, color: hi ? C.navy : C.text, align: "center", valign: "middle" }));
    if (hi) slide.addShape("ellipse", { x: x0 + nameW + 0.02, y: y + 0.02, w: hdr.length * K - 0.04, h: rowH - 0.04, fill: { type: "none" }, line: { color: C.accent, width: 1.75 } });
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
    // years between the two labels when they are years ("2020" … "2030F"): a label step is not always one year (fixed 2026-11-24:
    // two-year steps were read as one year, which doubled the growth rate shown)
    const yr = (l) => { const m = String(l).match(/(19|20)\d\d/); return m ? +m[0] : null; }, y0 = yr(spec.labels[i0]), y1 = yr(spec.labels[i1]);
    const g = cagr(spec.values[i0], spec.values[i1], y0 != null && y1 != null && y1 > y0 ? y1 - y0 : i1 - i0); if (g == null) return;
    const x0 = cx(i0), x1 = cx(i1), y = box.y + 0.42;
    slide.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: col, width: 1.5, endArrowType: "triangle" } });
    const pwid = Math.min(1.9, Math.max(1.0, box.w / seg.length - 0.3)), long = pwid >= 1.9;   // narrow panel: the arrow shows the period, the pill only the rate
    slide.addShape("roundRect", { x: (x0 + x1) / 2 - pwid / 2, y: box.y, w: pwid, h: 0.34, rectRadius: 0.17, fill: { color: C.white }, line: { color: col, width: 1.25 } });
    txt(slide, long ? `CAGR ${spec.labels[i0]}–${spec.labels[i1]}: ${g}%` : `${g}% a year`, (x0 + x1) / 2 - pwid / 2, box.y, pwid, 0.34, { fontSize: 10, bold: true, color: col === C.cyan ? C.navy : col, align: "center", valign: "middle", margin: 0 });
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
  txt(slide, t, box.x + cw + 0.7, y + (h - th) / 2 + 0.1, tw - 0.3, th - 0.2, { max: 15, min: 10, valign: "middle" });   // a plain grey box: the bar on its left edge (until v2.15) is in no reference
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
  // spec.projection:{title, items:[{label, value}], risks:{title, items:[..]}} — a narrow column on the right, as in the
  // reference summary that carries numbers (Case-2020-Baincraft slide 2, "Projection" + "Risks"): a header bar, then each
  // figure as a small label with the big number under it in the main colour, then the risks as bullets, all in one thin
  // dotted frame. No tiles, no side bars: those are not in any reference. (spec.kpis is the old name and still works.)
  const PJ = spec.projection || spec.kpis;
  if (PJ && PJ.items && PJ.items.length) {
    const kw = Math.min(3.1, box.w * 0.25), kx = box.x + box.w - kw, hb = 0.36, R = PJ.risks && PJ.risks.items && PJ.risks.items.length ? PJ.risks : null;
    const rh = R ? hb + 0.12 + R.items.length * 0.27 + 0.1 : 0, fh = box.h - hb - rh, k = PJ.items.length, ih = fh / k;
    slide.addShape("rect", { x: kx, y: box.y, w: kw, h: box.h, fill: { type: "none" }, line: { color: C.navy, width: 0.75, dashType: "sysDot" } });
    const bar = (t, y) => { slide.addShape("rect", { x: kx, y, w: kw, h: hb, fill: { color: C.navy }, line: { type: "none" } }); txt(slide, t, kx, y, kw, hb, { fontSize: 12, bold: true, color: C.white, onDark: true, align: "center", valign: "middle", margin: 0 }); };
    bar(PJ.title || "Projection", box.y);
    PJ.items.forEach((it, i) => {
      const y = box.y + hb + i * ih, lh = Math.min(0.3, ih * 0.4);
      txt(slide, it.label, kx + 0.12, y + Math.max(0.04, ih * 0.1), kw - 0.24, lh, { fontSize: 11, color: C.text, valign: "bottom", margin: 0 });
      txt(slide, it.value, kx + 0.12, y + Math.max(0.04, ih * 0.1) + lh, kw - 0.24, ih - lh - Math.max(0.08, ih * 0.2), { fontSize: fitSize(String(it.value), kw - 0.3, 0.5, 24, 16), bold: true, color: C.navy, align: "center", valign: "middle", margin: 0 });
    });
    if (R) { const y = box.y + box.h - rh; bar(R.title || "Risks", y);
      txt(slide, R.items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < R.items.length - 1 } })), kx + 0.12, y + hb + 0.08, kw - 0.24, rh - hb - 0.12, { fontSize: 11, color: C.text, valign: "top", margin: 0 }); }
    box = { ...box, w: box.w - kw - 0.35 };
  }
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

module.exports = { photoCover, photoAgenda,  readingBox, iconPoints, keyRuns,  chip, subhead, insightBox, soWhat, chartIn, stackedCagr, growthPairs, growthBars, donutKpis, positioningMap,
  personaCards, customerJourney, evidencePanels, chartTakeaway, issueGoalStrategy, letteredSummary, decisionFramework, storyDiagram, pyramidSummary };

// =====================================================================
// SLIDE COMPOSER — several figures on one slide, the way the case decks do it.
// Layout codes (measured on 160 content slides, see Style/refs/case-competitions.md §4b):
//   FULL, HALF2, BAND2, GRID4, GRID4I, T2B1, T1B2, L2R1, R2L1, COL3, EXI, EXB, CHAIN, FLOW
// A panel = { headline, chart (chartIn spec) | bullets | text | draw: (slide, box) => {} | object: "<store id>" , note }
//   - every panel gets a number chip + sentence sub-headline (subhead) unless headline is omitted
//   - 'object' panels are left empty and recorded in pres._objectSlots, so fill_objects.py can drop a store object
//     (template drawing, vectorised chart, diagram part) into exactly that box
// spec.insights:[..] and spec.soWhat:"…" go into the insight cell / column / bar the layout defines.
// Reading order is Z (left→right, top→bottom); the last cell is the conclusion.
// =====================================================================
const GAP = 0.3;
function layoutBoxes(code, box, n) {
  const B = box, g = GAP, half = (B.w - g) / 2, hh = (B.h - g) / 2;
  const R = (x, y, w, h) => ({ x, y, w, h });
  switch (code) {
    case "FULL": return { panels: [R(B.x, B.y, B.w, B.h)] };
    case "HALF2": return { panels: [R(B.x, B.y, half, B.h), R(B.x + half + g, B.y, half, B.h)] };
    case "COL3": { const w = (B.w - 2 * g) / 3; return { panels: [0, 1, 2].map((i) => R(B.x + i * (w + g), B.y, w, B.h)) }; }
    case "COL4": case "COLN": { const k = code === "COL4" ? 4 : Math.max(2, n || 4), w = (B.w - (k - 1) * g) / k;   // N parallel initiative columns (2019-20 decks)
      return { panels: Array.from({ length: k }, (_, i) => R(B.x + i * (w + g), B.y, w, B.h)) }; }
    case "T3B1": { const th = B.h * 0.36, w = (B.w - 2 * g) / 3;                        // three situation boxes on top, one wide answer below
      return { panels: [0, 1, 2].map((i) => R(B.x + i * (w + g), B.y, w, th)).concat([R(B.x, B.y + th + g + 0.25, B.w, B.h - th - g - 0.25)]), downArrow: R(B.x + B.w / 2 - 0.35, B.y + th + 0.04, 0.7, g + 0.17) }; }
    case "BAND2": return { panels: [R(B.x, B.y, B.w, hh), R(B.x, B.y + hh + g, B.w, hh)] };
    case "GRID4": return { panels: [R(B.x, B.y, half, hh), R(B.x + half + g, B.y, half, hh), R(B.x, B.y + hh + g, half, hh), R(B.x + half + g, B.y + hh + g, half, hh)] };
    case "GRID4I": return { panels: [R(B.x, B.y, half, hh), R(B.x + half + g, B.y, half, hh), R(B.x, B.y + hh + g, half, hh)], insight: R(B.x + half + g, B.y + hh + g, half, hh) };
    case "T2B1": { const th = B.h * 0.52; return { panels: [R(B.x, B.y, half, th), R(B.x + half + g, B.y, half, th), R(B.x, B.y + th + g, B.w, B.h - th - g)] }; }
    case "T1B2": { const th = B.h * 0.48; return { panels: [R(B.x, B.y, B.w, th), R(B.x, B.y + th + g, half, B.h - th - g)], insight: R(B.x + half + g, B.y + th + g, half, B.h - th - g) }; }
    case "L2R1": return { panels: [R(B.x, B.y, half, hh), R(B.x, B.y + hh + g, half, hh), R(B.x + half + g, B.y, half, B.h)] };
    case "R2L1": return { panels: [R(B.x, B.y, half, B.h), R(B.x + half + g, B.y, half, hh), R(B.x + half + g, B.y + hh + g, half, hh)] };
    case "EXI": { const iw = Math.min(3.8, B.w * 0.3), mw = B.w - iw - g, k = Math.max(1, n || 2), ph = (B.h - (k - 1) * g) / k;
      return { panels: Array.from({ length: k }, (_, i) => R(B.x, B.y + i * (ph + g), mw, ph)), insight: R(B.x + mw + g, B.y, iw, B.h), insightCol: true }; }
    case "EXB": { const ih = Math.min(1.5, B.h * 0.27); return { panels: [R(B.x, B.y, B.w, B.h - ih - g)], insight: R(B.x, B.y + B.h - ih, B.w, ih), insightBar: true }; }
    case "CHAIN": { const th = B.h * 0.55, ew = B.w * 0.62; return { panels: [R(B.x, B.y, ew, th)], decision: R(B.x + ew + 0.6, B.y, B.w - ew - 0.6, th), tactics: R(B.x, B.y + th + g, B.w, B.h - th - g), chevron: R(B.x + ew + 0.1, B.y + th / 2 - 0.45, 0.32, 0.9) }; }
    case "MULTI": { const k = Math.max(2, n || 4), cols = k <= 3 ? k : Math.ceil(k / 2), rows = Math.ceil(k / cols), w = (B.w - (cols - 1) * g) / cols, h = (B.h - (rows - 1) * g) / rows;
      return { panels: Array.from({ length: k }, (_, i) => R(B.x + (i % cols) * (w + g), B.y + Math.floor(i / cols) * (h + g), w, h)) }; }
    case "TXC": { const tw = B.w * 0.4; return { panels: [R(B.x, B.y, tw, B.h), R(B.x + tw + g, B.y, B.w - tw - g, B.h)] }; }
    case "FLOW": { const k = Math.max(2, Math.min(4, n || 2)), a = 0.7, w = (B.w - (k - 1) * a) / k;      // 2-4 blocks joined by chevrons
      const panels = Array.from({ length: k }, (_, i) => R(B.x + i * (w + a), B.y, w, B.h));
      const arrows = panels.slice(0, -1).map((P) => R(P.x + w + 0.17, B.y + B.h / 2 - 0.4, 0.36, 0.8));
      return { panels, arrow: arrows[0], arrows: arrows.slice(1) }; }
    default: throw new Error("unknown layout " + code);
  }
}
function fillPanel(pres, slide, p, box, i, numbered, boxed) {
  let y = box.y;
  if (boxed && p.headline) {   // RB style: the panel's point sits in a coloured header bar on top of a framed box
    slide.addShape("rect", { ...box, fill: { color: C.white }, line: { color: C.g3, width: 1 } });
    slide.addShape("rect", { x: box.x, y: box.y, w: box.w, h: 0.5, fill: { color: C.navy }, line: { type: "none" } });
    txt(slide, p.headline, box.x + 0.12, box.y, box.w - 0.24, 0.5, { max: 13, min: 10, bold: true, color: C.white, valign: "middle", align: "center" });
    box = { x: box.x + 0.12, y: box.y + 0.6, w: box.w - 0.24, h: box.h - 0.7 }; p = { ...p, headline: null }; y = box.y;
  }
  // p.icon: a line icon from Objects/Visual/icons at the right end of the panel's headline (the references mark their panels with one)
  const hasIcon = p.headline && numbered && p.icon && G.icon(slide, p.icon, box.x + box.w - 0.36, y + 0.06, 0.34, { color: C.navy });
  if (p.headline) { if (numbered) y += subhead(slide, p.number || i + 1, p.headline, box.x, y, box.w, hasIcon ? 0.45 : 0); else { txt(slide, p.headline, box.x, y, box.w, 0.5, { max: 13, min: 10, bold: true, valign: "middle" }); y += 0.62; } }
  // p.unit: what the exhibit shows and its unit, in small grey type above it ("Market size, US$ bn"), as every reference chart has
  if (p.unit) { txt(slide, p.unit, box.x, y, box.w, 0.24, { fontSize: 10, color: C.g5, valign: "middle", margin: 0 }); y += 0.26; }
  // p.reading: 2-4 bullets that read the exhibit, in a grey box under it (or beside it: p.readingSide "right"); p.takeaway: one
  // bold line in the same grey box. No outline, no accent bar on the left: those are in no reference.
  const side = p.reading && p.readingSide === "right", rw = side ? box.w * (p.readingShare || 0.4) : box.w;
  const rd = p.reading ? (side ? 0 : Math.min(box.h * 0.42, readingHeight(p.reading, rw))) : 0;
  const tkNeed = p.takeaway ? readingHeight(p.takeaway, box.w, 12) + 0.05 : 0, tk = p.takeaway ? Math.min(box.h * 0.25, Math.max(0.45, tkNeed)) : 0;   // as tall as its text at 12 pt
  const inner = { x: box.x, y, w: box.w - (side ? rw + 0.15 : 0), h: box.y + box.h - y - (p.note ? 0.25 : 0) - (tk ? tk + 0.08 : 0) - (rd ? rd + 0.08 : 0) };
  if (side) readingBox(slide, p.reading, { x: box.x + box.w - rw, y, w: rw, h: inner.h });
  if (rd) readingBox(slide, p.reading, { x: box.x, y: inner.y + inner.h + 0.08, w: box.w, h: rd });
  if (tk) readingBox(slide, p.takeaway, { x: box.x, y: box.y + box.h - (p.note ? 0.25 : 0) - tk, w: box.w, h: tk }, { bold: true, size: tkNeed <= box.h * 0.25 ? 12 : undefined });
  if (p.points) iconPoints(slide, p.points, inner);
  else if (p.chart) chartIn(pres, slide, p.chart, inner);
  else if (p.draw) p.draw(slide, inner);
  else if (p.map) require("./patterns_place.js").mapRegions(pres, slide, p.map, inner);   // a map panel: any mapRegions spec
  else if (p.bullets) { slide.addShape("rect", { ...inner, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, p.bullets.map((b) => "• " + b).join("\n"), inner.x + 0.15, inner.y + 0.12, inner.w - 0.3, inner.h - 0.24, { max: 16, min: 10, paraSpaceAfter: 6 }); }
  else if (p.text) txt(slide, p.text, inner.x, inner.y, inner.w, inner.h, { max: 14, min: 10 });
  else if (p.object) { (pres._objectSlots = pres._objectSlots || []).push({ slide: pres.slides.length, object: p.object, box: [inner.x, inner.y, inner.w, inner.h], texts: p.texts || null, recolour: p.recolour || null }); }
  if (p.note) txt(slide, p.note, box.x, box.y + box.h - 0.25, box.w, 0.25, { fontSize: 9, color: C.g5 });
}
function composeSlide(pres, slide, spec, box = BODY) {
  // spec.layout (code), spec.panels:[...], spec.insights, spec.soWhat, spec.decision, spec.tactics:[{title,text}], spec.numbered (default true)
  // spec.regions: explicit panel boxes, e.g. from a sibling slide of the reference deck (scripts/layout_skeleton.py)
  const L = spec.regions ? { panels: spec.regions.panels || spec.regions, insight: spec.regions.insight } : layoutBoxes(spec.layout, box, spec.panels.length), numbered = spec.numbered !== false;
  spec.panels.slice(0, L.panels.length).forEach((p, i) => fillPanel(pres, slide, p, L.panels[i], i, numbered, spec.boxed));
  if (L.insight && (spec.insights || spec.soWhat)) {
    const I = L.insight;
    if (L.insightBar) {
      slide.addShape("rect", { x: I.x, y: I.y, w: I.w, h: I.h, fill: { color: C.g1 }, line: { type: "none" } });
      insightBox(slide, { bullets: spec.insights || [] }, { x: I.x + 0.15, y: I.y + 0.08, w: I.w * (spec.soWhat ? 0.6 : 1) - 0.3, h: I.h - 0.16 });
      if (spec.soWhat) soWhat(slide, spec.soWhat, { x: I.x + I.w * 0.62, y: I.y + 0.15, w: I.w * 0.38 - 0.15, h: I.h - 0.3 });
    } else {
      const sh = spec.soWhat ? Math.min(1.4, I.h * (L.insightCol ? 0.25 : 0.3)) : 0;
      if (spec.insights) { const ib = { x: I.x, y: I.y, w: I.w, h: I.h - sh - (sh ? 0.1 : 0) };
        slide.addShape("rect", { ...ib, fill: { color: C.g1 }, line: { type: "none" } });   // the conclusion cell is a grey box, as in the references
        insightBox(slide, { bullets: spec.insights, label: spec.insightsLabel }, { x: ib.x + 0.12, y: ib.y + 0.05, w: ib.w - 0.24, h: ib.h - 0.1 }); }
      if (spec.soWhat) soWhat(slide, spec.soWhat, { x: I.x, y: I.y + I.h - sh, w: I.w, h: sh });
    }
  }
  if (L.chevron) slide.addShape("chevron", { ...L.chevron, fill: { color: C.g3 }, line: { type: "none" } });
  if (L.arrow) slide.addShape(L.arrows ? "chevron" : "rightArrow", { ...L.arrow, fill: { color: C.navy }, line: { type: "none" } });
  (L.arrows || []).forEach((a) => slide.addShape("chevron", { ...a, fill: { color: C.navy }, line: { type: "none" } }));
  if (L.downArrow) slide.addShape("downArrow", { ...L.downArrow, fill: { color: C.g3 }, line: { type: "none" } });
  if (L.decision && spec.decision) {
    const D = L.decision;
    slide.addShape("rect", { ...D, fill: { color: C.white }, line: { color: C.accent, width: 2 } });
    txt(slide, spec.decision.label || "Decision", D.x + 0.15, D.y + 0.1, D.w - 0.3, 0.35, { fontSize: 12, bold: true, color: C.navy });
    txt(slide, spec.decision.text, D.x + 0.15, D.y + 0.5, D.w - 0.3, D.h - 0.6, { max: 16, min: 11, bold: true, color: C.text, valign: "middle" });
  }
  if (L.tactics && spec.tactics) {
    const T = L.tactics, k = spec.tactics.length, w = (T.w - (k - 1) * 0.2) / k;
    spec.tactics.forEach((t, i) => {
      const x = T.x + i * (w + 0.2);
      slide.addShape("rect", { x, y: T.y, w, h: 0.42, fill: { color: C.navy }, line: { type: "none" } });
      txt(slide, t.title, x + 0.1, T.y, w - 0.2, 0.42, { max: 12, bold: true, color: C.white, valign: "middle" });
      slide.addShape("rect", { x, y: T.y + 0.42, w, h: T.h - 0.42, fill: { color: C.g1 }, line: { type: "none" } });
      txt(slide, t.text, x + 0.1, T.y + 0.5, w - 0.2, T.h - 0.55, { max: 13, min: 10 });
    });
  }
  return L;
}
// ---------- photo cover and photo agenda (reference form: Baincraft 1, Vaccine agenda): a full-bleed photo, a colour panel
// over part of it with the title, and the agenda with the current section boxed. The photo is placed at its original
// pixels and cropped by the frame ("cover"), never resampled. photo = {path, w, h} (pixel size, for the crop).
function coverCrop(photo, bw, bh) {            // pptxgenjs "cover" crop from the picture's own aspect ratio
  const ar = photo.w / photo.h, br = bw / bh;  // image box that covers bw x bh, then crop the overflow evenly
  const iw = ar > br ? bh * ar : bw, ih = ar > br ? bh : bw / ar;
  return { w: iw, h: ih, sizing: { type: "crop", x: (iw - bw) * (photo.focusX ?? 0.5), y: (ih - bh) * (photo.focusY ?? 0.5), w: bw, h: bh } };
}
function photoCover(pres, spec) {
  const s = pres.addSlide({ masterName: G.HOUSE.LAYOUT.blank || G.HOUSE.LAYOUT.titleOnly }), W = G.HOUSE.W, H = G.HOUSE.H;
  const c = coverCrop(spec.photo, W, H); s.addImage({ path: spec.photo.path, x: 0, y: 0, w: c.w, h: c.h, sizing: c.sizing, altText: spec.photo.alt || "Cover photo" });
  const px = 0.6, pw = W * 0.56, py = H * 0.34, ph = H * 0.44;
  s.addShape("rect", { x: px, y: py, w: pw, h: ph, fill: { color: C.navy, transparency: 12 }, line: { type: "none" } });
  txt(s, spec.title, px + 0.4, py + 0.3, pw - 0.8, ph * 0.5, { max: 32, min: 22, bold: true, color: C.white, onDark: true, valign: "middle", margin: 0 });
  s.addShape("rect", { x: px + 0.4, y: py + ph * 0.5 + 0.38, w: 1.0, h: 0.06, fill: { color: C.accent }, line: { type: "none" } });
  txt(s, spec.subtitle || "", px + 0.4, py + ph * 0.5 + 0.55, pw - 0.8, 0.4, { fontSize: 14, color: C.white, onDark: true, valign: "middle", margin: 0 });
  txt(s, spec.date || "", px + 0.4, py + ph - 0.55, pw - 0.8, 0.35, { fontSize: 12, color: C.white, onDark: true, valign: "middle", margin: 0 });
  if (spec.credit) txt(s, spec.credit, W - 5.2, H - 0.36, 5.0, 0.26, { fontSize: 9, color: C.white, onDark: true, align: "right", valign: "middle", margin: 0 });
  return s;
}
function photoAgenda(pres, spec) {             // spec: {photo, title, sections:[..], current (index or null), credit}
  const s = pres.addSlide({ masterName: G.HOUSE.LAYOUT.blank || G.HOUSE.LAYOUT.titleOnly }), W = G.HOUSE.W, H = G.HOUSE.H, pw = W * 0.56;
  const c = coverCrop(spec.photo, pw, H); s.addImage({ path: spec.photo.path, x: 0, y: 0, w: c.w, h: c.h, sizing: c.sizing, altText: spec.photo.alt || "Agenda photo" });
  s.addShape("rect", { x: pw, y: 0, w: W - pw, h: H, fill: { color: C.navy }, line: { type: "none" } });
  const x = pw + 0.6, w = W - pw - 1.0;
  txt(s, spec.title || "Agenda", x, 1.2, w, 0.7, { fontSize: 28, bold: true, color: C.white, onDark: true, valign: "middle", margin: 0 });
  s.addShape("rect", { x, y: 1.95, w: 1.0, h: 0.06, fill: { color: C.accent }, line: { type: "none" } });
  const n = spec.sections.length, rh = Math.min(0.8, (H - 3.4) / n);
  spec.sections.forEach((t, i) => { const y = 2.5 + i * rh, cur = spec.current === i;
    if (cur) s.addShape("rect", { x: x - 0.15, y: y + 0.06, w: w + 0.15, h: rh - 0.12, fill: { type: "none" }, line: { color: C.white, width: 1.5 } });
    s.addShape("rect", { x, y: y + (rh - 0.4) / 2, w: 0.4, h: 0.4, fill: { color: cur ? C.accent : C.white }, line: { type: "none" } });
    txt(s, String.fromCharCode(65 + i), x, y + (rh - 0.4) / 2, 0.4, 0.4, { fontSize: 14, bold: true, color: C.navy, align: "center", valign: "middle", margin: 0 });
    txt(s, t, x + 0.55, y, w - 0.6, rh, { fontSize: 16, bold: cur, color: C.white, onDark: true, valign: "middle", margin: 0 }); });
  if (spec.credit) txt(s, spec.credit, 0.2, H - 0.36, pw - 0.4, 0.26, { fontSize: 9, color: C.white, onDark: true, valign: "middle", margin: 0 });
  return s;
}
// live presenting: a fade-out cover greys out panels not yet discussed (QPT "fade-outs and cover-ups");
// put copies of the slide in sequence, each revealing one more panel.
function fadeOut(slide, box) { slide.addShape("rect", { ...box, fill: { color: "FFFFFF", transparency: 25 }, line: { type: "none" } }); }
async function writeObjectSlots(pres, file) {   // sidecar for fill_objects.py
  require("fs").writeFileSync(file, JSON.stringify(pres._objectSlots || [], null, 1));
}
module.exports.layoutBoxes = layoutBoxes;
module.exports.composeSlide = composeSlide;
module.exports.writeObjectSlots = writeObjectSlots;
module.exports.fadeOut = fadeOut;
module.exports.LAYOUTS = ["FULL", "HALF2", "BAND2", "GRID4", "GRID4I", "T2B1", "T1B2", "T3B1", "L2R1", "R2L1", "COL3", "COL4", "COLN", "EXI", "EXB", "CHAIN", "FLOW", "MULTI", "TXC"];

// =====================================================================
// LEARNED FROM THE 2019–2020 CASE DECKS (Bain Cup jewellery + fitness cases, 238 slides, 2026-11-23)
// riskMatrix, gantt, scoringTable, harvey, initiativeMatrix, explodedBar, heatGrid, agendaTracker, valueTree
// Same rules: any count, grey does the work, one highlight, house colours only.
// =====================================================================
function harvey(slide, x, y, d, score, max = 4, color = C.navy) {     // Harvey ball 0..max (pie shape, starts at 12 o'clock)
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: C.white }, line: { color, width: 1 } });
  const f = Math.max(0, Math.min(1, score / max));
  if (f >= 0.999) slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color }, line: { color, width: 1 } });
  else if (f > 0) slide.addShape("pie", { x, y, w: d, h: d, fill: { color }, line: { type: "none" }, angleRange: [270, (270 + 360 * f) % 360] });
}
function vlabel(slide, text, x, y, w, h, fill = C.navy) {               // vertical row-group label (rotated text in a band)
  slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
  txt(slide, text, x + w / 2 - h / 2, y + h / 2 - w / 2, h, w, { max: 12, min: 9, bold: true, color: C.white, align: "center", valign: "middle", rotate: 270, margin: 0 });
}

// Risk heat map with numbered risks on likelihood × impact, a dashed priority zone, then the SAME numbers in a
// risk → mitigation list (7 of 9 decks). spec.risks:[{id, name, x(0-1 impact), y(0-1 likelihood), mitigation:[..]}]
function riskMatrix(slide, spec, box = BODY) {
  const mw = spec.list === false ? box.w : box.w * 0.42, ax = box.x + 0.45, ay = box.y + 0.05, aw = mw - 0.55, ah = box.h - 0.55;
  [[0, 0, C.g1], [0.5, 0, C.g2], [0, 0.5, C.g2], [0.5, 0.5, C.g3]].forEach(([qx, qy, col]) =>
    slide.addShape("rect", { x: ax + qx * aw, y: ay + (0.5 - qy) * ah, w: aw / 2, h: ah / 2, fill: { color: col, transparency: 30 }, line: { color: C.white, width: 1 } }));
  const z = spec.zone || { x0: 0.5, x1: 1, y0: 0.5, y1: 1, label: "Priority risks" };
  slide.addShape("rect", { x: ax + z.x0 * aw, y: ay + (1 - z.y1) * ah, w: (z.x1 - z.x0) * aw, h: (z.y1 - z.y0) * ah, fill: { type: "none" }, line: { color: C.accent, width: 1.5, dashType: "dash" } });
  if (z.label) txt(slide, z.label, ax + z.x0 * aw + 0.06, ay + (1 - z.y1) * ah + 0.04, (z.x1 - z.x0) * aw - 0.1, 0.28, { fontSize: 10, bold: true, color: C.accent });
  slide.addShape("line", { x: ax, y: ay + ah, w: aw, h: 0, line: { color: C.g5, width: 1.25, endArrowType: "triangle" } });
  slide.addShape("line", { x: ax, y: ay, w: 0, h: ah, line: { color: C.g5, width: 1.25, beginArrowType: "triangle" } });
  txt(slide, (spec.x && spec.x.label) || "Impact", ax, ay + ah + 0.05, aw, 0.3, { fontSize: 11, bold: true, color: C.g5, align: "center" });
  txt(slide, (spec.y && spec.y.label) || "Likelihood", box.x + 0.16 - ah / 2, ay + ah / 2 - 0.15, ah, 0.3, { fontSize: 11, bold: true, color: C.g5, align: "center", rotate: 270 });
  const inZone = (r) => r.x >= z.x0 && r.x <= z.x1 && r.y >= z.y0 && r.y <= z.y1, d = 0.36;
  spec.risks.forEach((r) => {
    const cx = ax + r.x * aw, cy = ay + (1 - r.y) * ah, hot = r.hot ?? inZone(r);
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? C.accent : C.g4 }, line: { color: C.white, width: 1 } });
    txt(slide, String(r.id), cx - d / 2, cy - d / 2, d, d, { fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    if (spec.list === false && r.name) txt(slide, r.name, cx + d / 2 + 0.04, cy - 0.15, 1.8, 0.3, { fontSize: 10, color: C.text });
  });
  if (spec.list === false) return;
  slide.addShape("chevron", { x: box.x + mw + 0.08, y: box.y + box.h / 2 - 0.4, w: 0.3, h: 0.8, fill: { color: C.g3 }, line: { type: "none" } });
  const lx = box.x + mw + 0.5, lw = box.w - mw - 0.5, nw = lw * 0.36, hh = 0.36, rows = spec.risks;
  txt(slide, spec.riskHeader || "Risk", lx + 0.45, box.y, nw - 0.45, hh, { fontSize: 12, bold: true, color: C.navy, valign: "middle" });
  txt(slide, spec.mitigationHeader || "Mitigation", lx + nw + 0.1, box.y, lw - nw - 0.1, hh, { fontSize: 12, bold: true, color: C.navy, valign: "middle" });
  slide.addShape("line", { x: lx, y: box.y + hh, w: lw, h: 0, line: { color: C.navy, width: 1 } });
  const rh = (box.h - hh - 0.05) / rows.length;
  rows.forEach((r, i) => {
    const y = box.y + hh + 0.05 + i * rh, hot = r.hot ?? inZone(r);
    chip(slide, r.id, lx, y + 0.06, 0.32, hot ? C.accent : C.g4);
    slide.addShape("rect", { x: lx + 0.42, y: y + 0.04, w: nw - 0.42, h: rh - 0.08, fill: { color: hot ? C.hiBand : C.g1 }, line: { type: "none" } });
    txt(slide, r.name, lx + 0.5, y + 0.04, nw - 0.56, rh - 0.08, { max: 12, min: 9, bold: true, color: C.text, valign: "middle" });
    txt(slide, (r.mitigation || []).map((m) => "• " + m).join("\n"), lx + nw + 0.1, y + 0.04, lw - nw - 0.1, rh - 0.08, { max: 12, min: 9, valign: "middle" });
    if (i < rows.length - 1) slide.addShape("line", { x: lx + nw + 0.1, y: y + rh, w: lw - nw - 0.1, h: 0, line: { color: C.g3, width: 0.5, dashType: "dash" } });
  });
}

// Gantt by workstream with an optional phase staircase on top (0-1 / 1-3 / 3-5 years: stabilise / revitalise / arise)
// spec.periods:["2020",...], spec.phases:[{label, sub, from, to}], spec.groups:[{name, rows:[{label, from, to, milestone, hi}]}]
// from/to are in period units (0 = start of first period). Priority bars (hi) in the main colour, the rest grey.
function gantt(slide, spec, box = BODY) {
  const lw = Math.min(2.8, box.w * 0.26), gx = box.x + lw, gw = box.w - lw, np = spec.periods.length, pw = gw / np;
  let y = box.y;
  if (spec.phases) {                                              // staircase: each later phase sits a step higher
    const k = spec.phases.length, sh = 0.18, top = y;
    spec.phases.forEach((ph, i) => {
      const x = gx + ph.from * pw, w = (ph.to - ph.from) * pw, py = top + (k - 1 - i) * sh, last = i === k - 1;
      slide.addShape("rect", { x: x + 0.02, y: py, w: w - 0.04, h: 0.34 + i * sh, fill: { color: last ? C.navy : i ? C.g5 : C.g3 }, line: { type: "none" } });
      txt(slide, ph.label, x + 0.02, py, w - 0.04, 0.34, { max: 12, min: 9, bold: true, color: C.white, align: "center", valign: "middle" });
      if (ph.sub) txt(slide, ph.sub, x, top + k * sh + 0.36, w, 0.26, { fontSize: 9, color: C.g5, align: "center" });
    });
    y = top + k * sh + 0.66;
  }
  spec.periods.forEach((p, i) => txt(slide, p, gx + i * pw, y, pw, 0.3, { fontSize: 11, bold: true, color: C.navy, align: "center", valign: "middle" }));
  slide.addShape("line", { x: box.x, y: y + 0.32, w: box.w, h: 0, line: { color: C.navy, width: 1 } });
  y += 0.38;
  const nrows = spec.groups.reduce((a, g) => a + g.rows.length + 1, 0), rh = Math.min(0.42, (box.y + box.h - y - (spec.legend !== false ? 0.3 : 0)) / nrows);
  for (let i = 1; i < np; i++) slide.addShape("line", { x: gx + i * pw, y: y - 0.06, w: 0, h: nrows * rh, line: { color: C.g3, width: 0.5, dashType: "dash" } });
  spec.groups.forEach((g) => {
    txt(slide, g.name, box.x, y, lw, rh, { max: 12, min: 9, bold: true, color: C.navy, valign: "middle" });
    y += rh;
    g.rows.forEach((r) => {
      txt(slide, r.label, box.x + 0.15, y, lw - 0.15, rh, { max: 11, min: 8, color: C.text, valign: "middle" });
      if (r.to > r.from) slide.addShape("rect", { x: gx + r.from * pw + 0.03, y: y + rh * 0.2, w: (r.to - r.from) * pw - 0.06, h: rh * 0.6, fill: { color: r.hi ? C.navy : C.g3 }, line: { type: "none" } });
      if (r.milestone != null) { const mx = gx + r.milestone * pw;
        slide.addShape("diamond", { x: mx - 0.11, y: y + rh / 2 - 0.11, w: 0.22, h: 0.22, fill: { color: C.accent }, line: { color: C.white, width: 0.75 } }); }
      y += rh;
    });
  });
  if (spec.legend !== false) txt(slide, "■ priority   ■ follow-on   ◆ milestone", box.x, box.y + box.h - 0.26, lw, 0.26, { fontSize: 9, color: C.g5 });
}

// Options/players × criteria scoring table: Harvey balls (0-4) or a verdict, own/chosen column in a dashed box.
// spec.columns:[{name, own?}], spec.rows:[{label, group?, scores:[0-4 | "✓" | "✗" | text]}], spec.verdict:[..] optional per column
function scoringTable(slide, spec, box = BODY) {
  const groups = spec.rows.some((r) => r.group), gw = groups ? 0.38 : 0, lw = Math.min(2.6, box.w * 0.27), hh = 0.5;
  const nc = spec.columns.length, cw = (box.w - gw - lw) / nc, hasV = !!spec.verdict, vh = hasV ? 0.5 : 0;
  const rh = (box.h - hh - vh) / spec.rows.length, x0 = box.x + gw + lw;
  spec.columns.forEach((c, j) => {
    slide.addShape("rect", { x: x0 + j * cw + 0.03, y: box.y, w: cw - 0.06, h: hh - 0.06, fill: { color: c.own ? C.navy : C.g2 }, line: { type: "none" } });
    txt(slide, c.name, x0 + j * cw + 0.03, box.y, cw - 0.06, hh - 0.06, { max: 12, min: 9, bold: true, color: c.own ? C.white : C.navy, align: "center", valign: "middle" });
  });
  let gStart = 0;
  spec.rows.forEach((r, i) => {
    const y = box.y + hh + i * rh;
    if (i % 2 === 0) slide.addShape("rect", { x: box.x + gw, y, w: box.w - gw, h: rh, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, r.label, box.x + gw + 0.08, y, lw - 0.1, rh, { max: 12, min: 9, color: C.text, valign: "middle" });
    r.scores.forEach((v, j) => {
      const cx = x0 + j * cw + cw / 2;
      if (typeof v === "number") { const d = Math.min(0.32, rh * 0.7); harvey(slide, cx - d / 2, y + rh / 2 - d / 2, d, v, spec.max || 4, spec.columns[j].own ? C.navy : C.g5); }
      else txt(slide, String(v), x0 + j * cw + 0.05, y, cw - 0.1, rh, { max: 11, min: 8, fontSize: (v === "✓" || v === "✗") ? 16 : undefined, align: "center", valign: "middle", bold: v === "✓" || v === "✗",
        color: v === "✓" ? C.navy : v === "✗" ? C.accent : C.text });
    });
    if (groups && (i === spec.rows.length - 1 || spec.rows[i + 1].group !== r.group)) {
      vlabel(slide, r.group || "", box.x, box.y + hh + gStart * rh + 0.03, gw - 0.06, (i - gStart + 1) * rh - 0.06); gStart = i + 1; }
  });
  if (hasV) spec.verdict.forEach((v, j) => {
    const y = box.y + box.h - vh + 0.06;
    txt(slide, v, x0 + j * cw + 0.03, y, cw - 0.06, vh - 0.06, { max: 12, min: 9, bold: true, color: spec.columns[j].own ? C.navy : C.g5, align: "center", valign: "middle" });
  });
  const own = spec.columns.findIndex((c) => c.own);
  if (own >= 0) slide.addShape("rect", { x: x0 + own * cw, y: box.y - 0.04, w: cw, h: box.h + 0.06, fill: { type: "none" }, line: { color: C.accent, width: 1.5, dashType: "dash" } });
}

// Initiatives as lettered columns × labelled row bands (Overview / Detail / Impact …), journey chain at the foot.
// spec.rows:["Overview","Detail","Impact"], spec.columns:[{letter, title, cells:[string|[bullets]], foot?}], spec.highlight
function initiativeMatrix(slide, spec, box = BODY) {
  const lw = 1.05, nc = spec.columns.length, g = 0.15, cw = (box.w - lw - (nc - 1) * g) / nc, hh = 0.55;
  const foot = spec.columns.some((c) => c.foot) ? 0.42 : 0, rh = (box.h - hh - foot - 0.1) / spec.rows.length;
  spec.rows.forEach((r, k) => vlabel(slide, r, box.x, box.y + hh + 0.05 + k * rh + 0.03, lw - 0.15, rh - 0.06, k % 2 ? C.g5 : C.navy));
  spec.columns.forEach((c, j) => {
    const x = box.x + lw + j * (cw + g), hi = spec.highlight === j;
    chip(slide, c.letter || String.fromCharCode(65 + j), x, box.y + 0.1, 0.34, hi ? C.accent : C.navy);
    txt(slide, c.title, x + 0.42, box.y, cw - 0.42, hh, { max: 13, min: 10, bold: true, color: C.navy, valign: "middle" });
    slide.addShape("line", { x, y: box.y + hh, w: cw, h: 0, line: { color: C.navy, width: 1 } });
    spec.rows.forEach((_, k) => {
      const y = box.y + hh + 0.05 + k * rh, v = c.cells[k];
      slide.addShape("rect", { x, y: y + 0.03, w: cw, h: rh - 0.06, fill: { color: k % 2 ? C.white : (hi ? C.hiBand : C.g1) }, line: { color: C.g2, width: 0.5 } });
      txt(slide, Array.isArray(v) ? v.map((b) => "• " + b).join("\n") : (v || ""), x + 0.08, y + 0.06, cw - 0.16, rh - 0.12, { max: 12, min: 9, bold: k === 0, valign: "middle" });
    });
    if (c.foot) { const fy = box.y + box.h - foot;
      slide.addShape("homePlate", { x, y: fy, w: cw, h: foot - 0.04, fill: { color: C.g2 }, line: { type: "none" } });
      txt(slide, c.foot, x + 0.08, fy, cw - 0.3, foot - 0.04, { max: 11, min: 8, bold: true, color: C.navy, valign: "middle" }); }
  });
}

// One stacked column whose chosen segment is "exploded" (dashed bracket) into a breakdown bar chart — "of the 93% who…, why?"
// spec.total:{label, parts:[{name, value}], explode: index}, spec.breakdown:{labels, values, highlight, format}, spec.unit
function explodedBar(pres, slide, spec, box = BODY) {
  const bw = Math.min(1.2, box.w * 0.18), bx = box.x + 0.9, by = box.y + 0.3, bh = box.h - 0.65, parts = spec.total.parts, sum = parts.reduce((a, p) => a + p.value, 0);
  let y = by; const ex = spec.total.explode ?? parts.length - 1; let ey0 = by, ey1 = by;
  parts.forEach((p, i) => {
    const h = bh * p.value / sum, hi = i === ex;
    slide.addShape("rect", { x: bx, y, w: bw, h, fill: { color: hi ? C.navy : C.g3 }, line: { color: C.white, width: 1 } });
    txt(slide, (spec.unit === "%" ? p.value + "%" : p.value), bx, y, bw, h, { fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    txt(slide, p.name, box.x, y, 0.85, h, { max: 11, min: 8, color: C.text, align: "right", valign: "middle" });
    if (hi) { ey0 = y; ey1 = y + h; } y += h;
  });
  if (spec.total.label) txt(slide, spec.total.label, bx - 0.2, by + bh + 0.05, bw + 0.4, 0.3, { fontSize: 10, color: C.g5, align: "center" });
  const cx = bx + bw + 0.6, cw = box.x + box.w - cx;
  slide.addShape("rect", { x: cx - 0.1, y: box.y + 0.05, w: cw + 0.1, h: box.h - 0.1, fill: { type: "none" }, line: { color: C.accent, width: 1.25, dashType: "dash" } });
  slide.addShape("line", { x: bx + bw, y: ey0, w: cx - 0.1 - bx - bw, h: box.y + 0.05 - ey0, flipV: box.y + 0.05 < ey0, line: { color: C.accent, width: 1, dashType: "dash" } });
  slide.addShape("line", { x: bx + bw, y: Math.min(ey1, box.y + box.h - 0.05), w: cx - 0.1 - bx - bw, h: Math.abs(box.y + box.h - 0.05 - ey1), flipV: box.y + box.h - 0.05 < ey1, line: { color: C.accent, width: 1, dashType: "dash" } });
  if (spec.breakdown.title) txt(slide, spec.breakdown.title, cx, box.y + 0.08, cw - 0.1, 0.3, { fontSize: 11, bold: true, color: C.navy });
  const b = spec.breakdown, k = b.labels.length;   // bar charts draw the first category at the bottom: reverse so the list reads top-down
  chartIn(pres, slide, { type: "bar", labels: [...b.labels].reverse(), series: [{ name: b.name || "Share", values: [...b.values].reverse() }], highlight: b.highlight == null ? null : k - 1 - b.highlight, format: b.format }, { x: cx, y: box.y + (b.title ? 0.4 : 0.1), w: cw - 0.1, h: box.h - (b.title ? 0.5 : 0.2) });
}

// Segment × attribute heat grid: shading by value (grey → main colour), target cells boxed, optional vertical row groups.
// spec.rows:[{label, group?}], spec.cols:[..], spec.values:[[..]], spec.target:[[r,c],…], spec.format(v)
function heatGrid(slide, spec, box = BODY) {
  const groups = spec.rows.some((r) => r.group), gw = groups ? 0.38 : 0, lw = Math.min(2.2, box.w * 0.22), hh = 0.5;
  const nc = spec.cols.length, cw = (box.w - gw - lw) / nc, rh = (box.h - hh) / spec.rows.length, x0 = box.x + gw + lw;
  const all = spec.values.flat(), lo = Math.min(...all), hi = Math.max(...all);
  const mix = (a, b, t) => { const p = (h) => [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); const A = p(a), B = p(b);
    return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("").toUpperCase(); };
  spec.cols.forEach((c, j) => txt(slide, c, x0 + j * cw, box.y, cw, hh, { max: 12, min: 9, bold: true, color: C.navy, align: "center", valign: "bottom" }));
  let gStart = 0;
  spec.rows.forEach((r, i) => {
    const y = box.y + hh + i * rh;
    txt(slide, r.label, box.x + gw + 0.05, y, lw - 0.1, rh, { max: 12, min: 9, valign: "middle" });
    spec.values[i].forEach((v, j) => {
      const t = hi > lo ? (v - lo) / (hi - lo) : 0, fill = mix(C.g1, C.navy, t);
      slide.addShape("rect", { x: x0 + j * cw + 0.02, y: y + 0.02, w: cw - 0.04, h: rh - 0.04, fill: { color: fill }, line: { type: "none" } });
      txt(slide, spec.format ? spec.format(v) : String(v), x0 + j * cw, y, cw, rh, { fontSize: 11, bold: t > 0.6, color: t > 0.5 ? C.white : C.text, align: "center", valign: "middle", margin: 0 });
    });
    if (groups && (i === spec.rows.length - 1 || spec.rows[i + 1].group !== r.group)) {
      vlabel(slide, r.group || "", box.x, box.y + hh + gStart * rh + 0.02, gw - 0.06, (i - gStart + 1) * rh - 0.04); gStart = i + 1; }
  });
  (spec.target || []).forEach(([r, c]) => slide.addShape("rect", { x: x0 + c * cw, y: box.y + hh + r * rh, w: cw, h: rh, fill: { type: "none" }, line: { color: C.accent, width: 2, dashType: "dash" } }));
}

// Agenda that tracks where we are: repeated before every section, current section highlighted, its sub-points shown.
// spec.sections:[{title, items:[..]}], spec.current (index)
function agendaTracker(slide, spec, box = BODY) {
  const n = spec.sections.length, cur = spec.current ?? 0, items = (spec.sections[cur].items || []).length;
  const sh = Math.min(0.62, box.h / (n + items * 0.6 + 0.5)), w = Math.min(7.5, box.w * 0.62);
  let y = box.y + 0.1;
  spec.sections.forEach((s, i) => {
    const on = i === cur, done = i < cur;
    if (on) slide.addShape("rect", { x: box.x, y, w, h: sh, fill: { color: C.navy }, line: { type: "none" } });
    chip(slide, i + 1, box.x + 0.12, y + (sh - 0.36) / 2, 0.36, on ? C.accent : done ? C.g4 : C.g3);
    txt(slide, s.title, box.x + 0.62, y, w - 0.7, sh, { max: 18, min: 12, bold: on, color: on ? C.white : done ? C.g4 : C.text, valign: "middle" });
    y += sh + 0.08;
    if (on) (s.items || []).forEach((it) => { txt(slide, "– " + it, box.x + 0.9, y, w - 1, sh * 0.6, { max: 14, min: 10, color: C.navy, valign: "middle" }); y += sh * 0.6; });
  });
}

// Target number built as a multiplication/addition tree (stores = cities × density × fit; revenue = users × visits × spend),
// each leaf tied to a lettered initiative and its value. spec.root:{label, value}, spec.op:"×"|"+", spec.leaves:[{label, value, letter?, initiative?, hi?}]
function valueTree(slide, spec, box = BODY) {
  const n = spec.leaves.length, rw = Math.min(2.4, box.w * 0.22), lw = Math.min(2.6, box.w * 0.25), hasI = spec.leaves.some((l) => l.initiative);
  const rx = box.x, lx = box.x + rw + 0.7, ix = lx + lw + 0.5, iw = box.x + box.w - ix, lh = Math.min(1.0, (box.h - (n - 1) * 0.25) / n);
  const tot = n * lh + (n - 1) * 0.25, y0 = box.y + (box.h - tot) / 2, cy = box.y + box.h / 2;
  slide.addShape("rect", { x: rx, y: cy - 0.6, w: rw, h: 1.2, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, [{ text: spec.root.value || "", options: { fontSize: 22, bold: true, breakLine: true } }, { text: spec.root.label, options: { fontSize: 11 } }], rx + 0.08, cy - 0.6, rw - 0.16, 1.2, { color: C.white, align: "center", valign: "middle" });
  slide.addShape("line", { x: rx + rw, y: cy, w: 0.35, h: 0, line: { color: C.g5, width: 1 } });
  slide.addShape("line", { x: rx + rw + 0.35, y: y0 + lh / 2, w: 0, h: tot - lh, line: { color: C.g5, width: 1 } });
  spec.leaves.forEach((l, i) => {
    const y = y0 + i * (lh + 0.25);
    slide.addShape("line", { x: rx + rw + 0.35, y: y + lh / 2, w: 0.35, h: 0, line: { color: C.g5, width: 1 } });
    slide.addShape("rect", { x: lx, y, w: lw, h: lh, fill: { color: l.hi ? C.hiBand : C.g1 }, line: { color: l.hi ? C.navy : C.g3, width: 1 } });
    txt(slide, [{ text: l.label, options: { bold: true, breakLine: !!l.value } }].concat(l.value ? [{ text: l.value, options: { color: C.navy } }] : []), lx + 0.08, y, lw - 0.16, lh, { max: 12, min: 9, valign: "middle" });
    if (i < n - 1) txt(slide, spec.op || "×", lx + lw / 2 - 0.2, y + lh - 0.02, 0.4, 0.29, { fontSize: 14, bold: true, color: C.g5, align: "center", valign: "middle", margin: 0 });
    if (hasI && l.initiative) {
      slide.addShape("line", { x: lx + lw, y: y + lh / 2, w: 0.5 - 0.06, h: 0, line: { color: C.g4, width: 1, endArrowType: "triangle" } });
      chip(slide, l.letter || String.fromCharCode(65 + i), ix, y + lh / 2 - 0.17, 0.34, l.hi ? C.accent : C.navy);
      txt(slide, l.initiative, ix + 0.42, y, iw - 0.42, lh, { max: 12, min: 9, valign: "middle", bold: !!l.hi });
    }
  });
}
Object.assign(module.exports, { harvey, vlabel, riskMatrix, gantt, scoringTable, initiativeMatrix, explodedBar, heatGrid, agendaTracker, valueTree });
