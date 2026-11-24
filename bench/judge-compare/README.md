# The comparison judge (stage one: mimic the reference)

Built on 2026-11-24 by the deck building chat ("Combining markdown files for skills"), in roadmap 4.2's order of the next runs, item (i). The judge is **not wired into the benchmark**, and no rule, builder or scorer changed.

## What it is

The judge is a fresh agent shown **one side-by-side picture**: the original slide (drawn by PowerPoint) on the left and a build on the right. It answers **OK or NOT OK** with one line of reason, the way Mike answered C01 to C10. It sees only `instructions.md` and the picture. The case id label at the top of each picture is blanked (`tools/anon.py`), and the picture is given a random name.

## How it was made

1. **The instructions were written from Mike's words only.** The writer agent was given:
   - `writer/mike-words.md`:
     - step 1.3: all ten not ok, "all the originals look far better", "look more professional", "look AI and not professional", "white blank gaps";
     - review-run2: nine ok, C08 "could be better", a plain 3 by 3 grid where the original has a shaded heat map with the risks placed on it;
     - what he tolerated, from `bench/calibration-2c.md` (C06 passed without the dark background, C03 and C05 passed at low overlap);
     - his goal ("mimic first").
   - `writer/calibration-2c.md`.
   - The 20 labelled pictures, with `writer/labels.csv` giving 9 OK and 11 NOT OK.

   It was told to write general criteria and not to name cases, decks or pictures.
2. **All 20 were used for tuning, so there is no held-out number.** Each tuning round gave every picture to its own fresh judge.

## Tuning agreement (in-sample: tuned on these same 20)

| Round | Instructions | Agreement | His OK judged NOT OK | His NOT OK judged OK |
|---|---|---|---|---|
| c1 | first draft (md5 34864b4e…, 983 words; not kept) | 14 of 20 | 4 | 2 |
| c2 | revised, **frozen** (`instructions.md`, md5 c086b82f8dbead9528f1d577e8fcd2f1, 965 words) | **19 of 20** | 0 | 1 |

- **What changed between the rounds.** In c1 the judges failed four builds Mike had accepted, each on one local flaw: an empty cell, Gantt rows without bars, crowded labels, text tight to an edge. They also passed a build that had dropped the original's designed background and left plain text on white. The c2 instructions judge the whole slide at normal size and list the local flaws he tolerated. They add one fault: "design dropped and not replaced".
- **c1 was also less clean.** Several c1 judges saved their crops under the same `/tmp` names, so some of them briefly saw another slide. From c2 on, each judge gets its own crop folder.
- **The one miss in c2** is the step 1.3 table build of C03. The writer measured it against the accepted run-2 build of the same slide and found no visible difference that would separate them. His "no" there most likely comes from the "all the originals look far better" frame of step 1.3, so it was left as a miss rather than fitted.
- Per-picture verdicts and reasons for both rounds are in `tuning-c1.txt` and `tuning-c2.txt`. The raw answers are in `out/`.

**What 19 of 20 means, said plainly.** The instructions were revised after seeing which of these 20 the judge got wrong. 19 of 20 therefore says the instructions can express his verdicts. It does not say how the judge will do on new slides. With 20 labels and no held-out set, there is no honest held-out figure.

## The real test is prospective

From now on, every time ten new comparisons are made for Mike:

1. Make the pictures (original by PowerPoint left, build right), then anonymise them: `python3 tools/anon.py <dir> <seed> C01=<png> ...`
2. Give each picture its own fresh judge with the text of `tools/judge-prompt.txt` and the frozen `instructions.md`.
3. **Before the pictures go to Mike:** `python3 tools/predict.py <dir> <out> <round> instructions.md predictions-<set>.csv`. This writes the judge's answers with a UTC timestamp, the instructions' md5 and each picture's md5, and refuses to overwrite an existing file. Then commit it to GitHub, so the commit time proves it came first.
4. When he answers, save his verdicts as `mike-<set>.csv` (columns case, verdict, reason) and run `python3 tools/agree.py predictions-<set>.csv mike-<set>.csv <set> track-record.md`. This prints agreement both ways and adds a line to `track-record.md`.
5. **The judge takes over when it has matched him on at least 9 of 10 in two sets in a row.** Until then his look stays the measure. The instructions stay frozen between sets. If they are revised, the count starts again.

The first set is Run 5 (`predictions-run5.csv`).

## Files

| File | Contents |
|---|---|
| `instructions.md` | The frozen judge instructions (v2, from the second tuning) |
| `instructions-v1-c2.md` | The first frozen version (c2), used for `predictions-run5.csv` |
| `writer/` | Everything the writer saw (its 20 pictures are the ones in `pics/`), plus the c1 results sent back to it |
| `pics/` | The 20 anonymised tuning pictures and `map.json` (never shown to judges) |
| `out/` | Raw answers: `c1-*`, `c2-*` |
| `tuning-c1.txt`, `tuning-c2.txt` | Agreement per picture, from `score.py` |
| `tools/` | `anon.py`, `judge-prompt.txt`, `predict.py`, `agree.py` |
| `track-record.md` | Agreement on each new set |

## Second tuning (2026-11-24, at the close of Run 7)

**What went in.** Mike answered the Run 5 set at 16:04 and agreed with the judge on 8 of 10:
- C04: he said NOT OK, "good but the fine jewlellts bar chart loks ugly smhow?". The judge had said OK.
- C08: he said OK, "ok but do u think the idk what siit calld the diff colored sqaures look better in original?". The judge had said NOT OK.

**How it was retuned.**
- A fresh writer agent revised the instructions. It worked from the 20 earlier labels plus the ten Run 5 labels with his words (`writer2/labels-run5.csv`), and the planner's note on what the C04 chart is.
- What it changed:
  - New fault: "one exhibit drawn clumsily". Even a small side chart fails the build when it looks awkward next to the original.
  - A simplified map or matrix becomes a remark, not a fail, when it keeps its axes, labels, every item in its position and the highlight.
  - A different chart form is tolerated only when it is equally rich and equally neat.
- The old instructions are kept as `instructions-v1-c2.md`. The new frozen file is `instructions.md` (md5 7ae3963341f2e1e8ede3ed6d7b654e9b, 995 words).

**Tuning check, in-sample (round c3, `tuning-c3.txt`).** 30 fresh judges, one per picture: **28 of 30**.
- His OK judged NOT OK: 1. This is the run-2 C04 build. The new clumsy-exhibit rule fires on its thin segment slivers, which he had accepted.
- His NOT OK judged OK: 1. This is the step 1.3 C03 build, the known unreachable miss.
- Like round c2, this is tuned on the same pictures, so it is not a held-out number.

**The count of sets in a row restarts with the retune.** A set judged before a retune does not count toward the two in a row, so the Run 5 line in `track-record.md` stays as a record only. `predictions-run7.csv` is the first set judged with v2.
