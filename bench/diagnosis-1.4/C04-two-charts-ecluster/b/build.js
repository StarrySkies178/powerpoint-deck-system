// C04 variant b: Chow Tai Fook market-entry slide in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Layout follows the layout description: tracker + logo, title band, two numbered chart panels side by side,
// a numbered three-box constraint row in a grey box, note + rule + sources + page.
// Style: Style/refs/Case-2019-E-Cluster.profile.json (through the harness), plus the panel furniture measured on the
// deck's slide 5 (T2B1 sibling: chip ellipse 0.31 in, 17 pt bold headings in 10366C with a 1.56 pt rule, 14 pt chart text,
// italic unit lines, C1DBEA / 10366C column fills, red hand-drawn ellipse on the key CAGR, F1F1F1 driver box with
// A6A6A6 dividers, 16 pt bold heading + italic description per driver, 202C4F footer rule).
const path = require("path"), fs = require("fs"), os = require("os"), { execFileSync } = require("child_process");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P } = L.start({
  ref: "Case-2019-E-Cluster", title: TITLE,
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const FONT = P.THEME.bodyFontFace;
const BLUE = "10366C", CHIP = "283954", LIGHT = "C1DBEA", BOX = "F1F1F1", DIV = "A6A6A6", RED = "CC0000", DARK = "202C4F", GREY = "585858", ICON = "7E7E7E";

// ---------- small helpers ----------
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || "000000", bold: !!o.bold,
  italic: !!o.italic, underline: o.u ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true, lineSpacingMultiple: o.ls });
const line = (x, y, w, h, color, width, o = {}) => slide.addShape("line", { x, y, w, h, flipH: !!o.flipH, line: { color, width, endArrowType: o.arrow, dashType: o.dash } });
function heading(n, text, x, y, ruleX, ruleW) {           // numbered circle + bold heading + underline rule (deck's panel head)
  slide.addShape("ellipse", { x, y, w: 0.31, h: 0.31, fill: { color: CHIP }, line: { type: "none" } });
  T(String(n), x, y, 0.31, 0.31, { pt: 15, color: "FFFFFF", align: "center", valign: "middle" });
  T(text, x + 0.35, y - 0.02, ruleX + ruleW - x - 0.35, 0.36, { pt: 17, bold: true, color: BLUE, valign: "middle" });
  line(ruleX, y + 0.33, ruleW, 0, BLUE, 1.56);
}
// native column chart with the plot filling its box (axes hidden), so bar positions are known for the labels drawn around it
function columns(box, cats, series, max, gap, o = {}) {
  slide.addChart(pres.ChartType.bar, series.map((s) => ({ name: s.name, labels: cats, values: s.values })), {
    ...box, barDir: "col", barGrouping: o.grouping || "stacked", chartColors: series.map((s) => s.color), barGapWidthPct: gap,
    valAxisHidden: true, catAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, showValue: !!o.inside, dataLabelPosition: "ctr", dataLabelFontSize: 14, dataLabelColor: "000000", dataLabelFontFace: FONT,
    dataLabelFormatCode: "#,##0;;;", layout: { x: 0, y: 0, w: 1, h: 1 }, ...(o.inside ? {} : {}),
  });
  const cw = box.w / cats.length, bw = cw / (1 + gap / 100);
  return { cx: (i) => box.x + cw * (i + 0.5), bw, yOf: (v) => box.y + box.h * (1 - v / max), base: box.y + box.h };
}
function axisBreak(x, y) {                                   // "//" break mark on an axis line
  slide.addShape("rect", { x: x - 0.06, y: y - 0.06, w: 0.12, h: 0.12, fill: { color: "FFFFFF" }, line: { type: "none" } });
  line(x - 0.07, y - 0.08, 0.06, 0.16, "000000", 0.75, { flipH: true });
  line(x + 0.01, y - 0.08, 0.06, 0.16, "000000", 0.75, { flipH: true });
}

// ---------- top strip: logo at the far right (E-Cluster mark, taken from the deck's slide 5 frame) ----------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "c04b-"));
execFileSync("python3", ["-I", "-c", `
import sys
from pptx import Presentation
p = Presentation(sys.argv[1])
for g in p.slides[4].shapes:
    if g.name == "object 9":
        for s in g.shapes: open(sys.argv[2] + "/" + s.name.replace(" ", "_") + ".jpg", "wb").write(s.image.blob)
`, path.resolve(__dirname, "../../../../Templates/Case-2019-E-Cluster.pptx"), tmp]);
slide.addImage({ path: tmp + "/object_11.jpg", x: 11.56, y: 0.03, w: 0.34, h: 0.37, altText: "E-Cluster logo mark" });
slide.addImage({ path: tmp + "/object_10.jpg", x: 11.91, y: 0.11, w: 1.12, h: 0.23, altText: "E-Cluster" });

// ---------- panel 1: market size stacked columns + CAGR table ----------
heading(1, "Fine jewelry has a lower growth rate", 0.27, 1.43, 0.64, 5.75);
T("China fine jewelry annual market size and growth", 0.62, 1.86, 5.6, 0.27);
T("CNY Billion", 0.62, 2.12, 2.0, 0.27, { italic: true });
{
  const fine = [53, 72, 99], fash = [2, 2, 8], yrs = ["2013", "2018", "2023E"];
  const g = columns({ x: 0.62, y: 2.85, w: 3.0, h: 1.7 }, yrs, [{ name: "Fine jewelry", values: fine, color: LIGHT }, { name: "Fashion jewelry", values: fash, color: BLUE }], 107, 60);
  line(0.55, g.base, 3.14, 0, "000000", 0.72);
  yrs.forEach((y, i) => {
    T(String(fine[i] + fash[i]), g.cx(i) - 0.4, g.yOf(fine[i] + fash[i]) - 0.3, 0.8, 0.27, { align: "center" });
    T(y, g.cx(i) - 0.45, g.base + 0.05, 0.9, 0.27, { align: "center" });
    T(String(fine[i]), g.cx(i) - 0.4, g.yOf(fine[i] / 2) - 0.13, 0.8, 0.27, { align: "center" });
    if (i) axisBreak((g.cx(i - 1) + g.cx(i)) / 2, g.base);
  });
  // CAGR table: two period columns, three rows, row labels on the left; one cell circled by hand
  const lx = 3.95, c1 = 5.08, c2 = 5.78, cw = 0.62, r0 = 3.2, rh = 0.5;
  T("CAGR\n13-18", c1, 2.5, cw, 0.5, { align: "center", u: true });
  T("CAGR\n18-23", c2, 2.5, cw, 0.5, { align: "center", u: true });
  [["Fashion jewelry", "23%", "18%"], ["Fine jewelry", "4%", "5%"], ["Total", "4%", "7%"]].forEach(([lab, a, b], k) => {
    const y = r0 + k * rh, tot = k === 2;
    if (!tot) slide.addShape("rect", { x: lx, y: y + rh / 2 - 0.07, w: 0.14, h: 0.14, fill: { color: k ? LIGHT : BLUE }, line: { type: "none" } });
    T(lab, lx + 0.2, y, 0.95, rh, { pt: 12, valign: "middle", bold: !k, color: k ? "000000" : BLUE });
    T(a, c1, y, cw, rh, { align: "center", valign: "middle" });
    T(b, c2, y, cw, rh, { align: "center", valign: "middle" });
  });
  line(lx, r0 + 2 * rh - 0.02, c2 + cw - lx, 0, DIV, 0.75);
  slide.addShape("ellipse", { x: c1 + 0.02, y: r0 + rh + 0.06, w: cw - 0.04, h: rh - 0.12, rotate: -6, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
}

// ---------- panel 2: CTF revenue (two columns + CAGR oval) | 2018 revenue by segment (100% column) ----------
heading(2, "Fine jewelry accounts for the majority of CTF*", 6.86, 1.43, 7.3, 5.78);
line(9.98, 1.95, 0, 2.95, DIV, 0.75);
T("CTF's annual revenue", 7.21, 1.86, 2.7, 0.27);
T("CNY Billion", 7.21, 2.12, 2.0, 0.27, { italic: true });
{
  const v = [47, 48], yrs = ["2013", "2018"];
  const g = columns({ x: 7.45, y: 3.25, w: 2.2, h: 1.3 }, yrs, [{ name: "CTF revenue", values: v, color: BLUE }], 52, 70);
  line(7.35, g.base, 2.4, 0, "000000", 0.72);
  yrs.forEach((y, i) => { T(String(v[i]), g.cx(i) - 0.4, g.yOf(v[i]) - 0.3, 0.8, 0.27, { align: "center" }); T(y, g.cx(i) - 0.4, g.base + 0.05, 0.8, 0.27, { align: "center" }); });
  axisBreak((g.cx(0) + g.cx(1)) / 2, g.base);
  const ay = g.yOf(48) - 0.55;
  line(g.cx(0) - 0.15, ay + 0.12, g.cx(1) - g.cx(0) + 0.3, -0.12, "000000", 1.5, { arrow: "triangle" });
  slide.addShape("ellipse", { x: (g.cx(0) + g.cx(1)) / 2 - 0.36, y: ay - 0.33, w: 0.72, h: 0.3, fill: { color: "FFFFFF" }, line: { color: "000000", width: 1 } });
  T("+1%", (g.cx(0) + g.cx(1)) / 2 - 0.36, ay - 0.33, 0.72, 0.3, { pt: 12, bold: true, align: "center", valign: "middle" });
  T("CAGR", (g.cx(0) + g.cx(1)) / 2 + 0.38, ay - 0.33, 0.6, 0.3, { pt: 10, color: GREY, valign: "middle" });
}
T("CTF's 2018 revenue by segment", 10.12, 1.86, 2.95, 0.27);
T("%", 10.12, 2.12, 1.0, 0.27, { italic: true });
{
  const g = columns({ x: 11.15, y: 2.6, w: 1.0, h: 1.95 }, ["2018"], [{ name: "Fine jewelry", values: [89], color: LIGHT }, { name: "Fashion jewelry", values: [11], color: BLUE }], 100, 40);
  line(10.95, g.base, 1.4, 0, "000000", 0.72);
  T("2018", g.cx(0) - 0.4, g.base + 0.05, 0.8, 0.27, { align: "center" });
  const yFa = g.yOf(94.5), yFi = g.yOf(44.5), xr = g.cx(0) + g.bw / 2;
  T("Fashion jewelry", 10.12, yFa - 0.25, 0.95, 0.5, { pt: 12, color: BLUE, bold: true, align: "right", valign: "middle" });
  T("Fine jewelry", 10.12, yFi - 0.25, 0.95, 0.5, { pt: 12, align: "right", valign: "middle" });
  [[yFa, "11%"], [yFi, "89%"]].forEach(([y, t]) => { line(xr - 0.1, y, 0.35, 0, "000000", 0.75); T(t, xr + 0.3, y - 0.14, 0.6, 0.27, { bold: t === "11%" }); });
  // break mark across the column: the fine-jewelry share is cut to fit
  const by = g.yOf(25), bx = g.cx(0) - g.bw / 2 - 0.08, bw = g.bw + 0.16;
  slide.addShape("parallelogram", { x: bx, y: by - 0.06, w: bw, h: 0.1, fill: { color: "FFFFFF" }, line: { type: "none" } });
  line(bx, by + 0.04, bw, -0.1, "000000", 0.75); line(bx, by + 0.1, bw, -0.1, "000000", 0.75);
}

// ---------- panel 3: three constraints in a grey box ----------
heading(3, "Major constraints limit the further development of fine jewelry", 0.27, 4.91, 0.64, 12.45);
slide.addShape("rect", { x: 0.64, y: 5.27, w: 12.45, h: 1.72, fill: { color: BOX }, line: { type: "none" } });
line(0.64, 5.26, 12.45, 0, BLUE, 1.56);
const cons = [
  ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
  ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
  ["trophy", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
];
const cw3 = 12.45 / 3;
cons.forEach(([ic, head, body], i) => {
  const x = 0.64 + i * cw3;
  if (i) line(x, 5.45, 0, 1.38, DIV, 0.48);
  P.icon(slide, ic, x + 0.15, 5.4, 0.38, { color: ICON, width: 1.25 });
  T(head, x + 0.62, 5.33, cw3 - 0.75, 0.52, { pt: 15, bold: true, valign: "middle" });
  T(body, x + 0.62, 5.9, cw3 - 0.8, 1.05, { pt: 14, italic: true });
});

// ---------- footer: note, rule, sources (placeholder, italic as the deck sets it), page number from the master ----------
T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.03, 6.0, 0.2, { pt: 10, italic: true, color: GREY });
line(0, 7.25, 13.33, 0, DARK, 1);
slide.addText([{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }], { placeholder: "source" });

L.save(pres, __dirname + "/candidate.pptx").then(() => fs.rmSync(tmp, { recursive: true, force: true }));
