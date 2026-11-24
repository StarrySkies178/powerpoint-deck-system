// C08 risk slide in the style of the MindCraft deck (deck as reference, leave-one-out).
// Layout: two numbered panels side by side, as the deck's HALF2 slides (8, 14, 18): panel boxes from
// scripts/layout_skeleton.py on slide 14 (left panel from x 0.36, right panel to x 13.01, top 1.37), re-split so the
// solutions table gets the width its text needs at the deck's 14 pt body size.
// Panel 1: numbered risk heat map (riskMatrix form, storytelling rule: same numbers in the mitigation list), drawn as a
// 3 x 3 likelihood x severity grid because the brief gives Low / Medium / High on both axes.
// Panel 2: risk -> solution table, [Avoid] / [Mitigate] labels in the main colour as the deck's [Aim] / [How] labels (slide 8).
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, B, P, S } = L.start({
    ref: "Case-2019-Mindcraft",
    title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
    source: "Source: MindCraft Analysis",
    crumb: { items: ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], current: 2 },
  });
  const C = P.C, F = P.THEME.bodyFontFace;
  const RED = C.accent, DARK = C.g4, MID = C.g3;
  const bottom = B.y + B.h - 0.08;
  const left = { x: B.x, y: B.y, w: 4.85, h: bottom - B.y };
  const right = { x: B.x + 4.85 + 0.3, y: B.y, w: B.x + B.w - (B.x + 4.85 + 0.3), h: bottom - B.y };

  S.composeSlide(pres, slide, {
    regions: [left, right],
    panels: [
      { headline: "Risk mapping", draw: (sl, box) => heatMap(sl, box) },
      { headline: "Solutions for important risks", draw: (sl, box) => solutions(sl, box) },
    ],
  });

  // ---------- panel 1: heat map ----------
  function heatMap(sl, box) {
    P.txt(sl, "Likelihood × severity of identified risks", box.x, box.y, box.w, 0.32, { fontSize: 14, keepSize: true, noScale: true, color: DARK, margin: 0, valign: "middle" });
    sl._slideObjects[sl._slideObjects.length - 1].options.italic = true;
    const lvl = ["Low", "Medium", "High"];
    const axW = 0.32, tickW = 0.88, gx = box.x + axW + tickW, gy = box.y + 0.66, gw = box.x + box.w - gx - 0.05;
    const legendH = 1.5, gh = box.y + box.h - legendH - 0.12 - 0.62 - gy;   // room for tick labels, axis title, legend
    const cw = gw / 3, ch = gh / 3;
    const fills = ["F1F1F1", "F1F1F1", "D5D5D5", "A6A6A6", "A6A6A6"];      // heat by likelihood + severity, greys only
    for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++)
      sl.addShape("rect", { x: gx + si * cw, y: gy + (2 - li) * ch, w: cw, h: ch, fill: { color: fills[li + si] }, line: { color: "FFFFFF", width: 2 } });
    // axes: likelihood up the side, severity along the bottom
    lvl.forEach((t, i) => {
      P.txt(sl, t, gx - tickW, gy + (2 - i) * ch, tickW - 0.08, ch, { fontSize: 14, keepSize: true, noScale: true, align: "right", valign: "middle", margin: 0 });
      P.txt(sl, t, gx + i * cw, gy + gh + 0.04, cw, 0.3, { fontSize: 14, keepSize: true, noScale: true, align: "center", valign: "top", margin: 0 });
    });
    P.txt(sl, "Likelihood", box.x + axW / 2 - gh / 2, gy + gh / 2 - axW / 2, gh, axW, { fontSize: 14, keepSize: true, noScale: true, bold: true, align: "center", valign: "middle", rotate: 270, margin: 0 });
    P.txt(sl, "Severity", gx, gy + gh + 0.34, gw, 0.3, { fontSize: 14, keepSize: true, noScale: true, bold: true, align: "center", valign: "middle", margin: 0 });
    sl.addShape("line", { x: gx, y: gy + gh, w: gw + 0.05, h: 0, line: { color: MID, width: 1.25, endArrowType: "triangle" } });
    sl.addShape("line", { x: gx, y: gy - 0.05, w: 0, h: gh + 0.05, line: { color: MID, width: 1.25, beginArrowType: "triangle" } });
    // top-priority zone: high severity, medium and high likelihood
    const zx = gx + 2 * cw + 0.04, zy = gy + 0.04, zw = cw - 0.08, zh = 2 * ch - 0.08;
    sl.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 1.75, dashType: "dash" } });
    P.txt(sl, "Top priority", gx + 2 * cw - 0.1, gy - 0.34, cw + 0.15, 0.3, { fontSize: 14, keepSize: true, noScale: true, bold: true, color: RED, align: "center", valign: "bottom", margin: 0 });
    // numbered risks: likelihood (0-2) x severity (0-2); two risks in one cell sit side by side
    const risks = [
      { id: 1, l: 2, s: 2, k: 0, n: 2 }, { id: 2, l: 2, s: 2, k: 1, n: 2 },
      { id: 3, l: 1, s: 2, k: 0, n: 2 }, { id: 4, l: 1, s: 2, k: 1, n: 2 },
      { id: 5, l: 0, s: 2 }, { id: 6, l: 2, s: 0 }, { id: 7, l: 0, s: 1 }, { id: 8, l: 1, s: 0 },
    ];
    const d = 0.4;
    risks.forEach((r) => {
      const hot = r.id <= 4, n = r.n || 1, k = r.k || 0;
      const cx = gx + r.s * cw + cw * (k + 1) / (n + 1), cy = gy + (2 - r.l) * ch + ch / 2;
      sl.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : DARK }, line: { color: "FFFFFF", width: 1 } });
      P.txt(sl, String(r.id), cx - d / 2, cy - d / 2, d, d, { fontSize: 14, keepSize: true, noScale: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    });
    // legend of the risks outside the zone (1-4 are named in the table beside), in the deck's grey reading box
    const ly = box.y + box.h - legendH;
    sl.addShape("rect", { x: box.x, y: ly, w: box.w, h: legendH, fill: { color: C.g1 }, line: { type: "none" } });
    P.txt(sl, "Other risks to monitor", box.x + 0.12, ly + 0.08, box.w - 0.24, 0.28, { fontSize: 14, keepSize: true, noScale: true, bold: true, color: RED, margin: 0, valign: "middle" });
    const others = [[5, "Customer information safety"], [6, "Competitor's response"], [7, "Customer preference change"], [8, "Cannibalization"]];
    const rh = (legendH - 0.46) / others.length;
    others.forEach(([id, name], i) => {
      const y = ly + 0.38 + i * rh, dd = 0.24;
      sl.addShape("ellipse", { x: box.x + 0.14, y: y + (rh - dd) / 2, w: dd, h: dd, fill: { color: DARK }, line: { type: "none" } });
      P.txt(sl, String(id), box.x + 0.14, y + (rh - dd) / 2, dd, dd, { fontSize: 11, keepSize: true, noScale: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      P.txt(sl, name, box.x + 0.48, y, box.w - 0.56, rh, { fontSize: 14, keepSize: true, noScale: true, valign: "middle", margin: 0 });
    });
  }

  // ---------- panel 2: risks -> solutions ----------
  function solutions(sl, box) {
    const rows = [
      ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
        "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
      ["Talent management", "Insufficient supply of trained salespersons for rapid expansion",
        "Make recruitment plan in advance", "Reduce labor demand with technology"],
      ["Supply chain mgmt.", "Rapid store expansion requires agile logistics",
        "Optimize logistics network", "Find reliable third-party logistic partner"],
      ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
        "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
    ];
    const pt = 14, chipW = 0.5, c1 = 3.05, c2 = box.w - c1;
    const none = { type: "none" }, dash = { type: "dash", color: C.g2, pt: 0.75 }, rule = { type: "solid", color: MID, pt: 1 };
    const hdr = ["Risks", "Solutions"].map((t, j) => ({ text: t, options: { bold: true, italic: true, color: DARK, align: j ? "left" : "left", valign: "bottom",
      margin: [0.02, 0.08, 0.04, j ? 0.08 : chipW], border: [none, none, rule, none] } }));
    const lines = [5, 4, 3, 5], lh = (pt * 1.22) / 72, hH = 0.36;
    const need = lines.map((n) => n * lh + 0.16), sum = need.reduce((a, b) => a + b, 0), extra = Math.max(0, (box.h - hH - sum) / rows.length);
    const rowH = need.map((h) => h + extra);
    const body = rows.map((r, i) => [
      { text: [{ text: r[0], options: { bold: true, breakLine: true } }, { text: r[1] }],
        options: { valign: "middle", margin: [0.04, 0.08, 0.04, chipW], border: [none, none, i < rows.length - 1 ? dash : none, none] } },
      { text: [{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: r[2], options: { breakLine: true } },
               { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: r[3] }],
        options: { valign: "middle", margin: [0.04, 0.08, 0.04, 0.12], border: [none, none, i < rows.length - 1 ? dash : none, none] } },
    ]);
    sl.addTable([hdr, ...body], { x: box.x, y: box.y, w: box.w, colW: [c1, c2], rowH: [hH, ...rowH], fontFace: F, fontSize: pt, color: C.text, autoPage: false });
    // red numbered squares, the same numbers as on the heat map
    let y = box.y + hH;
    rowH.forEach((h, i) => {
      const s = 0.34;
      sl.addShape("rect", { x: box.x + 0.04, y: y + (h - s) / 2, w: s, h: s, fill: { color: RED }, line: { type: "none" } });
      P.txt(sl, String(i + 1), box.x + 0.04, y + (h - s) / 2, s, s, { fontSize: 14, keepSize: true, noScale: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
      y += h;
    });
  }

  await L.save(pres, __dirname + "/candidate.pptx");
})();
