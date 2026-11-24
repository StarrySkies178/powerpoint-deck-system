// C08 risk matrix, Mindcraft deck as reference (leave-one-out).
// Layout: HALF2 panel boxes taken from Mindcraft slide 14 (scripts/layout_skeleton.py), re-split so the table
// gets the wider half. Panel heads use the profile's sub-headline (red square chip + bold head + grey rule).
// Heat map: drawn 3x3 grid in the deck's greys with a dashed red callout zone (deck form: Mindcraft 7 "Underpenetrated").
// Table: native table; [Avoid]/[Mitigate] in red bold brackets (deck form: Mindcraft 8 "[Aim]/[How]").
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, P, S, prof } = L.start({ ref: "Case-2019-Mindcraft", title: TITLE });
// source line in the deck's form (italic), in the layout's source placeholder; grey rule above it as on every deck slide
slide.addText("Source: MindCraft Analysis", { placeholder: "source", italic: true });
slide.addShape("line", { x: 0, y: 7.2, w: 13.333, h: 0, line: { color: "A6A6A6", width: 0.75 } });
const R = prof.roles, RED = R.main, BLACK = "000000", FONT = prof.fonts.latin;
const G1 = "F1F1F1", G2 = "D5D5D5", G3 = "A6A6A6", G4 = "808080", G5 = "5C5C5C";

// ---- breadcrumb tracker in the deck's form: bold italic, grey past/future, red current, red triangles between
(function crumb() {
  const items = ["Market Analysis", "Growth Strategy", "Risk & Mitigation"], cur = 2, c = prof.crumb;
  const runs = [];
  items.forEach((t, i) => {
    if (i) runs.push({ text: "    ▶    ", options: { color: RED, italic: false, bold: true } });
    runs.push({ text: t, options: { color: i === cur ? RED : "A6A6A6", italic: true, bold: true } });
  });
  slide.addText(runs, { x: c.x, y: c.y - 0.03, w: 9.5, h: 0.32, fontFace: FONT, fontSize: c.pt, margin: 0, valign: "top" });
})();

// ---- panel boxes: one band under the title rule, two columns (slide 14 skeleton); the table half is made wider so
// its text stays at the deck's 14 pt body size
const top = 1.37, bot = 6.95, LX = 0.36, LW = 4.85, RX = 5.45, RW = 13.333 - 0.28 - RX;
const box = { y: top, h: bot - top };

// ---- panel 1: risk mapping heat map (likelihood x severity, 3 x 3)
function heatMap(sl, b) {
  const axL = 0.72, axB = 0.66, topRoom = 0.34;      // left: axis title + turned level labels; bottom: level labels + axis title
  const gx = b.x + axL, gy = b.y + topRoom, gw = b.w - axL - 0.05, gh = b.h - axB - topRoom;
  const cw = gw / 3, ch = gh / 3;
  // cell shade by heat (likelihood index + severity index): the hotter, the darker grey
  for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++) {
    const heat = li + si, col = heat >= 3 ? G2 : heat === 2 ? "E3E3E3" : G1;
    sl.addShape("rect", { x: gx + si * cw, y: gy + (2 - li) * ch, w: cw, h: ch, fill: { color: col }, line: { color: "FFFFFF", width: 2 } });
  }
  // axes with arrow heads
  sl.addShape("line", { x: gx - 0.05, y: gy + gh + 0.05, w: gw + 0.05, h: 0, line: { color: G5, width: 1.25, endArrowType: "triangle" } });
  sl.addShape("line", { x: gx - 0.05, y: gy - 0.05, w: 0, h: gh + 0.1, line: { color: G5, width: 1.25, beginArrowType: "triangle" } });
  const lv = ["Low", "Medium", "High"];
  lv.forEach((t, i) => {
    sl.addText(t, { x: gx + i * cw, y: gy + gh + 0.08, w: cw, h: 0.28, fontFace: FONT, fontSize: 14, color: BLACK, align: "center", valign: "middle", margin: 0 });
    const cy = gy + (2 - i) * ch + ch / 2;            // likelihood levels turned along the axis
    sl.addText(t, { x: gx - 0.24 - ch / 2, y: cy - 0.14, w: ch, h: 0.28, fontFace: FONT, fontSize: 14, color: BLACK, align: "center", valign: "middle", margin: 0, rotate: 270 });
  });
  sl.addText("Severity", { x: gx, y: gy + gh + 0.38, w: gw, h: 0.28, fontFace: FONT, fontSize: 14, bold: true, italic: true, color: BLACK, align: "center", valign: "middle", margin: 0 });
  sl.addText("Likelihood", { x: b.x + 0.14 - gh / 2, y: gy + gh / 2 - 0.14, w: gh, h: 0.28, fontFace: FONT, fontSize: 14, bold: true, italic: true, color: BLACK, align: "center", valign: "middle", margin: 0, rotate: 270 });

  // top-priority zone: medium & high likelihood x high severity; dashed red callout with its bold italic red label (deck form)
  const zx = gx + 2 * cw + 0.05, zy = gy + 0.05, zw = cw - 0.1, zh = 2 * ch - 0.1;
  sl.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  sl.addText("Top priority", { x: gx + cw, y: b.y, w: 2 * cw, h: topRoom - 0.04, fontFace: FONT, fontSize: 14, bold: true, italic: true, color: RED, align: "right", valign: "middle", margin: 0 });

  // numbered risks: red = top priority, dark grey = the others
  const d = 0.42;
  const dot = (id, cx, cy, hot) => {
    sl.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : G5 }, line: { color: "FFFFFF", width: 1 } });
    sl.addText(String(id), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fontFace: FONT, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  };
  const cell = (li, si) => ({ x: gx + si * cw, y: gy + (2 - li) * ch });
  [[1, 2], [3, 1]].forEach(([a, li]) => {             // 1, 2: high/high; 3, 4: medium likelihood, high severity
    const c = cell(li, 2), cy = c.y + ch / 2;
    dot(a, c.x + cw / 2 - 0.25, cy, true); dot(a + 1, c.x + cw / 2 + 0.25, cy, true);
  });
  // low-severity risks: dot at the left of its cell, name running into the empty cell beside it
  [[6, "Competitor\u2019s response", 2], [8, "Cannibalization", 1]].forEach(([id, name, li]) => {
    const c = cell(li, 0), cy = c.y + ch / 2;
    dot(id, c.x + 0.12 + d / 2, cy, false);
    sl.addText(name, { x: c.x + 0.2 + d, y: cy - 0.2, w: 2 * cw - 0.3 - d, h: 0.4, fontFace: FONT, fontSize: 14, color: BLACK, valign: "middle", margin: 0 });
  });
  // low-likelihood risks: dot on top, name under it inside the cell
  [[7, "Customer preference change", 1], [5, "Customer information safety", 2]].forEach(([id, name, si]) => {
    const c = cell(0, si);
    dot(id, c.x + cw / 2, c.y + 0.12 + d / 2, false);
    sl.addText(name, { x: c.x + 0.03, y: c.y + 0.2 + d, w: cw - 0.06, h: ch - 0.26 - d, fontFace: FONT, fontSize: 12, color: BLACK, align: "center", valign: "top", margin: 0 });
  });
}

// ---- panel 2: solutions table (native)
function solutions(sl, b) {
  const rows = [
    [1, "Internal resistance", "Changes in functions and work relationships cause anger and panic",
      ["Strengthen internal communication and provide employee training"], ["Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"]],
    [2, "Talent management", "Insufficient supply of trained salespersons for rapid expansion",
      ["Make recruitment plan in advance"], ["Reduce labor demand with technology"]],
    [3, "Supply chain mgmt.", "Rapid store expansion requires agile logistics",
      ["Optimize logistics network"], ["Find reliable third-party logistic partner"]],
    [4, "IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
      ["Make upgrade plan in advance; careful selection of new system supplier"], ["Hire external technology experts for help"]],
  ];
  const pt = 14, white = { type: "solid", pt: 2, color: "FFFFFF" }, none = { type: "none" };
  const hdr = (t) => ({ text: t, options: { bold: true, italic: true, color: BLACK, fontSize: 14, valign: "bottom", border: [none, none, none, none] } });
  const data = [[{ text: "", options: { border: [none, none, none, none] } }, hdr("Risks"), hdr("Solutions")]];
  rows.forEach(([n, name, desc, avoid, mit], i) => {
    const last = i === rows.length - 1, bb = last ? { type: "solid", pt: 1, color: G3 } : { type: "dash", pt: 0.75, color: G3 };
    data.push([
      { text: String(n), options: { bold: true, italic: true, color: "FFFFFF", fill: { color: RED }, align: "center", valign: "middle", fontSize: 14, border: [white, white, white, none] } },
      { text: [{ text: name, options: { bold: true, breakLine: true } }, { text: desc, options: { color: G5 } }], options: { valign: "middle", fill: { color: G1 }, border: [white, white, white, white] } },
      { text: [
          { text: "[Avoid] ", options: { bold: true, color: RED } }, { text: avoid.join("; "), options: { breakLine: true } },
          { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: mit.join("; ") },
        ], options: { valign: "middle", border: [none, none, bb, white] } },
    ]);
  });
  const hh = 0.4, nw = 0.4, rw = 2.75;
  sl.addTable(data, {
    x: b.x, y: b.y, w: b.w, colW: [nw, rw, b.w - nw - rw], rowH: [hh, ...rows.map(() => (b.h - hh) / rows.length)],
    fontFace: FONT, fontSize: pt, color: BLACK, margin: [0.03, 0.06, 0.03, 0.06], autoPage: false,
  });
  sl.addShape("line", { x: b.x, y: b.y + hh, w: b.w, h: 0, line: { color: BLACK, width: 1 } });   // header rule across the table
}

S.composeSlide(pres, slide, {
  regions: [{ x: LX, y: box.y, w: LW, h: box.h }, { x: RX, y: box.y, w: RW, h: box.h }],
  panels: [
    { headline: "Risk mapping", draw: heatMap },
    { headline: "Solutions for important risks", draw: solutions },
  ],
});

L.save(pres, __dirname + "/candidate.pptx");
