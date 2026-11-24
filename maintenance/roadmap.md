# Roadmap: making the deck system measurable, coordinated, lean and portable

**Status: APPROVED by the user on 2026-11-24. Phase 0 and Phase 1 are closed (Phase 1 on 2026-11-24 11:15 with the AI judge deferred). Phase 4 is open since v2.43 under change control (top of `maintenance/working-together.md`). Phases 2 and 5 run alongside; Phase 3 waits until Phase 4's first round is measured.**
Written by the "Accessing Claude skills across devices" chat. Every step names what backs it: **[Research]** a published source, **[Files]** something measured in this folder, or **[Logic]** reasoning with no outside source. Sources are listed at the end.

## Where the system stands (measured 2026-11-24)

- 42 logged versions in three days; `logs/usage-log.md` records one deck. **[Files]**
- Reproduction benchmark: 9 of 20 in the cloud workspace, unchanged since v2.4 (8 of 20 in the official environment fixed in v2.28, see Phase 1 results). Named slide: 9 of 10. Deck as reference: 0 of 10 in every run, layout 0.00 to 0.30 against a bar of 0.60; 6 of the 10 also fail on body text size. The v2.6 sibling-layout work moved their mean layout from about 0.12 to 0.17. **[Files]** `bench/results-log.md`
- A deck task reads about 78 KB before it starts; `DECK-SYSTEM.md` is 241 lines against its own cap of about 200. **[Files]**
- Three chats change the folder at once; the sign-in sheet exists since v2.19 but only one chat uses it. **[Files]**

## Rules for the whole plan

- **A phase ends with a written result and the user's sign-off.** The result goes under the phase in this file. **[Logic]** A plan with no gates turns back into continuous change.
  - *Delegation (2026-11-24):* the user allowed the "Accessing Claude skills across devices" chat to sign off for him and to keep the work moving on a timed check (every 15 minutes since 02:10 on 2026-11-24), steering the other chats through Claude in Chrome. He added that no step waits for his approval while he is away: a chat that is unsure takes the safe route and carries on, and the access chat answers any question a chat stops on, by the rules in this file, and notes what it chose. That chat signs off only what a pass test in this file decides. It never signs off a step that is the user's own judgement (1.3, the three briefs of 1.5, the ratings of 1.7), never loosens a pass test, and never lifts the freeze before Phase 1's pass test is met.
- **Every pass test is fixed before the work starts and never moved quietly.** **[Files]** The benchmark already works this way (`bench/README.md`).
- **Start with the simplest thing that works; add machinery only when a measurement says it is needed.** **[Research]** Anthropic, Building effective agents.

## Phase 0. Finish the foundation and freeze

0.1 **Adopt the sign-in sheet in all chats.** Save the pending skill card; paste "Read maintenance/working-together.md in the Powerpoint folder and follow it from now on." into the other two chats. **[Research]** Cognition: multi-agent setups work when "writes stay single-threaded". **[Files]** version numbers collided four times without it.
0.2 **Collision drill.** Two chats deliberately sign in for the same file; the second must get CONFLICT. **[Logic]** The sheet has only been tested with simulated chats in one session.
0.3 **Freeze the rules and builders, and take a baseline snapshot** (a tag on the GitHub mirror and the current benchmark numbers). No change to `Generators/`, `Style/` or `DECK-SYSTEM.md` until Phase 1 is signed off, except fixes the measuring work itself needs. **[Research]** Miller (Anthropic): evaluations are experiments. **[Logic]** An experiment needs a baseline that holds still.
- **Pass test:** each chat's next change shows on the sheet; the drill gives CONFLICT; the tag exists.

**Phase 0 result (2026-11-24, v2.23). Signed off on 2026-11-24 under the user's delegation (v2.24).**
- 0.1 Done. The skill card is saved (the saved skill has the "Other chats work in the folder too" section). Both other chats were given the line and answered that they follow the sheet: the deck building and style chat signs in as "Combining markdown files for skills", the references chat as "reference rebuild". Still to be seen: their next real change appearing on the sheet.
- 0.2 Done. With this chat holding `maintenance/working-together.md`, the "Combining markdown files for skills" chat ran `work.py start` for the same file and got `CONFLICT: not signed in. Already held by another chat`, exit code 1, no id.
- 0.3 Done. Freeze notice at the top of `maintenance/working-together.md`; both chats confirmed it. Baseline: commit `7e9bd62` on the GitHub mirror (the v2.23 commit; builders and rules are as at v2.18). The plan asked for a tag; pushing a tag from the chat was refused (403), so the commit id is the marker. It identifies the same snapshot, and the user can add a tag named `baseline-phase0` to it on GitHub at any time. Baseline numbers, last full run (2026-11-24 00:40, v2.18): 9 of 20 pass, standards checks 196 of 212, mean layout 0.44, mean visual 0.49.
- Also done alongside (allowed to start at any time): `logs/proposals.md` (step 2.1), `AGENTS.md` (step 5.1), `skill/deck-system/SKILL.md` (step 5.2).

## Phase 1. Build the measuring instrument

1.1 **Split the benchmark report into two suites.** Regression: the 9 passing cases, which must stay 9 of 9. Capability: the 11 failing cases. **[Research]** Anthropic evals guide: regression tests should sit near 100%, capability tests start low; a capability test that starts passing graduates into the regression suite.
1.2 **Measure the noise.** Rebuild 5 cases from their prompts 3 times each with nothing changed. From then on a case counts as passing only if it passes 3 of 3 rebuilds. **[Research]** Anthropic evals guide: run several trials because outputs vary; Miller: report results with error bars and compare the same items pairwise. **[Logic]** A case that truly passes 70% of the time passes 3 of 3 only 34% of the time, so this rule is strict on purpose: it accepts fewer false improvements.
1.3 **Check the benchmark against the user's eye.** The user looks at the 10 deck-as-reference comparisons (`compare.png`) and marks each acceptable or not. **[Research]** Anthropic evals guide: a 0% pass rate over many trials usually means a broken task or grader, and two experts should reach the same verdict on a task. **[Logic]** If the user accepts slides the metric fails, the layout bar measures something the user does not care about, and that is a decision for the user, not a builder problem.
1.4 **Find the cause of the 0 of 10, one part at a time.** Three builds per case: (a) today's build; (b) the builder is told the original's layout in words, no positions; (c) the builder edits the closest other slide of the same deck. **[Research]** Ng, error analysis by parts: give one component the right answer and see how the result changes. Zheng et al. (PPTAgent): new slides made by editing a chosen reference slide. **[Files]** Leave-one-out still applies: the target slide's own objects stay off limits.
- *Reading it:* (b) passes and (a) fails: the builders can draw it, the gap is choosing a layout from content. (b) fails too: builders are missing. Nothing passes and 1.3 says the slides look fine: the test asks for more than the prompt holds.
1.5 **Three real decks.** Build three decks the user needs, log each in `logs/usage-log.md`. **[Research]** Anthropic evals guide: start from 20 to 50 tasks drawn from real failures. **[Files]** One logged deck is too little.
1.6 **Error analysis before any judge.** A chat and the user go through the slides from 1.5 and write down the kinds of failure they see. These become the judge's criteria. **[Research]** Husain and Shankar: error analysis decides which tests to write in the first place, and writing a rubric before looking at real output is a common mistake.
1.7 **The user rates 60 slides, pass or fail, with one line of reason.** 50 different slides (about half from references, half from the system) in random order, plus 10 of them shown a second time. Source labels hidden. About an hour.
- *Pass or fail with a reason:* **[Research]** Husain. (Note: research on text evaluation by van der Lee et al. prefers 7-point scales or ranking for comparing systems; pass or fail is chosen here because the goal is a judge the user can act on, not a fine ranking.)
- *Random order:* **[Research]** van der Lee et al.: a fixed order can turn order effects into apparent differences.
- *Repeats:* **[Research]** Abercrombie et al.: annotators changed their own answer on more than 25% of items; rating the same item twice measures that, and it is rarely done. The user's own consistency is the ceiling for any judge.
- *Hidden source:* **[Logic]** No source found for this in slide or text evaluation; it is standard blinding from experimental practice.
1.8 **Tune an AI judge on 20 of the slides and check it on the other 30.** **[Research]** Husain: refine the judge until it agrees with the expert, validate on separate data, and report both kinds of error because raw agreement misleads when failures are rare.
- *Pass test for the judge:* at least 27 of 30, with misses listed by kind. **[Research]** Brown, Cai and DasGupta recommend the Wilson interval for small samples; 27 of 30 gives 74% to 97%, while the 13 of 15 in the first draft gave 62% to 96%, too wide to trust. If the judge fails, the user's own ratings stay the measure.
**Phase 1 results so far**
- **1.1 Done (v2.25, deck building chat; checked against the files by the access chat).** `bench/cases.json` tags every case: regression 9 (D01 to D08, Z01), capability 11 (C01 to C10, Z02). `bench_run.py` and `bench/results.md` report both suites and the total: regression 9 of 9, capability 0 of 11, total 9 of 20. Scoring an unchanged build twice gives the same numbers, so the scorer adds no noise of its own.
- **1.2 Done (v2.25).** 5 cases, 3 fresh rebuilds each, every rebuild by its own subagent, kept in `cases/<id>/noise/run1` to `run3`. Layout / visual per run:
  - D03: 0.69/0.80, 0.69/0.83, 0.69/0.80. Pass 3 of 3.
  - D04: 0.87/0.85, 0.87/0.85, 0.88/0.85. Pass 3 of 3.
  - D08: 0.86/0.92, 0.86/0.92, 0.86/0.92. Pass 3 of 3.
  - C04: 0.13/0.24, 0.26/0.30, 0.27/0.27. Fail 3 of 3.
  - C07: 0.38/0.44, 0.38/0.44, 0.48/0.52. Fail 3 of 3.
  - **Noise band:** named-slide cases move by 0.01 on layout and 0.03 on visual between rebuilds; deck-as-reference cases by up to 0.14 on layout and 0.08 on visual. The 15 rebuilds used one model and one instruction text, so this is a lower bound. Rule in force (`bench/README.md`, "Noise band"): a case passes only if 3 of 3 rebuilds pass.
- **What 1.2 found beyond the noise:**
  - *The stored builds are not typical.* Fresh rebuilds scored up to 0.21 higher on layout than the stored build (D08) and 0.24 higher on one run of C07; C04 came out lower. A comparison against the stored builds alone would mislead.
  - *Standards results can flip between rebuilds.* The stored C04 build passes all 11 checks; all three rebuilds fail body text size.
  - *The deck-as-reference cases were not blind.* All six C rebuilders found a description of their own target slide in `Style/slide-map.csv`. The stored C builds probably had the same help. A check inside `bench/` is being added before step 1.4 (proposal logged for the `Style/` side).
  - *A builder bug:* placing a stored object leaves connector lines attached to old shape ids, and the stored issue tree lacks 3 of its 12 lines. Fix is in `Generators/` (frozen): logged in `logs/proposals.md` for Phase 4.
  - *The per-case files on the Mac were from another environment* (run of 12:45): C07 is 0.25 layout there and 0.17 in `results.md`. One official environment is being fixed in `bench/README.md` and the files rewritten.
- **Correction of the access chat's earlier note on mis-rendered reference pictures (measured 2026-11-24).** The mechanism is real: the E-Cluster deck uses Arial MT and the Mindcraft deck Verdana, neither is installed where slides are rendered, and a wider font is swapped in. But it is not why those cases fail: re-rendering the E-Cluster deck with the swap corrected and rescoring gave C04 0.31 to 0.26 on layout and C05 0.00 to 0.00. No grader fix is needed for this and no noise run has to be redone. Tested on 2 of the 10 cases (one deck); the Verdana deck could not be tested for lack of the font.
- **Open observation for 1.3:** the floors are high. Unrelated slides of the same deck already share 0.66 to 0.76 of their ink cells, and the C05 build (0.70) scores below that floor. Either the slide is far off or the layout measure is too blunt for dense slides; the user's look in step 1.3 decides.
- **Official environment fixed (v2.28, deck building chat; checked by the access chat).** The benchmark's official place is the Linux workspace of the Claude desktop app on the Mac (`bench/environment.json`); runs elsewhere are marked not comparable. The same builds differ between the cloud workspace and the Mac by 0.011 on layout and 0.008 on visual on average, at most 0.05. **In the official environment the result is regression 8 of 9, capability 0 of 11, total 8 of 20:** Z01 (Chinese) fails the colour check there. The scorer is not changed for this. Z01 moves to the capability suite, so the regression suite is the 8 cases that pass in the official environment; the scorer proposal (ignore blended tints) waits in `logs/proposals.md` for the user. This replaces the 9 of 20 baseline of Phase 0, which was measured in the cloud workspace.
- **Blind builds (v2.29).** `bench/scripts/heldout.py` gives each deck-as-reference builder its instructions with its own target's row removed from the slide map, and fails a build that cites its target. It caught 13 of 13 planted leaks; the 10 stored C builds are clean; one earlier noise rebuild (C07 run 2) is flagged.
- **1.3 Done (2026-11-24 11:13, the user's own judgement).** The first comparison set drew the originals with substitute fonts (broken labels, overlapping text), so the user asked for correct ones. The four decks were exported to PDF by PowerPoint on the Mac (`bench/originals-powerpoint/`) and the set rebuilt (`bench/review-1.3-powerpoint/`, v2.41). **His verdict: not ok on all 10 (C01 to C10), "all the originals look far better".** The benchmark fails the same 10. So on this group the measure and his eye agree, the bar is not too strict, and the branch "the test asks for more than the prompt holds" does not apply: the builders are not good enough. Rescoring against the PowerPoint originals barely moves the numbers (mean layout 0.14 to 0.13, visual 0.20 to 0.21). His reasons (2026-11-24 11:21): the originals "look more professional", some of the system's slides "look AI and not professional", and "sometimes there are white blank gaps".
  - *What that is on the 10 slides (all ten read by the access chat against the PowerPoint originals):*
    - **Blank gaps:** C01 (empty lower half of the third column and above the banner), C02 (bottom third of the right column), C06 (no background, right and bottom empty), C10 (four empty cells).
    - **Flattened text:** bullet lists joined into one paragraph with semicolons (C02 right column, C10 cells); a bullet and a dash on the same line (C01, "• – Industry Trends"); the bold first level and the italics of the original lost (C01, C06, C08).
    - **Uneven type:** two or three text sizes inside one table or list where the original has one per level (C10, C02, C05).
    - **The deck's own structure replaced by a generic one:** a ruled table turned into floating bars (C05), header row and red summary row turned into chevrons with the rows and columns swapped (C10), a shaded heat map turned into four flat grey boxes (C08).
    - **Content dropped or wrong:** four of eight risks and every risk's description missing (C08), a data row and the growth column missing (C07), wrong chart numbers (C04), bars with the wrong start, end and colour (C02).
    - **Frame missing:** logos, footer band and page frame (all), dark background (C06), title not centred in its band or running past it (C04, C05).
    - **Charts unlike the deck's:** no value axis (C07, C09), totals above the bars and the connector lines replaced by labels inside the segments (C09).
  - Only C03 (a plain table) is close; it differs in row spacing and rule weight.
- **1.4 Done (v2.33, deck building chat; numbers re-read from the result files by the access chat).** 30 blind builds in `bench/diagnosis-1.4/`, one per case and variant, each by its own subagent. Mean layout / visual over the 10 cases: (a) from the brief 0.29 / 0.31; (b) brief plus the layout in words 0.44 / 0.40; (c) edit of the closest other slide 0.24 / 0.28. **Cases passing: 0 of 10 under each.** Layout reaches the 0.60 bar in 1 case under (a) (C09, which then fails body text size), 1 under (b) (C06, which fails visual and standards), 0 under (c).
  - *b minus a:* +0.15 on layout on average (median +0.06; 4 cases up by 0.14 or more: C01, C03, C05, C06; 1 down: C09). With one build each and a spread of 0.29 between cases this is suggestive, not established (about 1.7 standard errors).
  - *c minus a:* -0.04 on layout; no case up by 0.14, two down. **Editing a neighbouring slide is not the route** and is dropped from Phase 4. The builders reported fighting the stored shapes (left-over text settings, stripped logos and rules).
  - *Standards:* body text size fails in 5 of the 10 cases whatever the variant (builders shrink type to make content fit); body margins in C05 and others; C06's dark background is missed by all three.
  - **Reading (by the rule written in step 1.4):** (b) fails too, so being told the layout is not enough. The 0 of 10 has three parts: standards a builder could meet mechanically (body text size first, step 4.1); missing layout knowledge, but only on slides whose arrangement the prompt does not reveal; and a remaining distance that neither remedy closes (visual stays under 0.50 in 8 of 10 even with the layout given). The third part, together with the high floors, fits the branch "the test asks for more than the prompt holds". That branch is the user's decision (a layout hint in the prompt, or a different bar for this group) and waits for his look in step 1.3.
  - More leaks found and closed while running it: a near-duplicate of C10's target elsewhere in its deck, and study notes and a code comment that describe targets. `heldout.py` now covers them.
- **1.5 Done (v2.30).** Three decks built through `DECK-SYSTEM.md` with the frozen generators, in `Claude outputs/2026-11-24 roadmap 1.5 decks/`, all fictional and marked so: an English board deck (12 slides, a Thai coffee chain entering Vietnam), a Simplified Chinese progress report (8 slides), an English investment committee memo (6 slides). Checker: 0 errors on all three; 2, 5 and 0 warnings. Slide counts and titles checked by the access chat. The usage log now holds four decks. Limits: built by the deck building chat itself, not by fresh builders; the briefs were written by the access chat with the user's agreement, they are not his real work.
- **What 1.5 found** (six rows in `logs/proposals.md`, none applied): builder helpers print English labels into a Chinese deck; the measuring script counts a run of Chinese characters as one word; the checker misses a three-line title running into the breadcrumb; chart labels do not shrink in short panels; a number in a summary or title is not checked against its exhibit (the builder caught two such mistakes by reading slide by slide).
- **1.6 Draft ready (v2.34), waiting for the user.** `bench/error-analysis-1.6.md`: 18 kinds of failure in four groups (content, arrangement, type and colour standards, frame), each with one example. Marked DRAFT; no judge is built from it until the user has confirmed, changed or struck the kinds.
- **1.7 Set ready (v2.35), waiting for the user.** `bench/rating-1.7/`: 60 pictures at 1920 x 1080, 25 reference slides from 8 decks and 25 system slides, 10 shown twice, order shuffled, source in `key.json` only. The user rates pass or fail with one line of reason; no chat rates.
- **Suites (v2.32):** Z01 is in the capability suite. Official result: regression 8 of 8, capability 0 of 12.
- **References learned during the freeze (v2.38, reference rebuild chat; verified by the access chat on 2026-11-24 05:30).** 16 references added (13 case decks and 3 briefs of 2021, 2022 and 2024): 252 slides and 262 single diagrams stored, the object store went from 4,062 to 4,576 objects. `scripts/audit_reference.py` says ALL PASS for all 47 references. The freeze held: 22 frozen files (rules, builders, checker, scorer) are byte for byte the baseline of commit `7e9bd62`; 12 lessons went to `logs/proposals.md`. GitHub matches the folder, 3,168 of 3,168 files. Known limits of the rebuilds are listed per deck in `review/<key>/ocr-review-notes.md` (doubled white text on red bars, italics lost, some photos flattened, seven dense appendix pages kept as pictures).
- **Where Phase 1 stands (2026-11-24 03:35):** every step a chat can do is done. Left: the user's look at the 10 comparisons (1.3), his reading of the failure kinds (1.6), his 60 ratings (1.7), then the judge (1.8). Decisions waiting for him: the scorer proposal for Z01, switching the benchmark's reference pictures to the PowerPoint ones, and whether the three test decks stand in for real ones. (The 1.4 branch question is settled by 1.3: the bar stays.)

- **Phase 1 closed on 2026-11-24 11:15 (v2.43).** After his verdict in 1.3 the user was offered two ways on: rate the 60 slides first, or start fixing the builders with the benchmark and his own eye as the measure; he said to do the most logical thing, and the second was the recommendation given to him. Against the pass test below: two suites with a noise band, done; the cause of the 0 of 10 written down with numbers, done (1.3 and 1.4); the judge, **deferred, not built**: step 1.7 (his 60 ratings, `bench/rating-1.7/rate.html`) and step 1.8 stay open, and until they are done the measure for quality beyond the benchmark is his own look at the comparison images after each round. Step 1.6's list of failure kinds is still a draft he has not confirmed. The freeze is replaced by change control.
- **Pass test for Phase 1:** two suites reported with a noise band; the cause of the 0 of 10 written down with numbers; the judge passes or is dropped; user's sign-off.
- **Owners:** deck building and style chat (1.1, 1.2, 1.5 to 1.8); references and rebuild chat (1.4c); user (1.3, 1.7, three briefs).

## Phase 2. One writer, one list (alongside Phase 1)

2.1 **Name one chat the editor of the shared files** (`DECK-SYSTEM.md`, `Style/storytelling.md`, `maintenance/learning-loop.md`). Others append proposals to `logs/proposals.md`. *Set by default on 2026-11-24, the user can change it: the editor is the deck building and style chat ("Combining markdown files for skills").* **[Research]** Cognition.
2.2 **This file is the shared to-do list;** a chat names the phase and step in its sign-in. **[Research]** Anthropic: simplest solution first.
2.3 **Decision rule for more tooling:** after two weeks, more than one recorded conflict a week, or a real need for chats to message each other, leads to a trial of MCP Agent Mail; a to-do list that outgrows this file leads to a trial of Beads. Any third-party tool is read through before it is installed. **[Research]** Both tools exist and are documented; neither is tested here. **[Logic]** Evidence first, then machinery.
- **Pass test:** two weeks with no duplicate version number, no lost edit, GitHub equal to the folder at each check.

## Phase 3. Slim the always-read files (after Phase 1)

3.1 **Give every rule an id and two counters** (used and helped, used and hurt) in `logs/rules.tsv`; builders mark the rules they used after each deck. **[Research]** Zhang et al. (ACE): lessons as separate bullets with an identifier and helpful and harmful counts, added to and updated in place.
3.2 **Observe before cutting.** No rule is retired until it has been used in at least 3 decks. **[Logic]** A counter with one observation is noise.
3.3 **Move detail out of `DECK-SYSTEM.md` to get under 200 lines;** never rewrite a rules file whole. **[Research]** Chroma: 18 models got less reliable as input grew. ACE: a rulebook rewritten whole shrank from 18,282 to 122 tokens and accuracy fell below having none.
3.4 **Test the slim version against the old one on both suites;** keep it only if neither drops beyond the noise band. **[Research]** Miller: paired comparison on the same items.
- **Pass test:** under 200 lines, no drop in either suite.

## Phase 4. Work the capability suite (after 1.4 names the cause)

4.1 **Fix body text size from the deck's style profile first.** **[Files]** It fails in 6 of 10 and is a mechanical fix.
4.2 **Then the fixes that steps 1.3 to 1.5 point to, in this order, one per run** (order set 2026-11-24, v2.43; sibling-slide editing is dropped, step 1.4 showed it adds nothing):
  - *Run 0, the reference pictures:* score against the originals as PowerPoint draws them (`bench/originals-powerpoint/`), for all 20 cases, with floors recomputed; this is a change to the measuring tool, so it is its own run and sets the baseline every later run is compared with. **[Files]** The old pictures were drawn with substitute fonts; the user judged the comparisons on the PowerPoint ones.
  - *Run 1, body text size* (4.1).
  - *Run 2, numbers:* every number on a chart, table or title comes from the prompt, and a build fails its check when a number does not. **[Files]** C04's stored build shows 53, 72, 99 and growth of 23% and 18% where the prompt and the original have 532, 722, 998 and 9% and 13%; the 1.5 decks had two such mistakes caught only by reading.
  - *Run 3, nothing from the prompt is dropped:* every item, row and series of the prompt is on the slide, and a build fails its check when one is missing. **[Files]** C08 lost four of eight risks, C07 a data row and a column.
  - *Run 4, text keeps its levels:* the prompt's bullet levels stay bullet levels (never joined into a paragraph), one marker per line, the first level bold where the reference deck's is, and one type size per level across a slide. **[Files]** C01, C02, C10; the user's "looks AI".
  - *Run 5, no blank gaps:* the body area is filled as the reference deck fills it; a build fails its check when a blank block larger than a set share of the body is left, and an empty table cell is merged or the table reshaped. **[Files]** C01, C02, C06, C10; the user's "white blank gaps".
  - *Run 6, the frame:* a title centred in its band and inside it, the deck's background (dark or light), footer band and source line taken from the reference deck. **[Files]** C04, C05, C06, all ten for the footer. Logos are stored assets and are placed only where the store has them.
  - *Run 7, charts in the reference deck's style:* value axis, totals and data labels, connector lines and legend as the reference deck's own charts have them. **[Files]** C07, C09.
  - *Run 8, the deck's own structure first:* before building, the builder names the reference deck's slide of the same kind and writes its structure in plain words (ruled table, header row, summary row, heat map), then builds to that instead of a generic pattern. **[Files]** C05, C08, C10; step 1.4: a layout description added 0.15 on layout on average. **[Research]** Zheng et al. (PPTAgent) analyse the reference deck's slides before generating.
  - *Run 9, the smaller defects found on the way:* connector lines after placing a stored object (D04), English labels in a Chinese deck, counting Chinese text, the check for a three-line title.
  - Runs 3 to 8 were reordered on 2026-11-24 (v2.44) by the user's reasons in step 1.3: what he named first comes first.
  - After every run the user is shown the 10 comparison images again. **[Logic]** Until the judge of step 1.8 exists, his look is the measure beyond the benchmark.
4.3 **One change per run; compare before and after on the same cases.** **[Research]** Miller: compare the same items pairwise. Dietterich: McNemar's test, which counts only the cases where the two versions differ, keeps false alarms at an acceptable rate. **[Logic]** Its exact form for a handful of cases is the sign test.
- **Pass test:** at least 5 of the 10 pass in 3 of 3 rebuilds and none of the 9 regression cases breaks. **[Logic]** With 5 improved and 0 worse the sign test gives p = 0.03 one-sided; with 4 it gives 0.06, which could still be chance. The first draft's "4 of 10" was too low.
4.4 **Passing cases graduate into the regression suite.** **[Research]** Anthropic evals guide.
4.5 **Add fresh cases from decks not used so far each time cases graduate** (proposed: 10 new for every 5 graduated). **[Research]** Anthropic evals guide: a suite the system fully passes can no longer show improvement, so keep adding tasks. Recht et al.: image models scored 11% to 14% lower on a freshly built copy of their usual test, although their ranking held. **[Logic]** So the pass count on 20 reused cases will overstate how the system does on a new deck; fresh cases give the honest number. The 10 for 5 ratio is this plan's own choice.

## Phase 5. Portable to other AIs (5.1 to 5.3 can start any time)

5.1 **`AGENTS.md` at the folder root.** **[Research]** Read by Codex, Cursor, Copilot, Kimi Code and Hermes among others; held by the Linux Foundation's Agentic AI Foundation. Gemini CLI needs a setting.
5.2 **Master copy of the skill in the folder and on GitHub.** **[Research]** SKILL.md is an open standard used by more than 70 agent platforms, given to the same foundation in October 2026.
5.3 **Phone test.** Build one slide from a phone with the Mac closed. **[Logic]** The fallback has never been run end to end.
5.4 **Three thin tools on an MCP server on the Mac:** change, sync, check. Each only runs the folder's current scripts. **[Research]** MCP is supported by Claude, ChatGPT, Gemini, Cursor, Copilot, Hermes and Kimi Code. Anthropic's tool guidance: few tools, each built around a whole job.
- *Check first:* git on the Mac logged in to GitHub. **[Files]** Reaching a local server from a cloud chat already works for three servers on this Mac (winmux, claude-hermes, setsmart show up as tools in this chat), so a fourth should work the same way; it still gets tested.
- **Pass tests:** Hermes, with no Claude skill, answers a house-style question from the folder and signs in and out correctly; a 150 MB sync completes in one call.

## Phase 6. Controlled self-improvement (last)

6.1 **The loop:** one change, both suites with 3 rebuilds, accept only if regression holds and the result improves beyond the noise band, otherwise roll back from `archive/`. **[Research]** Anthropic: an evaluate-and-refine loop pays off when the evaluation criteria are clear, which is what Phase 1 provides.
6.2 **Re-check the judge every two weeks** on 10 fresh slides rated by the user. **[Research]** Husain: revisit after material changes or periodically.
6.3 **Only after a month of a stable judge:** automatic rule tuning that reads the system's own runs. **[Research]** Agrawal et al. (GEPA). ACE's results got worse on one test when it had no reliable feedback, which is why this comes last.

## Numbers that are this plan's own choices, not taken from a source

3 rebuilds per case; 5 cases for the noise check; 60 slides with 10 repeats; the 20 and 30 split; 27 of 30; 5 of 10; 3 uses before a rule can be retired; two weeks and one conflict a week; 10 new cases per 5 graduated. The methods behind them are sourced above; the exact figures are sized to what one person can rate and what 20 cases can show, and can be changed by the user before a phase starts.

## What could stop this, and what then

- *The judge cannot reach 27 of 30:* the user's ratings stay the measure, 10 slides a week.
- *1.3 and 1.4 show the 0 of 10 test asks for more than the prompt holds:* the user decides between a one-line layout hint in the prompt and a lower layout bar for that group.
- *The other chats do not adopt the sign-in sheet:* all rule changes go through one editor chat.

## Sources

- Anthropic, Building effective agents: anthropic.com/engineering/building-effective-agents
- Anthropic, Demystifying evals for AI agents: anthropic.com/engineering/demystifying-evals-for-ai-agents
- Miller (Anthropic), Adding Error Bars to Evals: arxiv.org/abs/2411.00640
- Husain, Using LLM-as-a-Judge for Evaluation: hamel.dev/blog/posts/llm-judge. Husain and Shankar, Why is error analysis so important in AI evals: hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html
- Ng, Advice for applying machine learning (error analysis): web.stanford.edu/class/cs129/advice.pdf
- van der Lee et al., Best practices for the human evaluation of automatically generated text: aclanthology.org/W19-8643
- Abercrombie et al., Consistency is Key (intra-annotator agreement): arxiv.org/abs/2301.10684
- Brown, Cai and DasGupta, Interval Estimation for a Binomial Proportion: doi.org/10.1214/ss/1009213286
- Dietterich, Approximate Statistical Tests for Comparing Supervised Classification Learning Algorithms: doi.org/10.1162/089976698300017197
- Recht et al., Do ImageNet Classifiers Generalize to ImageNet?: arxiv.org/abs/1902.10811
- Cognition, Multi-Agents: What's Actually Working: cognition.com/blog/multi-agents-working
- Chroma, Context Rot: research.trychroma.com/context-rot
- Zhang et al., Agentic Context Engineering: arxiv.org/abs/2510.04618
- Zheng et al., PPTAgent: arxiv.org/abs/2501.03936
- Agrawal et al., GEPA: arxiv.org/abs/2507.19457
- Agentic AI Foundation: openai.com/index/agentic-ai-foundation; anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation
- Anthropic, Writing effective tools for agents: anthropic.com/engineering/writing-tools-for-agents
- MCP Agent Mail: github.com/Dicklesworthstone/mcp_agent_mail. Beads: github.com/steveyegge/beads
