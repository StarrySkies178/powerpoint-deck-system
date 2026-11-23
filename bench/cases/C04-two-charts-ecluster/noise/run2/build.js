// C04 attempt 2: situation slide in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Layout T2B1 taken from the deck's sibling slide 5 (two numbered exhibits on top, a grey three-column
// icon band as panel 3 underneath), panel boxes measured on slide 5's shapes.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const TITLE = "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition";
const { pres, slide, P, S } = L.start({
  ref: "Case-2019-E-Cluster",
  title: TITLE,
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const C = P.C;

// panel boxes as on E-Cluster slide 5 (chips at x 0.27 / 6.86, top row from y 1.43, bottom band from y 4.91 to the note line)
const regions = [
  { x: 0.27, y: 1.43, w: 6.3, h: 3.38 },
  { x: 6.86, y: 1.43, w: 6.22, h: 3.38 },
  { x: 0.27, y: 4.91, w: 12.81, h: 2.08 },
];

// panel 1: stacked columns + CAGR table, fashion jewelry highlighted; the context series in the deck's light blue
function drawMarket(sl, box) {
  const keep = C.g4; C.g4 = C.g3;
  const spec = {
    periods: ["2013", "2018", "2023E"],
    series: [{ name: "Fine jewelry", values: [53, 72, 99] }, { name: "Fashion jewelry", values: [2, 2, 8] }],
    cagr: { headers: ["13-18", "18-23"], rows: [["4%", "5%"], ["23%", "18%"]] },
    highlight: 1,
  };
  S.stackedCagr(pres, sl, spec, box);
  C.g4 = keep;
  // Total row under the series rows, same grid as stackedCagr's table
  const K = box.w < 5 ? 0.55 : 0.8, nH = 2, tw = Math.min(box.w * 0.55, Math.max(Math.min(3.4, box.w * 0.4), 1.15 + nH * K));
  const cw = box.w - tw - 0.15, x0 = box.x + cw + 0.15, rowH = Math.min(0.42, (box.h - 0.7) / 2), nameW = tw - nH * K, y = box.y + 0.7 + 2 * rowH;
  sl.addShape("line", { x: x0, y: y + 0.02, w: tw, h: 0, line: { color: C.g4, width: 0.75 } });
  P.txt(sl, "Total", x0 + 0.22, y + 0.04, nameW - 0.25, rowH, { fontSize: 11, bold: true, color: C.text, valign: "middle" });
  ["4%", "7%"].forEach((v, j) => P.txt(sl, v, x0 + nameW + j * K, y + 0.04, K, rowH, { fontSize: 11, bold: true, color: C.text, align: "center", valign: "middle" }));
}

// panel 2: CTF revenue (two columns, CAGR callout) beside its 2018 split by segment (100% stacked)
function drawCtf(sl, box) {
  const lw = box.w * 0.52, rx = box.x + lw + 0.25, rw = box.w - lw - 0.25;
  P.txt(sl, "CTF's annual revenue, CNY Billion", box.x, box.y, lw, 0.3, { fontSize: 10, color: C.g5, valign: "middle", margin: 0 });
  P.txt(sl, "CTF's 2018 revenue by segment, %", rx, box.y, rw, 0.3, { fontSize: 10, color: C.g5, valign: "middle", margin: 0 });
  const cy = box.y + 0.75, ch = box.h - 0.75;
  S.chartIn(pres, sl, { type: "column", labels: ["2013", "2018"], series: [{ name: "Revenue", values: [47, 48] }], colors: [C.navy] }, { x: box.x, y: cy, w: lw, h: ch });
  // CAGR callout over the two columns
  const ax = box.x + lw * 0.27, bx = box.x + lw * 0.73, ay = box.y + 0.52;
  sl.addShape("line", { x: ax, y: ay, w: bx - ax, h: 0, line: { color: C.navy, width: 1.5, endArrowType: "triangle" } });
  sl.addShape("roundRect", { x: (ax + bx) / 2 - 0.65, y: ay - 0.17, w: 1.3, h: 0.34, rectRadius: 0.17, fill: { color: C.white }, line: { color: C.navy, width: 1.25 } });
  P.txt(sl, "CAGR 1%", (ax + bx) / 2 - 0.65, ay - 0.17, 1.3, 0.34, { fontSize: 10, bold: true, color: C.navy, align: "center", valign: "middle", margin: 0 });
  // segment split: fine jewelry in light blue (context), fashion jewelry navy (the same series as panel 1)
  const bw = rw * 0.5;
  S.chartIn(pres, sl, { type: "stacked100", labels: ["2018"], series: [{ name: "Fine jewelry", values: [89] }, { name: "Fashion jewelry", values: [11] }],
    colors: [C.g3, C.navy], format: "0\"%\"", options: { showLegend: false } }, { x: rx, y: cy, w: bw, h: ch });
  // series named beside the bar (direct labels instead of a legend), in the order of the stack
  const plotTop = cy + 0.12, plotH = ch - 0.5;
  P.txt(sl, "Fashion jewelry", rx + bw, plotTop, rw - bw, 0.5, { fontSize: 11, bold: true, color: C.navy, valign: "middle" });
  P.txt(sl, "Fine jewelry", rx + bw, plotTop + plotH * 0.5, rw - bw, 0.5, { fontSize: 11, color: C.text, valign: "middle" });
}

S.composeSlide(pres, slide, {
  regions,
  panels: [
    { headline: "Fine jewelry has a lower growth rate", unit: "China fine jewelry annual market size and growth, CNY Billion", draw: drawMarket },
    { headline: "Fine jewelry accounts for the majority of CTF*", draw: drawCtf },
    { headline: "Major constraints limit the further development of fine jewelry", points: [
      { icon: "users", label: "Customer changing preference", text: "New emerging customers value the fashion design more and show different preference" },
      { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption" },
      { icon: "trophy", label: "Increasingly fierce competition", text: "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment" },
    ] },
  ],
});

// the master's headline rule runs across the gutter between panels 1 and 2: cover that stretch
slide.addShape("rect", { x: 6.57, y: 1.66, w: 0.29, h: 0.16, fill: { color: "FFFFFF" }, line: { type: "none" } });

// note line above the source, as on the deck's other slides
P.txt(slide, "Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.03, 6.5, 0.22, { fontSize: 10, keepSize: true, color: "585858", margin: 0, valign: "top" });

L.save(pres, __dirname + "/candidate.pptx");
