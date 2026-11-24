// Build B: frame (title, rule, source) from the harness with the Polaris profile; body placed by build.py from the store.
const path = require("path");
const L = require(path.resolve(__dirname, "../../../lib/bench_lib.js"));
(async () => {
  const { pres } = L.start({
    ref: "Case-2019-Polaris",
    title: "During roll-out, Aurora should act early to contain its execution risks",
    source: "Source: Team analysis; store and platform data",
  });
  await L.save(pres, path.join(__dirname, "candidate.pptx"));
})();
