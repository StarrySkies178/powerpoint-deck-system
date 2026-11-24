// Deck 1 (roadmap step 1.5, real deck task): board paper, English, 12 slides.
// Brief: should a mid-size Thai specialty coffee chain enter Vietnam in 2027? Chart-heavy: market, competitors,
// entry options, financial case, recommendation. ALL COMPANIES AND FIGURES ARE FICTIONAL (said on every source line).
const path = require("path");
const ROOT = process.env.DECK_ROOT || "/home/claude/wt";
const pptxgen = require("pptxgenjs");
const G = require(path.join(ROOT, "Generators/patterns.js")), P = require(path.join(ROOT, "Generators/patterns_story.js"));
const H = G.HOUSE, { C } = G, L = H.LAYOUT, B = G.BODY;
const pres = H.newDeck(pptxgen, "Doi Sky Coffee: Vietnam entry 2027 (board paper)");
const SRC = "Source: fictional company, competitors and figures, written for illustration; not real market data";
const SECTIONS = ["Market", "Competition", "Entry option", "Financial case"];
const S = (sec, title, src = SRC) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, crumb: sec == null ? undefined : { items: SECTIONS, current: sec }, source: src }); return s; };
const col = (name, labels, values, hi, format) => ({ type: "column", labels, series: [{ name, values }], highlight: hi, format });
const bar = (name, labels, values, hi, format) => ({ type: "bar", labels, series: [{ name, values }], highlight: hi, format });
const PHOTO = { path: path.join(ROOT, "Objects/Visual/photos/hcmc-skyline-day.jpg"), w: 8000, h: 3579 };

// 1 Cover
P.photoCover(pres, { photo: PHOTO, title: "Vietnam can add THB 1.1 bn of revenue by 2031 if we enter in 2027 through a master franchise", subtitle: "Doi Sky Coffee · Board of Directors · Market entry decision", date: "November 2026 · Fictional case for illustration", credit: "Photo: Ho Chi Minh City skyline, Pimnl, CC0" });

// 2 Executive summary
P.letteredSummary(S(null, "Executive summary: enter Vietnam in 2027 through a master franchise with Saigon Bean Co., Ho Chi Minh City first", SRC), { highlight: 3,
  projection: { title: "The case in numbers", items: [{ label: "Revenue in 2031", value: "THB 1.1 bn" }, { label: "Our capital at risk", value: "THB 85 m" }, { label: "Break-even", value: "2029" }],
    risks: { title: "Main risks", items: ["Partner under-delivers stores", "Price war in premium", "Coffee bean cost spike"] } }, items: [
  { conclusion: "Vietnam's specialty coffee market grows twice as fast as Thailand's", points: ["US$ 0.8 bn today, US$ 1.85 bn by 2030: 15% a year against 7% at home", "Urban 18 to 35 year olds drive it and pay up for single-origin coffee"] },
  { conclusion: "The premium tier is open: mass is taken, premium has no leader", points: ["Two chains hold 61% of mass-market cafés; no premium brand has 15%", "Ho Chi Minh City holds half of premium demand"] },
  { conclusion: "A master franchise beats a joint venture and our own stores", points: ["Fastest to 60 stores (2.5 years) with the least capital (THB 85 m)", "Saigon Bean Co. brings sites, staff and permits"] },
  { conclusion: "Approve THB 85 m and sign the term sheet by March 2027", points: ["Break-even in 2029; THB 1.1 bn system revenue and THB 119 m operating profit for us in 2031", "Two gates cap the loss at THB 30 m if the pilot misses"] }] });

// 3 A1 market size and growth
P.composeSlide(pres, S(0, "Vietnam's specialty coffee market grows about 15% a year to US$ 1.85 bn by 2030, twice the pace of our home market"), { layout: "HALF2", panels: [
  { icon: "trending-up", headline: "The market more than doubles by 2030", unit: "Vietnam specialty coffee sold in cafés, US$ m; growth per year by period",
    draw: (s, b) => P.growthBars(pres, s, { labels: ["2022", "2024", "2026", "2028F", "2030F"], values: [620, 810, 1060, 1400, 1850], forecastFrom: 3, name: "Market, US$ m" }, b),
    reading: ["**About 15% a year** to 2030, against 7% in Thailand", "Café spend per urban adult **doubles** from US$ 21 (2024) to US$ 44 (2030), still below Thailand's US$ 55", "Growth holds in the forecast as incomes rise"] },
  { icon: "coffee", headline: "Single-origin and cold brew grow fastest", unit: "Specialty coffee by segment, US$ m; growth per year by period",
    draw: (s, b) => P.stackedCagr(pres, s, { unit: "US$ m", periods: ["2022", "2026", "2030F"], series: [{ name: "Espresso drinks", values: [360, 500, 700] }, { name: "Cold brew", values: [150, 310, 550] }, { name: "Single-origin", values: [110, 250, 600] }],
      cagr: { headers: ["22–26", "26–30"], rows: [["9%", "9%"], ["20%", "15%"], ["23%", "24%"]] }, highlight: 2 }, b),
    reading: ["**Single-origin** grows 23 to 24% a year: our strongest range", "Its share rises from 18% to **32%** of the market by 2030", "Cold brew is the second engine"] }] });

// 4 A2 customers
P.composeSlide(pres, S(0, "Urban customers aged 18 to 35 drive the growth, and they choose cafés on coffee quality before price"), { layout: "GRID4I", panels: [
  { icon: "users", headline: "Two thirds of specialty spend comes from 18 to 35 year olds", unit: "Share of specialty café spend by age, Ho Chi Minh City and Hanoi, %",
    chart: col("Share of spend, %", ["18–24", "25–35", "36–45", "46+"], [24, 42, 21, 13], 1), readingSide: "right", readingShare: 0.38,
    reading: ["**25 to 35** is the largest group: office workers", "Under 25s visit most often but spend less"] },
  { icon: "list-check", headline: "Coffee quality is the first reason to choose a café", unit: "Top reason to choose a specialty café, % of respondents (fictional survey, n = 800)",
    chart: col("Top reason, %", ["Quality", "Workspace", "Price", "Location", "Brand"], [38, 22, 17, 14, 9], 0), readingSide: "right", readingShare: 0.38,
    reading: ["**Quality** beats price two to one", "A place to work is the second reason"] },
  { icon: "cash", headline: "They already pay a third more for single-origin cups", unit: "Average price per cup in specialty cafés, VND thousand",
    chart: col("Price per cup, VND k", ["Mass chain", "Premium chain", "Single-origin"], [45, 62, 78], 2), readingSide: "right", readingShare: 0.38,
    reading: ["Single-origin sells at **VND 78k**, 26% above premium chains", "Our Thai menu prices sit at VND 70k to 85k"] }],
  insights: ["Our core customer (**25 to 35, urban**) is the largest group", "They choose on **quality**, where we are strongest", "Our prices already fit what they pay today"],
  soWhat: "Our proposition travels without changing the menu" });

// 5 B1 competitors
P.composeSlide(pres, S(1, "The premium tier has no leader: two chains hold 61% of mass-market cafés, but no premium brand has 15%"), { layout: "HALF2", panels: [
  { icon: "target", headline: "Premium is fragmented while mass is taken", unit: "Price position and store count; bubble = revenue 2025 (fictional chains)",
    draw: (s, b) => P.positioningMap(s, { x: { label: "Price position", low: "Mass", high: "Premium" }, y: { label: "Number of stores", low: "Few", high: "Many" }, highlight: "Doi Sky (2027)",
      zone: { x0: 0.6, x1: 1, y0: 0, y1: 0.66, label: "Open space" }, points: [{ label: "Brew Republic", x: 0.2, y: 0.88, size: 9 }, { label: "Lantern Coffee", x: 0.3, y: 0.7, size: 6 },
        { label: "Red Clay Roasters", x: 0.64, y: 0.24, size: 2 }, { label: "Saigon Drip", x: 0.72, y: 0.08, size: 1.5 }, { label: "Doi Sky (2027)", x: 0.92, y: 0.42, size: 1 }] }, b),
    reading: ["Brew Republic and Lantern Coffee hold **61%** of mass stores", "Red Clay Roasters, the largest premium chain, has **under 15%** of premium", "We would enter where nobody leads"] },
  { icon: "chart-bar", headline: "No premium chain has more than 40 stores", unit: "Stores by chain, end of 2025 (fictional chains)",
    chart: bar("Stores", ["Others (premium)", "Saigon Drip", "Red Clay Roasters", "Bean Street", "Lantern Coffee", "Brew Republic"], [95, 22, 38, 140, 260, 420], 2), readingSide: "right", readingShare: 0.36,
    reading: ["The premium leader runs **38 stores**", "60 stores by 2029 would make us number one in premium", "Mass chains are not moving up: their menus stay below VND 50k"] }] });

// 6 B2 where to play: map + city table
P.composeSlide(pres, S(1, "Hence we start in Ho Chi Minh City: it holds half of premium demand and needs only 25 stores to reach scale", SRC + "; Map: Natural Earth"), { layout: "HALF2", panels: [
  { icon: "map-pin", headline: "Two cities hold 72% of premium demand", unit: "Premium café demand by city, share of national total, 2025",
    map: { geo: "adm1:VNM", highlight: ["Ho Chi Minh"], colors: { "Hanoi": "00A1DE", "Da Nang": "B4B4B4" }, labels: false, legend: false,
      markers: [{ name: "Ho Chi Minh", label: "Ho Chi Minh City, 51%", hi: true }, { name: "Hanoi", label: "Hanoi, 21%" }, { name: "Da Nang", label: "Da Nang, 6%" }] },
    reading: ["**Ho Chi Minh City alone** is half the premium market", "Hanoi follows in year 2, Da Nang in year 3"] },
  { icon: "building-store", headline: "Ho Chi Minh City reaches scale with the fewest stores", unit: "City facts, 2025, and stores needed for 10% of premium demand",
    draw: (s, b) => G.table(s, { form: "marks", header: ["City", "Premium demand", "Growth a year", "Stores for 10%", "Wave"], colW: [0.27, 0.27, 0.15, 0.16, 0.15], highlightRow: 0, rows: [
      ["Ho Chi Minh City", { text: "US$ 540 m", bar: 1 }, "15%", "25", "1 (2027)"], ["Hanoi", { text: "US$ 220 m", bar: 220 / 540 }, "13%", "14", "2 (2028)"], ["Da Nang", { text: "US$ 65 m", bar: 65 / 540 }, "17%", "6", "3 (2029)"], ["Other cities", { text: "US$ 225 m", bar: 225 / 540 }, "11%", "40+", "Later"]] }, b),
    reading: ["**25 stores** give 10% of the largest market", "Hanoi needs a second supply route: wave 2", "Other cities stay out until 2030"] }] });

// 7 C1 entry options (the decision slide of this block: one scoring table)
P.composeSlide(pres, S(2, "Therefore we recommend a master franchise: it beats a joint venture and our own stores on speed, capital and risk"), { layout: "L2R1", panels: [
  { icon: "clock", headline: "A franchise reaches 60 stores two years sooner", unit: "Years to 60 stores", chart: bar("Years to 60 stores", ["Own stores", "Joint venture", "Master franchise"], [4.5, 3.5, 2.5], 2, "0.0"),
    reading: ["Saigon Bean Co. opens stores **in parallel** in two cities"] },
  { icon: "coins", headline: "It needs a third of the capital of our own stores", unit: "Our capital needed to 2030, THB m", chart: bar("Capital, THB m", ["Own stores", "Joint venture", "Master franchise"], [260, 140, 85], 2),
    reading: ["**THB 85 m** for training, brand launch and the roastery stake"] },
  { icon: "clipboard-check", headline: "Only the franchise scores 3 or more on every board criterion", unit: "Score 0 to 4 against the board's five criteria",
    draw: (s, b) => P.scoringTable(s, { columns: [{ name: "Own stores" }, { name: "Joint venture" }, { name: "Master franchise", own: true }],
      rows: [{ label: "Speed to scale", scores: [1, 2, 4] }, { label: "Capital needed", scores: [1, 2, 4] }, { label: "Brand control", scores: [4, 3, 3] }, { label: "Downside risk", scores: [1, 2, 3] }, { label: "Local know-how", scores: [1, 3, 4] }],
      verdict: ["Too slow", "Too costly", "Recommended"] }, b),
    reading: ["Own stores keep full control but take **4.5 years** and THB 260 m", "A joint venture splits decisions 50/50 on every site", "The franchise gives up some control, kept by our **brand manual and audits**"] }] });

// 8 C2 operating model and phases
P.composeSlide(pres, S(2, "The partner runs the stores while we keep the brand, the menu and the beans, and roasting moves to Vietnam once volume allows"), { layout: "BAND2", panels: [
  { icon: "route", headline: "Three phases from pilot to national roll-out, each opened by a gate",
    draw: (sl, b) => G.chevronProcess(sl, { highlight: 0, items: [{ label: "Pilot 2027", text: "5 stores in District 1 and 3; menu and price test" }, { label: "Scale 2028", text: "25 stores in Ho Chi Minh City; Hanoi opens" }, { label: "National 2029+", text: "60 stores; Da Nang; local roastery" }],
      result: { label: "Gates", text: "Gate 1 after the pilot; gate 2 at 25 stores" } }, b) },
  { icon: "package", headline: "Roasting moves to Vietnam when volume passes 150 tonnes a year", unit: "Green coffee volume, tonnes a year",
    chart: col("Volume, tonnes", ["2027", "2028", "2029", "2030", "2031"], [18, 70, 150, 220, 290], 2), readingSide: "right", readingShare: 0.45,
    reading: ["Until 2029 we ship **roasted beans from Chiang Mai**", "At 150 tonnes a local roastery saves **9 points** of cost of goods", "We keep the green coffee contracts and the recipes"] }] });

// 9 D1 financial case
P.composeSlide(pres, S(3, "The franchise route reaches THB 1.1 bn of system revenue by 2031 and breaks even for us in 2029"), { layout: "HALF2", panels: [
  { icon: "chart-bar", headline: "System revenue passes THB 1 bn in 2031", unit: "Store revenue of the Vietnam system, THB m",
    chart: col("Revenue, THB m", ["2027", "2028", "2029", "2030", "2031"], [60, 280, 560, 830, 1100], 4),
    reading: ["Store count **5 → 60**, sales per store THB 18 m a year", "Our income is royalty (6%), bean sales and the roastery margin"] },
  { icon: "pig-money", headline: "Our cumulative cash turns positive in 2030", unit: "Doi Sky cumulative cash flow from Vietnam, THB m",
    chart: { type: "line", labels: ["2027", "2028", "2029", "2030", "2031"], series: [{ name: "Cumulative cash, THB m", values: [-45, -75, -62, 4, 96] }], highlight: 0 },
    reading: ["Peak cash need **THB 75 m** in 2028, within the THB 85 m asked", "**Break-even 2029**, payback in year four; IRR 27%", "A one-year delay moves payback to 2031 and IRR to 18%"] }] });

// 10 D2 value bridge + assumptions
P.composeSlide(pres, S(3, "Three levers build the 2031 profit, and the case still pays back if sales per store come in 20% lower"), { layout: "L2R1", regions: (() => { const B = G.BODY, g = 0.3, half = (B.w - g) / 2, h1 = (B.h - g) * 0.44; return [{ x: B.x, y: B.y, w: half, h: h1 }, { x: B.x, y: B.y + h1 + g, w: half, h: B.h - h1 - g }, { x: B.x + half + g, y: B.y, w: half, h: B.h }]; })(), panels: [
  { icon: "chart-bar", headline: "Store count is the largest lever", unit: "Doi Sky operating profit from Vietnam, 2027 to 2031, THB m",
    draw: (s, b) => G.waterfall(pres, s, { steps: [{ label: "2027", value: -40, total: true }, { label: "Stores", value: 92 }, { label: "Bean sales", value: 61 }, { label: "Roastery", value: 38 }, { label: "Overheads", value: -32 }, { label: "2031", value: 119, total: true }] }, b),
    reading: ["Royalties from **60 stores** add THB 92 m", "Bean sales and the roastery add THB 99 m"] },
  { readingSide: "right", readingShare: 0.24, icon: "scale", headline: "Payback holds in the downside", unit: "Effect on payback year and IRR",
    draw: (s, b) => G.table(s, { form: "ruled", header: ["Case", "Payback", "IRR"], colW: [0.5, 0.27, 0.23], highlightRow: 0, rows: [["Base", "2030", "27%"], ["Sales per store −20%", "2031", "17%"], ["40 stores, not 60", "2031", "15%"], ["Bean cost +30%", "2030", "22%"]] }, b),
    reading: ["Every downside still **pays back by 2031**"] },
  { icon: "clipboard-check", headline: "Three assumptions carry the case, and the pilot tests each before gate 1", unit: "Base case, break-even value and how the pilot tests it",
    draw: (s, b) => G.table(s, { form: "rowblocks", header: ["Assumption", "Base case", "Break-even at", "Pilot test"], colW: [0.29, 0.19, 0.19, 0.33], highlightRow: 0, rows: [
      ["Sales per store", "THB 18 m", "THB 12 m", "Five pilot stores, 9 months of sales"], ["Stores opened by 2029", "60", "38", "Partner's site pipeline signed by gate 1"], ["Premium price accepted", "VND 70k–85k", "VND 58k", "Menu price test in District 1"]] }, b) }] });

// 11 D3 risks
P.riskMatrix(S(3, "Three risks are both likely and costly and need action before signing; the two gates cap our loss at THB 30 m"), { risks: [
  { id: 1, name: "Partner opens stores too slowly", x: 0.8, y: 0.7, mitigation: ["Store targets in the contract", "Step-in right after 2 misses"] },
  { id: 2, name: "Price war in premium", x: 0.75, y: 0.55, mitigation: ["Compete on single-origin, not price", "Loyalty app from day one"] },
  { id: 3, name: "Green bean cost spike", x: 0.6, y: 0.75, mitigation: ["12-month forward contracts", "Menu price review twice a year"] },
  { id: 4, name: "Currency moves (THB/VND)", x: 0.4, y: 0.45, mitigation: ["Royalties in VND, costs hedged"] },
  { id: 5, name: "Food licence delays", x: 0.3, y: 0.35, mitigation: ["Partner holds the licences"] }] }, { ...B, h: B.h - 1.0 });
P.readingBox(pres.slides[pres.slides.length - 1], ["Risks **1 to 3** sit in the priority zone: each has an owner and a deadline before signing", "Risks 4 and 5 are covered by the contract and the partner's licences", "If the pilot misses gate 1, the loss stops at **THB 30 m**"], { x: B.x, y: B.y + B.h - 0.86, w: B.w, h: 0.86 });

// 12 Decision
{ const s = pres.addSlide({ masterName: L.statementDark });
  s.addText("Decision today: approve THB 85 m and sign the master franchise term sheet with Saigon Bean Co. by March 2027", { placeholder: "statement" });
  s.addText("Next: term sheet negotiation (Dec), pilot sites (Q1 2027), gate 1 review (Q4 2027). Fictional case for illustration.", { placeholder: "support" }); }

const out = process.argv[2] || "/home/claude/decks/deck1.pptx";
(async () => { await pres.writeFile({ fileName: out }); await H.finalize(out); console.log("written", out); })();
