# Output routes: one brain, two ways out

The storyline (Stage 2), slide plan (Stage 3), checks (Stage 5) and learning (Stage 6) are the same for every deck. Only Stage 4, the build, depends on what the user wants to end up with.

| The user wants | Route | Built with | Checked with |
|---|---|---|---|
| A PowerPoint file. **The default**, and the answer whenever they say PPT, .pptx, deck or slides without naming Claude | PowerPoint | `master/`, `Generators/`, `Objects/store`, style profiles | `scripts/deck_lint.py`, rendered slides, §7 |
| A deck inside Claude: a link to share, edit together and present ("make it in Claude Slides", "as an artifact") | Claude Slides | Design system **Powerpoint House Style**: `design-system/project/slides-kit/deck.css` + `patterns.md` | The kit's "Before handing over" list, a look at the slides, §7 |
| One page inside Claude: a poster, one-pager or mock slide ("in Claude Design") | Claude Design | The design system's React components (`design-system/project/components/`) | A look at the page, §7 |

## What each route can do

| | PowerPoint | Claude Slides |
|---|---|---|
| Storyline, action titles, message → figure rules | Yes | Yes (same Stages 1–3) |
| House look (colours, type, grid) | Yes | Yes (same values, written by `scripts/sync_design_system.py`) |
| Patterns | All generators | The kit's recipes (`design-system/pattern-map.json` says which) |
| Matching a reference deck, reusing stored template shapes | Yes | No |
| Maps, native Excel-linked charts, think-cell-style detail | Yes | No (charts are editable boxes; a map is a picture) |
| Smallest text | 9 pt | 12 pt (24 px), so fewer words per slide |
| Sharing | A file | A link; exports to .pptx or PDF |

If a Slides deck needs something from the right-hand "No" column, say so and build that deck (or that slide) as PowerPoint.

## Claude Slides route, step by step

1. Do Stages 1–3 here in the folder as usual. Mark each slide in the plan with its kit recipe (`pattern-map.json`, column `slides`).
2. Create the deck from the Slides type and use the design system **Powerpoint House Style** (https://claude.ai/artifact/QRdhaeQi9cizMGrfLQHru3). If it is set as the default design system, Slides picks it up by itself.
3. Follow `slides-kit/patterns.md`: copy `deck.css` whole, build each slide from its recipe.
4. Check with the kit's list, then Stage 5 §7 for the story. Log the deck (Stage 6) with output = "Slides".

Tested 2026-11-23: the folder's sample story (SE Asia entry) built on this route with the design system installed: https://claude.ai/artifact/6A9Gqe1de8jF6vhJFADuSm. First build: 9 slides, one figure each, half the page empty (the user rejected it). Rebuilt with the kit's compose classes: 13 slides, 2–4 exhibits on every analysis slide, lettered summary with a numbers column; no overflow, nothing under 24 px, at most 126 elements per slide. Rebuilt again 2026-11-24 (v2.16) at the reference decks' density: 15 slides with photo cover and agenda, breadcrumb, a unit line and a reading on every exhibit, icons, Harvey balls and native tables; median 134 body words per content slide (the PowerPoint sample: 149; a Slides deck cannot go under 24 px, so it carries a little less). Checked by rendering the files locally, not in the live page.

## How the two stay one system

- The folder is the only source. `design-system/project/` holds the exact files of the design system; nobody edits the design system inside Claude.
- `scripts/sync_design_system.py` writes the look from `Generators/house.js` into the design system's tokens and Slides kit, and reports any generator that has no entry in `pattern-map.json`. It runs after every applied change (`maintenance/learning-loop.md` step 8) and in the weekly scheduled sync.
- Publishing needs Claude's Artifact tools: `design-system/PUBLISH.md`.
