// C04 (deck as reference: Case-2019-E-Cluster), leave-one-out build.
// Style: the deck's profile (Style/refs/Case-2019-E-Cluster.profile.json) through the harness.
// Layout: T2B1 (two exhibits on top, one wide icon band below), the arrangement of the deck's slide 5
// (same layout code in the filtered slide map); panel boxes measured on its render (other-slides/05.png).
// Panel 1 is the deck's "stacked columns + CAGR table with the key CAGR circled in red"; panel 2 a revenue
// column pair with a CAGR callout (the deck's slide 16 form) beside a segment split; panel 3 the deck's grey
// band of three icon points with grey dividers (slide 5 panel 3).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-E-Cluster",
  title: TITLE,
  source: [{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }],
});

// deck colours, measured on the deck's own renders (other slides)
const NAVY = "10366C", LIGHT = "C1DBEB", RED = "CC0000", GREYBOX = "F1F1F1", DIV = "BFBFBF", ICON = "7E7E7E", INK = "000000";
const FONT = "Arial";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 15, color: o.color || INK, bold: !!o.bold, italic: !!o.italic,
  underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true, lineSpacingMultiple: o.ls, objectName: o.name });

// ---------- breadcrumb (deck form: bold, current section dark, the rest light grey, arrows between) ----------
slide.addText([
  { text: "Market Overview: Market Analysis", options: { color: "202C4F", bold: true } },
  { text: " → Strategy Design → Implementation", options: { color: "BEBEBE", bold: true } },
], { x: 0.3, y: 0.09, w: 10.5, h: 0.28, fontFace: FONT, fontSize: 15, margin: [0, 0, 0, 0], valign: "top", isTextBox: true });

// ---------- panel boxes (slide 5 arrangement) ----------
const P1 = { x: 0.29, y: 1.38, w: 6.12, h: 3.42 };
const P2 = { x: 6.88, y: 1.38, w: 6.18, h: 3.42 };
const P3 = { x: 0.29, y: 4.9, w: 12.77, h: 2.1 };

// sub-headline: numbered dark circle + bold heading in the deck's blue + rule under it
function head(n, text, b, rule = true) {
  const s = 0.31, hh = 0.36;
  slide.addShape("ellipse", { x: b.x, y: b.y + (hh - s) / 2, w: s, h: s, fill: { color: "283954" }, line: { type: "none" } });
  T(String(n), b.x, b.y + (hh - s) / 2, s, s, { size: 15, color: "FFFFFF", align: "center", valign: "middle" });
  T(text, b.x + s + 0.08, b.y, b.w - s - 0.08, hh, { size: 17, bold: true, color: NAVY, valign: "middle" });
  if (rule) slide.addShape("line", { x: b.x + s + 0.08, y: b.y + hh + 0.02, w: b.w - s - 0.08, h: 0, line: { color: NAVY, width: 1.5 } });
  return hh + 0.1;
}
const chartBase = { showLegend: false, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontFace: FONT, catAxisLabelFontSize: 14,
  catAxisLabelColor: INK, dataLabelFontFace: FONT, dataLabelFontSize: 14, catAxisLineShow: true, catAxisLineColor: INK };

// ================= Panel 1: stacked columns + CAGR table =================
{
  const b = P1; let y = b.y + head(1, "Fine jewelry has a lower growth rate", b);
  T("China fine jewelry annual market size and growth", b.x + 0.39, y, b.w - 0.39, 0.27);
  T("CNY Billion", b.x + 0.39, y + 0.26, 2.5, 0.27, { italic: true });
  const periods = ["2013", "2018", "2023E"], fine = [53, 72, 99], fashion = [2, 2, 8];
  // chart: fine jewelry (bottom, light), fashion jewelry (top, highlighted in navy); value axis fixed so labels can be placed
  const ch = { x: b.x + 0.25, y: y + 0.62, w: 3.05, h: b.y + b.h - (y + 0.62) };
  const lay = { x: 0.03, y: 0.1, w: 0.94, h: 0.76 }, MAX = 110;
  slide.addChart(pres.ChartType.bar, [
    { name: "Fine jewelry", labels: periods, values: fine },
    { name: "Fashion jewelry", labels: periods, values: fashion },
  ], { ...ch, ...chartBase, barDir: "col", barGrouping: "stacked", chartColors: [LIGHT, NAVY], barGapWidthPct: 55, valAxisMinVal: 0, valAxisMaxVal: MAX,
    showValue: false, layout: lay });
  // value labels: fine jewelry inside its segment, fashion jewelry above the column (too thin to hold its label)
  const px = ch.x + ch.w * lay.x, pw = ch.w * lay.w, py = ch.y + ch.h * lay.y, ph = ch.h * lay.h, cw = pw / 3;
  const top = (v) => py + ph * (1 - v / MAX);
  periods.forEach((_, i) => {
    const cx = px + cw * (i + 0.5);
    T(String(fine[i]), cx - 0.4, top(fine[i] / 2) - 0.14, 0.8, 0.28, { size: 14, align: "center", valign: "middle" });
    T(String(fashion[i]), cx - 0.4, top(fine[i] + fashion[i]) - 0.32, 0.8, 0.28, { size: 14, bold: true, color: NAVY, align: "center", valign: "middle" });
  });
  // CAGR table (rows in the order of the stack, top to bottom, plus the total)
  const tx = ch.x + ch.w + 0.1, nameW = 1.25, K = 0.78, ty = y + 0.6;
  ["13-18", "18-23"].forEach((h, j) => {
    T([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: h }], tx + nameW + j * K, ty, K, 0.54, { size: 15, align: "center" });
  });
  const rows = [["Fashion jewelry", "23%", "18%", true], ["Fine jewelry", "4%", "5%"], ["Total", "4%", "7%"]];
  const ry0 = ty + 0.6, rh = 0.5;
  rows.forEach(([name, a, c, hi], k) => {
    const yy = ry0 + k * rh;
    T(name, tx, yy, nameW, rh, { size: 15, valign: "middle", bold: name === "Total" });
    [a, c].forEach((v, j) => T(v, tx + nameW + j * K, yy, K, rh, { size: 15, align: "center", valign: "middle", bold: name === "Total" }));
    if (hi) slide.addShape("ellipse", { x: tx + nameW + 0.1, y: yy + 0.1, w: K - 0.2, h: rh - 0.2, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
  });
  slide.addShape("line", { x: tx, y: ry0 + 2 * rh + 0.02, w: nameW + 2 * K, h: 0, line: { color: INK, width: 0.75 } });
}

// ================= Panel 2: CTF revenue (columns + CAGR) and 2018 split by segment =================
{
  const b = P2; let y = b.y + head(2, "Fine jewelry accounts for the majority of CTF*", b);
  const lx = b.x + 0.39, lw = 2.6, rx = lx + lw + 0.3, rw = b.x + b.w - rx;
  // left: annual revenue
  T("CTF’s annual revenue", lx, y, lw, 0.27);
  T("CNY Billion", lx, y + 0.26, lw, 0.27, { italic: true });
  const ch = { x: lx, y: y + 0.62, w: lw, h: b.y + b.h - (y + 0.62) }, lay = { x: 0.06, y: 0.3, w: 0.88, h: 0.58 }, MAX = 48;
  slide.addChart(pres.ChartType.bar, [{ name: "Revenue", labels: ["2013", "2018"], values: [47, 48] }], { ...ch, ...chartBase, barDir: "col", chartColors: [NAVY], barGapWidthPct: 80,
    valAxisMinVal: 0, valAxisMaxVal: MAX, showValue: false, layout: lay });
  const px = ch.x + ch.w * lay.x, pw = ch.w * lay.w, py = ch.y + ch.h * lay.y, cwid = pw / 2;
  [47, 48].forEach((v, i) => T(String(v), px + cwid * (i + 0.5) - 0.4, py + ch.h * lay.h * (1 - v / MAX) - 0.32, 0.8, 0.28, { size: 14, align: "center", valign: "middle" }));
  // CAGR callout on an arrow over the columns (deck form: slide 16 panel 1)
  const ay = ch.y + 0.2;
  slide.addShape("line", { x: px + 0.05, y: ay, w: pw - 0.1, h: 0, line: { color: INK, width: 2, endArrowType: "triangle" } });
  slide.addShape("ellipse", { x: px + pw / 2 - 0.55, y: ay - 0.19, w: 1.1, h: 0.38, fill: { color: "FFFFFF" }, line: { color: INK, width: 1 } });
  T("CAGR 1%", px + pw / 2 - 0.55, ay - 0.19, 1.1, 0.38, { size: 14, bold: true, align: "center", valign: "middle" });
  // right: 2018 revenue by segment (one split into two parts: a pie), fashion jewelry in navy as in panel 1, labelled directly
  T("CTF’s 2018 revenue by segment", rx, y, rw, 0.54);
  const d = 1.7, pie = { x: rx, y: ch.y + (ch.h - d) / 2 + 0.05, w: d, h: d };
  slide.addChart(pres.ChartType.pie, [{ name: "2018 revenue", labels: ["Fashion jewelry", "Fine jewelry"], values: [11, 89] }], { ...pie, chartColors: [NAVY, LIGHT],
    showLegend: false, showValue: false, showPercent: false, showLabel: false, firstSliceAng: 70, dataBorder: { pt: 1, color: "FFFFFF" }, layout: { x: 0, y: 0, w: 1, h: 1 } });
  const cx = pie.x + d / 2, cy = pie.y + d / 2;
  T([{ text: "Fine jewelry", options: { breakLine: true } }, { text: "89%", options: { bold: true } }], cx - 0.7, cy + 0.2, 1.1, 0.55, { size: 14, align: "center", valign: "middle" });
  T([{ text: "Fashion jewelry", options: { breakLine: true } }, { text: "11%", options: { bold: true } }], pie.x + d + 0.12, cy - 0.3, rw - d - 0.12, 0.6, { size: 14, color: NAVY, valign: "middle" });
}

// ================= Panel 3: three constraints in a grey band with icons =================
{
  const b = P3; const y = b.y + head(3, "Major constraints limit the further development of fine jewelry", b, false);
  const box = { x: b.x + 0.36, y: 5.29, w: b.x + b.w - (b.x + 0.36), h: 7.0 - 5.29 };
  slide.addShape("rect", { ...box, fill: { color: GREYBOX }, line: { type: "none" } });
  const items = [
    ["users-group", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
    ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
    ["trophy", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
  ];
  const cw = box.w / 3;
  items.forEach(([ic, lab, txt], i) => {
    const x = box.x + i * cw;
    if (i) slide.addShape("line", { x, y: box.y + 0.12, w: 0, h: box.h - 0.24, line: { color: DIV, width: 0.75 } });
    P.icon(slide, ic, x + 0.13, box.y + 0.12, 0.3, { color: ICON });
    T(lab, x + 0.5, box.y + 0.08, cw - 0.6, 0.38, { size: 15, bold: true, valign: "middle" });
    T(txt, x + 0.5, box.y + 0.5, cw - 0.65, box.h - 0.6, { size: 15, italic: true });
  });
}

// full-width footer rule above the sources (on every content slide of the deck, 7.25 in)
slide.addShape("line", { x: 0, y: 7.25, w: 13.33, h: 0, line: { color: "202C4F", width: 0.75 } });
// note line above the sources (deck form: italic, grey, small)
T("Note: *CTF is the abbreviation for Chow Tai Fook.", 0.27, 7.06, 9, 0.2, { size: 10, italic: true, color: "585858" });

L.save(pres, __dirname + "/candidate.pptx");
