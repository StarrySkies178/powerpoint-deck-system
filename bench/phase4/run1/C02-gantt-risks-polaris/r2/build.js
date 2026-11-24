// C02 rebuild (run1 r2): implementation Gantt (left ~60%) + challenges and mitigations (right), in the Polaris 2019 deck style.
// Deck as reference, leave-one-out: style from Style/refs/Case-2019-Polaris.profile.json; furniture (panel headers with a red
// rule, dashed vertical divider, grey header cells, red numbered circles, grey F1F1F1 boxes, grey footer rule and the two
// footer logos) taken from the deck's OTHER slides (11-14, 17). Assumption: the prompt gives no periods for the online and
// omni-channel rows, so they are set to plausible spans (stated in the report).
const path = require("path");
const L = require(path.join(__dirname, "../../../../lib/bench_lib.js"));
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
const fs = require("fs");

const RED = "CC0000", BLACK = "000000", G1 = "5C5C5C", GL = "B4B4B4", GD = "D5D5D5", GP = "F1F1F1", GBAR = "A2A2A2";
const FONT = "Arial";

(async () => {
  const { pres, slide } = L.start({
    ref: "Case-2019-Polaris",
    title: "During strategy implementation, Pandora should take initiative to mitigate challenges",
    source: "Source: Polaris Analysis",
  });
  const T = (text, x, y, w, h, o = {}) => slide.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.pt || 14, color: o.color || BLACK,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "middle", margin: o.margin ?? 0.02, isTextBox: true,
    paraSpaceAfter: o.psa || 0, lineSpacingMultiple: o.lsm, objectName: o.name });
  const line = (x, y, w, h, color, width = 1, dash) => slide.addShape("line", { x, y, w, h, line: { color, width, dashType: dash } });
  const rect = (x, y, w, h, fill, o = {}) => slide.addShape("rect", { x, y, w, h, fill: { color: fill }, line: o.line || { type: "none" }, objectName: o.name });

  // ---------- deck furniture: footer rule and logos (as on every content slide of the deck) ----------
  line(0, 7.22, 12.97, 0, GL, 0.75);
  try {
    const zip = await JSZip.loadAsync(fs.readFileSync(path.join(__dirname, "../../../../../Templates/Case-2019-Polaris.pptx")));
    const img = async (n, mime) => `${mime};base64,` + (await zip.file("ppt/media/" + n).async("base64"));
    slide.addImage({ data: await img("image5.jpg", "image/jpeg"), x: 10.75, y: 7.24, w: 1.07, h: 0.21 });   // Pandora word mark
    slide.addImage({ data: await img("image4.png", "image/png"), x: 11.85, y: 7.12, w: 0.96, h: 0.38 });    // Polaris logo
    line(11.91, 7.26, 0, 0.21, GL, 0.75);
  } catch (e) { console.error("logos skipped:", e.message); }

  // ---------- panel headers (16 pt bold, centred, red rule under each) and dashed divider ----------
  const LX = 0.37, LR = 7.55, RX = 8.05, RR = 12.98, HY = 1.07;
  T("Implementation Timeline", LX, HY, LR - LX, 0.33, { pt: 16, bold: true, align: "center" });
  line(LX, 1.44, LR - LX, 0, RED, 1.25);
  T("Main Challenges and Potential Mitigations", RX, HY, RR - RX, 0.33, { pt: 16, bold: true, align: "center" });
  line(RX, 1.44, RR - RX, 0, RED, 1.25);
  line(7.8, 1.15, 0, 5.8, G1, 1, "sysDot");

  // ---------- left: Gantt 2019-2023 ----------
  const years = ["2019", "2020", "2021", "2022", "2023"];
  const lw = 2.5, gx = LX + lw, cw = (LR - gx) / years.length, hy = 1.58, hh = 0.36;
  rect(LX, hy, lw - 0.06, hh, G1);
  T("Strategy", LX, hy, lw - 0.06, hh, { pt: 14, bold: true, color: "FFFFFF", align: "center" });
  years.forEach((yr, i) => { rect(gx + i * cw + 0.03, hy, cw - 0.06, hh, G1); T(yr, gx + i * cw, hy, cw, hh, { pt: 14, bold: true, color: "FFFFFF", align: "center" }); });

  const P = "p", I = "i";   // prioritised (red) / implementation (grey); spans are [from, to) in year index
  const rows = [
    { g: "a. Offline Strategy" },
    { s: "Store Expansion" },
    { l: "Open new concept stores", bars: [[0, 5, P]] },
    { l: "Open theme stores", bars: [[1, 3, I], [1, 5, P]] },
    { l: "Open digital stores", bars: [[2, 3, P]] },
    { s: "Sales per Store Improvement" },
    { l: "Loyal customer AD", bars: [[1, 5, P]] },
    { l: "Charity series", bars: [[0, 5, P]] },
    { l: "Personalized offerings", bars: [[2, 5, I]] },
    { l: "Design competence", bars: [[2, 5, I]] },
    { g: "b. Online Strategy" },
    { l: "Enter new platforms", bars: [[0, 2, P]] },
    { l: "Optimize operations", bars: [[1, 5, I]] },
    { g: "c. Omni-channel Strategy" },
    { l: "Data synchronization", bars: [[1, 3, P]] },
    { l: "Product mgt. & CRM", bars: [[2, 5, I]] },
  ];
  const top = hy + hh + 0.06, bottom = 6.5, rh = (bottom - top) / rows.length;
  for (let i = 1; i < years.length; i++) line(gx + i * cw, top, 0, bottom - top, GL, 0.75, "dash");
  let y = top;
  rows.forEach((r, k) => {
    if (r.g) {
      if (k) line(LX, y, LR - LX, 0, GL, 0.75);
      T(r.g, LX, y, lw + 2, rh, { pt: 14, bold: true, color: RED });
    } else if (r.s) {
      T(r.s, LX + 0.12, y, lw, rh, { pt: 12, bold: true, italic: true });
    } else {
      T(r.l, LX + 0.24, y, lw - 0.24, rh, { pt: 12 });
      const two = r.bars.length > 1, bh = two ? rh * 0.36 : rh * 0.56;
      r.bars.forEach(([a, b, kind], j) => {
        const by = two ? y + rh * 0.1 + j * (bh + rh * 0.08) : y + (rh - bh) / 2;
        rect(gx + a * cw + 0.05, by, (b - a) * cw - 0.1, bh, kind === P ? RED : GBAR);
      });
    }
    y += rh;
  });
  line(LX, bottom, LR - LX, 0, GL, 0.75);
  // legend
  const ly = 6.6;
  rect(gx - 0.9, ly + 0.07, 0.36, 0.16, RED);
  T("Period for prioritized strategy", gx - 0.48, ly, 2.6, 0.3, { pt: 12 });
  rect(gx + 2.25, ly + 0.07, 0.36, 0.16, GBAR);
  T("Period for implementation", gx + 2.67, ly, 2.2, 0.3, { pt: 12 });

  // ---------- right: three challenges with their mitigations ----------
  const blocks = [
    { ch: ["Consistent service in different regions", "Widely attractive local features", "Consistent brand image on online platforms"],
      mi: "Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers", cl: 3, ml: 3 },
    { ch: ["Competition from emerging players in entry luxury jewelry market"],
      mi: "Keep sustainability of a differentiate in product and positioning", cl: 2, ml: 2 },
    { ch: ["Data availability from various platforms", "High technical requirements for data synchronization and analytics"],
      mi: "Negotiate with platforms and outsource market analytics", cl: 3, ml: 2 },
  ];
  const lh = 0.228, pad = 0.05, gap = 0.18, chv = 0.26, tx = RX + 0.5, tw = RR - tx;
  const need = blocks.map((b) => b.cl * lh + pad * 2 + chv + b.ml * lh + pad * 2);
  const avail = 6.95 - 1.58 - gap * (blocks.length - 1), extra = Math.max(0, (avail - need.reduce((a, b) => a + b, 0)) / blocks.length);
  y = 1.58;
  blocks.forEach((b, i) => {
    const chH = b.cl * lh + pad * 2, miH = b.ml * lh + pad * 2 + extra;
    slide.addShape("ellipse", { x: RX, y: y + 0.02, w: 0.34, h: 0.34, fill: { color: RED }, line: { type: "none" } });
    T(String(i + 1), RX, y + 0.02, 0.34, 0.34, { pt: 14, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    slide.addText(b.ch.map((c) => ({ text: c, options: { bullet: { indent: 14 }, breakLine: true } })),
      { x: tx, y, w: tw, h: chH, fontFace: FONT, fontSize: 14, color: BLACK, valign: "top", margin: [2, 4, 2, 2], isTextBox: true });
    // grey double chevron pointing down to the mitigation (the deck's step marker, slides 12-13)
    const cx = tx + tw / 2;
    [0, 0.09].forEach((d) => slide.addShape("chevron", { x: cx - 0.07, y: y + chH + 0.03 + d - 0.12, w: 0.14, h: 0.4, rotate: 90, fill: { color: "7E7E7E" }, line: { type: "none" } }));
    const my = y + chH + chv;
    rect(tx, my, tw, miH, GP);
    slide.addText([{ text: "Mitigation: ", options: { bold: true, color: RED } }, { text: b.mi, options: { color: BLACK } }],
      { x: tx + 0.08, y: my, w: tw - 0.16, h: miH, fontFace: FONT, fontSize: 14, valign: "middle", margin: 2, isTextBox: true });
    y = my + miH + gap;
    if (i < blocks.length - 1) line(RX, y - gap / 2, RR - RX, 0, G1, 0.75, "sysDot");
  });

  await L.save(pres, __dirname + "/candidate.pptx");
})();
