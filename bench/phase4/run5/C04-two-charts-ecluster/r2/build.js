// C04 rebuild (run5, r2): CTF market-overview slide in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Plan: situation slide, T2B1 as the deck's own sibling slide 5 lays it out (slide-map: "1 stacked column w/ CAGR columns
// + red circle on key CAGR; 2 ...; 3 three icon driver cards"): two chart panels on top, a grey band of three icon points below.
// Panel 1 = stacked columns + CAGR table (stackedCagr form, totals above, fine jewelry 13-18 circled in red);
// panel 2 = revenue columns with a CAGR callout + 2018 segment split as a 100% column (exploded-bar form, slide 16's callout);
// panel 3 = iconPoints form (slide 5 panel 3). Panels are composed with composeSlide({ regions }) and the profile's subhead.
const path = require("path"), fs = require("fs"), { execSync } = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-E-Cluster", title: TITLE,
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const C = P.C, FONT = P.THEME.bodyFontFace, PT = 15, LBL = 14;
const DARK = "10366C", LIGHT = "C1DBEB", RED = "CC0000", GREY = "7E7E7E";   // colours of the reference deck (profile palette)
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || PT, color: o.color || C.text, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true, underline: o.underline ? { style: "sng" } : undefined });

// ---------- panel 1: stacked columns + CAGR table ----------
function marketPanel(sl, b) {
  T("China fine jewelry annual market size and growth", b.x + 0.39, b.y + 0.02, b.w - 0.4, 0.28);
  T("CNY Billion", b.x + 0.39, b.y + 0.28, 2, 0.28, { italic: true });
  const years = ["2013", "2018", "2023E"], tot = [532, 722, 998], share = [0.15, 0.18, 0.24];   // fashion share of each column, as drawn (no labels)
  const fashion = tot.map((t, i) => Math.round(t * share[i])), fine = tot.map((t, i) => t - fashion[i]);
  const cx = b.x + 0.25, cy = b.y + 0.62, cw = 2.85, ch = b.h - 0.62, lay = { x: 0.03, y: 0.12, w: 0.94, h: 0.74 }, max = 1000;
  sl.addChart(pres.ChartType.bar, [{ name: "Fine jewelry", labels: years, values: fine }, { name: "Fashion jewelry", labels: years, values: fashion }], {
    x: cx, y: cy, w: cw, h: ch, barDir: "col", barGrouping: "stacked", chartColors: [LIGHT, DARK], barGapWidthPct: 55, showLegend: false, showValue: false,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelFontSize: LBL, catAxisLabelColor: C.text, catAxisLabelFontFace: FONT, catAxisLineShow: true, catAxisLineColor: "000000", layout: lay });
  // totals above the columns
  const px = cx + lay.x * cw, pw = lay.w * cw, py = cy + lay.y * ch, ph = lay.h * ch, cat = pw / years.length;
  tot.forEach((t, i) => T(String(t), px + i * cat, py + ph * (1 - t / max) - 0.32, cat, 0.28, { align: "center", size: LBL }));
  // CAGR table beside the stack, rows in the stack's top-to-bottom order; fine jewelry 13-18 circled in red
  const x0 = cx + cw + 0.08, nameW = 1.55, K = 0.72, hx = x0 + nameW;
  [["CAGR", "13-18"], ["CAGR", "18-23"]].forEach(([a, c], j) => { T(a, hx + j * K, b.y + 0.66, K, 0.26, { align: "center", underline: true, size: LBL }); T(c, hx + j * K, b.y + 0.92, K, 0.26, { align: "center", size: LBL }); });
  const rows = [["Fashion jewelry", DARK, ["9%", "13%"]], ["Fine jewelry", LIGHT, ["4%", "5%"]], ["Total", null, ["4%", "7%"]]];
  const r0 = b.y + 1.3, rh = (b.y + b.h - 0.2 - r0) / 3;
  rows.forEach(([n, col, v], k) => {
    const y = r0 + k * rh;
    if (k === 2) sl.addShape("line", { x: x0, y: y + 0.02, w: nameW + 2 * K, h: 0, line: { color: GREY, width: 0.75 } });
    if (col) sl.addShape("rect", { x: x0, y: y + rh / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: col }, line: { type: "none" } });
    T(n, x0 + (col ? 0.22 : 0), y, nameW - (col ? 0.22 : 0), rh, { valign: "middle", size: LBL, bold: k === 2 });
    v.forEach((t, j) => T(t, hx + j * K, y, K, rh, { align: "center", valign: "middle", size: LBL, bold: k === 2 }));
  });
  const ey = r0 + rh + rh / 2;
  sl.addShape("ellipse", { x: hx + 0.08, y: ey - 0.22, w: K - 0.16, h: 0.44, fill: { type: "none" }, line: { color: RED, width: 1.75 } });
}

// ---------- panel 2: CTF revenue + 2018 split by segment ----------
function ctfPanel(sl, b) {
  T("CTF's annual revenue", b.x + 0.42, b.y + 0.02, 2.6, 0.28);
  T("CNY Billion", b.x + 0.42, b.y + 0.28, 2, 0.28, { italic: true });
  const cx = b.x + 0.3, cy = b.y + 0.62, cw = 2.7, ch = b.h - 0.62, lay = { x: 0.04, y: 0.12, w: 0.92, h: 0.74 }, max = 75;
  sl.addChart(pres.ChartType.bar, [{ name: "Revenue", labels: ["2013", "2018"], values: [47, 48] }], {
    x: cx, y: cy, w: cw, h: ch, barDir: "col", chartColors: [DARK], barGapWidthPct: 80, showLegend: false, showValue: true, dataLabelPosition: "outEnd",
    dataLabelFontSize: LBL, dataLabelColor: C.text, dataLabelFontFace: FONT, valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: max,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontSize: LBL, catAxisLabelColor: C.text, catAxisLabelFontFace: FONT,
    catAxisLineShow: true, catAxisLineColor: "000000", layout: lay });
  const px = cx + lay.x * cw, pw = lay.w * cw, py = cy + lay.y * ch, ph = lay.h * ch, cat = pw / 2, bw = cat / 1.8;
  const top = (v) => py + ph * (1 - v / max), bx = (i) => px + i * cat + (cat - bw) / 2;
  // CAGR callout over the two columns (arrow + pill, as the deck marks growth)
  const ay = top(48) - 0.62;
  sl.addShape("line", { x: bx(0) + bw / 2, y: ay, w: bx(1) - bx(0), h: 0, line: { color: C.text, width: 1.5, endArrowType: "triangle" } });
  sl.addShape("roundRect", { x: px + pw / 2 - 0.55, y: ay - 0.19, w: 1.1, h: 0.38, rectRadius: 0.19, fill: { color: "FFFFFF" }, line: { color: C.text, width: 1 } });
  T("CAGR 1%", px + pw / 2 - 0.55, ay - 0.19, 1.1, 0.38, { align: "center", valign: "middle", bold: true, size: LBL });
  // 2018 revenue by segment: one 100% column, linked to the 2018 column by dotted lines
  const sx = b.x + 3.35;
  T("CTF's 2018 revenue by segment", sx, b.y + 0.02, b.x + b.w - sx, 0.56);
  const colX = sx + 0.25, colW = 0.95, y0 = top(48), y1 = py + ph, hh = y1 - y0 + 0.0;
  const segTop = Math.max(b.y + 0.75, y0 - 0.55), segH = y1 - segTop, fashH = segH * 0.11;
  sl.addShape("line", { x: bx(1) + bw, y: y0, w: colX - bx(1) - bw, h: segTop - y0, line: { color: GREY, width: 1, dashType: "sysDot" } });
  sl.addShape("rect", { x: colX, y: segTop, w: colW, h: fashH, fill: { color: DARK }, line: { color: "FFFFFF", width: 0.75 } });
  sl.addShape("rect", { x: colX, y: segTop + fashH, w: colW, h: segH - fashH, fill: { color: LIGHT }, line: { color: "FFFFFF", width: 0.75 } });
  T("11%", colX, segTop, colW, fashH, { align: "center", valign: "middle", color: "FFFFFF", size: LBL });
  T("89%", colX, segTop + fashH, colW, segH - fashH, { align: "center", valign: "middle", bold: true, size: PT + 3 });
  const lx = colX + colW + 0.15, lw = b.x + b.w - lx;
  T("Fashion jewelry", lx, segTop + fashH / 2 - 0.25, lw, 0.5, { valign: "middle", size: LBL });
  T("Fine jewelry", lx, segTop + fashH + (segH - fashH) / 2 - 0.25, lw, 0.5, { valign: "middle", size: LBL, bold: true, color: DARK });
}

// ---------- panel 3: three constraints in a grey band, icon + label + one line each ----------
function constraintsPanel(sl, b) {
  const g = { x: b.x + 0.39, y: b.y + 0.02, w: b.x + b.w - (b.x + 0.39), h: b.h - 0.02 };
  sl.addShape("rect", { ...g, fill: { color: C.g1 }, line: { type: "none" } });
  const items = [
    ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
    ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
    ["trophy", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
  ];
  const w = g.w / items.length;
  items.forEach(([ic, lab, txt], i) => {
    const x = g.x + i * w;
    if (i) sl.addShape("line", { x, y: g.y + 0.15, w: 0, h: g.h - 0.3, line: { color: GREY, width: 0.75 } });
    P.icon(sl, ic, x + 0.15, g.y + 0.12, 0.34, { color: GREY });
    T(lab, x + 0.58, g.y + 0.08, w - 0.62, 0.4, { bold: true, valign: "middle" });
    T(txt, x + 0.58, g.y + 0.5, w - 0.72, g.h - 0.56, { italic: true });
  });
}

S.composeSlide(pres, slide, {
  regions: [{ x: 0.26, y: 1.34, w: 6.14, h: 3.45 }, { x: 6.88, y: 1.34, w: 6.19, h: 3.45 }, { x: 0.26, y: 4.86, w: 12.81, h: 2.16 }],
  panels: [
    { headline: "Fine jewelry has a lower growth rate", draw: marketPanel },
    { headline: "Fine jewelry accounts for the majority of CTF*", draw: ctfPanel },
    { headline: "Major constraints limit the further development of fine jewelry", draw: constraintsPanel },
  ],
});

// note and sources as the deck sets them (italic, small grey, bottom left)
T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.07, 8, 0.2, { size: 10, italic: true, color: "585858" });
slide.addText([{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }], { placeholder: "source" });

// the deck's logo, top right (picture from the stored object of the deck's slide 5, case19-ecluster-005)
const media = path.join(__dirname, "media");
fs.mkdirSync(media, { recursive: true });
const names = ["be0ee93660a28c8a.jpg", "2062e202a8d83254.jpg"];
execSync(`python3 -I -c "import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); [open(sys.argv[2]+'/'+n,'wb').write(z.read(n)) for n in sys.argv[3:]]" ${JSON.stringify(path.resolve(__dirname, "../../../../../Objects/store/media.zip"))} ${JSON.stringify(media)} ${names.join(" ")}`);
slide.addImage({ path: path.join(media, names[0]), x: 11.558, y: 0.027, w: 0.3375, h: 0.371, altText: "E-Cluster logo mark" });
slide.addImage({ path: path.join(media, names[1]), x: 11.915, y: 0.108, w: 1.118, h: 0.227, altText: "E-Cluster wordmark" });

L.save(pres, __dirname + "/candidate.pptx");
