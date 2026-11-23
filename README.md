# powerpoint-deck-system

Private mirror of `~/Documents/Claude/Projects/Powerpoint`: the rules, house style, catalogue, scripts, generators, master template, object store and reference decks that Claude and Hermes use to build PowerPoint decks.

- Start with `DECK-SYSTEM.md` (the procedure read on every deck task).
- Version history: `logs/changelog.md`. Every commit message starts with the changelog version.
- The folder on the Mac is the source of truth; this repo is synced from it after every rule change, plus a weekly safety-net sync.
- `Templates/` contains third-party reference decks: keep this repo private.
- Files over 90 MB are stored as 8 MiB parts (`*.partNN`, listed in `bigfiles.json`). After cloning, run `python3 scripts/bigfiles.py join .` to rebuild them, e.g. `Objects/store/media.zip`, the pictures of the object store. Details: `maintenance/github-sync.md`.
