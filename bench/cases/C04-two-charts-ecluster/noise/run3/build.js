// C04 attempt 3: two-chart situation slide in the style of Case-2019-E-Cluster (deck as reference, leave-one-out).
// Layout: T2B1 taken from the closest other slide of the deck (E-Cluster slide 5: two exhibits on top, three icon
// constraint boxes in a grey band below). Panel boxes measured from slide 5's shapes, passed as composeSlide regions.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, S } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
    source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
    crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
  });
  const C = P.C;

  // panel boxes from E-Cluster slide 5 (same layout code), in inches
  const regions = [
    { x: 0.27, y: 1.34, w: 6.25, h: 3.46 },   // headline rule lands on the layout's rule at y 1.74 (in the deck profile)
    { x: 6.86, y: 1.34, w: 6.19, h: 3.46 },
    { x: 0.27, y: 4.92, w: 12.78, h: 2.08 },
  ];

  // panel 1: stacked columns + CAGR table, fashion jewelry highlighted; the Total CAGR row is added under the table
  const p1 = {
    headline: "Fine jewelry has a lower growth rate",
    unit: "China fine jewelry annual market size and growth, CNY Billion",
    draw: (sl, b) => {
      const spec = {
        periods: ["2013", "2018", "2023E"],
        series: [{ name: "Fine jewelry", values: [53, 72, 99] }, { name: "Fashion jewelry", values: [2, 2, 8] }],
        cagr: { headers: ["13-18", "18-23"], rows: [["4%", "5%"], ["23%", "18%"]] },
        highlight: 1,
      };
      S.stackedCagr(pres, sl, spec, b);
      // same geometry as stackedCagr's table, one row more
      const K = b.w < 5 ? 0.55 : 0.8, nH = 2, n = 2;
      const tw = Math.min(b.w * 0.55, Math.max(Math.min(3.4, b.w * 0.4), 1.15 + nH * K)), cw = b.w - tw - 0.15;
      const x0 = b.x + cw + 0.15, rowH = Math.min(0.42, (b.h - 0.7) / n), nameW = tw - nH * K, y = b.y + 0.7 + n * rowH + 0.04;
      sl.addShape("line", { x: x0, y, w: tw, h: 0, line: { color: C.g4, width: 0.75 } });
      P.txt(sl, "Total", x0 + 0.22, y, nameW - 0.25, rowH, { max: 11, min: 8, bold: true, color: C.text, valign: "middle" });
      ["4%", "7%"].forEach((v, j) => P.txt(sl, v, x0 + nameW + j * K, y, K, rowH, { fontSize: 11, bold: true, color: C.text, align: "center", valign: "middle" }));
    },
  };

  // panel 2: two charts side by side: CTF revenue 2013 vs 2018 with a CAGR callout; 2018 revenue split by segment
  const p2 = {
    headline: "Fine jewelry accounts for the majority of CTF*",
    draw: (sl, b) => {
      const lw = b.w * 0.5, rx = b.x + lw + 0.2, rw = b.w - lw - 0.2;
      P.txt(sl, "CTF's annual revenue, CNY Billion", b.x, b.y, lw, 0.5, { fontSize: 10, color: C.g5, margin: 0 });
      P.txt(sl, "CTF's 2018 revenue by segment, %", rx, b.y, rw, 0.5, { fontSize: 10, color: C.g5, margin: 0 });
      const cy = b.y + 0.95, ch = b.h - 0.95;
      S.chartIn(pres, sl, { type: "column", labels: ["2013", "2018"], series: [{ name: "Revenue", values: [47, 48] }],
        options: { dataLabelPosition: "inEnd", dataLabelColor: C.white, barGapWidthPct: 70 } }, { x: b.x + 0.2, y: cy, w: lw - 0.4, h: ch });
      // CAGR callout over the two columns
      const ax = b.x + 0.2 + (lw - 0.4) * 0.28, aw = (lw - 0.4) * 0.44, ay = b.y + 0.72;
      sl.addShape("line", { x: ax, y: ay, w: aw, h: 0, line: { color: C.navy, width: 1.5, endArrowType: "triangle" } });
      sl.addShape("roundRect", { x: ax + aw / 2 - 0.6, y: ay - 0.2, w: 1.2, h: 0.34, rectRadius: 0.17, fill: { color: C.white }, line: { color: C.navy, width: 1.25 } });
      P.txt(sl, "CAGR 1%", ax + aw / 2 - 0.6, ay - 0.2, 1.2, 0.34, { fontSize: 10, bold: true, color: C.navy, align: "center", valign: "middle", margin: 0 });
      S.chartIn(pres, sl, { type: "stacked100", labels: ["2018"], series: [{ name: "Fine jewelry", values: [89] }, { name: "Fashion jewelry", values: [11] }],
        colors: [C.g4, C.navy], format: '0"%"', legendPos: "r", options: { barGapWidthPct: 40 } }, { x: rx, y: cy - 0.4, w: rw, h: ch + 0.4 });
    },
  };

  // panel 3: three constraint boxes with icons in one grey band
  const p3 = {
    headline: "Major constraints limit the further development of fine jewelry",
    points: [
      { icon: "users", label: "Customer changing preference", text: "New emerging customers value the **fashion design** more and show different preference" },
      { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like **eight-point guidelines** against bureaucracy and extravagance affect luxury goods consumption" },
      { icon: "trending-down", label: "Increasingly fierce competition", text: "**Homogenous portfolio** and **price-war** in fine jewelry limit the growth of the segment" },
    ],
  };

  S.composeSlide(pres, slide, { layout: "T2B1", regions, panels: [p1, p2, p3] });

  // note above the source line, where the deck puts it (slide 5)
  P.txt(slide, "Note: *CTF is the abbreviation for Chow Tai Fook", 0.27, 7.03, 6.0, 0.22, { fontSize: 10, keepSize: true, color: "585858", margin: 0 });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
