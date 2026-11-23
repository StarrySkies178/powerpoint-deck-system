// Deck 3 (roadmap step 1.5, real deck task): investment committee paper, English, 6 slides.
// Brief: should a fund of funds commit to a fictional early-stage venture fund? Tables for track record, terms and
// risks; one clear recommendation. ALL FUNDS, MANAGERS AND FIGURES ARE FICTIONAL (said on every source line).
const path = require("path");
const ROOT = process.env.DECK_ROOT || "/home/claude/wt";
const pptxgen = require("pptxgenjs");
const G = require(path.join(ROOT, "Generators/patterns.js")), P = require(path.join(ROOT, "Generators/patterns_story.js"));
const H = G.HOUSE, { C } = G, L = H.LAYOUT, B = G.BODY;
const pres = H.newDeck(pptxgen, "Harbour Lane FoF: Northwind Seed Fund III (IC paper)");
const SRC = "Source: fictional fund, manager and figures, written for illustration; not real data. TVPI, DPI and IRR net of fees, as of 30 June 2026";
const SECTIONS = ["Manager", "Track record", "Terms", "Risks"];
const S = (sec, title, src = SRC) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, crumb: sec == null ? undefined : { items: SECTIONS, current: sec }, source: src }); return s; };

// 1 Recommendation first
P.letteredSummary(S(null, "Recommendation: commit US$ 20 m to Northwind Seed Fund III, on condition of a 2.0% fee and a key-person clause"), { highlight: 3,
  projection: { title: "The commitment", items: [{ label: "Amount", value: "US$ 20 m" }, { label: "Share of the fund", value: "8%" }, { label: "Target net TVPI", value: "2.5x" }],
    risks: { title: "Two conditions", items: ["Management fee 2.0%, not 2.5%", "Key-person clause on two named partners", "Otherwise we decline"] } }, items: [
  { conclusion: "A stable team with a focused seed strategy in Southeast Asia", points: ["Four partners have invested together since 2016; no partner has left", "Pre-seed and seed software, US$ 0.5 to 2 m first cheques, 30 to 35 companies"] },
  { conclusion: "Two top-quartile funds, but cash returned so far comes from Fund I only", points: ["Fund I: 3.4x net TVPI, 1.6x DPI; Fund II: 2.1x TVPI, 0.3x DPI", "Fund II is young (2019) and on track, but unproven in cash"] },
  { conclusion: "Terms are market-standard except the fee and the key-person clause", points: ["2.5% fee against a market 2.0%: US$ 0.8 m more in fees on our commitment", "No key-person clause although two partners lead 70% of deals"] },
  { conclusion: "Commit US$ 20 m if both conditions are met; decline otherwise", points: ["First close in February 2027; side letter to be agreed in January", "Fits our seed allocation: 8% of the fund, 3% of our 2027 budget"] }] });

// 2 Manager and strategy
P.composeSlide(pres, S(0, "Northwind backs seed-stage software in Southeast Asia, led by four partners who have invested together since 2016"), { layout: "HALF2", panels: [
  { icon: "file-text", headline: "Fund III continues the strategy of Funds I and II at a larger size", unit: "Key facts of Northwind Seed Fund III",
    draw: (s, b) => G.dataTable(s, { header: ["Item", "Fund III"], colW: [0.38, 0.62], alignRight: false, maxRowH: 0.42, fontSize: 11, rows: [
      ["Target size (hard cap)", "US$ 250 m (US$ 300 m)"], ["Vintage, first close", "2027, February 2027"], ["Stage", "Pre-seed and seed, reserves for Series A"], ["Sectors", "B2B software, fintech infrastructure"],
      ["Geography", "Indonesia, Vietnam, Philippines, Singapore"], ["First cheque, companies", "US$ 0.5 to 2 m, 30 to 35 companies"], ["GP commitment", "2% of the fund"]] }, b),
    reading: ["Fund size grows from US$ 150 m to **US$ 250 m**: cheques and reserves grow with it, the number of companies does not", "Same sectors and countries as Fund II"] },
  { icon: "users", headline: "The team is stable, but two partners lead most deals", unit: "What we found in diligence (fictional)",
    points: [{ icon: "users", label: "Stable team", text: "Four partners since 2016, **no departures**; two principals promoted from within" },
      { icon: "target", label: "Sourcing edge", text: "**60%** of Fund II deals came from founders of earlier portfolio companies" },
      { icon: "alert-triangle", label: "Concentration", text: "Two partners led **70%** of deals in Funds I and II" }],
    reading: ["Team and sourcing are the main strengths", "Concentration on two partners is why we ask for a **key-person clause**"] }] });

// 3 Track record
P.composeSlide(pres, S(1, "Both earlier funds are top-quartile on TVPI, but only Fund I has returned meaningful cash so far"), { layout: "T1B2", insightsLabel: "Reading", panels: [
  { icon: "chart-bar", headline: "Track record of Northwind's two earlier funds against the benchmark", unit: "Net of fees, as of 30 June 2026; benchmark = fictional SE Asia seed funds of the same vintage",
    draw: (s, b) => G.dataTable(s, { header: ["Fund", "Vintage", "Size", "Net TVPI", "DPI", "Net IRR", "Quartile", "Top-quartile TVPI"], colW: [0.14, 0.1, 0.12, 0.12, 0.1, 0.12, 0.14, 0.16], alignRight: false, highlightRow: 1, maxRowH: 0.42, fontSize: 11, rows: [
      ["Fund I", "2016", "US$ 60 m", "3.4x", "1.6x", "28%", "Top", "2.6x"], ["Fund II", "2019", "US$ 150 m", "2.1x", "0.3x", "24%", "Top", "1.9x"], ["Benchmark median (2016 / 2019)", "", "", "1.7x / 1.4x", "0.6x / 0.1x", "14% / 12%", "", ""]] }, b) },
  { icon: "coins", headline: "Fund II is on track but has returned little cash", unit: "Net TVPI and DPI by fund, x",
    chart: { type: "column", labels: ["Fund I (2016)", "Fund II (2019)"], series: [{ name: "Net TVPI", values: [3.4, 2.1] }, { name: "DPI", values: [1.6, 0.3] }], highlight: 0, format: "0.0" },
    readingSide: "right", readingShare: 0.42, reading: ["Fund I has returned **1.6x** in cash", "Fund II's value is still **86% unrealised**"] }],
  insights: ["Both funds sit in the **top quartile** on TVPI", "Fund I's result rests on **two exits** (55% of its value)", "Fund II has to turn paper value into cash by 2029"],
  soWhat: "Strong record, with Fund II's cash still to come" });

// 4 Terms
P.composeSlide(pres, S(2, "The terms are market-standard except a 2.5% fee and no key-person clause, which we make conditions of our commitment"), { layout: "EXI", insightsLabel: "Reading", panels: [
  { icon: "license", headline: "Two of nine terms fall short of market standard", unit: "Fund III terms against the market standard for SE Asia seed funds (fictional survey, 2026)",
    draw: (s, b) => G.dataTable(s, { header: ["Term", "Fund III", "Market standard", "Our view"], colW: [0.26, 0.27, 0.27, 0.2], alignRight: false, highlightRow: 1, maxRowH: 0.42, fontSize: 11, rows: [
      ["Management fee", "2.5% on commitments", "2.0%, stepping down", "✗ Ask 2.0%"], ["Key-person clause", "None", "Named partners, suspension", "✗ Ask for it"], ["Carried interest", "20%", "20%", "✓ In line"], ["Hurdle", "8%, full catch-up", "8%", "✓ In line"],
      ["GP commitment", "2%", "1% to 2%", "✓ Good"], ["Fund term", "10 + 2 years", "10 + 2 years", "✓ In line"], ["Recycling", "Up to 20%", "Up to 20%", "✓ In line"], ["LP advisory seat", "From US$ 15 m", "Varies", "✓ We qualify"], ["Most-favoured nation", "From US$ 25 m", "Varies", "– Not needed"]] }, b) }],
  insights: ["The fee costs us **US$ 0.8 m** more over the fund's life than a 2.0% fee", "Without a key-person clause, losing one of the two lead partners would leave us **without a remedy**", "The other seven terms are in line or better"],
  soWhat: "Both shortfalls are conditions of our commitment" });

// 5 Risks (table)
P.composeSlide(pres, S(3, "Four risks matter; the two largest are covered by our conditions, and the other two are priced into the 2.5x target"), { layout: "FULL", panels: [
  { icon: "alert-triangle", headline: "Risks, how likely they are, and what covers them", unit: "Our assessment; residual risk after the conditions and the portfolio's diversification",
    draw: (s, b) => G.dataTable(s, { header: ["#", "Risk", "Likelihood", "Impact", "What covers it", "Residual"], colW: [0.05, 0.25, 0.12, 0.1, 0.36, 0.12], alignRight: false, highlightRow: 0, maxRowH: 0.78, fontSize: 12, rows: [
      ["1", "A lead partner leaves (two lead 70% of deals)", "Medium", "High", "Key-person clause: investing stops until LPs approve a replacement (condition)", "Low"],
      ["2", "Larger fund dilutes returns (US$ 150 m to 250 m)", "Medium", "High", "Fee cut to 2.0% (condition); same company count, larger reserves", "Medium"],
      ["3", "Slow exits keep cash locked in", "High", "Medium", "Target built on 2.5x TVPI, not on DPI timing; secondaries market as an outlet", "Medium"],
      ["4", "Currency: returns earned in local currencies", "Medium", "Medium", "70% of companies earn in US$ or SGD; we measure in US$", "Low"]] }, b),
    reading: ["Risks **1 and 2** are the largest and are covered by the two conditions of our commitment", "Risk 3 is the usual risk of seed funds: our target uses value, not cash timing", "Risk 4 is small because most companies invoice in US$ or SGD"] }] });

// 6 Decision
{ const s = pres.addSlide({ masterName: L.statementDark });
  s.addText("Recommendation: commit US$ 20 m to Northwind Seed Fund III if it agrees to a 2.0% fee and a key-person clause; otherwise decline", { placeholder: "statement" });
  s.addText("Next: side letter by January 2027, first close February 2027. Fictional fund and figures for illustration.", { placeholder: "support" }); }

const out = process.argv[2] || "/home/claude/decks/deck3.pptx";
(async () => { await pres.writeFile({ fileName: out }); await H.finalize(out); console.log("written", out); })();
