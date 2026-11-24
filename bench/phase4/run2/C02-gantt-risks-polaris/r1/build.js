// C02 rebuild (run2 r1): implementation Gantt (left ~60%) + challenges and mitigations (right), in the Case-2019-Polaris look.
// Style: Polaris profile via L.start (title, red rule, source, page number). Panel forms taken from the deck's other slides:
// bold centred panel heads over a red rule and a grey dashed divider between halves (Polaris 5, 11, 12, 13),
// grey label boxes beside rows (Polaris 5, 11), grey down-chevrons between steps (Polaris 2, 12, 13),
// red number circles (title chips of Polaris 10-14), dashed-border content box (Polaris 5), footer rule seen on every slide.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P } = L.start({
  ref: "Case-2019-Polaris",
  title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
  source: "Source: Polaris Analysis",
});
const C = P.C, FONT = P.THEME.bodyFontFace;
const RED = C.accent, G_DARK = "5C5C5C", G_MID = "7E7E7E", G_BAR = "A2A2A2", G_LINE = "B4B4B4", G_BOX = "D5D5D5", G_PANEL = "F1F1F1";
const BODY_PT = 14, LABEL_PT = 12;

const T = (text, x, y, w, h, o = {}) => slide.addText(text, {
  x, y, w, h, fontFace: FONT, fontSize: o.size || BODY_PT, color: o.color || C.text, bold: !!o.bold, italic: !!o.italic,
  align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.04, isTextBox: true, rotate: o.rotate,
  paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm,
});
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });
const hline = (x, y, w, color, pt = 0.75, dash) => slide.addShape("line", { x, y, w, h: 0, line: { color, width: pt, dashType: dash } });
const vline = (x, y, h, color, pt = 0.75, dash) => slide.addShape("line", { x, y, w: 0, h, line: { color, width: pt, dashType: dash } });
const downChevron = (cx, y, w = 0.42, h = 0.2) => { // the deck's grey double chevron between steps
  slide.addShape("triangle", { x: cx - w / 2, y, w, h: h * 0.55, fill: { color: G_MID }, line: { type: "none" }, rotate: 180 });
  slide.addShape("triangle", { x: cx - w / 2, y: y + h * 0.4, w, h: h * 0.6, fill: { color: G_BAR }, line: { type: "none" }, rotate: 180 });
};
const numCircle = (n, x, y, d = 0.32) => {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
  T(String(n), x, y, d, d, { size: LABEL_PT, bold: true, color: C.white, align: "center", margin: 0 });
};

// ---------------- geometry ----------------
const LX = 0.37, LW = 7.08, DIV = 7.7, RX = 7.95, RW = 13.01 - 7.95;
const HEAD_Y = 1.13, HEAD_H = 0.34, RULE_Y = 1.5;

// panel heads (bold, centred, red rule under), dashed divider
T("Implementation Timeline", LX, HEAD_Y, LW, HEAD_H, { bold: true, align: "center" });
hline(LX, RULE_Y, LW, RED, 1.25);
T("Main Challenges and Potential Mitigations", RX, HEAD_Y, RW, HEAD_H, { bold: true, align: "center" });
hline(RX, RULE_Y, RW, RED, 1.25);
vline(DIV, 1.2, 5.75, G_MID, 0.75, "dash");

// ---------------- left: Gantt 2019-2023 ----------------
const years = ["2019", "2020", "2021", "2022", "2023"];
const gw = 1.05, sw = 1.2, tw = 2.0, yw = (LW - gw - sw - tw) / years.length;   // group | sub-group | task | 5 years
const gx = LX, sx = gx + gw, tx = sx + sw, yx = tx + tw;
const top = 1.66, hh = 0.36, legendH = 0.34, bottom = 6.98 - legendH - 0.1;
// rows: bars = [[startYear, endYear, "p"|"i"], ...]; two bars in one row are stacked (theme stores)
const rows = [
  { g: 0, s: 0, label: "Open new concept stores", bars: [[2019, 2023, "p"]] },
  { g: 0, s: 0, label: "Open theme stores", bars: [[2020, 2021, "i"], [2020, 2023, "p"]] },
  { g: 0, s: 0, label: "Open digital stores", bars: [[2021, 2021, "p"]] },
  { g: 0, s: 1, label: "Loyal customer AD", bars: [[2020, 2023, "p"]] },
  { g: 0, s: 1, label: "Charity series", bars: [[2019, 2023, "p"]] },
  { g: 0, s: 1, label: "Personalized offerings", bars: [[2021, 2023, "i"]] },
  { g: 0, s: 1, label: "Design competence", bars: [[2021, 2023, "i"]] },
  { g: 1, label: "Enter new platforms", bars: [] },
  { g: 1, label: "Optimize operations", bars: [] },
  { g: 2, label: "Data synchronization", bars: [] },
  { g: 2, label: "Product mgt. & CRM", bars: [] },
];
const groups = ["a. Offline Strategy", "b. Online Strategy", "c. Omni-channel Strategy"];
const subs = ["Store Expansion", "Sales per Store Improvement"];
const gap = 0.06;                                   // white gap between groups
const rh = (bottom - top - hh - gap * groups.length) / rows.length;
// header row: years in grey cells
years.forEach((yr, j) => { rect(yx + j * yw + 0.02, top, yw - 0.04, hh, G_BOX); T(yr, yx + j * yw, top, yw, hh, { size: LABEL_PT, bold: true, align: "center", margin: 0 }); });
// row y positions
const ys = []; let y = top + hh + gap;
rows.forEach((r, i) => { if (i && r.g !== rows[i - 1].g) y += gap; ys.push(y); y += rh; });
const gridBottom = ys[ys.length - 1] + rh;
// light year gridlines
for (let j = 1; j < years.length; j++) vline(yx + j * yw, top + hh + gap, gridBottom - top - hh - gap, G_LINE, 0.5, "sysDot");
// group boxes (white bold on grey), sub-group boxes (bold on light grey)
groups.forEach((gname, g) => {
  const idx = rows.map((r, i) => (r.g === g ? i : -1)).filter((i) => i >= 0);
  const y0 = ys[idx[0]], y1 = ys[idx[idx.length - 1]] + rh;
  const hasSub = rows[idx[0]].s != null;
  const w = hasSub ? gw - 0.04 : gw + sw - 0.04;
  rect(gx, y0, w, y1 - y0 - 0.02, g === 0 ? G_DARK : G_MID);
  T(gname, gx, y0, w, y1 - y0 - 0.02, { size: LABEL_PT, bold: true, color: C.white, align: "center" });
  if (hasSub) subs.forEach((sname, s) => {
    const sidx = idx.filter((i) => rows[i].s === s), z0 = ys[sidx[0]], z1 = ys[sidx[sidx.length - 1]] + rh;
    rect(sx, z0, sw - 0.04, z1 - z0 - 0.02, G_PANEL);
    T(sname, sx, z0, sw - 0.04, z1 - z0 - 0.02, { size: LABEL_PT, bold: true, align: "center" });
  });
});
// task rows: label, separator rule, bars
rows.forEach((r, i) => {
  const ry = ys[i];
  T(r.label, tx + 0.04, ry, tw - 0.06, rh - 0.02, { size: LABEL_PT });
  const last = i === rows.length - 1 || rows[i + 1].g !== r.g;
  hline(tx, ry + rh - 0.01, tw + yw * years.length, last ? G_MID : G_LINE, last ? 0.75 : 0.5);
  const n = r.bars.length, bh = n > 1 ? 0.12 : 0.2, bgap = 0.04, stack = n * bh + (n - 1) * bgap;
  r.bars.forEach(([a, b, kind], k) => {
    const bx = yx + (a - 2019) * yw + 0.06, bw = (b - a + 1) * yw - 0.12;
    rect(bx, ry + (rh - stack) / 2 + k * (bh + bgap), bw, bh, kind === "p" ? RED : G_BAR);
  });
});
// legend
const ly = 6.98 - legendH;
const legend = [["Period for prioritized strategy", RED], ["Period for implementation", G_BAR]];
let lx = gx + 0.02;
legend.forEach(([lab, col]) => {
  rect(lx, ly + legendH / 2 - 0.08, 0.42, 0.16, col);
  T(lab, lx + 0.48, ly, 2.6, legendH, { size: LABEL_PT });
  lx += 0.48 + 2.75;
});

// ---------------- right: three challenge blocks ----------------
const blocks = [
  { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers" },
  { ch: ["Competition from emerging players in entry luxury jewelry market"],
    mit: "Keep sustainability of a differentiate in product and positioning" },
  { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
    mit: "Negotiate with platforms and outsource market analytics" },
];
const lineH = (BODY_PT * 1.2) / 72;   // inches per text line
const cpl = (w) => Math.floor((w * 72) / (BODY_PT * 0.46));
const nLines = (s, w) => { let n = 1, cur = 0; for (const word of s.split(/\s+/)) { const l = word.length + 1; if (cur + l > cpl(w)) { n++; cur = l; } else cur += l; } return n; };
const cw = RW - 0.55, cxText = RX + 0.5;   // text column right of the number circle
const chevH = 0.2, padY = 0.08, blockGap = 0.16;
const heights = blocks.map((b) => {
  const chL = b.ch.reduce((a, s) => a + nLines(s, cw - 0.3), 0);
  const miL = nLines("Mitigation: " + b.mit, cw - 0.12);
  return { ch: chL * lineH + 2 * padY, mi: miL * lineH + 2 * padY };
});
const used = heights.reduce((a, h) => a + h.ch + chevH + h.mi, 0) + blockGap * (blocks.length - 1);
let by = 1.66 + Math.max(0, (6.98 - 1.66 - used) / 2 - 0.02);
blocks.forEach((b, i) => {
  const h = heights[i];
  // challenge: light grey box with bullets, number circle at its left
  rect(cxText - 0.08, by, cw + 0.08, h.ch, G_PANEL);
  numCircle(i + 1, RX + 0.05, by + h.ch / 2 - 0.16);
  slide.addText(b.ch.map((s) => ({ text: s, options: { bullet: { indent: 14 }, breakLine: true } })), {
    x: cxText, y: by, w: cw - 0.04, h: h.ch, fontFace: FONT, fontSize: BODY_PT, color: C.text, valign: "middle", margin: [0.03, 0.04, 0.03, 0.04], isTextBox: true,
  });
  by += h.ch;
  downChevron(cxText + cw / 2 - 0.04, by + 0.02, 0.42, chevH - 0.04);
  by += chevH;
  // mitigation: dashed grey box, red bold lead-in
  rect(cxText - 0.08, by, cw + 0.08, h.mi, null, { color: G_MID, width: 0.75, dashType: "dash" });
  slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit }], {
    x: cxText, y: by, w: cw - 0.04, h: h.mi, fontFace: FONT, fontSize: BODY_PT, color: C.text, valign: "middle", margin: [0.03, 0.04, 0.03, 0.04], isTextBox: true,
  });
  by += h.mi + blockGap;
});

// footer rule above source line and page number (on every slide of the deck)
hline(0, 7.2, 12.97, G_LINE, 0.72);

L.save(pres, __dirname + "/candidate.pptx");
