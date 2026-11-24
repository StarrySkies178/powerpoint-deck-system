// C05 rebuild r3: "Implementation Timeline" in the style of Templates/Case-2019-E-Cluster.pptx (deck as reference).
// Look from the deck's style profile (Style/refs/Case-2019-E-Cluster.profile.json via L.start).
// Forms taken from the deck's other slides:
//   - Gantt drawn as the deck's banded table (appendix tables, slides 22-23: dark header band with white bold text,
//     light-blue / light-grey row blocks split by white rules), bars drawn over the year cells.
//   - "Potential Risks" as a section head with a rule (the "Key Assumptions" heads of slide 16) over grey icon boxes
//     (the icon + text KSF boxes of slide 7).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, prof } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Implementation Timeline",
  crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
});
const C = P.C, B = P.BODY, F = P.THEME.bodyFontFace;
const HEAD = prof.roles.grey1;            // 253449 dark header band of the deck's tables
const BAND_BLUE = prof.table.body_fill;   // DFECF5 light-blue row block
const BAND_GREY = prof.roles.panel;       // F1F1F1 light-grey row block
const BAR = prof.roles.grey1;             // 253449 dark navy bars (the accent slot is kept for nothing on this slide)
const HEAD_TXT = prof.panel.colour;       // 10366C section-head colour
const PT = prof.body.label_pt;            // 14 pt table text (label size), never smaller
const BODY_PT = prof.body.pt;             // 15 pt body text

// ---------- 1. Gantt as a banded table ----------
const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
// kind: "row" (own line), "group" (group head), "sub" (row inside a group); from/to = year indexes
const rows = [
  { kind: "row", label: "New Product R&D", from: 0, to: 0, band: BAND_GREY },
  { kind: "row", label: "Marketing & Reshaping Brand", from: 0, to: 2, band: BAND_BLUE },
  { kind: "group", label: "Offline: City Penetration Steps", band: BAND_GREY },
  { kind: "sub", label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 2, band: BAND_GREY },
  { kind: "sub", label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 5, band: BAND_GREY },
  { kind: "group", label: "Omni Channel Building", band: BAND_BLUE },
  { kind: "sub", label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 1, band: BAND_BLUE },
  { kind: "sub", label: "Further integrate online and offline channels", from: 2, to: 5, band: BAND_BLUE },
];
// table reaches 13.10 in so the master rule at 1.74 in ends under the header band
const tx = B.x, tw = B.w + 0.03, labW = 6.2, yrW = (tw - labW) / years.length;
const colW = [labW, ...years.map(() => yrW)];
// the body starts where the deck's slides start it (profile margins.body_top, 1.43 in, just under the title band);
// the dark table header band sits there, as on the deck's appendix tables
const hdrH = 0.44, rowH = 0.41, ty = prof.margins.body_top;
const none = { type: "none" }, white = (w) => ({ type: "solid", color: "FFFFFF", pt: w });
const hdr = [{ text: "Key initiatives", options: { bold: true, color: "FFFFFF", fill: { color: HEAD }, align: "left", border: [none, white(1.5), none, none] } },
  ...years.map((y, j) => ({ text: y, options: { bold: true, color: "FFFFFF", fill: { color: HEAD }, align: "center", border: [none, j < years.length - 1 ? white(1.5) : none, none, none] } }))];
const body = rows.map((r, i) => {
  const nextBand = rows[i + 1] && rows[i + 1].band !== r.band;     // white rule between row blocks
  const bottom = nextBand ? white(2.5) : none;
  const lab = { text: r.label, options: {
    bold: r.kind !== "sub", color: r.kind === "group" ? HEAD_TXT : C.text, italic: false, fill: { color: r.band }, align: "left",
    margin: [0.03, 0.08, 0.03, r.kind === "sub" ? 0.38 : 0.1], border: [none, white(1.5), bottom, none] } };
  if (r.kind === "sub") lab.text = "•  " + r.label;
  const cells = years.map((_, j) => ({ text: "", options: { fill: { color: r.band }, border: [none, j < years.length - 1 ? white(1.5) : none, bottom, none] } }));
  return [lab, ...cells];
});
slide.addTable([hdr, ...body], { x: tx, y: ty, w: tw, colW, rowH: [hdrH, ...rows.map(() => rowH)], fontFace: F, fontSize: PT, color: C.text,
  valign: "middle", margin: [0.03, 0.08, 0.03, 0.1], autoPage: false });
// bars over the year cells
rows.forEach((r, i) => {
  if (r.from == null) return;
  const y = ty + hdrH + i * rowH, bh = 0.22;
  slide.addShape("rect", { x: tx + labW + r.from * yrW + 0.08, y: y + (rowH - bh) / 2, w: (r.to - r.from + 1) * yrW - 0.16, h: bh,
    fill: { color: BAR }, line: { type: "none" }, objectName: "bar " + r.label });
});
// group rows: a thin bracket line spanning the group's children (2019-2024), in the deck's light blue
rows.forEach((r, i) => {
  if (r.kind !== "group") return;
  const kids = []; for (let k = i + 1; k < rows.length && rows[k].kind === "sub"; k++) kids.push(rows[k]);
  const a = Math.min(...kids.map((k) => k.from)), b = Math.max(...kids.map((k) => k.to));
  const y = ty + hdrH + i * rowH + rowH / 2, x0 = tx + labW + a * yrW + 0.08, x1 = tx + labW + (b + 1) * yrW - 0.08;
  slide.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: prof.colours_ranked[2], width: 2.25, beginArrowType: "oval", endArrowType: "oval" }, objectName: "group span " + r.label });
});
const tableEnd = ty + hdrH + rows.length * rowH;

// ---------- 2. Potential Risks ----------
const ry = tableEnd + 0.16;
P.icon(slide, "alert-triangle", B.x, ry + 0.02, 0.34, { color: HEAD_TXT });
slide.addText("Potential Risks", { x: B.x + 0.42, y: ry, w: 5, h: 0.38, fontFace: F, fontSize: prof.panel.pt, bold: true, color: HEAD_TXT, margin: 0, valign: "middle", isTextBox: true });
slide.addShape("line", { x: B.x, y: ry + 0.42, w: B.w, h: 0, line: { color: HEAD_TXT, width: 1.5 } });
const risks = [
  { icon: "trending-down", text: "Economy downturn" },
  { icon: "chart-line", text: "Suffer from slow ramp up problem when entering the new market" },
  { icon: "alert-circle", text: "Potential brand image cannibalization, fail to launch new products in the market as expected" },
  { icon: "users", text: "Market dynamics: customer behavior change, competitors' response, etc." },
];
const gy = ry + 0.52, gap = 0.12, bw = (B.w - gap) / 2, bottomY = B.y + B.h, bh = (bottomY - gy - gap) / 2;
risks.forEach((r, k) => {
  const x = B.x + (k % 2) * (bw + gap), y = gy + Math.floor(k / 2) * (bh + gap);
  slide.addShape("rect", { x, y, w: bw, h: bh, fill: { color: BAND_GREY }, line: { type: "none" }, objectName: "risk box " + (k + 1) });
  P.icon(slide, r.icon, x + 0.14, y + (bh - 0.42) / 2, 0.42, { color: BAR });
  slide.addText(r.text, { x: x + 0.7, y, w: bw - 0.8, h: bh, fontFace: F, fontSize: BODY_PT, color: C.text, margin: [0.02, 0.04, 0.02, 0.04], valign: "middle", isTextBox: true });
});

// thin rule above the footer, full width, as on every slide of the deck
slide.addShape("line", { x: 0, y: 7.25, w: prof.size[0], h: 0, line: { color: HEAD, width: 0.75 }, objectName: "footer rule" });

L.save(pres, __dirname + "/candidate.pptx");
