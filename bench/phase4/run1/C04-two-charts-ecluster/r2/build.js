// C04 rebuild 2: two charts on top, three icon boxes below, in the style of Case-2019-E-Cluster.
// Layout taken from the deck's other T2B1 market slide (situation slide: stacked column + CAGR columns | second chart,
// a grey band of three icon driver cards underneath). Panel headlines come from the deck's profile (subhead);
// chart colours are the ones that deck uses in its charts (dark blue 10366C, light blue C1DBEB, mid blue 63A4CC).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-E-Cluster",
  title: TITLE,
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const DARK = "10366C", LIGHT = "C1DBEB", MID = "63A4CC", RED = "CC0000", GREY = "7E7E7E";
const PT = 14;                                     // the reference's label size (charts, tables)

// plain text box at a fixed size (no fitting), the reference's way
function t(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || PT, color: o.color || "000000", bold: !!o.bold, italic: !!o.italic,
    underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true });
}
// a native column chart whose plot area is fixed, so the columns' positions are known (for totals and connectors)
function columns(data, colors, box, o) {
  const lay = { x: 0, y: 0, w: 1, h: o.plotH };     // inner plot area as a share of the chart frame
  slide.addChart(pres.ChartType.bar, data, {
    ...box, barDir: "col", barGrouping: o.stacked ? "stacked" : "clustered", chartColors: colors, barGapWidthPct: o.gap,
    showLegend: false, showValue: !!o.showValue, dataLabelPosition: "outEnd", dataLabelFontSize: PT, dataLabelColor: "000000", dataLabelFontFace: FONT,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: o.max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: PT, catAxisLabelFontFace: FONT, catAxisLabelColor: "000000", catAxisLineShow: true, catAxisLineColor: "000000",
    catAxisMajorTickMark: "none", layout: lay,
  });
  const n = data[0].values.length, cw = box.w / n, bw = cw / (1 + o.gap / 100), ph = box.h * o.plotH;
  return data[0].values.map((_, i) => ({ cx: box.x + cw * (i + 0.5), bw, top: (v) => box.y + ph * (1 - v / o.max), base: box.y + ph }));
}

// panel boxes: measured on the deck's own T2B1 slide (top panels to y 4.95, grey band 5.0 to 7.0)
// (panels start at 1.32 so their rules sit at y 1.74, where the deck's panel rules are)
const P1 = { x: 0.27, y: 1.32, w: 6.13, h: 3.58 }, P2 = { x: 6.87, y: 1.32, w: 6.2, h: 3.58 };

// ---------- 1  market: stacked columns + CAGR columns ----------
function marketPanel(sl, b) {
  t("China fine jewelry annual market size and growth", b.x + 0.33, b.y, b.w - 0.33, 0.27, { pt: 15 });
  t("CNY Billion", b.x + 0.33, b.y + 0.26, 2, 0.27, { pt: 15, italic: true });
  const years = ["2013", "2018", "2023E"], fine = [53, 72, 99], fash = [2, 2, 8];
  const ch = { x: b.x + 0.2, y: b.y + 0.62, w: 2.95, h: b.y + b.h - (b.y + 0.62) };
  const max = 125, cols = columns([{ name: "Fine jewelry", labels: years, values: fine }, { name: "Fashion jewelry", labels: years, values: fash }], [LIGHT, DARK], ch, { stacked: true, gap: 70, max, plotH: 0.86 });
  cols.forEach((c, i) => t(String(fine[i] + fash[i]), c.cx - 0.4, c.top(fine[i] + fash[i]) - 0.3, 0.8, 0.27, { align: "center" }));
  // CAGR columns beside the stack, rows at the height of their segment
  const nx = ch.x + ch.w + 0.1, k1 = nx + 1.5, k2 = k1 + 0.7, kw = 0.66, hy = b.y + 0.62;
  ["13-18", "18-23"].forEach((h, j) => { const x = j ? k2 : k1;
    t("CAGR", x, hy, kw, 0.26, { align: "center", underline: true }); t(h, x, hy + 0.25, kw, 0.26, { align: "center" }); });
  const base = cols[2].base, r0 = hy + 0.85, step = (base - 0.2 - r0) / 2;
  const row = (name, y, a, z, o = {}) => {
    if (o.key) slide.addShape("rect", { x: nx, y: y - 0.08, w: 0.16, h: 0.16, fill: { color: o.key }, line: { type: "none" } });
    t(name, nx + 0.24, y - 0.25, 1.24, 0.5, { valign: "middle", bold: o.bold });
    t(a, k1, y - 0.16, kw, 0.32, { align: "center", valign: "middle", bold: o.bold }); t(z, k2, y - 0.16, kw, 0.32, { align: "center", valign: "middle", bold: o.bold });
  };
  row("Fashion jewelry", r0, "23%", "18%", { key: DARK });
  slide.addShape("ellipse", { x: k1 + 0.03, y: r0 - 0.2, w: kw - 0.06, h: 0.4, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
  row("Fine jewelry", r0 + step, "4%", "5%", { key: LIGHT });
  slide.addShape("line", { x: nx, y: r0 + 1.5 * step, w: k2 + kw - nx, h: 0, line: { color: GREY, width: 0.75 } });
  row("Total", r0 + 2 * step, "4%", "7%", { bold: true });
}

// ---------- 2  CTF: revenue columns, 2018 column exploded into its segment split ----------
function ctfPanel(sl, b) {
  t("CTF's annual revenue", b.x + 0.33, b.y, 2.8, 0.27, { pt: 15 });
  t("CNY Billion", b.x + 0.33, b.y + 0.26, 2, 0.27, { pt: 15, italic: true });
  const ch = { x: b.x + 0.3, y: b.y + 1.05, w: 2.6, h: b.y + b.h - (b.y + 1.05) }, max = 56, plotH = 0.86;
  const cols = columns([{ name: "Revenue", labels: ["2013", "2018"], values: [47, 48] }], [MID], ch, { gap: 80, max, plotH, showValue: true });
  // CAGR callout over the two columns (the deck's growth arrow with a value in an ellipse)
  const ay = b.y + 0.72, x0 = cols[0].cx - 0.25, x1 = cols[1].cx + 0.25;
  slide.addShape("line", { x: x0, y: ay, w: x1 - x0, h: 0, line: { color: "000000", width: 1.5, endArrowType: "triangle" } });
  const ew = 1.25, ex = (x0 + x1) / 2 - ew / 2;
  slide.addShape("ellipse", { x: ex, y: ay - 0.19, w: ew, h: 0.38, fill: { color: "FFFFFF" }, line: { color: "000000", width: 1 } });
  t("CAGR 1%", ex, ay - 0.19, ew, 0.38, { bold: true, align: "center", valign: "middle" });

  // 100% bar of the 2018 revenue by segment
  const bx = b.x + 3.75, bw = 0.75, top = b.y + 0.72, base = cols[1].base, h = base - top;
  t("CTF's 2018 revenue", bx - 0.45, b.y, 2.9, 0.27, { pt: 15 });
  t("by segment, %", bx - 0.45, b.y + 0.26, 2.9, 0.27, { pt: 15 });
  const parts = [{ n: "Fashion jewelry", v: 11, f: DARK, tc: "FFFFFF" }, { n: "Fine jewelry", v: 89, f: LIGHT, tc: "000000" }];
  let y = top + 0.3; const hh = base - y;
  parts.forEach((p) => { const ph = hh * p.v / 100;
    slide.addShape("rect", { x: bx, y, w: bw, h: ph, fill: { color: p.f }, line: { color: "FFFFFF", width: 0.75 } });
    t(p.v + "%", bx, y, bw, ph, { align: "center", valign: "middle", color: p.tc });
    t(p.n, bx + bw + 0.12, y + ph / 2 - 0.27, b.x + b.w - bx - bw - 0.12, 0.54, { valign: "middle", bold: p.v === 89 });
    y += ph; });
  // dotted connectors from the 2018 column to the split
  const c = cols[1], rx = c.cx + c.bw / 2;
  slide.addShape("line", { x: rx, y: top + 0.3, w: bx - rx, h: c.top(48) - (top + 0.3), flipV: true, line: { color: GREY, width: 1, dashType: "sysDot" } });
  slide.addShape("line", { x: rx, y: base, w: bx - rx, h: 0, line: { color: GREY, width: 1, dashType: "sysDot" } });
}

// ---------- 3  three constraints in the grey band (the deck's band: chip + headline without a rule, grey band under it) ----------
function constraintsPanel() {
  const ps = L.HOUSE.STYLE.panel, cy = 5.09, s = ps.size;
  slide.addShape("ellipse", { x: 0.27, y: cy - s / 2, w: s, h: s, fill: { color: ps.fill }, line: { type: "none" } });
  t("3", 0.27, cy - s / 2, s, s, { pt: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  t("Major constraints limit the further development of fine jewelry", 0.65, cy - 0.2, 10, 0.4, { pt: ps.pt, bold: true, color: ps.colour, valign: "middle" });
  const g = { x: 0.65, y: 5.3, w: 13.07 - 0.65, h: 1.7 };
  slide.addShape("rect", { ...g, fill: { color: "F1F1F1" }, line: { type: "none" } });
  const items = [
    { icon: "users-group", label: "Customer changing preference", text: "New emerging customers value the fashion design more and show different preference" },
    { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption" },
    { icon: "trophy", label: "Increasingly fierce competition", text: "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment" },
  ];
  const ws = [0.32, 0.36, 0.32].map((k) => k * g.w);   // the middle label is the longest
  let x = g.x;
  items.forEach((it, i) => { const w = ws[i];
    if (i) slide.addShape("line", { x, y: g.y + 0.2, w: 0, h: g.h - 0.4, line: { color: GREY, width: 0.75 } });
    P.icon(slide, it.icon, x + 0.12, g.y + 0.16, 0.3, { color: GREY });
    t(it.label, x + 0.5, g.y + 0.12, w - 0.55, 0.4, { pt: 15, bold: true, valign: "middle" });
    t(it.text, x + 0.5, g.y + 0.58, w - 0.7, g.h - 0.7, { pt: 15, italic: true });
    x += w;
  });
}

S.composeSlide(pres, slide, {
  regions: { panels: [P1, P2] },
  panels: [
    { headline: "Fine jewelry has a lower growth rate", draw: marketPanel },
    { headline: "Fine jewelry accounts for the majority of CTF*", draw: ctfPanel },
  ],
});
constraintsPanel();
// the layout's title rule runs on through the gutter between the two top panels; the deck's panel rules stop there
slide.addShape("rect", { x: P1.x + P1.w + 0.01, y: 1.7, w: P2.x - P1.x - P1.w - 0.02, h: 0.08, fill: { color: "FFFFFF" }, line: { type: "none" } });
t("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.08, 8, 0.2, { pt: 10, italic: true, color: "585858" });
L.save(pres, __dirname + "/candidate.pptx");
