// C05 open-book mimic, build A (same content as the original slide).
// Frame from the harness (Case-2019-E-Cluster profile); Gantt grid redrawn natively (table + bar shapes);
// the "Potential Risks" label box and the bullet box are placed afterwards from the store by build.py.
const L = require("../../../lib/bench_lib.js");

const SPEC = {
  title: "Implementation Timeline",
  crumb: ["Market Overview", "Strategy Design", "Implementation: Timeline"],
  periods: ["2019", "2020", "2021", "2022", "2023", "2024"],
  // the year labels sit ON the grid lines (n labels, n-1 columns), as in the original;
  // bar = [from, to] in grid-line indexes (0 = the 2019 line); no bar = group heading row
  rows: [
    { label: "New Product R&D", bold: true, bar: [0, 1] },
    { label: "Marketing & Reshaping Brand", bold: true, bar: [0, 3] },
    { label: "Offline: City Penetration Steps", bold: true },
    { label: "Set up 3~5 monobrand stores in prioritized and secondary cities", bar: [0, 3] },
    { label: "Further expand into the tertiary cities with ~50 more stores", bar: [2, 5] },
    { label: "Omni Channel Building", bold: true },
    { label: "Adjust the product offering and enter key e-commerce platforms", bar: [0, 2] },
    { label: "Further integrate online and offline channels", bar: [2, 5] },
  ],
};

// geometry measured on original-1920.png (144 px per inch)
const G = { x: 0.84, y: 1.937, labelW: 4.368, colW: 1.336, oneLine: 0.398, twoLine: 0.542, barH: 0.30,
  yearY: 1.50, yearH: 0.38, pt: 16, yearPt: 24, line: "000000", outer: 2.25, inner: 0.75, bar: "BFBFBF", yearCol: "0A1E3C" };

function lines(r) { return r.label.length > (r.bold ? 34 : 40) ? 2 : 1; }   // 16 pt Arial in a 4.37 in column

function drawGantt(slide, spec, g) {
  const P = spec.periods.length - 1, rows = spec.rows;     // columns between the year lines
  const rh = rows.map((r) => (lines(r) === 2 ? g.twoLine : g.oneLine));
  const tw = g.labelW + P * g.colW;
  // year labels above the columns
  spec.periods.forEach((p, j) => slide.addText(p, { x: g.x + g.labelW + (j - 0.5) * g.colW, y: g.yearY, w: g.colW, h: g.yearH, fontFace: "Calibri",
    fontSize: g.yearPt, bold: true, color: g.yearCol, align: "center", valign: "middle", margin: 0, isTextBox: true,
    shadow: { type: "outer", color: "7F7F7F", blur: 2, offset: 1.5, angle: 45, opacity: 0.5 } }));
  // the grid: one native table, thick outer frame, thin inner rules
  const bd = (pt) => ({ type: "solid", pt, color: g.line });
  const body = rows.map((r, i) => {
    const top = i === 0 ? g.outer : g.inner, bot = i === rows.length - 1 ? g.outer : g.inner;
    const cells = [{ text: r.label, options: { bold: !!r.bold, border: [bd(top), bd(g.inner), bd(bot), bd(g.outer)] } }];
    for (let j = 0; j < P; j++) cells.push({ text: "", options: { border: [bd(top), bd(j === P - 1 ? g.outer : g.inner), bd(bot), bd(g.inner)] } });
    return cells;
  });
  slide.addTable(body, { x: g.x, y: g.y, w: tw, colW: [g.labelW, ...Array(P).fill(g.colW)], rowH: rh, fontFace: "Arial", fontSize: g.pt,
    color: "000000", valign: "middle", margin: [0, 0.06, 0, 0.025], fill: { color: "FFFFFF" } });
  // the bars: grey rectangles over the grid, centred in their row
  let y = g.y;
  rows.forEach((r, i) => {
    if (r.bar) {
      const x0 = g.x + g.labelW + r.bar[0] * g.colW + 0.01, x1 = g.x + g.labelW + r.bar[1] * g.colW - (r.bar[1] === P ? 0.025 : 0);
      slide.addShape("rect", { x: x0, y: y + (rh[i] - g.barH) / 2, w: x1 - x0, h: g.barH, fill: { color: g.bar }, line: { type: "none" }, objectName: "bar " + (i + 1) });
    }
    y += rh[i];
  });
  return y;   // bottom of the grid
}

function drawChrome(slide, pres) {
  // band behind the title (the original's colour), the footer rule and the E-Cluster logo, all native shapes;
  // build.py moves the band behind the title and switches the layout's own band and rule off for this slide.
  slide.addShape("rect", { x: 0, y: 0.424, w: 13.333, h: 0.903, fill: { color: "202C4F" }, line: { color: "0A2550", width: 0.75 }, objectName: "title band" });
  slide.addShape("line", { x: 0, y: 7.255, w: 13.333, h: 0, line: { color: "202C4F", width: 1 }, objectName: "footer rule" });
  // logo: a ring of eight blue teeth (gear) + E▪CLUSTER word mark
  const cx = 11.725, cy = 0.225, R = 0.118, s = 0.075;
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    slide.addShape("rect", { x: cx + R * Math.cos(a) - s / 2, y: cy + R * Math.sin(a) - s / 2, w: s, h: s, rotate: (a * 180) / Math.PI + 45,
      fill: { color: k % 2 ? "2B86C6" : "3DB0DE" }, line: { type: "none" }, objectName: "logo tooth " + (k + 1) });
  }
  slide.addShape("donut", { x: cx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, adjustPoint: 0.2, fill: { color: "2F9AD0" }, line: { type: "none" }, objectName: "logo ring" });
  slide.addText([{ text: "E", options: {} }, { text: "▪", options: { color: "F88124", fontSize: 11 } }, { text: "CLUSTER", options: {} }],
    { x: 11.92, y: 0.05, w: 1.38, h: 0.34, fontFace: "Times New Roman", fontSize: 15.5, color: "153462", margin: 0, valign: "middle", isTextBox: true, wrap: false, objectName: "logo word mark" });
}

(async () => {
  const { pres, slide } = L.start({ ref: "Case-2019-E-Cluster", title: SPEC.title,
    crumb: { items: SPEC.crumb, current: SPEC.crumb.length - 1, sep: " → " } });
  drawChrome(slide, pres);
  const bottom = drawGantt(slide, SPEC, G);
  // build.py places the stored risk boxes 0.15 in under the grid (5.84 in on the original)
  require("fs").writeFileSync(__dirname + "/layout.json", JSON.stringify({ gridBottom: bottom }));
  await L.save(pres, __dirname + "/candidate.pptx");
})();
