# GitHub sync

The folder on the Mac is the source of truth. `github.com/StarrySkies178/powerpoint-deck-system` (private) is its mirror and full history.

## When
- After every applied change (end of `maintenance/learning-loop.md` "Applying an approved change").
- After a deck is built and logged.
- Weekly safety net: a scheduled task runs this file to catch hand edits (e.g. logos dropped into `Objects/`).

## How (Claude)
1. Attach the repo: `add_repo(owner="StarrySkies178", repo="powerpoint-deck-system", access="push")`, then clone it as the tool says (`git clone --depth 1 ...`).
2. List the folder on the Mac (skip `.DS_Store` and `~$*` lock files), and stage every file with `device_stage_files` (max 50 paths per call). They land in `/mnt/user-data/uploads/Powerpoint/`.
3. Mirror into the clone, so deletions and renames sync too: delete everything in the clone except `.git/`, `.gitignore` and `README.md`, then copy the staged folder in.
4. `git add -A`. If `git status` shows nothing, stop: the repo is already in sync.
5. Commit message = the newest version line in `logs/changelog.md`, e.g. `v1.1: <what changed>`. Use `sync: <date> hand edits` if the changelog hasn't changed.
6. Push with `git -c push.negotiate=true push origin main`. Never force-push.
7. Report in one line: version and number of files changed.

## Rules
- Keep the repo **private**: `Templates/` holds third-party decks.
- Never commit secrets (tokens, `.env`, credentials).
- GitHub rejects files over 100 MB. If one appears, leave it out and tell the user.

## Lessons from real syncs (2026-11-23)
- **Write a manifest first:** `find . -type f ! -name '.DS_Store' ! -name '~$*' ! -path './logs/sync-manifest.tsv' -printf '%P\t%s\n' | sort > logs/sync-manifest.tsv`, stage it, and use it as the checklist: every path must exist in the staged copy with the same size before committing.
- **Stage only what changed** since the last sync (newer mtime, or missing/different size in the staged copy); copies made with `cp -p` keep old dates, so always finish with the size check.
- **One staging call at a time, each ≤ ~35 MB and ≤ 45 files.** Several calls at once time out.
- **Over 100 MB:** `Objects/store/media.zip` (101.8 MB on 2026-11-23) stays out of the repo (`.gitignore`); it can be rebuilt from `archive/media_v2.2_*.zip` + `archive/_incoming/done/v23/store/media-add-*.zip`. Check `find . -size +95M` before every push.
- **`_to_delete/`** holds files waiting for the user to delete (sessions can't delete in the folder). It is never synced.
- **Many small files:** zip them on the Mac into `_to_delete/`, stage the zip, unzip into the clone. One call instead of ten.
- **iCloud offloading (2026-11-23):** the folder sits in iCloud Drive, and macOS had removed 472 of 1,474 files from the Mac, some within an hour of being written. In the device shell such a file fails with `Resource deadlock avoided` (and a script that is itself offloaded runs as an empty file: no output, exit 0). The folder is now set to **Keep Downloaded** in Finder (right-click the Powerpoint folder), which stopped it. If the error comes back, the setting was lost: staging a file with `device_stage_files` downloads it again; then set Keep Downloaded once more.
