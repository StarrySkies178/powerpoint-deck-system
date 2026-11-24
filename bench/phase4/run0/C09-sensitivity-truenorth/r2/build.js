// C09 rebuild 2: sensitivity analysis, two scenario charts stacked, in the TrueNorth (Pola) deck style.
// Style source: the deck's profile (L.start ref) for frame, fonts and colours. Layout and chart look taken from the
// deck's backup scenario chart on slide 23 (rendered in other-slides/23.png; geometry read from slide 23's shapes):
// heading "<Name> Scenario" 18 pt bold, stacked columns pola (grey, bottom) + Jurlique (red), total above each bar,
// dashed lines joining the bar tops and the pola tops, value axis with "¥xM" on its top tick, legend inside the plot,
// "CAGR 2015-2021" column on the right with each series' rate level with its segment of the last bar.
// The deck draws these charts as shapes (no native chart objects), so they are drawn here as shapes too.
// Deck frame not in the profile master: grey footer band (CCCCCC, all slides) and the team logo top right (slide 23's picture).
const path = require("path"), { execSync } = require("child_process");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const ROOT = path.join(__dirname, "../../../../..");

(async () => {
  const title = "Our sensitivity analysis takes into consider of three market growth scenario: conservative, normal and optimistic";
  const { pres, slide, P } = L.start({ ref: "Case-2016-TrueNorth-Pola-China-growth", title });
  const C = P.C, FONT = P.THEME.bodyFontFace;
  const RED = C.navy, GREY = C.g3, INK = C.text;
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: 14, color: INK, margin: 0, isTextBox: true, valign: "middle", ...o });

  // ---- deck frame: footer band + logo (as on every slide of the deck)
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" } });
  try {
    const jpg = execSync(`unzip -p "${path.join(ROOT, "Templates/Case-2016-TrueNorth-Pola-China-growth.pptx")}" ppt/media/image1.jpg`);
    slide.addImage({ data: "image/jpeg;base64," + jpg.toString("base64"), x: 8.54, y: 0, w: 1.42, h: 0.41 });
  } catch (e) { /* logo is decoration: build goes on without it */ }

  const years = ["2013", "2014", "2015", "2016e", "2017e", "2018e", "2019e", "2020e", "2021e"];
  const scen = [
    { name: "Normal Scenario", total: [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.7], pola: [0.1, 0.12, 0.13, 0.18, 0.25, 0.32, 0.38, 0.5, 0.58], cagr: { jur: "15%", pola: "25%" } },
    { name: "Optimistic Scenario", total: [0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1], pola: [0.1, 0.12, 0.13, 0.22, 0.32, 0.4, 0.5, 0.62, 0.78], cagr: { jur: "19%", pola: "27%" } },
  ];
  const MAX = 2.5, TICK = 0.5;                 // same scale on both scenarios, so they compare by eye
  const axisX = 1.09, bar0 = 1.23, pitch = 0.76, bw = 0.49, axisEnd = 7.98, cagrX = 8.33, cagrW = 0.86;

  const dash = (x1, y1, x2, y2) => slide.addShape("line", { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.abs(y2 - y1) || 0.001, flipV: y2 < y1,
    line: { color: INK, width: 1, dashType: "dash" } });

  scen.forEach((s, k) => {
    const top = 1.47 + k * 2.86;               // panel top
    T(s.name, 0.4, top, 3.2, 0.34, { fontSize: 18, bold: true });
    const yTop = top + 0.62, yBot = top + 2.38, u = (yBot - yTop) / MAX, Y = (v) => yBot - v * u;

    // value axis, ticks and labels
    slide.addShape("line", { x: axisX, y: yTop, w: 0, h: yBot - yTop, line: { color: INK, width: 0.75 } });
    slide.addShape("line", { x: axisX, y: yBot, w: axisEnd - axisX, h: 0, line: { color: INK, width: 0.75 } });
    for (let v = 0; v <= MAX + 1e-9; v += TICK) {
      slide.addShape("line", { x: axisX - 0.05, y: Y(v), w: 0.05, h: 0, line: { color: INK, width: 0.75 } });
      T(v >= MAX - 1e-9 ? `¥${v.toFixed(1)}M` : v.toFixed(1), 0.3, Y(v) - 0.13, axisX - 0.36, 0.26, { align: "right" });
    }
    // legend inside the plot, top left
    const lx = 1.68, ly = Y(MAX);
    slide.addShape("rect", { x: lx, y: ly - 0.05, w: 0.1, h: 0.1, fill: { color: GREY }, line: { type: "none" } });
    T("pola", lx + 0.13, ly - 0.13, 0.5, 0.26);
    slide.addShape("rect", { x: lx + 0.6, y: ly - 0.05, w: 0.1, h: 0.1, fill: { color: RED }, line: { type: "none" } });
    T("Jurlique", lx + 0.73, ly - 0.13, 0.9, 0.26);

    // stacked bars, totals, year labels
    years.forEach((yr, i) => {
      const x = bar0 + i * pitch, t = s.total[i], p = s.pola[i];
      slide.addShape("rect", { x, y: Y(t), w: bw, h: (t - p) * u, fill: { color: RED }, line: { type: "none" } });
      slide.addShape("rect", { x, y: Y(p), w: bw, h: p * u, fill: { color: GREY }, line: { type: "none" } });
      slide.addShape("line", { x, y: Y(p), w: bw, h: 0, line: { color: "FFFFFF", width: 1 } });
      T(t.toFixed(1), x - 0.15, Y(t) - 0.3, bw + 0.3, 0.26, { align: "center" });
      T(yr, x - 0.15, yBot + 0.03, bw + 0.3, 0.26, { align: "center" });
      if (i < years.length - 1) {              // dashed lines joining the tops of neighbouring bars
        dash(x + bw, Y(t), x + pitch, Y(s.total[i + 1]));
        dash(x + bw, Y(p), x + pitch, Y(s.pola[i + 1]));
      }
    });

    // CAGR column: header, then each rate level with its segment of the last bar
    T([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: "2015-2021" }], cagrX, top + 0.22, cagrW, 0.46, { fontSize: 12, align: "center" });
    const n = years.length - 1, tl = s.total[n], pl = s.pola[n];
    T(s.cagr.jur, cagrX, Y((tl + pl) / 2) - 0.13, cagrW, 0.26, { align: "center" });
    T(s.cagr.pola, cagrX, Y(pl / 2) - 0.13, cagrW, 0.26, { align: "center" });
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
