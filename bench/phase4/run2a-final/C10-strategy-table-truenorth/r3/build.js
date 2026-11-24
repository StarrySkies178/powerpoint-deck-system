// C10 rebuild 3: strategy overview table in the style of the TrueNorth Pola deck (deck as reference, leave-one-out).
// Approach: the deck's style profile for the frame (red title band, breadcrumb, grey source bar); the table drawn as the
// deck's own "panels" table form (red header boxes over light-grey cells with white gaps, highlighted row outlined in red,
// as on the deck's entry-mode scoring slide), with grey vertical row-label bands (as on the deck's repositioning slide)
// for the consumer phases. Risks and mitigation span the four phase rows.
const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));

(async () => {
  const { pres, slide, P, HOUSE } = L.start({
    ref: "Case-2016-TrueNorth-Pola-China-growth",
    title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
  });
  const C = P.C, F = P.THEME.bodyFontFace;
  const RED = C.navy, GREY = "F1F1F1", MID = "A2A2A2";
  const PT = 12, HPT = 14, LS = 0.9;   // cells at the deck's label size, headers at its body size
  const none = { type: "none" };
  // breadcrumb in the deck's own colours: other sections light grey, the current one black, red separators
  const cs = L.HOUSE.STYLE.crumb, crumb = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"];
  slide.addText(crumb.flatMap((t, i) => [...(i ? [{ text: " \u25BA ", options: { color: RED } }] : []), { text: t, options: { color: i === 1 ? "000000" : "BFBFBF" } }]),
    { x: cs.x, y: cs.y, w: 8.2, h: 0.3, fontFace: F, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });
  // footer: the deck's grey source bar, drawn first so the source text sits on it
  slide.addShape("rect", { x: 0, y: 7.2, w: 10, h: 0.3, fill: { color: "D9D9D9" }, line: none });
  slide.addText("Source: TrueNorth Analysis", { placeholder: "source" });

  // ---- text-fit helpers (Calibri: ~0.41 em a character, 0.44 em bold)
  const lineH = (pt) => (pt * 1.2 * LS) / 72;
  const nLines = (t, wIn, pt, bold) => { const cap = wIn / ((pt / 72) * (bold ? 0.44 : 0.41)); let n = 1, cur = 0;
    for (const w of String(t).split(" ")) { const L = w.length + (cur ? 1 : 0); if (cur + L > cap && cur > 0) { n++; cur = w.length; } else cur += L; } return n; };
  const need = (items, wIn, o = {}) => items.reduce((a, t) => a + nLines(t, wIn - 0.12 - (o.head && t === o.head ? 0 : 0.15), PT, o.bold || (o.head && t === o.head)), 0) * lineH(PT) + 0.1;

  // ---- grid
  const x0 = 0.25, x1 = 9.84, top = 1.47, bottom = 7.13, gap = 0.05;
  const colW = [2.78, 3.64, 1.72, 1.42];                      // situation | strategy | risks | mitigation
  const k = (x1 - x0 - gap * 3) / colW.reduce((a, b) => a + b, 0);
  const cw = colW.map((w) => w * k), cx = cw.map((_, i) => x0 + cw.slice(0, i).reduce((a, b) => a + b, 0) + gap * i);
  const hdrH = 0.36, rowGap = 0.05, bandW = 0.4, arrowW = 0.16;

  const bullets = (items) => items.map((t, i) => {
    const runs = Array.isArray(t) ? t : [{ text: t }];
    return runs.map((r, j) => ({ text: r.text, options: { ...(r.options || {}), bullet: j === 0 ? { indent: 9 } : undefined, breakLine: j === runs.length - 1 && i < items.length - 1 } }));
  }).flat();
  const box = (x, y, w, h, fill) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: none });
  const text = (runs, x, y, w, h, o = {}) => slide.addText(runs, { x, y, w, h, fontFace: F, fontSize: o.pt || PT, color: o.color || C.text, bold: !!o.bold,
    align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? [0.02, 0.06, 0.02, 0.08], isTextBox: true, paraSpaceAfter: o.psa ?? 0,
    lineSpacingMultiple: o.ls ?? LS, rotate: o.rotate });

  // ---- header boxes (red, white text)
  ["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"].forEach((h, i) => {
    box(cx[i], top, cw[i], hdrH, RED);
    text(h, cx[i], top, cw[i], hdrH, { pt: HPT, color: "FFFFFF", align: "center", margin: 0, ls: 1 });
  });

  // ---- top row: the overall picture, outlined in red and bold
  const yT = top + hdrH + gap;
  const topCells = [
    ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
    ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
    ["Market Risks", "Political Risks"],
    ["R&D Process", "Product Intro", "Re-evaluation"],
  ];
  const topRowH = Math.max(...topCells.map((c, i) => need(c, cw[i], { bold: true })));
  topCells.forEach((items, i) => { box(cx[i], yT, cw[i], topRowH, GREY); text(bullets(items), cx[i], yT, cw[i], topRowH, { bold: true }); });
  slide.addShape("rect", { x: x0 - 0.02, y: yT - 0.015, w: x1 - x0 + 0.04, h: topRowH + 0.03, fill: { type: "none" }, line: { color: RED, width: 1.75 } });

  // ---- four phase rows: consumer phase -> strategy
  const rows = [
    { phase: "Planning phase", sit: ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
      strat: "Brand position", ini: ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"] },
    { phase: "Awareness phase", sit: ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
      strat: "Marketing strategy", ini: ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"] },
    { phase: "Purchase phase", sit: ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
      strat: "Channel optimization", ini: ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"] },
    { phase: "Aftersales phase", sit: ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
      strat: "Loyalty management", ini: ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"] },
  ];
  const yR = yT + topRowH + gap + 0.03, avail = bottom - yR - rowGap * (rows.length - 1);
  const sitW = cw[0] - bandW - 0.03, iniW = cw[1] - arrowW + 0.04;
  const want = rows.map((r) => Math.max(need(r.sit, sitW), need([r.strat, ...r.ini], iniW, { head: r.strat })));
  const spare = avail - want.reduce((a, b) => a + b, 0);
  console.log("top row", topRowH.toFixed(2), "rows want", want.map((v) => v.toFixed(2)).join(" "), "spare", spare.toFixed(2));
  const rh = want.map((w) => w + spare / rows.length);
  let y = yR;
  rows.forEach((r, i) => {
    const h = rh[i];
    box(cx[0], y, bandW, h, MID);                                  // phase: grey vertical label band + bullets
    text(r.phase, cx[0] + bandW / 2 - h / 2, y + h / 2 - bandW / 2, h, bandW, { rotate: 270, bold: true, color: "FFFFFF", align: "center", margin: 0, ls: 0.85 });
    box(cx[0] + bandW + 0.03, y, sitW, h, GREY);
    text(bullets(r.sit), cx[0] + bandW + 0.03, y, sitW, h);
    box(cx[1], y, cw[1], h, GREY);                                 // strategy: red name line + initiatives
    text([{ text: r.strat, options: { bold: true, color: RED, breakLine: true } }, ...bullets(r.ini)], cx[1] + arrowW - 0.04, y, iniW, h);
    slide.addShape("rightArrow", { x: cx[1] - 0.07, y: y + h / 2 - 0.13, w: arrowW + 0.03, h: 0.26, fill: { color: RED }, line: none });
    y += h + rowGap;
  });

  // ---- risks and mitigation, spanning the four rows
  const spanH = bottom - yR;
  box(cx[2], yR, cw[2], spanH, GREY);
  const mk = bullets(["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"]);
  mk[mk.length - 1].options.breakLine = true;
  text([
    { text: "Market Risks", options: { bold: true, color: RED, breakLine: true } }, ...mk,
    { text: " ", options: { breakLine: true } },
    { text: "Political Risks", options: { bold: true, color: RED, breakLine: true } },
    ...bullets(["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"]),
  ], cx[2], yR, cw[2], spanH, { valign: "middle", psa: 2 });
  box(cx[3], yR, cw[3], spanH, GREY);
  text(bullets(["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
    "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"]),
    cx[3] + 0.08, yR, cw[3] - 0.08, spanH, { valign: "middle", psa: 8 });
  slide.addShape("rightArrow", { x: cx[3] - 0.08, y: yR + spanH / 2 - 0.13, w: arrowW + 0.03, h: 0.26, fill: { color: RED }, line: none });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
