// C01 variant c: executive-summary grid in the style of Case-2019-Polaris, built by editing the closest OTHER slide.
// Closest slide taken: Case-2019-Polaris slide 5 (store id case19-polaris-005, "Target customers ... KPC").
// Why: it is the deck's only slide that is a grid of rows named by vertical label bars on the left (grey and red bars
// with white rotated text), filled with flat grey cells (bold heading + plain lines), whose content converges through the
// deck's grey double-chevron into one full-width red bar with white bold text. That is this prompt's structure:
// two labelled rows (Analysis Dimensions, Implications) x three columns, converging into one goal bar.
// Slide 11 (two vertical row labels) was the runner-up, but it has no grey cell grid and no converging red bar.
// What slide 5 cannot carry: the three column headers as arrows. They are drawn here (homePlate / chevron in the deck's
// dark grey, like its grey stage chevrons on slide 14, white bold text; red is kept for the implications and the goal).
// build.py places and refills slide 5's stored shapes (row bars and their labels, grey cells, double-chevrons,
// red bar with its shadow and label). Geometry shared by both steps is in geometry.json.
const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));
const G = require(require("path").join(__dirname, "geometry.json"));

const TITLE = "Executive Summary: Pandora's growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy";
const { pres, slide, P } = L.start({ ref: "Case-2019-Polaris", title: TITLE, source: "Source: Polaris Analysis" });
const C = P.C;

// Column headers as arrows (the stored slide has none): first a home plate, then chevrons, one per column.
const heads = ["Market", "Strategy Design", "Implementation"];
const point = 0.24;
heads.forEach((h, i) => {
  const x = G.cols[i].x, w = G.cols[i].w + (i < heads.length - 1 ? G.gap + point * 0.5 : 0);
  slide.addShape(i === 0 ? "homePlate" : "chevron", {
    x, y: G.head.y, w, h: G.head.h, fill: { color: C.g5 }, line: { color: "FFFFFF", width: 1.5 },
    objectName: `stage${i + 1}`,
  });
  P.txt(slide, h, x + (i === 0 ? 0.1 : point + 0.05), G.head.y, w - point * 2 - 0.1, G.head.h,
    { fontSize: 16, keepSize: true, bold: true, color: "FFFFFF", align: "center", valign: "middle", name: `stage${i + 1} label` });
});

L.save(pres, __dirname + "/candidate.pptx");
