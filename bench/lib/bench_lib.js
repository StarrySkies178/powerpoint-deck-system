// bench_lib.js: what a build.js uses. It only calls the framework's own generators (GEN dir).
// start({ ref }) applies the reference's style profile (Style/refs/<deck>.profile.json) when the generators support it.
const path = require("path"), fs = require("fs");
const GEN = process.env.GEN || path.resolve(__dirname, "../../Generators");
const PROFILES = process.env.PROFILES || path.resolve(__dirname, "../../Style/refs");   // <deck>.profile.json
const pptxgen = require("pptxgenjs");
const HOUSE = require(path.join(GEN, "house.js"));
const P = require(path.join(GEN, "patterns.js"));
const S = require(path.join(GEN, "patterns_story.js"));
function start(f) {
  let prof = null;
  if (f.ref && P.useStyle) {
    const pf = path.join(PROFILES, f.ref + ".profile.json");
    if (fs.existsSync(pf)) prof = JSON.parse(fs.readFileSync(pf, "utf8"));
    P.useStyle(prof);
  }
  const pres = HOUSE.newDeck(pptxgen, f.title);
  const slide = pres.addSlide({ masterName: HOUSE.LAYOUT.titleOnly });
  P.frame(pres, slide, { title: f.title, subtitle: f.subtitle, source: f.source, crumb: f.crumb });
  return { pres, slide, B: P.BODY, P, S, HOUSE, prof };
}
async function save(pres, out) { await pres.writeFile({ fileName: out }); await HOUSE.finalize(out); }
module.exports = { start, save, P, S, HOUSE };
