// C10 rebuild 2 (run2a-final): strategy overview table in the TrueNorth Pola deck's style (deck as reference, leave-one-out).
// Built from prompt.md only. Look from the deck's style profile (Case-2016-TrueNorth-Pola-China-growth.profile.json) and the
// deck's other slides: red header cells with white text and a red-outlined highlighted row (the deck's Harvey table, slide 15),
// light grey F1F1F1 cells, bold section labels with bullet lists (slide 15 "Insights", slide 17 workstreams), grey breadcrumb
// with red separators and the current section in black, TrueNorth logo top right and the grey footer band from the deck's layout.
// Table text is 11 pt (labels and the highlighted row 12 pt): the prompt's 4 x 4 content does not fit the body at the profile's 12 pt label size.
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const JSZip = require(require.resolve("jszip", { paths: [path.dirname(require.resolve("pptxgenjs"))] }));

const RED = "CC0000", GREY = "F1F1F1", TXT = "000000", FONT = "Calibri";
const PT = 11, LPT = 12;

(async () => {
  const { pres, slide, P } = L.start({
    ref: "Case-2016-TrueNorth-Pola-China-growth",
    title: "The five-year strategies could effectively fix issues and facilitate strong growth for Pola on an one-to-one basis",
    source: "Source: TrueNorth Analysis",
  });

  // ---- deck furniture: grey footer band (behind the source line), logo, breadcrumb ----
  const n0 = slide._slideObjects.length;
  slide.addShape("rect", { x: 0, y: 7.21, w: 10, h: 0.29, fill: { color: "CCCCCC" }, line: { type: "none" }, objectName: "footer band" });
  slide._slideObjects.unshift(slide._slideObjects.splice(n0, 1)[0]);   // send to back so the source text stays on top
  try {
    const zip = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, "../../../../../Templates/Case-2016-TrueNorth-Pola-China-growth.pptx")));
    const f = zip.file("ppt/media/image1.jpg");   // the deck layout's logo picture
    if (f) slide.addImage({ data: "image/jpeg;base64," + (await f.async("base64")), x: 8.54, y: 0, w: 1.42, h: 0.41, objectName: "logo" });
  } catch (e) { console.warn("logo not added:", e.message); }
  const crumbs = ["Market Analysis", "Five-year Strategies: Strategy Overview", "Financial & Implementation"], runs = [];
  crumbs.forEach((c, i) => {
    if (i) runs.push({ text: " ► ", options: { color: RED } });
    runs.push({ text: c, options: { color: i === 1 ? TXT : "BEBEBE" } });
  });
  slide.addText(runs, { x: 0.35, y: 0.07, w: 7.6, h: 0.27, fontFace: FONT, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "breadcrumb" });

  // ---- grid ----
  const X0 = 0.25, AG = 0.24, G = 0.05;
  const cw = [2.5, 3.5, 1.6, 1.65];
  const cx = [X0, X0 + cw[0] + AG, 0, 0];
  cx[2] = cx[1] + cw[1] + G; cx[3] = cx[2] + cw[2] + G;
  const RIGHT = cx[3] + cw[3];                    // 9.84
  const lh = (PT * 1.22) / 72, pad = 0.12;

  // header row: red cells, white bold text
  const hy = 1.47, hh = 0.36;
  const heads = ["Current situation", "Key strategies & initiatives", "Risks", "Mitigation"];
  heads.forEach((h, j) => {
    const x = j === 0 ? cx[0] : cx[j], w = j === 0 ? cw[0] + AG - G : cw[j];
    slide.addText(h, { x, y: hy, w, h: hh, fill: { color: RED }, line: { type: "none" }, fontFace: FONT, fontSize: 14, bold: true,
      color: "FFFFFF", align: "center", valign: "middle", margin: 0.03, objectName: "header " + h });
  });

  // paragraphs: optional label line, then bullets
  const para = (label, items, o = {}) => {
    const out = [];
    if (label) out.push({ text: label, options: { bold: true, color: o.labelColor || TXT, fontSize: LPT, breakLine: true, paraSpaceBefore: o.gapBefore || 0 } });
    items.forEach((t) => out.push({ text: t, options: { bullet: { indent: 10 }, fontSize: o.pt || PT, bold: !!o.bold, color: TXT, breakLine: true, paraSpaceBefore: o.space || 0 } }));
    return out;
  };
  const cell = (content, x, y, w, h, o = {}) => { const last = content[content.length - 1]; if (last) last.options = { ...last.options, breakLine: false };
    return slide.addText(content, {
    x, y, w, h, fill: o.fill ? { color: o.fill } : undefined, line: { type: "none" }, fontFace: FONT, fontSize: PT, color: TXT,
    valign: o.valign || "middle", align: "left", margin: [0.03, 0.08, 0.03, 0.08], paraSpaceAfter: 0, objectName: o.name,
  }); };

  // top highlighted row: the summary of each column, outlined in red and bold (the deck's highlighted-row form)
  const ty = hy + hh + 0.05, th = 5 * lh + pad + 0.02;
  const top = [
    ["Growing mid & high end skincare market", "Emerging consumer preferences", "POLA Co.'s poor performance in China"],
    ["Improve penetration by product reposition", "Enhance brand recognition, image and memory along whole consumer decision journey"],
    ["Market Risks", "Political Risks"],
    ["R&D Process", "Product Intro", "Re-evaluation"],
  ];
  top.forEach((items, j) => cell(para(null, items, { bold: true, pt: LPT }), cx[j] + (j === 0 ? 0.05 : 0), ty, j === 0 ? cw[0] + AG - G - 0.05 : cw[j], th, { name: "summary " + heads[j] }));
  slide.addShape("rect", { x: X0, y: ty, w: RIGHT - X0, h: th, fill: { type: "none" }, line: { color: RED, width: 1.75 }, objectName: "highlight outline" });

  // four rows: consumer phase -> strategy
  const rows = [
    ["Planning phase", ["Distinctive consumers", "Sophisticated & diversified needs", "Growing need from potential consumers"],
      "Brand position", ["Launch POLA & Jurlique targeting specific groups", "Tag brands with fancy & explicit concepts", "Design different product diversification roadmaps"]],
    ["Awareness phase", ["Desire for emotional empathy", "Dependence on social media", "Idol effect"],
      "Marketing strategy", ["Compose fascinating stories or hot topics", "Conduct social media-focus marketing initiatives", "Invite celebrity as spokespersons"]],
    ["Purchase phase", ["Desire for experience consumption", "Higher expectation for offline store", "More likely to impulsive shopping", "Frequent mobile shopping"],
      "Channel optimization", ["Provide various service like massage", "Build experience shop & digitalize current stores", "Stimulate purchase through multiple channels", "Optimize mobile-end shopping experience"]],
    ["Aftersales phase", ["Low brand loyalty", "Desire for personal & value identification", "Fans culture"],
      "Loyalty management", ["Implement full lifecycle consumer management", "Implement brand culture proposition", "Build fans-circle on social media like WeChat"]],
  ];
  const lines = [5, 4, 5, 5];                       // measured with Carlito at 11 pt for these column widths
  const ry0 = ty + th + 0.07, rBottom = 7.13, rg = 0.05;
  const avail = rBottom - ry0 - rg * (rows.length - 1), need = lines.reduce((a, b) => a + b, 0) * lh;
  const extra = (avail - need) / rows.length;
  let y = ry0;
  rows.forEach(([phase, needs, strat, inits], i) => {
    const h = lines[i] * lh + extra;
    cell(para(phase, needs), cx[0], y, cw[0], h, { fill: GREY, name: "phase " + phase });
    cell(para(strat, inits, { labelColor: RED }), cx[1], y, cw[1], h, { fill: GREY, name: "strategy " + strat });
    // grey arrow: the phase leads to its strategy
    slide.addShape("rightArrow", { x: cx[0] + cw[0] + 0.03, y: y + h / 2 - 0.14, w: AG - 0.06, h: 0.28, fill: { color: "A2A2A2" }, line: { type: "none" }, objectName: "arrow " + i });
    y += h + rg;
  });

  // risks and mitigation: one tall cell each beside the four rows
  const sh = rBottom - ry0;
  cell([...para("Market Risks", ["Competitor responses to anti-hero products", "Four Channel management takes efforts", "R&D process not entirely aligned with consumer trends for products"], { labelColor: RED }),
        ...para("Political Risks", ["Import tax increase for premium cosmetics products", "Floating exchange", "Political outrage in south Asia area"], { labelColor: RED, gapBefore: 8 })],
       cx[2], ry0, cw[2], sh, { fill: GREY, valign: "top", name: "risks" });
  cell(para(null, ["Actively collect consumer feedback to facilitate R&D process", "Roll out products quickly to meet consumer needs",
                   "Prioritize channel management for weak channels", "Re-consider manufacturing strategy in 2 years and consider option of building factory in China"], { space: 9 }),
       cx[3], ry0, cw[3], sh, { fill: GREY, valign: "top", name: "mitigation" });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
