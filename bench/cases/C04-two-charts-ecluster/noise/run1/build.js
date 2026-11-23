// C04 attempt 1: E-Cluster style, T2B1 (layout taken from E-Cluster slide 5, the closest other T2B1 slide of the deck)
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

const { pres, slide, B, P, S, prof } = L.start({
  ref: "Case-2019-E-Cluster",
  title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
  source: "Sources: Euromonitor International, Lit research, E-Cluster Analysis",
  crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
});
const C = P.C, txt = P.txt;

// regions: two charts on top, the constraint cards as a full-width band below, a note line above the source
// the deck's panels start right under the title band (profile body_top), not under the master's lower rule (removed in build.py)
const noteH = 0.24, gx = 0.4, half = (B.w - gx) / 2, top = prof.margins.body_top, topH = 3.55;
const botY = top + topH + 0.2, botH = B.y + B.h - noteH - 0.05 - botY;
const regions = [
  { x: B.x, y: top, w: half, h: topH },
  { x: B.x + half + gx, y: top, w: half, h: topH },
  { x: B.x, y: botY, w: B.w, h: botH },
];

// panel 1: stacked columns + CAGR table (generator), plus a Total row under the series rows
function marketPanel(slide, box) {
  const spec = {
    periods: ["2013", "2018", "2023E"],
    series: [{ name: "Fine jewelry", values: [53, 72, 99] }, { name: "Fashion jewelry", values: [2, 2, 8] }],
    cagr: { headers: ["13-18", "18-23"], rows: [["4%", "5%"], ["23%", "18%"]] },
    highlight: 1,
  };
  S.stackedCagr(pres, slide, spec, box);
  // same geometry as stackedCagr's table
  const K = box.w < 5 ? 0.55 : 0.8, nH = 2, n = 2;
  const tw = Math.min(box.w * 0.55, Math.max(Math.min(3.4, box.w * 0.4), 1.15 + nH * K)), cw = box.w - tw - 0.15;
  const x0 = box.x + cw + 0.15, rowH = Math.min(0.42, (box.h - 0.7) / n), nameW = tw - nH * K, y = box.y + 0.7 + n * rowH + 0.06;
  slide.addShape("line", { x: x0, y: y - 0.03, w: tw, h: 0, line: { color: C.g4, width: 0.75 } });
  txt(slide, "Total", x0 + 0.22, y, nameW - 0.25, rowH, { max: 11, min: 8, bold: true, valign: "middle" });
  ["4%", "7%"].forEach((v, j) => txt(slide, v, x0 + nameW + j * K, y, K, rowH, { fontSize: 11, bold: true, align: "center", valign: "middle" }));
}

// panel 2: CTF revenue columns with a CAGR callout | 2018 revenue split as one 100% stacked column
function ctfPanel(slide, box) {
  const lw = box.w * 0.5, rx = box.x + lw + 0.3, rw = box.w - lw - 0.3;
  txt(slide, "CTF's annual revenue, CNY Billion", box.x, box.y, lw, 0.3, { fontSize: 11, color: C.g5, margin: 0 });
  const ch = { x: box.x, y: box.y + 0.95, w: lw, h: box.h - 0.95 };
  S.chartIn(pres, slide, { type: "column", labels: ["2013", "2018"], series: [{ name: "Revenue", values: [47, 48] }],
    options: { layout: { x: 0.05, y: 0.08, w: 0.9, h: 0.8 } } }, ch);
  const cx = (k) => ch.x + ch.w * (0.05 + 0.9 * (k + 0.5) / 2), ay = box.y + 0.72;
  slide.addShape("line", { x: cx(0), y: ay, w: cx(1) - cx(0), h: 0, line: { color: C.navy, width: 1.5, endArrowType: "triangle" } });
  const pw = 1.3, px = (cx(0) + cx(1)) / 2 - pw / 2;
  slide.addShape("roundRect", { x: px, y: ay - 0.33, w: pw, h: 0.32, rectRadius: 0.16, fill: { color: C.white }, line: { color: C.navy, width: 1.25 } });
  txt(slide, "CAGR: 1%", px, ay - 0.33, pw, 0.32, { fontSize: 11, keepSize: true, bold: true, color: C.navy, align: "center", valign: "middle", margin: 0 });

  txt(slide, "CTF's 2018 revenue by segment", rx, box.y, rw, 0.3, { fontSize: 11, color: C.g5, margin: 0 });
  S.chartIn(pres, slide, { type: "stacked100", labels: ["2018"], highlight: 0, format: '0"%"',
    series: [{ name: "Fine jewelry", values: [89] }, { name: "Fashion jewelry", values: [11] }],
    options: { legendPos: "r", legendFontSize: 12, layout: { x: 0.02, y: 0.08, w: 0.45, h: 0.8 } } }, { x: rx, y: box.y + 0.95, w: rw, h: box.h - 0.95 });
}

S.composeSlide(pres, slide, {
  regions,
  panels: [
    { headline: "Fine jewelry has a lower growth rate", unit: "China fine jewelry annual market size and growth, CNY Billion", draw: marketPanel },
    { headline: "Fine jewelry accounts for the majority of CTF*", draw: ctfPanel },
    { headline: "Major constraints limit the further development of fine jewelry", points: [
      { icon: "users", label: "Customer changing preference", text: "New emerging customers value the **fashion design** more and show different preference" },
      { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect **luxury goods consumption**" },
      { icon: "chart-arrows-vertical", label: "Increasingly fierce competition", text: "**Homogenous portfolio and price-war** in fine jewelry limit the growth of the segment" },
    ] },
  ],
});

txt(slide, "Note: *CTF is the abbreviation for Chow Tai Fook", B.x, B.y + B.h - noteH, 8, noteH, { fontSize: 10, keepSize: true, color: "585858", valign: "bottom", margin: 0 });

L.save(pres, __dirname + "/candidate.pptx");
