// C02 (run0, rebuild 3): implementation Gantt (left ~60%) + challenges -> mitigations (right), in the Case-2019-Polaris style.
// Style: the deck's profile (Style/refs/Case-2019-Polaris.profile.json) via L.start. Furniture taken from the deck's OTHER slides
// (renders in bench/phase4/other-slides/): centred bold panel headers over a red rule and a dashed centre divider (Polaris 11, 12, 13),
// grey header cells with white text (Polaris 13), red lettered/numbered circles (Polaris 8, 12), red-outlined boxes (Polaris 12, 17),
// grey chevrons between blocks (Polaris 6, 13), grey filled text boxes (Polaris 10, 13).
// Gantt form: Style/refs/case-competitions-2019-2020.md section 5 ("Gantt under phase steps ... priority bars in the main colour").
// Assumptions (the prompt gives no dates for b. and c.): Enter new platforms 2019-20 prioritised then 2021-23 implementation;
// Optimize operations 2020-23 implementation; Data synchronization 2020-21 prioritised; Product mgt. & CRM 2021-23 implementation.
// "Open theme stores 2020-21 (implementation) then 2020-23 (prioritised)" is drawn as a grey 2020 bar followed by a red 2021-23 bar.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, RED = C.navy;               // profile main = CC0000
  const GREY = "A2A2A2", DARK = "7E7E7E", PANEL = "F1F1F1", LIGHT = "D5D5D5";
  const T = (text, x, y, w, h, o = {}) => P.txt(slide, text, x, y, w, h, { noScale: true, margin: 0.03, valign: "middle", ...o });
  const line = (x, y, w, h, color, width, dash) => slide.addShape("line", { x, y, w, h, line: { color, width, dashType: dash } });
  const circle = (label, x, y, d = 0.28) => {
    slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: RED }, line: { type: "none" } });
    T(label, x, y, d, d, { fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });
  };

  // ---------- panel frame: two centred headers on red rules, dashed divider ----------
  const LX = 0.37, LW = 7.5, RX = 8.27, RW = 12.98 - 8.27, TOP = 1.07, BOT = 7.0;
  const header = (text, x, w) => { T(text, x, TOP, w, 0.34, { fontSize: 14, bold: true, align: "center" }); line(x, TOP + 0.38, w, 0, RED, 1.5); };
  header("Implementation Timeline", LX, LW);
  header("Main Challenges and Potential Mitigations", RX, RW);
  line((LX + LW + RX) / 2, TOP, 0, BOT - TOP, GREY, 0.75, "dash");

  // ---------- left: Gantt 2019-2023 ----------
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const lblW = 2.95, gx = LX + lblW + 0.05, gw = LX + LW - gx, pw = gw / years.length;
  let y = TOP + 0.55;
  const hh = 0.34;
  slide.addShape("rect", { x: LX, y, w: lblW, h: hh, fill: { color: DARK }, line: { type: "none" } });
  T("Strategy", LX, y, lblW, hh, { fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });
  years.forEach((yr, i) => {
    slide.addShape("rect", { x: gx + i * pw + 0.02, y, w: pw - 0.04, h: hh, fill: { color: DARK }, line: { type: "none" } });
    T(yr, gx + i * pw, y, pw, hh, { fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });
  });
  y += hh + 0.06;

  // bars: [from, to, kind] in year units (0 = start of 2019); kind "p" = prioritised (red), "i" = implementation (grey)
  const groups = [
    { id: "a", name: "Offline Strategy", subs: [
      { name: "Store Expansion", rows: [
        ["Open new concept stores", [[0, 5, "p"]]],
        ["Open theme stores", [[1, 2, "i"], [2, 5, "p"]]],
        ["Open digital stores", [[2, 3, "p"]]],
      ] },
      { name: "Sales per Store Improvement", rows: [
        ["Loyal customer AD", [[1, 5, "p"]]],
        ["Charity series", [[0, 5, "p"]]],
        ["Personalized offerings", [[2, 5, "i"]]],
        ["Design competence", [[2, 5, "i"]]],
      ] },
    ] },
    { id: "b", name: "Online Strategy", subs: [{ rows: [
      ["Enter new platforms", [[0, 2, "p"], [2, 5, "i"]]],
      ["Optimize operations", [[1, 5, "i"]]],
    ] }] },
    { id: "c", name: "Omni-channel Strategy", subs: [{ rows: [
      ["Data synchronization", [[1, 3, "p"]]],
      ["Product mgt. & CRM", [[2, 5, "i"]]],
    ] }] },
  ];
  const legendH = 0.34, gh = 0.33, sh = 0.27;
  const nItems = groups.reduce((a, g) => a + g.subs.reduce((b, s) => b + s.rows.length, 0), 0);
  const nSubs = groups.reduce((a, g) => a + g.subs.filter((s) => s.name).length, 0);
  const avail = BOT - legendH - 0.08 - y - groups.length * gh - nSubs * sh;
  const rh = Math.min(0.36, avail / nItems);
  const gridTop = y;
  groups.forEach((g, gi) => {
    slide.addShape("rect", { x: LX, y: y + 0.03, w: LW, h: gh - 0.06, fill: { color: PANEL }, line: { type: "none" } });
    circle(g.id, LX + 0.06, y + (gh - 0.26) / 2, 0.26);
    T(g.name, LX + 0.4, y, lblW, gh, { fontSize: 13, bold: true });
    y += gh;
    g.subs.forEach((s) => {
      if (s.name) { T(s.name, LX + 0.4, y, lblW, sh, { fontSize: 12, bold: true, color: RED }); y += sh; }
      s.rows.forEach(([label, bars], ri) => {
        T("• " + label, LX + 0.5, y, lblW - 0.5, rh, { fontSize: 12 });
        bars.forEach(([f, t, k]) => slide.addShape("rect", { x: gx + f * pw + 0.04, y: y + rh * 0.26, w: (t - f) * pw - 0.08, h: rh * 0.48,
          fill: { color: k === "p" ? RED : GREY }, line: { type: "none" } }));
        y += rh;
      });
    });
    if (gi < groups.length - 1) line(LX, y + 0.02, LW, 0, LIGHT, 0.75);
    y += 0.04;
  });
  for (let i = 1; i < years.length; i++) line(gx + i * pw, gridTop, 0, y - gridTop, GREY, 0.5, "sysDot");
  // legend
  const ly = BOT - legendH;
  slide.addShape("rect", { x: LX + 0.9, y: ly + 0.1, w: 0.45, h: 0.15, fill: { color: RED }, line: { type: "none" } });
  T("Period for prioritized strategy", LX + 1.42, ly, 2.6, legendH, { fontSize: 12 });
  slide.addShape("rect", { x: LX + 4.2, y: ly + 0.1, w: 0.45, h: 0.15, fill: { color: GREY }, line: { type: "none" } });
  T("Period for implementation", LX + 4.72, ly, 2.4, legendH, { fontSize: 12 });

  // ---------- right: challenges -> mitigations ----------
  const cx = RX + 0.34, cw = 1.98, ax = cx + cw + 0.04, aw = 0.18, mx = ax + aw + 0.05, mw = RX + RW - mx;
  let ry = TOP + 0.55;
  slide.addShape("rect", { x: cx, y: ry, w: cw, h: hh, fill: { color: LIGHT }, line: { type: "none" } });
  T("Challenges", cx, ry, cw, hh, { fontSize: 13, bold: true, align: "center" });
  slide.addShape("rect", { x: mx, y: ry, w: mw, h: hh, fill: { color: LIGHT }, line: { type: "none" } });
  T("Mitigations", mx, ry, mw, hh, { fontSize: 13, bold: true, align: "center" });
  ry += hh + 0.12;
  const blocks = [
    { c: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
      m: ["Intensive staff training", "Work with local teams to conduct in-depth regional research", "Clear unauthorized suppliers"], h: 2.1 },
    { c: ["Competition from emerging players in entry luxury jewelry market"],
      m: ["Keep sustainability of a differentiate in product and positioning"], h: 1.22 },
    { c: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
      m: ["Negotiate with platforms and outsource market analytics"], h: 1.64 },
  ];
  const gap = 0.12, scale = (BOT - ry - gap * (blocks.length - 1)) / blocks.reduce((a, b) => a + b.h, 0);
  const bullets = (items) => items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: 3 } }));
  blocks.forEach((b, i) => {
    const h = b.h * scale;
    circle(String(i + 1), RX, ry + h / 2 - 0.14);
    slide.addShape("rect", { x: cx, y: ry, w: cw, h, fill: { color: PANEL }, line: { type: "none" } });
    T(bullets(b.c), cx + 0.06, ry + 0.04, cw - 0.1, h - 0.08, { fontSize: 13 });
    slide.addShape("chevron", { x: ax, y: ry + h / 2 - 0.22, w: aw, h: 0.44, fill: { color: GREY }, line: { type: "none" } });
    slide.addShape("rect", { x: mx, y: ry, w: mw, h, fill: { color: C.white }, line: { color: RED, width: 1.5 } });
    T(bullets(b.m), mx + 0.06, ry + 0.04, mw - 0.1, h - 0.08, { fontSize: 13 });
    ry += h + gap;
  });

  // ---------- footer furniture of the deck (every content slide): grey rule over the source line, client | team marks ----------
  line(0, 7.19, 12.97, 0, LIGHT, 0.75);
  slide.addText([{ text: "PANDORA", options: { color: "333333", charSpacing: 2 } }, { text: "  |  ", options: { color: GREY } },
     { text: "Polaris", options: { color: RED, bold: true } }], { x: 10.4, y: 7.25, w: 2.25, h: 0.22, fontFace: "Arial", fontSize: 12, align: "right", valign: "middle", margin: 0, isTextBox: true });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
