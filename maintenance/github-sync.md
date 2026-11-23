# GitHub sync

The folder on the Mac is the source of truth. `github.com/StarrySkies178/powerpoint-deck-system` (private) is its mirror and full history.

## When
- After every applied change (end of `maintenance/learning-loop.md` "Applying an approved change").
- After a deck is built and logged.
- Weekly safety net: a scheduled task runs this file to catch hand edits (e.g. logos dropped into `Objects/`).

## How (Claude)
0. Sign in for the sync on the Mac: `python3 scripts/work.py start "<your chat>" "GitHub sync" GITHUB`, or `add <id> GITHUB` if you are already signed in (`maintenance/working-together.md`). `CONFLICT` means another chat is syncing right now: wait for it to finish, then sync.
1. Attach the repo: `add_repo(owner="StarrySkies178", repo="powerpoint-deck-system", access="push")`, then clone it as the tool says (`git clone --depth 1 ...`).
2. List the folder on the Mac (skip `.DS_Store` and `~$*` lock files), and stage every file with `device_stage_files` (max 50 paths per call). They land in `/mnt/user-data/uploads/Powerpoint/`.
3. Mirror into the clone, so deletions and renames sync too: delete everything in the clone except `.git/`, `.gitignore` and `README.md`, then copy the staged folder in.
3a. Put the big files in as parts (see **Big files** below). Do this on every sync, before `git add`.
3b. Build on the newest GitHub state: `git fetch --depth=20 origin main && git reset -q --mixed origin/main`. The files in the clone stay as you mirrored them; only the starting point moves, so a push by another chat a minute ago is kept and not overwritten.
3c. Leave other chats' unfinished work out: for every path that `python3 scripts/work.py others <id>` prints on the Mac, put GitHub's current version back in the clone (`git checkout HEAD -- <path>`; a file that is not on GitHub yet: take it out of the clone). The chat that holds those files pushes them itself.
4. `git add -A`. If `git status` shows nothing, stop: the repo is already in sync.
5. Commit message = the newest version line in `logs/changelog.md`, e.g. `v1.1: <what changed>`. Use `sync: <date> hand edits` if the changelog hasn't changed.
6. Push with `git -c push.negotiate=true push origin main`. Never force-push. If the push is refused because another chat pushed in the meantime, repeat 3b, 3c, 4 and 5, then push again.
7. Report in one line: version and number of files changed.
8. Release the sync: `python3 scripts/work.py drop <id> GITHUB` (or `done <id>` if that was your last step).

## Rules
- Keep the repo **private**: `Templates/` holds third-party decks.
- Never commit secrets (tokens, `.env`, credentials).
- `logs/active-work/` and `logs/active-work.md` (the sign-in sheet) stay on the Mac: they are in `.gitignore`.
- GitHub rejects files over 100 MB. Never leave such a file out: it goes into the repo as parts (see **Big files**). *Why: a file left out is missing on the phone and on other PCs, where the repo is the only copy.*

## Big files (over 90 MB)

`scripts/bigfiles.py` keeps every file over 90 MB in the repo as 8 MiB parts next to where the file belongs (`Objects/store/media.zip.part00`, `.part01`, ...), with `bigfiles.json` at the repo root (size, sha256 of the file and of every part). The folder on the Mac keeps the whole file and never holds the parts. Today that is `Objects/store/media.zip` and any `archive/media_v*.zip` copy over 90 MB.

On every sync:
1. On the Mac (`device_bash`, in the folder): `python3 scripts/bigfiles.py split . _to_delete/bigfile-parts`. It overwrites the parts from last time, so nothing piles up.
2. Stage `_to_delete/bigfile-parts/bigfiles.json`. It lands in `/mnt/user-data/uploads/Powerpoint/_to_delete/bigfile-parts/` (called `PARTS` below).
3. In the clone, after step 3 of "How": `python3 scripts/bigfiles.py place PARTS .` It keeps every part that has not changed (it restores them from git after the mirror step wiped them) and prints `STILL NEEDED` with the parts that are new or changed.
4. Stage exactly those parts, **one per call**, and run `place` again. Repeat until it prints `placed ...` for every file. `media.zip` only grows at its end, so this is usually the last few parts only.
5. `place` also lists the whole files in `.gitignore` (the marked block; don't edit it by hand) and takes a whole file out of git if an older commit had it.

Check before pushing: `python3 scripts/bigfiles.py join .` in the clone must print `OK` for every file (it rebuilds each file and compares the sha256 with the Mac's).

## Using the repo without the Mac (phone, another PC)

This is what the `deck-system` skill does when the Mac can't be reached.
1. Clone the repo (`git clone --depth 1`, long timeout).
2. `python3 scripts/bigfiles.py join .` rebuilds `Objects/store/media.zip` (and the other big files) and checks them. Every line must say `OK`.
3. Use the clone as the Powerpoint folder. Don't push from it: the next sync from the Mac overwrites the mirror.

## Lessons from real syncs (2026-11-23)
- **Write a manifest first:** `find . -type f ! -name '.DS_Store' ! -name '~$*' ! -path './logs/sync-manifest.tsv' -printf '%P\t%s\n' | sort > logs/sync-manifest.tsv`, stage it, and use it as the checklist: every path must exist in the staged copy with the same size before committing.
- **Stage only what changed** since the last sync (newer mtime, or missing/different size in the staged copy); copies made with `cp -p` keep old dates, so always finish with the size check.
- **One staging call at a time, each ≤ ~35 MB and ≤ 45 files.** Several calls at once time out.
- **Over 100 MB:** solved with parts, see **Big files** above. Until v2.12 `Objects/store/media.zip` was simply left out of the repo, so the object store's pictures were missing there. Run `find . -size +90M` in the clone before every push: apart from the whole files listed in `.gitignore`, it must find nothing.
- **Staging is slow some evenings:** on 2026-11-23 a 131 MB file and a 30 MB piece both timed out, and so did one call with three files adding up to 13 MB; single 9 MB files went through every time. One file per call, and nothing over ~10 MB when a call has just timed out.
- **`_to_delete/`** holds files waiting for the user to delete (sessions can't delete in the folder). It is never synced.
- **Many small files:** zip them on the Mac into `_to_delete/`, stage the zip, unzip into the clone. One call instead of ten.
- **iCloud offloading (2026-11-23):** the folder sits in iCloud Drive, and macOS had removed 472 of 1,474 files from the Mac, some within an hour of being written. In the device shell such a file fails with `Resource deadlock avoided` (and a script that is itself offloaded runs as an empty file: no output, exit 0). The folder is now set to **Keep Downloaded** in Finder (right-click the Powerpoint folder), which stopped it. If the error comes back, the setting was lost: staging a file with `device_stage_files` downloads it again; then set Keep Downloaded once more.
