# Objects/maps — map data for place decomposition

Drawn by `Generators/patterns_place.js` (`mapRegions`, `regionMultiples`, `geoZoom`, `siteCallouts`). Each region becomes its own editable freeform shape, named after the place.

| File | What | Source |
|---|---|---|
| `world.json` | all countries | Natural Earth 1:50m (public domain) |
| `adm1/<ISO3>.json` | states / provinces of every country (247 files) | Natural Earth 1:10m (public domain) |
| `cities.json` | ~7,300 towns and cities with population (for pins and labels) | Natural Earth populated places (public domain) |
| `cn/100000.json` | China provinces (+ South China Sea islands line) | DataV.GeoAtlas (Aliyun), official boundaries |
| `cn/<adcode>.json` | a province's cities (all 34) or a city's districts (49 major cities so far) | DataV.GeoAtlas |
| `cn/index.json` | every Chinese area fetched: name, English name, level, parent, centroid | built by get_map.py |
| `gb/ADM2/<ISO3>.json`, `gb/ADM3/…` | counties / districts outside China (fetched: GBR, CHN) | geoBoundaries gbOpen (CC BY 4.0) |

How to refer to a map in a spec: `"world"`, `"adm1:USA"`, `"cn"` (China provinces), `"cn:广东"` or `"cn:Guangdong"` (its cities), `"cn:深圳"` (its districts), `"gb2:GBR"`.

To get more: `python3 scripts/get_map.py cn 成都` (a city's districts), `python3 scripts/get_map.py gb USA 2` (US counties), `python3 scripts/get_map.py list`.

Notes:
- Name every map source in the slide's source line (e.g. "Map: DataV.GeoAtlas", "Map: Natural Earth", "Map: geoBoundaries (CC BY 4.0)").
- Chinese district English names are filled only where an open dataset matches exactly. Otherwise give labels in the spec (`labels: {宝安: "Bao'an"}`) or use `lang: "zh"`.
- A map of China published in mainland China must follow the official standard map rules (审图号). The builders always add the South China Sea islands inset to the full China map. Check with the user before a public release.
