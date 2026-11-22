// Test deck for patterns_story.js (illustrative data only)
const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const P = require("./patterns_story.js"); const H = G.HOUSE;
const pres = H.newDeck(pptxgen, "Story patterns — test deck"); const L = H.LAYOUT, B = G.BODY, SRC = "Source: illustrative data for layout review";
const S = (title, subtitle) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source: SRC }); return s; };
P.decisionFramework(S("Executive summary: a three-step answer to how we grow in China", "Decision framework form"), { goal: "Double China revenue by 2030",
  stages: [{ name: "Where to play", dims: ["Segment growth and margin", "City tiers", "Target customers"], solution: "Premium skin care, tier 1–2 cities, women 25–44" },
           { name: "What to offer", dims: ["Brand portfolio fit", "Price ladder", "Hero products"], solution: "Lead with two brands; one hero product each" },
           { name: "How to reach", dims: ["Channel economics", "Online platforms", "Peers' channel play"], solution: "Department stores first, Tmall flagship in year 1" }] });
P.storyDiagram(S("Executive summary: mid/high-end fridges in tier 3–4 cities online are the target", "Story diagram form"), {
  findings: [{ fact: "White goods growth slows; online is the only fast channel", implication: "We are late online: a crisis" }, { fact: "Mid/high-end share keeps climbing", implication: "We sit in the middle: move up" }, { fact: "Tier 3–4 cities grow fastest", implication: "Escape the tier 1–2 price war" }],
  target: "Target: mid/high-end refrigerators, online, tier 3–4 cities", strategies: ["Diversified brand promotion", "Customised mini fridges", "Online mall + offline experience"], next: ["Cash flow by initiative", "Channel and pricing system", "External risks"] });
P.pyramidSummary(S("Executive summary: launch and expand SU:M 37° in China within five years", "Pyramid form"), { main: "Launch and actively expand the premium brand in China",
  keys: [{ text: "China is the growth market we can't miss", supports: ["Sales potential unfulfilled", "Portfolio misses attractive segments"] }, { text: "Premium skin care is the segment to enter", supports: ["Niche large and growing", "Untapped by other Korean brands"] }],
  plan: "Capture 3% share in 5 years through stores and online together" });
P.letteredSummary(S("Executive summary: three conclusions, each one a section of the deck", "Lettered conclusions form"), { highlight: 2, items: [
  { conclusion: "Premium and mid-tier skin care outperform and suit entry", points: ["Market grows 9% a year; premium 15%", "Korean brands win in mid-tier colour"] },
  { conclusion: "Customers differ by age and income in price and channel", points: ["Targets live in eastern advanced cities", "Premium bought in department stores"] },
  { conclusion: "Build on the selected segments to expand", points: ["Focus premium skin care and mid-tier colour", "Set up R&D and manufacturing in China", "Department stores plus online"] }] });
P.evidencePanels(pres, S("Skin care is the largest segment, and premium grows fastest", "Evidence panels: numbered sub-findings + insights + so-what"), {
  panels: [{ headline: "Skin care is half the market and keeps its share", chart: { type: "stacked", labels: ["2010", "2015", "2020E"], series: [{ name: "Skin care", values: [100, 160, 250] }, { name: "Colour", values: [30, 50, 80] }, { name: "Hair", values: [50, 60, 70] }], highlight: 0 } },
           { headline: "Premium grows twice as fast as mass", chart: { type: "column", labels: ["Mass", "Mass-premium", "Premium"], series: [{ name: "CAGR %", values: [5, 9, 15] }], highlight: 2, format: "0\"%\"" } }],
  insights: ["Skin care is **the core** and keeps growing", "**Premium** grows at 15% a year", "Mass is maturing"], soWhat: "Our recommendation: enter through premium skin care" });
P.stackedCagr(pres, S("Within skin care, masks and anti-aging drive growth", "Stacked columns + two-period CAGR table"), { unit: "CNY bn", periods: ["2009", "2014", "2019E"],
  series: [{ name: "Cleansers", values: [20, 26, 30] }, { name: "Moisturisers", values: [40, 52, 60] }, { name: "Anti-aging", values: [15, 30, 55] }, { name: "Face masks", values: [5, 14, 30] }],
  cagr: { headers: ["09–14", "14–19"], rows: [["5%", "3%"], ["5%", "3%"], ["15%", "13%"], ["23%", "17%"]] }, highlight: 3 });
P.growthPairs(pres, S("China spends least per head but grows fastest", "Growth pairs with +% callouts"), { labels: ["China", "Taiwan", "Hong Kong", "Korea", "Japan"], a: { name: "2010", values: [24, 131, 236, 171, 279] }, b: { name: "2015", values: [36, 152, 302, 235, 285] }, highlight: 0 });
P.growthBars(pres, S("The market keeps growing, but more slowly each year", "History and forecast bars with a CAGR callout per period, CNY bn"), { labels: ["2013", "2014", "2015", "2016", "2017E", "2018E", "2019E"], values: [184, 226, 270, 312, 359, 380, 413], forecastFrom: 4, name: "Sales" });
P.donutKpis(pres, S("Quality worries keep premium buyers offline", "Donut KPIs from a survey (N=215)"), { highlight: 0, items: [{ value: 72, label: "Buy premium offline", note: "Quality guaranteed in stores" }, { value: 53, label: "Mix online and offline", note: "Mid-tier buyers" }, { value: 31, label: "Online only", note: "Mostly under 25" }] });
P.positioningMap(S("Our brand sits mid-market while the growth is in premium", "Positioning map with target zone"), { x: { label: "Price position", low: "Mass", high: "Premium" }, y: { label: "Brand awareness", low: "Low", high: "High" }, highlight: "Our brand",
  zone: { x0: 0.65, x1: 1, y0: 0.5, y1: 1, label: "Target zone" }, points: [{ label: "Our brand", x: 0.45, y: 0.55, size: 4 }, { label: "Rival A", x: 0.8, y: 0.85, size: 9 }, { label: "Rival B", x: 0.3, y: 0.7, size: 6 }, { label: "Rival C", x: 0.7, y: 0.4, size: 3 }, { label: "Rival D", x: 0.15, y: 0.25, size: 2 }] });
P.personaCards(S("Four customer groups, each with its own reason to buy", "Persona cards"), { highlight: 1, rowLabels: ["Age", "Income / month", "Needs", "Buys because"], personas: [
  { name: "Miss Mystery", rows: { "Age": "15–25", "Income / month": "< 5k", "Needs": ["Young", "Stylish"], "Buys because": ["Campaigns", "Fair price"] } },
  { name: "Office Lady", rows: { "Age": "25–40", "Income / month": "8–20k", "Needs": ["Professional", "Decent"], "Buys because": ["Office occasions", "Proven effect"] } },
  { name: "Madame Gorgeous", rows: { "Age": "40+", "Income / month": "> 20k", "Needs": ["Elegant", "Regenerating"], "Buys because": ["Friends' advice", "Top quality"] } },
  { name: "Charming Gentleman", rows: { "Age": "40+", "Income / month": "> 20k", "Needs": ["Mature", "Charming"], "Buys because": ["Good taste", "Efficiency"] } }] });
P.customerJourney(S("Each customer group decides at a different moment of the journey", "Customer journey"), { highlightStage: 2, stages: ["Need", "Search", "Trigger", "Purchase", "Share"], lanes: [
  { label: "Miss Mystery", cells: [null, "Social networks", "Celebrity & shows", "Easy mobile pay", "Instant SNS post"] },
  { label: "Office Lady", cells: [null, "Colleagues", "Anti-aging concept", "Trial & treatment", null] },
  { label: "Madame Gorgeous", cells: [null, "Friends", "Extreme quality", "Tailored plan", null], key: [2] },
  { label: "Online", cells: ["Ads", "Search & reviews", "Flash sales", "Tmall / JD", "Reviews"] },
  { label: "Offline", cells: [null, "Counters", "Beauty advisor", "Department store", "Member events"] }] });
P.issueGoalStrategy(S("Three customer questions set our goals and strategies", "Issue (question) → goal → strategy"), { highlight: 0, columns: [
  { issue: "Do customers know our brand?", goal: "Build a premium image that earns recognition", strategy: "Flagship stores in prime locations, step by step" },
  { issue: "Do they buy our products?", goal: "Grow the customer base fast", strategy: "Tmall and JD flagship stores with deep cooperation" },
  { issue: "Do they stay with us?", goal: "Build loyalty and word of mouth", strategy: "O2O brand community with one membership" }] });
P.chartTakeaway(pres, S("Offline still sells 70%, but online wins the young", "Chart → chevron → takeaway"), { headline: "Online is small but young buyers are there", chart: { type: "pie", labels: ["15–25", "26–30", "31–35", "35+"], series: [{ name: "Online buyers", values: [82, 12, 4, 2] }], highlight: 0 },
  takeaway: ["Most cosmetics still sell offline", "Online growth is slowing", "But online reaches 15–25s, one of our target groups"] });
(async () => { await pres.writeFile({ fileName: "/tmp/story-demo.pptx" }); await H.finalize("/tmp/story-demo.pptx"); console.log("ok"); })();
