// C04 rebuild 1: market-overview slide in the E-Cluster deck style (deck as reference, leave-one-out).
// Approach: E-Cluster style profile (master, title band, source line, page number) + native charts and generator helpers,
// arranged like the deck's other market-overview slide (two chart panels on top, a numbered icon band below, as on the
// "blue sea" slide and the financial-forecast slide). The deck logo is added by build.py from a stored object of another slide.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P, S } = L.start({ ref: "Case-2019-E-Cluster", title: TITLE,
  source: [{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }] });
const C = P.C, FONT = P.THEME.bodyFontFace;
const NAVY = "10366C", CHIP = "283954", LIGHT = "C1DBEB", MID = "63A4CC", RED = "CC0000", GREY = "585858", TXT = "000000";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 15, color: o.color || TXT, bold: !!o.bold,
  italic: !!o.italic, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true });

// ---- breadcrumb: current section bold in the deck's dark blue, the rest grey (deck form)
slide.addText([
  { text: "Market Overview: Market Analysis", options: { color: "202C4F" } },
  { text: " → Strategy Design → Implementation", options: { color: "BEBEBE" } }],
  { x: 0.3, y: 0.06, w: 9.5, h: 0.32, fontFace: FONT, fontSize: 15, bold: true, margin: 0, valign: "middle", isTextBox: true });

// ---- numbered panel headline: dark circle chip, bold blue sentence, blue rule (deck form)
function head(n, text, x, w, y = 1.42, rule = true, pt = 17) {
  slide.addShape("ellipse", { x: x, y: y + 0.01, w: 0.31, h: 0.31, fill: { color: CHIP }, line: { type: "none" } });
  T(String(n), x, y + 0.01, 0.31, 0.31, { pt: 15, color: "FFFFFF", align: "center", valign: "middle" });
  T(text, x + 0.4, y - 0.02, w - 0.4, 0.36, { pt, bold: true, color: NAVY, valign: "middle" });
  if (rule) slide.addShape("line", { x: x + 0.35, y: y + 0.33, w: w - 0.35, h: 0, line: { color: NAVY, width: 1.5 } });
}
const noAxes = { valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontSize: 15, catAxisLabelColor: TXT,
  catAxisLabelFontFace: FONT, catAxisLineShow: true, catAxisLineColor: "000000", dataLabelFontFace: FONT, showLegend: false };

// ================= Panel 1: market size, stacked columns + CAGR table =================
const p1 = { x: 0.27, w: 6.15 };
head(1, "Fine jewelry has a lower growth rate", p1.x, p1.w);
T("China fine jewelry annual market size and growth", p1.x + 0.35, 1.84, 5.8, 0.28);
T("CNY Billion", p1.x + 0.35, 2.1, 3, 0.28, { italic: true });
const yrs = ["2013", "2018", "2023E"], fine = [53, 72, 99], fashion = [2, 2, 8];
const tot = fine.map((v, i) => v + fashion[i]);
const ch1 = { x: 0.42, y: 2.42, w: 3.02, h: 2.36 };
slide.addChart(pres.ChartType.bar, [
  { name: "Fine jewelry", labels: yrs, values: fine },
  { name: "Fashion jewelry", labels: yrs, values: fashion }],
  { ...ch1, ...noAxes, barDir: "col", barGrouping: "stacked", chartColors: [LIGHT, NAVY], barGapWidthPct: 70, showValue: false,
    valAxisMinVal: 0, valAxisMaxVal: 125, layout: { x: 0.02, y: 0.0, w: 0.96, h: 0.84 } });
// totals above the stacks (drawn, so they sit on the whole stack)
const plotX = ch1.x + ch1.w * 0.02, plotW = ch1.w * 0.96, plotTop = ch1.y, plotH = ch1.h * 0.84;
tot.forEach((v, i) => { const cx = plotX + plotW * (i + 0.5) / 3, top = plotTop + plotH * (1 - v / 125);
  T(String(v), cx - 0.4, top - 0.3, 0.8, 0.28, { align: "center", valign: "bottom" }); });
// CAGR table: headers underlined, rows in stack order, the highlighted figure circled in red (deck form)
const cx0 = 3.66, nameW = 1.14, colW = 0.8;
[["CAGR", "13-18"], ["CAGR", "18-23"]].forEach((h, j) => {
  T(h[0], cx0 + nameW + j * colW, 2.42, colW, 0.26, { align: "center", underline: true });
  T(h[1], cx0 + nameW + j * colW, 2.68, colW, 0.26, { align: "center" }); });
const rows = [["Fashion jewelry", "23%", "18%"], ["Fine jewelry", "4%", "5%"], ["Total", "4%", "7%"]];
rows.forEach((r, k) => { const y = 3.07 + k * 0.56;
  T(r[0], cx0, y, nameW + 0.1, 0.5, { valign: "middle", bold: k === 0, color: k === 0 ? NAVY : TXT });
  T(r[1], cx0 + nameW, y, colW, 0.5, { align: "center", valign: "middle", bold: k === 0, color: k === 0 ? NAVY : TXT });
  T(r[2], cx0 + nameW + colW, y, colW, 0.5, { align: "center", valign: "middle", bold: k === 0, color: k === 0 ? NAVY : TXT });
  if (k === 2) slide.addShape("line", { x: cx0, y: y - 0.02, w: nameW + 2 * colW, h: 0, line: { color: "7E7E7E", width: 0.75, dashType: "dash" } }); });
slide.addShape("ellipse", { x: cx0 + nameW + 0.02, y: 3.07 + 0.04, w: colW - 0.04, h: 0.44, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
// legend chips beside the names
[[NAVY, 3.07], [LIGHT, 3.63]].forEach(([c, y]) => slide.addShape("rect", { x: cx0 - 0.2, y: y + 0.18, w: 0.14, h: 0.14, fill: { color: c }, line: { type: "none" } }));

// ================= Panel 2: CTF revenue, columns with CAGR + 2018 split =================
const p2 = { x: 6.86, w: 6.21 };
head(2, "Fine jewelry accounts for the majority of CTF*", p2.x, p2.w);
// white cut in the master's long header rule, so each panel keeps its own rule (as on the deck's two-panel slides)
slide.addShape("rect", { x: 6.43, y: 1.7, w: 0.77, h: 0.08, fill: { color: "FFFFFF" }, line: { type: "none" } });
T("CTF\u2019s annual revenue", p2.x + 0.35, 1.84, 2.4, 0.28);
T("CNY Billion", p2.x + 0.35, 2.1, 2.2, 0.28, { italic: true });
const ch2 = { x: 7.2, y: 2.42, w: 2.3, h: 2.36 }, MAX2 = 80;
slide.addChart(pres.ChartType.bar, [{ name: "Revenue", labels: ["2013", "2018"], values: [47, 48] }],
  { ...ch2, ...noAxes, barDir: "col", barGrouping: "clustered", chartColors: [MID], barGapWidthPct: 70, showValue: true, dataLabelPosition: "outEnd",
    dataLabelFontSize: 15, dataLabelColor: TXT, valAxisMinVal: 0, valAxisMaxVal: MAX2, layout: { x: 0.02, y: 0.0, w: 0.96, h: 0.84 } });
// CAGR arrow over the two columns with the rate in an oval (deck form: financial forecast slide)
const c2X = (i) => ch2.x + ch2.w * 0.02 + ch2.w * 0.96 * (i + 0.5) / 2, mid2 = (c2X(0) + c2X(1)) / 2;
slide.addShape("line", { x: c2X(0) - 0.3, y: 2.68, w: c2X(1) - c2X(0) + 0.6, h: 0, line: { color: "000000", width: 1.75, endArrowType: "triangle" } });
slide.addShape("ellipse", { x: mid2 - 0.62, y: 2.48, w: 1.24, h: 0.4, fill: { color: "FFFFFF" }, line: { color: "000000", width: 1 } });
T([{ text: "CAGR " }, { text: "1%", options: { bold: true } }], mid2 - 0.62, 2.48, 1.24, 0.4, { pt: 14, align: "center", valign: "middle" });
// thin divider between the two exhibits of panel 2
slide.addShape("line", { x: 9.62, y: 1.9, w: 0, h: 2.9, line: { color: "BFBFBF", width: 0.75 } });
// 2018 split as one 100% column with labels beside it (deck form: category-share columns)
T("CTF\u2019s 2018 revenue by segment", 9.75, 1.84, 3.32, 0.28);
T("%", 9.75, 2.1, 1, 0.28, { italic: true });
const ch3 = { x: 9.8, y: 2.42, w: 1.2, h: 2.36 }, segTop = ch3.y + 0.0, segH = ch3.h * 0.84;
slide.addChart(pres.ChartType.bar, [
  { name: "Fine jewelry", labels: ["2018"], values: [89] },
  { name: "Fashion jewelry", labels: ["2018"], values: [11] }],
  { ...ch3, ...noAxes, barDir: "col", barGrouping: "percentStacked", chartColors: [LIGHT, NAVY], barGapWidthPct: 30, showValue: false,
    layout: { x: 0.05, y: 0.0, w: 0.9, h: 0.84 } });
// values and names to the right of their segments, joined by thin leader lines
const segX = ch3.x + ch3.w * 0.95;
const barX = ch3.x + ch3.w * 0.05 + ch3.w * 0.9 * 0.15, barW = ch3.w * 0.9 * 0.7;   // the column itself (gap 30%)
[["Fashion jewelry", 11, segTop + segH * 0.055, false], ["Fine jewelry", 89, segTop + segH * (0.11 + 0.445), true]].forEach(([n, v, y, hi]) => {
  T(v + "%", barX, y - 0.15, barW, 0.3, { bold: true, color: hi ? TXT : "FFFFFF", align: "center", valign: "middle" });
  slide.addShape("line", { x: segX - 0.1, y, w: 0.3, h: 0, line: { color: "7E7E7E", width: 0.75 } });
  T(n, segX + 0.25, y - 0.2, 13.07 - segX - 0.25, 0.4, { valign: "middle", bold: hi, color: hi ? NAVY : TXT }); });

// ================= Panel 3: constraints, three icon points in a grey band =================
head(3, "Major constraints limit the further development of fine jewelry", 0.27, 12.8, 4.93, false, 16);
const band = { x: 0.62, y: 5.27, w: 12.45, h: 1.75 };
slide.addShape("rect", { ...band, fill: { color: "F1F1F1" }, line: { type: "none" } });
const pts = [
  { icon: "users", label: "Customer changing preference", text: "New emerging customers value the fashion design more and show different preference" },
  { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption" },
  { icon: "tag", label: "Increasingly fierce competition", text: "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment" }];
const cw = band.w / 3;
pts.forEach((p, i) => { const x = band.x + i * cw;
  if (i) slide.addShape("line", { x, y: band.y + 0.12, w: 0, h: band.h - 0.24, line: { color: "A6A6A6", width: 0.75 } });
  P.icon(slide, p.icon, x + 0.1, band.y + 0.14, 0.32, { color: "7E7E7E" });
  T(p.label, x + 0.48, band.y + 0.1, cw - 0.5, 0.4, { pt: 15.5, bold: true, valign: "middle" });
  T(p.text, x + 0.56, band.y + 0.58, cw - 0.72, band.h - 0.64, { italic: true }); });

// ---- note above the source line (deck form)
slide.addShape("line", { x: 0, y: 7.25, w: 13.333, h: 0, line: { color: "202C4F", width: 0.75 } });   // footer rule of the deck
T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.06, 8, 0.2, { pt: 10, italic: true, color: GREY });

L.save(pres, __dirname + "/candidate.pptx");
