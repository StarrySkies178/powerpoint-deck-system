# Step 1.8: the AI slide judge

Built on 2026-11-24 by the "Combining markdown files for skills" chat, on the planner's instruction after Mike's decision at 14:40. The judge is **not wired into the benchmark**. No rule, builder or scorer changed in this step.

## What the judge is

The judge is a fresh agent that sees only two things: `instructions.md` and one slide picture. It answers PASS or FAIL with one line of reason, the way Mike rated `bench/rating-1.7`. Each picture got its own fresh agent, and no agent saw any other picture, any label or this folder.

## How it was built

1. **Split first.** The 50 different rated slides were split at random with seed 1800 into 20 for tuning and 30 held out, keeping the reference / system share in both (10/10 and 15/15). The split was written to `split.json` before anything else.
2. **Instructions.** A fresh writer agent wrote `instructions.md` (914 words). It was given only these materials, now kept in `writer-materials/`:
   - `results-round-1b-redacted.md`: every held-out slide id is replaced by "[held-out slide]".
   - `error-analysis-1.6-references.md`.
   - Roadmap 4.2.
   - The 20 tuning pictures.
   - `tuning-labels.csv`, which holds the tuning labels only.

   The writer never saw a held-out label.
3. **Tuning.** The tuning round (t1) ran 20 fresh judges on the 20 tuning slides. They agreed with Mike on 19 of 20. The one miss was a reference slide Mike failed as "almost good". No second tuning round was run, so the instructions were never edited after the writer's first draft. Frozen md5: a62e8c38d67258b5948c8a0e1d37cb55.
4. **Held-out and checks.** The final round ran once, with 60 fresh judges:
   - the 30 held-out slides;
   - the 10 repeated slides;
   - the 20 table halves from `bench/review-run2a/`. Each side-by-side picture was cut at the middle: the left half is the old build, the right half is the new one. Each half was scaled to 1920 x 1080.

   All 80 pictures were renamed to random 6-character names before judging. `map.json` holds the key, and no judge saw it.

## Results

**Held out, 30 slides (the number that counts):**
- Agreement with Mike: 26 of 30, or 87%. The 95% range is 70% to 95% (Wilson). Cohen's kappa is 0.70.
- Mike passed, judge failed: 1.
- Mike failed, judge passed: 3.
- Reference slides: 14 of 15 agree (0 and 1).
- System slides: 12 of 15 agree (1 and 2).
- For comparison, "always pass" would agree on 19 of 30. On the C cases, no pixel measure from Run 2c got past 14 of 20.

**Tuning, 20 slides:** 19 of 20 agree (0 and 1).

**Repeats, 10 slides:**
- The judge gave the same verdict on the repeat as on the first showing for all 10. Mike did so for 9 of 10.
- Against Mike's own label on each repeat, it agrees on 8 of 10. Both misses are judge PASS against Mike FAIL. One of them is the slide Mike himself flipped (032 PASS, 053 FAIL).

**Old and new tables, judged blind (Mike's verdict is still coming):**
- **Old halves:** the judge failed all 10, as Mike did in round 1b. On every slide this matches its verdict on the same slide shown whole.
- **New halves:** the judge passed 7 of 10. It failed three:
  - 022: profit bridge squashed, labels overlap.
  - 017: waterfall bars are slivers, values cut off.
  - 013: right panel mostly empty.

  These are the three faults already open in `logs/proposals.md` (rows 017/022 and 013).

## Where it goes wrong

- **It leans lenient.** 3 of its 4 held-out misses, its tuning miss and both repeat misses are PASS on slides Mike failed. They are clean-looking chart slides:
  - 058, 045 and 053/059 on the system side;
  - 003 ("needs more colours / looks a bit plain") and 005 ("almost good") on the reference side.

  Mike gave no reason on most of these, so the instructions had nothing to learn from.
- **One strict miss:** 036. The judge failed it for squashed waterfall labels, and Mike passed it.
- **Its main signal is the table point Mike made.** The most common FAIL reason is "navy-header table with a light-blue highlighted row looks AI-made". Now that Run 2a has replaced that table, the judge's FAIL decisions will rest more on its weaker cues: broken charts, empty panels and overflow. We do not yet know how well it agrees with Mike on those. Mike's verdict on the 10 new tables is the first test of that.
- **The judge is the same model family as the builders.** Blind spots they share would not show up here.
- **30 held-out slides is a small sample.** The true agreement could be anywhere from about 70% to 95%.

## Is it good enough to use?

**As a reporting signal next to the movement numbers: yes.**
- It agrees with Mike as often as Mike agrees with himself (87% against his 90% repeat consistency).
- It is fully consistent across repeats.
- It found the three real faults in the new tables without being told about them.

**As the pass or fail on its own: not yet.**
- It passes about one in three of the slides Mike fails: 3 of 11 held out, plus both repeats.
- It has not yet been checked on slides without the old house table.

My suggestion is to wait for Mike's verdict on the 10 new tables. If the judge matches him on at least 8 of 10, the planner could run it beside the benchmark for one or two runs before it becomes the bar. A further option is to have Mike add one-line reasons for the chart slides he failed without a reason (003, 005, 045, 053, 058, 059), then run a second tuning round on fresh slides only. That would address the leniency without touching the held-out set again.

## Files

| File | Contents |
|---|---|
| `split.json` | Seed, tuning, held-out and repeat ids |
| `instructions.md` | The frozen judge instructions |
| `writer-materials/` | Everything the writer saw: redacted texts, tuning labels and the 20 tuning pictures |
| `map.json` | Anonymous name to group and file |
| `out/` | Raw judge answers: `t1-*` for tuning, `h-*` for the final round |
| `judgements.csv` | Every verdict and reason, without Mike's labels |
| `summary.json` | The numbers above |
| `score_all.py` | Re-scores from `out/` against `bench/rating-1.7`. Run it from this folder: `python3 score_all.py ../rating-1.7` |
