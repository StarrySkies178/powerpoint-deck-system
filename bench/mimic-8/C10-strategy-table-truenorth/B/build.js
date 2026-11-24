// C10 open-book mimic, build B (changed content, same design, five journey rows instead of four).
// Same frame code as build A (A/build.js drawFrame); build.py places the same stored object, re-laid out.
const path = require("path");
const { CONTENT: A, drawFrame } = require(path.resolve(__dirname, "../A/build.js"));

const CONTENT = {
  title: "A three-year plan could lift Lumi Tea’s share in Southeast Asia by fixing each step of the buyer journey",
  crumb: ["Market Entry", "Three-year Plan: Initiative Overview", "Budget & Roadmap"], current: 1,
  source: "Source: Lumi Tea sales data 2025; team analysis",
  heads: [["Buyer situation", ...A.heads[0].slice(1)], ["Key initiatives", ...A.heads[1].slice(1)],
          ["Risks", ...A.heads[2].slice(1)], ["Mitigation", ...A.heads[3].slice(1)]],
};

drawFrame(CONTENT, path.join(__dirname, "candidate.pptx"));
