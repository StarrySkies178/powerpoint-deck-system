// C02 rebuild (run5 r2): Gantt of the implementation timeline (left, ~60%) + numbered challenges with mitigations (right),
// in the style of Case-2019-Polaris (deck as reference, leave-one-out). Style profile Case-2019-Polaris.profile.json.
// Forms taken from the deck's other slides: centred bold panel headers over a red rule and a dashed vertical divider
// between the two halves (slides 11-13), dark grey header cells with white text (slide 13 table), grey F1F1F1 blocks and
// grey down-chevrons (slides 12-13), red numbered circles (slide 8), red-outlined box for the answer (slides 10, 17).
// Gantt bars follow the prompt's legend: red = period for prioritized strategy, grey = period for implementation.
// ASSUMPTION: the prompt gives no years for the online and omni-channel rows; the periods used for them are set below
// (marked "assumed") and should be checked by the team.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });
  const C = P.C, F = P.THEME.bodyFontFace;
  const RED = C.navy, DG = C.g5, MG = C.g2, LG = C.g1;   // CC0000, 5C5C5C, A2A2A2, F1F1F1 from the profile
  const BODY = 14, LAB = 13;
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: F, fontSize: o.size || BODY, color: o.color || C.text,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.03, isTextBox: true,
    rotate: o.rotate, paraSpaceAfter: o.psa || 0, objectName: o.name });
  const rect = (x, y, w, h, fill, line) => slide.addShape("rect", { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line || { type: "none" } });
  const hline = (x, y, w, color, width = 0.75, dash) => slide.addShape("line", { x, y, w, h: 0, line: { color, width, dashType: dash } });
  const vline = (x, y, h, color, width = 0.75, dash) => slide.addShape("line", { x, y, w: 0, h, line: { color, width, dashType: dash } });

  // ---- frame of the two halves (slides 11-13: header text, red rule, dashed divider)
  const TOP = 1.13, BOT = 6.98, LX = 0.39, LR = 7.5, RX = 7.9, RR = 12.98;
  T("Implementation Timeline", LX, TOP, LR - LX, 0.36, { bold: true, align: "center" });
  hline(LX, TOP + 0.39, LR - LX, RED, 1.5);
  T("Main Challenges and Potential Mitigations", RX, TOP, RR - RX, 0.36, { bold: true, align: "center" });
  hline(RX, TOP + 0.39, RR - RX, RED, 1.5);
  vline((LR + RX) / 2, TOP + 0.05, BOT - TOP - 0.05, MG, 1, "dash");

  // ---- left: Gantt 2019-2023
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const cA = LX, wA = 1.42, cB = cA + wA + 0.04, wB = 2.42, gx = cB + wB + 0.04, yw = (LR - gx) / years.length;
  const yx = (i) => gx + i * yw;
  const hy = 1.66, hh = 0.36;
  rect(cA, hy, wA + 0.04 + wB, hh, DG);
  T("Strategy", cA, hy, wA + 0.04 + wB, hh, { bold: true, color: C.white, align: "center", size: LAB });
  years.forEach((yr, i) => { rect(yx(i) + 0.02, hy, yw - 0.04, hh, DG); T(yr, yx(i), hy, yw, hh, { bold: true, color: C.white, align: "center", size: LAB }); });

  // bars: [from, to, kind] with years as 0-based indexes, kind "p" prioritized (red) / "i" implementation (grey)
  const rows = [
    { group: "a. Offline Strategy" },
    { sub: "Store Expansion", n: 3 },
    { label: "Open new concept stores", bars: [[0, 4, "p"]] },
    { label: "Open theme stores", bars: [[1, 2, "i"], [1, 4, "p"]] },
    { label: "Open digital stores", bars: [[2, 2, "p"]] },
    { sub: "Sales per Store Improvement", n: 4 },
    { label: "Loyal customer AD", bars: [[1, 4, "p"]] },
    { label: "Charity series", bars: [[0, 4, "p"]] },
    { label: "Personalized offerings", bars: [[2, 4, "i"]] },
    { label: "Design competence", bars: [[2, 4, "i"]] },
    { group: "b. Online Strategy" },
    { label: "Enter new platforms", wide: true, bars: [[0, 1, "p"]] },          // assumed
    { label: "Optimize operations", wide: true, bars: [[1, 4, "i"]] },          // assumed
    { group: "c. Omni-channel Strategy" },
    { label: "Data synchronization", wide: true, bars: [[1, 2, "i"]] },         // assumed
    { label: "Product mgt. & CRM", wide: true, bars: [[2, 4, "i"]] },           // assumed
  ];
  const items = rows.filter((r) => !r.sub).length;
  const legH = 0.34, y0 = hy + hh + 0.08, rh = (BOT - legH - 0.1 - y0) / items;
  for (let i = 1; i < years.length; i++) vline(yx(i), y0, items * rh, MG, 0.75, "dash");
  let y = y0;
  rows.forEach((r) => {
    if (r.group) {
      T(r.group, cA, y, LR - cA, rh, { bold: true, color: RED, size: BODY });
      hline(cA, y + rh, LR - cA, MG, 0.75);
      y += rh; return;
    }
    if (r.sub) {
      rect(cA, y + 0.03, wA, r.n * rh - 0.06, LG);
      T(r.sub, cA + 0.04, y + 0.03, wA - 0.08, r.n * rh - 0.06, { bold: true, align: "center", size: LAB });
      return;                                    // the sub-group block spans the item rows that follow; it takes no row itself
    }
    const lx = r.wide ? cA + 0.12 : cB, lw = r.wide ? wA + 0.04 + wB - 0.12 : wB;
    T(r.label, lx, y, lw, rh, { size: LAB });
    const bh = r.bars.length > 1 ? Math.min(0.12, (rh - 0.1) / 2) : Math.min(0.17, rh * 0.5);
    r.bars.forEach(([a, b, k], j) => {
      const by = r.bars.length > 1 ? y + rh / 2 - bh - 0.015 + j * (bh + 0.03) : y + (rh - bh) / 2;
      rect(yx(a) + 0.05, by, (b - a + 1) * yw - 0.1, bh, k === "p" ? RED : MG);
    });
    hline(cB, y + rh, LR - cB, LG, 0.75);
    y += rh;
  });
  // legend (prompt: red = period for prioritized strategy, grey = period for implementation)
  const ly = BOT - legH;
  rect(LX + 0.1, ly + legH / 2 - 0.07, 0.45, 0.14, RED);
  T("Period for prioritized strategy", LX + 0.62, ly, 3.0, legH, { size: 12 });
  rect(LX + 3.75, ly + legH / 2 - 0.07, 0.45, 0.14, MG);
  T("Period for implementation", LX + 4.27, ly, 3.0, legH, { size: 12 });

  // ---- right: three numbered challenges, each with its mitigation in a red-outlined box under a grey chevron
  const blocks = [
    { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
      mit: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers" },
    { ch: ["Competition from emerging players in entry luxury jewelry market"],
      mit: "Keep sustainability of a differentiate in product and positioning" },
    { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
      mit: "Negotiate with platforms and outsource market analytics" },
  ];
  const cx = RX + 0.46, cw = RR - cx, cpl = Math.floor(((cw - 0.4) * 72) / (BODY * 0.5)), lineH = (BODY * 1.2) / 72;
  const nLines = (s, extra = 0) => Math.max(1, Math.ceil((s.length + extra) / cpl));
  const est = blocks.map((b) => ({ ch: b.ch.reduce((a, s) => a + nLines(s, 1), 0) * lineH + 0.12, mit: nLines(b.mit, 12) * lineH + 0.12 }));
  const arrowH = 0.16, gapIn = 0.05;
  const need = est.reduce((a, e) => a + e.ch + e.mit + arrowH + 2 * gapIn, 0), top = hy, free = BOT - top - need, bgap = 0.15, extra = Math.max(0, free - 2 * bgap) / blocks.length;
  let by = top;
  blocks.forEach((b, i) => {
    const e = est[i], ch = e.ch + extra * 0.6, mit = e.mit + extra * 0.4;
    slide.addShape("ellipse", { x: RX + 0.02, y: by + ch / 2 - 0.17, w: 0.34, h: 0.34, fill: { color: RED }, line: { type: "none" } });
    T(String(i + 1), RX + 0.02, by + ch / 2 - 0.17, 0.34, 0.34, { bold: true, color: C.white, align: "center", size: LAB, margin: 0 });
    rect(cx, by, cw, ch, LG);
    slide.addText(b.ch.map((s, k) => ({ text: s, options: { bullet: { indent: 12 }, breakLine: k < b.ch.length - 1 } })), {
      x: cx + 0.08, y: by, w: cw - 0.16, h: ch, fontFace: F, fontSize: BODY, color: C.text, valign: "middle", margin: 0.03, isTextBox: true });
    by += ch + gapIn;
    slide.addShape("triangle", { x: cx + cw / 2 - 0.3, y: by, w: 0.6, h: arrowH, flipV: true, fill: { color: MG }, line: { type: "none" } });
    by += arrowH + gapIn;
    rect(cx, by, cw, mit, C.white, { color: RED, width: 1.25 });
    slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mit, options: {} }], {
      x: cx + 0.1, y: by, w: cw - 0.2, h: mit, fontFace: F, fontSize: BODY, color: C.text, valign: "middle", margin: 0.03, isTextBox: true });
    by += mit + bgap;
  });

  if (free < 2 * 0.15) console.warn('right column needs', (2 * 0.15 - free).toFixed(2), 'in more');
  await L.save(pres, __dirname + "/candidate.pptx");
})();
