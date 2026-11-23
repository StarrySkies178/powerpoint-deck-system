
## 10. Decomposing a place: country → city → site → building → zone

How these decks answer "where?" (11 slides across 8 decks, looked at one by one). They never show a place once. They break it down level by level until they reach the unit the client acts on (a site, a floor, a zone). At every level the chosen part is in the main colour and the rest is grey.

| Level | What they show | Examples | Builder (`Generators/patterns_place.js`) |
|---|---|---|---|
| Country | Provinces shaded by a value (stores, millennials, demand), city dots sized by count with "BJ, 20" labels, legend of bins | Baincraft 13, InnoVision 7, Bainology 7, Polaris 9 | `mapRegions` (values, bins, markers) |
| Country → regions | The country cut into regional small multiples (North / East / South / Middle / West), core city as a star, other cities as pins coloured by stage | DoubleClick 8 | `regionMultiples` |
| Country → cities → plan | Map with the selected cities + a Y1–Y3 opening matrix beside it; store-count formula drawn over the map | Bainology 8, Baincraft 13 | `mapRegions` in a `composeSlide` panel (`map:`) + `valueTree` / `phaseMatrix` |
| Country → city treemap | Map of targets + treemap of store counts by city | TNT 10 | `mapRegions` + treemap |
| City → districts → sites | District map, the target districts shaded, numbered pins at the sites, a callout card per site on a leader line (traffic, target customer, price level) | Bainology 8 (Shenzhen), E-Cluster 21 (Shanghai), Baincraft 26 (Xi'an), InnoVision 19 (k-means clusters) | `siteCallouts`, or `geoZoom` for the full chain country → province → city → sites |
| Site types | Photo cards of the site types (mall, office, neighbourhood, industrial park, campus) with 2–3 bullets each | Baincraft 26, TNT 10, Polaris 10 | `evidencePanels` / `personaCards` |
| Building | Isometric cut-away of the store with floors or areas pulled out by arrows to rows that carry a photo, the offer, the price and the highlight | TNT 11 | `buildingExplode` (floors stacked apart, zones on each floor, a card per floor) |
| Floor | Top-down plan: areas around a centre piece, entrance, the customer's walking path, numbered legend | E-Cluster 14, Polaris 10 (architect plan) | `floorPlan` |
| Store photo | A photo of the prototype with numbered callouts around it (image, size, SKU, storage) | Bainology 14 | a picture + numbered `sticker`s |

**Rules they follow (now storytelling rule 16):**
- Go from the whole to the part in order (country → region → city → district → site → building → floor → zone). Stop at the level the decision is made.
- At each level, the selected part is in the main colour and the rest is grey. The next level zooms into exactly that part (zoom lines, the same highlight, or a breadcrumb such as "Country › Guangdong › Shenzhen").
- Put the selection logic next to the map: the criteria, the score, the formula, or the funnel from target pool → criteria → chosen.
- Every pin or zone carries its numbers in a callout (traffic, target customer, size, revenue), and the numbers match the cards.
- Show one example city when the plan covers many ("Example city: Shenzhen"). Put the full list in the appendix.

**Map data:** `Objects/maps/` (see its README). It holds every country, every country's states or provinces, about 7,300 cities, and China down to districts. More can be fetched with `scripts/get_map.py`. Each region is its own named, editable shape. For China, the country map gets the South China Sea islands inset automatically. A map for public release in mainland China must follow the official standard map rules (审图号), so check before publishing. Test deck: `Generators/place-demo.pptx` (`demo_place.js`).
