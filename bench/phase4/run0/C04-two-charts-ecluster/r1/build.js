// C04 rebuild (deck as reference: Case-2019-E-Cluster, leave-one-out).
// Approach: the deck's style profile through the harness (title band, crumb, source, page number), and the panel
// arrangement of the deck's closest OTHER slide with the same story role: the market-situation slide with
// two numbered chart panels on top and a grey band of three icon driver cards below (T2B1 in the slide map,
// "situation | T2B1 | stacked column w/ CAGR columns + red circle on key CAGR ... three icon driver cards").
// Sizes and colours are the deck's: panel heads 17 pt bold 10366C with a 0.31 in chip, chart labels 14 pt,
// card labels 16 pt bold, card text 15 pt italic, grey band F1F1F1 with a 10366C top rule, notes 10 pt italic.
// Charts are native (editable data); totals, CAGR table and connectors are placed from the charts' fixed plot areas.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const ROOT = path.join(__dirname, "../../../../..");
const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs")), __dirname] }));

(async () => {
  const crumb = { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " };
  const title = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
  const { pres, slide, P } = L.start({ ref: "Case-2019-E-Cluster", title, crumb });
  const F = "Arial";
  const NAVY = "10366C", CHIP = "283954", LIGHT = "C1DBEA", GREY = "7E7E7E", PANEL = "F1F1F1", RED = "CC0000", NOTE = "585858", TXT = "000000";
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || TXT, bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.03, isTextBox: true, underline: o.underline, lineSpacingMultiple: o.ls });

  // source line in the deck's italic, page furniture the deck repeats on every slide: bottom rule and logo
  slide.addText([{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }], { placeholder: "source" });
  slide.addShape("line", { x: 0, y: 7.255, w: 13.333, h: 0, line: { color: "202C4F", width: 0.75 } });
  T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.03, 6, 0.21, { size: 10, italic: true, color: NOTE, margin: 0 });
  try {   // the deck's own logo (wordmark + gear), taken from the reference file at full resolution
    const zip = await JSZip.loadAsync(require("fs").readFileSync(path.join(ROOT, "Templates/Case-2019-E-Cluster.pptx")));
    const b64 = async (n) => (await zip.file("ppt/media/" + n).async("base64"));
    slide.addImage({ data: "image/jpeg;base64," + (await b64("image2.jpg")), x: 11.915, y: 0.108, w: 1.118, h: 0.227 });
    slide.addImage({ data: "image/jpeg;base64," + (await b64("image3.jpg")), x: 11.558, y: 0.027, w: 0.337, h: 0.371 });
  } catch (e) { console.warn("logo not placed:", e.message); }
  // the master's measured "title rule" runs under both panel heads; the deck keeps a gap between the two panels
  slide.addShape("rect", { x: 6.42, y: 1.7, w: 0.86, h: 0.1, fill: { color: "FFFFFF" }, line: { type: "none" } });

  // numbered panel head: dark circle chip + bold sentence + rule (the deck's sub-headline form)
  const head = (n, text, x, y, w, rule = true) => {
    slide.addShape("ellipse", { x, y: y + 0.01, w: 0.31, h: 0.31, fill: { color: CHIP }, line: { type: "none" } });
    T(String(n), x, y + 0.01, 0.31, 0.31, { size: 15, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    T(text, x + 0.35, y - 0.02, w - 0.35, 0.36, { size: 17, bold: true, color: NAVY, valign: "middle" });
    if (rule) slide.addShape("line", { x: x + 0.37, y: y + 0.34, w: w - 0.37, h: 0, line: { color: NAVY, width: 1.5 } });
  };
  // native column chart with a fixed plot area, so bar positions are known: returns bar geometry per category
  const colChart = (data, o) => {
    const plot = o.plot, area = { x: plot.x - 0.05, y: plot.y - 0.05, w: plot.w + 0.1, h: plot.h + 0.45 };
    slide.addChart(pres.ChartType.bar, data, { ...area, barDir: "col", barGrouping: o.grouping || "stacked", chartColors: o.colors, showLegend: false,
      layout: { x: (plot.x - area.x) / area.w, y: (plot.y - area.y) / area.h, w: plot.w / area.w, h: plot.h / area.h },
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: o.max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      catAxisLabelFontSize: 14, catAxisLabelColor: TXT, catAxisLabelFontFace: F, catAxisLineShow: true, catAxisLineColor: "000000", catAxisMajorTickMark: "none",
      showValue: !!o.labels, dataLabelPosition: o.labelPos || "outEnd", dataLabelFontSize: 14, dataLabelFontFace: F, dataLabelColor: o.labelColor || TXT,
      dataLabelFormatCode: o.format || "#,##0", barGapWidthPct: o.gap, objectName: o.name });
    const n = data[0].values.length, cw = plot.w / n, bw = cw / (1 + o.gap / 100);
    return data[0].values.map((_, i) => { const tot = data.reduce((a, s) => a + s.values[i], 0);
      return { x: plot.x + i * cw + (cw - bw) / 2, w: bw, top: plot.y + plot.h * (1 - tot / o.max), base: plot.y + plot.h, tot }; });
  };

  // ---------- 1: market size stacked columns + CAGR table ----------
  head(1, "Fine jewelry has a lower growth rate", 0.27, 1.42, 6.12);
  T([{ text: "China fine jewelry annual market size and growth", options: { breakLine: true } }, { text: "CNY Billion", options: { italic: true } }], 0.6, 1.85, 5.6, 0.52);
  const yrs = ["2013", "2018", "2023E"], fine = [53, 72, 99], fashion = [2, 2, 8];
  const bars = colChart([{ name: "Fine jewelry", labels: yrs, values: fine }, { name: "Fashion jewelry", labels: yrs, values: fashion }],
    { plot: { x: 0.65, y: 2.66, w: 3.15, h: 1.8 }, max: 107, gap: 80, colors: [LIGHT, NAVY], name: "market size by segment" });
  bars.forEach((b) => T(String(b.tot), b.x - 0.2, b.top - 0.3, b.w + 0.4, 0.27, { align: "center", margin: 0 }));
  // CAGR table beside the stack: rows top-down in stack order, the highlighted segment's CAGR circled
  const cx = [5.02, 5.76], cwid = 0.62;
  ["13-18", "18-23"].forEach((h, j) => T([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: h }], cx[j], 2.3, cwid, 0.52, { align: "center", margin: 0 }));
  const rows = [["Fashion jewelry", "23%", "18%", 2.9], ["Fine jewelry", "4%", "5%", 3.58], ["Total", "4%", "7%", 4.12]];
  rows.forEach(([name, a, b, y], k) => {
    T(name, 3.84, y, k === 0 ? 1.1 : 1.2, k === 0 ? 0.55 : 0.3, { valign: "middle", margin: 0, ls: 0.95 });
    [a, b].forEach((v, j) => T(v, cx[j], y, cwid, k === 0 ? 0.55 : 0.3, { align: "center", valign: "middle", margin: 0 }));
  });
  slide.addShape("line", { x: 3.84, y: 4.03, w: 2.55, h: 0, line: { color: "BEBEBE", width: 0.75 } });
  slide.addShape("ellipse", { x: cx[0] + 0.02, y: 2.92, w: cwid - 0.04, h: 0.5, fill: { type: "none" }, line: { color: RED, width: 1.25 } });

  // ---------- 2: CTF revenue columns + 2018 split ----------
  head(2, "Fine jewelry accounts for the majority of CTF*", 6.86, 1.42, 6.22);
  T([{ text: "CTF's annual revenue", options: { breakLine: true } }, { text: "CNY Billion", options: { italic: true } }], 7.2, 1.85, 3.0, 0.52);
  T([{ text: "CTF's 2018 revenue", options: { breakLine: true } }, { text: "by segment, %", options: { italic: true } }], 10.45, 1.85, 2.6, 0.52);
  const rev = colChart([{ name: "Revenue", labels: ["2013", "2018"], values: [47, 48] }],
    { plot: { x: 7.25, y: 2.66, w: 2.6, h: 1.8 }, max: 60, gap: 90, colors: [NAVY], labels: true, grouping: "clustered", name: "CTF revenue" });
  // CAGR callout: arrow over the two columns with the rate in an oval (the deck's growth callout)
  const a0 = { x: rev[0].x - 0.05, y: rev[0].top - 0.3 }, a1 = { x: rev[1].x + rev[1].w + 0.1, y: rev[1].top - 0.62 };
  slide.addShape("line", { x: a0.x, y: a1.y, w: a1.x - a0.x, h: a0.y - a1.y, flipV: true, line: { color: "000000", width: 2, endArrowType: "triangle" } });
  const om = { x: (a0.x + a1.x) / 2 - 0.62, y: (a0.y + a1.y) / 2 - 0.2 };
  slide.addShape("ellipse", { x: om.x, y: om.y, w: 1.24, h: 0.4, fill: { color: "FFFFFF" }, line: { color: "000000", width: 1 } });
  T([{ text: "CAGR ", options: {} }, { text: "1%", options: { bold: true } }], om.x, om.y, 1.24, 0.4, { align: "center", valign: "middle", margin: 0 });
  // 2018 split: one 100% column, linked to the 2018 column by dotted lines
  const split = colChart([{ name: "Fine jewelry", labels: ["2018"], values: [89] }, { name: "Fashion jewelry", labels: ["2018"], values: [11] }],
    { plot: { x: 10.5, y: 2.66, w: 1.05, h: 1.8 }, max: 100, gap: 40, colors: [LIGHT, NAVY], name: "CTF revenue by segment" });
  const s = split[0], r18 = rev[1];
  [[r18.top, s.top], [r18.base, s.base]].forEach(([y0, y1]) => slide.addShape("line", { x: r18.x + r18.w, y: Math.min(y0, y1), w: s.x - r18.x - r18.w, h: Math.abs(y1 - y0) || 0.001,
    flipV: y1 < y0, line: { color: GREY, width: 1, dashType: "sysDot" } }));
  const fy = s.top + (s.base - s.top) * 0.11;
  T("11%", s.x, s.top, s.w, fy - s.top, { size: 12, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  T("89%", s.x, fy, s.w, s.base - fy, { align: "center", valign: "middle", margin: 0 });
  T("Fashion jewelry", s.x + s.w + 0.12, (s.top + fy) / 2 - 0.15, 1.5, 0.3, { valign: "middle", margin: 0 });
  T("Fine jewelry", s.x + s.w + 0.12, (fy + s.base) / 2 - 0.15, 1.5, 0.3, { valign: "middle", margin: 0 });

  // ---------- 3: three constraint cards in the grey band ----------
  head(3, "Major constraints limit the further development of fine jewelry", 0.27, 4.91, 9.5, false);
  slide.addShape("rect", { x: 0.64, y: 5.27, w: 12.45, h: 1.74, fill: { color: PANEL }, line: { type: "none" } });
  slide.addShape("line", { x: 0.64, y: 5.27, w: 12.45, h: 0, line: { color: NAVY, width: 1.25 } });
  const cards = [
    ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
    ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
    ["trending-down", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"]];
  const cx0 = [0.75, 4.72, 9.2], cw3 = 3.75;
  cards.forEach(([ic, lab, body], i) => {
    const x = cx0[i];
    P.icon(slide, ic, x, 5.45, 0.32, { color: GREY, width: 1.25 });
    T(lab, x + 0.4, 5.33, cw3 - 0.4, 0.52, { size: 16, bold: true, valign: "middle", ls: 0.9 });
    T(body, x + 0.45, 5.9, cw3 - 0.5, 1.05, { size: 15, italic: true });
    if (i) slide.addShape("line", { x: x - 0.17, y: 5.6, w: 0, h: 1.27, line: { color: GREY, width: 0.75 } });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
