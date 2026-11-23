// Test deck for what was learned from the 2019-20 case decks (illustrative data; no client or firm names)
const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const P = require("./patterns_story.js"); const H = G.HOUSE;
const pres = H.newDeck(pptxgen, "Case decks 2019-20 — test deck"); const L = H.LAYOUT, SRC = "Source: illustrative data for layout review";
const S = (title, subtitle) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source: SRC }); return s; };
const B = G.BODY, yrs = ["2020", "2021", "2022", "2023", "2024"];

// 1. T3B1 exec summary: situation boxes -> answer band
P.composeSlide(pres, S("We should grow through new stores, better service and a loyalty system, adding ~500m by 2024", "T3B1 — three situation boxes on top, the answer below (situation → pillars → outcome)"), { layout: "T3B1", numbered: true, panels: [
  { headline: "Market keeps growing after the dip", bullets: ["+12% a year to 2024", "Specialty formats take share"] },
  { headline: "Customers want variety and service", bullets: ["5 personas, 2 matter most", "Coach quality is the top criterion"] },
  { headline: "We win on coaches, lose on coverage", bullets: ["Few stores outside tier 1", "Course range is narrow"] },
  { headline: "Three pillars lift customers and spend per customer", draw: (s, b) => P.initiativeMatrix(s, { rows: ["What", "Outcome"], columns: [
    { letter: "A", title: "Store expansion", cells: ["220 stores in 20 cities, two operating models", "More customers"] },
    { letter: "B", title: "Service improvement", cells: ["Recruit, train and develop coaches; new course pipeline", "Higher spend per customer"] },
    { letter: "C", title: "Customer management", cells: ["Community + CRM for retention", "Higher retention"] }], highlight: 0 }, b) }] });

// 2. agenda tracker
P.agendaTracker(S("Agenda", "agendaTracker — repeated before each section, current one highlighted"), { current: 1, sections: [
  { title: "Market overview" }, { title: "Growth strategy", items: ["Store expansion", "Service improvement", "Customer management"] }, { title: "Implementation" }, { title: "Appendix" }] });

// 3. value tree
P.valueTree(S("The 224 new stores come from three multipliers, each tied to one initiative", "valueTree — how the target number is built, leaf → initiative"), { root: { label: "new stores by 2024", value: "224" }, op: "×",
  leaves: [{ label: "Target cities", value: "27 tier-1/1.5 cities", initiative: "City prioritisation by score", hi: true }, { label: "Stores per city", value: "≈ 6", initiative: "Four store formats per city" }, { label: "Format fit", value: "1.4 formats / city", initiative: "Upgrade existing stores first" }] }, B);

// 4. heat grid
P.heatGrid(S("Young professionals in tier-1 cities are the core segment for group classes", "heatGrid — segment × need, target cells boxed"), {
  rows: [{ label: "Students", group: "Age <25" }, { label: "Young professionals", group: "Age 25-35" }, { label: "Young parents", group: "Age 25-35" }, { label: "Mid-career", group: "Age 35+" }],
  cols: ["Shape", "Health", "Social", "Stress relief", "Skill"], values: [[12, 4, 9, 3, 6], [21, 13, 17, 14, 5], [8, 11, 4, 9, 2], [5, 16, 3, 7, 2]],
  target: [[1, 0], [1, 2]], format: (v) => v + "%" }, B);

// 5. scoring table
P.scoringTable(S("We lead on coach quality but trail rivals on coverage and course range", "scoringTable — Harvey balls, own column in a dashed box, verdict row"), {
  columns: [{ name: "Us", own: true }, { name: "Rival A" }, { name: "Rival B" }, { name: "Rival C" }],
  rows: [{ label: "Coach quality", group: "Product", scores: [4, 3, 2, 2] }, { label: "Course range", group: "Product", scores: [1, 3, 4, 2] },
    { label: "Store coverage", group: "Access", scores: [1, 2, 4, 3] }, { label: "Price flexibility", group: "Access", scores: [3, 3, 2, 4] },
    { label: "Community", group: "Brand", scores: [3, "✓", "✗", 2] }], verdict: ["Fix coverage", "", "", ""] }, B);

// 6. explodedBar
P.explodedBar(pres, S("Nine in ten respondents work out, and most do it to keep in shape", "explodedBar — one segment of a stacked column broken down"), {
  unit: "%", total: { label: "Respondents", parts: [{ name: "Never", value: 7 }, { name: "Work out", value: 93 }], explode: 1 },
  breakdown: { title: "Why they work out (% of those who do)", labels: ["Keep in shape", "Be healthy", "Burn fat", "Relieve stress", "Socialise"], values: [71, 70, 58, 33, 6], highlight: 0, format: "0\"%\"" } }, B);

// 7. risk matrix
P.riskMatrix(S("Four risks need action now; the rest we monitor", "riskMatrix — numbered risks, priority zone, same numbers in the mitigation list"), { risks: [
  { id: 1, name: "Not enough qualified coaches", x: 0.8, y: 0.85, mitigation: ["Own coach academy", "Career paths and incentives"] },
  { id: 2, name: "New stores cannibalise old ones", x: 0.65, y: 0.62, mitigation: ["Minimum distance rule", "Different format per catchment"] },
  { id: 3, name: "Local competitors react", x: 0.85, y: 0.55, mitigation: ["Enter with a partner", "Price promotions at launch"] },
  { id: 4, name: "Demand falls in a downturn", x: 0.3, y: 0.35, mitigation: ["Online classes as a buffer"] },
  { id: 5, name: "Data system delays", x: 0.2, y: 0.7, mitigation: ["Phase the CRM build"] }] }, B);

// 8. gantt with phases
P.gantt(S("Stabilise in year one, then scale stores and the community", "gantt — phase staircase over workstream bars, priority bars in the main colour"), { periods: yrs,
  phases: [{ label: "Stabilise", sub: "0-1 year", from: 0, to: 1 }, { label: "Revitalise", sub: "1-3 years", from: 1, to: 3 }, { label: "Scale", sub: "3-5 years", from: 3, to: 5 }],
  groups: [{ name: "A  Store expansion", rows: [{ label: "Assess sites", from: 0, to: 1, hi: true }, { label: "Tier-1 cities", from: 0.5, to: 3, hi: true, milestone: 3 }, { label: "Tier-1.5 cities", from: 2, to: 5 }] },
    { name: "B  Service", rows: [{ label: "Coach academy", from: 0, to: 2, hi: true }, { label: "New courses", from: 1, to: 5 }] },
    { name: "C  Customer management", rows: [{ label: "Community", from: 0.5, to: 2 }, { label: "CRM", from: 1.5, to: 4, milestone: 4 }] }] }, B);

// 9. FLOW with 3 blocks + COL4 + panel takeaway
P.composeSlide(pres, S("From the target pool to 36 priority cities in two screens", "FLOW (3 blocks) — chevrons between steps"), { layout: "FLOW", panels: [
  { headline: "Target pool", bullets: ["61 cities with stores", "277 white-space cities"] },
  { headline: "Screen on attractiveness and feasibility", bullets: ["Urban population and income", "Rival presence", "Ease of operating"] },
  { headline: "Priority list", bullets: ["10 cities with stores to densify", "26 new cities to enter"] }] });
P.composeSlide(pres, S("Four initiatives improve every step of the customer journey", "COL4 — four parallel initiative columns"), { layout: "COL4", panels: [
  { headline: "Celebrity and creators", bullets: ["Ambassador + 3 creators", "Traffic to stores"] }, { headline: "Sales-assistant CRM", bullets: ["Train staff", "Keep in touch"] },
  { headline: "Co-design programme", bullets: ["Customers vote designs", "Limited editions"] }, { headline: "Aftercare", bullets: ["Free polishing", "Repeat visits"] }] });
P.composeSlide(pres, S("The market grows again and demand moves to specialty formats", "HALF2 with a takeaway box under each exhibit"), { layout: "HALF2", panels: [
  { headline: "Market grows 12% a year after the dip", chart: { type: "column", labels: yrs, series: [{ name: "Market", values: [42, 80, 105, 130, 160] }], highlight: 4 }, takeaway: "Strong growth after 2021: room for more stores" },
  { headline: "Specialty formats double their share", chart: { type: "stacked100", labels: ["2015", "2019", "2024"], series: [{ name: "Traditional", values: [80, 65, 50] }, { name: "Specialty", values: [20, 35, 50] }], highlight: 1 }, takeaway: "Specialty is where new demand goes" }] });
pres.writeFile({ fileName: "cases1920-demo.pptx" }).then(() => console.log("ok"));
