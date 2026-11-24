// Sample deck v0.6 — illustrative brief: "Should we enter SE Asia?" for a board audience.
// Built from the reference decks after the self-audit of 2026-11-23 (review/self-audit-2026-11-23.md):
// photo cover and agenda; a section breadcrumb over every title; full two-line action titles, no subtitle line;
// every exhibit with its unit line and 2-3 bullets of reading in a grey box; annotated charts (CAGR callouts, growth
// pairs, CAGR table); tables and diagrams beside the charts; icons on label points; grey boxes and full-colour bars,
// never a box with an accent bar on its left edge. About 120-200 body words per analysis slide, as the references have.
const path = require("path");
const pptxgen = require("pptxgenjs"); const G = require("/home/claude/powerpoint-deck-system/Generators/patterns.js"); const P = require("/home/claude/powerpoint-deck-system/Generators/patterns_story.js"); const H = G.HOUSE; const { C } = G;
const pres = H.newDeck(pptxgen, "Sample deck — SE Asia entry (illustrative)");
const L = H.LAYOUT, B = G.BODY, SRC = "Source: illustrative data for layout review";
const SECTIONS = ["Why now", "Where to play", "How to enter", "Plan and value"];
const S = (sec, title, o = {}) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, crumb: sec == null ? undefined : { items: SECTIONS, current: sec }, source: o.source === undefined ? SRC : o.source }); return s; };
const col = (name, labels, values, hi, format) => ({ type: "column", labels, series: [{ name, values }], highlight: hi, format });
const bar = (name, labels, values, hi, format) => ({ type: "bar", labels, series: [{ name, values }], highlight: hi, format });
const PH = (f, w, h, focusY) => ({ path: path.join("/home/claude/powerpoint-deck-system", "Objects", "Visual", "photos", f), w, h, focusY });
const DAY = PH("hcmc-skyline-day.jpg", 8000, 3579);   // CC0, original pixels (Objects/credits.md)

// 1 Cover: full-bleed photo, colour panel
P.photoCover(pres, { photo: DAY, title: "Entering SE Asia through a joint venture can double our growth by 2030", subtitle: "Board discussion · market entry options", date: "November 2026 · Draft for discussion", credit: "Photo: Ho Chi Minh City skyline, Pimnl, CC0" });
// 2 Agenda: photo + sections, lettered as in the summary
P.photoAgenda(pres, { photo: { ...DAY, focusX: 0.2 }, title: "Agenda", sections: ["Why now: the home market", "Where to play: SE Asia and Vietnam", "How to enter: the joint venture", "Plan and value: programme, returns, risks"], current: null, credit: "Photo: Ho Chi Minh City skyline, Pimnl, CC0" });

// 3 Executive summary: lettered conclusions + Projection column (Baincraft 2)
P.letteredSummary(S(null, "Executive summary: enter SE Asia through a joint venture, starting in Vietnam, with US$ 25 m in gated tranches", { source: null }), { highlight: 3,
  projection: { title: "Projection", items: [{ label: "2030 revenue from the JV", value: "US$ 95 m" }, { label: "Capital asked", value: "US$ 25 m" }, { label: "Break-even", value: "Month 30" }],
    risks: { title: "Risks", items: ["Partner talks stall", "Cold chain fails in pilot", "Rival copies the range"] } }, items: [
  { conclusion: "The home market can no longer carry our growth", points: ["EBIT margin fell 3 points in two years, mostly from price and promotions", "Four structural pressures persist; the cost programme closes a third of the gap"] },
  { conclusion: "SE Asia is the growth pool, and Vietnam is where we can win", points: ["Snacks grow 9% a year to US$ 38 bn; premium chilled grows 14%", "Vietnam and Indonesia lead on attractiveness and on our ability to win"] },
  { conclusion: "A joint venture is the fastest and safest way in", points: ["It beats building alone or acquiring on four of five board criteria", "A partner brings 40k outlets and local co-packing from day one"] },
  { conclusion: "Approve US$ 25 m and start partner talks in Q1 2027", points: ["First revenue in month 14, break-even in month 30", "Two stage-gates cap the downside at US$ 9 m"] }] });

// 4 A1 — GRID4I
P.composeSlide(pres, S(0, "Home-market margin has fallen three points in two years, and price, not volume, explains most of it"), { layout: "GRID4I", panels: [
  { readingSide: "right", readingShare: 0.38, icon: "trending-down", headline: "EBIT margin fell 3 points in two years", unit: "Home market, EBIT margin, %", chart: col("EBIT margin %", ["FY21", "FY22", "FY23", "FY24", "FY25"], [14.2, 14.1, 14.0, 12.4, 11.0], 4, "0.0"),
    reading: ["Stable at **14%** until FY23, then **−3 points** in two years", "Volume still grew **1.2% a year**: this is not a demand problem"] },
  { readingSide: "right", readingShare: 0.38, icon: "tag", headline: "Price and mix cost US$ 29 m of EBIT", unit: "Home market, EBIT bridge FY23 to FY25, US$ m", draw: (s, b) => G.waterfall(pres, s, { steps: [{ label: "FY23", value: 168, total: true }, { label: "Price", value: -29 }, { label: "Volume", value: -3 }, { label: "Inputs", value: -16 }, { label: "Savings", value: 12 }, { label: "FY25", value: 132, total: true }] }, b),
    reading: ["**Promotions** to defend shelf space took US$ 29 m", "Savings of US$ 12 m offset **less than half** of input-cost inflation"] },
  { readingSide: "right", readingShare: 0.38, icon: "scale", headline: "Our unit cost is only 4th of 8 peers", unit: "Cost per unit, index (us = 100)", chart: bar("Cost per unit, index", ["Peer A", "Peer B", "Peer C", "Us", "Peer D", "Peer E"], [88, 93, 97, 100, 104, 111], 3),
    reading: ["Best peer is **12 points** cheaper: scale, not efficiency", "Closing half the gap is worth **1 margin point**, not three"] }],
  insights: ["Margin fell from **14% to 11%** while volume grew", "**Price and promotions**, not volume, drive the decline", "The cost gap to peers is **structural**: they are larger", "Cost cuts can recover **about one point** of the three"],
  soWhat: "Cost cuts alone cannot close the gap: we need a new growth engine" });

// 5 A2 — HALF2: a table and a chart
P.composeSlide(pres, S(0, "Four structural pressures persist, so the margin falls below 10% even if the cost programme delivers"), { layout: "HALF2", panels: [
  { icon: "alert-triangle", headline: "Four forces take another 2.9 margin points by 2030", unit: "Effect on home-market EBIT margin by FY30, points",
    draw: (s, b) => G.dataTable(s, { header: ["Force", "What is changing", "Effect"], colW: [0.24, 0.56, 0.2], highlightRow: 0, alignRight: false, maxRowH: 0.75, fontSize: 11, rows: [
      ["Discounters", "Shelf prices 8% below ours; own label now 31% of the category", "−1.1"], ["Input costs", "Packaging +12% in two years; contracts reprice in 2027", "−0.8"],
      ["Online shift", "E-grocery at 14% of sales with a margin 5 points lower", "−0.6"], ["Regulation", "New labelling rules from 2027: one-off and running cost", "−0.4"]] }, b),
    reading: ["**None of the four** is in our control, and none is cyclical", "Discounters alone cost more than the whole cost programme saves"] },
  { icon: "chart-line", headline: "Even with the cost programme, margin drops below 10%", unit: "Home market, EBIT margin outlook, %",
    chart: { type: "line", labels: ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"], series: [{ name: "No action", values: [11.0, 10.3, 9.6, 9.0, 8.5, 8.1] }, { name: "With cost programme", values: [11.0, 10.8, 10.5, 10.2, 10.0, 9.9] }], highlight: 1, format: "0.0", options: { valAxisMinVal: 7, valAxisMaxVal: 12 } },
    reading: ["Without action the margin reaches **8.1%** by FY30", "The programme lifts that to **9.9%**: one third of the gap to 14%", "The remaining **4 points** need growth outside the home market"] }] });

// 6 B1 — T2B1: annotated charts
P.composeSlide(pres, S(1, "SE Asia snacks grow 9% a year to US$ 38 bn by 2030, and premium chilled, our core range, grows fastest"), { layout: "COL3", panels: [
  { icon: "trending-up", headline: "The market almost doubles to US$ 38 bn by 2030", unit: "SE Asia packaged snacks, US$ bn; growth per year by period",
    draw: (s, b) => P.growthBars(pres, s, { labels: ["2020", "2022", "2024", "2026", "2028F", "2030F"], values: [17, 20, 24, 28, 33, 38], forecastFrom: 4, name: "Market, US$ bn" }, b),
    reading: ["**9% a year** for a decade, three times our home market", "Forecast growth holds as incomes and modern trade expand"] },
  { icon: "snowflake", headline: "Premium chilled grows 14% a year, twice the market", unit: "SE Asia snacks by segment, US$ bn; CAGR by period",
    draw: (s, b) => P.stackedCagr(pres, s, { unit: "US$ bn", periods: ["2020", "2025", "2030F"], series: [{ name: "Ambient mass", values: [9, 11.5, 14] }, { name: "Ambient premium", values: [4.5, 7, 10.5] }, { name: "Frozen", values: [2.5, 4, 6.5] }, { name: "Premium chilled", values: [1, 3.5, 7] }],
      cagr: { headers: ["20–25", "25–30"], rows: [["5%", "4%"], ["9%", "8%"], ["10%", "10%"], ["28%", "14%"]] }, highlight: 3 }, b),
    reading: ["Premium chilled is small today but adds **US$ 3.5 bn** by 2030", "It is the segment where our **quality lead** matters most"] },
  { icon: "world", headline: "Vietnam and Indonesia add most of the new demand", unit: "Premium chilled snacks by country, US$ m, 2024 and 2030F",
    draw: (s, b) => P.growthPairs(pres, s, { labels: ["Indonesia", "Vietnam", "Thailand", "Philippines", "Malaysia"], a: { name: "2024", values: [420, 310, 380, 190, 160] }, b: { name: "2030F", values: [870, 700, 590, 320, 230] }, highlight: 1 }, b),
    reading: ["**Vietnam more than doubles**: +US$ 390 m, the fastest growth of the five", "Indonesia adds the most in absolute terms but is harder to enter", "The two together are **60%** of the region's new demand"] }] });

// 7 B2 — HALF2: map + scoring table
P.composeSlide(pres, S(1, "Vietnam and Indonesia are both attractive and winnable for us, and Vietnam is the easier first step", { source: SRC + "; Map: Natural Earth" }), { layout: "HALF2", panels: [
  { icon: "map-pin", headline: "Two markets combine size, growth and openness", unit: "Premium chilled snacks, growth per year 2024–30",
    map: { geo: "world", focus: ["Vietnam", "Indonesia", "Thailand", "Philippines", "Malaysia", "Singapore", "Cambodia", "Laos", "Myanmar"], highlight: ["Vietnam", "Indonesia"], labels: false, legend: false,
      markers: [{ lon: 105.8, lat: 21.0, label: "Vietnam, +12% a year", hi: true }, { lon: 106.8, lat: -6.2, label: "Indonesia, +11%", hi: true }, { lon: 100.5, lat: 13.7, label: "Thailand, +6%" }, { lon: 121.0, lat: 14.6, label: "Philippines, +8%" }, { lon: 101.7, lat: 3.1, label: "Malaysia, +5%" }] },
    reading: ["**Vietnam**: 100 m people, modern trade share doubling by 2030", "**Indonesia**: largest market, but 17,000 islands raise cold-chain cost by a third", "Thailand and Malaysia are **mature**: premium share is high, growth is half"] },
  { icon: "target", headline: "Only they sit where the market is attractive and we can win", unit: "Attractiveness and our ability to win, index 0 to 1; bubble = premium chilled market 2030F",
    draw: (s, b) => P.positioningMap(s, { x: { label: "Our ability to win", low: "Low", high: "High" }, y: { label: "Market attractiveness", low: "Low", high: "High" }, highlight: "Vietnam",
      zone: { x0: 0.6, x1: 1, y0: 0.6, y1: 1, label: "Enter first" }, points: [{ label: "Indonesia", x: 0.66, y: 0.7, size: 8.7 }, { label: "Thailand", x: 0.48, y: 0.5, size: 5.9 }, { label: "Philippines", x: 0.28, y: 0.62, size: 3.2 }, { label: "Malaysia", x: 0.4, y: 0.24, size: 2.3 }, { label: "Vietnam", x: 0.85, y: 0.86, size: 7 }] }, b),
    reading: ["Attractiveness: growth, premium share, trade openness; ability to win: partners and fit with our range", "**Vietnam** leads on ability to win: open trade and three qualified partners", "Thailand is the **second wave** once the model is proven"] }] });

// 8 B3 — EXI with icon points
P.composeSlide(pres, S(1, "In Vietnam, premium chilled is where unmet demand meets our strengths: imports already serve two thirds"), { layout: "EXI", panels: [
  { icon: "package", headline: "Demand is there, and local supply is not", unit: "Vietnam premium chilled snacks by source, US$ m",
    chart: { type: "stacked", labels: ["2022", "2024", "2026F", "2028F", "2030F"], series: [{ name: "Local brands", values: [90, 120, 150, 180, 210] }, { name: "Imports", values: [110, 190, 280, 380, 490] }], highlight: 1 },
    readingSide: "right", readingShare: 0.36, reading: ["Imports grow **4× faster** than local brands", "Local makers lack chilled capacity and quality certification", "By 2030 imports are **70%** of the segment"] },
  { icon: "shopping-cart", headline: "Three things decide the purchase, and we lead on two", points: [
    { icon: "shield-check", label: "Quality and safety", text: "Decides **46%** of purchases; we rank first in blind tests" },
    { icon: "snowflake", label: "Cold chain", text: "No importer reaches beyond **two cities**; our gap as well" },
    { icon: "award", label: "Brand", text: "Decides **24%**; foreign premium brands carry a price premium of 2.3×" }] }],
  insights: ["Imports already serve **two thirds** of premium chilled", "**Quality** is the first purchase reason, and our lead", "The **cold chain** is the bottleneck for every importer", "A partner with chilled logistics removes our one gap"],
  soWhat: "Play premium chilled, with a partner who has the cold chain" });

// 9 C1 — L2R1
P.composeSlide(pres, S(2, "A joint venture beats building alone or acquiring: only it scores three or more on every board criterion"), { layout: "L2R1", panels: [
  { icon: "clock", headline: "A JV reaches 40k outlets three years sooner", unit: "Years to reach 40k outlets", chart: bar("Years to 40k outlets", ["Build alone", "Joint venture", "Acquire"], [5, 1.5, 2], 1, "0.0"),
    reading: ["A partner's network is live from **day one**", "Alone, listings are won outlet by outlet: **five years**"] },
  { icon: "coins", headline: "It needs a quarter of an acquisition's capital", unit: "Capital needed to 2030, US$ m", chart: bar("Capital needed, US$ m", ["Build alone", "Joint venture", "Acquire"], [40, 25, 110], 1),
    reading: ["**US$ 25 m** against US$ 110 m for the one target on sale", "The asking price carries a **40% premium** to book value"] },
  { icon: "clipboard-check", headline: "Only the JV scores 3 or more on every criterion", unit: "Score 0 to 4 against the board's five criteria",
    draw: (s, b) => P.scoringTable(s, { columns: [{ name: "Build alone" }, { name: "Joint venture", own: true }, { name: "Acquire" }],
      rows: [{ label: "Speed to market", scores: [1, 4, 4] }, { label: "Capital needed", scores: [3, 3, 1] }, { label: "Control", scores: [4, 3, 4] }, { label: "Risk", scores: [2, 3, 1] }, { label: "Local know-how", scores: [1, 4, 3] }],
      verdict: ["Too slow", "Recommended", "Too costly"] }, b),
    reading: ["Building alone keeps control but takes **five years** to reach scale", "Acquiring is fast, but the price puts **US$ 110 m** at risk in an unknown market", "The JV gives up some control (51/49) for **speed, capital and know-how**"] }] });

// 10 C2 — HALF2: diagram + table
P.composeSlide(pres, S(2, "The partner must bring five capabilities we cannot build in time, and three of eleven distributors qualify"), { layout: "TXC", regions: (() => { const B = G.BODY, g = 0.3, w1 = B.w * 0.385; return [{ x: B.x, y: B.y, w: w1, h: B.h }, { x: B.x + w1 + g, y: B.y, w: B.w - w1 - g, h: B.h }]; })(), panels: [
  { icon: "target", headline: "Five capabilities define the ideal partner", unit: "Partner criteria and the threshold for each",
    draw: (s, b) => G.hubSpoke(s, { centre: "Ideal partner", highlight: 0, items: [{ label: "Reach", text: "≥ 30k outlets" }, { label: "Cold chain", text: "5 cities" }, { label: "Licences", text: "import, distribution" }, { label: "Brand fit", text: "no rival range" }, { label: "Governance", text: "accepts 51/49" }] }, b),
    reading: ["**Reach and cold chain** are the two we cannot build in time", "Governance at 51/49 keeps brand and recipe decisions with us"] },
  { icon: "users", headline: "Three of eleven distributors pass every screen", unit: "The shortlist after the first screen, with the facts behind each threshold",
    draw: (s, b) => G.table(s, { form: "panels", highlightCol: 1, header: ["", "Partner A", "Partner B", "Partner C"], colW: [0.29, 0.22, 0.23, 0.26], rows: [
      ["Outlets reached", "42k", "33k", "31k"], ["Cities with chilled depots", "6", "5", "5"], ["Licences", "Import, distribution", "Import, distribution", "Distribution; import by Q2"],
      ["Rival premium range", "None", "One ambient brand", "None"], ["Stake accepted", "49%", "49%", "49%, asks a board veto"], ["Our view", "First choice", "Fallback", "Fallback"]] }, b),
    reading: ["**Partner A** clears every threshold with room to spare and carries no rival brand", "Eight of the eleven failed on **cold chain** or on a competing premium range", "B and C stay in the talks until A signs the term sheet"] }] });

// 11 C3 — T1B2
P.composeSlide(pres, S(2, "The joint venture turns an export business into a local one: lead time falls from six weeks to one"), { layout: "T1B2", panels: [
  { icon: "arrows-exchange", headline: "Three things change in how we operate",
    draw: (s, b) => G.beforeAfter(s, { fromTitle: "Today: export", toTitle: "Target: joint venture", rows: [
      { from: "Shipped from home plants, 6-week lead time", to: "Local co-packing, 1-week lead time", key: true },
      { from: "One importer, 2k outlets in two cities", to: "Partner network of 40k outlets nationwide" },
      { from: "Freight and duties take 9 margin points", to: "Local cost base, no import duty" }] }, b) },
  { icon: "truck-delivery", headline: "Lead time falls from six weeks to one", unit: "Weeks from order to shelf", chart: col("Weeks from order to shelf", ["Today", "JV year 1", "JV year 2"], [6, 2, 1], 2),
    readingSide: "right", readingShare: 0.42, reading: ["Chilled shelf life is **5 weeks**: export loses most of it at sea", "Local co-packing cuts waste **by half**, from 14% to 7%", "Year 1 runs on one co-packer; a second joins in year 2"] }],
  insights: ["Lead time **6 weeks → 1 week**: four more weeks on the shelf", "Outlets **2k → 40k** without our own sales force", "**9 margin points** come back from freight and duties", "We keep **brand and recipe control** at 51%"],
  soWhat: "The JV fixes what export cannot: freshness and reach" });

// 12 D1 — BAND2
P.composeSlide(pres, S(3, "Five phases lead to first revenue in month 14, and two stage-gates release the US$ 25 m in tranches"), { layout: "BAND2", panels: [
  { icon: "route", headline: "Partner selection is on the critical path: each month of delay moves first revenue by a month",
    draw: (sl, b) => G.chevronProcess(sl, { highlight: 1, items: [{ label: "Select", text: "Confirm Vietnam; deep-dive Indonesia" }, { label: "Partner", text: "Shortlist 3, sign term sheet" }, { label: "Set up", text: "Form JV, hire GM, adapt range" }, { label: "Pilot", text: "Hanoi and Ho Chi Minh City" }, { label: "Scale", text: "National roll-out on pilot results" }],
      result: { label: "Month 14", text: "First revenue; break-even by month 30" } }, b) },
  { icon: "cash", headline: "Only US$ 9 m is committed before the pilot gate decides on the rest", unit: "Cumulative capital committed by phase, US$ m",
    chart: col("Cumulative capital committed, US$ m", ["Select", "Partner", "Set up (gate 1)", "Pilot (gate 2)", "Scale"], [1, 3, 9, 14, 25], 2),
    readingSide: "right", readingShare: 0.45, reading: ["**Gate 1** after partner selection: term sheet signed, cold chain audited", "**Gate 2** after the pilot: sell-through and waste on plan in both cities", "**US$ 16 m** of the 25 is released only after a gate", "Set-up and pilot can **overlap by two months** if the co-packer is certified early"] }] });

// 13 D2 — HALF2
P.composeSlide(pres, S(3, "The joint venture adds US$ 95 m of revenue by 2030 and pays back in year four on US$ 25 m of capital"), { layout: "L2R1", panels: [
  { readingSide: "right", readingShare: 0.4, icon: "chart-bar", headline: "Three initiatives build the 2030 revenue", unit: "Group revenue bridge 2026 to 2030, US$ m",
    draw: (s, b) => G.waterfall(pres, s, { steps: [{ label: "2026", value: 410, total: true }, { label: "Vietnam", value: 57 }, { label: "Indonesia", value: 26 }, { label: "Range", value: 12 }, { label: "2030", value: 505, total: true }] }, b),
    reading: ["**Vietnam alone** delivers 60% of the uplift", "Indonesia follows from 2029, on the same partner model", "The adapted range adds US$ 12 m in both markets"] },
  { readingSide: "right", readingShare: 0.4, icon: "pig-money", headline: "Cumulative cash turns positive in 2030", unit: "JV cumulative cash flow, US$ m",
    chart: { type: "line", labels: ["2026", "2027", "2028", "2029", "2030", "2031"], series: [{ name: "Cumulative cash, US$ m", values: [0, -12, -25, -16, 3, 31] }], highlight: 0 },
    reading: ["Peak cash need **US$ 25 m** in 2028, equal to the capital asked", "**Payback in year four**; IRR 24% on the base case", "A one-year delay moves payback to 2031 and IRR to 17%"] },
  { icon: "clipboard-check", headline: "Three assumptions carry the case, and the pilot tests each one before the last tranche", unit: "Base case, the value at which the case breaks even, and the pilot test",
    draw: (s, b) => G.table(s, { form: "rowblocks", header: ["Assumption", "Base case", "Break-even at", "How the pilot tests it"], colW: [0.3, 0.15, 0.17, 0.38], highlightRow: 0, rows: [
      ["Price premium to local brands", "2.0×", "1.6×", "Shelf price test in 200 outlets, two cities"],
      ["Outlets reached by year 3", "40k", "26k", "Partner listings signed before gate 2"],
      ["Waste as a share of volume", "7%", "11%", "Weekly waste audit at the co-packer and in store"]] }, b) }] });

// 14 D3 — risk heat map + the same numbers in the mitigation list (DoubleClick 12)
P.riskMatrix(S(3, "Three risks are both likely and costly and need action now; the stage-gates cap the rest"), { risks: [
  { id: 1, name: "Partner talks stall", x: 0.8, y: 0.7, mitigation: ["Run A and B in parallel", "Term sheet deadline Q3 2027"] },
  { id: 2, name: "Cold chain fails in the pilot", x: 0.85, y: 0.55, mitigation: ["Audit before signing", "Two-city pilot first"] },
  { id: 3, name: "Local rival copies the range", x: 0.6, y: 0.75, mitigation: ["Launch three hero products", "Lock shelf space for 24 months"] },
  { id: 4, name: "Currency weakens", x: 0.4, y: 0.4, mitigation: ["Local co-packing as a natural hedge"] },
  { id: 5, name: "Labelling rules change", x: 0.25, y: 0.6, mitigation: ["Local regulatory counsel on retainer"] }] }, { ...B, h: B.h - 1.0 });
P.readingBox(pres.slides[pres.slides.length - 1], ["Risks **1 to 3** sit in the priority zone: each has an owner and a deadline before gate 1", "Risks 4 and 5 are monitored quarterly; neither changes the decision on its own", "If two priority risks materialise before gate 1, the exposure stops at **US$ 3 m**"], { x: B.x, y: B.y + B.h - 0.86, w: B.w, h: 0.86 });

// 15 The decision
{ const s = pres.addSlide({ masterName: L.statementDark });
  s.addText("Decision today: approve US$ 25 m and start JV partner talks in Q1 2027", { placeholder: "statement" });
  s.addText("Downside is capped at US$ 9 m: stage-gates after partner selection and after the pilot", { placeholder: "support" }); }
// 16 End
{ const s = pres.addSlide({ masterName: L.end }); s.addText("Next steps", { placeholder: "title" });
  s.addText("Approve budget · nominate steering committee · brief partner shortlist", { placeholder: "contact" }); }
(async () => { await pres.writeFile({ fileName: process.argv[2] || "sample-deck.pptx" }); await H.finalize(process.argv[2] || "sample-deck.pptx"); console.log("sample written"); })();
