// C02 rebuild: Gantt (left ~60%) + challenges and mitigations (right), in the Case-2019-Polaris style.
// Style source: Style/refs/Case-2019-Polaris.profile.json (title, rule, source line, page number, colours).
// Forms taken from the deck's OTHER slides: two panel heads with a red rule under them and a dashed
// vertical divider (Polaris 11, 13), grey header cells with white bold text (Polaris 13 table),
// red numbered circles (Polaris 8), grey box with a red bold lead-in (Polaris 10 pilot-store boxes),
// thin grey footer rule with the client | team logos (every content slide; logos cropped from the Polaris 17 render).
// Assumption: the prompt gives no periods for the online and omni-channel rows; they are set to
// enter platforms 2019-20 (prioritised), optimise 2020-23, data sync 2020-21 (prioritised), product mgt & CRM 2021-23.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide, prof } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });

const RED = "CC0000", BLACK = "000000", WHITE = "FFFFFF";
const G_DARK = "7E7E7E", G_MID = "A2A2A2", G_LINE = "B4B4B4", G_LIGHT = "F1F1F1", G_SUB = "D5D5D5";
const F = "Arial";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.pt || 12, color: o.color || BLACK,
  bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03,
  isTextBox: true, paraSpaceAfter: o.after || 0, lineSpacingMultiple: o.ls, rotate: o.rotate });
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" },
  line: line ? { color: line.c, width: line.w || 0.75, dashType: line.dash } : { type: "none" } });
const hline = (x, y, w, c, wt = 0.75, dash) => slide.addShape("line", { x, y, w, h: 0, line: { color: c, width: wt, dashType: dash } });
const vline = (x, y, h, c, wt = 0.75, dash) => slide.addShape("line", { x, y, w: 0, h, line: { color: c, width: wt, dashType: dash } });

// ---------- frame extras seen on every content slide of the deck ----------
hline(0, 7.21, 12.96, G_LINE, 0.75);
slide.addImage({ path: path.join(__dirname, "footer-logos.png"), x: 10.708, y: 7.229, w: 1.958, h: 0.26 });

// ---------- panel heads (Polaris 11 / 13): bold centred head, red rule under it, dashed divider between ----------
const LX = 0.37, LR = 7.95, RX = 8.3, RR = 12.98, HY = 1.06, HH = 0.36;
T("Implementation Timeline", LX, HY, LR - LX, HH, { pt: 14, bold: true, align: "center" });
hline(LX, HY + HH + 0.02, LR - LX, RED, 1.5);
T("Main Challenges and Potential Mitigations", RX, HY, RR - RX, HH, { pt: 14, bold: true, align: "center", margin: 0 });
hline(RX, HY + HH + 0.02, RR - RX, RED, 1.5);
vline(8.12, 1.1, 5.95, G_DARK, 0.75, "dash");

// ---------- left: Gantt ----------
const c1 = { x: LX, w: 1.08 }, c2 = { x: LX + 1.12, w: 1.22 }, c3 = { x: LX + 2.38, w: 2.0 };
const YX = c3.x + c3.w + 0.04, YEARS = ["2019", "2020", "2021", "2022", "2023"], CW = (LR - YX) / YEARS.length;
const yx = (yr) => YX + (yr - 2019) * CW;
const GY = 1.58, GH = 0.34;
rect(c1.x, GY, c3.x + c3.w - c1.x, GH, G_DARK);
T("Strategy", c1.x, GY, c3.x + c3.w - c1.x, GH, { pt: 12, bold: true, color: WHITE, align: "center" });
YEARS.forEach((y, j) => { rect(YX + j * CW + 0.02, GY, CW - 0.04, GH, G_DARK);
  T(y, YX + j * CW, GY, CW, GH, { pt: 12, bold: true, color: WHITE, align: "center" }); });

// rows: [label, bars[[from,to,"p"|"i"]]]; groups and subgroups span rows
const groups = [
  { name: "a. Offline Strategy", subs: [
    { name: "Store Expansion", rows: [
      ["Open new concept stores", [[2019, 2023, "p"]]],
      ["Open theme stores", [[2020, 2021, "i"], [2020, 2023, "p"]]],
      ["Open digital stores", [[2021, 2021, "p"]]] ] },
    { name: "Sales per Store Improvement", rows: [
      ["Loyal customer AD", [[2020, 2023, "p"]]],
      ["Charity series", [[2019, 2023, "p"]]],
      ["Personalized offerings", [[2021, 2023, "i"]]],
      ["Design competence", [[2021, 2023, "i"]]] ] } ] },
  { name: "b. Online Strategy", subs: [{ name: null, rows: [
      ["Enter new platforms", [[2019, 2020, "p"]]],
      ["Optimize operations", [[2020, 2023, "i"]]] ] }] },
  { name: "c. Omni-channel Strategy", subs: [{ name: null, rows: [
      ["Data synchronization", [[2020, 2021, "p"]]],
      ["Product mgt. & CRM", [[2021, 2023, "i"]]] ] }] },
];
const LEG_Y = 6.7, ROW0 = GY + GH + 0.08, GAP = 0.1;
const nRows = groups.reduce((a, g) => a + g.subs.reduce((b, s) => b + s.rows.length, 0), 0);
const RH = (LEG_Y - 0.1 - ROW0 - GAP * (groups.length - 1)) / nRows;
// faint year gridlines behind the bars
for (let j = 1; j < YEARS.length; j++) vline(YX + j * CW, ROW0, LEG_Y - 0.1 - ROW0, G_SUB, 0.75, "dash");
let y = ROW0;
groups.forEach((g, gi) => {
  const gRows = g.subs.reduce((b, s) => b + s.rows.length, 0), gy = y;
  rect(c1.x, gy, c1.w, gRows * RH - 0.04, G_DARK);
  T(g.name, c1.x, gy, c1.w, gRows * RH - 0.04, { pt: 12, bold: true, color: WHITE, align: "center", margin: 0.05 });
  g.subs.forEach((s, si) => {
    const sy = y;
    if (s.name) { rect(c2.x, sy, c2.w, s.rows.length * RH - 0.04, G_SUB);
      T(s.name, c2.x, sy, c2.w, s.rows.length * RH - 0.04, { pt: 12, bold: true, align: "center", margin: 0.05 }); }
    const lx = s.name ? c3.x : c2.x, lw = s.name ? c3.w : c3.x + c3.w - c2.x;
    s.rows.forEach(([label, bars], ri) => {
      T(label, lx + 0.04, y, lw - 0.04, RH, { pt: 12 });
      const last = ri === s.rows.length - 1;
      if (!last) hline(lx, y + RH, LR - lx, G_LINE, 0.5, "dash");
      const bh = bars.length > 1 ? 0.13 : 0.2;
      bars.forEach(([a, b, k], bi) => {
        const by = bars.length > 1 ? y + RH / 2 - bh - 0.02 + bi * (bh + 0.04) : y + (RH - bh) / 2;
        rect(yx(a) + 0.05, by, (b - a + 1) * CW - 0.1, bh, k === "p" ? RED : G_MID);
      });
      y += RH;
    });
    if (si < g.subs.length - 1) hline(c2.x, y - 0.02, LR - c2.x, G_DARK, 0.75);
  });
  if (gi < groups.length - 1) { hline(c1.x, y + GAP / 2 - 0.02, LR - c1.x, G_DARK, 1); y += GAP; }
});
// legend
hline(c1.x, LEG_Y - 0.06, LR - c1.x, G_DARK, 1);
rect(c1.x + 0.05, LEG_Y + 0.1, 0.42, 0.17, RED);
T("Period for prioritized strategy", c1.x + 0.55, LEG_Y, 2.9, 0.37, { pt: 12 });
rect(c1.x + 3.65, LEG_Y + 0.1, 0.42, 0.17, G_MID);
T("Period for implementation", c1.x + 4.15, LEG_Y, 2.9, 0.37, { pt: 12 });

// ---------- right: three numbered challenge blocks, each with its mitigation in a grey box ----------
const blocks = [
  { ch: [["Consistent service", " in different regions"], ["Widely attractive local features", ""], ["Consistent brand image", " on online platforms"]],
    mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", chH: 0.8, mH: 0.85 },
  { ch: [["Competition from emerging players", " in entry luxury jewelry market"]],
    mit: "Keep sustainability of a differentiate in product and positioning", chH: 0.55, mH: 0.62 },
  { ch: [["Data availability", " from various platforms"], ["High technical requirements", " for data synchronization and analytics"]],
    mit: "Negotiate with platforms and outsource market analytics", chH: 0.8, mH: 0.62 },
];
const BX = RX + 0.46, BW = RR - BX, BG = 0.08;
const totalH = blocks.reduce((a, b) => a + b.chH + BG + b.mH, 0);
const SEP = (6.98 - 1.58 - totalH) / (blocks.length - 1);
let by = 1.58;
blocks.forEach((b, i) => {
  slide.addShape("ellipse", { x: RX, y: by + 0.01, w: 0.33, h: 0.33, fill: { color: RED }, line: { type: "none" } });
  T(String(i + 1), RX, by + 0.01, 0.33, 0.33, { pt: 14, bold: true, color: WHITE, align: "center", margin: 0 });
  const runs = [];
  b.ch.forEach(([k, rest], j) => {
    const end = j === b.ch.length - 1;
    runs.push({ text: k, options: { bold: true, bullet: { indent: 14 } } });   // the challenge itself in bold
    if (rest) runs.push({ text: rest, options: { bullet: { indent: 14 }, breakLine: !end } }); else if (!end) runs[runs.length - 1].options.breakLine = true;
  });
  T(runs, BX, by, BW, b.chH, { pt: 14, valign: "top", margin: 0.03 });
  const my = by + b.chH + BG;
  rect(BX, my, BW, b.mH, G_LIGHT);
  T([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit }], BX + 0.08, my, BW - 0.16, b.mH, { pt: 14 });
  by = my + b.mH;
  if (i < blocks.length - 1) { hline(RX, by + SEP / 2, RR - RX, G_DARK, 0.75, "dash"); by += SEP; }
});

L.save(pres, path.join(__dirname, "candidate.pptx"));
