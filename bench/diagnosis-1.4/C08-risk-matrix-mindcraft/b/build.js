// C08 variant b, built from prompt.md and the layout description, in the Mindcraft deck style.
// Style: Style/refs/Case-2019-Mindcraft.profile.json (via the harness). Frame furniture (italic crumb with red
// triangle markers, footer rule, logo, numbered section labels, [tag] in bold red) is copied from the deck's
// other slides (renders 07, 08, 10, 14 in other-slides/). The generic riskMatrix() draws a 2x2 with a list,
// so the 5x5 heat grid and the table are drawn here with the framework's own helpers (txt, subhead, icon).
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
  const { pres, slide, P, S } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE,
    source: [{ text: "Source: MindCraft Analysis", options: { italic: true } }] });
  const C = P.C, F = P.HOUSE.FONT.latin;
  const RED = "C00000", BLUE = "006292", G1 = "F1F1F1", GD = "D5D5D5", G4 = "A6A6A6", G3 = "808080", G2 = "5C5C5C", BLACK = "000000";
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.pt || 12, color: o.color || BLACK,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0, isTextBox: true,
    rotate: o.rotate, paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm });

  // ---- header: section tracker as in the deck (bold italic, grey, red triangle markers, current in red) ----
  const crumb = [["Market Analysis", 0.36], ["Growth Strategy", 2.89], ["Risk & Mitigation", 5.57]];
  crumb.forEach(([t, x], i) => {
    T(t, x, 0.05, 2.4, 0.3, { pt: 14, bold: true, italic: true, color: i === 2 ? RED : G4 });
    if (i) slide.addShape("triangle", { x: x - 0.46, y: 0.08, w: 0.22, h: 0.18, rotate: 90, fill: { color: RED }, line: { type: "none" } });
  });

  // ---- footer: thin rule, logo, page number (page 12 via build.py: firstSlideNum) ----
  slide.addShape("line", { x: 0.3, y: 7.2, w: 13.03, h: 0, line: { color: GD, width: 0.75 } });
  T("MindCr", 10.95, 7.25, 1.27, 0.24, { pt: 12, bold: true, color: RED, align: "right", valign: "middle" });
  P.icon(slide, "bulb", 12.22, 7.255, 0.2, { color: RED, width: 1.25 });
  T("ft", 12.41, 7.25, 0.25, 0.24, { pt: 12, bold: true, color: RED, valign: "middle" });

  // ---- body: two numbered parts side by side ----
  const top = 1.4, bot = 7.08;
  const Lx = 0.37, Lw = 5.25, Rx = 6.25, Rw = 12.95 - Rx;
  S.subhead(slide, 1, "Risk mapping", Lx, top, Lw);
  S.subhead(slide, 2, "Solutions for important risks", Rx, top, Rw);

  // marker styles: 1-2 red, 3-4 blue, 5-8 grey outline (the same style marks the row in the table)
  const mstyle = (id) => id <= 2 ? { fill: RED, line: RED, text: "FFFFFF" } : id <= 4 ? { fill: BLUE, line: BLUE, text: "FFFFFF" } : { fill: "FFFFFF", line: G2, text: BLACK };
  const marker = (id, cx, cy, d = 0.36) => {
    const s = mstyle(id);
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: s.fill }, line: { color: s.line, width: 1.25 } });
    T(String(id), cx - d / 2, cy - d / 2, d, d, { pt: 12, bold: true, color: s.text, align: "center", valign: "middle" });
  };

  // ---- left: 5 x 5 heat map, likelihood (x) x severity (y) ----
  const gx = Lx + 1.22, gy = 2.12, gw = Lw - 1.27, gh = 4.12, cw = gw / 5, ch = gh / 5;
  const shade = [G1, GD, G4, G3, G2];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++)          // i = likelihood column, j = severity row (0 = low)
    slide.addShape("rect", { x: gx + i * cw, y: gy + (4 - j) * ch, w: cw, h: ch, fill: { color: shade[Math.floor((i + j) / 2)] }, line: { color: "FFFFFF", width: 1.5 } });
  // axes: arrows, titles, three level labels each
  slide.addShape("line", { x: gx - 0.12, y: gy + gh + 0.1, w: gw + 0.12, h: 0, line: { color: BLACK, width: 1.25, endArrowType: "triangle" } });
  slide.addShape("line", { x: gx - 0.12, y: gy - 0.05, w: 0, h: gh + 0.15, line: { color: BLACK, width: 1.25, beginArrowType: "triangle" } });
  ["Low", "Medium", "High"].forEach((t, k) => {
    T(t, gx + (2 * k + 0.5) * cw - 0.5, gy + gh + 0.16, 1.0, 0.26, { pt: 12, align: "center" });
    T(t, gx - 0.92, gy + gh - (2 * k + 0.5) * ch - 0.13, 0.74, 0.26, { pt: 12, align: "right" });
  });
  T("Likelihood", gx, gy + gh + 0.44, gw, 0.28, { pt: 12, bold: true, align: "center" });
  T("Severity", Lx + 0.14 - gh / 2, gy + gh / 2 - 0.14, gh, 0.28, { pt: 12, bold: true, align: "center", rotate: 270 });
  // top-priority zone: likelihood medium-high x severity medium-high (upper-right 3 x 3 block)
  slide.addShape("rect", { x: gx + 2 * cw + 0.03, y: gy + 0.03, w: 3 * cw - 0.06, h: 3 * ch - 0.06, fill: { type: "none" }, line: { color: RED, width: 1.75, dashType: "dash" } });
  slide.addShape("rect", { x: gx + 2 * cw + 0.03, y: gy + 0.03, w: 1.12, h: 0.26, fill: { color: "FFFFFF" }, line: { color: RED, width: 1.75, dashType: "dash" } });
  T("Top priority", gx + 2 * cw + 0.03, gy + 0.03, 1.12, 0.26, { pt: 11, bold: true, color: RED, align: "center", valign: "middle" });
  const cell = (i, j, dx = 0.5, dy = 0.5) => [gx + (i + dx) * cw, gy + (4 - j + dy) * ch];
  marker(1, ...cell(4, 4, 0.5, 0.58)); marker(2, ...cell(3, 3)); marker(3, ...cell(2, 4, 0.5, 0.64)); marker(4, ...cell(2, 3));
  // risks outside the zone, each with its label beside it (kept clear of the zone)
  const lab = (t, x, y, w, h, align = "left") => T(t, x, y, w, h, { pt: 10, valign: "middle", align });
  const lw2 = 2 * cw - 0.3 * cw - 0.18 - 0.08;
  { const [x, y] = cell(0, 4, 0.3); marker(5, x, y); lab("Customer information safety", x + 0.21, y - 0.36, lw2, 0.72); }
  { const [x, y] = cell(0, 2, 0.3); marker(7, x, y); lab("Customer preference change", x + 0.21, y - 0.36, lw2, 0.72); }
  { const [x, y] = cell(2, 0, 0.62); marker(8, x, y); lab("Cannibalization", x - 0.21 - 1.6, y - 0.2, 1.6, 0.4, "right"); }
  { const [x, y] = cell(4, 0, 0.55); marker(6, x, y); lab("Competitor's response", x - 0.21 - 1.05, y - 0.36, 1.05, 0.72, "right"); }

  // ---- connector ----
  slide.addShape("chevron", { x: Lx + Lw + 0.15, y: gy + gh / 2 - 0.4, w: 0.32, h: 0.8, fill: { color: G4 }, line: { type: "none" } });

  // ---- right: Risks | Solutions table, four rows (2nd and 4th shaded), numbered circle left of each row ----
  const tx = Rx + 0.45, tw = Rw - 0.45, c1 = 2.2, c2 = tw - c1, hy = 2.0, hh = 0.36;
  T("Risks", tx + 0.1, hy, c1 - 0.1, hh, { pt: 12, bold: true, italic: true, valign: "middle" });
  T("Solutions", tx + c1 + 0.1, hy, c2 - 0.1, hh, { pt: 12, bold: true, italic: true, valign: "middle" });
  slide.addShape("line", { x: tx, y: hy + hh + 0.02, w: tw, h: 0, line: { color: BLACK, width: 1 } });
  const rows = [
    ["Internal resistance", "Changes in functions and work relationships cause anger and panic",
      "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
    ["Talent management", "Insufficient supply of trained salespersons for rapid expansion", "Make recruitment plan in advance", "Reduce labor demand with technology"],
    ["Supply chain mgmt.", "Rapid store expansion requires agile logistics", "Optimize logistics network", "Find reliable third-party logistic partner"],
    ["IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
      "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
  ];
  const pt = 12, cpl = (w) => Math.floor((w * 72) / (pt * 0.64)), nl = (s, w) => Math.ceil(s.length / cpl(w));
  const need = rows.map(([h, b, a, m]) => Math.max(1 + nl("• " + b, c1 - 0.3), nl("[Avoid] " + a, c2 - 0.2) + nl("[Mitigate] " + m, c2 - 0.2)) + 0.4);
  const y0 = hy + hh + 0.08, avail = bot - y0, tot = need.reduce((a, b) => a + b, 0);
  let y = y0;
  rows.forEach(([head, bullet, avoid, mitig], k) => {
    const rh = avail * need[k] / tot;
    if (k % 2) slide.addShape("rect", { x: tx, y, w: tw, h: rh, fill: { color: G1 }, line: { type: "none" } });
    marker(k + 1, Rx + 0.2, y + rh / 2, 0.34);
    T([{ text: head, options: { bold: true, breakLine: true } }, { text: bullet, options: { bullet: { indent: 12 } } }],
      tx + 0.1, y + 0.04, c1 - 0.2, rh - 0.08, { pt, valign: "middle" });
    T([{ text: "[Avoid] ", options: { bold: true, color: RED } }, { text: avoid, options: { breakLine: true } },
       { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: mitig }],
      tx + c1 + 0.1, y + 0.04, c2 - 0.15, rh - 0.08, { pt, valign: "middle", psa: 4 });
    y += rh;
  });
  slide.addShape("line", { x: tx, y: bot, w: tw, h: 0, line: { color: G4, width: 0.75 } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
