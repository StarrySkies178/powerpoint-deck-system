# Working together: several chats in one folder

More than one chat changes this folder at the same time (on 2026-11-23 three Claude chats did, and Hermes can too). Chats cannot see each other's conversations. The only thing they share is this folder, so the folder carries the sign-in sheet. `scripts/work.py` keeps it.

*Why: without a sheet, version numbers collided at least three times (1.1 was logged twice; 2.11 and 2.15 were each taken by a second chat mid-work), two chats edited `maintenance/github-sync.md` in the same half hour, and 280 files went unsynced to GitHub for hours because each chat pushed only around the other's work.*

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
