// C05 rebuild 3: "Implementation Timeline" in the style of Templates/Case-2019-E-Cluster.pptx (deck as reference, leave-one-out).
// Approach: the deck's style profile (title band, crumb, fonts, colours, margins) through the harness; the Gantt grid
// follows the deck's own table form (dark header row, merged italic category column, blue / grey bands per group,
// white cell rules: E-Cluster appendix tables, slides 22-24); the "Potential Risks" block follows the deck's
// "Key Assumptions" form (bold blue heading over a rule, round blue bullets: slide 16). The deck's master furniture
// (logo top right, footer rule) is taken from the reference master, since the profile has no logo.
// P.gantt has no grouped rows (group label beside its sub-rows), so the grid is a native table and the bars are shapes.
const path = require("path"), fs = require("fs");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
const REF = path.join(__dirname, "../../../../../Templates/Case-2019-E-Cluster.pptx");

(async () => {
  const { pres, slide, B, P, HOUSE, prof } = L.start({ ref: "Case-2019-E-Cluster", title: "Implementation Timeline" });
  const C = P.C, font = HOUSE.FONT.latin;
  const NAVY = "253449", BLUE = "DFECF5", GREY = "F1F1F1", HEAD = "10366C", BAR = "354B70", DARK = "202C4F";

  // ---- master furniture of the reference (logo, footer rule) ----
  const ref = await JSZip.loadAsync(fs.readFileSync(REF));
  const b64 = async (n, mime) => "data:" + mime + ";base64," + (await ref.file("ppt/media/" + n).async("base64"));
  const E = 914400;
  slide.addImage({ data: await b64("image3.jpg", "image/jpeg"), x: 10568190 / E, y: 24383 / E, w: 308596 / E, h: 339293 / E });
  slide.addImage({ data: await b64("image2.jpg", "image/jpeg"), x: 10895075 / E, y: 98977 / E, w: 1022603 / E, h: 208005 / E });
  slide.addShape("rect", { x: 0, y: 6630923 / E, w: prof.size[0], h: 0.012, fill: { color: DARK }, line: { type: "none" } });

  // ---- breadcrumb: earlier sections grey, current bold dark; each arrow takes its item's colour ----
  const cs = prof.crumb, items = ["Market Overview", "Strategy Design", "Implementation: Timeline"], cur = 2;
  const runs = [];
  items.forEach((it, i) => { const col = i === cur ? cs.colours[0] : cs.colours[1];
    runs.push({ text: it, options: { color: col, bold: true } });
    if (i < items.length - 1) runs.push({ text: " → ", options: { color: col, bold: true } }); });
  slide.addText(runs, { x: cs.x, y: cs.y, w: 9.5, h: 0.3, fontFace: font, fontSize: cs.pt, margin: 0, valign: "top", isTextBox: true });

  // ---- Gantt table ----
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const rows = [   // [group, item, start, end] (indexes into years); group null = item spans both label columns
    [null, "New Product R&D", 0, 0],
    [null, "Marketing & Reshaping Brand", 0, 2],
    ["Offline: City Penetration Steps", "Set up 3~5 monobrand stores in prioritized and secondary cities", 0, 2],
    ["Offline: City Penetration Steps", "Further expand into the tertiary cities with ~50 more stores", 2, 5],
    ["Omni Channel Building", "Adjust the product offering and enter key e-commerce platforms", 0, 1],
    ["Omni Channel Building", "Further integrate online and offline channels", 2, 5],
  ];
  const x0 = prof.margins.left, x1 = 13.10, tw = x1 - x0;   // right edge just past the profile's title rule (4.6 + 8.49 in), so the header row covers it
  const gw = 2.45, iw = 4.35, yw = (tw - gw - iw) / years.length;
  const y0 = 1.5, hh = 0.44, rh = 0.58, pt = prof.body.label_pt;
  const blockFill = (r) => (r[0] === null ? BLUE : r[0].startsWith("Offline") ? GREY : BLUE);
  const wb = { type: "solid", color: "FFFFFF", pt: 1.5 }, none = { type: "none" };
  const head = [{ text: "", options: { colspan: 2, fill: { color: NAVY } } },
    ...years.map((y) => ({ text: y, options: { fill: { color: NAVY }, color: "FFFFFF", bold: true, align: "center", fontSize: prof.body.pt, border: [none, wb, none, wb] } }))];
  const body = rows.map((r, i) => {
    const f = { color: blockFill(r) }, cells = [];
    const sep = i === 2 || i === 4 ? { type: "solid", color: "7E7E7E", pt: 1 } : wb;   // group boundaries as in the deck's tables
    const bd = [sep, wb, wb, wb];
    if (r[0] === null) cells.push({ text: r[1], options: { colspan: 2, fill: f, bold: true, color: HEAD, border: bd } });
    else {
      if (i === 2 || i === 4) cells.push({ text: r[0], options: { rowspan: 2, fill: f, bold: true, color: HEAD, align: "center", border: bd } });
      cells.push({ text: r[1], options: { fill: f, border: bd } });
    }
    years.forEach(() => cells.push({ text: "", options: { fill: f, border: bd } }));
    return cells;
  });
  slide.addTable([head, ...body], { x: x0, y: y0, w: tw, colW: [gw, iw, ...years.map(() => yw)], rowH: [hh, ...rows.map(() => rh)],
    h: hh + rows.length * rh, fontFace: font, fontSize: pt, color: "000000", valign: "middle", margin: [0.03, 0.08, 0.03, 0.08] });
  // bars: one arrow per item over the years it runs
  rows.forEach((r, i) => {
    const y = y0 + hh + i * rh, bx = x0 + gw + iw + r[2] * yw + 0.1, bw = (r[3] - r[2] + 1) * yw - 0.2;
    slide.addShape("homePlate", { x: bx, y: y + rh * 0.26, w: bw, h: rh * 0.48, fill: { color: r[0] === null ? NAVY : BAR }, line: { type: "none" } });
  });

  // ---- Potential Risks (deck's "Key Assumptions" form) ----
  const ry = y0 + hh + rows.length * rh + 0.16;
  slide.addText("Potential Risks", { x: x0, y: ry, w: 4.0, h: 0.36, fontFace: font, fontSize: 16, bold: true, color: HEAD, margin: [0, 0.04, 0, 0.04], valign: "bottom", isTextBox: true });
  slide.addShape("line", { x: x0, y: ry + 0.4, w: tw, h: 0, line: { color: DARK, width: 1 } });
  const risks = ["Economy downturn", "Suffer from slow ramp up problem when entering the new market",
    "Potential brand image cannibalization, fail to launch new products in the market as expected",
    "Market dynamics: customer behavior change, competitors' response, etc."];
  const colW = (tw - 0.3) / 2, by = ry + 0.48, bh = 7.2 - by;
  [[risks[0], risks[1]], [risks[2], risks[3]]].forEach((col, k) => {
    slide.addText(col.map((t) => ({ text: t, options: { bullet: { code: "25CF", indent: 22 }, breakLine: true, paraSpaceAfter: 6 } })),
      { x: x0 + k * (colW + 0.3), y: by, w: colW, h: bh, fontFace: font, fontSize: prof.body.label_pt, color: "000000", valign: "top", margin: [0.02, 0.04, 0, 0.04], lineSpacingMultiple: 1.1, isTextBox: true });
  });

  const out = __dirname + "/candidate.pptx";
  await L.save(pres, out);

  // ---- post-process: page number 12 (first slide number), blue round bullets as in the deck ----
  const z = await JSZip.loadAsync(fs.readFileSync(out));
  let sx = await z.file("ppt/slides/slide1.xml").async("string");
  sx = sx.replace(/<a:buSzPct val="100000"\/>(<a:buChar char="&#x25CF;"\/>)/g, '<a:buClr><a:srgbClr val="' + HEAD + '"/></a:buClr><a:buSzPct val="100000"/>$1');
  // page 12 as in the prompt (LibreOffice ignores firstSlideNum, so the number is written in), bold dark as the deck's pages render
  sx = sx.replace(/<a:fld id="[^"]*" type="slidenum">[\s\S]*?<\/a:fld>/, '<a:r><a:rPr lang="en-US" b="1"><a:solidFill><a:srgbClr val="' + DARK + '"/></a:solidFill></a:rPr><a:t>12</a:t></a:r>');
  // title: the deck's titles indent the paragraph (marL 318135 EMU, ~0.35 in) and a one-line title sits low in the band
  // (slides 22-24 use a larger top inset); here the box is the band and the text is centred in it
  const band = prof.title.band;
  sx = sx.replace(/<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="[^"]*"><\/p:cNvPr><p:cNvSpPr\/><p:nvPr><p:ph\s+idx="102"\s+type="title"[\s\S]*?<\/p:sp>/, (sp) => sp
    .replace(/<a:off x="\d+" y="\d+"\/><a:ext cx="(\d+)" cy="\d+"\/>/, (m, cx) => `<a:off x="0" y="${Math.round(band.y * E)}"/><a:ext cx="${cx}" cy="${Math.round(band.h * E)}"/>`)
    .replace(/anchor="t"/, 'anchor="ctr"').replace(/<a:pPr algn="l" indent="0" marL="0">/, '<a:pPr algn="l" indent="0" marL="318135">'));
  z.file("ppt/slides/slide1.xml", sx);
  fs.writeFileSync(out, await z.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
})();
