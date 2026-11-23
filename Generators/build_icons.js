const fs = require("fs"), svgpath = require("svgpath");
const want = `users user user-check users-group building building-factory-2 building-store building-skyscraper building-bank building-warehouse home map-pin map-2 world globe plane truck truck-delivery ship train car package packages box shopping-cart shopping-bag basket receipt receipt-2 cash coin coins currency-dollar credit-card wallet pig-money report-money chart-bar chart-line chart-pie chart-dots chart-arrows-vertical chart-area-line trending-up trending-down arrow-up-right arrow-down-right arrows-exchange arrow-right arrow-big-right target target-arrow bulb rocket flag trophy award medal star heart thumb-up thumb-down check x circle-check circle-x alert-triangle alert-circle info-circle help-circle shield shield-check lock key gavel scale certificate license file-text file-analytics clipboard-list clipboard-check checklist list-check notes book calendar calendar-event clock hourglass stopwatch settings adjustments tool tools hammer recycle leaf plant tree droplet flame snowflake temperature sun bolt battery-charging plug cpu device-mobile device-laptop device-desktop cloud database server wifi world-www search zoom-in filter eye message messages mail phone speakerphone microphone share link network affiliate hierarchy hierarchy-2 sitemap binary-tree topology-star-3 puzzle layers-intersect stack-2 category layout-grid apps box-multiple components route road compass direction-sign walk run bike heartbeat stethoscope pill first-aid-kit microscope flask atom school certificate-2 briefcase id-badge-2 tie handshake hand-stop crown diamond gift tag discount-2 percentage barcode qrcode photo camera video movie music palette brush pencil edit scissors printer download upload refresh rotate-clockwise player-play circle-plus circle-minus plus minus equal divide math-greater math-lower infinity bell bookmark pin paperclip trash archive folder inbox send fridge bottle cup coffee tools-kitchen-2 meat fish salad cookie ice-cream apple milk bread`.split(/\s+/);
const out = {}, miss = [];
for (const n of [...new Set(want)]) {
  const f = `node_modules/@tabler/icons/icons/outline/${n}.svg`;
  if (!fs.existsSync(f)) { miss.push(n); continue; }
  const svg = fs.readFileSync(f, "utf8"), cmds = [];
  for (const m of svg.matchAll(/<path d="([^"]+)"\s*\/>/g)) {
    svgpath(m[1]).abs().unarc().unshort().iterate((s, i, cx, cy) => {
      const r = (v) => Math.round(v * 100) / 100;
      if (s[0] === "M") cmds.push(["M", r(s[1]), r(s[2])]); else if (s[0] === "L") cmds.push(["L", r(s[1]), r(s[2])]);
      else if (s[0] === "C") cmds.push(["C", ...s.slice(1).map(r)]); else if (s[0] === "Q") cmds.push(["Q", ...s.slice(1).map(r)]);
      else if (s[0] === "Z" || s[0] === "z") cmds.push(["Z"]); else if (s[0] === "H") cmds.push(["L", r(s[1]), r(cy)]); else if (s[0] === "V") cmds.push(["L", r(cx), r(s[1])]);
    });
  }
  out[n] = cmds;
  fs.mkdirSync("subset", { recursive: true }); fs.copyFileSync(f, `subset/${n}.svg`);
}
fs.writeFileSync("icons.json", JSON.stringify({ _: "Tabler Icons 3.52.0 (MIT), outline set, 24 x 24 grid. Each icon: path commands M/L/C/Q/Z in grid units. Built by Generators/build_icons.js", icons: out }));
console.log(Object.keys(out).length, "icons;", "missing:", miss.join(" "), "; json", fs.statSync("icons.json").size);
