// Sample deck v0.3 — illustrative brief: "Should we enter SE Asia?" for a board audience.
// Built the way the reference decks are built (Style/storytelling.md §8, Style/refs/case-competitions.md §4b):
// answer first with lettered conclusions; every analysis slide carries 2-4 exhibits that together prove its title,
// each with a numbered sentence sub-headline, the conclusion in the last cell; the letters come back in the titles.
// v0.1/v0.2 put one figure on each slide and left half the page empty (deck_lint "empty": median fill 70%, references 93-98%).
const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const P = require("./patterns_story.js"); const H = G.HOUSE; const { C } = G;
const pres = H.newDeck(pptxgen, "Sample deck — SE Asia entry (illustrative)");
const L = H.LAYOUT, B = G.BODY, SRC = "Source: illustrative data for layout review";
const S = (title, subtitle, o = {}) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source: o.source === undefined ? SRC : o.source }); return s; };
const col = (name, labels, values, hi, format) => ({ type: "column", labels, series: [{ name, values }], highlight: hi, format });
const bar = (name, labels, values, hi, format) => ({ type: "bar", labels, series: [{ name, values }], highlight: hi, format });

// 1 Title
{ const s = pres.addSlide({ masterName: L.title });
  s.addText("Entering SE Asia through a JV can double growth by 2030", { placeholder: "title" });
  s.addText("Board discussion · market entry options", { placeholder: "subtitle" });
  s.addText("November 2026 · Draft for discussion", { placeholder: "date" }); }

// 2 Executive summary: lettered conclusions; the letters come back in every title
P.letteredSummary(S("Executive summary: enter SE Asia via a JV, starting in Vietnam", "Four conclusions; each letter is a section of this deck", { source: null }), { highlight: 3,
  projection: { title: "Projection", items: [{ label: "2030 revenue from the JV", value: "US$ 95 m" }, { label: "Capital asked", value: "US$ 25 m" }, { label: "Break-even", value: "Month 30" }],
    risks: { title: "Risks", items: ["Partner talks stall", "Cold chain fails in pilot", "Rival copies the range"] } }, items: [
  { conclusion: "The home market can no longer carry our growth", points: ["EBIT margin fell 3 points in two years, mostly from price", "Four structural pressures persist; cost cuts close a third of the gap"] },
  { conclusion: "SE Asia is the growth pool, and Vietnam is where we can win", points: ["Snacks grow 9% a year to US$ 38 bn; premium chilled 14%", "Vietnam and Indonesia lead on attractiveness and our ability to win"] },
  { conclusion: "A joint venture is the fastest and safest way in", points: ["It beats building alone or acquiring on four of five criteria", "A partner gives 40k outlets and local co-packing from day one"] },
  { conclusion: "Approve US$ 25 m and start partner talks in Q1 2027", points: ["First revenue in month 14; break-even in month 30", "Two stage-gates cap the downside at US$ 9 m"] }] });

// 3 A1 — GRID4I: three exhibits + insights
P.composeSlide(pres, S("A1: Home-market profit is falling, and price explains most of it", "Home market, FY21–FY25"), { layout: "GRID4I", panels: [
  { headline: "EBIT margin fell 3 points in two years", chart: col("EBIT margin %", ["FY21", "FY22", "FY23", "FY24", "FY25"], [14.2, 14.1, 14.0, 12.4, 11.0], 4, "0.0") },
  { headline: "Price and mix cost US$ 29 m of EBIT", draw: (s, b) => G.waterfall(pres, s, { steps: [{ label: "FY23", value: 168, total: true }, { label: "Price / mix", value: -29 }, { label: "Volume", value: -3 }, { label: "Input costs", value: -16 }, { label: "Savings", value: 12 }, { label: "FY25", value: 132, total: true }] }, b) },
  { headline: "Our unit cost is only 4th of 8 peers", chart: bar("Cost per unit, index", ["Peer A", "Peer B", "Peer C", "Us", "Peer D", "Peer E"], [88, 93, 97, 100, 104, 111], 3) }],
  insights: ["Margin fell from **14% to 11%** while volume grew 1.2% a year", "**Promotions**, not volume, drive the decline", "Savings offset **less than half** of input-cost inflation"],
  soWhat: "Cost cuts alone cannot close the gap: we need a new growth engine" });

// 4 A2 — HALF2 with a takeaway under each panel
P.composeSlide(pres, S("A2: Four structural pressures persist, so the margin keeps falling", "Forces on home-market profitability and the margin outlook to 2030"), { layout: "HALF2", panels: [
  { headline: "Four forces take another 2.9 margin points by 2030", takeaway: "None of the four is in our control",
    chart: bar("Margin points lost by FY30", ["Discounters: shelf prices 8% below ours", "Input costs: packaging +12% in two years", "Online shift: lower margin in e-grocery", "Regulation: new labelling rules 2027"], [1.1, 0.8, 0.6, 0.4], 0, "0.0") },
  { headline: "Even with the cost programme, margin drops below 10%", takeaway: "The cost programme closes one third of the gap to 14%",
    chart: { type: "line", labels: ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"], series: [{ name: "No action", values: [11.0, 10.3, 9.6, 9.0, 8.5, 8.1] }, { name: "With cost programme", values: [11.0, 10.8, 10.5, 10.2, 10.0, 9.9] }], highlight: 1, format: "0.0" } }] });

// 5 B1 — T2B1: two drivers on top, the comparison below
P.composeSlide(pres, S("B1: SE Asia snacks grow 9% a year, premium chilled fastest", "SE Asia packaged snacks, US$ bn and growth per year"), { layout: "T2B1", panels: [
  { headline: "The market almost doubles to US$ 38 bn by 2030", chart: col("Market, US$ bn", ["2022", "2024", "2026", "2028F", "2030F"], [20, 24, 28, 33, 38], 4) },
  { headline: "Premium chilled grows 14% a year, twice the market", chart: bar("Growth % p.a. 2024–30", ["Ambient mass", "Ambient premium", "Frozen", "Premium chilled"], [6, 9, 10, 14], 3) },
  { headline: "Vietnam and Indonesia add most of the new premium demand", chart: { type: "column", labels: ["Vietnam", "Indonesia", "Thailand", "Philippines", "Malaysia", "Singapore"], series: [{ name: "Premium chilled 2024, US$ m", values: [310, 420, 380, 190, 160, 140] }, { name: "Added by 2030, US$ m", values: [390, 450, 210, 130, 70, 30] }], highlight: 1 } }] });

// 6 B2 — HALF2: map + scoring, a takeaway under each
P.composeSlide(pres, S("B2: Vietnam and Indonesia are the markets we can win in", "Six markets scored on attractiveness and on our ability to win", { source: SRC + "; Map: Natural Earth" }), { layout: "HALF2", panels: [
  { headline: "Two markets combine size, growth and openness", takeaway: "Vietnam first: smaller, but faster and easier to enter",
    map: { geo: "world", focus: ["Vietnam", "Indonesia", "Thailand", "Philippines", "Malaysia", "Singapore", "Cambodia", "Laos", "Myanmar"], highlight: ["Vietnam", "Indonesia"], labels: false, legend: false, markers: [{ lon: 105.8, lat: 21.0, label: "Vietnam, +12% a year", hi: true }, { lon: 106.8, lat: -6.2, label: "Indonesia, +11%", hi: true }, { lon: 100.5, lat: 13.7, label: "Thailand, +6%" }, { lon: 121.0, lat: 14.6, label: "Philippines, +8%" }, { lon: 101.7, lat: 3.1, label: "Malaysia, +5%" }] } },
  { headline: "They lead on four of five criteria", takeaway: "Thailand is the second wave once the model is proven",
    draw: (s, b) => P.scoringTable(s, { columns: [{ name: "Vietnam", own: true }, { name: "Indonesia" }, { name: "Thailand" }, { name: "Philippines" }, { name: "Malaysia" }],
      rows: [{ label: "Market growth", group: "Attractive", scores: [4, 4, 2, 3, 2] }, { label: "Premium share", group: "Attractive", scores: [3, 3, 4, 2, 3] }, { label: "Trade openness", group: "Attractive", scores: [4, 2, 3, 2, 3] },
        { label: "Partner availability", group: "Winnable", scores: [4, 3, 2, 2, 2] }, { label: "Fit with our range", group: "Winnable", scores: [4, 3, 3, 2, 2] }] }, b) }] });

// 7 B3 — EXI: evidence left, conclusion right
P.composeSlide(pres, S("B3: In Vietnam, premium chilled is where our strengths meet demand", "Where to play inside Vietnam"), { layout: "EXI", panels: [
  { headline: "Demand is there, and local supply is not", chart: { type: "stacked", labels: ["2022", "2024", "2026F", "2028F", "2030F"], series: [{ name: "Local brands", values: [90, 120, 150, 180, 210] }, { name: "Imports", values: [110, 190, 280, 380, 490] }], highlight: 1 } },
  { headline: "Buyers choose on quality, where we rank first", chart: bar("Top purchase reason, % of buyers", ["Quality and safety", "Brand", "Price", "Availability"], [46, 24, 18, 12], 0) }],
  insights: ["Imports already serve **two thirds** of premium chilled", "**Quality** decides 46% of purchases; we lead blind tests", "No importer has a **cold chain** beyond two cities", "Premium chilled sells at **2.3×** the price of ambient"],
  soWhat: "Play premium chilled, with a partner who has the cold chain" });

// 8 C1 — L2R1: two small charts explain the table
P.composeSlide(pres, S("C1: A joint venture beats building alone or acquiring", "Three entry options against the board's criteria"), { layout: "L2R1", panels: [
  { headline: "A JV reaches 40k outlets three years sooner", chart: bar("Years to 40k outlets", ["Build alone", "Joint venture", "Acquire"], [5, 1.5, 2], 1, "0.0") },
  { headline: "It needs a quarter of an acquisition's capital", chart: bar("Capital needed, US$ m", ["Build alone", "Joint venture", "Acquire"], [40, 25, 110], 1) },
  { headline: "Only the JV scores 3 or more on every criterion", takeaway: "Recommend the joint venture: fast, capital-light, local know-how",
    draw: (s, b) => P.scoringTable(s, { columns: [{ name: "Build alone" }, { name: "Joint venture", own: true }, { name: "Acquire" }],
      rows: [{ label: "Speed to market", scores: [1, 4, 4] }, { label: "Capital needed", scores: [3, 3, 1] }, { label: "Control", scores: [4, 3, 4] }, { label: "Risk", scores: [2, 3, 1] }, { label: "Local know-how", scores: [1, 4, 3] }],
      verdict: ["Too slow", "Recommended", "Too costly"] }, b) }] });

// 9 C2 — HALF2: criteria + shortlist
P.composeSlide(pres, S("C2: The partner must bring five capabilities; three candidates qualify", "Partner criteria and the shortlist after the first screen"), { layout: "HALF2", panels: [
  { headline: "Five capabilities define the ideal partner", takeaway: "Reach and cold chain are the two we cannot build in time",
    draw: (s, b) => G.hubSpoke(s, { centre: "Ideal partner", highlight: 0, items: [{ label: "Reach", text: "≥ 30k outlets" }, { label: "Cold chain", text: "5 cities" }, { label: "Licences", text: "import, distribution" }, { label: "Brand fit", text: "no rival range" }, { label: "Governance", text: "accepts 51/49" }] }, b) },
  { headline: "Three of eleven distributors pass every screen", takeaway: "Start talks with Partner A; keep B and C as fallback",
    draw: (s, b) => P.scoringTable(s, { columns: [{ name: "Partner A", own: true }, { name: "Partner B" }, { name: "Partner C" }, { name: "Partner D" }],
      rows: [{ label: "Reach", scores: [4, 3, 3, 4] }, { label: "Cold chain", scores: [4, 3, 3, 1] }, { label: "Licences", scores: [4, 4, 3, 4] }, { label: "Brand fit", scores: [4, 3, 4, 1] }, { label: "Governance", scores: [4, 4, 3, 2] }],
      verdict: ["First choice", "Fallback", "Fallback", "Fails 2"] }, b) }] });

// 10 C3 — T1B2: the shift on top, its effect below, conclusion last
P.composeSlide(pres, S("C3: The JV turns an export business into a local one", "Operating model today and under the JV"), { layout: "T1B2", panels: [
  { headline: "Three things change in how we operate",
    draw: (s, b) => G.beforeAfter(s, { fromTitle: "Today: export", toTitle: "Target: JV", rows: [
      { from: "Shipped from home plants, 6-week lead time", to: "Local co-packing, 1-week lead time", key: true },
      { from: "One importer, 2k outlets", to: "Partner network of 40k outlets" },
      { from: "Home-market range, English packs", to: "Adapted range, local-language packs" }] }, b) },
  { headline: "Lead time falls from six weeks to one", chart: col("Weeks from order to shelf", ["Today", "JV year 1", "JV year 2"], [6, 2, 1], 2) }],
  insights: ["Lead time **6 weeks → 1 week** cuts chilled waste by half", "Outlets **2k → 40k** without our own sales force", "We keep **brand and recipe control** at 51%"],
  soWhat: "The JV fixes the two things export cannot: freshness and reach" });

// 11 D1 — BAND2: phases on top, money below
P.composeSlide(pres, S("D1: Five phases take us to first revenue in month 14", "Entry programme 2027–2029 and capital by phase"), { layout: "BAND2", panels: [
  { headline: "Partner selection is on the critical path",
    draw: (sl, b) => G.chevronProcess(sl, { highlight: 1, items: [{ label: "Select", text: "Confirm Vietnam; deep-dive Indonesia" }, { label: "Partner", text: "Shortlist 3, sign term sheet" }, { label: "Set up", text: "Form JV, hire GM, adapt range" }, { label: "Pilot", text: "Hanoi and Ho Chi Minh City" }, { label: "Scale", text: "National roll-out on pilot results" }],
      result: { label: "Month 14", text: "First revenue; break-even by month 30" } }, b) },
  { headline: "Only US$ 9 m is committed before the pilot gate decides on the rest",
    chart: col("Cumulative capital committed, US$ m", ["Select", "Partner", "Set up (gate 1)", "Pilot (gate 2)", "Scale"], [1, 3, 9, 14, 25], 2) }] });

// 12 D2 — HALF2: value bridge + payback
P.composeSlide(pres, S("D2: The JV adds US$ 95 m by 2030 and pays back in year four", "Revenue bridge 2026–2030 and cumulative cash, US$ m"), { layout: "HALF2", panels: [
  { headline: "Three initiatives build the 2030 revenue", takeaway: "Vietnam alone delivers 60% of the uplift",
    draw: (s, b) => G.waterfall(pres, s, { steps: [{ label: "2026", value: 410, total: true }, { label: "Vietnam JV", value: 57 }, { label: "Indonesia", value: 26 }, { label: "Range", value: 12 }, { label: "2030", value: 505, total: true }] }, b) },
  { headline: "Cumulative cash turns positive in 2030", takeaway: "Peak cash need is US$ 25 m in 2028",
    chart: { type: "line", labels: ["2026", "2027", "2028", "2029", "2030", "2031"], series: [{ name: "Cumulative cash, US$ m", values: [0, -12, -25, -16, 3, 31] }], highlight: 0 } }] });

// 13 D3 — risks: numbered heat map + the same numbers in the mitigation list
P.riskMatrix(S("D3: Three risks need action now; the stage-gates cap the rest", "Risks by likelihood and impact, with mitigation"), { risks: [
  { id: 1, name: "Partner talks stall", x: 0.8, y: 0.7, mitigation: ["Run A and B in parallel", "Term sheet deadline Q3 2027"] },
  { id: 2, name: "Cold chain fails in the pilot", x: 0.85, y: 0.55, mitigation: ["Audit before signing", "Two-city pilot first"] },
  { id: 3, name: "Local rival copies the range", x: 0.6, y: 0.75, mitigation: ["Launch three hero products", "Lock shelf space for 24 months"] },
  { id: 4, name: "Currency weakens", x: 0.4, y: 0.4, mitigation: ["Local co-packing as a natural hedge"] },
  { id: 5, name: "Labelling rules change", x: 0.25, y: 0.6, mitigation: ["Local regulatory counsel on retainer"] }] }, B);

// 14 The decision
{ const s = pres.addSlide({ masterName: L.statementDark });
  s.addText("Decision today: approve US$ 25 m and start JV partner talks in Q1 2027", { placeholder: "statement" });
  s.addText("Downside is capped at US$ 9 m: stage-gates after partner selection and after the pilot", { placeholder: "support" }); }
// 15 End
{ const s = pres.addSlide({ masterName: L.end }); s.addText("Next steps", { placeholder: "title" });
  s.addText("Approve budget · nominate steering committee · brief partner shortlist", { placeholder: "contact" }); }
(async () => { await pres.writeFile({ fileName: "sample-deck.pptx" }); await H.finalize("sample-deck.pptx"); console.log("sample written"); })();
