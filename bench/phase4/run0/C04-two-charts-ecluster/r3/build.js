// C04 rebuild 3: deck as reference (Case-2019-E-Cluster), leave-one-out.
// Approach: the deck's style profile (frame: navy title band, breadcrumb, source, page number) + a T2B1 arrangement
// taken from the closest OTHER slide of the deck with the same layout code (slide-map: slide 5, "situation | T2B1":
// stacked column with CAGR table | second exhibit | three icon driver cards in a grey band). Panel geometry measured
// on that slide's render (other-slides/05.png, 96 px per inch); exhibit forms from slides 5, 6 (100% stack with
// dashed connectors) and 16 (CAGR arrow with ellipse). Logo pictures come from slide 5's stored object (case19-ecluster-005).
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const JSZip = require(path.join(path.dirname(require.resolve("pptxgenjs")), "../../jszip"));
const ROOT = path.join(__dirname, "../../../../..");

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P } = L.start({
  ref: "Case-2019-E-Cluster", title: TITLE,
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const F = P.THEME.bodyFontFace;
// deck colours (profile roles / ranked colours, sampled on the deck's renders)
const NAVY = "10366C", CHIP = "283954", BLACK = "000000", WHITE = "FFFFFF", PANEL = "F1F1F1", DIV = "A6A6A6",
  LIGHT = "C1DBEB", MID = "354B70", GOLD = "FDBE28", RED = "CC0000", FOOT = "585858", LINE = "202C4F";
const BODY = 15;   // the deck's body size

const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || BODY, color: o.color || BLACK,
  bold: !!o.bold, italic: !!o.italic, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top",
  margin: o.margin ?? 0, isTextBox: true, lineSpacingMultiple: o.lsm });
const line = (x, y, w, h, color, width, o = {}) => slide.addShape("line", { x, y, w, h, flipV: !!o.flipV, line: { color, width, dashType: o.dash, endArrowType: o.arrow } });

// numbered panel head: ellipse chip + bold headline in the deck's panel colour, rule under it starting at the text
function head(n, text, x, y, w, o = {}) {
  const s = 0.26;
  slide.addShape("ellipse", { x, y: y + 0.07, w: s, h: s, fill: { color: CHIP }, line: { type: "none" } });
  T(String(n), x, y + 0.07, s, s, { size: 14, color: WHITE, align: "center", valign: "middle" });
  T(text, x + 0.35, y, w - 0.35, 0.4, { size: o.size || 17, bold: true, color: NAVY, valign: "middle" });
  if (o.rule !== false) line(x + 0.35, 1.745, w - 0.35, 0, NAVY, 1.56);
}

// ---------- panel 1: stacked columns + CAGR table (E-Cluster slide 5, panel 1) ----------
head(1, "Fine jewelry has a lower growth rate", 0.27, 1.34, 6.13);
T("China fine jewelry annual market size and growth", 0.62, 1.84, 5.8, 0.27);
T("CNY Billion", 0.62, 2.08, 3, 0.27, { italic: true });
const years = ["2013", "2018", "2023E"], fine = [53, 72, 99], fashion = [2, 2, 8];
const C1 = { x: 0.5, y: 2.3, w: 3.3, h: 2.62 }, LY = { x: 0.02, y: 0.13, w: 0.96, h: 0.75 }, MAX1 = 107;
slide.addChart(pres.ChartType.bar, [{ name: "Fine jewelry", labels: years, values: fine }, { name: "Fashion jewelry", labels: years, values: fashion }], {
  ...C1, barDir: "col", barGrouping: "stacked", chartColors: [NAVY, GOLD], showLegend: false, showValue: false, barGapWidthPct: 70,
  valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: MAX1, valGridLine: { style: "none" }, catGridLine: { style: "none" },
  catAxisLabelFontSize: BODY, catAxisLabelColor: BLACK, catAxisLabelFontFace: F, catAxisLineShow: true, catAxisLineColor: BLACK, catAxisMajorTickMark: "none", layout: LY });
// value labels on the plot geometry: total above, fine jewelry inside, fashion jewelry beside its (thin) segment
{
  const px = C1.x + LY.x * C1.w, pw = LY.w * C1.w, py = C1.y + LY.y * C1.h, ph = LY.h * C1.h, slot = pw / 3, bw = slot / 1.7;
  const yv = (v) => py + ph - (v / MAX1) * ph;
  years.forEach((_, i) => {
    const cx = px + slot * i + slot / 2, tot = fine[i] + fashion[i];
    T(String(tot), cx - 0.4, yv(tot) - 0.3, 0.8, 0.27, { align: "center" });
    T(String(fine[i]), cx - 0.4, yv(fine[i] / 2) - 0.14, 0.8, 0.28, { color: WHITE, align: "center", valign: "middle" });
    T(String(fashion[i]), cx + bw / 2 + 0.04, yv(tot) - 0.03, 0.3, 0.24, { size: 12, bold: true, color: BLACK, valign: "middle" });
  });
}
// CAGR table, rows level with the stack they describe
{
  const lx = 3.9, c1 = 4.95, c2 = 5.7, cw = 0.72;
  [["13-18", c1], ["18-23", c2]].forEach(([p, x]) => { T("CAGR", x, 2.3, cw, 0.26, { align: "center", underline: true }); T(p, x, 2.55, cw, 0.26, { align: "center" }); });
  const rows = [["Fashion jewelry", "23%", "18%", 2.95], ["Fine jewelry", "4%", "5%", 3.63], ["Total", "4%", "7%", 4.3]];
  rows.forEach(([name, a, b, y]) => {
    T(name, lx, y, 1.05, 0.56, { valign: "middle" });
    T(a, c1, y, cw, 0.56, { align: "center", valign: "middle" });
    T(b, c2, y, cw, 0.56, { align: "center", valign: "middle" });
  });
  line(lx, 4.25, c2 + cw - lx, 0, DIV, 0.75);
  slide.addShape("ellipse", { x: c1 + 0.04, y: 3.04, w: cw - 0.08, h: 0.38, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
  // colour keys beside the row names (the stack's two segments)
  slide.addShape("rect", { x: lx - 0.2, y: 3.16, w: 0.13, h: 0.13, fill: { color: GOLD }, line: { type: "none" } });
  slide.addShape("rect", { x: lx - 0.2, y: 3.84, w: 0.13, h: 0.13, fill: { color: NAVY }, line: { type: "none" } });
}

// ---------- panel 2: revenue columns with CAGR (slide 16) + 2018 split as a 100% stack linked by dashed lines (slide 6) ----------
head(2, "Fine jewelry accounts for the majority of CTF*", 6.86, 1.34, 6.22);
slide.addShape("rect", { x: 6.42, y: 1.7, w: 0.86, h: 0.09, fill: { color: WHITE }, line: { type: "none" } });   // break the layout's rule between the two panel heads
T("CTF's annual revenue", 7.21, 1.84, 2.6, 0.27);
T("CNY Billion", 7.21, 2.08, 2, 0.27, { italic: true });
const C2 = { x: 7.15, y: 2.3, w: 2.5, h: 2.62 }, MAX2 = 62, rev = [47, 48];
slide.addChart(pres.ChartType.bar, [{ name: "Revenue", labels: ["2013", "2018"], values: rev }], {
  ...C2, barDir: "col", chartColors: [MID], showLegend: false, showValue: false, barGapWidthPct: 70,
  valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: MAX2, valGridLine: { style: "none" }, catGridLine: { style: "none" },
  catAxisLabelFontSize: BODY, catAxisLabelColor: BLACK, catAxisLabelFontFace: F, catAxisLineShow: true, catAxisLineColor: BLACK, catAxisMajorTickMark: "none", layout: LY });
let bar18;
{
  const px = C2.x + LY.x * C2.w, pw = LY.w * C2.w, py = C2.y + LY.y * C2.h, ph = LY.h * C2.h, slot = pw / 2, bw = slot / 1.7;
  const yv = (v) => py + ph - (v / MAX2) * ph, cx = (i) => px + slot * i + slot / 2;
  rev.forEach((v, i) => T(String(v), cx(i) - 0.4, yv(v) - 0.3, 0.8, 0.27, { align: "center" }));
  // CAGR arrow over the two columns, rate in an ellipse (slide 16)
  const ay = yv(48) - 0.5;
  line(cx(0) - 0.15, ay + 0.06, cx(1) - cx(0) + 0.3, 0.12, BLACK, 1.75, { flipV: true, arrow: "triangle" });
  slide.addShape("ellipse", { x: (cx(0) + cx(1)) / 2 - 0.55, y: ay - 0.12, w: 1.1, h: 0.36, fill: { color: WHITE }, line: { color: BLACK, width: 1 } });
  T("CAGR 1%", (cx(0) + cx(1)) / 2 - 0.55, ay - 0.12, 1.1, 0.36, { size: 13, bold: true, align: "center", valign: "middle" });
  bar18 = { r: cx(1) + bw / 2, top: yv(48), bot: py + ph };
}
T("CTF's 2018 revenue by segment", 9.85, 1.84, 3.25, 0.27);
T("%, 2018", 9.85, 2.08, 2, 0.27, { italic: true });
{
  const x = 10.45, w = 0.72, top = 2.62, bot = bar18.bot, h = bot - top, hf = h * 0.11;
  slide.addShape("rect", { x, y: top, w, h: hf, fill: { color: GOLD }, line: { color: WHITE, width: 0.75 } });
  slide.addShape("rect", { x, y: top + hf, w, h: h - hf, fill: { color: NAVY }, line: { color: WHITE, width: 0.75 } });
  T("11%", x - 0.1, top, w + 0.2, hf, { size: 13, align: "center", valign: "middle" });
  T("89%", x, top + hf, w, h - hf, { color: WHITE, align: "center", valign: "middle" });
  line(bar18.r, top, x - bar18.r, bar18.top - top, DIV, 1, { dash: "sysDot", flipV: true });
  line(bar18.r, bot, x - bar18.r, 0, DIV, 1, { dash: "sysDot" });
  line(x - 0.25, bot, w + 0.5, 0, BLACK, 0.75);
  T("Fashion jewelry", x + w + 0.15, top - 0.05, 1.75, 0.3, { bold: true, valign: "middle" });
  T("Fine jewelry", x + w + 0.15, top + hf + (h - hf) / 2 - 0.15, 1.75, 0.3, { bold: true, valign: "middle" });
  line(x + w + 0.02, top + hf / 2, 0.11, 0, DIV, 0.75);
}

// ---------- panel 3: three constraint cards with icons in a grey band (slide 5, panel 3) ----------
head(3, "Major constraints limit the further development of fine jewelry", 0.27, 4.92, 12.8, { size: 16, rule: false });
const band = { x: 0.62, y: 5.32, w: 12.46, h: 1.66 };
slide.addShape("rect", { ...band, fill: { color: PANEL }, line: { type: "none" } });
const cols = [0.62, 4.75, 8.95, 13.08];
[1, 2].forEach((i) => line(cols[i], band.y + 0.14, 0, band.h - 0.28, DIV, 0.75));
const cards = [
  ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
  ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
  ["tag", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
];
cards.forEach(([ic, label, text], i) => {
  const x0 = cols[i], w = cols[i + 1] - x0;
  P.icon(slide, ic, x0 + 0.14, band.y + 0.13, 0.3, { color: "7E7E7E", width: 1.25 });
  T(label, x0 + 0.52, band.y + 0.08, w - 0.6, 0.4, { size: 16, bold: true, valign: "middle" });
  T(text, x0 + 0.52, band.y + 0.55, w - 0.72, 1.0, { italic: true });
});

// ---------- footer: note, rule over the source line, source (the deck's own footer) ----------
T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.03, 8, 0.2, { size: 10, italic: true, color: BLACK });
line(0, 7.25, 13.333, 0, LINE, 0.75);
slide.addText([{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }], { placeholder: "source" });

(async () => {
  // E-Cluster logo, top right, from the stored object of slide 5 (pictures at their original size and place)
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(ROOT, "Objects/store/media.zip")));
  const pic = async (name, x, y, w, h, ext) => slide.addImage({ data: `image/${ext};base64,` + (await zip.file(name).async("base64")), x, y, w, h });
  await pic("be0ee93660a28c8a.jpg", 11.558, 0.027, 0.337, 0.371, "jpeg");
  await pic("2062e202a8d83254.jpg", 11.915, 0.108, 1.118, 0.227, "jpeg");
  const out = __dirname + "/candidate.pptx";
  await L.save(pres, out);
  // title box: the layout puts it at x 0 with no inset, so the text touched the slide edge; the deck's titles start at
  // 0.36 in (glyph edge) with their cap tops at 0.53 in (measured on other-slides/05, 06, 07, 10, 16). Box kept at x 0,
  // text indented 0.34 in (paragraph margin, as the box itself has no inset in the profile), box moved up 0.1 in; on this slide only.
  const z = await JSZip.loadAsync(fs.readFileSync(out)), sp = "ppt/slides/slide1.xml", E = 914400;
  let x = await z.file(sp).async("string");
  x = x.replace(/(type="title"[\s\S]*?<a:xfrm>)<a:off x="(\d+)" y="\d+"\/>([\s\S]*?<a:bodyPr [^>]*?)lIns="0"/,
    `$1<a:off x="$2" y="${Math.round(0.465 * E)}"/>$3lIns="0"`)
    .replace(/(type="title"[\s\S]*?<a:pPr [^>]*?)marL="0"/, `$1marL="${Math.round(0.34 * E)}"`).replace(/(type="title"[\s\S]*?<a:bodyPr [^>]*?)rIns="0"/, `$1rIns="${Math.round(0.25 * E)}"`);
  z.file(sp, x);
  fs.writeFileSync(out, await z.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
})();
