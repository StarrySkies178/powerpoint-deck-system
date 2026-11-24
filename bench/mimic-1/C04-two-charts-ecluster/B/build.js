// C04 mimic, build B (changed content, same design). build.js draws the frame and the exhibits whose data changed
// (in the original's own form: plain columns, no axis, totals above, break marks); build.py (run after, in B/)
// places the stored objects case19-ecluster-004* refilled with the new text.
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));
const LIGHT = "C1DBEB", DARK = "10366C", MID = "63A4CC";

(async () => {
  const { pres, slide } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Aurora Timepieces is advised to launch a connected watch line given shifting buyer habits, slower corporate gifting and new digital rivals",
    crumb: { items: ["Market Overview: Category Analysis", "Product Strategy", "Roll-out"], current: 0, sep: " → " },
    source: "Sources: Company reports, Industry interviews, Team analysis",
  });
  const F = "Arial";
  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || "000000",
    bold: !!o.bold, italic: !!o.italic, align: o.align || "center", valign: o.valign || "middle", margin: 0, isTextBox: true });
  const line = (x, y, w, h, color = "000000", width = 0.75, flipV = false) => slide.addShape("line", { x, y, w, h, flipV, line: { color, width } });
  const rect = (x, y, w, h, color) => slide.addShape("rect", { x, y, w, h, fill: { color }, line: { type: "none" } });

  line(0.646, 1.757, 5.736, 0, DARK, 1.5);          // panel heading rules 1 and 2
  line(7.299, 1.757, 5.778, 0, DARK, 1.5);
  line(9.854, 2.2, 0, 2.77, "A6A6A6", 0.75);        // divider inside panel 2

  // 1. stacked columns, FOUR periods (the original has three): classic (light, foot) + smart (dark, top), total above
  const AX = 4.44, P1 = { x0: 0.62, x1: 3.74, maxH: 1.95 };
  const periods = ["2012", "2016", "2020", "2024E"], total = [18.4, 21.2, 24.9, 30.6], smart = [1.5, 3.2, 6.0, 10.1];
  const pitch = (P1.x1 - P1.x0) / periods.length, cw = 0.5, k = P1.maxH / Math.max(...total);
  periods.forEach((p, i) => {
    const cx = P1.x0 + pitch * (i + 0.5), h = total[i] * k, hs = smart[i] * k;
    rect(cx - cw / 2, AX - h, cw, h - hs, LIGHT);
    rect(cx - cw / 2, AX - h, cw, hs, DARK);
    t(total[i].toFixed(1), cx - 0.4, AX - h - 0.3, 0.8, 0.26);
    t(p, cx - 0.4, 4.5, 0.8, 0.26);
  });
  line(P1.x0, AX, P1.x1 - P1.x0, 0);
  for (let i = 1; i < periods.length; i++) {          // break marks between the periods, as drawn in the original
    const bx = P1.x0 + pitch * i;
    rect(bx - 0.04, AX - 0.03, 0.08, 0.06, "FFFFFF");
    line(bx - 0.05, AX - 0.08, 0.04, 0.16, "000000", 0.75, true); line(bx + 0.01, AX - 0.08, 0.04, 0.16, "000000", 0.75, true);
  }
  // CAGR table header and the smart-watch row (the other rows are the stored labels, refilled in build.py)
  [[4.89, "12-20"], [5.73, "20-24E"]].forEach(([cx, yrs]) => {
    t([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: yrs }], cx - 0.5, 2.15, 1.0, 0.5, { valign: "top" });
  });
  t("19%", 4.64, 2.73, 0.5, 0.26);
  t("14%", 5.48, 2.73, 0.5, 0.26);

  // 2a. annual revenue, THREE years (the original has two); last year in the main colour
  const P2 = { x0: 7.31, x1: 9.59 }, rev = [212, 219, 226], yrs = ["2014", "2016", "2018"], rk = 1.3 / 226;
  rev.forEach((v, i) => {
    const cx = 7.72 + i * 0.74, h = v * rk;
    rect(cx - 0.25, AX - h, 0.5, h, i === rev.length - 1 ? DARK : LIGHT);
    t(String(v), cx - 0.35, AX - h - 0.3, 0.7, 0.26);
    t(yrs[i], cx - 0.35, 4.5, 0.7, 0.26);
  });
  line(P2.x0, AX, P2.x1 - P2.x0, 0);

  // 2b. 2018 revenue by segment, THREE segments (the original has two): one 100% column, names left, shares right on ticks
  const seg = [["Smart", 13, LIGHT], ["Quartz", 21, MID], ["Classic", 66, DARK]], top = 2.5, H = AX - top;
  let y = AX;
  seg.forEach(([name, v, col], i) => {
    const h = (v / 100) * H; y -= h; rect(11.35, y, 0.72, h, col);
    const mid = y + h / 2;
    line(11.99, mid, 0.11, 0);
    if (i < 2) {                                      // the classic pair is the stored label pair (build.py)
      t(name, 10.3, mid - 0.13, 0.9, 0.26, { align: "right" });
      t(v + "%", 12.11, mid - 0.13, 0.5, 0.26, { align: "left" });
    }
  });
  line(10.63, AX, 2.16, 0);

  // footer: note and full-width rule
  t("Note: *Watch sales only, excluding straps and after-sales service", 0.29, 7.07, 6, 0.18, { size: 10, italic: true, color: "595959", align: "left" });
  line(0, 7.253, 13.333, 0, "202C4F", 1);

  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
