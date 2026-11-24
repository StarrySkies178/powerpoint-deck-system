// C04 rebuild (run7 r1): deck as reference (Case-2019-E-Cluster), leave-one-out.
// Layout: T2B1 as the deck draws it on its sibling slide 5 (two exhibits on top, an icon box band under them),
// panel boxes read from that slide's render (other-slides/05.png). Charts are drawn with shapes, values on the marks,
// no axis and no gridlines (profile chart entry); the part of a whole is one 100% column (S.shareColumn).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, S } = L.start({
    ref: "Case-2019-E-Cluster",
    title: "Chow Tai Fook is recommended to enter a new market given the customer changing preference, tightened policies and increasingly fierce competition",
    source: [{ text: "Sources: Euromonitor International, Lit research, E-Cluster Analysis", options: { italic: true } }],
    crumb: { items: ["Market Overview: Market Analysis", "Strategy Design", "Implementation"], current: 0, sep: " → " },
  });
  const C = P.C, txt = P.txt;
  const DARK = "10366C", LIGHT = "C1DBEB", RED = "CC0000", PT = 15, LAB = 14;
  const T = (t, x, y, w, h, o = {}) => { const { italic, ...r } = o;   // txt() has no italic option: italic goes on the runs
    const runs = italic ? (Array.isArray(t) ? t : [{ text: t, options: {} }]).map((u) => ({ text: u.text, options: { ...u.options, italic: true } })) : t;
    txt(slide, runs, x, y, w, h, { fontSize: PT, noScale: true, margin: 0, color: C.text, ...r }); };
  const line = (x1, y1, x2, y2, o) => slide.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), flipV: (y2 < y1) !== (x2 < x1), line: o });
  const rect = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { color: "FFFFFF", width: 0.5 } });

  // ---- panel 1: stacked columns (fine jewelry light at the foot, fashion jewelry dark on top) + CAGR table
  function marketChart(sl, b) {
    T("China fine jewelry annual market size and growth", b.x + 0.38, b.y, b.w - 0.4, 0.28);
    T("CNY Billion", b.x + 0.38, b.y + 0.27, 2.5, 0.28, { italic: true });
    const periods = ["2013", "2018", "2023E"], tot = [532, 722, 998], fash = [0.15, 0.18, 0.24];
    const base = b.y + b.h - 0.36, top = b.y + 0.95, k = (base - top) / 998, cw = 0.62, x0 = b.x + 0.45, step = 1.0;
    periods.forEach((p, i) => {
      const h = tot[i] * k, x = x0 + i * step, hf = h * fash[i];
      rect(x, base - h, cw, h - hf, LIGHT);
      rect(x, base - h, cw, hf, DARK);
      T(String(tot[i]), x - 0.3, base - h - 0.32, cw + 0.6, 0.28, { align: "center" });
      T(p, x - 0.3, base + 0.06, cw + 0.6, 0.28, { align: "center" });
    });
    line(x0 - 0.15, base, x0 + 2 * step + cw + 0.15, base, { color: C.g4, width: 0.75 });
    // CAGR table beside the stack
    const tx = x0 + 2 * step + cw + 0.35, nameW = 1.45, colW = 0.82, hy = b.y + 0.62;
    ["13-18", "18-23"].forEach((hd, j) => {
      const cx = tx + nameW + j * colW;
      T([{ text: "CAGR", options: { underline: { style: "sng" } } }], cx, hy, colW, 0.27, { align: "center" });
      T(hd, cx, hy + 0.27, colW, 0.27, { align: "center" });
    });
    const rows = [["Fashion jewelry", "9%", "13%"], ["Fine jewelry", "4%", "5%"], ["Total", "4%", "7%"]];
    const rh = 0.55, ry0 = hy + 0.7;
    rows.forEach((r, i) => {
      const y = ry0 + i * rh;
      if (i === 2) line(tx, y - 0.04, tx + nameW + 2 * colW, y - 0.04, { color: C.g4, width: 0.75 });
      slide.addShape("rect", { x: tx, y: y + rh / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: i === 0 ? DARK : i === 1 ? LIGHT : "FFFFFF" }, line: i === 2 ? { type: "none" } : { color: "FFFFFF", width: 0.5 } });
      T(r[0], tx + (i === 2 ? 0 : 0.24), y, nameW - 0.24, rh, { valign: "middle" });
      r.slice(1).forEach((v, j) => T(v, tx + nameW + j * colW, y, colW, rh, { align: "center", valign: "middle" }));
    });
    // the key value: fine jewelry 13-18 circled in red
    slide.addShape("ellipse", { x: tx + nameW + 0.1, y: ry0 + rh + 0.06, w: colW - 0.2, h: rh - 0.12, fill: { type: "none" }, line: { color: RED, width: 1.5 } });
  }

  // ---- panel 2: CTF revenue columns with a CAGR callout, and its 2018 revenue split as one 100% column
  function ctfCharts(sl, b) {
    T("CTF's annual revenue", b.x + 0.1, b.y, 2.8, 0.28);
    T("CNY Billion", b.x + 0.1, b.y + 0.27, 2.5, 0.28, { italic: true });
    const base = b.y + b.h - 0.36, top = b.y + 1.25, k = (base - top) / 48, cw = 0.7, xs = [b.x + 0.35, b.x + 1.55];
    [[2013, 47], [2018, 48]].forEach(([p, v], i) => {
      const h = v * k; rect(xs[i], base - h, cw, h, DARK);
      T(String(v), xs[i] - 0.3, base - h - 0.32, cw + 0.6, 0.28, { align: "center" });
      T(String(p), xs[i] - 0.3, base + 0.06, cw + 0.6, 0.28, { align: "center" });
    });
    line(xs[0] - 0.15, base, xs[1] + cw + 0.15, base, { color: C.g4, width: 0.75 });
    // CAGR arrow over the pair, the value in an oval on it
    const ay = top - 0.5;
    line(xs[0], ay, xs[1] + cw, ay, { color: C.text, width: 1.5, endArrowType: "triangle" });
    const ow = 1.2, ox = (xs[0] + xs[1] + cw) / 2 - ow / 2;
    slide.addShape("ellipse", { x: ox, y: ay - 0.2, w: ow, h: 0.4, fill: { color: "FFFFFF" }, line: { color: C.text, width: 1 } });
    T([{ text: "CAGR ", options: {} }, { text: "1%", options: { bold: true } }], ox, ay - 0.2, ow, 0.4, { align: "center", valign: "middle", fontSize: LAB });
    // 2018 revenue by segment
    const rx = b.x + 2.6;
    T("CTF's 2018 revenue by segment", rx, b.y, b.x + b.w - rx, 0.28);
    // shareColumn writes through txt(), which scales sizes by the reference body (15 / 12.5): pass the size before scaling
    S.shareColumn(slide, { parts: [{ label: "Fine jewelry", value: 89 }, { label: "Fashion jewelry", value: 11, hi: true }], colors: [LIGHT, DARK], caption: "2018", colW: 0.7, fontSize: PT / (15 / 12.5) },
      { x: rx + 0.05, y: b.y + 0.7, w: b.x + b.w - rx - 0.1, h: b.h - 0.7 });
  }

  // ---- panel 3: three constraints in a grey box, icon + bold label + italic line (the deck's icon-box band)
  function constraints(sl, b) {
    const gx = b.x + 0.36, g = { x: gx, y: b.y, w: b.x + b.w - gx, h: b.h };
    slide.addShape("rect", { ...g, fill: { color: C.g1 }, line: { type: "none" } });
    const items = [
      { icon: "users", label: "Customer changing preference", text: "New emerging customers value the fashion design more and show different preference" },
      { icon: "gavel", label: "Tightened anti-corruption policies", text: "Policies like eight-point guidelines against bureaucracy and extravagance affect luxury goods consumption" },
      { icon: "trophy", label: "Increasingly fierce competition", text: "Homogenous portfolio and price-war in fine jewelry limit the growth of the segment" },
    ];
    const w = g.w / 3;
    items.forEach((it, i) => {
      const x = g.x + i * w + 0.15;
      if (i) line(g.x + i * w, g.y + 0.15, g.x + i * w, g.y + g.h - 0.15, { color: C.g4, width: 0.75 });
      P.icon(slide, it.icon, x, g.y + 0.12, 0.32, { color: C.g5 });
      T(it.label, x + 0.42, g.y + 0.1, w - 0.6, 0.36, { bold: true, valign: "middle" });
      T(it.text, x + 0.42, g.y + 0.5, w - 0.6, g.h - 0.55, { italic: true });
    });
  }

  S.composeSlide(pres, slide, {
    // top panels start at 1.32 so their headline rules sit at 1.74, on the master's own rule line (profile title.rule)
    regions: [{ x: 0.27, y: 1.32, w: 6.2, h: 3.48 }, { x: 6.85, y: 1.32, w: 6.22, h: 3.48 }, { x: 0.27, y: 4.88, w: 12.8, h: 2.12 }],
    panels: [
      { headline: "Fine jewelry has a lower growth rate", draw: marketChart },
      { headline: "Fine jewelry accounts for the majority of CTF*", draw: ctfCharts },
      { headline: "Major constraints limit the further development of fine jewelry", draw: constraints },
    ],
  });
  slide.addShape("rect", { x: 6.49, y: 1.69, w: 0.34, h: 0.1, fill: { color: "FFFFFF" }, line: { type: "none" } });   // the master rule stays off the gutter between the two headlines
  txt(slide, [{ text: "Note: *CTF is the abbreviation for Chow Tai Fook", options: { italic: true } }], 0.27, 7.04, 9, 0.2, { fontSize: 10, noScale: true, color: "585858", margin: 0 });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
