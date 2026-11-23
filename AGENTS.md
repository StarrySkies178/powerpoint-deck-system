# AGENTS.md

This folder is a deck system: the procedure, style rules, generators, stored objects and learned references for building presentations in one house style. Every AI agent that works here (Claude, Codex, Cursor, Copilot, Gemini, Kimi Code, Hermes or another) starts from this file. It holds no rules of its own. It only says where they are, so they exist in one place.

## Where to start

| You are about to | Read first |
|---|---|
| Do any presentation task (plan, build, edit, check) | `DECK-SYSTEM.md`, in full. Open other files only when its "What to read, and when" table says the step needs them |
| Change any file in this folder, the logs included | `maintenance/working-together.md`, then sign in with `python3 scripts/work.py start "<your name>" "<what you are doing>" <files>` |
| Finish a deck | `maintenance/learning-loop.md` |
| Learn a new reference deck, PDF or scan | `maintenance/new-reference.md` |
| Pick up planned work | `maintenance/roadmap.md` |
| Sync to GitHub, or use the GitHub copy | `maintenance/github-sync.md` |

A freeze on rule and builder changes may be in force. It is announced at the top of `maintenance/working-together.md`; check there before changing anything.

## Limits that hold for every agent

- **This folder is the single source of truth.** Read the current files every time. Do not keep copies of the rules in your own configuration, memory or instructions.
- **Other agents work here at the same time.** Never change a file without signing in, never take a version number or add a changelog row by hand, and stop if the sign-in script answers `CONFLICT`.
- **The GitHub mirror (`StarrySkies178/powerpoint-deck-system`) is private and must stay private:** `Templates/` holds other firms' decks. Never commit secrets. The Mac folder wins over the mirror.
- **If you are working from a clone of the mirror:** run `python3 scripts/bigfiles.py join .` first (every line must say `OK`), do not edit rules, do not push, and hand the deck and the log lines to the user.
- **If you cannot run Python or cannot write to this folder:** work read-only and tell the user which log lines to add.

## For Claude

Claude reaches this folder through the `deck-system` skill. The skill's master copy is `skill/deck-system/SKILL.md`.
