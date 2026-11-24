// C02 rebuild 3: implementation Gantt (left, ~60%) + challenges and mitigations (right), in the style of Case-2019-Polaris.
// Deck as reference, leave-one-out: style profile + forms of the deck's other slides (Polaris 10-13: centred bold panel
// heads over a red rule, dashed grey divider between panels, grey header boxes with white text, red number circles,
// grey filled boxes, red outlined boxes, grey down-chevron between steps; footer rule + logos as on every content slide).
// Assumption: the prompt gives no years for the online and omni-channel rows; they are set to a plausible sequence
// (online first, omni-channel after) and should be checked by the team.
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, RED = C.navy /* main CC0000 */, G3 = "7E7E7E", G4 = "A2A2A2", PANEL = "F1F1F1", MID = "D5D5D5";
  const T = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { keepSize: true, fontSize: 14, margin: 0.03, ...o });
  const line = (x, y, w, h, color, width = 0.75, dash) => slide.addShape("line", { x, y, w, h, line: { color, width, dashType: dash } });

  // ---------- panel heads and divider ----------
  const LX = 0.37, LR = 7.95, RX = 8.3, RR = 13.0, HY = 1.1;
  T("Implementation Timeline", LX, HY, LR - LX, 0.36, { bold: true, align: "center", valign: "middle" });
  line(LX + 0.05, HY + 0.4, LR - LX - 0.1, 0, RED, 1.25);
  T("Main Challenges and Potential Mitigations", RX, HY, RR - RX, 0.36, { bold: true, align: "center", valign: "middle" });
  line(RX + 0.05, HY + 0.4, RR - RX - 0.1, 0, RED, 1.25);
  line(8.12, 1.15, 0, 5.8, G4, 0.75, "dash");

  // ---------- left: Gantt ----------
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const subX = LX, subW = 1.22, labX = LX + subW + 0.06, labW = 2.05, gx = labX + labW, pw = (LR - gx) / years.length;
  const yh = 1.62;
  years.forEach((yr, i) => {
    slide.addShape("rect", { x: gx + i * pw + 0.03, y: yh, w: pw - 0.06, h: 0.34, fill: { color: G3 }, line: { type: "none" } });
    T(yr, gx + i * pw + 0.03, yh, pw - 0.06, 0.34, { bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  });
  // rows: from/to in year index (to = last year + 1); kind p = prioritised (red), i = implementation (grey)
  const groups = [
    { name: "a. Offline Strategy", subs: [
      { name: "Store Expansion", rows: [
        { label: "Open new concept stores", bars: [[0, 5, "p"]] },
        { label: "Open theme stores", bars: [[1, 5, "p"], [1, 3, "i"]] },
        { label: "Open digital stores", bars: [[2, 3, "p"]] } ] },
      { name: "Sales per Store Improvement", rows: [
        { label: "Loyal customer AD", bars: [[1, 5, "p"]] },
        { label: "Charity series", bars: [[0, 5, "p"]] },
        { label: "Personalized offerings", bars: [[2, 5, "i"]] },
        { label: "Design competence", bars: [[2, 5, "i"]] } ] } ] },
    { name: "b. Online Strategy", subs: [{ rows: [
      { label: "Enter new platforms", bars: [[0, 2, "p"]] },
      { label: "Optimize operations", bars: [[1, 5, "i"]] } ] }] },
    { name: "c. Omni-channel Strategy", subs: [{ rows: [
      { label: "Data synchronization", bars: [[1, 3, "p"]] },
      { label: "Product mgt. & CRM", bars: [[2, 5, "i"]] } ] }] },
  ];
  const top = yh + 0.42, bottom = 6.5, gh = 0.34;
  const nItems = groups.reduce((a, g) => a + g.subs.reduce((b, s) => b + s.rows.length, 0), 0);
  const rh = (bottom - top - groups.length * gh) / nItems;
  for (let i = 1; i < years.length; i++) line(gx + i * pw, top, 0, bottom - top, G4, 0.5, "dash");
  let y = top;
  const bar = (b, yy) => {
    const [f, t, k] = b, bh = 0.2;
    slide.addShape("homePlate", { x: gx + f * pw + 0.05, y: yy + (rh - bh) / 2, w: (t - f) * pw - 0.1, h: bh,
      fill: { color: k === "p" ? RED : G4 }, line: { type: "none" } });
  };
  groups.forEach((g, gi) => {
    slide.addShape("rect", { x: LX, y: y + 0.03, w: LR - LX, h: gh - 0.06, fill: { color: PANEL }, line: { type: "none" } });
    T(g.name, LX + 0.06, y, LR - LX - 0.1, gh, { bold: true, color: RED, valign: "middle" });
    y += gh;
    g.subs.forEach((s, si) => {
      const y0 = y, merged = !s.name;
      if (s.name) T(s.name, subX + 0.06, y0, subW - 0.08, s.rows.length * rh, { bold: true, fontSize: 12, valign: "middle" });
      s.rows.forEach((r) => {
        T(r.label, merged ? subX + 0.06 : labX, y, merged ? labW + subW : labW, rh, { fontSize: 12, valign: "middle" });
        r.bars.forEach((b) => bar(b, y));
        y += rh;
      });
      if (s.name) line(subX + subW, y0 + 0.04, 0, s.rows.length * rh - 0.08, G4, 0.75);
      if (si < g.subs.length - 1) line(LX, y, LR - LX, 0, MID, 0.75, "dash");
    });
  });
  line(LX, bottom + 0.02, LR - LX, 0, G4, 0.75);
  // legend
  const ly = bottom + 0.1;
  slide.addShape("homePlate", { x: LX + 0.4, y: ly + 0.07, w: 0.45, h: 0.16, fill: { color: RED }, line: { type: "none" } });
  T("Period for prioritized strategy", LX + 0.92, ly, 2.9, 0.3, { fontSize: 12, valign: "middle" });
  slide.addShape("homePlate", { x: LX + 3.95, y: ly + 0.07, w: 0.45, h: 0.16, fill: { color: G4 }, line: { type: "none" } });
  T("Period for implementation", LX + 4.47, ly, 2.6, 0.3, { fontSize: 12, valign: "middle" });

  // ---------- right: challenges -> mitigations ----------
  const blocks = [
    { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
      mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", chH: 0.98, mH: 0.78 },
    { ch: ["Competition from emerging players in entry luxury jewelry market"],
      mit: "Keep sustainability of a differentiate in product and positioning", chH: 0.62, mH: 0.56 },
    { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
      mit: "Negotiate with platforms and outsource market analytics", chH: 0.86, mH: 0.56 },
  ];
  const cx = RX + 0.45, cw = RR - cx, d = 0.32, chevH = 0.16, gap = 0.14;
  let by = 1.66;
  blocks.forEach((b, i) => {
    // number circle (as the deck's red numbered chips)
    slide.addShape("ellipse", { x: RX, y: by + (b.chH - d) / 2, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
    T(String(i + 1), RX, by + (b.chH - d) / 2, d, d, { bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    // challenges: grey filled box with bullets
    slide.addShape("rect", { x: cx, y: by, w: cw, h: b.chH, fill: { color: PANEL }, line: { type: "none" } });
    slide.addText(b.ch.map((t) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: true } })),
      { x: cx + 0.06, y: by, w: cw - 0.1, h: b.chH, fontFace: "Arial", fontSize: 14, color: C.text, valign: "middle", margin: 0.03, isTextBox: true });
    by += b.chH;
    // grey down chevron
    // chevron points right; turned 90 degrees about its centre it points down, centred in the gap
    slide.addShape("chevron", { x: cx + cw / 2 - chevH / 2, y: by + 0.11 - 0.2, w: chevH, h: 0.4, rotate: 90, fill: { color: G3 }, line: { type: "none" } });
    by += 0.22;
    // mitigation: red outlined box
    slide.addShape("rect", { x: cx, y: by, w: cw, h: b.mH, fill: { color: "FFFFFF" }, line: { color: RED, width: 1.5 } });
    slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit }],
      { x: cx + 0.06, y: by, w: cw - 0.12, h: b.mH, fontFace: "Arial", fontSize: 14, color: C.text, valign: "middle", margin: 0.03, isTextBox: true });
    by += b.mH + gap;
  });

  // footer rule above the source line, as on every content slide of the deck (logos and page number: build.py)
  line(0, 7.217, 12.97, 0, "B4B4B4", 0.72);
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
