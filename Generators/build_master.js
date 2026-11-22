const pptxgen = require("pptxgenjs"); const H = require("./house.js");
(async () => {
  const pres = H.newDeck(pptxgen, "House master 16:9");
  await pres.writeFile({ fileName: "house-master-16x9.pptx" }); require("fs").renameSync("house-master-16x9.pptx","house-master-16x9.potx");
  await H.finalize("house-master-16x9.potx", { template: true });
  console.log("master written");
})();
