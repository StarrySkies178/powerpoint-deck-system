// C05 variant b: implementation timeline (Gantt grid) with a risks callout, in the E-Cluster deck style.
// Style: Style/refs/Case-2019-E-Cluster.profile.json (title band, crumb, page number from the master).
// Header logo: the deck's own logo pictures, as stored with its other slides (slide 4, 5, 6, 13, 22 objects in
// Objects/store, media 2062e202a8d83254.jpg + be0ee93660a28c8a.jpg), copied here and placed where those slides keep it.
// No generator draws a ruled-grid Gantt with standalone bold rows that carry bars, so the grid is a native table
// and the bars are shapes over it, in the profile's colours and sizes.
const path = require("path");
const L = require(path.join(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, HOUSE, prof } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Implementation Timeline",
    crumb: { items: ["Market Overview", "Strategy Design", "Implementation: Timeline"], current: 2, sep: " → " },
  });
  const C = P.C, F = HOUSE.FONT.latin;
  const main = C.navy, sec = C.cyan, text = C.text;

  // ---- logo (icon + wordmark), top right, as on the deck's other slides
  slide.addImage({ path: path.join(__dirname, "logo-icon.jpg"), x: 11.558, y: 0.027, w: 0.3375, h: 0.371 });
  slide.addImage({ path: path.join(__dirname, "logo-wordmark.jpg"), x: 11.916, y: 0.108, w: 1.1184, h: 0.2275 });

  // ---- Gantt grid
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const rows = [
    { label: "New Product R&D", bold: true, from: 0, to: 0 },
    { label: "Marketing & Reshaping Brand", bold: true, from: 0, to: 2 },
    { label: "Offline: City Penetration Steps", bold: true },
    { label: "Set up 3~5 monobrand stores in prioritized and secondary cities", from: 0, to: 2 },
    { label: "Further expand into the tertiary cities with ~50 more stores", from: 3, to: 5 },
    { label: "Omni Channel Building", bold: true },
    { label: "Adjust the product offering and enter key e-commerce platforms", from: 0, to: 1 },
    { label: "Further integrate online and offline channels", from: 3, to: 5 },
  ];
  const x0 = 0.27, wAll = 13.07 - x0, lw = 5.2, cw = (wAll - lw) / years.length;
  const yLab = 1.47, gy = 1.82, hHead = 0.4, hTask = 0.52;
  const rh = rows.map((r) => (r.bold ? hHead : hTask));
  const pt = 14, rule = { type: "solid", color: C.g4, pt: 0.75 };

  years.forEach((y, j) => slide.addText(y, { x: x0 + lw + j * cw, y: yLab, w: cw, h: 0.32, fontFace: F, fontSize: pt, bold: true, color: main,
    align: "center", valign: "bottom", margin: 0 }));

  const tRows = rows.map((r) => [
    { text: r.label, options: { bold: !!r.bold, color: r.bold ? main : text, margin: [0, 0.08, 0, r.bold ? 0.08 : 0.3] } },
    ...years.map(() => ({ text: "" })),
  ]);
  slide.addTable(tRows, { x: x0, y: gy, w: wAll, colW: [lw, ...years.map(() => cw)], rowH: rh, h: rh.reduce((a, b) => a + b, 0),
    fontFace: F, fontSize: pt, color: text, valign: "middle", border: rule, fill: { color: "FFFFFF" }, margin: 0.04 });

  // bars over the table, one per row, across consecutive year cells
  let y = gy;
  rows.forEach((r, i) => {
    if (r.from != null) {
      const bh = Math.min(0.26, rh[i] * 0.55);
      slide.addShape("rect", { x: x0 + lw + r.from * cw + 0.06, y: y + (rh[i] - bh) / 2, w: (r.to - r.from + 1) * cw - 0.12, h: bh,
        fill: { color: sec }, line: { type: "none" }, objectName: "bar " + (i + 1) });
    }
    y += rh[i];
  });

  // ---- risks callout: filled label box + outlined box with the list
  const ry = y + 0.2, rH = 7.12 - ry, labW = 2.3, gap = 0.15;
  slide.addShape("rect", { x: x0, y: ry, w: labW, h: rH, fill: { color: main }, line: { type: "none" } });
  slide.addText("Potential Risks", { x: x0, y: ry, w: labW, h: rH, fontFace: F, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0.08 });
  const risks = [
    "Economy downturn",
    "Suffer from slow ramp up problem when entering the new market",
    "Potential brand image cannibalization, fail to launch new products in the market as expected",
    "Market dynamics: customer behavior change, competitors' response, etc.",
  ];
  const bx = x0 + labW + gap, bw = 13.07 - bx;
  slide.addShape("rect", { x: bx, y: ry, w: bw, h: rH, fill: { type: "none" }, line: { color: main, width: 1 } });
  slide.addText(risks.map((t, i) => ({ text: t, options: { bullet: { code: "25CF" }, breakLine: i < risks.length - 1 } })),
    { x: bx + 0.15, y: ry + 0.05, w: bw - 0.3, h: rH - 0.1, fontFace: F, fontSize: pt, color: text, valign: "middle", margin: 0.04, paraSpaceAfter: 4 });

  // ---- footer rule across the slide (page number comes from the master; numbering starts at 12 in build.py)
  slide.addShape("line", { x: 0, y: 7.255, w: 13.333, h: 0, line: { color: main, width: 0.75 } });

  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
