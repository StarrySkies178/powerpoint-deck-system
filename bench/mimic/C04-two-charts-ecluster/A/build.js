// C04 mimic, build A (same content). build.js draws the frame and the few pieces the stored objects
// cannot give cleanly; build.py (run after, in A/) places the stored objects case19-ecluster-004*.
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
    crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
    source: "Sources: Euromonitor International, Lit  research, E-Cluster Analysis",
  });
  const F = "Arial";
  const t = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || 14, color: o.color || "000000",
    bold: !!o.bold, italic: !!o.italic, underline: o.u ? { style: "sng" } : undefined, align: o.align || "center", valign: o.valign || "middle", margin: 0, isTextBox: true });

  // panel heading rules 1 and 2 (the layout's single rule is removed in build.py)
  slide.addShape("line", { x: 0.646, y: 1.757, w: 5.736, h: 0, line: { color: "10366C", width: 1.5 } });
  slide.addShape("line", { x: 7.299, y: 1.757, w: 5.778, h: 0, line: { color: "10366C", width: 1.5 } });
  // divider between the two exhibits of panel 2
  slide.addShape("line", { x: 9.854, y: 2.2, w: 0, h: 2.77, line: { color: "A6A6A6", width: 0.75 } });

  // CAGR table header and the fashion-jewelry row (the stored text box for these is garbled by tab stops)
  [[4.89, "13-18"], [5.73, "18-23"]].forEach(([cx, yrs]) => {
    t([{ text: "CAGR", options: { underline: { style: "sng" }, breakLine: true } }, { text: yrs }], cx - 0.5, 2.15, 1.0, 0.5, { valign: "top" });
  });
  t("9%", 4.64, 2.73, 0.5, 0.26);
  t("13%", 5.52, 2.73, 0.5, 0.26);

  // x-axis labels of chart 1 (in the stored text box they hang on tab stops that LibreOffice places differently)
  [["2013", 1.13], ["2018", 2.17], ["2023E", 3.21]].forEach(([s, cx]) => t(s, cx - 0.4, 4.5, 0.8, 0.26));

  // footer: note and full-width rule (page number: layout placeholder, restyled in build.py)
  t("Note: *CTF is the abbreviation for Chow Tai Fook", 0.29, 7.07, 6, 0.18, { size: 10, italic: true, color: "595959", align: "left" });
  slide.addShape("line", { x: 0, y: 7.253, w: 13.333, h: 0, line: { color: "202C4F", width: 1 } });

  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
