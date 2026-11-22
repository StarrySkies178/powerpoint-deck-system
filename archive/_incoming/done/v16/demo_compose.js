// Test deck: one slide per composition layout learned from the case decks (illustrative data)
const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const P = require("./patterns_story.js"); const H = G.HOUSE;
const pres = H.newDeck(pptxgen, "Slide composition — test deck"); const L = H.LAYOUT, SRC = "Source: illustrative data for layout review";
const S = (title, subtitle) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source: SRC }); return s; };
const col = (name, labels, values, hi) => ({ type: "column", labels, series: [{ name, values }], highlight: hi });
const yrs = ["2019", "2020", "2021", "2022", "2023"];
P.composeSlide(pres, S("Skin care drives the market, and premium grows twice as fast as mass", "HALF2 — two exhibits side by side, each with a numbered sentence sub-headline"), { layout: "HALF2", panels: [
  { headline: "Skin care is half of the market and keeps its share", chart: { type: "stacked", labels: yrs, series: [{ name: "Skin care", values: [100, 112, 125, 140, 156] }, { name: "Colour", values: [40, 44, 47, 52, 55] }, { name: "Hair", values: [50, 51, 52, 53, 54] }], highlight: 0 } },
  { headline: "Premium skin care grows 15% a year, mass only 5%", chart: col("CAGR %", ["Mass", "Mass-premium", "Premium"], [5, 9, 15], 2) }] });
P.composeSlide(pres, S("Young urban women drive growth, and they buy online", "GRID4I — three exhibits + the insight cell in the last (bottom-right) position"), { layout: "GRID4I", panels: [
  { headline: "Women aged 25–34 are the largest buyer group", chart: { type: "bar", labels: ["<25", "25–34", "35–44", "45+"], series: [{ name: "Share %", values: [18, 38, 27, 17] }], highlight: 1 } },
  { headline: "Tier-1 and 2 cities hold 60% of spend", chart: { type: "pie", labels: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"], series: [{ name: "Spend", values: [34, 26, 24, 16] }], highlight: 0 } },
  { headline: "Online share doubled in four years", chart: col("Online share %", yrs, [14, 19, 24, 28, 31], 4) }],
  insights: ["The core buyer is **25–34, urban, online**", "Spend concentrates in **tier 1–2**", "Online is now **a third** of sales"], soWhat: "Target urban women 25–34 through online first" });
P.composeSlide(pres, S("We trail both rivals online, and the gap is widening", "BAND2 — two horizontal bands, each a full-width exhibit"), { layout: "BAND2", panels: [
  { headline: "Our online share is a third of the leaders'", chart: { type: "bar", labels: ["Rival A", "Rival B", "Us"], series: [{ name: "Online share %", values: [38, 31, 11] }], highlight: 2 } },
  { headline: "The gap grew every year since 2019", chart: { type: "line", labels: yrs, series: [{ name: "Rival A", values: [22, 26, 30, 34, 38] }, { name: "Us", values: [8, 9, 10, 10, 11] }], highlight: 1 } }] });
P.composeSlide(pres, S("Premium is where the profit is, and Korean brands are winning it", "T2B1 — two exhibits on top + one wide exhibit below"), { layout: "T2B1", panels: [
  { headline: "Premium earns 2.4× the margin of mass", chart: col("Margin %", ["Mass", "Mid", "Premium"], [12, 19, 29], 2) },
  { headline: "Korean brands took 9 points of premium share", chart: col("Share gain, pts", ["EU", "US", "JP", "KR"], [-4, -3, -2, 9], 3) },
  { headline: "Premium grows fastest in every city tier", chart: { type: "column", labels: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"], series: [{ name: "Mass", values: [4, 5, 6, 7] }, { name: "Premium", values: [12, 14, 17, 19] }], highlight: 1 } }] });
P.composeSlide(pres, S("Consumers move online, so we must follow them", "EXI — exhibits stacked on the left, insights and the so-what in a right-hand column"), { layout: "EXI", panels: [
  { headline: "Online is the only channel still growing", chart: { type: "stacked", labels: yrs, series: [{ name: "Offline", values: [80, 76, 72, 68, 64] }, { name: "Online", values: [20, 24, 28, 32, 36] }], highlight: 1 } },
  { headline: "Mobile is now 80% of online orders", chart: col("Mobile share %", yrs, [52, 61, 70, 76, 80], 4) }],
  insights: ["Online grows **+15% a year**, offline shrinks", "Mobile dominates: **design for phones first**"], soWhat: "Shift 30% of the media budget to mobile channels" });
P.composeSlide(pres, S("Tier-1 cities: AMOREPACIFIC enters as a luxury brand through boutiques", "CHAIN — evidence → chevron → decision, tactics below"), { layout: "CHAIN",
  panels: [{ headline: "Tier-1 shoppers pay for boutique service", chart: col("Stores per brand", ["Tier 1", "Tier 2", "Tier 3"], [22, 9, 3], 0) }],
  decision: { label: "Geography strategy", text: "Focus on tier-1 cities as a luxury brand" },
  tactics: [{ title: "Flagship store", text: "Three boutiques in Shanghai, Beijing and Shenzhen" }, { title: "Beauty parlour", text: "VIP treatments with skin analysis" }, { title: "Bestie marketing", text: "Bring-a-friend events and referral gifts" }] });
P.composeSlide(pres, S("Policy changes open the market to imported premium brands", "FLOW — cause on the left, arrow, effect on the right"), { layout: "FLOW", panels: [
  { headline: "What changed", bullets: ["Import tariff cut from 5% to 2%", "Animal-testing rule relaxed for imports", "Cross-border e-commerce allowed"] },
  { headline: "What it means for us", bullets: ["Imported price gap shrinks by a third", "Faster launch: no local testing needed", "Online can sell before stores open"] }] });
P.composeSlide(pres, S("Three channels each play a different role in the journey", "COL3 — three parallel columns"), { layout: "COL3", panels: [
  { headline: "Department stores build the brand", chart: col("Share of premium %", ["2019", "2023"], [46, 41], 0) },
  { headline: "Tmall converts the search", chart: col("Share of online %", ["2019", "2023"], [48, 55], 1) },
  { headline: "Social media starts the need", chart: col("First touch %", ["2019", "2023"], [18, 37], 1) }] });
(async () => { await pres.writeFile({ fileName: "/tmp/compose-demo.pptx" }); await H.finalize("/tmp/compose-demo.pptx"); console.log("ok"); })();
