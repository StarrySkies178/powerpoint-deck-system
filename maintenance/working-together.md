# Working together: several chats in one folder

More than one chat changes this folder at the same time (on 2026-11-23 three Claude chats did, and Hermes can too). Chats cannot see each other's conversations. The only thing they share is this folder, so the folder carries the sign-in sheet. `scripts/work.py` keeps it.

*Why: without a sheet, version numbers collided at least four times (0.6 and 1.1 were each logged twice; 2.11 and 2.15 were each taken by a second chat mid-work), two chats edited `maintenance/github-sync.md` in the same half hour, and 280 files of v2.9 were missing from GitHub for hours while later versions were pushed. (Why those files were not pushed at the time is not recorded; with a claim on `GITHUB` and one chat syncing the whole folder at a time, a gap like that shows up at the next sync.)*

**What to work on:** the shared plan is `maintenance/roadmap.md`. The user approved it on 2026-11-24. When you take one of its steps, name the phase and step in your sign-in.

> **FREEZE in force since v2.23 (2026-11-24), until Phase 1 of the roadmap passes its test.** (Made specific in v2.27.)
>
> **The principle:** until the benchmark is a trustworthy measure, nothing may change that decides how a slide is *chosen, drawn or checked*. Adding reference *data* and building decks goes on as usual.
>
> | Path | During the freeze |
> |---|---|
> | `DECK-SYSTEM.md`, `Style/style-rules.md`, `Style/storytelling.md`, `Style/style-findings.md`, `Style/patterns.json`, `Style/pattern-catalogue.md`, `catalogue/`, `master/` | **No change.** |
> | `Generators/` deck builders: `house.js`, `patterns*.js`, `components.py`, `objstore.py`, `fill_objects.py`, `part_patterns.py`, `build_*.js`, `icons.json` | **No change.** A bug found here goes to `logs/proposals.md`. |
> | `scripts/deck_lint.py`, `deck_measure.py`, `composition.py`, `layout_*.py`, `bench/scripts/bench_score.py` and the pass bar in `bench/README.md` | **No change** (they decide what passes). |
> | `Style/slide-map.csv`, `Style/slide-index.md`, `Generators/ocr_autofix.json` | **Append only:** new rows or entries for a reference being learned. Never edit or remove an existing row. |
> | `Templates/`, `Objects/store/`, `Objects/Visual/`, `Objects/maps/`, `review/`, `Style/refs/` (study files, profiles, `references.json`) | **Allowed.** This is how a reference is learned and stored. |
> | Reference tools: `Generators/rebuild_slides.py`, `ocr_review.py`, `vectorize.py`, `scripts/ingest_reference.py`, `audit_reference.py`, `study_reference.py`, `make_style_profile.py`, `measure_type_scale.py` | **Bug fixes only**, when a reference cannot be learned without them. Say so in the changelog row. |
> | `bench/` other than the scorer and the pass bar | **Allowed when a roadmap step asks for it.** |
> | `logs/`, `samples/`, deck output folders, `design-system/`, `maintenance/` files of your own lane, `scripts/work.py`, `scripts/bigfiles.py` | **Allowed.** |
>
> **What replaces the usual steps while the freeze is on:**
> - *A lesson or rule you would apply straight away* (`maintenance/learning-loop.md`, the skill): write it in `logs/lessons-log.md` as usual, add one row to `logs/proposals.md`, do not apply it.
> - *A new story pattern found in a reference* (`maintenance/new-reference.md`, "New patterns"): describe it in the reference's study file in `Style/refs/` and add one row to `logs/proposals.md`. No entry in `Style/patterns.json` or `pattern-catalogue.md`, no generator.
> - *A deck needs a layout no builder draws:* draw it in that deck's own build script. Do not add it to `Generators/`. Log a proposal.
> - *A slide flagged NEW:* same, a proposal, no catalogue entry and no generator.
> - *The reference audit:* a reference may be reported as learned when `scripts/audit_reference.py` passes for it. The audit needs nothing from the frozen files beyond new rows in `Style/slide-map.csv`.
>
> **The only exception:** a fix that a Phase 1 measuring step itself needs. Say so in your sign-in and in the changelog row.
>
> **If you are not sure whether something is allowed, do not stop to ask the user,** who may be away. Take the safe route (the reference's own files in `Style/refs/`, or a row in `logs/proposals.md`), carry on with the rest of the job, and say in your reply what you left for later.
>
> **Who lifts it:** the freeze ends when Phase 1's pass test in `maintenance/roadmap.md` is met. No chat lifts it early.

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
