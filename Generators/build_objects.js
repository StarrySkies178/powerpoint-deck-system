// Object library: every reusable object on house layouts, theme-linked (recolours with the scheme).
const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const H = G.HOUSE; const { C } = G;
const pres = H.newDeck(pptxgen, "Object library");
const L = H.LAYOUT, B = G.BODY;
const S = (title, subtitle) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source: "Object library · all colours are theme slots" }); return s; };
const half = (k) => ({ x: B.x + k * (B.w / 2 + 0.15), y: B.y, w: B.w / 2 - 0.15, h: B.h });
{ const s = pres.addSlide({ masterName: L.title }); s.addText("Object library", { placeholder: "title" }); s.addText("Reusable objects in the house style. Change Design → Variants → Colors and everything follows.", { placeholder: "subtitle" }); s.addText("v0.1 · 2026-11-22", { placeholder: "date" }); }
{ const s = S("Basic elements", "numbered squares · tracker · sticker · takeaway bar · Harvey balls · KPI card");
  [1, 2, 3, 4].forEach((n, i) => { const f = i === 2 ? C.accent : C.navy; s.addShape("rect", { x: B.x + i * 0.5, y: B.y, w: 0.36, h: 0.36, fill: { color: f }, line: { type: "none" } }); G.txt(s, String(n), B.x + i * 0.5, B.y, 0.36, 0.36, { fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 }); });
  G.txt(s, "Numbered squares (not circles)", B.x, B.y + 0.45, 3, 0.3, { fontSize: 10, color: C.g5 });
  G.trackerBar(s, { n: 5, current: 2 }); G.sticker(s, "Illustrative");
  [0, 1, 2, 3, 4].forEach((q, i) => G.harveyBall(s, B.x + 4 + i * 0.6, B.y, 0.36, q));
  G.txt(s, "Harvey balls 0–4", B.x + 4, B.y + 0.45, 3, 0.3, { fontSize: 10, color: C.g5 });
  G.kpiRow(s, { highlight: 1, items: [{ value: "32%", label: "Online share", note: "up from 17% in 2022" }, { value: "US$ 25 m", label: "Investment", note: "over 3 years" }, { value: "14 mo", label: "To first revenue", note: "pilot in two cities" }] }, { x: B.x, y: B.y + 1.1, w: B.w, h: 2.6 });
  G.takeaway(s, "Takeaway bar: the so-what of the slide in one line"); }
{ const s = S("Text objects", "labelled rows (left) · parallel columns (right)");
  G.labelledRows(s, { highlight: 1, items: [{ label: "Point one", text: "Explanation of the first point" }, { label: "Point two", text: "The key point gets the accent" }, { label: "Point three", text: "Explanation of the third point" }] }, half(0));
  G.textColumns(s, { highlight: 0, items: [{ label: "Column A", text: "Short bullet\nShort bullet" }, { label: "Column B", text: "Short bullet\nShort bullet" }] }, half(1)); }
{ const s = S("Process: chevron flow and timeline", "chevron-process (any n) · timeline (any n)");
  G.chevronProcess(s, { highlight: 1, items: ["Diagnose", "Design", "Pilot", "Scale"].map((l) => ({ label: l, text: "What happens in this step" })) }, { ...B, h: 2.1 });
  G.timeline(s, { highlight: 2, items: ["2024", "2025", "2026", "2027", "2028"].map((d, i) => ({ date: d, text: `Milestone ${i + 1}` })) }, { x: B.x, y: B.y + 2.4, w: B.w, h: 2.7 }); }
{ const s = S("Cycle and hub-and-spoke", "cycle (2–9) · hub-spoke (3–10)");
  G.cycle(s, { highlight: 1, centre: "Cycle", items: ["Plan", "Do", "Check", "Act", "Learn"].map((l) => ({ label: l })) }, half(0));
  G.hubSpoke(s, { highlight: 3, centre: "Core", items: ["One", "Two", "Three", "Four", "Five", "Six"].map((l) => ({ label: l })) }, half(1)); }
{ const s = S("Pyramid and funnel", "layers engine: pyramid (2–9) · funnel (2–7)");
  G.pyramid(s, { highlight: 0, items: [{ label: "Top", text: "Depends on everything below" }, { label: "Middle", text: "Layer text" }, { label: "Base", text: "Foundation" }] }, half(0));
  G.funnel(s, { highlight: 3, items: [{ label: "100", text: "in" }, { label: "40", text: "stage 2" }, { label: "15", text: "stage 3" }, { label: "5", text: "out" }] }, half(1)); }
{ const s = S("2×2 matrix", "matrix (2×2 … 4×4) with the target cell highlighted");
  G.matrix(s, { rows: ["High", "Low"], cols: ["Low", "High"], xTitle: "Ease of implementation", yTitle: "Impact", highlight: [0, 1], cells: [["Big bets", "Quick wins"], ["Avoid", "Fill-ins"]], side: "Side commentary goes here." }); }
{ const s = S("Forces and convergence", "forces-in (2–8) · converge (2–10)");
  G.forcesIn(s, { highlight: 0, centre: "Subject", items: ["Force A", "Force B", "Force C", "Force D"].map((l) => ({ label: l, text: "short description" })) }, half(0));
  G.converge(s, { highlight: 1, items: ["Input 1", "Input 2", "Input 3", "Input 4"].map((l) => ({ label: l })), goal: { label: "Goal", text: "One outcome" } }, half(1)); }
{ const s = S("Venn and from–to", "venn (2–3) · before-after (rows)");
  G.venn(s, { items: [{ label: "Set A" }, { label: "Set B" }, { label: "Set C" }], intersection: { label: "Sweet spot", text: "Where all three meet" } }, half(0));
  G.beforeAfter(s, { fromTitle: "From", toTitle: "To", rows: [{ from: "Today's way", to: "Target way", key: true }, { from: "Today's way", to: "Target way" }] }, half(1)); }
{ const s = S("Issue tree and temple", "issue-tree (2–3 levels) · temple (2–6 pillars)");
  G.issueTree(s, { root: "Question", highlight: 0, children: [{ label: "Branch 1", children: ["Leaf", "Leaf"] }, { label: "Branch 2", children: ["Leaf"] }] }, { ...half(0), w: half(0).w });
  G.temple(s, { roof: "Vision", base: "Foundation", highlight: 1, pillars: [{ label: "Pillar", text: "Text" }, { label: "Pillar", text: "Text" }, { label: "Pillar", text: "Text" }] }, half(1)); }
{ const s = S("Scoring table", "Harvey-ball comparison of options against criteria");
  G.scoringTable(s, { highlight: 1, criteria: ["Cost", "Speed", "Risk", "Control", "Fit"], options: [{ label: "Option A", scores: [2, 1, 3, 4, 2] }, { label: "Option B", scores: [3, 4, 3, 3, 4] }, { label: "Option C", scores: [4, 2, 1, 2, 3] }] }); }
{ const s = S("Charts with one highlight", "bar ranking · column with highlight · waterfall");
  G.barRanking(pres, s, { highlightLabel: "Us", data: [{ label: "A", value: 80 }, { label: "Us", value: 95 }, { label: "B", value: 102 }, { label: "C", value: 110 }] }, { x: B.x, y: B.y, w: 4, h: B.h });
  G.columnHighlight(pres, s, { highlightLabel: "2025", data: [2021, 2022, 2023, 2024, 2025].map((y, i) => ({ label: String(y), value: 60 + i * 9 })) }, { x: B.x + 4.2, y: B.y, w: 4, h: B.h });
  G.waterfall(pres, s, { steps: [{ label: "Start", value: 100, total: true }, { label: "Up", value: 20 }, { label: "Down", value: -12 }, { label: "End", value: 108, total: true }] }, { x: B.x + 8.4, y: B.y, w: B.w - 8.4, h: B.h }); }
(async () => { await pres.writeFile({ fileName: "objects-library.pptx" }); await H.finalize("objects-library.pptx"); console.log("objects written"); })();
