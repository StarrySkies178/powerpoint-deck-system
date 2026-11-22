// Sample deck — illustrative brief: "Should we enter SE Asia?" for a board audience.
// Rhythm: no archetype twice in a row; dividers every 4–6 slides; mix of dark/light, data/concept.
const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const H = G.HOUSE; const { C } = G;
const pres = H.newDeck(pptxgen, "Sample deck — SE Asia entry (illustrative)");
const L = H.LAYOUT, B = G.BODY, SRC = "Source: illustrative data for layout review";
const tr = (k) => ({ n: 4, current: k });
const S = (title, subtitle, o = {}) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source: o.source === undefined ? SRC : o.source, tracker: o.tracker }); return s; };
const div = (n, t) => { const s = pres.addSlide({ masterName: L.divider }); s.addText(n, { placeholder: "number" }); s.addText(t, { placeholder: "title" }); };

// 1 Title
{ const s = pres.addSlide({ masterName: L.title });
  s.addText("Entering SE Asia through a JV can double growth by 2030", { placeholder: "title" });
  s.addText("Board discussion · market entry options", { placeholder: "subtitle" });
  s.addText("November 2026 · Draft for discussion", { placeholder: "date" }); }
// 2 Exec summary — labelled rows
{ const s = S("Executive summary: enter SE Asia via a JV, starting with Vietnam", null, { source: null });
  G.labelledRows(s, { highlight: 4, items: [
    { label: "Home market", text: "Margins fell 3 points in two years, mostly from price; growth headroom is limited" },
    { label: "Opportunity", text: "SE Asia snacks grow 9% a year; premium chilled grows 14%" },
    { label: "Where", text: "Vietnam and Indonesia score highest on attractiveness and our ability to win" },
    { label: "How", text: "A JV with a local distributor gives reach to 40k outlets from day one" },
    { label: "Decision", text: "Approve US$ 25 m and start partner talks in Q1 2027" }] }); }
// 3 Agenda
{ const s = pres.addSlide({ masterName: L.agenda }); s.addText("Agenda", { placeholder: "title" });
  s.addText([{ text: "1  Why we need to grow outside the home market", options: { breakLine: true } }, { text: "2  Where to play in SE Asia", options: { breakLine: true } }, { text: "3  How to enter", options: { breakLine: true } }, { text: "4  Plan and decision", options: {} }], { placeholder: "body" }); }
// 4 Divider 1
div("01", "Why we need to grow outside the home market");
// 5 KPI row
{ const s = S("Home-market profit is under pressure on every key measure", "Home market, FY25 vs FY23", { tracker: tr(0) });
  G.kpiRow(s, { highlight: 0, items: [{ value: "−3 pts", label: "EBIT margin", note: "from 14% to 11%" }, { value: "+1.2%", label: "Volume growth p.a.", note: "below inflation" }, { value: "34%", label: "Online share", note: "doubled since 2022" }, { value: "4th", label: "Cost per unit rank", note: "of 8 peers" }] }, { ...B, y: B.y + 0.6, h: 2.7 });
  G.takeaway(s, "Cost cuts alone cannot close the gap: we need a new growth engine"); }
// 6 Waterfall
{ const s = S("Price, not volume, explains most of the margin decline", "EBIT bridge FY23 → FY25, US$ m", { tracker: tr(0) });
  const cw = B.w * 0.62;
  G.waterfall(pres, s, { steps: [{ label: "FY23", value: 168, total: true }, { label: "Price / mix", value: -29 }, { label: "Volume", value: -3 }, { label: "Input costs", value: -16 }, { label: "Savings", value: 12 }, { label: "FY25", value: 132, total: true }] }, { x: B.x, y: B.y, w: cw, h: B.h });
  s.addShape("rect", { x: B.x + cw + 0.3, y: B.y, w: B.w - cw - 0.3, h: B.h, fill: { color: C.g1 }, line: { type: "none" } });
  G.txt(s, [{ text: "So what", options: { bold: true, color: C.navy, breakLine: true } }, { text: "Promotions got deeper and longer: price / mix cost US$ 29 m.", options: { breakLine: true } }, { text: "Savings offset less than half of input-cost inflation.", options: {} }], B.x + cw + 0.5, B.y + 0.2, B.w - cw - 0.7, 2.6, { fontSize: 14, paraSpaceAfter: 8 }); }
// 7 Forces
{ const s = S("Four structural pressures will keep squeezing home margins", "Forces acting on home-market profitability", { tracker: tr(0), source: null });
  G.forcesIn(s, { centre: "Home-market margin", highlight: 0, items: [
    { label: "Discounters", text: "shelf prices 8% below ours" }, { label: "Input costs", text: "packaging +12% in two years" },
    { label: "Online shift", text: "lower margins in e-grocery" }, { label: "Regulation", text: "new labelling rules 2027" }] }); }
// 8 Divider 2
div("02", "Where to play in SE Asia");
// 9 Column chart
{ const s = S("SE Asia snacks will grow 9% a year to US$ 38 bn by 2030", "SE Asia packaged snacks market, US$ bn", { tracker: tr(1) });
  G.columnHighlight(pres, s, { highlightLabel: "2030F", format: "#,##0;;;", data: [["2022", 20], ["2024", 24], ["2026", 28], ["2028F", 33], ["2030F", 38]].map(([l, v]) => ({ label: l, value: v })) }, { ...B, w: B.w * 0.66 });
  G.txt(s, [{ text: "+9% a year", options: { bold: true, color: C.navy, fontSize: 28, breakLine: true } }, { text: "Premium chilled grows fastest at 14% a year, where our range is strongest.", options: {} }], B.x + B.w * 0.7, B.y + 0.6, B.w * 0.3, 2.2, { fontSize: 14 }); }
// 10 Matrix
{ const s = S("Vietnam and Indonesia are the most attractive markets we can win in", "Market attractiveness vs ability to win", { tracker: tr(1) });
  G.matrix(s, { rows: ["High", "Medium", "Low"], cols: ["Low", "Medium", "High"], xTitle: "Ability to win", yTitle: "Market attractiveness", highlight: [0, 2],
    cells: [["Philippines", "Thailand", "Vietnam\nIndonesia"], ["", "Malaysia", ""], ["Singapore", "", ""]], side: "Focus on the top-right cell first.\n\nThailand is a second-wave option once the JV model is proven." }); }
// 11 Venn
{ const s = S("Premium chilled snacks is where our strengths meet local demand", "Where to play inside Vietnam", { tracker: tr(1), source: null });
  G.venn(s, { items: [{ label: "Our strengths" }, { label: "Unmet demand" }, { label: "Partner reach" }], intersection: { label: "Premium chilled snacks", text: "We lead on product quality, demand grows 14% a year, and the partner already serves 40k outlets." } }); }
// 12 Divider 3
div("03", "How to enter");
// 13 Scoring table
{ const s = S("A joint venture beats building alone or acquiring on four of five criteria", "Entry options scored against board criteria", { tracker: tr(2) });
  G.scoringTable(s, { highlight: 1, criteria: ["Speed to market", "Capital needed", "Control", "Risk", "Local know-how"],
    options: [{ label: "Build alone", scores: [1, 3, 4, 2, 1] }, { label: "Joint venture", scores: [4, 3, 3, 3, 4] }, { label: "Acquire", scores: [4, 1, 4, 1, 3] }] });
  G.takeaway(s, "Recommend the joint venture: fast, capital-light and with local know-how"); }
// 14 Hub
{ const s = S("The JV partner must bring five capabilities we lack", "Partner selection criteria", { tracker: tr(2), source: null });
  G.hubSpoke(s, { centre: "Ideal partner", highlight: 0, items: [
    { label: "Reach", text: "≥ 30k outlets incl. modern trade" }, { label: "Cold chain", text: "chilled logistics in 5 cities" },
    { label: "Licences", text: "food import & distribution" }, { label: "Brand fit", text: "no competing premium range" }, { label: "Governance", text: "accepts 51/49 with our control of brand" }] }); }
// 15 Before/after
{ const s = S("The JV model shifts us from exporting to building a local business", "Today vs JV operating model", { tracker: tr(2), source: null });
  G.beforeAfter(s, { fromTitle: "Today: export", toTitle: "Target: JV", rows: [
    { from: "Products shipped from home plants, 6-week lead time", to: "Local co-packing, 1-week lead time", key: true },
    { from: "Sold through one importer", to: "Partner network of 40k outlets" },
    { from: "Home-market range, English packs", to: "Adapted range and local-language packs" },
    { from: "No local team", to: "JV team of 60, our GM and finance lead" }] }); }
// 16 Divider 4
div("04", "Plan and decision");
// 17 Chevron process
{ const s = S("A five-phase programme gets us to first revenue in 14 months", "Entry programme, phases and key activities", { tracker: tr(3), source: null });
  G.chevronProcess(s, { highlight: 1, items: [
    { label: "Select", text: "Confirm Vietnam; deep-dive Indonesia" }, { label: "Partner", text: "Shortlist 3, sign term sheet" },
    { label: "Set up", text: "Form JV, hire GM, adapt range" }, { label: "Pilot", text: "Launch in Hanoi and HCMC" }, { label: "Scale", text: "National roll-out on pilot results" }],
    result: { label: "Month 14", text: "First revenue; break-even by month 30" } }, { ...B, y: B.y + 0.5, h: 2.6 });
  G.takeaway(s, "Partner selection is on the critical path: start talks in Q1 2027"); }
// 18 Timeline
{ const s = S("Six milestones take us from board approval to break-even", "Key milestones 2027–2029", { tracker: tr(3), source: null });
  G.timeline(s, { highlight: 0, items: [{ date: "Q1 2027", text: "Board approval; partner talks start" }, { date: "Q3 2027", text: "JV term sheet signed" }, { date: "Q4 2027", text: "JV formed, GM hired" },
    { date: "Q1 2028", text: "Pilot launch in two cities" }, { date: "Q3 2028", text: "Pilot review vs margin target" }, { date: "Q3 2029", text: "Break-even run-rate" }] }); }
// 19 Key statement dark — the decision
{ const s = pres.addSlide({ masterName: L.statementDark });
  s.addText("Decision today: approve US$ 25 m and start JV partner talks in Q1 2027", { placeholder: "statement" });
  s.addText("Downside is capped: stage-gates after partner selection and after the pilot", { placeholder: "support" }); }
// 20 End
{ const s = pres.addSlide({ masterName: L.end }); s.addText("Next steps", { placeholder: "title" });
  s.addText("Approve budget · nominate steering committee · brief partner shortlist", { placeholder: "contact" }); }
(async () => { await pres.writeFile({ fileName: "sample-deck.pptx" }); await H.finalize("sample-deck.pptx"); console.log("sample written"); })();
