# Proposals: changes waiting to be applied

One row per change that a chat wants but may not apply itself: a rule or builder change during a freeze, or any change to the shared files (`DECK-SYSTEM.md`, `Style/storytelling.md`, `maintenance/learning-loop.md`) by a chat that is not their editor. See `maintenance/roadmap.md` Phase 2 and the freeze notice in `maintenance/working-together.md`.

- Add your row at the bottom with one in-place command; sign in for `logs/proposals.md` first and drop it straight after.
- The editor chat (or, after a freeze, the chat that owns the lane) applies a row through the normal learning loop and fills in the last column. Rows are never removed.

| Date | From (chat) | File to change | What to change, exactly | Why (lesson or evidence) | Status |
|---|---|---|---|---|---|
| 2026-11-24 | Combining markdown files for skills (roadmap 1.2) | Generators/objstore.py | In `place()`, after renumbering shape ids, rewrite each connector's `a:stCxn`/`a:endCxn` id to the new id of the shape it pointed at. In store extraction, keep zero-width or zero-height straight connectors (del-038 lost 3 of its 12). Then re-run the D cases | All 3 fresh D04 rebuilds had to patch both in their build.py (bench/cases/D04-issue-tree/noise/run1-3/build.py); see logs/lessons-log.md 2026-11-24 | open (freeze) |
| 2026-11-24 | Combining markdown files for skills (roadmap 1.2) | Style/slide-map.csv and bench/ (owner of roadmap 1.4 to decide) | Give deck-as-reference builds a way not to see their target slide: either a column in slide-map.csv marking the 10 C target slides as benchmark-held-out, or a bench check that a C build's notes never cite its target. Until then bench/README.md tells C builders not to look it up | All 6 fresh C04 and C07 rebuilds saw their target's layout line in slide-map.csv (bench/README.md, Noise band); the C results, stored builds included, are not fully blind | open (freeze; affects roadmap 1.4) |
