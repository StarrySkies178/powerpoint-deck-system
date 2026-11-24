// patterns.js — parametric slide patterns learned from the 11 template decks.
// Every generator takes a content spec of ANY count and recomputes the geometry,
// so "4 arrows -> 5 arrows" is a parameter, not a redesign.
// Rules encoded here: grey does the work, ONE accent makes the point (spec.highlight);
// text beside graphics, never behind; numbers in squares; flat shapes, no borders on boxes.

const HOUSE = require("./house.js");
const R = (k) => HOUSE.ROLES[k].hex;
// Role colours (exact house hex; finalize() turns them into theme slots so they follow any colour scheme)
const C = {
  navy: R("main"), cyan: R("secondary"), accent: R("accent"), text: R("text"), white: R("white"),
  g1: "F0F0F0",            // light panel (tint of grey4)
  g2: R("grey4"), g3: R("grey3"), g4: R("grey2"), g5: R("grey1"),
  hiBand: "CCECF8",        // light secondary tint for highlighted rows/boxes
  chartHi: R("main"),      // the series / point that makes the point in charts
};
const HOUSE_C = { ...C };
const tint = (hex, k) => hex.match(/../g).map((c) => Math.round(parseInt(c, 16) + (255 - parseInt(c, 16)) * k).toString(16).padStart(2, "0")).join("").toUpperCase();
const lumOf = (hex) => { const [r, g, b] = hex.match(/../g).map((c) => { c = parseInt(c, 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lumOf(a), lumOf(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// useStyle(profile): switch master + generators to a reference's measured look (see house.js). useStyle(null) = house.
function useStyle(profile) {
  HOUSE.useStyle(profile);
  W = HOUSE.W; H = HOUSE.H;
  Object.assign(C, HOUSE_C);
  const S = HOUSE.STYLE;
  if (S) {
    Object.assign(C, { navy: R("main"), cyan: R("secondary"), accent: R("accent"), text: R("text"), g2: R("grey4"), g3: R("grey3"), g4: R("grey2"), g5: R("grey1"),
      g1: (S.roles.panel || "F2F2F2").toUpperCase(), hiBand: (S.roles.tint || S.roles.panel || "F2F2F2").toUpperCase() });
    C.chartHi = S.highlight && S.highlight.chart === "accent" ? C.accent : C.navy;
  }
  THEME.headFontFace = HOUSE.FONT.latin; THEME.bodyFontFace = HOUSE.FONT.latin;
  return S;
}
// chart look of the active style: the house hides the value axis; a reference may show it, with its own label size
function chartStyle() {
  const S = HOUSE.STYLE; if (!S) return {};
  const ch = S.chart || {}, pt = ch.pt || HOUSE.TYPE.body;   // no native charts in the reference: its drawn chart labels use the body size
  return { valAxisHidden: !ch.value_axis, valAxisLabelFontSize: pt, valAxisLabelColor: C.text, valAxisLineShow: !!ch.value_axis,
    valGridLine: ch.gridlines ? { color: C.g2, size: 0.5 } : { style: "none" }, catAxisLabelFontSize: pt, dataLabelFontSize: pt, legendFontSize: pt,
    catAxisLabelFontFace: THEME.bodyFontFace, valAxisLabelFontFace: THEME.bodyFontFace, dataLabelFontFace: THEME.bodyFontFace, legendFontFace: THEME.bodyFontFace };
}
const THEME = { headFontFace: "Arial", bodyFontFace: "Arial" };
let W = HOUSE.W, H = HOUSE.H;
const BODY = HOUSE.GRID.body; // content area under title (measured grid)

// ---------- text helpers ----------
// Rough Arial fit: avg char width ≈ 0.5em; line height ≈ 1.2em.
function fitSize(text, wIn, hIn, max = 16, min = 10) {
  const t = String(text || "");
  const longest = Math.max(1, ...t.split(/\s+/).map((w) => w.length));
  max = Math.min(max, Math.max(min, (wIn * 72) / (longest * 0.6)));
  for (let s = max; s >= min; s -= 0.5) {
    const cpl = Math.max(1, Math.floor((wIn * 72) / (s * 0.52)));
    const lines = t.split("\n").reduce((a, para) => {
      let n = 0, cur = 0;
      for (const word of para.split(/\s+/)) {
        const L = word.length + 1;
        if (cur + L > cpl) { n++; cur = L; } else cur += L;
      }
      return a + n + 1;
    }, 0);
    if (lines * s * 1.22 <= hIn * 72) return s;
  }
  return min;
}
// Text-safe green: the accent at 60% luminance (theme slot accent3, lumMod 60%), 5.7:1 on white.
// Green TEXT on light backgrounds uses it automatically; green fills, lines and text on dark slides keep C.accent.
const ACCENT_TEXT = "4D7100";
const textGreen = (c, o) => (c === C.accent && !o.onDark ? (HOUSE.STYLE ? (contrast(c, "FFFFFF") >= 3 ? c : C.text) : ACCENT_TEXT) : c);
const typeK = () => (HOUSE.STYLE ? HOUSE.TYPE.body / 12.5 : 1);   // reference body size vs the generators' working size (~12.5 pt)
function txt(slide, text, x, y, w, h, o = {}) {
  if (Array.isArray(text)) text = text.map((r) => (r.options && r.options.color === C.accent && !o.onDark ? { ...r, options: { ...r.options, color: ACCENT_TEXT } } : r));
  const plain = Array.isArray(text) ? text.map((r) => r.text).join("") : text;
  const k = o.noScale ? 1 : typeK(), sc = (v) => Math.max(8, Math.round(v * k * 2) / 2);
  const size = o.fontSize ? (k === 1 || o.keepSize ? o.fontSize : sc(o.fontSize)) : fitSize(plain, w - 0.1, h - 0.06, sc(o.max || 14), Math.min(sc(o.max || 14), sc(o.min || 10)));
  slide.addText(text, {
    x, y, w, h, fontFace: THEME.bodyFontFace, fontSize: size, color: textGreen(o.color || C.text, o),
    bold: !!o.bold, align: o.align || "left", valign: o.valign || "top", margin: o.margin ?? 0.04,
    isTextBox: true, paraSpaceAfter: o.paraSpaceAfter || 0, rotate: o.rotate, objectName: o.name,
  });
}
// label (bold, coloured) + body as separate paragraphs so alignment holds on every line
const rich = (label, body, color = C.navy, bodyColor) => body
  ? [{ text: label, options: { bold: true, color, breakLine: true } }, { text: body, options: bodyColor ? { color: bodyColor } : {} }]
  : [{ text: label, options: { bold: true, color } }];
const fillFor = (i, spec, base = C.g2, hi = C.accent) => (spec.highlight === i ? hi : base);
const textOn = (fill) => ([C.navy, C.cyan, C.accent, C.g5, C.g4].includes(fill) ? C.white : C.text);
const rad = (d) => (d * Math.PI) / 180;

// ---------- slide frame (same position on every slide) ----------
function frame(pres, slide, { title, subtitle, source, page, tracker, crumb, onLayout = true }) {
  const G = HOUSE.GRID, S = HOUSE.STYLE;
  if (S && onLayout) {
    const T = S.title;
    if (subtitle && T.sub) slide.addText([{ text: title, options: { breakLine: true } }, { text: subtitle, options: { color: T.sub.colour, fontSize: T.sub.pt || T.pt } }], { placeholder: "title" });
    else slide.addText(title, { placeholder: "title" });
    if (source) slide.addText(source, { placeholder: "source" });
    if (subtitle && !T.sub && !crumb) txt(slide, subtitle, T.x, HOUSE.GRID.subY, T.w, 0.3, { fontSize: S.body.label_pt, keepSize: true, color: C.g5 });
    if (crumb) crumbLine(slide, crumb);
    if (tracker) trackerBar(slide, tracker);
    return;
  }
  if (onLayout) { // slide was added with masterName "04 Title only" (or similar): fill the placeholders
    slide.addText(title, { placeholder: "title" });
    if (subtitle) slide.addText(subtitle, { placeholder: "subtitle" });
    if (source) slide.addText(source, { placeholder: "source" });
    if (crumb) crumbLine(slide, crumb);        // section breadcrumb above the title (house default too, not only with a reference style)
  } else {
    txt(slide, title, G.left, G.titleTop, G.contentW - 2, G.titleH, { fontSize: HOUSE.TYPE.title, bold: true, color: C.navy, valign: "bottom", name: "title" });
    if (subtitle) txt(slide, subtitle, G.left, G.subY, G.contentW - 2, 0.34, { fontSize: 14, color: C.g5, name: "subtitle" });
    if (source) txt(slide, source, G.left, G.footY, 9.5, G.footH, { fontSize: 9, color: C.g5, valign: "bottom", name: "source" });
  }
  if (tracker) trackerBar(slide, tracker);
}
// breadcrumb / section tracker line (case decks): crumb = { items:[...], current: i }, in the reference's crumb style
function crumbLine(slide, crumb) {
  const S = HOUSE.STYLE, cs = (S && S.crumb) || { x: HOUSE.GRID.left, y: 0.1, pt: 10, bold: false, colours: [C.navy, C.g5], boldCurrent: true, sep: "  \u203A  " };
  const on = cs.colours.find((c) => c !== "BEBEBE" && c !== "CCCCCC" && c !== "A6A6A6") || C.navy, off = cs.colours.find((c) => c !== on) || C.g3;
  const sep = crumb.sep || cs.sep || " \u25B6 ";
  const runs = [];
  crumb.items.forEach((it, i) => { if (i) runs.push({ text: sep, options: { color: on === C.navy ? C.g3 : on } }); runs.push({ text: it, options: { color: i === crumb.current ? on : off, bold: !!cs.bold || (!!cs.boldCurrent && i === crumb.current) } }); });
  slide.addText(runs, { x: cs.x, y: cs.y, w: W - cs.x - 1.8, h: 0.3, fontFace: THEME.bodyFontFace, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });
}
// numbered-square tracker top-right (RB rule: navigators are numbered squares)
function trackerBar(slide, { n, current }) {
  const s = 0.26, g = 0.05, x0 = W - 0.6 - n * s - (n - 1) * g;
  for (let i = 0; i < n; i++) {
    const on = i === current;
    slide.addShape("rect", { x: x0 + i * (s + g), y: 0.22, w: s, h: s, fill: { color: on ? C.accent : C.g2 }, line: { type: "none" } });
    txt(slide, String(i + 1), x0 + i * (s + g), 0.22, s, s, { fontSize: 9, bold: true, color: on ? C.white : C.g5, align: "center", valign: "middle", margin: 0 });
  }
}
// ---------- icons: Tabler outline set (MIT), each drawn as ONE editable line shape, so it recolours and scales like any shape.
// icon(slide, "truck", x, y, size, {color, width}); returns false when the name is not in Generators/icons.json
// (218 business icons; the SVG files are in Objects/Visual/icons/; add more with Generators/build_icons.js).
// The references put an icon beside a heading or a short label, one style per deck, in the main colour or grey: never as decoration.
const ICONS = (() => { try { return require("./icons.json").icons; } catch (e) { return {}; } })();
function icon(slide, name, x, y, size = 0.36, o = {}) {
  const cmds = ICONS[name]; if (!cmds) return false;
  const k = size / 24, pts = [];
  for (const c of cmds) {
    if (c[0] === "M") pts.push({ x: c[1] * k, y: c[2] * k, moveTo: true });
    else if (c[0] === "L") pts.push({ x: c[1] * k, y: c[2] * k });
    else if (c[0] === "C") pts.push({ x: c[5] * k, y: c[6] * k, curve: { type: "cubic", x1: c[1] * k, y1: c[2] * k, x2: c[3] * k, y2: c[4] * k } });
    else if (c[0] === "Q") pts.push({ x: c[3] * k, y: c[4] * k, curve: { type: "quadratic", x1: c[1] * k, y1: c[2] * k } });
    else pts.push({ close: true });
  }
  slide.addShape("custGeom", { x, y, w: size, h: size, points: pts, fill: { type: "none" }, line: { color: o.color || C.navy, width: o.width || Math.max(0.75, (size * 72 * 1.5) / 24) }, objectName: "icon " + name });
  return true;
}
function takeaway(slide, text) { // "tombstone" / so-what bar
  const b = BODY, y = b.y + b.h - 0.52;
  slide.addShape("rect", { x: b.x, y, w: b.w, h: 0.52, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, text, b.x + 0.15, y, b.w - 0.3, 0.52, { fontSize: 14, bold: true, color: C.white, valign: "middle" });
}
const numSquare = (slide, n, x, y, s = 0.34, fill = C.navy) => {
  slide.addShape("rect", { x, y, w: s, h: s, fill: { color: fill }, line: { type: "none" } });
  txt(slide, String(n), x, y, s, s, { fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
};

// =====================================================================
// ENGINE: row  — chevron-process, staircase, text-columns, timeline
// =====================================================================
function chevronProcess(slide, spec, box = BODY) {
  // spec.items:[{label,text}], spec.highlight, spec.rowLabels? (not used), spec.result?
  const n = spec.items.length, hH = 0.62, point = hH * 0.38, gap = 0.06;
  const resW = spec.result ? Math.min(2.4, box.w * 0.2) : 0;
  const avail = box.w - resW - (spec.result ? 0.25 : 0);
  const w = (avail + (n - 1) * (point - gap)) / n; // chevrons overlap by point depth
  spec.items.forEach((it, i) => {
    const x = box.x + i * (w - point + gap);
    const fill = (spec.fills && spec.fills[i]) || (spec.highlight === i ? C.accent : (spec.highlight != null && i < spec.highlight ? C.g4 : C.navy));
    slide.addShape(i === 0 ? "homePlate" : "chevron", { x, y: box.y, w, h: hH, fill: { color: fill }, line: { type: "none" }, objectName: `step${i + 1}` });
    txt(slide, it.label, x + (i === 0 ? 0.12 : point * 0.9), box.y, w - point * 1.6, hH, { max: 14, min: 10, bold: true, color: C.white, valign: "middle", align: "center" });
    if (it.text) txt(slide, it.text, x + 0.08, box.y + hH + 0.2, w - point - 0.05, box.h - hH - 0.3, { max: 14, min: 10 });
  });
  if (spec.result) {
    const x = box.x + box.w - resW;
    slide.addShape("rect", { x, y: box.y, w: resW, h: box.h - 0.1, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, spec.result.label, x + 0.12, box.y + 0.1, resW - 0.24, 0.5, { fontSize: 14, bold: true, color: C.accent });
    txt(slide, spec.result.text, x + 0.12, box.y + 0.65, resW - 0.24, box.h - 0.9, { max: 14 });
  }
}

function staircase(slide, spec, box = BODY) {
  const n = spec.items.length, gap = 0.08;
  const w = (box.w - (n - 1) * gap) / n, h0 = 0.6, rise = (box.h * 0.6 - h0) / Math.max(1, n - 1), base = box.y + box.h;
  spec.items.forEach((it, i) => {
    const h = h0 + rise * i, x = box.x + i * (w + gap), y = base - h;
    const fill = spec.highlight === i ? C.accent : [C.g2, C.g3, C.g4, C.g5, C.navy][Math.min(4, Math.round((i / Math.max(1, n - 1)) * 4))];
    slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
    txt(slide, it.label, x + 0.08, y + 0.06, w - 0.16, Math.min(0.6, h - 0.08), { max: 14, bold: true, color: textOn(fill) });
    if (it.text) txt(slide, it.text, x + 0.04, box.y, w - 0.08, base - h - box.y - 0.12, { max: 13, min: 10, valign: "bottom" });
  });
}

function textColumns(slide, spec, box = BODY) {
  const n = spec.items.length, gap = 0.3;
  if (n > 6) { // wrap to two rows
    const half = Math.ceil(n / 2), hh = (box.h - gap) / 2;
    textColumns(slide, { ...spec, items: spec.items.slice(0, half) }, { ...box, h: hh });
    textColumns(slide, { ...spec, items: spec.items.slice(half), highlight: spec.highlight != null ? spec.highlight - half : null }, { ...box, y: box.y + hh + gap, h: hh });
    return;
  }
  const w = (box.w - (n - 1) * gap) / n;
  spec.items.forEach((it, i) => {
    const x = box.x + i * (w + gap), hi = spec.highlight === i;
    slide.addShape("rect", { x, y: box.y, w, h: 0.5, fill: { color: hi ? C.accent : C.navy }, line: { type: "none" } });
    txt(slide, it.label, x + 0.1, box.y, w - 0.2, 0.5, { max: 14, bold: true, color: C.white, valign: "middle" });
    const lines = String(it.text).split("\n").reduce((a, p) => a + Math.ceil((p.length * 14 * 0.52) / ((w - 0.24) * 72) || 1), 0);
    const ph = Math.min(box.h - 0.5, Math.max(1.6, lines * 14 * 1.3 / 72 + 0.45));
    slide.addShape("rect", { x, y: box.y + 0.5, w, h: ph, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, it.text, x + 0.12, box.y + 0.62, w - 0.24, ph - 0.2, { max: 14, paraSpaceAfter: 6 });
  });
}

function timeline(slide, spec, box = BODY) {
  const n = spec.items.length, y = box.y + box.h / 2, pad = 0.4;
  slide.addShape("line", { x: box.x, y, w: box.w, h: 0, line: { color: C.g4, width: 2, endArrowType: "triangle" } });
  const step = (box.w - 2 * pad) / Math.max(1, n - 1), cw = Math.min(2.6, step * 1.85);
  spec.items.forEach((it, i) => {
    const x = box.x + pad + i * step, up = i % 2 === 0, hi = spec.highlight === i;
    slide.addShape("ellipse", { x: x - 0.11, y: y - 0.11, w: 0.22, h: 0.22, fill: { color: hi ? C.accent : C.navy }, line: { color: C.white, width: 1.5 } });
    txt(slide, it.date, x - 0.8, up ? y + 0.15 : y - 0.47, 1.6, 0.32, { fontSize: 13, bold: true, color: hi ? C.accent : C.navy, align: "center" });
    const th = box.h / 2 - 0.75;
    slide.addShape("line", { x, y: up ? y - 0.6 : y + 0.12, w: 0, h: 0.48, line: { color: C.g3, width: 1 } });
    const cx0 = Math.max(box.x, Math.min(box.x + box.w - cw, x - cw / 2));
    txt(slide, it.text, cx0, up ? box.y : y + 0.62, cw, th, { max: 13, min: 10, align: "center", valign: up ? "bottom" : "top" });
  });
}

// =====================================================================
// ENGINE: column — labelled rows
// =====================================================================
function labelledRows(slide, spec, box = BODY) {
  const n = spec.items.length, gap = 0.14, h = (box.h - (n - 1) * gap) / n, lw = box.w * 0.27;
  spec.items.forEach((it, i) => {
    const y = box.y + i * (h + gap), hi = spec.highlight === i;
    numSquare(slide, i + 1, box.x, y + (h - 0.4) / 2, 0.4, hi ? C.accent : C.navy);
    txt(slide, it.label, box.x + 0.55, y, lw - 0.6, h, { max: 16, bold: true, color: hi ? C.accent : C.navy, valign: "middle" });
    slide.addShape("rect", { x: box.x + lw, y, w: box.w - lw, h, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, it.text, box.x + lw + 0.15, y, box.w - lw - 0.3, h, { max: 14, valign: "middle" });
  });
}

// =====================================================================
// ENGINE: ring — cycle, wedges
// =====================================================================
function cycle(slide, spec, box = BODY) {
  const n = spec.items.length;
  const D = Math.min(box.h, box.w * 0.42), cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const R = D / 2, thick = 0.3, gapDeg = n <= 3 ? 10 : 7, seg = 360 / n;
  const rMid = R * (1 - thick / 2);
  spec.items.forEach((it, i) => {
    const a0 = 270 + i * seg + gapDeg / 2, a1 = 270 + (i + 1) * seg - gapDeg / 2 - 4;
    const fill = fillFor(i, spec, i % 2 ? C.g4 : C.g5);
    slide.addShape("blockArc", { x: cx - R, y: cy - R, w: D, h: D, angleRange: [a0 % 360, a1 % 360], arcThicknessRatio: thick, fill: { color: fill }, line: { type: "none" }, objectName: `segment${i + 1}` });
    // arrowhead at segment end, tangent clockwise
    const ae = rad(a1), hx = cx + rMid * Math.cos(ae), hy = cy + rMid * Math.sin(ae), s = R * thick * 1.25;
    slide.addShape("triangle", { x: hx - s / 2, y: hy - s / 2, w: s, h: s * 0.8, fill: { color: fill }, line: { type: "none" }, rotate: (a1 + 180) % 360 });
    // label: number inside the ring band, text outside at mid-angle
    const am = rad(270 + (i + 0.5) * seg);
    const lx = cx + rMid * Math.cos(am), ly = cy + rMid * Math.sin(am);
    txt(slide, String(i + 1), lx - 0.22, ly - 0.2, 0.44, 0.4, { fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    const ox = cx + (R + 0.25) * Math.cos(am), oy = cy + (R + 0.25) * Math.sin(am);
    const right = Math.cos(am) >= -0.05, cw = Math.min(3.4, (box.w - D) / 2 - 0.2), ch = Math.min(1.3, (box.h / Math.ceil(n / 2)) - 0.05);
    const tx = Math.abs(Math.cos(am)) < 0.2 ? ox - cw / 2 : right ? ox : ox - cw;
    const ty = Math.abs(Math.cos(am)) < 0.2 ? (Math.sin(am) < 0 ? oy - ch : oy) : oy - ch / 2;
    txt(slide, rich(it.label, it.text, spec.highlight === i ? C.accent : C.navy),
      tx, ty, cw, ch, { fontSize: n > 6 ? 11 : 12, align: Math.abs(Math.cos(am)) < 0.2 ? "center" : right ? "left" : "right",
        valign: Math.abs(Math.cos(am)) < 0.2 ? (Math.sin(am) < 0 ? "bottom" : "top") : "middle" });
  });
  if (spec.centre) txt(slide, spec.centre, cx - R * 0.6, cy - 0.5, R * 1.2, 1.0, { max: 16, bold: true, color: C.navy, align: "center", valign: "middle" });
}

// =====================================================================
// ENGINE: radial — hub-spoke, forces-in
// =====================================================================
function hubSpoke(slide, spec, box = BODY) {
  const n = spec.items.length, cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const R = Math.min(box.h / 2 - 0.62, box.w * 0.22);
  const d = Math.min(1.2, 2 * R * Math.sin(Math.PI / n) - 0.15);       // satellites never touch each other
  const cD = Math.min(1.9, 2 * (R - d / 2 - 0.15));                     // ...or the centre
  spec.items.forEach((it, i) => {
    const a = rad(-90 + (i * 360) / n), x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    slide.addShape("line", { x: Math.min(cx, x), y: Math.min(cy, y), w: Math.abs(x - cx) || 0.001, h: Math.abs(y - cy) || 0.001, flipH: (x < cx) !== (y < cy) ? true : false, line: { color: C.g3, width: 1.25 } });
  });
  slide.addShape("ellipse", { x: cx - cD / 2, y: cy - cD / 2, w: cD, h: cD, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, spec.centre, cx - cD / 2 + 0.1, cy - cD / 2, cD - 0.2, cD, { max: 16, bold: true, color: C.white, align: "center", valign: "middle" });
  spec.items.forEach((it, i) => {
    const a = rad(-90 + (i * 360) / n), x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), hi = spec.highlight === i;
    slide.addShape("ellipse", { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: hi ? C.accent : C.g2 }, line: { color: C.white, width: 2 } });
    txt(slide, it.label, x - d / 2 + 0.05, y - d / 2, d - 0.1, d, { max: 13, min: 9, bold: true, color: hi ? C.white : C.navy, align: "center", valign: "middle", margin: 0 });
    if (it.text) {
      const right = Math.cos(a) > 0.15, left = Math.cos(a) < -0.15, cw = Math.min(3.0, box.w / 2 - R - d / 2 - 0.25), ch = 0.95;
      const tx = right ? x + d / 2 + 0.12 : left ? x - d / 2 - 0.12 - cw : x + d / 2 + 0.12;
      txt(slide, it.text, tx, y - ch / 2, cw, ch, { max: 12, min: 9, align: left ? "right" : "left", valign: "middle" });
    }
  });
}

function forcesIn(slide, spec, box = BODY) {
  const n = spec.items.length, cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const cw = Math.min(2.5, box.w * 0.3), ch = 1.2;
  slide.addShape("roundRect", { x: cx - cw / 2, y: cy - ch / 2, w: cw, h: ch, rectRadius: 0.5, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, spec.centre, cx - cw / 2 + 0.1, cy - ch / 2, cw - 0.2, ch, { max: 16, bold: true, color: C.white, align: "center", valign: "middle" });
  const rx = cw / 2 + 0.2, ry = ch / 2 + 0.2;           // ellipse just outside the centre box
  const tw = Math.max(1.4, Math.min(2.9, box.w / 2 - rx - 1.05));      // label width that fits beside the arrows
  const ax = rx + 0.95, ay = Math.min(box.h / 2 - 0.75, ry + 0.75);     // arrow ring
  spec.items.forEach((it, i) => {
    const deg = -90 + (i * 360) / n, a = rad(deg), hi = spec.highlight === i, ca = Math.cos(a), sa = Math.sin(a);
    const L = 0.8, T = 0.42;
    const mx = cx + (rx + (ax - rx) / 2 + 0.1) * ca, my = cy + (ry + (ay - ry) / 2 + 0.05) * sa;
    slide.addShape("rightArrow", { x: mx - L / 2, y: my - T / 2, w: L, h: T, rotate: (deg + 180 + 360) % 360, fill: { color: hi ? C.accent : C.g4 }, line: { type: "none" } });
    const px = cx + (ax + 0.15) * ca, py = cy + (ay + 0.2) * sa, th = 0.9;
    let side = Math.abs(ca) < 0.3 ? "c" : ca > 0 ? "r" : "l";
    let x0 = side === "r" ? px : side === "l" ? px - tw : px - tw / 2;
    let y0 = side === "c" ? (sa < 0 ? py - th : py) : py - th / 2;
    if (side !== "c" && box.w / 2 - ax - 0.15 < 1.4) { // too narrow beside the arrow: label above it
      side = "c"; x0 = mx - tw / 2; y0 = my - T / 2 - th - 0.02; }
    x0 = Math.max(box.x, Math.min(box.x + box.w - tw, x0)); y0 = Math.max(box.y - 0.1, Math.min(box.y + box.h - th, y0));
    txt(slide, rich(it.label, it.text, hi ? C.accent : C.navy),
      x0, y0, tw, th, { max: 13, min: 9, align: side === "r" ? "left" : side === "l" ? "right" : "center", valign: side === "c" ? (sa < 0 || Math.abs(ca) >= 0.3 ? "bottom" : "top") : "middle" });
  });
}

// =====================================================================
// ENGINE: layers — pyramid, funnel
// =====================================================================
function layers(slide, spec, box, inverted) {
  const n = spec.items.length, gap = 0.06, tw = Math.min(box.w * 0.45, box.h * 1.25), th = box.h;
  const x0 = box.x, bh = (th - (n - 1) * gap) / n;
  const halfAt = (yy) => (inverted ? (1 - yy / th) : yy / th) * tw / 2; // half-width at depth yy
  spec.items.forEach((it, i) => {
    const yT = i * (bh + gap), yB = yT + bh, cxp = tw / 2;
    const wT = Math.max(inverted ? 0.35 : 0.0, halfAt(yT)), wB = Math.max(inverted ? 0.35 : 0.0, halfAt(yB));
    const hi = spec.highlight === i;
    const fill = hi ? C.accent : [C.navy, C.g5, C.g4, C.g3, C.g2][Math.min(4, Math.round((i / Math.max(1, n - 1)) * 4))];
    slide.addShape("custGeom", { x: x0, y: box.y + yT, w: tw, h: bh, fill: { color: fill }, line: { type: "none" },
      points: [{ x: cxp - wT, y: 0 }, { x: cxp + wT, y: 0 }, { x: cxp + wB, y: bh }, { x: cxp - wB, y: bh }, { close: true }] });
    if ((wT + wB) > 0.9) txt(slide, it.label, x0 + cxp - (wT + wB) / 2 + 0.05, box.y + yT, wT + wB - 0.1, bh, { max: 14, min: 9, bold: true, color: textOn(fill), align: "center", valign: "middle" });
    // callout beside (never behind)
    const lx = x0 + tw + 0.35, mid = box.y + yT + bh / 2;
    slide.addShape("line", { x: x0 + cxp + (wT + wB) / 2 + 0.05, y: mid, w: lx - (x0 + cxp + (wT + wB) / 2) - 0.1, h: 0, line: { color: C.g3, width: 1, dashType: "dash" } });
    const rich = [];
    if ((wT + wB) <= 0.9) rich.push({ text: it.label + (it.text ? "  " : ""), options: { bold: true, color: hi ? C.accent : C.navy } });
    if (it.text) rich.push({ text: it.text, options: {} });
    if (rich.length) txt(slide, rich, lx, box.y + yT, box.x + box.w - lx, bh, { max: 14, min: 9, valign: "middle" });
  });
}
const pyramid = (slide, spec, box = BODY) => layers(slide, spec, box, false);
const funnel = (slide, spec, box = BODY) => layers(slide, spec, box, true);

// =====================================================================
// ENGINE: grid — matrix
// =====================================================================
function matrix(slide, spec, box = BODY) {
  // spec: rows (top->bottom labels), cols (left->right), cells[r][c] text, xTitle, yTitle, highlight:[r,c]
  const R = spec.rows.length, Cn = spec.cols.length, ax = 1.2, gap = 0.08;
  const gx = box.x + ax, gy = box.y, gw = Math.min(box.w - ax, box.h * 1.55) - 0.1, gh = box.h - 0.75;
  const cw = (gw - (Cn - 1) * gap) / Cn, chh = (gh - (R - 1) * gap) / R;
  for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) {
    const hi = spec.highlight && spec.highlight[0] === r && spec.highlight[1] === c;
    const x = gx + c * (cw + gap), y = gy + r * (chh + gap);
    slide.addShape("rect", { x, y, w: cw, h: chh, fill: { color: hi ? C.accent : C.g1 }, line: { type: "none" } });
    const t = spec.cells?.[r]?.[c]; if (t) txt(slide, t, x + 0.12, y + 0.08, cw - 0.24, chh - 0.16, { max: 14, min: 9, color: hi ? C.white : C.text, bold: hi });
  }
  // axes with arrows
  slide.addShape("line", { x: gx - 0.15, y: gy + gh + 0.12, w: gw + 0.1, h: 0, line: { color: C.g5, width: 1.5, endArrowType: "triangle" } });
  slide.addShape("line", { x: gx - 0.15, y: gy - 0.05, w: 0, h: gh + 0.17, line: { color: C.g5, width: 1.5, beginArrowType: "triangle" } });
  spec.cols.forEach((t, c) => txt(slide, t, gx + c * (cw + gap), gy + gh + 0.17, cw, 0.3, { fontSize: 11, color: C.g5, align: "center" }));
  spec.rows.forEach((t, r) => txt(slide, t, box.x + 0.3, gy + r * (chh + gap), ax - 0.5, chh, { max: 11, min: 8, color: C.g5, align: "right", valign: "middle", margin: 0 }));
  txt(slide, spec.xTitle, gx, gy + gh + 0.45, gw, 0.3, { fontSize: 12, bold: true, color: C.navy, align: "center" });
  txt(slide, spec.yTitle, box.x - 1.15, gy + gh / 2 - 0.15, 2.6, 0.3, { fontSize: 12, bold: true, color: C.navy, align: "center", rotate: 270 });
  if (spec.side) txt(slide, spec.side, gx + gw + 0.35, gy, box.x + box.w - (gx + gw + 0.35), gh, { max: 14 });
}

// =====================================================================
// ENGINE: converge — synthesis / converge
// =====================================================================
function converge(slide, spec, box = BODY) {
  const n = spec.items.length, gap = 0.12, iw = box.w * 0.42, ih = (box.h - (n - 1) * gap) / n;
  const gx = box.x + box.w * 0.68, gw = box.w - box.w * 0.68, gh = Math.min(box.h * 0.6, 2.6), gy = box.y + (box.h - gh) / 2;
  spec.items.forEach((it, i) => {
    const y = box.y + i * (ih + gap), hi = spec.highlight === i;
    slide.addShape("rect", { x: box.x, y, w: iw, h: ih, fill: { color: hi ? C.accent : C.g1 }, line: { type: "none" } });
    txt(slide, [{ text: it.label + (it.text ? ": " : ""), options: { bold: true, color: hi ? C.white : C.navy } }, { text: it.text || "", options: { color: hi ? C.white : C.text } }],
      box.x + 0.12, y, iw - 0.24, ih, { max: 14, min: 9, valign: "middle" });
    const y1 = y + ih / 2, y2 = gy + gh / 2 + ((i - (n - 1) / 2) * gh * 0.5) / Math.max(1, n - 1);
    slide.addShape("line", { x: box.x + iw + 0.05, y: Math.min(y1, y2), w: gx - box.x - iw - 0.15, h: Math.abs(y2 - y1) || 0.001, flipV: y2 < y1, line: { color: C.g3, width: 1.25, endArrowType: "triangle" } });
  });
  slide.addShape("rect", { x: gx, y: gy, w: gw, h: gh, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, rich(spec.goal.label || "", spec.goal.text, C.white, C.white),
    gx + 0.2, gy + 0.1, gw - 0.4, gh - 0.2, { max: 15, valign: "middle" });
}

// =====================================================================
// ENGINE: venn
// =====================================================================
function venn(slide, spec, box = BODY) {
  const n = spec.items.length, cy = box.y + box.h / 2;
  const dd = Math.min(box.h * (n === 2 ? 0.8 : 0.62), 3.6, (box.w * 0.6) / (n === 2 ? 1.72 : 1.75)), cx = box.x + dd * 0.36 + dd / 2 + 0.05;
  const d = Math.min(box.h * (n === 2 ? 0.8 : 0.62), 3.6, (box.w * 0.6) / (n === 2 ? 1.72 : 1.75)), off = d * 0.36;
  const pos = n === 2 ? [[-off, 0], [off, 0]] : [[0, -off * 0.95], [-off, off * 0.6], [off, off * 0.6]];
  const cols = [C.navy, C.g4, C.accent];
  pos.slice(0, n).forEach(([dx, dy], i) => {
    slide.addShape("ellipse", { x: cx + dx - d / 2, y: cy + dy - d / 2, w: d, h: d, fill: { color: cols[i], transparency: 30 }, line: { color: C.white, width: 2 } });
    const lx = cx + dx * 1.2 - 0.9, ly = cy + dy * 1.25 - 0.35;
    // white only where it reads on the see-through circle (3 : 1 or more); grey and accent circles take the dark text
    const seen = cols[i].match(/../g).map((c) => Math.round(parseInt(c, 16) * 0.7 + 255 * 0.3).toString(16).padStart(2, "0")).join("");
    const onDark = contrast("FFFFFF", seen) >= 3;
    txt(slide, spec.items[i].label, lx, ly, 1.8, 0.7, { max: 14, bold: true, color: onDark ? C.white : C.text, onDark, align: "center", valign: "middle" });
  });
  if (spec.intersection) {
    slide.addShape("ellipse", { x: cx - 0.17, y: cy - 0.17 + (n === 3 ? off * 0.08 : 0), w: 0.34, h: 0.34, fill: { color: C.white }, line: { color: C.accent, width: 2 } });
    const tx = cx + off + d / 2 + 0.3;
    slide.addShape("line", { x: cx + 0.2, y: cy, w: tx - cx - 0.3, h: 0, line: { color: C.accent, width: 1.25, dashType: "dash" } });
    txt(slide, rich(spec.intersection.label, spec.intersection.text, C.accent),
      tx, box.y + box.h * 0.2, box.x + box.w - tx, box.h * 0.6, { max: 14, valign: "middle" });
  }
}

// =====================================================================
// ENGINE: tree — issue tree (left->right, 2-3 levels)
// =====================================================================
function issueTree(slide, spec, box = BODY) {
  const leaves = []; spec.children.forEach((c, ci) => (c.children && c.children.length ? c.children : [null]).forEach((l) => leaves.push({ ci, l })));
  const gx = 0.45, comW = spec.comments ? Math.min(3.0, box.w * 0.22) : 0, avail = box.w - 2 * gx - (comW ? comW + 0.3 : 0);
  const L = leaves.length, colW = [avail * 0.24, avail * 0.32, avail * 0.44], lh = Math.min(0.62, (box.h - (L - 1) * 0.1) / L), lg = (box.h - L * lh) / Math.max(1, L - 1);
  const xs = [box.x, box.x + colW[0] + gx, box.x + colW[0] + colW[1] + 2 * gx];
  const leafY = (k) => box.y + k * (lh + lg);
  let k = 0; const midY = [];
  spec.children.forEach((c, ci) => {
    const kids = c.children && c.children.length ? c.children : [];
    const k0 = k; k += Math.max(1, kids.length);
    const yTop = leafY(k0), yBot = leafY(k - 1) + lh, ym = (yTop + yBot) / 2; midY.push(ym);
    const hi = spec.highlight === ci;
    slide.addShape("rect", { x: xs[1], y: ym - lh / 2, w: colW[1], h: lh, fill: { color: hi ? C.accent : C.g5 }, line: { type: "none" } });
    txt(slide, c.label, xs[1] + 0.08, ym - lh / 2, colW[1] - 0.16, lh, { max: 13, min: 9, bold: true, color: C.white, valign: "middle" });
    kids.forEach((leaf, j) => {
      const y = leafY(k0 + j);
      slide.addShape("rect", { x: xs[2], y, w: colW[2], h: lh, fill: { color: hi ? C.hiBand : C.g1 }, line: { type: "none" } });
      txt(slide, leaf, xs[2] + 0.08, y, colW[2] - 0.16, lh, { max: 12, min: 9, valign: "middle" });
      elbow(slide, xs[1] + colW[1], ym, xs[2], y + lh / 2);
    });
    if (spec.comments && spec.comments[ci]) txt(slide, spec.comments[ci], xs[2] + colW[2] + 0.3, yTop, box.x + box.w - xs[2] - colW[2] - 0.3, yBot - yTop, { max: 12, min: 9, valign: "middle", color: hi ? C.accent : C.g5 });
  });
  const rh = Math.min(1.4, box.h * 0.3), ry = box.y + box.h / 2 - rh / 2;
  slide.addShape("rect", { x: xs[0], y: ry, w: colW[0], h: rh, fill: { color: C.navy }, line: { type: "none" } });
  txt(slide, spec.root, xs[0] + 0.1, ry, colW[0] - 0.2, rh, { max: 15, bold: true, color: C.white, valign: "middle" });
  midY.forEach((ym) => elbow(slide, xs[0] + colW[0], ry + rh / 2, xs[1], ym));
}
function elbow(slide, x1, y1, x2, y2) {
  const xm = x1 + (x2 - x1) / 2, c = { color: C.g3, width: 1.25 };
  slide.addShape("line", { x: x1, y: y1, w: xm - x1, h: 0, line: c });
  slide.addShape("line", { x: xm, y: Math.min(y1, y2), w: 0, h: Math.abs(y2 - y1) || 0.001, line: c });
  slide.addShape("line", { x: xm, y: y2, w: x2 - xm, h: 0, line: c });
}

// =====================================================================
// free compositions — temple, balance, before-after
// =====================================================================
function temple(slide, spec, box = BODY) {
  const n = spec.pillars.length, roofH = 0.85, baseH = 0.6, gap = 0.18, inset = 0.3;
  slide.addShape("custGeom", { x: box.x, y: box.y, w: box.w, h: roofH, fill: { color: C.navy }, line: { type: "none" },
    points: [{ x: box.w / 2, y: 0 }, { x: box.w, y: roofH }, { x: 0, y: roofH }, { close: true }] });
  txt(slide, spec.roof, box.x + box.w * 0.25, box.y + roofH * 0.35, box.w * 0.5, roofH * 0.62, { max: 16, bold: true, color: C.white, align: "center", valign: "middle" });
  const pw = (box.w - 2 * inset - (n - 1) * gap) / n, py = box.y + roofH + 0.12, ph = box.h - roofH - baseH - 0.24;
  spec.pillars.forEach((p, i) => {
    const x = box.x + inset + i * (pw + gap), hi = spec.highlight === i;
    slide.addShape("rect", { x, y: py, w: pw, h: 0.5, fill: { color: hi ? C.accent : C.g5 }, line: { type: "none" } });
    txt(slide, p.label, x + 0.08, py, pw - 0.16, 0.5, { max: 14, bold: true, color: C.white, align: "center", valign: "middle" });
    slide.addShape("rect", { x, y: py + 0.5, w: pw, h: ph - 0.5, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, p.text, x + 0.1, py + 0.6, pw - 0.2, ph - 0.7, { max: 13, min: 9 });
  });
  slide.addShape("rect", { x: box.x, y: box.y + box.h - baseH, w: box.w, h: baseH, fill: { color: C.g4 }, line: { type: "none" } });
  txt(slide, spec.base, box.x + 0.2, box.y + box.h - baseH, box.w - 0.4, baseH, { max: 14, bold: true, color: C.white, align: "center", valign: "middle" });
}

function beforeAfter(slide, spec, box = BODY) {
  // spec.rows: [{from, to}] ; spec.fromTitle, spec.toTitle
  const n = spec.rows.length, gap = 0.12, hh = 0.5, rh = (box.h - hh - 0.1 - (n - 1) * gap) / n, aw = 0.6, cw = (box.w - aw - 0.3) / 2;
  txt(slide, spec.fromTitle, box.x, box.y, cw, hh, { fontSize: 16, bold: true, color: C.g5, valign: "bottom" });
  txt(slide, spec.toTitle, box.x + cw + aw + 0.3, box.y, cw, hh, { fontSize: 16, bold: true, color: C.accent, valign: "bottom" });
  spec.rows.forEach((r, i) => {
    const y = box.y + hh + 0.1 + i * (rh + gap);
    slide.addShape("rect", { x: box.x, y, w: cw, h: rh, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, r.from, box.x + 0.12, y, cw - 0.24, rh, { max: 14, valign: "middle", color: C.g5 });
    slide.addShape("chevron", { x: box.x + cw + 0.15, y: y + rh / 2 - 0.2, w: aw - 0.1, h: 0.4, fill: { color: C.g3 }, line: { type: "none" } });
    slide.addShape("rect", { x: box.x + cw + aw + 0.3, y, w: cw, h: rh, fill: { color: C.hiBand }, line: { type: "none" } });
    txt(slide, r.to, box.x + cw + aw + 0.42, y, cw - 0.24, rh, { max: 14, valign: "middle", bold: !!r.key });
  });
}

// =====================================================================
// DATA — native charts with "one highlighted" rule
// =====================================================================
function barRanking(pres, slide, spec, box = BODY) {
  // spec.data:[{label,value}], spec.highlightLabel ; sorted desc, highlight via 2 stacked series
  const d = [...spec.data].sort((a, b) => a.value - b.value); // bottom->top in bar charts
  const labels = d.map((x) => x.label);
  const others = d.map((x) => (x.label === spec.highlightLabel ? 0 : x.value));
  const hi = d.map((x) => (x.label === spec.highlightLabel ? x.value : 0));
  slide.addChart(pres.ChartType.bar, [{ name: "Others", labels, values: others }, { name: spec.highlightLabel, labels, values: hi }], {
    ...box, barDir: "bar", barGrouping: "stacked", chartColors: [C.g3, C.chartHi], showLegend: false,
    showValue: true, dataLabelPosition: "inBase", dataLabelColor: C.white, dataLabelFontSize: 11, dataLabelFormatCode: '#,##0;;;',
    catAxisLabelColor: C.text, catAxisLabelFontSize: 12, catAxisLabelFontFace: THEME.bodyFontFace, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 45, catAxisLineShow: false,
  });
}
function waterfall(pres, slide, spec, box = BODY) {
  // spec.steps: [{label, value, total?}] first and last are totals
  let run = 0; const labels = [], base = [], up = [], down = [], tot = [];
  spec.steps.forEach((s) => {
    labels.push(s.label);
    if (s.total) { base.push(0); up.push(0); down.push(0); tot.push(s.value); run = s.value; }
    else if (s.value >= 0) { base.push(run); up.push(s.value); down.push(0); tot.push(0); run += s.value; }
    else { run += s.value; base.push(run); up.push(0); down.push(-s.value); tot.push(0); }
  });
  slide.addChart(pres.ChartType.bar, [
    { name: "base", labels, values: base }, { name: "Total", labels, values: tot },
    { name: "Increase", labels, values: up }, { name: "Decrease", labels, values: down }], {
    ...box, barDir: "col", barGrouping: "stacked", chartColors: ["FFFFFF", C.navy, C.cyan, C.g4], showLegend: false,
    showValue: true, dataLabelPosition: "ctr", dataLabelColor: C.white, dataLabelFontSize: 11, dataLabelFormatCode: '#,##0;;;',
    catAxisLabelColor: C.text, catAxisLabelFontSize: 11, valAxisHidden: true, valGridLine: { style: "none" }, barGapWidthPct: 40,
    ...chartStyle(), ...(spec.chartOptions || {}),
  });
}


// =====================================================================
// small objects — KPI cards, Harvey balls, stickers, column with highlight
// =====================================================================
function kpiRow(slide, spec, box = BODY) {
  // spec.items:[{value, label, note}], spec.highlight
  const n = spec.items.length, gap = 0.3, w = (box.w - (n - 1) * gap) / n, h = Math.min(box.h, 2.6);
  spec.items.forEach((it, i) => {
    const x = box.x + i * (w + gap), hi = spec.highlight === i;
    slide.addShape("rect", { x, y: box.y, w, h, fill: { color: hi ? C.navy : C.g1 }, line: { type: "none" } });
    if (hi) slide.addShape("rect", { x, y: box.y, w: 0.09, h, fill: { color: C.accent }, line: { type: "none" } });
    txt(slide, it.value, x + 0.3, box.y + 0.25, w - 0.5, 1.15, { fontSize: fitSize(it.value, w - 0.5, 1.1, 60, 28), bold: true, color: hi ? C.white : C.navy, valign: "bottom", margin: 0 });
    txt(slide, it.label, x + 0.3, box.y + 1.45, w - 0.5, 0.5, { max: 16, bold: true, color: hi ? C.white : C.text, margin: 0 });
    if (it.note) txt(slide, it.note, x + 0.3, box.y + 1.95, w - 0.5, h - 2.05, { max: 12, min: 9, color: hi ? C.white : C.g5, margin: 0 });
  });
}
function harveyBall(slide, x, y, d, quarters) { // 0..4
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: C.white }, line: { color: C.navy, width: 1 } });
  if (quarters >= 4) slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: C.navy }, line: { color: C.navy, width: 1 } });
  else if (quarters > 0) slide.addShape("pie", { x, y, w: d, h: d, angleRange: [270, (270 + quarters * 90) % 360], fill: { color: C.navy }, line: { type: "none" } });
}
function scoringTable(slide, spec, box = BODY) {
  // spec.criteria:[..], spec.options:[{label, scores:[0..4]}], spec.highlight (option index)
  const nc = spec.criteria.length, no = spec.options.length, lw = 2.6, cw = (box.w - lw) / nc, hh = 0.55, rh = Math.min(0.75, (box.h - hh - 0.5) / no);
  spec.criteria.forEach((c, j) => txt(slide, c, box.x + lw + j * cw, box.y, cw, hh, { max: 12, min: 9, bold: true, color: C.navy, align: "center", valign: "bottom" }));
  slide.addShape("line", { x: box.x, y: box.y + hh + 0.05, w: box.w, h: 0, line: { color: C.navy, width: 1 } });
  spec.options.forEach((o, i) => {
    const y = box.y + hh + 0.12 + i * rh, hi = spec.highlight === i;
    if (hi) slide.addShape("rect", { x: box.x, y, w: box.w, h: rh - 0.04, fill: { color: C.hiBand }, line: { type: "none" } });
    txt(slide, o.label, box.x + 0.1, y, lw - 0.2, rh - 0.04, { max: 14, bold: hi, valign: "middle" });
    o.scores.forEach((q, j) => harveyBall(slide, box.x + lw + j * cw + cw / 2 - 0.15, y + (rh - 0.04) / 2 - 0.15, 0.3, q));
    slide.addShape("line", { x: box.x, y: y + rh - 0.02, w: box.w, h: 0, line: { color: C.g3, width: 0.75 } });
  });
  const ly = box.y + hh + 0.2 + no * rh;
  [0, 1, 2, 3, 4].forEach((q, k) => { harveyBall(slide, box.x + k * 1.25, ly, 0.2, q); txt(slide, ["None", "Low", "Medium", "High", "Full"][k], box.x + k * 1.25 + 0.26, ly - 0.03, 0.9, 0.26, { fontSize: 10, color: C.g5 }); });
}
function sticker(slide, text) { // status tag top-right, upper case (RB/McK)
  txt(slide, String(text).toUpperCase(), W - HOUSE.GRID.right - 1.9, 0.62, 1.9, 0.3, { fontSize: 10, bold: true, color: C.g5, align: "right", valign: "middle" });
  slide.addShape("line", { x: W - HOUSE.GRID.right - 1.9, y: 0.92, w: 1.9, h: 0, line: { color: C.g3, width: 0.75 } });
}
function columnHighlight(pres, slide, spec, box = BODY) {
  // spec.data:[{label,value}], spec.highlightLabel, spec.format
  const labels = spec.data.map((d) => d.label);
  const others = spec.data.map((d) => (d.label === spec.highlightLabel ? 0 : d.value));
  const hi = spec.data.map((d) => (d.label === spec.highlightLabel ? d.value : 0));
  slide.addChart(pres.ChartType.bar, [{ name: "Others", labels, values: others }, { name: spec.highlightLabel || "Key", labels, values: hi }], {
    ...box, barDir: "col", barGrouping: "stacked", chartColors: [C.g3, C.navy], showLegend: false,
    showValue: true, dataLabelPosition: "inEnd", dataLabelColor: C.white, dataLabelFontSize: 11, dataLabelFormatCode: spec.format || "#,##0;;;",
    catAxisLabelColor: C.text, catAxisLabelFontSize: 11, catAxisLabelFontFace: THEME.bodyFontFace, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 50,
  });
}


// =====================================================================
// more generators: gantt, org chart, target/onion, phase matrix / swimlanes, table, puzzle grid, icon list
// =====================================================================
function gantt(slide, spec, box = BODY) {
  // spec.periods:[...], spec.rows:[{label, start, end, milestone?}] (0-based period indexes), spec.highlight
  const P = spec.periods.length, lw = Math.min(3.2, box.w * 0.28), cw = (box.w - lw) / P, hh = 0.38;
  const rh = Math.min(0.5, (box.h - hh - 0.1) / spec.rows.length);
  spec.periods.forEach((p, j) => { const x = box.x + lw + j * cw;
    slide.addShape("rect", { x, y: box.y, w: cw - 0.02, h: hh, fill: { color: C.navy }, line: { type: "none" } });
    txt(slide, p, x, box.y, cw - 0.02, hh, { max: 11, min: 8, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 }); });
  spec.rows.forEach((r, i) => { const y = box.y + hh + 0.1 + i * rh, hi = spec.highlight === i;
    if (i % 2 === 0) slide.addShape("rect", { x: box.x, y, w: box.w, h: rh, fill: { color: C.g1 }, line: { type: "none" } });
    txt(slide, r.label, box.x + 0.08, y, lw - 0.16, rh, { max: 12, min: 8, bold: hi, valign: "middle" });
    if (r.end != null) slide.addShape("rect", { x: box.x + lw + r.start * cw + 0.04, y: y + rh * 0.22, w: (r.end - r.start + 1) * cw - 0.08, h: rh * 0.56, fill: { color: hi ? C.accent : C.cyan }, line: { type: "none" } });
    if (r.milestone != null) { const mx = box.x + lw + (r.milestone + 0.5) * cw;
      slide.addShape("diamond", { x: mx - 0.12, y: y + rh / 2 - 0.12, w: 0.24, h: 0.24, fill: { color: C.navy }, line: { type: "none" } }); } });
}
function orgChart(slide, spec, box = BODY) {
  // spec: {label, sub?, children:[{label, sub?, children:[...] }]}  (3 levels max), spec.highlight (child index)
  const kids = spec.children || [], n = Math.max(1, kids.length), gap = 0.18;
  const w = Math.min(2.4, (box.w - (n - 1) * gap) / n), h = 0.62, rowGap = 0.45;
  const box2 = (x, y, node, fill) => { slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
    txt(slide, [{ text: node.label, options: { bold: true, color: textOn(fill), breakLine: !!node.sub } }, ...(node.sub ? [{ text: node.sub, options: { color: textOn(fill) } }] : [])], x + 0.06, y, w - 0.12, h, { max: 12, min: 8, align: "center", valign: "middle", margin: 0 }); };
  const total = n * w + (n - 1) * gap, x0 = box.x + (box.w - total) / 2, cx = box.x + box.w / 2;
  box2(cx - w / 2, box.y, spec, C.navy);
  const y1 = box.y + h + rowGap, ym = box.y + h + rowGap / 2, ln = { color: C.g3, width: 1 };
  slide.addShape("line", { x: cx, y: box.y + h, w: 0, h: rowGap / 2, line: ln });
  if (n > 1) slide.addShape("line", { x: x0 + w / 2, y: ym, w: total - w, h: 0, line: ln });
  kids.forEach((k, i) => { const x = x0 + i * (w + gap); slide.addShape("line", { x: x + w / 2, y: ym, w: 0, h: rowGap / 2, line: ln });
    box2(x, y1, k, spec.highlight === i ? C.accent : C.g5);
    (k.children || []).forEach((g, j) => { const y = y1 + h + 0.15 + j * (h * 0.8 + 0.1);
      slide.addShape("line", { x: x + 0.12, y: y1 + h, w: 0, h: y - y1 - h + h * 0.4, line: ln });
      slide.addShape("line", { x: x + 0.12, y: y + h * 0.4, w: 0.12, h: 0, line: ln });
      slide.addShape("rect", { x: x + 0.24, y, w: w - 0.24, h: h * 0.8, fill: { color: C.g1 }, line: { type: "none" } });
      txt(slide, g.label, x + 0.3, y, w - 0.36, h * 0.8, { max: 11, min: 8, valign: "middle", margin: 0 }); }); });
}

// top-down tree of any depth and width (vertical logic tree, org chart). spec: {label, sub?, hi?, children:[...]}, spec.look:
//  "boxes" (default): filled boxes, label centred; "cards": header bar (label) + body below (sub), e.g. org charts.
// Leaves share the width evenly; parents sit over their children; elbow connectors; a node with hi:true takes the highlight.
function treeDown(slide, spec, box = BODY) {
  const look = spec.look || "boxes", depthOf = (n) => 1 + Math.max(0, ...(n.children || []).map(depthOf));
  const leavesOf = (n) => (n.children && n.children.length ? n.children.reduce((a, c) => a + leavesOf(c), 0) : 1);
  const D = depthOf(spec), L = leavesOf(spec), slot = box.w / L, gapY = spec.gapY || 0.35;
  const nh = spec.nodeH || Math.min(look === "cards" ? 1.0 : 0.62, (box.h - (D - 1) * gapY) / D), nw = Math.min(spec.maxW || 2.2, slot * 0.88);
  const ln = { color: C.g3, width: 1 }, levelFill = spec.levelFill || [C.g5, C.g4, C.g3, C.g4];
  const place = (n, x0, d) => {           // returns centre x
    const kids = n.children || [];
    let cx;
    if (!kids.length) cx = x0 + slot / 2;
    else { let x = x0; const cs = kids.map((k) => { const c = place(k, x, d + 1); x += leavesOf(k) * slot; return c; }); cx = (cs[0] + cs[cs.length - 1]) / 2; n._cs = cs; }
    n._x = cx; n._y = box.y + d * (nh + gapY); return cx;
  };
  place(spec, box.x, 0);
  const draw = (n, d) => {
    const x = n._x - nw / 2, y = n._y, hi = !!n.hi;
    if (look === "cards") {
      const hh = Math.min(0.3, nh * 0.32), fill = hi ? C.accent : (n.fill || levelFill[Math.min(d, levelFill.length - 1)]);
      slide.addShape("rect", { x, y, w: nw, h: hh, fill: { color: fill }, line: { type: "none" } });
      txt(slide, n.label, x + 0.04, y, nw - 0.08, hh, { max: 11, min: 7, bold: true, color: textOn(fill) === C.white || contrast(fill, "FFFFFF") >= 3 ? C.white : C.text, align: "center", valign: "middle", margin: 0 });
      slide.addShape("rect", { x, y: y + hh, w: nw, h: nh - hh, fill: { color: C.g1 }, line: { type: "none" } });
      if (n.sub) txt(slide, n.sub, x + 0.06, y + hh + 0.02, nw - 0.12, nh - hh - 0.04, { max: 10, min: 7, valign: "top", margin: 0.02 });
    } else {
      const fill = hi ? C.accent : (n.fill || C.g2);
      slide.addShape("rect", { x, y, w: nw, h: nh, fill: { color: fill }, line: { type: "none" } });
      txt(slide, n.sub ? rich(n.label, n.sub, textOn(fill)) : n.label, x + 0.05, y, nw - 0.1, nh, { max: 14, min: 8, color: textOn(fill), align: "center", valign: "middle" });
    }
    const kids = n.children || [];
    if (kids.length) {
      const yb = y + nh, ym = yb + gapY / 2;
      slide.addShape("line", { x: n._x, y: yb, w: 0, h: gapY / 2, line: ln });
      if (kids.length > 1) slide.addShape("line", { x: n._cs[0], y: ym, w: n._cs[n._cs.length - 1] - n._cs[0], h: 0, line: ln });
      n._cs.forEach((cx) => slide.addShape("line", { x: cx, y: ym, w: 0, h: gapY / 2, line: ln }));
      kids.forEach((k) => draw(k, d + 1));
    }
  };
  draw(spec, 0);
}
function targetOnion(slide, spec, box = BODY) {
  // spec.items: outer -> inner [{label, text}], spec.highlight
  const n = spec.items.length, D = Math.min(box.h, box.w * 0.5), cx = box.x + D / 2, cy = box.y + box.h / 2;
  spec.items.forEach((it, i) => { const d = D * (n - i) / n, hi = spec.highlight === i;
    const fill = hi ? C.accent : [C.g2, C.g3, C.g4, C.g5, C.navy][Math.min(4, Math.round((i / Math.max(1, n - 1)) * 4))];
    slide.addShape("ellipse", { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: fill }, line: { color: C.white, width: 1.5 } });
    const ly = cy - d / 2 + (D / n) * 0.25;
    if (i < n - 1) txt(slide, it.label, cx - 1.1, ly, 2.2, 0.32, { max: 12, min: 8, bold: true, color: textOn(fill), align: "center", margin: 0 });
    else txt(slide, it.label, cx - d / 2, cy - 0.3, d, 0.6, { max: 13, min: 8, bold: true, color: textOn(fill), align: "center", valign: "middle", margin: 0 });
    const tx = box.x + D + 0.5, th = box.h / n;
    slide.addShape("line", { x: cx, y: ly + 0.16, w: tx - cx - 0.1, h: 0, line: { color: C.g3, width: 0.75, dashType: "dash" } });
    txt(slide, rich(it.label, it.text, hi ? C.accent : C.navy), tx, ly - 0.1, box.x + box.w - tx, Math.min(th, 0.9), { max: 13, min: 9 }); });
}
function phaseMatrix(slide, spec, box = BODY) {
  // spec.phases:[...], spec.streams:[...], spec.cells[stream][phase], spec.highlight:[s,p] ; also used for swimlanes
  const P = spec.phases.length, S = spec.streams.length, lw = Math.min(2.4, box.w * 0.2), hh = 0.55, gap = 0.06;
  const cw = (box.w - lw) / P, rh = (box.h - hh - 0.1 - (S - 1) * gap) / S, pt = hh * 0.35;
  spec.phases.forEach((p, j) => { const x = box.x + lw + j * cw - (j ? pt * 0.6 : 0), w = cw + (j ? pt * 0.6 : 0);
    slide.addShape(j === 0 ? "homePlate" : "chevron", { x, y: box.y, w, h: hh, fill: { color: C.navy }, line: { type: "none" } });
    txt(slide, p, x + (j ? pt : 0.1), box.y, w - pt * 1.6, hh, { max: 12, min: 8, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 }); });
  spec.streams.forEach((st, i) => { const y = box.y + hh + 0.1 + i * (rh + gap);
    slide.addShape("rect", { x: box.x, y, w: lw - 0.08, h: rh, fill: { color: C.g5 }, line: { type: "none" } });
    txt(slide, st, box.x + 0.08, y, lw - 0.24, rh, { max: 12, min: 8, bold: true, color: C.white, valign: "middle" });
    spec.phases.forEach((_, j) => { const x = box.x + lw + j * cw, hi = spec.highlight && spec.highlight[0] === i && spec.highlight[1] === j;
      slide.addShape("rect", { x: x + 0.03, y, w: cw - 0.06, h: rh, fill: { color: hi ? C.hiBand : C.g1 }, line: { type: "none" } });
      const t = spec.cells?.[i]?.[j]; if (t) txt(slide, t, x + 0.1, y + 0.05, cw - 0.2, rh - 0.1, { max: 12, min: 8, valign: "middle" }); }); });
}
// ---- tables (v2.57, roadmap 4.2 Run 2a). The one house table (solid navy header band, white bold text, hairline rows,
// one light-blue row, 11 pt) is gone: the user failed all 10 house slides that carried it ("i know its ai right away").
// Five forms studied from the reference decks' own tables (Style/table-forms.md), picked by content unless spec.form says:
//   "ruled"     ruled table, no header band: header text bold in the main colour over one heavier rule, thin grey row rules
//               (Polaris 19, Mindcraft 20, InnoVision 11)
//   "rowblocks" coloured row-label blocks: each row label (or a merged group label, spec.groups) in its own filled block
//               (Sparkle 8, E-Cluster 23, Mindcraft 27)
//   "panels"    column panels under header boxes: each option a separate panel under its own header box, white gaps between
//               (TrueNorth 15, OnTheNeptune 7, Mindcraft 12)
//   "marks"     a ruled table whose cells carry things: Harvey balls, dots, ticks/crosses, tinted chips, a circled value, bars
//               (Polaris 10 and 19, InnoVision 11 and 16, SSSR 19, Harvester 7, BearingPoint traffic lights)
//   "statement" plain ruled statement for financials: period columns, numbers right-aligned, section rows, totals over a rule
//               (Mindcraft 25 and 27, SSSR 19)
// Cells are strings/numbers, or objects {text, harvey:0..4, dot:0..2, tick:true|false, chip:true, circle:true, bar:0..1, bold}.
// Text at the deck's body size (HOUSE.TYPE.body), never shrunk; rows sized to their text and grown to fill the box up to 0.75 in,
// so a table is never a low full-width strip (deck_lint: "table strip").
const TABLE_FORMS = ["ruled", "rowblocks", "panels", "marks", "statement"];
const _isNum = (s) => /^[\s(]*[-–+]?[$¥€£]?\s?[\d.,]+\s?(%|x|×|pp|bn|m|k|M|B|K)?[)\s]*$/.test(String(s)) && /\d/.test(String(s));
const _isPeriod = (s) => /^(FY|CY)?\s?'?(19|20)?\d{2}([AEFBP]|e|E)?$|^(Q|H)[1-4]|^Year\s?\d|^\d{4}\s?[-–]\s?\d{2,4}$|年$/.test(String(s).trim());
const _ems = (t) => [...String(t)].reduce((s, ch) => s + (/[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.5), 0);
const _cellText = (c) => (c && typeof c === "object" ? (c.text == null ? "" : String(c.text)) : (c == null ? "" : String(c)));
const _hasMark = (c) => !!c && typeof c === "object" && ["harvey", "dot", "tick", "chip", "circle", "bar"].some((k) => c[k] !== undefined);
function tableForm(spec) {
  if (spec.form) return spec.form;
  const body = spec.rows || [];
  if (body.some((r) => r.some(_hasMark))) return "marks";
  if (spec.groups) return "rowblocks";
  const hdr = (spec.header || []).slice(1), cells = body.flatMap((r) => r.slice(1).map(_cellText)).filter((t) => t.trim());
  if (hdr.length >= 2 && hdr.filter(_isPeriod).length >= hdr.length * 0.6 && cells.filter(_isNum).length >= cells.length * 0.7) return "statement";
  const avg = cells.length ? cells.reduce((a, t) => a + t.length, 0) / cells.length : 0;
  if (hdr.length >= 2 && hdr.length <= 4 && body.length <= 7 && avg >= 18) return "panels";
  return "ruled";
}
// lines a text needs in a column (Arial: Latin ~0.52 em a character, CJK 1 em), at pt
function _lines(text, wIn, pt) {
  const cap = Math.max(1, (wIn * 72) / pt);   // ems per line
  return String(text).split("\n").reduce((a, para) => {
    let n = 1, cur = 0;
    for (const word of para.split(/(\s+)/)) {
      const em = [...word].reduce((s, ch) => s + (/[⺀-鿿＀-￯]/.test(ch) ? 1 : 0.5), 0);
      if (cur + em > cap && cur > 0) { n++; cur = em; } else cur += em;
      while (cur > cap) { n++; cur -= cap; }
    }
    return a + n;
  }, 0);
}
function table(slide, spec, box = BODY) {
  const form = tableForm(spec); if (!TABLE_FORMS.includes(form)) throw new Error("table: unknown form " + form);
  const S = HOUSE.STYLE, ts = (S && S.table) || {};
  // text at the deck's own table size: a reference's measured table text (profile table.pt, else its label size), the house's
  // body size; a build may ask for larger, never smaller (the house table was 11 pt)
  const base = S ? (ts.pt || (S.body && S.body.label_pt) || HOUSE.TYPE.body) : HOUSE.TYPE.body, pt = Math.max(spec.fontSize || 0, base);
  const hr = ts.header_rule || [C.text, 1.5], rr = ts.row_rule || [C.g3, 0.75];
  const hiLine = S ? C.accent : C.navy;                                              // highlight = outline + bold, never a tinted band
  const groups = form === "rowblocks" && spec.groups ? spec.groups : null;          // [{label, rows:n}] -> merged first column
  const header = (groups ? [spec.groupHeader || ""] : []).concat(spec.header || []);
  const nc = header.length, rows = spec.rows || [];
  let colW = spec.colW && spec.colW.reduce((x, y) => x + y, 0) <= 1.01 ? spec.colW.map((f) => f * box.w) : spec.colW;
  if (colW && groups && colW.length === nc - 1) { const g = Math.min(box.w * 0.3, Math.max(1.1, ...groups.map((q) => (_ems(q.label) * 1.08 * Math.max(spec.fontSize || 0, S ? (ts.pt || (S.body && S.body.label_pt) || HOUSE.TYPE.body) : HOUSE.TYPE.body)) / 72 + 0.3))), k = (box.w - g) / colW.reduce((a, b) => a + b, 0); colW = [g, ...colW.map((w) => w * k)]; }
  if (!colW) {   // first column a little wider; others share the rest by their longest text
    const need = header.map((h, j) => Math.max(_cellText(h).length, ...rows.map((r) => _cellText(r[j - (groups ? 1 : 0)]).length), 4) ** 0.6);
    if (groups) need[0] = Math.max(...groups.map((q) => String(q.label).length), 6) ** 0.6;
    const sum = need.reduce((a, b) => a + b, 0); colW = need.map((n) => (n / sum) * box.w);
  }
  const sx = box.w / colW.reduce((a, b) => a + b, 0); colW = colW.map((w) => w * sx);
  const pad = 0.08, lh = (pt * 1.2) / 72;
  const gap = form === "panels" || form === "rowblocks" ? 0.05 : 0;
  const hText = header.map(_cellText), hLines = Math.max(1, ...hText.map((t, j) => (t ? _lines(t, (colW[j] - 2 * pad) / 1.08, pt) : 1)));
  const hH = Math.max(0.38, hLines * lh + 0.14) + (form === "panels" ? 0.06 : 0);
  // body row heights from their text, then grown to fill the box (up to 0.75 in a row)
  const body = rows.map((r) => (groups ? [null, ...r] : r));
  let rH = body.map((r) => { const n = Math.max(1, ...r.map((c, j) => (c == null ? 1 : _lines(_cellText(c), colW[j] - 2 * pad - (c && c.bar !== undefined ? colW[j] * 0.45 : 0), pt))));
    return Math.max(0.34, n * lh + (n > 1 ? 0.1 : 0.14)); });
  const legendH = spec.legend ? 0.36 : 0;
  const room = box.h - hH - (spec.unit ? lh + 0.05 : 0) - legendH, used = rH.reduce((a, b) => a + b, 0);
  if (used < room) { const add = Math.min((room - used) / rH.length, Math.max(0, 0.75 - Math.min(...rH))); rH = rH.map((h) => h + add); }
  const isTotal = (i) => (spec.totalRows || []).includes(i), isSection = (i) => (spec.sectionRows || []).includes(i);
  const hiRow = spec.highlightRow, hiCol = spec.highlightCol;
  const none = { type: "none" }, line = (c, w) => ({ type: "solid", color: c, pt: w }), white = (w) => ({ type: "solid", color: "FFFFFF", pt: w });
  const numCol = header.map((_, j) => { const cs = body.map((r) => r[j]).filter((c) => c != null && (_hasMark(c) || _cellText(c).trim()));
    return cs.length > 0 && cs.filter((c) => _hasMark(c) || _isNum(_cellText(c)) || /^[✓✗–-]$/.test(_cellText(c))).length >= cs.length * 0.6; });
  const align = (t, j) => (j === 0 || (groups && j === 1) ? "left" : form === "statement" ? "right" : form === "panels" ? "center" : numCol[j] ? "center" : "left");
  // header row
  const top = [];
  let y0 = box.y;
  if (spec.unit) { txt(slide, spec.unit, box.x, y0, box.w, lh + 0.05, { fontSize: pt, keepSize: true, noScale: true, color: C.g5, margin: 0, valign: "bottom" }); y0 += lh + 0.05; }
  top.push(hText.map((t, j) => {
    const o = { bold: true, align: align(t, j), valign: "bottom", color: C.navy };
    if (form === "panels") {
      if (j === 0) Object.assign(o, { color: C.text, border: [none, none, none, none] });
      else Object.assign(o, { color: C.white, valign: "middle", align: "center", fill: { color: hiCol === j ? C.accent : C.navy }, border: [white(4), white(4), white(4), white(4)] });
    } else if (form === "statement") Object.assign(o, { color: C.text, border: [none, none, line(C.text, 1), none] });
    else Object.assign(o, { border: [none, none, line(hr[0], hr[1]), none] });
    return { text: t, options: o };
  }));
  // body rows
  const trs = body.map((r, i) => r.map((c, j) => {
    const t = c == null ? "" : _cellText(c), first = j === (groups ? 1 : 0);
    const o = { align: align(t, j), valign: "middle", bold: hiRow === i || (first && form !== "statement") || isTotal(i) || (c && typeof c === "object" && c.bold) || (form === "statement" && isSection(i)), color: C.text };
    if (form === "statement") {
      Object.assign(o, { italic: isSection(i), border: [none, none, isTotal(i) || (i === body.length - 1 && spec.ruleLast) ? line(C.text, 1) : none, none] });
      if (isTotal(i)) o.border = [none, none, none, none];
      if (first && !isSection(i) && (spec.sectionRows || []).length) o.margin = [0.04, 0.04, 0.04, 0.25];
    } else if (form === "panels") {
      if (j === 0) Object.assign(o, { border: [none, none, line(rr[0], rr[1]), none] });
      else Object.assign(o, { fill: { color: C.g1 }, bold: o.bold || hiCol === j, border: [white(4), white(4), white(4), white(4)] });
    } else if (form === "rowblocks" && first && !groups) {
      Object.assign(o, { fill: { color: spec.blockFill === "main" ? C.navy : C.g1 }, color: spec.blockFill === "main" ? C.white : C.text, border: [none, white(4), white(4), none] });
    } else if (form === "rowblocks" && groups && j === 0) {
      Object.assign(o, { border: [none, white(4), white(4), none] });
    } else Object.assign(o, { border: [none, none, line(rr[0], rr[1]), none] });
    if (c && c.chip) Object.assign(o, { fill: { color: C.g2 }, bold: true, border: [white(3), white(3), white(3), white(3)] });
    if (_hasMark(c) && !c.chip && !c.circle) return { text: c.bar !== undefined ? t : "", options: { ...o, align: c.bar !== undefined ? "right" : o.align } };
    return { text: t, options: o };
  }));
  // merged group labels (rowblocks with groups)
  if (groups) { let i = 0; groups.forEach((g, k) => { if (i < trs.length) { trs[i][0] = { text: g.label, options: { rowspan: g.rows, bold: true, valign: "middle", align: "left",
      fill: { color: g.hi || spec.highlightGroup === k ? C.navy : C.g1 }, color: g.hi || spec.highlightGroup === k ? C.white : C.text, border: [none, white(4), white(4), none] } };
    for (let m = 1; m < g.rows && i + m < trs.length; m++) trs[i + m].shift(); } i += g.rows; }); }
  // statement totals: rule on top of the total row (= under the row before it)
  if (form === "statement") (spec.totalRows || []).forEach((i) => { if (i > 0) trs[i - 1].forEach((cell) => { if (cell && cell.options) cell.options.border = [none, none, line(C.text, 1), none]; }); });
  const allH = [hH, ...rH], tH = allH.reduce((a, b) => a + b, 0);
  slide.addTable([...top, ...trs], { x: box.x, y: y0, w: box.w, colW, rowH: allH, h: tH, fontFace: THEME.bodyFontFace, fontSize: pt, color: C.text, margin: [0.04, pad, 0.04, pad], valign: "middle", autoPage: false });
  // overlays: highlight outline, marks
  const yOf = (i) => y0 + hH + rH.slice(0, i).reduce((a, b) => a + b, 0), xOf = (j) => box.x + colW.slice(0, j).reduce((a, b) => a + b, 0);
  if (hiRow != null && form !== "statement") slide.addShape("rect", { x: box.x, y: yOf(hiRow) + 0.02, w: box.w, h: rH[hiRow] - 0.04, fill: { type: "none" }, line: { color: hiLine, width: 1.75 } });
  body.forEach((r, i) => r.forEach((c, j) => {
    if (!_hasMark(c)) return;
    const x = xOf(j), w = colW[j], y = yOf(i), h = rH[i], d = Math.min(0.3, h * 0.6), al = align(_cellText(c), j), cy = y + h / 2;
    const cx = al === "left" ? x + pad + d / 2 : al === "right" ? x + w - pad - d / 2 : x + w / 2;
    if (c.harvey !== undefined) harveyBall(slide, cx - d / 2, cy - d / 2, d, c.harvey);
    if (c.dot !== undefined) { const lv = Math.max(0, Math.min(2, c.dot)), dd = d * 0.8;
      slide.addShape("ellipse", { x: cx - dd / 2, y: cy - dd / 2, w: dd, h: dd, fill: { color: lv === 2 ? C.navy : lv === 1 ? C.g3 : C.white }, line: { color: lv === 0 ? C.g4 : lv === 2 ? C.navy : C.g3, width: 1 } }); }
    if (c.tick !== undefined) txt(slide, c.tick ? "✓" : "✗", x, y, w, h, { fontSize: pt + 2, keepSize: true, noScale: true, bold: true, color: c.tick ? C.navy : C.g5, align: "center", valign: "middle", margin: 0 });
    if (c.circle) { const tw = Math.min(w - 0.06, Math.max(0.55, (_ems(_cellText(c)) * pt) / 72 + 0.25)), th = Math.min(h - 0.04, lh + 0.14);
      const ex = al === "center" ? cx - tw / 2 : al === "right" ? x + w - tw - 0.02 : x + 0.02;
      slide.addShape("ellipse", { x: ex, y: cy - th / 2, w: tw, h: th, fill: { type: "none" }, line: { color: C.accent, width: 1.5 } }); }
    if (c.bar !== undefined) { const tw = (_ems(_cellText(c)) * pt) / 72 + 0.12, room = Math.max(0.2, w - 2 * pad - tw), bw = Math.max(0.02, room * Math.max(0, Math.min(1, c.bar)));
      slide.addShape("rect", { x: x + pad, y: cy - Math.min(0.12, h * 0.25), w: bw, h: Math.min(0.24, h * 0.5), fill: { color: c.hi || hiRow === i ? C.navy : C.g3 }, line: { type: "none" } }); }
  }));
  if (spec.legend && body.some((r) => r.some((c) => c && c.harvey !== undefined))) {
    // spec.legend: [{q, label}] (Harvey quarters and their words), or labels for 0 / 2 / 4 quarters
    const lg = spec.legend.map((e, k) => (typeof e === "object" ? e : { q: [0, 2, 4][k], label: e })), ly = y0 + tH + 0.1;
    lg.forEach((e, k) => { harveyBall(slide, box.x + k * 1.6, ly, 0.2, e.q); txt(slide, e.label, box.x + k * 1.6 + 0.26, ly - 0.04, 1.3, 0.28, { fontSize: Math.max(10, pt - 2), keepSize: true, noScale: true, color: C.g5, margin: 0 }); });
  }
  const over = y0 + tH + legendH - (box.y + box.h);
  if (over > 0.05) console.warn(`table: ${form} table needs ${(tH + y0 - box.y).toFixed(2)} in, its box is ${box.h.toFixed(2)} in high (over by ${over.toFixed(2)} in). Text stays at ${pt} pt: cut rows or columns, split the table, or give it a taller box`);
  return { form, overflow: over > 0.05 ? over : 0, h: tH + (spec.unit ? lh + 0.05 : 0), rowY: rH.map((_, i) => yOf(i)), rowH: rH, colX: colW.map((_, j) => xOf(j)), colW };
}
// dataTable keeps its name for existing builds; it now draws one of the forms above (spec.style "bands" is gone)
function dataTable(slide, spec, box = BODY) { return table(slide, spec, box); }
function iconList(slide, spec, box = BODY) {
  // spec.items:[{label, text, icon?: base64 png}], numbered circles if no icon
  labelledRows(slide, spec, box);
}
function puzzleGrid(slide, spec, box = BODY) {
  // spec.items:[{label}], spec.highlight — rounded tiles with connector knobs (grid that reads as a puzzle)
  const n = spec.items.length, cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), g = 0.12;
  const s = Math.min((box.w * 0.6 - (cols - 1) * g) / cols, (box.h - (rows - 1) * g) / rows), x0 = box.x + (box.w - cols * s - (cols - 1) * g) / 2;
  spec.items.forEach((it, i) => { const r = Math.floor(i / cols), c = i % cols, x = x0 + c * (s + g), y = box.y + r * (s + g), hi = spec.highlight === i;
    const fill = hi ? C.accent : (i % 2 ? C.g4 : C.g5);
    slide.addShape("roundRect", { x, y, w: s, h: s, rectRadius: 0.08, fill: { color: fill }, line: { type: "none" } }); });
  spec.items.forEach((it, i) => { const r = Math.floor(i / cols), c = i % cols, x = x0 + c * (s + g), y = box.y + r * (s + g), hi = spec.highlight === i;
    const fill = hi ? C.accent : (i % 2 ? C.g4 : C.g5);
    if (c < cols - 1 && i + 1 < n) slide.addShape("ellipse", { x: x + s - 0.02, y: y + s / 2 - s * 0.11, w: s * 0.22, h: s * 0.22, fill: { color: fill }, line: { type: "none" } });
    if (r < rows - 1 && i + cols < n) slide.addShape("ellipse", { x: x + s / 2 - s * 0.11, y: y + s - 0.02, w: s * 0.22, h: s * 0.22, fill: { color: fill }, line: { type: "none" } });
    txt(slide, it.label, x + 0.1, y, s - 0.2, s, { max: 14, min: 8, bold: true, color: C.white, align: "center", valign: "middle" }); });
}


// ---- form tags: the first object each signature builder draws is named "form:<builder> …", so scripts/deck_lint.py can
// count how often a deck uses the same form (rule since v2.18: at most twice in a deck, never on neighbouring slides;
// the references use a scoring table once or twice in 16-33 slides, the v0.5 sample had three within four slides).
function tagForms(mod, names) {
  for (const n of names) { const f = mod[n]; if (typeof f !== "function") continue;
    mod[n] = function (...a) { const sl = a.find((x) => x && Array.isArray(x._slideObjects)), n0 = sl ? sl._slideObjects.length : 0;
      const r = f.apply(this, a);
      if (sl) { const o = sl._slideObjects.slice(n0).find((x) => x && x.options && (x._type === "text" || x._type === "shape" || typeof x.options.objectName === "string" || x.options.objectName === undefined));
        if (o && o.options && !String(o.options.objectName || "").startsWith("form:")) o.options.objectName = "form:" + n + " " + (o.options.objectName || ""); }
      return r; }; }
}
module.exports = { icon, ICONS, treeDown, useStyle, chartStyle, crumbLine, tint, contrast, ACCENT_TEXT, gantt, orgChart, targetOnion, phaseMatrix, dataTable, table, tableForm, TABLE_FORMS, iconList, puzzleGrid, HOUSE, kpiRow, harveyBall, scoringTable, sticker, columnHighlight, THEME, C, W, H, BODY, frame, takeaway, trackerBar, txt, fitSize,
  chevronProcess, staircase, textColumns, timeline, labelledRows, cycle, hubSpoke, forcesIn,
  pyramid, funnel, matrix, converge, venn, issueTree, temple, beforeAfter, barRanking, waterfall };
module.exports.tagForms = tagForms;
tagForms(module.exports, ["treeDown", "gantt", "orgChart", "targetOnion", "phaseMatrix", "iconList", "puzzleGrid", "kpiRow", "scoringTable", "waterfall", "hubSpoke", "beforeAfter", "chevronProcess", "labelledRows", "barRanking", "matrix", "cycle", "funnel", "pyramid", "venn", "timeline", "swot"]);
