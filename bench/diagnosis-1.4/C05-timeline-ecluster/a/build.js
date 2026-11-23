// C05 variant a: "Implementation Timeline" in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Approach: the deck's style profile (title band, crumb, fonts, colours) through the harness; the Gantt is a native
// table in the deck's table look (navy header, light-blue / grey bands, italic group labels: E-Cluster 22-24) with bars
// drawn over the year columns; the risks row copies the deck's label-block + grey icon cards (E-Cluster 7, "Market KSF").
// build.py then adds the deck's master logo and the page number 12.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, prof } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Implementation Timeline",
    crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
  });
  const C = P.C, txt = P.txt, B = P.BODY;
  const NAVY = prof.panel.fill; // 283954: table headers and label blocks in the deck (E-Cluster 7, 23, 24)
  const BLUE = "DFECF5";      // light-blue band of the deck's tables
  const GREY = C.g1;          // F1F1F1
  const BAR = C.cyan;         // 354B70
  const BAR2 = "63A4CC";      // the deck's mid blue (second rank colour)

  // ---------------- Gantt table ----------------
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const rows = [
    { label: "New Product R&D", from: 0, to: 0 },
    { label: "Marketing & Reshaping Brand", from: 0, to: 2 },
    { group: "Offline: City Penetration Steps" },
    { label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 2, sub: true },
    { label: "Further expand into the tertiary cities with ~50 more stores", from: 2, to: 5, sub: true },
    { group: "Omni Channel Building" },
    { label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 1, sub: true },
    { label: "Further integrate online and offline channels", from: 2, to: 5, sub: true },
  ];
  const x0 = B.x, tw = B.w, lw = 6.0, cw = (tw - lw) / years.length;
  // body top from the profile (1.43 in): the harness's BODY starts under a stray profile rule at 1.74 in (removed in build.py)
  const y0 = prof.margins.body_top + 0.05, hh = 0.46, gh = 0.4, rh = 0.5;
  const bottom = B.y + B.h;
  const font = P.THEME.bodyFontFace;
  const hdr = [{ text: "", options: { bold: true, color: "FFFFFF", fill: { color: NAVY }, align: "left", fontSize: 15 } },
    ...years.map((y) => ({ text: y, options: { bold: true, color: "FFFFFF", fill: { color: NAVY }, align: "center", fontSize: 15 } }))];
  let band = 0;
  const body = rows.map((r) => {
    if (r.group) { band++; return [{ text: r.group, options: { bold: true, italic: true, color: C.navy, fill: { color: BLUE }, colspan: years.length + 1, fontSize: 14 } }]; }
    const fill = { color: r.sub ? "FFFFFF" : GREY };
    return [{ text: r.label, options: { color: C.text, fill, fontSize: 14, bold: !r.sub, margin: [0.02, 0.08, 0.02, r.sub ? 0.35 : 0.1] } },
      ...years.map(() => ({ text: "", options: { fill } }))];
  });
  const rowH = [hh, ...rows.map((r) => (r.group ? gh : rh))];
  const th = rowH.reduce((a, b) => a + b, 0);
  slide.addTable([hdr, ...body], {
    x: x0, y: y0, w: tw, h: th, colW: [lw, ...years.map(() => cw)], rowH, fontFace: font, fontSize: 14, color: C.text, valign: "middle",
    margin: [0.02, 0.1, 0.02, 0.1], border: { type: "solid", color: "FFFFFF", pt: 1.5 },
  });
  // year separators (dashed, as the deck's table rules) and the bars
  const top = y0 + hh;
  for (let j = 1; j < years.length; j++)
    slide.addShape("line", { x: x0 + lw + j * cw, y: top, w: 0, h: th - hh, line: { color: C.g2, width: 0.75, dashType: "dash" } });
  let y = top;
  rows.forEach((r, i) => {
    const h = rowH[i + 1];
    if (!r.group) {
      const bx = x0 + lw + r.from * cw + 0.08, bw = (r.to - r.from + 1) * cw - 0.16;
      slide.addShape("homePlate", { x: bx, y: y + h * 0.22, w: bw, h: h * 0.56, fill: { color: r.sub ? BAR2 : BAR }, line: { type: "none" }, rectRadius: 0 });
    }
    y += h;
  });
  slide.addShape("line", { x: x0, y: y0 + th, w: tw, h: 0, line: { color: NAVY, width: 1.5 } });

  // ---------------- Potential risks: label block + grey icon cards (2 x 2) ----------------
  const ry = y0 + th + 0.2, rhh = bottom - ry, lbw = 1.75, gap = 0.12;
  slide.addShape("rect", { x: x0, y: ry, w: lbw, h: rhh, fill: { color: NAVY }, line: { type: "none" } });
  txt(slide, "Potential Risks", x0 + 0.15, ry, lbw - 0.25, rhh, { fontSize: 16, keepSize: true, bold: true, color: "FFFFFF", valign: "middle", onDark: true });
  const risks = [
    { icon: "trending-down", text: "Economy downturn" },
    { icon: "hourglass", text: "Suffer from slow ramp up problem when entering the new market" },
    { icon: "alert-triangle", text: "Potential brand image cannibalization, fail to launch new products in the market as expected" },
    { icon: "users", text: "Market dynamics: customer behavior change, competitors' response, etc." },
  ];
  const cx0 = x0 + lbw + gap, cwid = (x0 + tw - cx0 - gap) / 2, chh = (rhh - gap) / 2;
  risks.forEach((r, i) => {
    const x = cx0 + (i % 2) * (cwid + gap), y = ry + Math.floor(i / 2) * (chh + gap);
    slide.addShape("rect", { x, y, w: cwid, h: chh, fill: { color: GREY }, line: { type: "none" } });
    P.icon(slide, r.icon, x + 0.15, y + (chh - 0.4) / 2, 0.4, { color: C.g4, width: 1.5 });
    txt(slide, r.text, x + 0.68, y + 0.03, cwid - 0.78, chh - 0.06, { fontSize: 14, keepSize: true, bold: true, color: C.cyan, valign: "middle" });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
