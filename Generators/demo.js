const pptxgen = require("pptxgenjs");
const G = require("./patterns.js");
const { C } = G;
const H = G.HOUSE;
const pres = H.newDeck(pptxgen, "Pattern generators: test deck");   // the house master, as every deck (2026-11-23: was a bare deck from before the master existed)
const L = H.LAYOUT;
const S = (title, subtitle, source, tr) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source, tracker: tr }); return s; };
const B = G.BODY;

// 1 cover
{ const s = pres.addSlide({ masterName: L.title });
  s.addText("Pattern generators: every pattern redrawn from rules, for any number of items", { placeholder: "title" });
  s.addText("Test deck · house style", { placeholder: "subtitle" });
  s.addText("Illustrative data only", { placeholder: "date" }); }

// 2 evolution: chevrons 3 / 5 / 7
{ const s = S("The same process pattern redraws itself for 3, 5 or 7 steps", "chevron-process: width = (W + (n−1)(point−gap)) / n", null, { n: 5, current: 0 });
  [3, 5, 7].forEach((n, k) => G.chevronProcess(s, { items: Array.from({ length: n }, (_, i) => ({ label: `Step ${i + 1}` })), highlight: n - 2 }, { x: B.x, y: B.y + k * 1.7, w: B.w, h: 0.7 }));
  [3, 5, 7].forEach((n, k) => G.txt(s, `n = ${n}`, B.x, B.y + k * 1.7 + 0.75, 2, 0.35, { fontSize: 11, color: C.g4 })); }

// 3 evolution: cycle 4 vs 7
{ const s = S("A cycle keeps its geometry whether it has four or seven stages", "cycle: segment angle = 360° / n, starting at 12 o'clock, clockwise");
  G.cycle(s, { items: ["Plan", "Do", "Check", "Act"].map((l) => ({ label: l })), highlight: 2, centre: "PDCA" }, { x: B.x, y: B.y + 0.2, w: B.w / 2 - 0.2, h: B.h - 0.4 });
  G.cycle(s, { items: ["Sense", "Frame", "Ideate", "Test", "Decide", "Build", "Learn"].map((l) => ({ label: l })), highlight: 4, centre: "Innovation loop" }, { x: B.x + B.w / 2 + 0.2, y: B.y + 0.2, w: B.w / 2 - 0.2, h: B.h - 0.4 }); }

// 4 evolution: hub 5 vs 9
{ const s = S("Hub-and-spoke spaces any number of satellites so they never touch", "hub-spoke: angle = −90° + i·360°/n; satellite size limited by 2R·sin(π/n)");
  G.hubSpoke(s, { centre: "Customer", items: ["Price", "Range", "Service", "Brand", "Access"].map((l) => ({ label: l })), highlight: 2 }, { x: B.x, y: B.y, w: B.w / 2 - 0.2, h: B.h });
  G.hubSpoke(s, { centre: "Operating model", items: ["Strategy", "Structure", "Process", "People", "Data", "Tech", "Partners", "KPIs", "Culture"].map((l) => ({ label: l })), highlight: 7 }, { x: B.x + B.w / 2 + 0.2, y: B.y, w: B.w / 2 - 0.2, h: B.h }); }

// 5 full chevron process with text + result
{ const s = S("A five-phase entry programme gets us to first revenue in 14 months", "Market entry approach, phases and key activities", "Source: Team analysis (illustrative)", { n: 5, current: 1 });
  G.chevronProcess(s, { highlight: 2, items: [
    { label: "Scan", text: "Size six SE Asia markets on demand, competition and regulation" },
    { label: "Select", text: "Shortlist two markets against five entry criteria" },
    { label: "Partner", text: "Find and negotiate a JV partner with local distribution" },
    { label: "Launch", text: "Pilot in two cities with a reduced range" },
    { label: "Scale", text: "Roll out nationally once pilot hits margin target" }],
    result: { label: "First revenue", text: "Month 14, break-even month 30" } }, { ...B, h: 4.4 });
  G.takeaway(s, "Partner selection (phase 3) is on the critical path — start talks now"); }

// 6 timeline
{ const s = S("Seven milestones lead from board approval to national roll-out", "Key milestones, 2026–2028", "Source: Programme plan (illustrative)");
  G.timeline(s, { highlight: 3, items: [
    { date: "Q1 2026", text: "Board approves entry strategy" }, { date: "Q2 2026", text: "Two markets selected" },
    { date: "Q4 2026", text: "JV term sheet signed" }, { date: "Q2 2027", text: "Pilot launch in two cities" },
    { date: "Q4 2027", text: "Pilot review against margin target" }, { date: "Q2 2028", text: "National roll-out starts" },
    { date: "Q4 2028", text: "Break-even run-rate" }] }); }

// 7 staircase
{ const s = S("Moving from 'basic' to 'leading' takes four capability steps", "Digital maturity stages");
  G.staircase(s, { highlight: 2, items: [
    { label: "Basic", text: "Manual processes, data in spreadsheets" }, { label: "Connected", text: "Core systems integrated, single customer view" },
    { label: "Data-driven", text: "Decisions on live KPIs, automated reporting" }, { label: "Leading", text: "AI-assisted pricing and demand planning" }] }, { ...B, h: 4.55 });
  G.takeaway(s, "We are at stage 2; stage 3 is the target for 2027"); }

// 8 pyramid + funnel
{ const s = S("Strategy cascades down; ideas narrow down", "pyramid (4 layers) and funnel (5 tiers) from the same layer engine");
  G.pyramid(s, { highlight: 1, items: [{ label: "Vision", text: "Leading regional player by 2030" }, { label: "Goals", text: "3 markets, 15% margin" }, { label: "Initiatives", text: "Entry, digital, partnerships" }, { label: "Enablers", text: "Talent, data, capital" }] }, { x: B.x, y: B.y + 0.1, w: B.w / 2 - 0.2, h: B.h - 0.2 });
  G.funnel(s, { highlight: 4, items: [{ label: "140", text: "ideas collected" }, { label: "60", text: "pass strategic fit" }, { label: "25", text: "pass business case" }, { label: "12", text: "pass risk review" }, { label: "5", text: "funded" }] }, { x: B.x + B.w / 2 + 0.2, y: B.y + 0.1, w: B.w / 2 - 0.2, h: B.h - 0.2 }); }

// 9 matrix 3x3
{ const s = S("Vietnam and Indonesia are the most attractive markets we can win in", "Market attractiveness vs our ability to win", "Source: Team analysis (illustrative)");
  G.matrix(s, { rows: ["High", "Medium", "Low"], cols: ["Low", "Medium", "High"], xTitle: "Ability to win", yTitle: "Market attractiveness", highlight: [0, 2],
    cells: [["Philippines", "Thailand", "Vietnam, Indonesia"], ["", "Malaysia", ""], ["Singapore", "", ""]],
    side: "Focus on the top-right cell.\n\nThailand is a second wave option if the JV model works." }); }

// 10 forces
{ const s = S("Five pressures are squeezing margins in our home market", "Forces acting on home-market profitability");
  G.forcesIn(s, { centre: "Home market margin", highlight: 0, items: [
    { label: "Price pressure", text: "Discounters cut shelf prices 8%" }, { label: "Input costs", text: "Packaging up 12% in two years" },
    { label: "Channel shift", text: "Online share doubled to 34%" }, { label: "Regulation", text: "New labelling rules from 2027" }, { label: "Labour", text: "Wage inflation 6% a year" }] }); }

// 11 converge
{ const s = S("Six workstreams all serve one goal: profitable entry", "Programme structure");
  G.converge(s, { highlight: 2, items: ["Market selection", "Partner search", "Product adaptation", "Supply chain", "Brand & marketing", "Funding"].map((l) => ({ label: l })),
    goal: { label: "Profitable entry", text: "Break-even within 30 months of first revenue" } }); }

// 12 venn
{ const s = S("The opportunity sits where our strengths meet unmet local demand", "Where to play");
  G.venn(s, { items: [{ label: "Our strengths" }, { label: "Unmet demand" }, { label: "Partner reach" }], intersection: { label: "Premium chilled snacks", text: "We lead on product, demand is growing 14% a year, and the partner already serves 40k outlets." } }); }

// 13 issue tree
{ const s = S("Margin decline is driven by price, not volume", "Why did home-market EBIT margin fall 3 points?", "Source: Finance data FY24–FY25 (illustrative)");
  G.issueTree(s, { root: "EBIT margin −3 pts", highlight: 0, children: [
    { label: "Price / mix −2.4 pts", children: ["Promotions deeper and longer", "Mix shift to value packs"] },
    { label: "Volume −0.2 pts", children: ["Volume broadly flat"] },
    { label: "Cost −0.4 pts", children: ["Packaging inflation", "Logistics, partly offset by savings"] }],
    comments: ["Main driver — focus here", "Not material", "Manageable with current savings"] }); }

// 14 temple
{ const s = S("Four pillars carry the regional growth strategy", "Strategy on a page");
  G.temple(s, { roof: "Leading regional snack player by 2030", base: "Enablers: talent · data · capital discipline", highlight: 1, pillars: [
    { label: "Win at home", text: "Defend share in core\nCut cost to serve 5%" }, { label: "Enter SE Asia", text: "Two markets via JV\nBreak-even in 30 months" },
    { label: "Go digital", text: "D2C channel\nData-driven pricing" }, { label: "Build brands", text: "Premium range\nHealth positioning" }] }); }

// 15 before-after
{ const s = S("The new model moves decisions closer to customers", "From today to target operating model");
  G.beforeAfter(s, { fromTitle: "Today", toTitle: "Target", rows: [
    { from: "Product silos with separate P&Ls", to: "Customer-segment teams with shared P&L", key: true },
    { from: "Monthly reporting from spreadsheets", to: "Live KPI dashboards" },
    { from: "Central pricing, quarterly", to: "Local pricing within guard-rails, weekly" },
    { from: "Headquarters approves all promotions", to: "Markets approve within budget" }] }); }

// 16 bar ranking
{ const s = S("We rank fourth of eight on cost per unit", "Cost per unit, US$, 2025", "Source: Benchmark study (illustrative)");
  G.barRanking(pres, s, { highlightLabel: "Us", data: [{ label: "Comp A", value: 82 }, { label: "Comp B", value: 88 }, { label: "Comp C", value: 91 }, { label: "Us", value: 95 }, { label: "Comp D", value: 99 }, { label: "Comp E", value: 104 }, { label: "Comp F", value: 110 }, { label: "Comp G", value: 118 }] }, { ...B, w: 8 });
  G.txt(s, "Gap to best-in-class is 13%, mostly in logistics and packaging.", B.x + 8.4, B.y + 0.3, 3.7, 1.5, { fontSize: 14 }); }

// 17 waterfall
{ const s = S("Price increases more than offset higher input costs", "EBIT bridge FY24 → FY25, US$ m", "Source: Finance (illustrative)");
  G.waterfall(pres, s, { steps: [{ label: "FY24 EBIT", value: 120, total: true }, { label: "Price", value: 28 }, { label: "Volume", value: -4 }, { label: "Input costs", value: -18 }, { label: "Savings", value: 9 }, { label: "FY25 EBIT", value: 135, total: true }] }); }

// 18 text columns
{ const s = S("Three capabilities set the leaders apart", "What top-quartile players do differently");
  G.textColumns(s, { highlight: 1, items: [
    { label: "Sharper pricing", text: "Price by store cluster, not nationally\nReview weekly with live data" },
    { label: "Faster innovation", text: "12-week concept-to-shelf cycle\nKill rate above 60%" },
    { label: "Leaner supply", text: "Fewer, larger suppliers\nShared logistics with partners" }] }); }

// 19 labelled rows (exec summary style)
{ const s = S("Executive summary: enter SE Asia through a JV, starting with Vietnam", null, null, { n: 5, current: 0 });
  G.labelledRows(s, { highlight: 4, items: [
    { label: "Home market", text: "Margins fell 3 points, mostly from price; growth headroom is limited" },
    { label: "Opportunity", text: "SE Asia snacks growing 9% a year; premium chilled 14%" },
    { label: "Where", text: "Vietnam and Indonesia score highest on attractiveness and ability to win" },
    { label: "How", text: "JV with a local distributor gives reach to 40k outlets from day one" },
    { label: "Decision", text: "Approve US$ 25 m and start partner talks in Q1" }] }); }

(async () => { await pres.writeFile({ fileName: "pattern-demo.pptx" }); await H.finalize("pattern-demo.pptx"); console.log("written"); })();
