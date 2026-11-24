// C08 risk matrix, deck as reference (Case-2019-Mindcraft), leave-one-out build.
// Approach: the deck's style profile (title, crumb, rule, source, panel chips) through the harness; two numbered panels
// in the deck's HALF2 arrangement (its slides 8 and 14: chip + bold sub-headline + grey rule, red only for the point).
// Panel 1: 3 x 3 heat map drawn in the deck's greys, the priority zone as the deck's dashed red callout box with a red
// bold italic label (as on its slide 7), numbered dots. Panel 2: a native table, risks | solutions, with the deck's
// red bold bracket tags ("[Aim]" / "[How]" on its slide 8 become "[Avoid]" / "[Mitigate]").
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const { P, S } = L;

const TITLE = "Four important potential risks are identified and preparation & mitigation solutions are provided for discussion";
const { pres, slide, B } = L.start({
  ref: "Case-2019-Mindcraft",
  title: TITLE,
  source: [{ text: "Source: MindCraft Analysis", options: { italic: true } }],
});
const C = P.C, F = L.HOUSE.FONT.latin;
const RED = C.accent, DG = "5C5C5C", MG = "A6A6A6", LG = "D5D5D5", PG = "F1F1F1";

// ---------- breadcrumb in the deck's form: bold italic, grey sections, current in red, red triangles between ----------
function crumb(items, cur) {
  let x = 0.36;
  items.forEach((it, i) => {
    const w = (it.length * 14 * 0.62) / 72 + 0.15;
    slide.addText(it, { x, y: 0.05, w, h: 0.3, fontFace: F, fontSize: 14, bold: true, italic: true, color: i === cur ? RED : MG, margin: 0, valign: "middle" });
    x += w + 0.2;
    if (i < items.length - 1) {
      slide.addShape("triangle", { x, y: 0.1, w: 0.2, h: 0.22, rotate: 90, fill: { color: RED }, line: { type: "none" } });
      x += 0.45;
    }
  });
}
crumb(["Market Analysis", "Growth Strategy", "Risk & Mitigation"], 2);

// ---------- panel frames (deck HALF2: chip + headline + rule) ----------
const top = B.y + 0.02, bottom = 7.02;
const p1 = { x: B.x, y: top, w: 4.3, h: bottom - top };
const p2 = { x: 4.95, y: top, w: 12.95 - 4.95, h: bottom - top };
const used = S.composeSlide(pres, slide, {
  regions: [p1, p2],
  panels: [
    { headline: "Risk mapping", draw: (s, box) => heatMap(box) },
    { headline: "Solutions for important risks", draw: (s, box) => solutions(box) },
  ],
});

// ---------- 1 heat map: likelihood (rows) x severity (columns); the other risks named in a key under it ----------
function heatMap(box) {
  const lvl = ["Low", "Medium", "High"];
  const gx = box.x + 1.12, gw = box.x + box.w - 0.02 - gx;      // room on the left for the axis title and row labels
  const gy = box.y + 0.12, gh = 3.2;
  const cw = gw / 3, ch = gh / 3;
  const shade = (li, si) => { const k = li + si; return k >= 3 ? MG : k === 2 ? LG : PG; };
  for (let li = 0; li < 3; li++) for (let si = 0; si < 3; si++) {
    slide.addShape("rect", { x: gx + si * cw, y: gy + (2 - li) * ch, w: cw, h: ch, fill: { color: shade(li, si) }, line: { color: "FFFFFF", width: 2 } });
  }
  lvl.forEach((t, i) => {
    slide.addText(t, { x: gx - 1.0, y: gy + (2 - i) * ch, w: 0.9, h: ch, fontFace: F, fontSize: 14, color: C.text, align: "right", valign: "middle", margin: 0 });
    slide.addText(t, { x: gx + i * cw, y: gy + gh + 0.06, w: cw, h: 0.26, fontFace: F, fontSize: 14, color: C.text, align: "center", valign: "top", margin: 0 });
  });
  slide.addShape("line", { x: gx - 0.06, y: gy + gh + 0.02, w: gw + 0.02, h: 0, line: { color: C.text, width: 1, endArrowType: "triangle" } });
  slide.addShape("line", { x: gx - 0.06, y: gy - 0.06, w: 0, h: gh + 0.08, line: { color: C.text, width: 1, beginArrowType: "triangle" } });
  slide.addText("Severity", { x: gx, y: gy + gh + 0.34, w: gw, h: 0.28, fontFace: F, fontSize: 14, bold: true, italic: true, color: C.text, align: "center", valign: "middle", margin: 0 });
  slide.addText("Likelihood", { x: box.x + 0.1 - gh / 2, y: gy + gh / 2 - 0.14, w: gh, h: 0.28, rotate: 270, fontFace: F, fontSize: 14, bold: true, italic: true, color: C.text, align: "center", valign: "middle", margin: 0 });

  // top-priority zone: severity High x likelihood Medium..High, the deck's dashed red callout box with a red bold italic label
  const zx = gx + 2 * cw + 0.05, zy = gy + 0.05, zw = cw - 0.1, zh = 2 * ch - 0.1;
  slide.addShape("rect", { x: zx, y: zy, w: zw, h: zh, fill: { type: "none" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  slide.addText("Top priority", { x: zx, y: zy + 0.04, w: zw, h: 0.45, fontFace: F, fontSize: 14, bold: true, italic: true, color: RED, align: "center", valign: "top", margin: 0 });

  const d = 0.38;
  const dot = (id, cx, cy, hot) => {
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: hot ? RED : DG }, line: { color: "FFFFFF", width: 1 } });
    slide.addText(String(id), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fontFace: F, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
  };
  const cellC = (li, si) => ({ x: gx + (si + 0.5) * cw, y: gy + (2.5 - li) * ch });
  [[1, 2, 2, -0.24, 0.24], [2, 2, 2, 0.24, 0.24], [3, 1, 2, -0.24, 0.05], [4, 1, 2, 0.24, 0.05]].forEach(([id, li, si, dx, dy]) => {
    const c = cellC(li, si); dot(id, c.x + dx, c.y + dy, true);
  });
  const others = [[5, "Customer information safety", 0, 2], [6, "Competitor's response", 2, 0], [7, "Customer preference change", 0, 1], [8, "Cannibalization", 1, 0]];
  others.forEach(([id, , li, si]) => { const c = cellC(li, si); dot(id, c.x, c.y, false); });
  // key: the same numbers, named
  const ky = gy + gh + 0.72, kh = box.y + box.h - ky, rh = kh / others.length;
  others.forEach(([id, name], i) => {
    const y = ky + i * rh, ds = 0.26;
    slide.addShape("ellipse", { x: box.x + 0.2, y: y + (rh - ds) / 2, w: ds, h: ds, fill: { color: DG }, line: { type: "none" } });
    slide.addText(String(id), { x: box.x + 0.2, y: y + (rh - ds) / 2, w: ds, h: ds, fontFace: F, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    slide.addText(name, { x: box.x + 0.6, y, w: box.w - 0.6, h: rh, fontFace: F, fontSize: 14, color: C.text, valign: "middle", margin: 0 });
  });
}

// ---------- 2 risks | solutions, native table ----------
function solutions(box) {
  const pt = 14;
  const rows = [
    [1, "Internal resistance", "Changes in functions and work relationships cause anger and panic",
      "Strengthen internal communication and provide employee training", "Adjust KPI system accordingly; introduce experienced management talent from outside when necessary"],
    [2, "Talent management", "Insufficient supply of trained salespersons for rapid expansion",
      "Make recruitment plan in advance", "Reduce labor demand with technology"],
    [3, "Supply chain mgmt.", "Rapid store expansion requires agile logistics",
      "Optimize logistics network", "Find reliable third-party logistic partner"],
    [4, "IT system upgrade", "Low compatibility between old and new system may cause slow upgrade and delay implementation",
      "Make upgrade plan in advance; careful selection of new system supplier", "Hire external technology experts for help"],
  ];
  const none = { type: "none" }, rule = { type: "solid", color: MG, pt: 1 }, dash = { type: "dash", color: MG, pt: 1 };
  const colW = [0.5, 3.15, box.w - 3.65];
  const hdr = ["", "Risks", "Solutions"].map((t) => ({ text: t, options: { bold: true, italic: true, color: DG, fontSize: 14, valign: "bottom", border: [none, none, rule, none] } }));
  const body = rows.map(([n, name, desc, avoid, mitigate], i) => {
    const last = i === rows.length - 1, b = [none, none, last ? rule : dash, none];
    return [
      { text: "", options: { border: b } },
      { text: [{ text: name, options: { bold: true, breakLine: true } }, { text: desc }], options: { border: b, valign: "middle" } },
      { text: [
          { text: "[Avoid] ", options: { bold: true, color: RED } }, { text: avoid, options: { breakLine: true } },
          { text: "[Mitigate] ", options: { bold: true, color: RED } }, { text: mitigate },
        ], options: { border: b, valign: "middle", fill: { color: PG } } },
    ];
  });
  const hH = 0.4, rH = [5, 4, 3, 5];   // lines of text per row at 14 pt (the longer of the two cells)
  const k = (box.h - 0.05 - hH) / rH.reduce((a, c) => a + c, 0);
  const rowH = rH.map((h) => h * k);
  slide.addTable([hdr, ...body], { x: box.x, y: box.y, w: box.w, colW, rowH: [hH, ...rowH], fontFace: F, fontSize: pt, color: C.text,
    margin: [0.03, 0.08, 0.03, 0.08], valign: "middle", autoPage: false });
  // numbered red dots, the same numbers as on the heat map
  let y = box.y + hH;
  rowH.forEach((h, i) => {
    const d = 0.4, cx = box.x + colW[0] / 2, cy = y + h / 2;
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: RED }, line: { color: "FFFFFF", width: 1 } });
    slide.addText(String(i + 1), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fontFace: F, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    y += h;
  });
}

// the deck's footer furniture from its master: grey rule over the footer, MindCraft logo bottom right
slide.addShape("rect", { x: 0, y: 7.212, w: 13.333, h: 0.01, fill: { color: "B4B4B4" }, line: { type: "none" } });
slide.addImage({ path: __dirname + "/logo.png", x: 11.642, y: 7.175, w: 1.137, h: 0.325, altText: "MindCraft logo" });

L.save(pres, __dirname + "/candidate.pptx");
