const L = require("../../lib/bench_lib.js");
const { pres, slide, B, P, S } = L.start({ ref: "Case-2019-Polaris", title: "During strategy implementation, Pandora should take initiative to mitigate challenges", source: "Source: Polaris Analysis" });
const lw = B.w * 0.6, gb = { x: B.x, y: B.y + 0.45, w: lw, h: B.h - 0.45 }, rb = { x: B.x + lw + 0.3, y: B.y, w: B.w - lw - 0.3, h: B.h };
P.txt(slide, "Implementation Timeline", B.x, B.y, lw, 0.35, { fontSize: 13, bold: true });
S.gantt(slide, { periods: ["2019", "2020", "2021", "2022", "2023"], groups: [
  { name: "a  Offline Strategy: Store Expansion", rows: [{ label: "Open new concept stores", from: 0, to: 5, hi: true }, { label: "Open theme stores", from: 1, to: 5, hi: true }, { label: "Open digital stores", from: 2, to: 3, hi: true }] },
  { name: "Sales per Store Improvement", rows: [{ label: "Loyal customer AD", from: 1, to: 5, hi: true }, { label: "Charity series", from: 0, to: 5, hi: true }, { label: "Personalized offerings", from: 2, to: 5 }, { label: "Design competence", from: 2, to: 5 }] },
  { name: "b  Online Strategy", rows: [{ label: "Enter new platforms", from: 0, to: 2, hi: true }, { label: "Optimize operations", from: 1, to: 5 }] },
  { name: "c  Omni-channel Strategy", rows: [{ label: "Data synchronization", from: 2, to: 5 }, { label: "Product mgt. & CRM", from: 2, to: 5 }] }] }, gb);
S.insightBox(slide, { label: "Main Challenges and Potential Mitigations", bullets: [
  "Consistent service in different regions; widely attractive local features; consistent brand image on online platforms. **Mitigation:** Intensive staff training; work with local teams to conduct in-depth regional research; clear unauthorized suppliers",
  "Competition from emerging players in entry luxury jewelry market. **Mitigation:** Keep sustainability of a differentiate in product and positioning",
  "Data availability from various platforms; high technical requirements for data synchronization and analytics. **Mitigation:** Negotiate with platforms and outsource market analytics"] }, rb);
L.save(pres, __dirname + "/candidate.pptx");
