// Test deck: decomposing a place (country → region → city → district → site → building → floor → zone). Illustrative data.
const pptxgen = require("pptxgenjs"); const G = require("./patterns.js"); const P = require("./patterns_story.js"); const PL = require("./patterns_place.js"); const H = G.HOUSE;
const pres = H.newDeck(pptxgen, "Decomposing a place — test deck"); const L = H.LAYOUT;
const S = (title, subtitle, src) => { const s = pres.addSlide({ masterName: L.titleOnly }); G.frame(pres, s, { title, subtitle, source: "Source: illustrative data for layout review" + (src ? "; " + src : "") }); return s; };
const B = G.BODY;
const stores = { 广东: 34, 上海: 28, 北京: 26, 浙江: 22, 江苏: 21, 四川: 14, 湖北: 11, 福建: 10, 山东: 9, 天津: 8, 重庆: 8, 河南: 7, 湖南: 7, 陕西: 6, 辽宁: 5, 安徽: 5 };

// 1. country choropleth + sized city dots + legend (Baincraft 13 / InnoVision 7)
PL.mapRegions(pres, S("New stores concentrate on the east coast: 5 provinces take 60% of the plan", "mapRegions — provinces shaded by planned stores, city dots sized by stores", "Map: DataV.GeoAtlas"),
  { geo: "cn", values: stores, bins: [1, 5, 10, 20], legend: { title: "New stores by province" }, labels: false,
    markers: [{ at: "Shanghai", value: 20, label: "SH, 20", hi: true }, { at: "Beijing", value: 20, label: "BJ, 20", hi: true }, { at: "Shenzhen", value: 15, label: "SZ, 15" }, { at: "Guangzhou", value: 13, label: "GZ, 13" },
      { at: "Hangzhou", value: 21, label: "HZ, 21", hi: true }, { at: "Chengdu", value: 13, label: "CD, 13" }, { at: "Wuhan", value: 9, label: "WH, 9" }, { at: "Xi'an", value: 10, label: "XA, 10" }] }, B);

// 2. regional small multiples (DoubleClick 8)
PL.regionMultiples(pres, S("Five core cities radiate to the rest of their regions in two stages", "regionMultiples — the country split into regional panels; stars = core city, pins by stage", "Map: DataV.GeoAtlas"), {
  geo: "cn", groups: [
    { title: "North", regions: ["北京", "天津", "河北", "山西", "辽宁", "山东"] }, { title: "East", regions: ["上海", "江苏", "浙江", "安徽"] },
    { title: "South", regions: ["广东", "福建", "广西", "海南"] }, { title: "Middle", regions: ["湖北", "湖南", "河南", "江西"] }, { title: "West", regions: ["四川", "重庆", "陕西", "贵州", "云南"] }],
  markers: [{ at: "Beijing", kind: "star", hi: true }, { at: "Shanghai", kind: "star", hi: true }, { at: "Shenzhen", kind: "star", hi: true }, { at: "Wuhan", kind: "star", hi: true }, { at: "Chengdu", kind: "star", hi: true },
    { at: "Tianjin" }, { at: "Qingdao" }, { at: "Hangzhou" }, { at: "Nanjing" }, { at: "Suzhou" }, { at: "Guangzhou" }, { at: "Xiamen", color: G.C.g4 }, { at: "Changsha" }, { at: "Zhengzhou", color: G.C.g4 }, { at: "Chongqing" }, { at: "Xi'an", color: G.C.g4 }],
  markerLegend: [{ kind: "star", color: G.C.accent, label: "Core city" }, { kind: "dot", color: G.C.navy, label: "Stage 1 (Y1–3)" }, { kind: "dot", color: G.C.g4, label: "Stage 2 (Y4–5)" }] }, B);

// 3. zoom chain country → province → city with sites (Bainology 8 / E-Cluster 21 / Baincraft 26)
PL.geoZoom(pres, S("In Shenzhen, four malls in the CBD districts are the best first sites", "geoZoom — country → province → city districts → numbered sites with callouts", "Map: DataV.GeoAtlas"), {
  levels: [{ geo: "cn", highlight: "广东", label: "Country", title: "China" }, { geo: "cn:广东", highlight: "深圳", label: "Province", title: "Guangdong" },
    { geo: "cn:深圳", label: "City", title: "Shenzhen", highlightAll: ["福田", "南山"], labels: { 福田: "Futian", 南山: "Nanshan", 罗湖: "Luohu", 宝安: "Bao'an", 龙岗: "Longgang", 龙华: "Longhua" } }],
  sites: [{ lon: 114.055, lat: 22.535, title: "Mall A @ Futian", bullets: ["Traffic 70–80k/day", "White collars, mid–high income"], hi: true },
    { lon: 113.935, lat: 22.52, title: "Mall B @ Nanshan", bullets: ["Traffic 80–90k/day", "Young professionals"] },
    { lon: 114.12, lat: 22.545, title: "Mall C @ Luohu", bullets: ["Traffic 40–60k/day", "Families"] },
    { lon: 113.88, lat: 22.57, title: "Mall D @ Bao'an", bullets: ["Traffic 90–110k/day", "Young families"] }] }, B);

// 4. site callouts both sides on a city (E-Cluster 21)
PL.siteCallouts(pres, S("Taking Shanghai as an example, four sites score best on our criteria", "siteCallouts — city districts, numbered pins, cards on both sides", "Map: DataV.GeoAtlas"), {
  geo: "cn:上海", side: "both", highlight: ["黄浦", "静安", "徐汇"], focus: ["黄浦", "静安", "徐汇", "长宁", "普陀", "虹口", "杨浦"], labels: "auto", labelMinArea: 0.25,
  sites: [{ lon: 121.47, lat: 31.235, title: "Site 1 — Huangpu", bullets: ["Female TGI 110", "White collars ~0.45m"], hi: true },
    { lon: 121.505, lat: 31.24, title: "Site 2 — Lujiazui", bullets: ["Female TGI 102", "White collars ~0.50m"] },
    { lon: 121.44, lat: 31.195, title: "Site 3 — Xuhui", bullets: ["Female TGI 108", "Income ¥25k/month"] },
    { lon: 121.45, lat: 31.225, title: "Site 4 — Jing'an", bullets: ["Female TGI 104", "18–34 share 65%"] }] }, B);

// 5. exploded building (TNT 11)
PL.buildingExplode(pres, S("The flagship stacks three experiences: train, recover, play", "buildingExplode — floors pulled apart, zones on each floor, a card per floor"), {
  floors: [{ name: "1F Fun", zones: [{ name: "VR games", share: 1.2 }, { name: "Photo wall", share: 1 }, { name: "Café", share: 0.8 }] },
    { name: "2F Life", zones: [{ name: "Relax room", share: 1 }, { name: "Healthy kitchen", share: 1 }, { name: "Shelf", share: 0.6 }] },
    { name: "3F Fitness", hi: true, zones: [{ name: "Hot class", share: 1.3, hi: true }, { name: "KOL class", share: 1 }, { name: "Free weights", share: 1 }] }],
  cards: [{ floor: 2, title: "3F Fitness — the reason to come", tag: "~300 m²", bullets: ["Top-5 hot classes daily, ¥69–239", "Monthly KOL classes, 30% free at launch"] },
    { floor: 1, title: "2F Life — reasons to stay", tag: "~180 m²", bullets: ["Salad and functional drinks", "Partner brands on the shelf"] },
    { floor: 0, title: "1F Fun — reasons to share", tag: "~120 m²", bullets: ["Interactive photo shooting", "VR fitness games for free"] }] }, B);

// 6. floor plan (E-Cluster 14 / Polaris 10)
PL.floorPlan(pres, S("Four areas lead the customer from the window to the service desk", "floorPlan — numbered zones, entrance, customer path, legend"), {
  aspect: 1.45, entrance: { side: "bottom", at: 0.5, width: 0.16 },
  zones: [{ name: "Shop window", x: 0.3, y: 0.78, w: 0.4, h: 0.22, note: "Fresh themes every month" },
    { name: "Display", x: 0, y: 0.25, w: 0.28, h: 0.75, note: "Bestsellers at eye level" }, { name: "Signature collection", x: 0.32, y: 0.3, w: 0.36, h: 0.38, hi: true, note: "The one thing to see" },
    { name: "Display", x: 0.72, y: 0.25, w: 0.28, h: 0.75, note: "New arrivals" }, { name: "Digital area", x: 0, y: 0, w: 0.5, h: 0.22, note: "Try-on and AI advice" },
    { name: "Service desk", x: 0.5, y: 0, w: 0.5, h: 0.22, note: "Pick-up, care, after-sales" }],
  path: [[0.5, 1.02], [0.5, 0.72], [0.2, 0.55], [0.25, 0.2], [0.75, 0.2]] }, B);

// 7. world → country (decompose the world)
PL.geoZoom(pres, S("Asia-Pacific holds 3 of the 5 priority markets; the UK is the first European entry", "geoZoom on the world — world → country → regions", "Map: Natural Earth"), {
  levels: [{ geo: "world", highlight: "United Kingdom", highlightAlso: ["China", "Japan", "Australia", "Singapore"], label: "World", title: "Priority markets", exclude: ["Antarctica"] },
    { geo: "adm1:GBR", label: "Country", title: "United Kingdom — regions", labels: false, markers: [{ at: "London", value: 9, label: "London, 9", hi: true }, { at: "Manchester", value: 4, label: "Manchester, 4" }, { at: "Birmingham", value: 4, label: "Birmingham, 4" }, { at: "Leeds", value: 3, label: "Leeds, 3" }, { at: "Edinburgh", value: 3, label: "Edinburgh, 3" }, { at: "Glasgow", value: 2, label: "Glasgow, 2" }, { at: "Bristol", value: 2, label: "Bristol, 2" }] }],
  weights: [1.6, 1] }, B);

// 8. a map inside a composed slide (map panel + chart panel)
P.composeSlide(pres, S("Tier-1 cities are under-served: 60% of demand but 35% of stores", "composeSlide HALF2 with a map panel (map:) and a chart panel"), { layout: "HALF2", numbered: true, panels: [
  { headline: "Stores cluster in a few coastal provinces", map: { geo: "cn", values: stores, bins: [1, 5, 10, 20], legend: { title: "Stores" }, labels: false } },
  { headline: "Demand share runs ahead of store share in tier 1", chart: { type: "bar", labels: ["Tier 1", "New tier 1", "Tier 2", "Tier 3+"], series: [{ name: "Demand", values: [60, 22, 12, 6] }, { name: "Stores", values: [35, 30, 20, 15] }], highlight: 0 } }] });
pres.writeFile({ fileName: "place-demo.pptx" }).then(() => console.log("ok"));
