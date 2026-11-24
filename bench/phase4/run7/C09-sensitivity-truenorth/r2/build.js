// C09 rebuild (run7 r2): sensitivity analysis, two drawn stacked-column charts (Normal above, Optimistic below).
// Style: TrueNorth deck profile. Form taken from the deck's own scenario backup slide (23, "Pessimistic scenario",
// small-multiples): heading in bold over a drawn stacked column chart, grey pola at the foot, red Jurlique on top,
// totals over the columns, dashed lines joining the column tops and the pola tops, value axis on the left with the
// unit on its top tick, legend at the top left, a "CAGR 2015-2021" column on the right level with each series.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const title = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
  const { pres, slide, P, prof } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title });
  const C = P.C, R = prof.roles;
  const RED = R.main, GREY = R.grey3, TEXT = R.text;
  const LBL = prof.body.pt;                  // 14 pt: the deck draws its chart labels at body size
  const FONT = prof.fonts.body;
  const periods = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];

  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || LBL, color: o.color || TEXT,
    bold: !!o.bold, underline: o.underline ? { style: "sng" } : undefined, align: o.align || "left", valign: o.valign || "middle", margin: 0, isTextBox: true });
  const line = (x1, y1, x2, y2, o = {}) => slide.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipV: (y2 < y1) !== (x2 < x1), line: { color: o.color || TEXT, width: o.width || 0.75, dashType: o.dash } });

  function scenario(spec, top) {
    // block: heading, then plot (axis top .. base), then category labels
    t(spec.name, 0.4, top, 5, 0.34, { size: prof.body.pt + 2, bold: true });
    const axX = 1.08, x0 = 1.18, slot = 0.755, colW = 0.5;
    const yTop = top + 0.62, yBase = top + 2.5, max = spec.max, k = (yBase - yTop) / max;
    const yv = (v) => yBase - v * k;
    // value axis with ticks every 0.5, unit on the top tick
    line(axX, yTop, axX, yBase, { color: "777777" });
    line(axX, yBase, x0 + periods.length * slot, yBase, { color: "777777" });
    for (let v = 0; v <= max + 1e-9; v += 0.5) {
      const y = yv(v);
      line(axX - 0.05, y, axX, y, { color: "777777" });
      t(v >= max - 1e-9 ? `¥${v.toFixed(1)}M` : v.toFixed(1), 0.25, y - 0.12, axX - 0.32, 0.24, { align: "right" });
    }
    // legend, top left inside the plot
    [["pola", GREY], ["Jurlique", RED]].forEach(([n, c], i) => {
      const lx = 1.7 + i * 0.85;
      slide.addShape("rect", { x: lx, y: yTop - 0.06, w: 0.12, h: 0.12, fill: { color: c }, line: { type: "none" } });
      t(n, lx + 0.16, yTop - 0.13, 0.7, 0.26);
    });
    const jur = spec.total.map((v, i) => Math.round((v - spec.pola[i]) * 100) / 100);
    const cx = (i) => x0 + i * slot + (slot - colW) / 2;
    periods.forEach((p, i) => {
      const xp = cx(i), yp = yv(spec.pola[i]), yt = yv(spec.total[i]);
      slide.addShape("rect", { x: xp, y: yp, w: colW, h: yBase - yp, fill: { color: GREY }, line: { color: "FFFFFF", width: 0.75 } });
      slide.addShape("rect", { x: xp, y: yt, w: colW, h: yp - yt, fill: { color: RED }, line: { color: "FFFFFF", width: 0.75 } });
      t(spec.total[i].toFixed(1), xp - 0.15, yt - 0.27, colW + 0.3, 0.24, { align: "center" });
      t(p, x0 + i * slot - 0.05, yBase + 0.03, slot + 0.1, 0.24, { align: "center" });
      if (i) {   // dashed joins: previous column's top-right corner to this column's top-left corner
        const xa = cx(i - 1) + colW;
        line(xa, yv(spec.total[i - 1]), xp, yt, { dash: "dash" });
        line(xa, yv(spec.pola[i - 1]), xp, yp, { dash: "dash" });
      }
    });
    // CAGR 2015-2021 column, each value level with its series in the last column
    const n = periods.length - 1, cX = 8.3, cW = 1.3;
    t("CAGR", cX, top + 0.3, cW, 0.24, { align: "center", underline: true });
    t("2015-2021", cX, top + 0.52, cW, 0.24, { align: "center" });
    const yJ = (yv(spec.total[n]) + yv(spec.pola[n])) / 2, yP = (yv(spec.pola[n]) + yBase) / 2;
    t(spec.cagr.jurlique, cX, yJ - 0.12, cW, 0.24, { align: "center" });
    t(spec.cagr.pola, cX, yP - 0.12, cW, 0.24, { align: "center" });
    return jur;
  }

  scenario({ name: "Normal Scenario", max: 2.0,
    total: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7],
    pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58],
    cagr: { jurlique: "15%", pola: "25%" } }, 1.45);
  scenario({ name: "Optimistic Scenario", max: 2.5,
    total: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1],
    pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78],
    cagr: { jurlique: "19%", pola: "27%" } }, 4.3);

  // the deck's grey footer band (every slide of the deck carries it; colour from the profile's neutrals)
  slide.addShape("rect", { x: 0, y: 7.2, w: prof.size[0], h: 0.3, fill: { color: prof.neutrals_ranked[0] }, line: { type: "none" } });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
