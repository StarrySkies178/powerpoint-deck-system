// C04 rebuild (run5 r1): deck as reference, Case-2019-E-Cluster style profile.
// Layout: T2B1 as the deck's other market-overview slide uses it (two chart panels on top, a grey band of three
// icon points below), panel geometry read off the deck's rendered slides; chips, headlines and rules from the profile (subhead).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, S } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
    source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
    crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
  });
  const C = P.C, FONT = P.THEME.bodyFontFace;
  const DARK = "10366C", LIGHT = "C1DBEB", RED = "CC0000", GREY = "7E7E7E", NOTE = "585858";
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 15, color: o.color || C.text, bold: !!o.bold, italic: !!o.italic,
    underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true });
  const noAxis = { valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontSize: 15, catAxisLabelColor: C.text,
    catAxisLabelFontFace: FONT, catAxisLineShow: true, catAxisLineColor: GREY, showLegend: false };

  // ---------- panel geometry (inches) ----------
  const top = 1.35, X1 = 0.27, W1 = 6.1, X2 = 6.85, W2 = 13.07 - 6.85, Y3 = 4.92, W3 = 13.07 - 0.27;

  // ---------- 1. market: stacked columns with totals + CAGR table ----------
  let y = top + S.subhead(slide, 1, "Fine jewelry has a lower growth rate", X1, top, W1);
  T("China fine jewelry annual market size and growth", X1 + 0.05, y, W1, 0.28);
  T("CNY Billion", X1 + 0.05, y + 0.27, 3, 0.28, { italic: true });
  const years = ["2013", "2018", "2023E"], totals = [532, 722, 998], fashShare = [0.15, 0.18, 0.24];
  const fashion = totals.map((t, i) => Math.round(t * fashShare[i])), fine = totals.map((t, i) => t - fashion[i]);
  const ch = { x: X1, y: y + 0.6, w: 3.2, h: 4.85 - (y + 0.6) }, lay = { x: 0.04, y: 0.13, w: 0.92, h: 0.74 }, VMAX = 1000;
  slide.addChart(pres.ChartType.bar, [{ name: "Fine jewelry", labels: years, values: fine }, { name: "Fashion jewelry", labels: years, values: fashion }], {
    ...ch, ...noAxis, barDir: "col", barGrouping: "stacked", chartColors: [LIGHT, DARK], barGapWidthPct: 60, showValue: false,
    valAxisMinVal: 0, valAxisMaxVal: VMAX, layout: lay });
  const px = ch.x + ch.w * lay.x, pw = ch.w * lay.w, py = ch.y + ch.h * lay.y, ph = ch.h * lay.h;
  totals.forEach((t, i) => T(String(t), px + pw * (i + 0.5) / 3 - 0.45, py + ph * (1 - t / VMAX) - 0.34, 0.9, 0.3, { align: "center", valign: "bottom" }));
  // CAGR table beside the stack: rows top→bottom as the stack, total under a rule; the key value circled in red
  const tx = X1 + 3.3, nameW = 1.3, K = 0.75;
  ["13-18", "18-23"].forEach((h, j) => {
    T("CAGR", tx + nameW + j * K, y + 0.5, K, 0.28, { align: "center", underline: true });
    T(h, tx + nameW + j * K, y + 0.78, K, 0.28, { align: "center" });
  });
  const rows = [["Fashion jewelry", ["9%", "13%"], DARK], ["Fine jewelry", ["4%", "5%"], LIGHT], ["Total", ["4%", "7%"], null]];
  const r0 = y + 1.15, rh = 0.55;
  rows.forEach(([name, v, col], k) => {
    const ry = r0 + k * rh + (k === 2 ? 0.1 : 0);
    if (k === 2) slide.addShape("line", { x: tx, y: ry - 0.06, w: nameW + 2 * K, h: 0, line: { color: GREY, width: 0.75 } });
    if (col) slide.addShape("rect", { x: tx, y: ry + rh / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: col }, line: { type: "none" } });
    T(name, tx + (col ? 0.22 : 0), ry, nameW - (col ? 0.22 : 0), rh, { valign: "middle", bold: k === 2 });
    v.forEach((s, j) => T(s, tx + nameW + j * K, ry, K, rh, { align: "center", valign: "middle", bold: k === 2 }));
  });
  slide.addShape("ellipse", { x: tx + nameW + 0.04, y: r0 + rh + 0.1, w: K - 0.08, h: rh - 0.2, fill: { type: "none" }, line: { color: RED, width: 1.5 } });

  // ---------- 2. CTF: revenue columns with CAGR, 2018 revenue split ----------
  y = top + S.subhead(slide, 2, "Fine jewelry accounts for the majority of CTF*", X2, top, W2);
  const aW = 3.2, bX = X2 + aW + 0.35, bW = X2 + W2 - bX;
  T("CTF’s annual revenue", X2 + 0.05, y, aW, 0.28);
  T("CNY Billion", X2 + 0.05, y + 0.27, 2, 0.28, { italic: true });
  const rc = { x: X2, y: y + 0.6, w: aW, h: 4.85 - (y + 0.6) }, rl = { x: 0.12, y: 0.3, w: 0.76, h: 0.57 }, RMAX = 60;
  slide.addChart(pres.ChartType.bar, [{ name: "Revenue", labels: ["2013", "2018"], values: [47, 48] }], {
    ...rc, ...noAxis, barDir: "col", chartColors: ["354B70"], barGapWidthPct: 70, showValue: true, dataLabelPosition: "outEnd",
    dataLabelFontSize: 15, dataLabelColor: C.text, dataLabelFontFace: FONT, valAxisMinVal: 0, valAxisMaxVal: RMAX, layout: rl });
  // CAGR callout: arrow over the two columns with the rate in an oval (form: the deck's financial-forecast slide)
  const rpx = rc.x + rc.w * rl.x, rpw = rc.w * rl.w, rpy = rc.y + rc.h * rl.y, cx = (i) => rpx + rpw * (i + 0.5) / 2;
  const ay = rpy - 0.25;
  slide.addShape("line", { x: cx(0), y: ay, w: cx(1) - cx(0), h: 0, line: { color: C.text, width: 1.5, endArrowType: "triangle" } });
  const ow = 1.3, oh = 0.4, ox = (cx(0) + cx(1)) / 2 - ow / 2;
  slide.addShape("ellipse", { x: ox, y: ay - oh / 2, w: ow, h: oh, fill: { color: "FFFFFF" }, line: { color: C.text, width: 1 } });
  T("CAGR 1%", ox, ay - oh / 2, ow, oh, { bold: true, align: "center", valign: "middle", size: 14 });

  T("CTF’s 2018 revenue by segment", bX, y, bW, 0.28 * 2 + 0.02);
  T("%", bX, y + 0.55, 1, 0.28, { italic: true });
  const sc = { x: bX, y: y + 0.95, w: 1.5, h: 4.85 - (y + 0.95) }, sl = { x: 0.1, y: 0.02, w: 0.8, h: 0.85 };
  slide.addChart(pres.ChartType.bar, [{ name: "Fine jewelry", labels: ["2018"], values: [89] }, { name: "Fashion jewelry", labels: ["2018"], values: [11] }], {
    ...sc, ...noAxis, barDir: "col", barGrouping: "stacked", chartColors: [LIGHT, DARK], barGapWidthPct: 20, showValue: false, valAxisMinVal: 0, valAxisMaxVal: 100, layout: sl });
  // segment names beside the column, level with their segments
  const spy = sc.y + sc.h * sl.y, sph = sc.h * sl.h, lx = sc.x + sc.w * (sl.x + sl.w) + 0.1;
  const sx = sc.x + sc.w * sl.x, sw = sc.w * sl.w;
  T("11%", sx, spy, sw, sph * 0.11, { align: "center", valign: "middle", color: "FFFFFF", size: 14 });
  T("89%", sx, spy + sph * 0.11, sw, sph * 0.89, { align: "center", valign: "middle", bold: true });
  T("Fashion jewelry", lx, spy, bX + bW - lx, sph * 0.11 + 0.3, { valign: "top" });
  T("Fine jewelry", lx, spy + sph * 0.11 + sph * 0.89 / 2 - 0.2, bX + bW - lx, 0.4, { valign: "middle", bold: true, color: DARK });

  // ---------- 3. constraints: three icon points in a grey band ----------
  y = Y3 + S.subhead(slide, 3, "Major constraints limit the further development of fine jewelry", X1, Y3, W3);
  const band = { x: X1, y, w: W3, h: 7.02 - y };
  slide.addShape("rect", { ...band, fill: { color: C.g1 }, line: { type: "none" } });
  const pts = [
    ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
    ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
    ["flame", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
  ];
  const cw = band.w / 3;
  pts.forEach(([ic, label, text], i) => {
    const x = band.x + i * cw;
    if (i) slide.addShape("line", { x, y: band.y + 0.15, w: 0, h: band.h - 0.3, line: { color: GREY, width: 0.75 } });
    P.icon(slide, ic, x + 0.15, band.y + 0.12, 0.34, { color: GREY });
    T(label, x + 0.56, band.y + 0.1, cw - 0.6, 0.38, { bold: true, valign: "middle" });
    T(text, x + 0.56, band.y + 0.5, cw - 0.64, band.h - 0.55, { italic: true });
  });
  T("Note: *CTF is the abbreviation for Chow Tai Fook", X1, 7.06, 8, 0.2, { size: 10, italic: true, color: NOTE });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
