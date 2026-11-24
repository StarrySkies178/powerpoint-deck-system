// C08 rebuild 2: risk heat map + risk -> solutions table, in the style of Case-2019-Mindcraft (deck as reference).
// Layout: HALF2 as on the deck's other two-panel slides (Mindcraft 8, 14, 18): numbered red chip + bold panel head + grey rule.
// Panel 1: 3x3 heat map (severity x likelihood) drawn on the deck's greys, numbered dots, dashed red "Top priority" zone.
// Panel 2: Risks | Solutions table in the deck's own [Aim]/[How] form (Mindcraft 8): red bold bracket tags, grey/white sub-rows,
//          dashed rules between groups; risk numbers repeat the heat-map dots.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));
const { pres, slide, P, S, B } = L.start({
  ref: "Case-2019-Mindcraft",
  title: "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion",
  source: "Source: MindCraft Analysis",
});
const C = P.C, F = P.THEME.bodyFontFace;
const RED = C.accent, DARK = "5C5C5C", MID = "A6A6A6", LIGHT = "D5D5D5", PANEL = "F1F1F1", BLACK = "000000";

// section tracker as the deck draws it (Mindcraft 8, 12, 14): bold italic 14 pt, past/next sections grey, the current one red,
// red triangles between them (drawn here: the generators' crumb puts grey text arrows)
{ const cs = L.HOUSE.STYLE.crumb, items = ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], cur = 2;
  let x = cs.x;
  items.forEach((t, i) => {
    const w = t.length * 0.128 + 0.1;
    slide.addText(t, { x, y: cs.y, w, h: 0.3, fontFace: F, fontSize: cs.pt, bold: true, italic: true, color: i === cur ? RED : MID, margin: 0, valign: "top", wrap: false, isTextBox: true });
    x += w + 0.12;
    if (i < items.length - 1) { slide.addShape("triangle", { x, y: cs.y + 0.05, w: 0.22, h: 0.22, rotate: 90, fill: { color: RED }, line: { type: "none" } }); x += 0.22 + 0.3; }
  });
}

// ---------------- panel boxes (HALF2, table panel wider: its text stays at the deck's 14 pt) ----------------
const top = B.y, bot = B.y + B.h, lw = 4.85, gap = 0.3;
const left = { x: B.x, y: top, w: lw, h: bot - top };
const right = { x: B.x + lw + gap, y: top, w: B.w - lw - gap, h: bot - top };

// ---------------- panel 1: heat map ----------------
function heatMap(sl, bx) {
  const ax = bx.x + 0.75, aw = bx.w - 0.8, ay = bx.y + 0.05, ah = bx.h - 0.7;   // grid area
  const cw = aw / 3, ch = ah / 3;
  // cell shade = risk level (severity + likelihood): light grey low, darker grey high
  const shade = (sv, lk) => [PANEL, PANEL, LIGHT, MID, MID][sv + lk];
  for (let sv = 0; sv < 3; sv++) for (let lk = 0; lk < 3; lk++)
    sl.addShape("rect", { x: ax + sv * cw, y: ay + (2 - lk) * ch, w: cw, h: ch, fill: { color: shade(sv, lk) }, line: { color: "FFFFFF", width: 2 } });
  // axes
  sl.addShape("line", { x: ax, y: ay + ah + 0.02, w: aw, h: 0, line: { color: DARK, width: 1.25, endArrowType: "triangle" } });
  sl.addShape("line", { x: ax - 0.02, y: ay, w: 0, h: ah, line: { color: DARK, width: 1.25, beginArrowType: "triangle" } });
  ["Low", "Medium", "High"].forEach((t, i) => {
    P.txt(sl, t, ax + i * cw, ay + ah + 0.06, cw, 0.28, { fontSize: 12, keepSize: true, noScale: true, color: BLACK, align: "center", margin: 0 });
    P.txt(sl, t, bx.x + 0.5 - ch / 2, ay + (2 - i) * ch + ch / 2 - 0.15, ch, 0.3, { fontSize: 12, keepSize: true, noScale: true, color: BLACK, align: "center", valign: "middle", rotate: 270, margin: 0 });
  });
  P.txt(sl, "Severity", ax, ay + ah + 0.32, aw, 0.3, { fontSize: 12, keepSize: true, noScale: true, bold: true, italic: true, color: BLACK, align: "center", margin: 0 });
  P.txt(sl, "Likelihood", bx.x + 0.17 - ah / 2, ay + ah / 2 - 0.15, ah, 0.3, { fontSize: 12, keepSize: true, noScale: true, bold: true, color: BLACK, align: "center", rotate: 270, margin: 0 });
  // top-priority zone: high severity, medium to high likelihood
  sl.addShape("rect", { x: ax + 2 * cw + 0.04, y: ay + 0.04, w: cw - 0.08, h: 2 * ch - 0.08, fill: { type: "none" }, line: { color: RED, width: 2, dashType: "dash" } });
  P.txt(sl, "Top priority", ax + 2 * cw + 0.06, ay + 0.08, cw - 0.12, 0.28, { fontSize: 12, keepSize: true, noScale: true, bold: true, color: RED, align: "center", margin: 0 });
  // risks: [id, severity 0-2, likelihood 0-2, label]
  const d = 0.42, dot = (id, cx, cy, hot) => {
    sl.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : DARK }, line: { color: "FFFFFF", width: 1 } });
    P.txt(sl, String(id), cx - d / 2, cy - d / 2, d, d, { fontSize: 14, keepSize: true, noScale: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  };
  const cx = (sv) => ax + sv * cw + cw / 2, cy = (lk) => ay + (2 - lk) * ch + ch / 2;
  // top priority: two dots per cell
  [[1, 2], [3, 4]].forEach(([a, b], k) => { const lk = 2 - k, y = cy(lk) + (k === 0 ? 0.12 : 0);
    dot(a, cx(2) - 0.3, y, true); dot(b, cx(2) + 0.3, y, true); });
  // the others: dot with its name under it
  [[6, 0, 2, "Competitor's response"], [8, 0, 1, "Cannibal-\nization"], [7, 1, 0, "Customer preference change"], [5, 2, 0, "Customer information safety"]]
    .forEach(([id, sv, lk, name]) => {
      const x0 = ax + sv * cw, y0 = ay + (2 - lk) * ch;
      dot(id, x0 + cw / 2, y0 + 0.12 + d / 2, false);
      P.txt(sl, name, x0 + 0.04, y0 + 0.2 + d, cw - 0.08, ch - d - 0.24, { fontSize: 12, keepSize: true, noScale: true, color: BLACK, align: "center", valign: "top", margin: 0 });
    });
}

// ---------------- panel 2: risks -> solutions table ----------------
const risks = [
  [1, "Internal resistance", "Changes in functions and work relationships cause anger and panic",
    "Strengthen internal communication and provide employee training",
    "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
  [2, "Talent management", "Insufficient supply of trained salespersons for rapid expansion",
    "Make recruitment plan in advance", "Reduce labor demand with technology"],
  [3, "Supply chain mgmt.", "Rapid store expansion requires agile logistics",
    "Optimize logistics network", "Find reliable third-party logistic partner"],
  [4, "IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
    "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
];
function solutionTable(sl, bx) {
  // 13 pt: table cells may sit between the deck's label size (12) and body size (14); 14 pt does not fit the eight solutions
  const pt = 13, lh = (pt * 1.2) / 72, cpl = (w) => Math.floor(((w - 0.16) * 72) / (pt * 0.56));
  const lines = (t, w) => { let n = 1, cur = 0; t.split(" ").forEach((wd) => { if (cur + wd.length > cpl(w) && cur) { n++; cur = wd.length + 1; } else cur += wd.length + 1; }); return n; };
  const nW = 0.5, rW = 2.7, sW = bx.w - nW - rW, hH = 0.4;
  const rowH = risks.map(([, , desc, av, mi]) => {
    const a = lines("[Avoid] " + av, sW) * lh + 0.1, m = lines("[Mitigate] " + mi, sW) * lh + 0.1, r = (1 + lines(desc, rW)) * lh + 0.12;
    const extra = Math.max(0, r - a - m) / 2; return [a + extra, m + extra];
  });
  const used = hH + rowH.flat().reduce((s, v) => s + v, 0), grow = (bx.h - used) / 8;
  rowH.forEach((r) => { r[0] += grow; r[1] += grow; });
  const none = { type: "none" }, dash = { type: "dash", color: MID, pt: 1 }, white = { type: "solid", color: "FFFFFF", pt: 2 };
  const hd = (t) => ({ text: t, options: { bold: true, italic: true, color: DARK, align: "left", valign: "bottom", border: [none, none, { type: "solid", color: DARK, pt: 1 }, none] } });
  const tag = (t, body) => [{ text: t + " ", options: { bold: true, color: RED } }, { text: body, options: {} }];
  const rows = [[hd(""), hd("Risks"), hd("Solutions")]];
  risks.forEach(([id, name, desc, av, mi], i) => {
    const sep = i === risks.length - 1 ? none : dash;
    rows.push([
      { text: "", options: { rowspan: 2, border: [none, none, sep, none] } },
      { text: [{ text: name, options: { bold: true, breakLine: true } }, { text: desc, options: {} }], options: { rowspan: 2, valign: "middle", border: [none, none, sep, none] } },
      { text: tag("[Avoid]", av), options: { fill: { color: PANEL }, valign: "middle", border: [none, none, white, none] } },
    ]);
    rows.push([{ text: tag("[Mitigate]", mi), options: { valign: "middle", border: [white, none, sep, none] } }]);
  });
  const allH = [hH, ...rowH.flat()];
  sl.addTable(rows, { x: bx.x, y: bx.y, w: bx.w, colW: [nW, rW, sW], rowH: allH, fontFace: F, fontSize: pt, color: BLACK, margin: [0.03, 0.08, 0.03, 0.08], valign: "middle", autoPage: false });
  // the same numbered dots as on the heat map, centred on each risk's two rows
  let y = bx.y + hH;
  risks.forEach(([id], i) => { const h = rowH[i][0] + rowH[i][1], d = 0.42, cy = y + h / 2;
    sl.addShape("ellipse", { x: bx.x + 0.02, y: cy - d / 2, w: d, h: d, fill: { color: RED }, line: { color: "FFFFFF", width: 1 } });
    P.txt(sl, String(id), bx.x + 0.02, cy - d / 2, d, d, { fontSize: 14, keepSize: true, noScale: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    y += h; });
}

S.composeSlide(pres, slide, {
  regions: { panels: [left, right] },
  panels: [
    { headline: "Risk mapping", draw: heatMap },
    { headline: "Solutions for important risks", draw: solutionTable },
  ],
});
L.save(pres, __dirname + "/candidate.pptx");
