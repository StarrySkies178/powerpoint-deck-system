const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const H = G.HOUSE;
const pres = H.newDeck(pptxgen, "Object store demo");
const T = [
 ["Resize: the same template object at three sizes, still vector", "Bain 'circular arrows – five', recoloured to the house theme"],
 ["Extend a cycle: five arrows become three or eight", "extend(obj, n): re-spaced at 360°/n, each arrow rotated, labels follow"],
 ["Extend a flow: four steps become six", "extend(obj, n): same span, gaps kept, steps shrink to fit"],
 ["Recolour: one object, three colour mappings", "honeycomb: house default · highlight one cell · roles swapped"],
 ["Transmute: swap the shape, keep the layout and text", "swap_geom(): arrows → rounded boxes → circles"],
 ["Combine: two template objects joined into one new object", "combine([funnel, honeycomb]) placed as a single, resizable object"],
 ["Maps: any province highlighted, any size", "China provinces map; highlight = recolour one part to the accent"],
 ["Pictures are kept too: icons resized and placed", "Deloitte icon set, placed and scaled"],
];
for (const [t, s] of T) { const sl = pres.addSlide({ masterName: H.LAYOUT.titleOnly }); G.frame(pres, sl, { title: t, subtitle: s, source: "Object store demo · objects from Templates/, theme-linked" }); }
(async () => { await pres.writeFile({ fileName: "objdemo.pptx" }); await H.finalize("objdemo.pptx"); console.log("base ok"); })();
