# design-system/

Source of the Claude design system **Powerpoint House Style** (https://claude.ai/artifact/QRdhaeQi9cizMGrfLQHru3). The Powerpoint folder is the source of truth; this folder is what gets published.

| Path | What |
|---|---|
| `project/` | The exact files of the design system: `README.md` (brand book), `tokens.json`, `components/` (React components + previews), `slides-kit/` (CSS kit and recipes for Claude Slides decks), `assets/*/README.md`, `design-system.json` (index with the asset ids) |
| `pattern-map.json` | Each generator → its component and/or Slides recipe, or neither (PowerPoint only) |
| `tools/gen_components.py` | Rewrites every component's preview, README and `index.d.ts` |
| `tools/asset-blobs.json` | Ids of the uploaded pictures (sample-deck renders, photo, China map) |
| `PUBLISH.md` | How to publish |
| `sync-report.md`, `state.json` | Written by `scripts/sync_design_system.py`: what changed, what is live |

Never edit `project/tokens.json` colours, sizes or the token block of `slides-kit/deck.css` by hand: change `Generators/house.js` (and `Style/style-rules.md`), then run `python3 scripts/sync_design_system.py`.
