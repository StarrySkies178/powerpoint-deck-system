// C05 rebuild (run1, r1): implementation timeline in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Frame (title band, crumb, page number) from the deck's style profile via bench_lib; the body is drawn here in the deck's
// own forms: a banded table look (navy header row, light-blue / grey group bands, white rules: E-Cluster appendix tables)
// carrying Gantt bars, and a navy label block + grey panel of bullets below (E-Cluster "Market KSF" row, exec-summary panel).
// build.py then fixes three frame details the profile does not carry (title inset, band colour as rendered, page number).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({ ref: "Case-2019-E-Cluster", title: "Implementation Timeline" });
  const C = P.C, FONT = "Arial";
  const NAVY = C.g5;            // 253449: header rows and label blocks as the deck renders them
  const BAR = C.cyan;           // 354B70: bars
  const BLUE = "DFECF5", GREY = C.g1;   // table bands of the deck (body_fill, panel)
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 15, color: o.color || C.text,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? [0, 4, 0, 4], isTextBox: true, paraSpaceAfter: o.psa || 0 });
  const rect = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
  const line = (x, y, w, h, color, width) => slide.addShape("line", { x, y, w, h, line: { color, width } });

  // breadcrumb: earlier sections grey, current section dark, as on the deck's other slides
  const crumb = [
    { text: "Market Overview", options: { color: "BEBEBE" } }, { text: " → ", options: { color: "BEBEBE" } },
    { text: "Strategy Design", options: { color: "BEBEBE" } }, { text: " → ", options: { color: "BEBEBE" } },
    { text: "Implementation: Timeline", options: { color: "202C4F" } }];
  slide.addText(crumb, { x: 0.3, y: 0.09, w: 9.5, h: 0.3, fontFace: FONT, fontSize: 15, bold: true, margin: 0, valign: "top", isTextBox: true });
  // thin rule above the footer, full width (on every content slide of the deck)
  line(0, 7.255, 13.333, 0, "202C4F", 1);

  // page number 12 (bold, in the deck's page-number colour); build.py removes the master's slide-number field
  slide.addText("12", { x: 12.22, y: 7.29, w: 0.8, h: 0.19, fontFace: FONT, fontSize: 10, bold: true, color: "10366C", align: "right", valign: "top", margin: 0, isTextBox: true });

  // ---------- Gantt ----------
  const X0 = 0.27, X1 = 13.07, LW = 5.4, GX = X0 + LW, years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const PW = (X1 - GX) / years.length;
  const HY = 1.5, HH = 0.42;
  rect(X0, HY, 13.1 - X0, HH, NAVY);   // to 13.1 in: covers the master's rule under it
  years.forEach((yr, i) => T(yr, GX + i * PW, HY, PW, HH, { bold: true, color: C.white, align: "center" }));
  T("Key initiatives", X0 + 0.08, HY, LW - 0.1, HH, { bold: true, color: C.white });

  // rows: kind top (own bar), group (summary), sub (own bar, indented)
  const rows = [
    { block: 0, kind: "top", label: "New Product R&D", from: 0, to: 1 },
    { block: 1, kind: "top", label: "Marketing & Reshaping Brand", from: 0, to: 3 },
    { block: 2, kind: "group", label: "Offline: City Penetration Steps", from: 0, to: 6 },
    { block: 2, kind: "sub", label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 3 },
    { block: 2, kind: "sub", label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 6 },
    { block: 3, kind: "group", label: "Omni Channel Building", from: 0, to: 6 },
    { block: 3, kind: "sub", label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 2 },
    { block: 3, kind: "sub", label: "Further integrate online and offline channels", from: 2, to: 6 },
  ];
  const RH = { top: 0.44, group: 0.4, sub: 0.5 };
  let y = HY + HH + 0.04;
  const top = y, ys = [];
  rows.forEach((r) => { ys.push(y); y += RH[r.kind]; });
  const bottom = y;
  // bands per block (light blue / grey alternating), grey rule between blocks
  [0, 1, 2, 3].forEach((b) => {
    const idx = rows.map((r, i) => (r.block === b ? i : -1)).filter((i) => i >= 0);
    const y0 = ys[idx[0]], y1 = ys[idx[idx.length - 1]] + RH[rows[idx[idx.length - 1]].kind];
    rect(X0, y0, X1 - X0, y1 - y0, b % 2 ? GREY : BLUE);
    if (b) line(X0, y0, X1 - X0, 0, "A6A6A6", 1);
  });
  // white column rules through the bands
  for (let i = 0; i <= years.length - 1; i++) line(GX + i * PW, top, 0, bottom - top, C.white, 1.5);
  rows.forEach((r, i) => {
    const ry = ys[i], h = RH[r.kind];
    if (r.kind === "sub") T([{ text: r.label, options: { bullet: { indent: 14 } } }], X0 + 0.25, ry, LW - 0.3, h, { size: 14 });
    else T(r.label, X0 + 0.04, ry, LW - 0.1, h, { bold: true, color: r.kind === "group" ? "10366C" : C.text });
    const bx = GX + r.from * PW + 0.06, bw = (r.to - r.from) * PW - 0.12;
    if (r.kind === "group") {          // summary bracket over the whole workstream
      rect(bx, ry + h / 2 - 0.04, bw, 0.08, NAVY);
      slide.addShape("triangle", { x: bx, y: ry + h / 2 + 0.03, w: 0.14, h: 0.1, flipV: true, fill: { color: NAVY }, line: { type: "none" } });
      slide.addShape("triangle", { x: bx + bw - 0.14, y: ry + h / 2 + 0.03, w: 0.14, h: 0.1, flipV: true, fill: { color: NAVY }, line: { type: "none" } });
    } else rect(bx, ry + h / 2 - 0.13, bw, 0.26, BAR);
  });

  // ---------- Potential risks ----------
  const RY = bottom + 0.14, RHt = 7.13 - RY, LB = 2.1;
  rect(X0, RY, LB, RHt, NAVY);
  T("Potential Risks", X0 + 0.1, RY, LB - 0.2, RHt, { bold: true, color: C.white, size: 17 });
  const PX = X0 + LB + 0.1, PWd = X1 - PX;
  rect(PX, RY, PWd, RHt, GREY);
  const risks = [
    ["Economy downturn", "Suffer from slow ramp up problem when entering the new market"],
    ["Potential brand image cannibalization, fail to launch new products in the market as expected",
     "Market dynamics: customer behavior change, competitors' response, etc."],
  ];
  const cw = (PWd - 0.3) / 2;
  risks.forEach((col, j) => {
    T(col.map((t, k) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: k < col.length - 1 } })),
      PX + 0.15 + j * (cw + 0.1), RY + 0.16, cw - 0.05, RHt - 0.26, { size: 15, psa: 6, valign: "top" });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
