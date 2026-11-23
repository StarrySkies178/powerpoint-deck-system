# ChinaMap

A choropleth of China's 32 provinces drawn from the real outlines in the folder's object store (`Objects/store/map.jsonl.gz`, "中国地图-细分到省级"): values in four steps of navy, provinces with no data in grey-4, the province in focus in green, the top five labelled; optional "So what" panel.

- **Props:** `data` (`{province: value}`, English or Chinese names), `highlight` (province names), `labels` (names to label; default the top 5), `unit`, `legend`, `points`, `heading`.
- **Rules:** one measure per map; label only what the story needs. Province-level detail, city maps and world / US maps are in the object store for the generators.
