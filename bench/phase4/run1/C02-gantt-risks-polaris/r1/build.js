// C02 run1 rebuild 1: implementation Gantt + challenges / mitigations, in the style of Case-2019-Polaris.
// Approach: harness frame with the deck's style profile (title, red rule, source, page number); the body is drawn in
// the deck's own vocabulary measured from its other slides (two-panel split with bold 16 pt panel heads over a red rule
// and a dashed grey divider, as on 11-13; 5C5C5C header cells with white 14 pt text and a red "highlight" cell, as on 13;
// red circle letter chips, as on 12; grey filled boxes, red outlined boxes and grey chevrons, as on 9, 10, 12;
// footer rule with the Pandora | Polaris logos, as on every content slide).
// S.gantt was not used: it has no sub-groups, no split bar and a fixed legend text; the prompt asks for its own legend.
const path = require("path"), fs = require("fs"), os = require("os"), cp = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "During strategy implementation, Pandora should take initiative to mitigate challenges";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });

const RED = "CC0000", G1 = "5C5C5C", G3 = "7E7E7E", G4 = "A2A2A2", PANEL = "F1F1F1", LINE = "B4B4B4", BLACK = "000000", WHITE = "FFFFFF";
const FONT = "Arial";
const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 14, color: o.color || BLACK, bold: !!o.bold,
  italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0, isTextBox: true, fill: o.fill ? { color: o.fill } : undefined,
  paraSpaceAfter: o.psa || 0 });
const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });
const hline = (x, y, w, color, width, dash) => slide.addShape("line", { x, y, w, h: 0, line: { color, width, dashType: dash } });
const vline = (x, y, h, color, width, dash) => slide.addShape("line", { x, y, w: 0, h, line: { color, width, dashType: dash } });
const circle = (label, x, y, d) => { slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
  T(label, x, y, d, d, { size: 14, bold: true, color: WHITE, align: "center" }); };

// ---------- panel heads (deck: bold 16 pt black, centred, red 1.5 pt rule under, dashed grey divider between) ----------
const LX = 0.19, LR = 7.6, RX = 7.98, RR = 13.02, HEAD_Y = 1.06, RULE_Y = 1.47, DIV_X = 7.79;
T("Implementation Timeline", LX, HEAD_Y, LR - LX, 0.34, { size: 16, bold: true, align: "center" });
T("Main Challenges and Potential Mitigations", RX, HEAD_Y, RR - RX, 0.34, { size: 16, bold: true, align: "center" });
hline(LX, RULE_Y, LR - LX, RED, 1.5); hline(RX, RULE_Y, RR - RX, RED, 1.5);
vline(DIV_X, RULE_Y, 6.94 - RULE_Y, G1, 0.75, "sysDash");

// ---------- left: Gantt 2019-2023 ----------
const years = ["2019", "2020", "2021", "2022", "2023"];
const LAB_X = LX, GX = 3.05, GW = LR - GX, PW = GW / years.length, HY = 1.62, HH = 0.4;
T("Strategy", LAB_X, HY, GX - LAB_X - 0.05, HH, { size: 14, color: WHITE, fill: G1, align: "center" });
years.forEach((y, i) => T(y, GX + i * PW + 0.025, HY, PW - 0.05, HH, { size: 14, color: WHITE, fill: G1, align: "center" }));
// rows: g = group head (letter chip), s = sub-head, r = activity with bars [from, to, prioritised] in year units (0 = start of 2019)
const rows = [
  { g: "a", text: "Offline Strategy" },
  { s: "Store Expansion" },
  { r: "Open new concept stores", bars: [[0, 5, 1]] },
  { r: "Open theme stores", bars: [[1, 3, 0], [1, 5, 1]], split: true },
  { r: "Open digital stores", bars: [[2, 3, 1]] },
  { s: "Sales per Store Improvement" },
  { r: "Loyal customer AD", bars: [[1, 5, 1]] },
  { r: "Charity series", bars: [[0, 5, 1]] },
  { r: "Personalized offerings", bars: [[2, 5, 0]] },
  { r: "Design competence", bars: [[2, 5, 0]] },
  { g: "b", text: "Online Strategy" },
  { r: "Enter new platforms", bars: [[0, 2, 1]] },        // years not given in the prompt: assumed
  { r: "Optimize operations", bars: [[1, 5, 0]] },        // assumed
  { g: "c", text: "Omni-channel Strategy" },
  { r: "Data synchronization", bars: [[1, 3, 1]] },       // assumed
  { r: "Product mgt. & CRM", bars: [[2, 5, 0]] },         // assumed
];
const TOP = HY + HH + 0.08, LEG_Y = 6.6, RH = (LEG_Y - 0.08 - TOP) / rows.length;
// year separators (light dashed) behind the bars
for (let i = 1; i < years.length; i++) vline(GX + i * PW, TOP, rows.length * RH, LINE, 0.5, "dash");
let alt = 0;
rows.forEach((row, i) => {
  const y = TOP + i * RH;
  if (row.g) {
    alt = 0;
    if (i) hline(LAB_X, y, LR - LAB_X, G4, 0.75);
    circle(row.g, LAB_X + 0.02, y + (RH - 0.27) / 2, 0.27);
    T(row.text, LAB_X + 0.38, y, GX - LAB_X - 0.4, RH, { size: 14, bold: true });
    return;
  }
  if (row.s) { T(row.s, LAB_X + 0.38, y, GX - LAB_X - 0.4, RH, { size: 12, bold: true, italic: true, color: G1 }); alt = 0; return; }
  if (alt++ % 2 === 0) rect(LAB_X + 0.38, y + 0.01, LR - LAB_X - 0.38, RH - 0.02, PANEL);
  T(row.r, LAB_X + 0.52, y, GX - LAB_X - 0.55, RH, { size: 12 });
  const bh = row.split ? RH * 0.3 : RH * 0.56;
  row.bars.forEach(([a, b, hi], k) => {
    const by = row.split ? y + RH * 0.17 + k * (bh + RH * 0.06) : y + (RH - bh) / 2;
    rect(GX + a * PW + 0.05, by, (b - a) * PW - 0.1, bh, hi ? RED : G4);
  });
});
// legend (prompt: red = prioritised period, grey = implementation period)
const legend = [["Period for prioritized strategy", RED], ["Period for implementation", G4]];
let lx = LAB_X + 0.38;
legend.forEach(([t, c]) => { rect(lx, LEG_Y + 0.09, 0.42, 0.17, c); T(t, lx + 0.5, LEG_Y, 3.0, 0.34, { size: 12 }); lx += 0.5 + (t.length * 12 * 0.5) / 72 + 0.35; });

// ---------- right: numbered challenge blocks, each with its mitigation in a grey box (red bold lead, as the pilot-store
// boxes on 10), blocks split by dashed grey lines (as the phases on 11) ----------
const NX = RX, BX = RX + 0.5, BW = RR - BX;
const risks = [
  { c: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
    m: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers" },
  { c: ["Competition from emerging players in entry luxury jewelry market"],
    m: "Keep sustainability of a differentiate in product and positioning" },
  { c: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
    m: "Negotiate with platforms and outsource market analytics" },
];
const LH = 14 * 1.17 / 72, CPL = (w) => Math.floor((w * 72) / (14 * 0.5));          // Arial 14 pt: line height, ~chars per line
const nl = (t, w) => { let n = 1, cur = 0; for (const wd of t.split(" ")) { if (cur + wd.length + 1 > CPL(w) && cur) { n++; cur = wd.length + 1; } else cur += wd.length + 1; } return n; };
const lead = "Mitigation: ";
const need = risks.map((r) => ({ c: r.c.reduce((a, t) => a + nl(t, BW - 0.35), 0) * LH + (r.c.length - 1) * 0.06, m: nl(lead + r.m, BW - 0.3) * LH }));
const RTOP = HY - 0.02, RBOT = 6.94, SEP = 0.18, PADC = 0.06, PADM = 0.14, GAPI = 0.06;
const base = need.reduce((a, n) => a + n.c + n.m + PADC + PADM + GAPI, 0) + SEP * (risks.length - 1), extra = Math.max(0, (RBOT - RTOP - base) / risks.length);
let ry = RTOP;
risks.forEach((r, i) => {
  const ch = need[i].c + PADC + extra * 0.55, mh = need[i].m + PADM + extra * 0.45, h = ch + GAPI + mh;
  circle(String(i + 1), NX + 0.04, ry + h / 2 - 0.19, 0.38);
  slide.addText(r.c.map((t, k) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: k < r.c.length - 1, paraSpaceAfter: 4 } })),
    { x: BX, y: ry, w: BW, h: ch, fontFace: FONT, fontSize: 14, color: BLACK, valign: "middle", margin: [0, 4, 0, 4], isTextBox: true });
  rect(BX, ry + ch + GAPI, BW, mh, PANEL);
  slide.addText([{ text: lead, options: { bold: true, color: RED } }, { text: r.m, options: { color: BLACK } }],
    { x: BX + 0.1, y: ry + ch + GAPI, w: BW - 0.2, h: mh, fontFace: FONT, fontSize: 14, valign: "middle", margin: 0, isTextBox: true });
  ry += h;
  if (i < risks.length - 1) { hline(RX, ry + SEP / 2, RR - RX, G4, 0.75, "dash"); ry += SEP; }
});

// ---------- footer as on the deck's content slides: grey rule, PANDORA | Polaris logos ----------
hline(0, 7.22, 12.97, LINE, 0.75);
const logoDir = fs.mkdtempSync(path.join(os.tmpdir(), "c02logo-"));
const ref = path.join(__dirname, "../../../../../Templates/Case-2019-Polaris.pptx");
try {
  for (const f of ["image4.png", "image5.jpg"]) fs.writeFileSync(path.join(logoDir, f), cp.execFileSync("unzip", ["-p", ref, "ppt/media/" + f]));
  slide.addImage({ path: path.join(logoDir, "image5.jpg"), x: 10.75, y: 7.24, w: 1.07, h: 0.21 });   // PANDORA wordmark
  vline(11.91, 7.26, 0.21, LINE, 0.75);
  slide.addImage({ path: path.join(logoDir, "image4.png"), x: 11.85, y: 7.12, w: 0.96, h: 0.38 });   // Polaris
} catch (e) { console.error("logos skipped:", e.message); }

L.save(pres, __dirname + "/candidate.pptx");
