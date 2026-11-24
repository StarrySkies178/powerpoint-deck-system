// C04 rebuild 3: "Chow Tai Fook is recommended to enter a new market ..." in the style of Case-2019-E-Cluster.
// Deck as reference, leave-one-out. Layout taken from the deck's closest OTHER slide of the same kind
// (Style slide map: situation | T2B1, stacked column + CAGR table | chart | three icon cards in a grey band),
// measured from its shapes. Style from Style/refs/Case-2019-E-Cluster.profile.json via the harness.
// Charts are drawn as editable shapes, as the reference deck draws its charts.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P } = L.start({
  ref: "Case-2019-E-Cluster",
  title: TITLE,
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});

// reference colours (profile roles and deck palette)
const K = {
  chip: "283954", head: "10366C", rule: "10366C", text: "000000", grey: "7E7E7E", panel: "F1F1F1",
  dark: "10366C", light: "C1DBEB", ctx: "C3C6CA", red: "CC0000", foot: "202C4F", src: "585858",
};
const FONT = "Arial";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, {
  x, y, w, h, fontFace: FONT, fontSize: o.size || 14, color: o.color || K.text, bold: !!o.bold, italic: !!o.italic,
  underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true,
  paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm,
});
const rect = (x, y, w, h, fill, o = {}) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: o.line || { type: "none" } });
const line = (x, y, w, h, color, width = 1, o = {}) => slide.addShape("line", { x, y, w, h, flipV: !!o.flipV, line: { color, width, dashType: o.dash, endArrowType: o.arrow } });

// panel head: number chip (ellipse) + bold sub-headline + rule, as on the deck's analysis slides
function head(n, text, x, y, w) {
  slide.addShape("ellipse", { x, y: y + 0.01, w: 0.31, h: 0.31, fill: { color: K.chip }, line: { type: "none" } });
  T(String(n), x, y + 0.01, 0.31, 0.31, { size: 15, color: "FFFFFF", align: "center", valign: "middle" });
  T(text, x + 0.36, y - 0.02, w - 0.36, 0.36, { size: 17, bold: true, color: K.head, valign: "middle" });
  line(x + 0.37, y + 0.34, w - 0.37, 0, K.rule, 1.5);
}

// ---------------- Panel 1: stacked columns + CAGR table ----------------
head(1, "Fine jewelry has a lower growth rate", 0.27, 1.42, 6.12);
T([{ text: "China fine jewelry annual market size and growth", options: { breakLine: true } }, { text: "CNY Billion", options: { italic: true } }],
  0.63, 1.85, 5.6, 0.5, { size: 14 });

const years = ["2013", "2018", "2023E"], fine = [53, 72, 99], fashion = [2, 2, 8];
const base = 4.47, k1 = 1.78 / 107, cw1 = 0.62, cx1 = [1.08, 2.05, 3.02];
years.forEach((yr, i) => {
  const hf = fine[i] * k1, hs = fashion[i] * k1, x = cx1[i] - cw1 / 2;
  rect(x, base - hf, cw1, hf, K.light);
  rect(x, base - hf - hs, cw1, hs, K.dark);
  T(String(fine[i]), x - 0.1, base - hf / 2 - 0.13, cw1 + 0.2, 0.26, { size: 14, align: "center", valign: "middle" });
  T(String(fashion[i]), x - 0.1, base - hf - hs - 0.3, cw1 + 0.2, 0.26, { size: 14, bold: true, color: K.dark, align: "center", valign: "bottom" });
  T(yr, x - 0.25, base + 0.06, cw1 + 0.5, 0.26, { size: 14, align: "center" });
});
line(0.65, base, 3.0, 0, K.text, 0.75);

// CAGR table beside the stack: rows aligned with their segments, the highlighted row circled
const lx = 3.72, c1 = 4.98, c2 = 5.74, cwid = 0.64;
[["13-18", c1], ["18-23", c2]].forEach(([h, x]) => {
  T([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: h }], x - 0.05, 2.2, cwid + 0.1, 0.5, { size: 14, align: "center" });
});
const rows = [
  { name: "Fashion jewelry", v: ["23%", "18%"], y: 2.85, hi: true },
  { name: "Fine jewelry", v: ["4%", "5%"], y: 3.55 },
  { name: "Total", v: ["4%", "7%"], y: 4.2, bold: true },
];
rows.forEach((r) => {
  T(r.name, lx, r.y, 1.22, 0.5, { size: 14, bold: !!r.bold, valign: "middle" });
  r.v.forEach((v, j) => T(v, [c1, c2][j], r.y, cwid, 0.5, { size: 14, bold: !!r.bold || (r.hi && j === 0), color: r.hi && j === 0 ? K.dark : K.text, align: "center", valign: "middle" }));
});
line(lx, 4.13, c2 + cwid - lx, 0, K.grey, 0.75);
slide.addShape("ellipse", { x: c1 - 0.02, y: 2.85 + 0.02, w: cwid + 0.04, h: 0.46, fill: { type: "none" }, line: { color: K.red, width: 1.5 } });

// ---------------- Panel 2: CTF revenue + 2018 split ----------------
head(2, "Fine jewelry accounts for the majority of CTF*", 6.86, 1.42, 6.22);
T([{ text: "CTF’s annual revenue", options: { breakLine: true } }, { text: "CNY Billion", options: { italic: true } }], 7.3, 1.85, 2.9, 0.5, { size: 14 });
T([{ text: "CTF’s 2018 revenue by segment", options: { breakLine: true } }, { text: "%", options: { italic: true } }], 10.15, 1.85, 2.9, 0.5, { size: 14 });

const rev = [["2013", 47], ["2018", 48]], k2 = 1.3 / 48, cw2 = 0.66, cx2 = [7.85, 9.0];
rev.forEach(([yr, v], i) => {
  const h = v * k2, x = cx2[i] - cw2 / 2;
  rect(x, base - h, cw2, h, K.dark);
  T(String(v), x - 0.1, base - h - 0.3, cw2 + 0.2, 0.26, { size: 14, align: "center", valign: "bottom" });
  T(yr, x - 0.2, base + 0.06, cw2 + 0.4, 0.26, { size: 14, align: "center" });
});
line(7.3, base, 2.25, 0, K.text, 0.75);
// CAGR callout: arrow over the two columns with the rate in an oval
const ay = 2.6;
line(cx2[0] - 0.2, ay + 0.1, cx2[1] - cx2[0] + 0.4, 0, K.text, 1.5, { arrow: "triangle" });
slide.addShape("ellipse", { x: (cx2[0] + cx2[1]) / 2 - 0.55, y: ay - 0.08, w: 1.1, h: 0.36, fill: { color: "FFFFFF" }, line: { color: K.text, width: 1 } });
T("CAGR 1%", (cx2[0] + cx2[1]) / 2 - 0.55, ay - 0.08, 1.1, 0.36, { size: 14, bold: true, align: "center", valign: "middle" });

// 2018 split: one 100% column, linked to the 2018 revenue column by dotted lines
const sx = 10.45, sw = 0.66, top = 2.74, sh = base - top, hFine = sh * 0.89, hFash = sh - hFine;
rect(sx, top, sw, hFash, K.dark);
rect(sx, top + hFash, sw, hFine, K.light);
T("11%", sx - 0.1, top - 0.3, sw + 0.2, 0.26, { size: 14, bold: true, color: K.dark, align: "center", valign: "bottom" });
T("89%", sx - 0.1, top + hFash + hFine / 2 - 0.13, sw + 0.2, 0.26, { size: 14, bold: true, align: "center", valign: "middle" });
T("2018", sx - 0.2, base + 0.06, sw + 0.4, 0.26, { size: 14, align: "center" });
line(10.0, base, 1.3, 0, K.text, 0.75);
const r18 = cx2[1] + cw2 / 2, t18 = base - 48 * k2;
line(r18, top, sx - r18, t18 - top, K.grey, 0.75, { dash: "sysDot", flipV: true });
T("Fashion jewelry", sx + sw + 0.15, top - 0.12, 1.7, 0.5, { size: 14, bold: true, color: K.dark, valign: "middle" });
T("Fine jewelry", sx + sw + 0.15, top + hFash + hFine / 2 - 0.25, 1.7, 0.5, { size: 14, valign: "middle" });

// ---------------- Panel 3: three constraints in a grey band ----------------
head(3, "Major constraints limit the further development of fine jewelry", 0.27, 4.91, 12.81);
const by = 5.3, bh = 1.72;
rect(0.64, by, 12.45, bh, K.panel);
const cards = [
  { icon: "users", label: "Customer changing preference", text: "New emerging customers value the fashion design more and show different preference" },
  { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption" },
  { icon: "trophy", label: "Increasingly fierce competition", text: "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment" },
];
const colW = 12.45 / 3;
cards.forEach((c, i) => {
  const x = 0.64 + i * colW;
  if (i) line(x, by + 0.2, 0, bh - 0.4, K.grey, 0.75);
  P.icon(slide, c.icon, x + 0.14, by + 0.16, 0.32, { color: K.grey });
  T(c.label, x + 0.52, by + 0.06, colW - 0.62, 0.54, { size: 16, bold: true, valign: "middle" });
  T(c.text, x + 0.52, by + 0.66, colW - 0.72, bh - 0.7, { size: 15, italic: true });
});

// note and footer rule, as on the deck's pages
T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.05, 6, 0.19, { size: 10, italic: true, color: K.src });
line(0, 7.25, 13.33, 0, K.foot, 0.75);

L.save(pres, __dirname + "/candidate.pptx");
