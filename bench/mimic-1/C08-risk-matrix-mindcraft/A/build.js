// C08 open-book mimic, build A (same content). Frame + breadcrumb + logo here; the slide body is the stored
// object case19-mindcraft-015, placed and refilled by build.py (run next, with A/ as working directory).
const path = require("path"), fs = require("fs"), { execFileSync } = require("child_process");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));
const ROOT = path.resolve(__dirname, "../../../..");
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));

(async () => {
  // crumb drawn below (the original places each section at its own x, between two stored triangles)
  const { pres, slide } = L.start({ ref: "Case-2019-Mindcraft", title: SPEC.title, source: SPEC.source });
  // breadcrumb: three bold italic labels, grey / grey / main colour, at the original's x positions (the triangles come with the object)
  const xs = [0.37, 2.88, 5.56], ws = [2.0, 2.25, 2.6];
  SPEC.crumb.forEach((t, i) => slide.addText(t, {
    x: xs[i], y: 0.04, w: ws[i], h: 0.3, margin: 0, fontFace: "Verdana", fontSize: 14, bold: true, italic: true,
    color: i === 2 ? "C00000" : "A6A6A6", valign: "top", isTextBox: true }));
  // the deck's logo is a picture on the reference master (ppt/media/image1.png): taken as is, at its master position
  const logo = path.join(__dirname, "logo.png");
  execFileSync("python3", ["-I", "-c",
    "import sys,zipfile;open(sys.argv[2],'wb').write(zipfile.ZipFile(sys.argv[1]).read('ppt/media/image1.png'))",
    path.join(ROOT, "Templates/Case-2019-Mindcraft.pptx"), logo]);
  slide.addImage({ path: logo, x: 11.642, y: 7.175, w: 1.137, h: 0.325 });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
