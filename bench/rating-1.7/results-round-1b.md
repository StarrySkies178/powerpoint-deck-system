# Roadmap 1.7: Mike's 60 ratings, scored

Rated by Mike on 2026-11-24 about 11:50 on the pictures redrawn by PowerPoint (v2.45), in `rate.html`, without seeing where a slide came from. His answers are in `ratings.csv`. Scored against `key.json` by the planning chat. Reasons were given for 6 slides only; after rating he added one general reason, quoted below.

## Result

| | Passed | Share |
|---|---|---|
| Reference slides (25 different) | 22 | 88% |
| System slides (25 different) | 13 | 52% |
| Same answer both times (10 slides shown twice) | 9 of 10 | |

The one slide rated differently the second time is Doi Sky slide 3 (two charts): pass as `032.png`, fail as `053.png`.

## System slides by where they came from

| Source | Passed |
|---|---|
| 1.4 diagnosis builds (built to a reference deck's look): C04, C07, C08, C09, C10 | 5 of 5 |
| Sample deck v0.6 (house style) | 4 of 6 |
| Doi Sky board deck (house style) | 3 of 6 |
| 华拓精密 management deck (house style) | 1 of 4 |
| Northwind IC deck (house style) | 0 of 4 |

So a slide built to a reference deck's look passes on its own (5 of 5), although the same kind of build lost every side-by-side comparison in step 1.3. The house-style slides pass 8 of 20.

## What Mike said, and what the ratings show

Mike, after rating: "main problem ... is the tables looks so bad and i know its ai right away because if u look at examples none of them uses tables like that".

Checked against the files (native tables counted with python-pptx):

- **House-style slides with a table: 10, all 10 failed** (`013`, `015`, `017`, `021`, `022`, `025`, `026`, `030`, `034`, `048`).
- **House-style slides without a table: 10, 8 passed.** The two that failed: `045` (the Chinese Gantt) and `058` (two charts).
- Every one of those tables is the same object: a solid navy header band (#002776) with white bold text, hairline rows, one row tinted light blue, small text, often stretched across the full width as a low strip (12.5 in wide and 1.3 to 1.6 in high on 4 slides).
- **The references do use tables, but not that one.** In the 12 native reference decks: 126 tables on 99 of 276 slides. 76 of the 126 (60%) have no filled header band at all, and only 34 (27%) span the full slide width. Their tables carry things inside the cells (bars, icons, tinted chips, circled values), use coloured row-label blocks or separate column panels, or are plain ruled financial statements.

The table is the clearest single mark of the system's slides in this set.

## The reference slides that failed

All three are from the Mindcraft deck: `003` (slide 18, "needs more colors / visuals looks a bit plain"), `005` (slide 4, "almost good"), `054` (slide 11, "good but some parts are broken?": the table at the right edge runs under the logo; PowerPoint draws it that way from the file). On `010` (Polaris slide 8, passed) Mike noted the chart "breaks"; that too is how PowerPoint draws the file.

## What this is used for

- The table goes first in Phase 4 after the runs already handed out (roadmap 4.2, "Run 2a").
- These 60 labels are the data for the AI judge of step 1.8 (20 to tune, 30 to check), still deferred. With reasons on 6 slides only, the judge will have little to learn "why" from; the reasons in `bench/error-analysis-1.6-references.md` and this file fill part of that.
