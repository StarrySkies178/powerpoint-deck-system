// C05 rebuild 3 (run7): "Implementation Timeline" in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Form choices, all taken from the deck's other slides (renders in bench/phase4/other-slides/C05-timeline-ecluster/):
//  - the Gantt is drawn as the deck draws its tables (E-Cluster 23): dark navy header row with white bold text,
//    rows banded light blue / light grey by group, white rules between cells, group labels in the first column;
//  - the bars carry the step text (white on the deck's secondary navy); the later step is in the main navy;
//  - "Potential Risks" uses the deck's "Key Assumptions" block (E-Cluster 16): bold navy heading over a navy rule,
//    round navy bullet dots, body text at the profile's 15 pt;
//  - breadcrumb with arrows and the thin navy rule over the source line, as on every content slide of the deck.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Implementation Timeline",
    source: "Sources: E-Cluster Analysis",
    crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
  });
  const C = { main: "08163B", sec: "354B70", head: "253449", blue: "DFECF5", grey: "F1F1F1", rule: "10366C", text: "000000", white: "FFFFFF" };
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, {
    x, y, w, h, fontFace: "Arial", fontSize: o.pt || 15, bold: !!o.bold, italic: !!o.italic, color: o.color || C.text,
    align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.05, isTextBox: true });

  // ---------------- Gantt (table form of the deck) ----------------
  const X0 = 0.27, XR = 13.1, LW = 3.15, GX = X0 + LW, years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const YW = (XR - GX) / years.length, Y0 = 1.46, HH = 0.44;
  slide.addShape("rect", { x: X0, y: Y0, w: XR - X0, h: HH, fill: { color: C.head }, line: { type: "none" } });
  T("Workstream", X0, Y0, LW, HH, { bold: true, color: C.white, align: "center" });
  years.forEach((yr, i) => T(yr, GX + i * YW, Y0, YW, HH, { bold: true, color: C.white, align: "center" }));

  // groups: rows carry [from, to] in years (inclusive), the step text, and the step's phase (later step = main navy)
  const groups = [
    { name: "New Product R&D", rows: [{ from: 0, to: 0 }], h: 0.48 },
    { name: "Marketing & Reshaping Brand", rows: [{ from: 0, to: 2 }], h: 0.48 },
    { name: "Offline: City Penetration Steps", h: 0.6, rows: [
      { from: 0, to: 2, text: "Set up 3~5 monobrand stores in prioritized and secondary cities" },
      { from: 2, to: 5, text: "Further expand into the tertiary cities with ~50 more stores", later: true }] },
    { name: "Omni Channel Building", h: 0.6, rows: [
      { from: 0, to: 1, text: "Adjust the product offering and enter key e-commerce platforms" },
      { from: 2, to: 5, text: "Further integrate online and offline channels", later: true }] },
  ];
  let y = Y0 + HH;
  groups.forEach((g, gi) => {
    const gh = g.h * g.rows.length, fill = gi % 2 ? C.grey : C.blue;
    slide.addShape("rect", { x: X0, y, w: XR - X0, h: gh, fill: { color: fill }, line: { type: "none" } });
    T(g.name, X0 + 0.08, y, LW - 0.16, gh, { bold: true, color: C.main });
    g.y = y;
    y += gh;
    // white rule between groups, as between the deck's table blocks
    slide.addShape("line", { x: X0, y, w: XR - X0, h: 0, line: { color: C.white, width: 1.5 } });
  });
  // white column rules (solid in the header, dashed in the body), drawn before the bars so no bar text sits under a rule
  for (let i = 0; i <= years.length - 1; i++) {
    const x = GX + i * YW;
    slide.addShape("line", { x, y: Y0, w: 0, h: HH, line: { color: C.white, width: 1.5 } });
    slide.addShape("line", { x, y: Y0 + HH, w: 0, h: y - Y0 - HH, line: { color: C.white, width: 1.5, dashType: i ? "dash" : "solid" } });
  }
  // bars: one per step; the step text sits on the bar
  groups.forEach((g) => g.rows.forEach((r, ri) => {
    const ry = g.y + ri * g.h, bx = GX + r.from * YW + 0.06, bw = (r.to - r.from + 1) * YW - 0.12, bh = g.h - 0.1;
    slide.addShape("homePlate", { x: bx, y: ry + 0.05, w: bw, h: bh, fill: { color: r.later ? C.main : C.sec }, line: { type: "none" } });
    if (r.text) T(r.text, bx + 0.06, ry + 0.05, bw - 0.3, bh, { pt: 14, color: C.white, margin: 0.02 });
  }));
  const GY1 = y;

  // ---------------- Potential Risks (the deck's "Key Assumptions" block) ----------------
  const RY = GY1 + 0.1;
  T("Potential Risks", X0, RY, 4.0, 0.36, { pt: 17, bold: true, color: C.rule, margin: 0.02 });
  slide.addShape("line", { x: X0, y: RY + 0.4, w: XR - X0, h: 0, line: { color: C.rule, width: 1.5 } });
  const risks = [
    "Economy downturn",
    "Suffer from slow ramp up problem when entering the new market",
    "Potential brand image cannibalization, fail to launch new products in the market as expected",
    "Market dynamics: customer behavior change, competitors' response, etc.",
  ];
  const BY = RY + 0.48, colW = (XR - X0) / 2, rowH = (7.2 - BY) / 2;
  risks.forEach((r, i) => {
    const cx = X0 + (i % 2) * colW, cy = BY + Math.floor(i / 2) * rowH;
    slide.addShape("ellipse", { x: cx + 0.1, y: cy + 0.09, w: 0.12, h: 0.12, fill: { color: C.rule }, line: { type: "none" } });
    T(r, cx + 0.34, cy, colW - 0.5, rowH, { valign: "top", margin: 0 });
  });

  // thin navy rule over the source line, as on the deck's content slides
  slide.addShape("line", { x: 0, y: 7.24, w: 13.333, h: 0, line: { color: C.main, width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
