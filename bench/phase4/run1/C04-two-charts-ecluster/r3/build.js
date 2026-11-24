// C04 rebuild 3: market-analysis slide in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Layout: the deck's T2B1 situation form (two numbered chart panels on top, a grey icon band of three drivers below),
// taken from the deck's other T2B1 slide (slide-map: "situation | T2B1", slide 5) and its render, measured in inches.
// Style from Style/refs/Case-2019-E-Cluster.profile.json via the harness (master: band title, crumb, source, page number).
// The charts are drawn as shapes in the deck's think-cell look (labels above columns, CAGR table beside the stack,
// red circle on the key CAGR, oval CAGR callout on an arrow, dotted connectors into a 100% column).
// build.py then sets the title's left inset and line spacing, removes the master's stray rule and styles the page number.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P } = L.start({ ref: "Case-2019-E-Cluster", title: TITLE });

// deck colours (profile roles + colours measured on the deck's renders)
const K = { navy: "10366C", band: "202C4F", chip: "283954", light: "C1DBEB", grey: "C3C6CA", dgrey: "7E7E7E", sep: "A6A6A6",
  panel: "F1F1F1", red: "CC0000", text: "000000", foot: "585858", off: "BEBEBE" };
const F = "Arial";

function t(text, x, y, w, h, o = {}) {
  slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 15, color: o.color || K.text, bold: !!o.bold, italic: !!o.italic,
    underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true,
    lineSpacingMultiple: o.ls || undefined });
}
const rect = (x, y, w, h, color) => slide.addShape("rect", { x, y, w, h, fill: { color }, line: { type: "none" } });
const line = (x, y, w, h, color, width = 1, o = {}) => slide.addShape("line", { x, y, w, h, line: { color, width, dashType: o.dash, endArrowType: o.arrow }, flipV: !!o.flipV });

// ---- breadcrumb (current section bold navy, the others grey, grey arrows) ----
slide.addText([
  { text: "Market Overview: Market Analysis", options: { color: K.band } },
  { text: " → ", options: { color: "888EA1" } },
  { text: "Strategy Design", options: { color: K.off } },
  { text: " → ", options: { color: K.off } },
  { text: "Implementation", options: { color: K.off } },
], { x: 0.3, y: 0.09, w: 10.5, h: 0.3, fontFace: F, fontSize: 15, bold: true, margin: 0, valign: "top", isTextBox: true });

// ---- panel sub-headline: navy chip with number, bold navy sentence, navy rule under it ----
function head(n, text, cx, tx, y, rx2) {
  slide.addShape("ellipse", { x: cx, y: y + 0.03, w: 0.31, h: 0.31, fill: { color: K.chip }, line: { type: "none" } });
  t(String(n), cx, y + 0.03, 0.31, 0.31, { size: 15, color: "FFFFFF", align: "center", valign: "middle" });
  t(text, tx, y, rx2 - tx, 0.37, { size: 17, bold: true, color: K.navy, valign: "middle" });
  line(tx, y + 0.4, rx2 - tx, 0, K.navy, 1.5);
}
const BASE = 4.44;   // column baseline of the two top panels

// ================= 1  stacked columns + CAGR table =================
head(1, "Fine jewelry has a lower growth rate", 0.26, 0.64, 1.37, 6.38);
t("China fine jewelry annual market size and growth", 0.64, 1.88, 5.7, 0.26);
t("CNY Billion", 0.64, 2.12, 3, 0.26, { italic: true });
{
  const years = ["2013", "2018", "2023E"], fine = [53, 72, 99], fashion = [2, 2, 8];
  const k = 1.72 / 107, bw = 0.52, cx = [1.15, 2.05, 2.95];
  line(0.64, BASE, 3.0, 0, K.text, 1);
  years.forEach((yr, i) => {
    const hf = fine[i] * k, hs = fashion[i] * k, x = cx[i] - bw / 2;
    rect(x, BASE - hf, bw, hf, K.light);
    rect(x, BASE - hf - hs, bw, hs, K.navy);
    t(String(fine[i]), x - 0.2, BASE - hf / 2 - 0.13, bw + 0.4, 0.26, { align: "center", valign: "middle" });
    t(String(fine[i] + fashion[i]), x - 0.3, BASE - hf - hs - 0.3, bw + 0.6, 0.26, { align: "center", valign: "bottom" });
    t(String(fashion[i]), x + bw + 0.04, BASE - hf - hs + 0.01, 0.3, 0.24, { size: 14, color: K.navy, bold: true, valign: "middle" });
    t(yr, x - 0.3, BASE + 0.06, bw + 0.6, 0.26, { align: "center" });
  });
  // CAGR table: series names aligned with the stack, highlighted series in navy, red circle on the key rate
  const c1 = 5.08, c2 = 5.86, cw = 0.72, lx = 3.72;
  [["13-18", c1], ["18-23", c2]].forEach(([h, c]) => {
    t("CAGR", c - cw / 2, 2.4, cw, 0.25, { align: "center", underline: true });
    t(h, c - cw / 2, 2.64, cw, 0.25, { align: "center" });
  });
  const rows = [["Fashion jewelry", "23%", "18%", K.navy, true], ["Fine jewelry", "4%", "5%", K.text, false], ["Total", "4%", "7%", K.text, false]];
  rows.forEach(([name, a, b, col, bold], i) => {
    const y = 3.08 + i * 0.5;
    t(name, lx, y, 1.0 + 0.1, 0.46, { size: 15, color: col, bold, valign: "middle", ls: 0.9 });
    t(a, c1 - cw / 2, y, cw, 0.46, { color: col, bold, align: "center", valign: "middle" });
    t(b, c2 - cw / 2, y, cw, 0.46, { color: col, bold, align: "center", valign: "middle" });
  });
  line(lx, 4.06, c2 + cw / 2 - lx, 0, K.sep, 0.75);
  slide.addShape("ellipse", { x: c1 - 0.34, y: 3.08 + 0.5 + 0.03, w: 0.68, h: 0.4, fill: { type: "none" }, line: { color: K.red, width: 1.5 } });
}

// ================= 2  revenue columns -> 2018 split =================
head(2, "Fine jewelry accounts for the majority of CTF*", 6.88, 7.31, 1.37, 13.08);
t("CTF's annual revenue", 7.31, 1.88, 2.6, 0.26);
t("CNY Billion", 7.31, 2.12, 2.6, 0.26, { italic: true });
t("CTF's 2018 revenue by segment", 9.95, 1.88, 3.13, 0.26);
t("%", 9.95, 2.12, 1, 0.26, { italic: true });
{
  const k = 1.3 / 48, bw = 0.58, cx = [7.95, 9.0], rev = [47, 48], yrs = ["2013", "2018"];
  line(7.31, BASE, 3.75, 0, K.text, 1);
  rev.forEach((v, i) => {
    const h = v * k, x = cx[i] - bw / 2;
    rect(x, BASE - h, bw, h, K.grey);
    t(String(v), x - 0.2, BASE - h - 0.3, bw + 0.4, 0.26, { align: "center", valign: "bottom" });
    t(yrs[i], x - 0.2, BASE + 0.06, bw + 0.4, 0.26, { align: "center" });
  });
  // CAGR: arrow over the two columns with an oval callout (deck form: forecast slide)
  const ay = 2.64;
  line(cx[0] - 0.25, ay, cx[1] - cx[0] + 0.5, 0, K.text, 1.5, { arrow: "triangle" });
  slide.addShape("ellipse", { x: (cx[0] + cx[1]) / 2 - 0.6, y: ay - 0.19, w: 1.2, h: 0.38, fill: { color: "FFFFFF" }, line: { color: K.text, width: 1 } });
  t("CAGR 1%", (cx[0] + cx[1]) / 2 - 0.6, ay - 0.19, 1.2, 0.38, { size: 14, bold: true, align: "center", valign: "middle" });
  // 100% column of 2018 by segment, joined to the 2018 column by dotted lines
  const sx = 10.15, sw = 0.62, H = 1.86, top = BASE - H, hs = 0.11 * H;
  rect(sx, BASE - 0.89 * H, sw, 0.89 * H, K.light);
  rect(sx, top, sw, hs, K.navy);
  t("89", sx, BASE - 0.89 * H / 2 - 0.13, sw, 0.26, { align: "center", valign: "middle" });
  t("11", sx, top, sw, hs, { size: 14, color: "FFFFFF", align: "center", valign: "middle" });
  t("2018", sx - 0.2, BASE + 0.06, sw + 0.4, 0.26, { align: "center" });
  const rt = BASE - 48 * k;
  line(cx[1] + bw / 2, top, sx - cx[1] - bw / 2, rt - top, K.dgrey, 0.75, { dash: "sysDot", flipV: true });
  t("Fashion jewelry", sx + sw + 0.15, top - 0.08, 2.2, 0.3, { bold: true, color: K.navy, valign: "middle" });
  t("Fine jewelry", sx + sw + 0.15, BASE - 0.89 * H / 2 - 0.15, 2.2, 0.3, { valign: "middle" });
}

// ================= 3  three constraints in a grey band =================
head(3, "Major constraints limit the further development of fine jewelry", 0.26, 0.64, 4.86, 13.08);
{
  const x0 = 0.64, x1 = 13.08, y0 = 5.28, y1 = 7.0, ws = [3.9, 4.64, 3.9], xs = [x0, x0 + 3.9, x0 + 3.9 + 4.64];
  rect(x0, y0, x1 - x0, y1 - y0, K.panel);
  const items = [
    ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
    ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
    ["trophy", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
  ];
  items.forEach(([ic, lab, body], i) => {
    const x = xs[i], w = ws[i];
    if (i) line(x, y0 + 0.25, 0, y1 - y0 - 0.37, K.sep, 0.75);
    P.icon(slide, ic, x + 0.1, y0 + 0.26, 0.32, { color: K.dgrey });
    t(lab, x + 0.48, y0 + 0.12, w - 0.55, 0.6, { size: 16, bold: true, valign: "middle", ls: 0.9 });
    t(body, x + 0.6, y0 + 0.76, w - 0.72, 0.84, { italic: true });
  });
}

// ---- note, footer rule, source (as on every analysis slide of the deck) ----
t("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.05, 8, 0.19, { size: 10, italic: true, color: K.foot });
line(0.27, 7.26, 12.8, 0, K.band, 1);
slide.addText([{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }], { placeholder: "source" });

L.save(pres, __dirname + "/candidate.pptx");
