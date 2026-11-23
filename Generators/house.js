// house.js — the 16:9 house master (theme + layouts) and the theme-link step.
// Values come from Style/style-rules.md (approved palette & fonts; proposed sizes/grid, from the
// measured Deloitte card). If style-rules.md changes, change ROLES/GRID/TYPE here to match.
//
// Why theme-link: generators draw with the exact house hex colours; themeLink() then rewrites every
// role colour (and the tints below) as a THEME slot, so Design > Variants > Colors recolours every
// object, chart and layout in the deck.

const fs = require("fs");
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));

// ---- colour roles (style-rules §4) -> theme slots -------------------------------------------
const ROLES = {
  text:      { hex: "313131", slot: "tx1" },      // dk1  all body text & titles
  white:     { hex: "FFFFFF", slot: "bg1" },      // lt1  background
  main:      { hex: "002776", slot: "accent1" },  // navy: primary shapes, series that matters, dark slides
  secondary: { hex: "00A1DE", slot: "accent2" },  // cyan: second series, supporting shapes
  accent:    { hex: "81BC00", slot: "accent3" },  // green: ONLY the key point
  grey2:     { hex: "8C8C8C", slot: "accent4" },  // "others" series, muted shapes
  grey1:     { hex: "575757", slot: "accent5" },  // secondary text, axis labels
  grey3:     { hex: "B4B4B4", slot: "accent6" },  // connectors, borders, inactive
  grey4:     { hex: "DCDCDC", slot: "bg2" },      // lt2  fills, table bands
};
// tints used by generators: marker hex -> theme slot + luminance (so they recolour too)
const TINTS = {
  F0F0F0: { slot: "bg2", lumMod: 50000, lumOff: 50000 },      // light panel fill (grey4 at 50%)
  CCD4E4: { slot: "accent1", lumMod: 20000, lumOff: 80000 },  // light main
  CCECF8: { slot: "accent2", lumMod: 20000, lumOff: 80000 },  // light secondary (highlight band)
  E6F2CC: { slot: "accent3", lumMod: 20000, lumOff: 80000 },  // light accent
  "4D7100": { slot: "accent3", lumMod: 60000, lumOff: 0 },     // text-safe accent (green text on light backgrounds, 5.7:1)
};
const THEME_COLORS = { dk1: "313131", lt1: "FFFFFF", dk2: "002776", lt2: "DCDCDC",
  accent1: "002776", accent2: "00A1DE", accent3: "81BC00", accent4: "8C8C8C", accent5: "575757", accent6: "B4B4B4",
  hlink: "00A1DE", folHlink: "72C7E7" };
const EXTENDED = ["72C7E7", "3C8A2E", "BDD203"]; // charts with 4+ series only (not theme-linked)

// ---- grid & type (style-rules §2, §5; proposed) ----------------------------------------------
const W = 13.333, H = 7.5;
const GRID = { left: 0.4, right: 0.4, titleTop: 0.3, titleH: 0.85, subY: 1.17, bodyTop: 1.65, footY: 7.01, footH: 0.28 };
GRID.contentW = W - GRID.left - GRID.right;                // 12.53
GRID.body = { x: GRID.left, y: GRID.bodyTop, w: GRID.contentW, h: GRID.footY - 0.15 - GRID.bodyTop }; // h 5.21
const TYPE = { title: 24, subtitle: 14, body: 14, label: 11, small: 10, foot: 9, kpi: 66, divider: 36, cover: 36 };
const FONT = { latin: "Arial", ea: "Microsoft YaHei" };
const R = (k) => ROLES[k].hex;

// ---- layouts ----------------------------------------------------------------------------------
// Names are what users see in PowerPoint's Layout menu.
function defineLayouts(pres) {
  const def = (o) => pres.defineSlideMaster({ ...o, objects: [...(o.objects || []), ...(o.placeholders || [])], placeholders: undefined });
  const t = (o) => ({ fontFace: FONT.latin, margin: 0, ...o });
  const titlePh = { placeholder: { options: t({ name: "title", type: "title", x: GRID.left, y: GRID.titleTop, w: GRID.contentW - 1.5, h: GRID.titleH, fontSize: TYPE.title, bold: true, color: R("main"), align: "left", valign: "bottom" }), text: "Action title: the point of the slide in one sentence" } };
  const subPh = { placeholder: { options: t({ name: "subtitle", type: "body", x: GRID.left, y: GRID.subY, w: GRID.contentW - 1.5, h: 0.34, fontSize: TYPE.subtitle, color: R("grey1"), align: "left" }), text: "What the exhibit shows, unit" } };
  const srcPh = { placeholder: { options: t({ name: "source", type: "body", x: GRID.left, y: GRID.footY, w: 9.5, h: GRID.footH, fontSize: TYPE.foot, color: R("grey1"), valign: "bottom" }), text: "Source: …" } };
  const num = { x: W - GRID.right - 0.8, y: GRID.footY, w: 0.8, h: GRID.footH, fontFace: FONT.latin, fontSize: TYPE.foot, color: R("grey1"), align: "right", valign: "bottom", margin: 0 };
  const fullRect = (hex) => ({ rect: { x: 0, y: 0, w: W, h: H, fill: { color: hex }, line: { type: "none" } } });
  const B = GRID.body;

  def({ title: "01 Title", background: { color: R("main") }, objects: [
      { rect: { x: GRID.left, y: 4.55, w: 1.2, h: 0.08, fill: { color: R("accent") }, line: { type: "none" } } }],
    placeholders: [
      { placeholder: { options: t({ name: "title", type: "title", x: GRID.left, y: 2.2, w: 10.5, h: 2.2, fontSize: TYPE.cover, bold: true, color: R("white"), valign: "bottom", align: "left" }), text: "Deck title: the answer in one line" } },
      { placeholder: { options: t({ name: "subtitle", type: "body", x: GRID.left, y: 4.85, w: 10.5, h: 0.8, fontSize: 18, color: R("white") , align: "left"}), text: "Subtitle / audience" } },
      { placeholder: { options: t({ name: "date", type: "body", x: GRID.left, y: 6.6, w: 6, h: 0.4, fontSize: 12, color: R("white") , align: "left"}), text: "Date · Draft for discussion" } }] });

  def({ title: "02 Section divider", background: { color: R("main") }, slideNumber: { ...num, color: R("white") },
    placeholders: [
      { placeholder: { options: t({ name: "number", type: "body", x: GRID.left, y: 2.3, w: 3, h: 1.0, fontSize: 54, bold: true, color: R("accent") , align: "left"}), text: "01" } },
      { placeholder: { options: t({ name: "title", type: "title", x: GRID.left, y: 3.35, w: 11, h: 1.6, fontSize: TYPE.divider, bold: true, color: R("white"), valign: "top", align: "left" }), text: "Section title" } }] });

  def({ title: "03 Agenda", background: { color: R("white") }, slideNumber: num,
    placeholders: [titlePh,
      { placeholder: { options: t({ name: "body", type: "body", x: GRID.left + 0.6, y: B.y + 0.2, w: 8.5, h: B.h - 0.4, fontSize: 18, color: R("text"), paraSpaceAfter: 14 , align: "left"}), text: "Agenda item" } }] });

  def({ title: "04 Title only", background: { color: R("white") }, slideNumber: num, placeholders: [titlePh, subPh, srcPh] });

  def({ title: "05 Title and text", background: { color: R("white") }, slideNumber: num,
    placeholders: [titlePh, subPh, srcPh,
      { placeholder: { options: t({ name: "body", type: "body", x: B.x, y: B.y, w: B.w, h: B.h, fontSize: TYPE.body, color: R("text"), paraSpaceAfter: 6 , align: "left"}), text: "Text" } }] });

  const half = (B.w - 0.4) / 2;
  def({ title: "06 Two content", background: { color: R("white") }, slideNumber: num,
    placeholders: [titlePh, subPh, srcPh,
      { placeholder: { options: t({ name: "left", type: "body", x: B.x, y: B.y, w: half, h: B.h, fontSize: TYPE.body, color: R("text") , align: "left"}), text: "Left" } },
      { placeholder: { options: t({ name: "right", type: "body", x: B.x + half + 0.4, y: B.y, w: half, h: B.h, fontSize: TYPE.body, color: R("text") , align: "left"}), text: "Right" } }] });

  const cw = B.w * 0.62;
  def({ title: "07 Chart and commentary", background: { color: R("white") }, slideNumber: num,
    objects: [{ rect: { x: B.x + cw + 0.3, y: B.y, w: B.w - cw - 0.3, h: B.h, fill: { color: "F0F0F0" }, line: { type: "none" } } }],
    placeholders: [titlePh, subPh, srcPh,
      { placeholder: { options: t({ name: "chart", type: "chart", x: B.x, y: B.y, w: cw, h: B.h, color: R("text") }), text: "" } },
      { placeholder: { options: t({ name: "commentary", type: "body", x: B.x + cw + 0.5, y: B.y + 0.2, w: B.w - cw - 0.7, h: B.h - 0.4, fontSize: TYPE.body, color: R("text"), paraSpaceAfter: 8 , align: "left"}), text: "So what: 2–3 takeaways" } }] });

  def({ title: "08 Key statement", background: { color: R("white") }, slideNumber: num,
    objects: [{ rect: { x: GRID.left, y: 2.2, w: 0.08, h: 2.6, fill: { color: R("accent") }, line: { type: "none" } } }],
    placeholders: [
      { placeholder: { options: t({ name: "statement", type: "title", x: GRID.left + 0.4, y: 2.0, w: 11.2, h: 3.0, fontSize: 32, bold: true, color: R("main"), valign: "middle", align: "left" }), text: "One big statement or number" } },
      { placeholder: { options: t({ name: "support", type: "body", x: GRID.left + 0.4, y: 5.1, w: 11.2, h: 0.9, fontSize: 16, color: R("grey1") , align: "left"}), text: "Supporting line" } }, srcPh] });

  def({ title: "09 Key statement dark", background: { color: R("main") }, slideNumber: { ...num, color: R("white") },
    placeholders: [
      { placeholder: { options: t({ name: "statement", type: "title", x: GRID.left, y: 2.0, w: 11.8, h: 3.0, fontSize: 32, bold: true, color: R("white"), valign: "middle", align: "left" }), text: "One big statement" } },
      { placeholder: { options: t({ name: "support", type: "body", x: GRID.left, y: 5.1, w: 11.8, h: 0.9, fontSize: 16, color: R("white") , align: "left"}), text: "Supporting line" } }] });

  const iw = 5.6;
  def({ title: "10 Image left", background: { color: R("white") }, slideNumber: num,
    placeholders: [
      { placeholder: { options: t({ name: "image", type: "pic", x: 0, y: 0, w: iw, h: H }), text: "" } },
      { placeholder: { options: t({ name: "title", type: "title", x: iw + 0.5, y: GRID.titleTop, w: W - iw - 0.9, h: 1.3, fontSize: TYPE.title, bold: true, color: R("main"), valign: "bottom", align: "left" }), text: "Action title" } },
      { placeholder: { options: t({ name: "body", type: "body", x: iw + 0.5, y: B.y + 0.1, w: W - iw - 0.9, h: B.h - 0.2, fontSize: TYPE.body, color: R("text"), paraSpaceAfter: 8 , align: "left"}), text: "Text" } }] });
  def({ title: "11 Image right", background: { color: R("white") }, slideNumber: num,
    placeholders: [
      { placeholder: { options: t({ name: "image", type: "pic", x: W - iw, y: 0, w: iw, h: H }), text: "" } },
      { placeholder: { options: t({ name: "title", type: "title", x: GRID.left, y: GRID.titleTop, w: W - iw - 0.9, h: 1.3, fontSize: TYPE.title, bold: true, color: R("main"), valign: "bottom", align: "left" }), text: "Action title" } },
      { placeholder: { options: t({ name: "body", type: "body", x: GRID.left, y: B.y + 0.1, w: W - iw - 0.9, h: B.h - 0.2, fontSize: TYPE.body, color: R("text"), paraSpaceAfter: 8 , align: "left"}), text: "Text" } }] });

  def({ title: "12 Appendix divider", background: { color: R("grey4") },
    placeholders: [{ placeholder: { options: t({ name: "title", type: "title", x: GRID.left, y: 3.0, w: 11, h: 1.2, fontSize: TYPE.divider, bold: true, color: R("main"), valign: "middle", align: "left" }), text: "Appendix" } }] });

  def({ title: "13 End", background: { color: R("main") },
    placeholders: [
      { placeholder: { options: t({ name: "title", type: "title", x: GRID.left, y: 2.8, w: 11, h: 1.2, fontSize: TYPE.divider, bold: true, color: R("white"), valign: "middle", align: "left" }), text: "Next steps / Thank you" } },
      { placeholder: { options: t({ name: "contact", type: "body", x: GRID.left, y: 4.2, w: 11, h: 0.8, fontSize: 16, color: R("white") , align: "left"}), text: "Contact" } }] });

  def({ title: "14 Blank", background: { color: R("white") }, slideNumber: num, placeholders: [srcPh] });
}
const LAYOUT = { title: "01 Title", divider: "02 Section divider", agenda: "03 Agenda", titleOnly: "04 Title only",
  text: "05 Title and text", two: "06 Two content", chart: "07 Chart and commentary", statement: "08 Key statement",
  statementDark: "09 Key statement dark", imageLeft: "10 Image left", imageRight: "11 Image right",
  appendix: "12 Appendix divider", end: "13 End", blank: "14 Blank" };

function newDeck(pptxgen, title) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: FONT.latin, bodyFontFace: FONT.latin };
  pres.title = title || "Deck";
  defineLayouts(pres);
  return pres;
}

// ---- theme-link post-process ---------------------------------------------------------------------
const HEX2SLOT = Object.fromEntries(Object.values(ROLES).map((r) => [r.hex, r.slot]));
function linkXml(xml) {
  // <a:srgbClr val="HEX"/>  or  <a:srgbClr val="HEX"><a:alpha .../></a:srgbClr>
  return xml.replace(/<a:srgbClr val="([0-9A-Fa-f]{6})"(\s*\/>|>([\s\S]*?)<\/a:srgbClr>)/g, (m, hex, _end, inner) => {
    const H6 = hex.toUpperCase(), mods = inner || "";
    if (HEX2SLOT[H6]) return mods ? `<a:schemeClr val="${HEX2SLOT[H6]}">${mods}</a:schemeClr>` : `<a:schemeClr val="${HEX2SLOT[H6]}"/>`;
    const tnt = TINTS[H6];
    if (tnt) return `<a:schemeClr val="${tnt.slot}"><a:lumMod val="${tnt.lumMod}"/><a:lumOff val="${tnt.lumOff}"/>${mods}</a:schemeClr>`;
    return m;
  });
}
async function finalize(path, { colors = THEME_COLORS, name = "House style", template = false } = {}) {
  const zip = await JSZip.loadAsync(fs.readFileSync(path), { createFolders: false });
  // 1. theme: colours + Latin/East Asian fonts
  const tp = "ppt/theme/theme1.xml";
  let th = await zip.file(tp).async("string");
  const SL = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];
  th = th.replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, `<a:clrScheme name="${name}">` + SL.map((k) => `<a:${k}><a:srgbClr val="${colors[k]}"/></a:${k}>`).join("") + "</a:clrScheme>");
  th = th.replace(/(<a:(?:majorFont|minorFont)>\s*<a:latin typeface=")[^"]*("[^>]*\/>\s*<a:ea typeface=")[^"]*"/g, `$1${FONT.latin}$2${FONT.ea}"`);
  th = th.replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, `$1${name}"`);
  zip.file(tp, th);
  // 2. link colours everywhere except the theme
  for (const n of Object.keys(zip.files)) {
    if (zip.files[n].dir) { delete zip.files[n]; continue; }
    if (!/^ppt\/(slides|slideLayouts|slideMasters|charts)\/[^/]+\.xml$/.test(n)) continue;
    let x = await zip.file(n).async("string");
    x = linkXml(x).replaceAll('<c:crossesAt val="autoZero"/>', '<c:crosses val="autoZero"/>');
    // East Asian font on every run that sets Arial, so Chinese renders in YaHei
    x = x.replace(/<a:ea typeface="Arial"([^>]*)\/>/g, `<a:ea typeface="${FONT.ea}"$1/>`)
         .replace(/<a:latin typeface="Arial"([^>]*)\/>(?!\s*<a:ea)/g, `<a:latin typeface="Arial"$1/><a:ea typeface="${FONT.ea}"/>`);
    zip.file(n, x);
  }
  // 3. content types: pptxgenjs omits the master when a deck has no slides; template -> .potx
  {
    const ct = "[Content_Types].xml";
    let c = await zip.file(ct).async("string");
    if (!c.includes("/ppt/slideMasters/slideMaster1.xml"))
      c = c.replace("</Types>", '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/></Types>');
    if (template)
      c = c.replace("application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml", "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml");
    zip.file(ct, c);
  }
  fs.writeFileSync(path, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", createFolders: false }));
}

module.exports = { ROLES, TINTS, THEME_COLORS, EXTENDED, GRID, TYPE, FONT, W, H, LAYOUT, defineLayouts, newDeck, finalize, linkXml };
