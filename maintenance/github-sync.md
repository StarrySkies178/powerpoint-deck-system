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
