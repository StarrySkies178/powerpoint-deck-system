// C04 (run0, rebuild 2): deck as reference, leave-one-out. Reference deck: Case-2019-E-Cluster.
// Approach: the deck's style profile through the harness (title band, crumb, source line, fonts, sizes), and the panel
// arrangement of the deck's closest OTHER slide in the slide map (slide 5: T2B1, stacked columns + CAGR table on the left,
// a second exhibit on the right, three icon columns in a grey band below), measured on its render (other-slides/05.png).
// Colours are the ones the deck renders (chart navy 10366C, light blue C1DBEA, grey band F1F1F1, icon grey 7E7E7E).
// The deck's logo comes from slide 5's stored object (case19-ecluster-005 media). build.py then fixes the title box,
// the band colour and a stray rule in the profile's master (see build.py).
const path = require("path"), fs = require("fs"), { execFileSync } = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, HOUSE } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const NAVY = "10366C", CHIP = (HOUSE.STYLE.panel && HOUSE.STYLE.panel.fill) || "283954", LIGHT = "C1DBEA", TEXT = "000000", RED = "CC0000", GREY = "7E7E7E", BAND = "F1F1F1", LINE = "202C4F";
const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 15, color: o.color || TEXT, bold: !!o.bold,
  italic: !!o.italic, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true });

// ---------- the deck's logo, top right (from the stored object of slide 5) ----------
const STORE = path.resolve(__dirname, "../../../../../Objects/store");
const media = (f) => { const p = path.join(__dirname, f); if (!fs.existsSync(p)) execFileSync("unzip", ["-o", "-j", "-q", path.join(STORE, "media.zip"), f, "-d", __dirname]); return p; };
slide.addImage({ path: media("be0ee93660a28c8a.jpg"), x: 11.557, y: 0.027, w: 0.3375, h: 0.371 });
slide.addImage({ path: media("2062e202a8d83254.jpg"), x: 11.915, y: 0.108, w: 1.118, h: 0.2275 });

// ---------- numbered panel head: chip ellipse + bold headline + rule under the headline (deck's form) ----------
function head(n, text, chipX, textX, ruleEnd, cy, o = {}) {
  const s = 0.31;
  slide.addShape("ellipse", { x: chipX, y: cy - s / 2, w: s, h: s, fill: { color: CHIP }, line: { type: "none" } });
  t(String(n), chipX, cy - s / 2, s, s, { size: 15, color: "FFFFFF", align: "center", valign: "middle" });
  t(text, textX, cy - 0.21, ruleEnd - textX, 0.4, { size: o.size || 17, bold: true, color: NAVY, valign: "middle" });
  if (o.rule !== false) slide.addShape("line", { x: textX, y: 1.755, w: ruleEnd - textX, h: 0, line: { color: NAVY, width: 1.5 } });
}
const noAxes = { valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontSize: 15, catAxisLabelColor: TEXT,
  catAxisLabelFontFace: FONT, catAxisLineShow: true, catAxisLineColor: "000000", showLegend: false, showValue: false };

// ---------- 1: market size, stacked columns + CAGR table ----------
head(1, "Fine jewelry has a lower growth rate", 0.26, 0.646, 6.375, 1.585);
t("China fine jewelry annual market size and growth", 0.646, 1.84, 5.75, 0.27);
t("CNY Billion", 0.646, 2.08, 2.5, 0.27, { italic: true });
const yrs = ["2013", "2018", "2023E"], fine = [53, 72, 99], fash = [2, 2, 8], VMAX = 108;
const cx = 0.55, cy = 2.45, cw = 3.15, ch = 2.4, lay = { x: 0.02, y: 0.1, w: 0.96, h: 0.78 };
slide.addChart(pres.ChartType.bar, [{ name: "Fine jewelry", labels: yrs, values: fine }, { name: "Fashion jewelry", labels: yrs, values: fash }], {
  x: cx, y: cy, w: cw, h: ch, barDir: "col", barGrouping: "stacked", chartColors: [LIGHT, NAVY], barGapWidthPct: 60,
  valAxisMaxVal: VMAX, valAxisMinVal: 0, layout: lay, ...noAxes });
// labels drawn beside the native chart: fine jewelry inside its segment, the thin highlighted fashion segment above its column
const px = cx + cw * lay.x, pw = cw * lay.w, py = cy + ch * lay.y, ph = ch * lay.h, slot = pw / 3, yv = (v) => py + ph * (1 - v / VMAX);
yrs.forEach((_, i) => {
  t(String(fine[i]), px + i * slot, (yv(fine[i]) + yv(0)) / 2 - 0.15, slot, 0.3, { align: "center", valign: "middle" });
  t(String(fash[i]), px + i * slot, yv(fine[i] + fash[i]) - 0.32, slot, 0.3, { bold: true, color: NAVY, align: "center", valign: "bottom" });
});
// CAGR table: header underlined, rows level with their part of the stack, the slow fine-jewelry rate circled in red
const nx = 3.74, nw = 1.24, kw = 0.7, k0 = nx + nw;
[["CAGR", "13-18"], ["CAGR", "18-23"]].forEach(([a, b], j) => {
  t(a, k0 + j * kw, 2.33, kw, 0.26, { underline: true, align: "center" });
  t(b, k0 + j * kw, 2.58, kw, 0.26, { align: "center" });
});
[["Fashion jewelry", "23%", "18%", 3.02, true], ["Fine jewelry", "4%", "5%", 3.7, false], ["Total", "4%", "7%", 4.28, false]].forEach(([name, a, b, y, hi]) => {
  const o = { bold: hi, color: hi ? NAVY : TEXT, valign: "middle" };
  t(name, nx, y, nw, 0.52, o);
  t(a, k0, y, kw, 0.52, { ...o, align: "center" });
  t(b, k0 + kw, y, kw, 0.52, { ...o, align: "center" });
});
slide.addShape("line", { x: nx, y: 4.24, w: nw + 2 * kw, h: 0, line: { color: "A6A6A6", width: 0.75 } });
slide.addShape("ellipse", { x: k0 + 0.06, y: 3.73, w: kw - 0.12, h: 0.46, fill: { type: "none" }, line: { color: RED, width: 1.5 } });

// ---------- 2: CTF revenue (flat) + 2018 revenue split ----------
head(2, "Fine jewelry accounts for the majority of CTF*", 6.875, 7.31, 13.07, 1.585);
t("CTF’s annual revenue", 7.31, 1.84, 2.5, 0.27);
t("CNY Billion", 7.31, 2.08, 2.5, 0.27, { italic: true });
const rx = 7.2, ry = 2.45, rw = 2.6, rh = 2.4, rl = { x: 0.04, y: 0.27, w: 0.92, h: 0.61 }, RMAX = 50;
slide.addChart(pres.ChartType.bar, [{ name: "CTF revenue", labels: ["2013", "2018"], values: [47, 48] }], {
  x: rx, y: ry, w: rw, h: rh, barDir: "col", barGrouping: "clustered", chartColors: [NAVY], barGapWidthPct: 70,
  valAxisMaxVal: RMAX, valAxisMinVal: 0, layout: rl, ...noAxes });
const rpx = rx + rw * rl.x, rslot = rw * rl.w / 2, rpy = ry + rh * rl.y, rph = rh * rl.h;
[47, 48].forEach((v, i) => t(String(v), rpx + i * rslot, rpy + rph * (1 - v / RMAX) - 0.3, rslot, 0.28, { align: "center", valign: "bottom" }));
// CAGR callout: arrow over the two columns with the rate in an oval (the deck's growth callout, slide 16)
const ay = 2.68, ac = rpx + 0.05, ae = rpx + rslot * 2 - 0.05, om = (ac + ae) / 2;
slide.addShape("line", { x: ac, y: ay, w: ae - ac, h: 0, line: { color: TEXT, width: 1.5, endArrowType: "triangle" } });
slide.addShape("ellipse", { x: om - 0.55, y: ay - 0.19, w: 1.1, h: 0.38, fill: { color: "FFFFFF" }, line: { color: TEXT, width: 1 } });
t("CAGR 1%", om - 0.55, ay - 0.19, 1.1, 0.38, { size: 13, bold: true, align: "center", valign: "middle" });
// 2018 split: one 100% column, fine jewelry's share inside, fashion jewelry's beside it on a leader line
t("CTF’s 2018 revenue by segment", 9.95, 1.84, 3.15, 0.27);
t("%", 9.95, 2.08, 1, 0.27, { italic: true });
const sx = 9.95, sy = 2.45, sw = 1.4, sh = 2.4, sl = { x: 0.1, y: 0.1, w: 0.8, h: 0.78 };
slide.addChart(pres.ChartType.bar, [{ name: "Fine jewelry", labels: ["2018"], values: [89] }, { name: "Fashion jewelry", labels: ["2018"], values: [11] }], {
  x: sx, y: sy, w: sw, h: sh, barDir: "col", barGrouping: "percentStacked", chartColors: [LIGHT, NAVY], barGapWidthPct: 35, layout: sl, ...noAxes });
const spy = sy + sh * sl.y, sph = sh * sl.h, sxr = sx + sw * (sl.x + sl.w) - sw * sl.w * (0.35 / 2.7) * 0.5;
t("89%", sx + sw * sl.x, spy + sph * 0.11 + sph * 0.445 - 0.15, sw * sl.w, 0.3, { align: "center", valign: "middle" });
t("Fine jewelry", 11.5, spy + sph * 0.11 + sph * 0.445 - 0.15, 1.6, 0.3, { valign: "middle" });
slide.addShape("line", { x: sxr, y: spy + sph * 0.055, w: 11.45 - sxr, h: 0, line: { color: GREY, width: 0.75 } });
t([{ text: "11%", options: { bold: true, color: NAVY, breakLine: true } }, { text: "Fashion jewelry", options: { bold: true, color: NAVY } }], 11.5, spy + sph * 0.055 - 0.2, 1.6, 0.52, { valign: "middle" });

// ---------- 3: three constraints, icon columns in the grey band ----------
head(3, "Major constraints limit the further development of fine jewelry", 0.26, 0.646, 10, 5.07, { size: 16, rule: false });
const gx = 0.656, gy = 5.29, gw = 13.07 - gx, gh = 1.71, colw = gw / 3;
slide.addShape("rect", { x: gx, y: gy, w: gw, h: gh, fill: { color: BAND }, line: { type: "none" } });
[["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
 ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
 ["trophy", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
].forEach(([ic, label, body], i) => {
  const x = gx + i * colw;
  if (i) slide.addShape("line", { x, y: gy + 0.12, w: 0, h: gh - 0.24, line: { color: GREY, width: 0.75 } });
  P.icon(slide, ic, x + 0.13, gy + 0.15, 0.3, { color: GREY });
  t(label, x + 0.5, gy + 0.1, colw - 0.55, 0.4, { bold: true, valign: "middle" });
  t(body, x + 0.6, gy + 0.55, colw - 0.75, gh - 0.62, { italic: true });
});

// note above the footer rule, and the rule over the source line, as the deck has them
t("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.06, 8, 0.19, { size: 10, italic: true, color: "585858" });
slide.addShape("line", { x: 0, y: 7.255, w: 13.333, h: 0, line: { color: LINE, width: 0.75 } });

L.save(pres, __dirname + "/candidate.pptx");
