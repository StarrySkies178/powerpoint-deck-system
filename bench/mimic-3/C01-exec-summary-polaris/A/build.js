// C01 open-book mimic, build A (same content).
// build.js draws the frame (harness + Case-2019-Polaris profile) and the slide furniture the stored object lost
// (zero-width lines, footer rule, logos). build.py then places the stored exhibit case19-polaris-002 on top.
const path = require("path"), fs = require("fs");
const ROOT = path.resolve(__dirname, "../../../..");
const L = require(path.join(ROOT, "bench/lib/bench_lib.js"));
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));

const E = 914400, emu = (v) => v / E;           // positions below are the original slide's, in EMU
const GREY = "5C5C5C", RULE = "B4B4B4";

async function logos() {   // the two logos are pictures in the reference deck (slide 2, objects 5 and 6)
  const z = await JSZip.loadAsync(fs.readFileSync(path.join(ROOT, "Templates/Case-2019-Polaris.pptx")));
  const b64 = async (n) => (await z.file("ppt/media/" + n).async("base64"));
  return { polaris: "image/png;base64," + (await b64("image4.png")), pandora: "image/jpeg;base64," + (await b64("image5.jpg")) };
}

(async () => {
  const { pres, slide } = L.start({
    ref: "Case-2019-Polaris",
    title: "Executive Summary: Pandora’s growth strategy in Mainland China jewelry market by store expansion, sales per store improvement and omni-channel strategy",
    source: "Source: Polaris Analysis",
  });
  const line = (x, y, w, h, color, pt, dash) => slide.addShape("line", {
    x: emu(x), y: emu(y), w: emu(w), h: emu(h), line: { color, width: pt, dashType: dash || "solid" } });
  // dividers between the columns (dashed) and the grey rules the double chevrons sit on
  line(5289803, 1862327, 0, 3827145, GREY, 0.72, "sysDash");
  line(8875776, 1862327, 0, 2379980, GREY, 0.72, "sysDash");
  line(2177795, 4407408, 2811145, 0, GREY, 0.72);
  line(5623559, 4407408, 6123305, 0, GREY, 0.72);
  line(2177795, 5818632, 9530080, 0, GREY, 0.72);
  // footer: light rule across the slide, logos with a short separator between them
  line(0, 6598919, 11857355, 0, RULE, 0.72);
  line(10893552, 6635495, 0, 190500, RULE, 0.72);
  const lg = await logos();
  slide.addImage({ data: lg.pandora, x: emu(9828317), y: emu(6621778), w: emu(978323), h: emu(195071) });
  slide.addImage({ data: lg.polaris, x: emu(10840211), y: emu(6507480), w: emu(876300), h: emu(350518) });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
