// C04 (run7 r3): two-chart market slide in the E-Cluster deck's style (deck as reference, leave-one-out).
// Layout taken from the deck's own T2B1 market slide (other slide, same layout code): two numbered panels on top,
// a numbered panel of three icon points in a grey band underneath. Charts drawn with shapes, labelled directly,
// no value axis (profile chart entry), as the deck draws them.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const REF = "Case-2019-E-Cluster";

(async () => {
  const { pres, slide, P, S, prof } = L.start({
    ref: REF,
    title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
    source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
    crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
  });
  const F = P.THEME.bodyFontFace;
  const PS = prof.panel;                      // the deck's sub-headline: ellipse chip, 17 pt bold headline, rule
  const HEAD = PS.colour, CHIP = PS.fill;     // 10366C, 283954
  const DARK = "10366C", LIGHT = "C1DBEB", MID = prof.roles.secondary, RED = "CC0000", GREY = "7E7E7E";
  const LAB = prof.body.label_pt;             // 14 pt: chart labels
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || LAB, color: o.color || "000000", bold: !!o.bold, italic: !!o.italic,
    align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true, underline: o.underline ? { style: "sng" } : undefined });
  const line = (x, y, w, h, color, width = 1, extra = {}) => slide.addShape("line", { x, y, w, h, line: { color, width, ...extra } });

  // numbered sub-headline: chip + bold headline + rule underneath
  function head(n, text, x, y, ruleX, ruleW) {
    slide.addShape("ellipse", { x, y, w: 0.31, h: 0.31, fill: { color: CHIP }, line: { type: "none" } });
    T(String(n), x, y, 0.31, 0.31, { size: PS.chip_pt, color: "FFFFFF", align: "center", valign: "middle" });
    T(text, x + 0.35, y - 0.02, ruleX + ruleW - x - 0.35, 0.33, { size: PS.pt, bold: true, color: HEAD, valign: "middle" });
    line(ruleX, y + 0.33, ruleW, 0, HEAD, PS.rule[1]);
  }

  // ---------- panel 1: market size stacked columns + CAGR table ----------
  head(1, "Fine jewelry has a lower growth rate", 0.27, 1.43, 0.64, 5.75);
  T("China fine jewelry annual market size and growth", 0.63, 1.85, 5.7, 0.26);
  T("CNY Billion", 0.63, 2.1, 2.0, 0.26, { italic: true });
  const base = 4.4, k = 1.62 / 998, colW = 0.62;
  const mkt = [["2013", 532, 0.15], ["2018", 722, 0.18], ["2023E", 998, 0.24]];
  mkt.forEach(([yr, tot, fs], i) => {
    const cx = 1.05 + i * 0.9, h = tot * k, hf = h * fs;
    slide.addShape("rect", { x: cx - colW / 2, y: base - h, w: colW, h: h - hf, fill: { color: LIGHT }, line: { type: "none" } });
    slide.addShape("rect", { x: cx - colW / 2, y: base - h, w: colW, h: hf, fill: { color: DARK }, line: { type: "none" } });
    T(String(tot), cx - 0.4, base - h - 0.3, 0.8, 0.26, { align: "center" });
    T(yr, cx - 0.45, base + 0.06, 0.9, 0.26, { align: "center" });
  });
  line(0.66, base, 2.6, 0, "000000", 0.75);
  // CAGR table beside the stack
  const tx = 3.42, c1 = 5.0, c2 = 5.73, cw = 0.66;
  [["13-18", c1], ["18-23", c2]].forEach(([h, x]) => T([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: h, options: {} }], x - 0.05, 2.3, cw + 0.1, 0.5, { align: "center" }));
  const rows = [["Fashion jewelry", "9%", "13%", DARK], ["Fine jewelry", "4%", "5%", LIGHT], ["Total", "4%", "7%", null]];
  rows.forEach(([name, a, b, col], r) => {
    const y = 2.95 + r * 0.52;
    if (col) slide.addShape("rect", { x: tx, y: y + 0.17, w: 0.16, h: 0.16, fill: { color: col }, line: { type: "none" } });
    T(name, tx + 0.22, y, 1.36, 0.5, { valign: "middle", bold: !col });
    T(a, c1, y, cw, 0.5, { align: "center", valign: "middle", bold: !col });
    T(b, c2, y, cw, 0.5, { align: "center", valign: "middle", bold: !col });
  });
  slide.addShape("ellipse", { x: c1 + 0.02, y: 2.95 + 0.52 + 0.02, w: cw - 0.04, h: 0.46, fill: { type: "none" }, line: { color: RED, width: 1.5 } });

  // ---------- panel 2: CTF revenue columns + 2018 split ----------
  head(2, "Fine jewelry accounts for the majority of CTF*", 6.86, 1.43, 7.3, 5.78);
  T("CTF's annual revenue", 7.3, 1.85, 2.8, 0.26);
  T("CNY Billion", 7.3, 2.1, 2.0, 0.26, { italic: true });
  const k2 = 1.35 / 48;
  [["2013", 47], ["2018", 48]].forEach(([yr, v], i) => {
    const cx = 7.9 + i * 1.1, h = v * k2;
    slide.addShape("rect", { x: cx - 0.31, y: base - h, w: 0.62, h, fill: { color: MID }, line: { type: "none" } });
    T(String(v), cx - 0.4, base - h - 0.3, 0.8, 0.26, { align: "center" });
    T(yr, cx - 0.45, base + 0.06, 0.9, 0.26, { align: "center" });
  });
  line(7.35, base, 2.2, 0, "000000", 0.75);
  slide.addShape("line", { x: 7.55, y: 2.62, w: 1.85, h: 0, line: { color: "000000", width: 1.5, endArrowType: "triangle" } });
  slide.addShape("ellipse", { x: 7.88, y: 2.44, w: 1.15, h: 0.36, fill: { color: "FFFFFF" }, line: { color: "000000", width: 1 } });
  T("CAGR 1%", 7.88, 2.44, 1.15, 0.36, { bold: true, align: "center", valign: "middle" });

  line(9.75, 1.95, 0, 2.75, prof.roles.grey4, 0.75);
  T("CTF's 2018 revenue by segment", 9.9, 1.85, 3.18, 0.26);
  T("%", 9.9, 2.1, 1.0, 0.26, { italic: true });
  S.shareColumn(slide, { parts: [{ label: "Fine jewelry", value: 89 }, { label: "Fashion jewelry", value: 11, hi: true }], colors: [LIGHT, DARK], caption: "2018", colW: 0.62, fontSize: LAB / (P.HOUSE.TYPE.body / 12.5) },   // txt() scales by body/12.5: this lands on 14 pt
    { x: 10.0, y: 2.55, w: 3.08, h: 2.24 });

  // ---------- panel 3: three constraints, icon points in a grey band ----------
  head(3, "Major constraints limit the further development of fine jewelry", 0.27, 4.91, 0.64, 12.45);
  slide.addShape("rect", { x: 0.64, y: 5.28, w: 12.45, h: 1.72, fill: { color: prof.roles.panel }, line: { type: "none" } });
  const pts = [
    ["users", "Customer changing preference", "New emerging customers value the fashion design more and show different preference"],
    ["gavel", "Tightened anti-corruption policies", "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption"],
    ["trophy", "Increasingly fierce competition", "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment"],
  ];
  const bw = 12.45 / 3;
  pts.forEach(([ic, lab, body], i) => {
    const x = 0.64 + i * bw;
    if (i) line(x, 5.6, 0, 1.25, prof.roles.grey4, 0.75);
    P.icon(slide, ic, x + 0.14, 5.43, 0.32, { color: GREY });
    T(lab, x + 0.52, 5.4, bw - 0.6, 0.36, { size: prof.body.pt, bold: true, valign: "middle" });
    T(body, x + 0.52, 5.8, bw - 0.66, 1.1, { size: prof.body.pt, italic: true });
  });

  // ---------- footer: note, rule over the source line ----------
  T("Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.04, 6.0, 0.19, { size: 10, italic: true, color: prof.source_line.colour });
  line(0, 7.25, 13.33, 0, "202C4F", 0.75);

  await L.save(pres, __dirname + "/candidate.pptx");
})();
