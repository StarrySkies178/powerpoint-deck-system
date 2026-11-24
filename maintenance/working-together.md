# Working together: several chats in one folder

More than one chat changes this folder at the same time (on 2026-11-23 three Claude chats did, and Hermes can too). Chats cannot see each other's conversations. The only thing they share is this folder, so the folder carries the sign-in sheet. `scripts/work.py` keeps it.

*Why: without a sheet, version numbers collided at least four times (0.6 and 1.1 were each logged twice; 2.11 and 2.15 were each taken by a second chat mid-work), two chats edited `maintenance/github-sync.md` in the same half hour, and 280 files of v2.9 were missing from GitHub for hours while later versions were pushed. (Why those files were not pushed at the time is not recorded; with a claim on `GITHUB` and one chat syncing the whole folder at a time, a gap like that shows up at the next sync.)*

**What to work on:** the shared plan is `maintenance/roadmap.md`. The user approved it on 2026-11-24. When you take one of its steps, name the phase and step in your sign-in.

> **CHANGE CONTROL in force since v2.43 (2026-11-24).** The freeze of v2.23 ended when Phase 1 of the roadmap closed: the benchmark is now a trusted measure (two suites, noise band, blind builds, and the user's own verdict agreeing with it on all 10 deck-as-reference cases). Builders and rules may change again, but only like this:
>
> 1. **One chat changes builders, rules and checkers: the deck building chat** ("Combining markdown files for skills", the editor of roadmap step 2.1). That means `DECK-SYSTEM.md`, `Style/style-rules.md`, `Style/storytelling.md`, `Style/style-findings.md`, `Style/patterns.json`, `Style/pattern-catalogue.md`, `catalogue/`, `master/`, the deck builders in `Generators/` (`house.js`, `patterns*.js`, `components.py`, `objstore.py`, `fill_objects.py`, `part_patterns.py`, `build_*.js`, `icons.json`), `scripts/deck_lint.py`, `deck_measure.py`, `composition.py`, `layout_*.py`. Every other chat keeps adding a row to `logs/proposals.md` and does not apply it.
> 2. **One change per run.** A change is one row of `logs/proposals.md` (or one named fix). Never two at once: otherwise nobody can tell which one helped.
> 3. **Measured before it is kept (rewritten v2.73 with the user's yes of 2026-11-24 17:15).** Run both suites in the official environment before and after, and make 3 fresh blind rebuilds of every deck-as-reference case. A change is kept only if all of these hold: **(a) the regression suite stays all-pass**, and named-slide cases do not get worse by more than 0.03 on layout or visual (unchanged, automatic: restore at once if this fails). **(b) the look does not get worse on the deck-as-reference cases.** The ten comparison pictures of the run go to the user (the comparison judge answers first; once it has matched him on at least 9 of 10 in two sets in a row it answers alone). Keep the change if his count of ok does not go down and no case the change is aimed at goes from ok to not ok. Where a run holds several builders, each is kept or dropped by its own target case. **(c) the overlap number is an alarm, not a verdict.** `bench_rebuilds.py` compares each case's mean `layout_raw` with its baseline in `bench/phase4/baseline.md` (the mean over every fresh build made with kept code, not one earlier run) and flags a fall of more than 0.05. A flagged case is looked at by the planner and named in the changelog row: if the user or the judge still accepts it, the flag does not block; if he rejects it, it does. A flag on a case the change does not touch is first rebuilt 3 more times before anyone acts on it. Why: `bench/calibration-2c.md` showed that the overlap does not predict his verdict (best AUC 0.64), and Run 5 and Run 7 were restored for falls on cases they did not touch (C05 in three unrelated runs) while he accepted those very builds. When a change is not kept, restore the archived files and mark the proposal "tried, not kept" with the numbers and his verdict. (Until v2.61 the band was 0.14 on the floored layout or visual; from v2.62 to v2.72 a fall of 0.05 against the run before restored the change automatically.)
> 4. **The changelog row carries the numbers:** regression and capability counts and the mean layout and visual of the capability suite, before and after.
> 5. **The scorer, the pass bar and the benchmark's reference pictures are not changed to make a run pass.** A change to them is its own run, with the reason, and a re-run of all cases.
> 6. **Reference data stays as before:** `Style/slide-map.csv`, `Style/slide-index.md` and `Generators/ocr_autofix.json` are append-only for a reference being learned; `Templates/`, `Objects/store/`, `Objects/Visual/`, `Objects/maps/`, `review/`, `Style/refs/` are open to the references lane; the reference tools take bug fixes only.
> 7. **If you are not sure whether something is allowed, do not stop to ask the user,** who may be away. Add a row to `logs/proposals.md`, carry on with the rest of the job, and say in your reply what you left for later.

Read this before you change **any** file in the folder: rules, scripts, generators, style, the object store, the logs. Building a deck without changing the system needs no sign-in until Stage 6 (the logs).

## The rules

1. **Sign in first.** Say who you are, what you are doing, and which files you will change:
   `python3 scripts/work.py start "<your chat's name>" "<what you are doing>" <file> <folder/> ...`
   It prints your id. Keep it for the next commands. Claim only what you will really change; claim a whole folder only if you will change most of it. Need another file later: `add <id> <file>`.
   - `CONFLICT` means another chat holds one of those files. Do not edit it. Do another part of the job, or wait and run `start` again. Tell the user if it blocks you for long.
   - Your name is the chat's title if you know it, otherwise a few words for your job ("reference rebuild"). Hermes signs in as "Hermes".
2. **Take your version number from the script**, as soon as you know the change will be logged: `python3 scripts/work.py version <id>`. Never read "the next number" off the changelog yourself: another chat may be reading the same line.
3. **Add your changelog row with the script**: `python3 scripts/work.py log <id> "<what changed>" "<why>" "<files touched>"`. It writes the row under your number and chats take turns, so no row is lost. Fixing the wording of your own row afterwards is an in-place edit of that one line.
4. **Edit in place, at the moment you write.** Change a file with one command that reads it and writes it back at once (`sed -i`, or a short Python read-modify-write). Never write back a copy you read minutes ago: it wipes whatever another chat added since. When a file goes from the cloud to the Mac with `device_commit_files`, pass `expectedMtimeMs` from the staging result; if it is refused, stage again and redo your edit on the new copy.
5. **Hold shared files for minutes, not hours.** `DECK-SYSTEM.md`, `maintenance/learning-loop.md` and `Style/storytelling.md` are edited by every lane. Make your edit, then `python3 scripts/work.py drop <id> <file>` and carry on with your own files.
6. **Shared jobs are claimed like files.** A GitHub sync claims `GITHUB`; publishing the Claude design system claims `DESIGN-SYSTEM`. One chat at a time.
7. **Never push another chat's half-finished work.** In a sync, run `python3 scripts/work.py others <id>` and leave every path it prints as GitHub has it now (after the mirror step, `git checkout HEAD -- <path>`; a new file that is not in the repo yet stays out). Fetch before you push, and never force-push.
8. **Sign out** when your change is logged and synced: `python3 scripts/work.py done <id>`. On a long job, run `touch <id>` at least every 3 hours: an older sign-in is marked STALE and no longer blocks anyone.

`python3 scripts/work.py status` shows who is signed in. The same list is in `logs/active-work.md` for people to read.

## Lanes

A habit, not a lock: the sign-in sheet decides. But stay in your lane unless the user sends you out of it, and expect the other lane's files to be in use.

| Lane | Usually owns |
|---|---|
| **References and rebuild** (learning a deck, PDF or scan; the object store) | `Templates/`, `Objects/store/`, `review/`, `Style/refs/`, `Generators/rebuild_slides.py`, `ocr_review.py`, `ocr_autofix.json`, `vectorize.py`, `objstore.py`, `scripts/ingest_reference.py`, `audit_reference.py`, `study_reference.py`, `maintenance/new-reference.md` |
| **Deck building and style** (generators, house style, sample decks, benchmark, the Claude design system) | `Generators/patterns*.js`, `house.js`, `build_sample.js`, `Style/style-rules.md`, `catalogue/`, `master/`, `samples/`, `bench/`, `scripts/deck_lint.py`, `design-system/`, `maintenance/output-routes.md` |
| **Access and sync** (GitHub mirror, other devices, this file) | `maintenance/github-sync.md`, `maintenance/working-together.md`, `scripts/bigfiles.py`, `scripts/work.py` |
| **Everyone** (rule 5 applies) | `DECK-SYSTEM.md`, `maintenance/learning-loop.md`, `Style/storytelling.md`, `logs/` |

## When something looks wrong

- **A file changed under you** (it differs from what you read): read it again and redo your edit on top. Never restore your older copy.
- **Files are changing but nobody is signed in:** a chat that started before 2026-11-24 may not know these rules. Before editing a shared file, check `find <file> -mmin -10`. If it changed in the last 10 minutes and it wasn't you, wait a few minutes, read it again, then make a small in-place edit. Tell the user, who can paste this line into the other chat: "Read maintenance/working-together.md and follow it from now on."
- **A STALE sign-in:** that chat stopped or forgot to sign out. Its files are free. If its job looks half-done (a reserved version with no changelog row), tell the user.
- **The script fails:** say so and stop changing shared files. Do not work around the sheet.

## How it works

Chats cannot delete files in this folder, so nothing here relies on deleting. A sign-in is one small file in `logs/active-work/`; signing out moves it to `logs/active-work/done/`. A version number is a file in `logs/active-work/versions/` that can only be created once. Changelog turns pass a token file that is renamed, never removed. None of this is synced to GitHub.
