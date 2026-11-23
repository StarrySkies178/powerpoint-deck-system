# Publishing the design system

Run `python3 scripts/sync_design_system.py` first. Publish only when it prints `PUBLISH NEEDED` (the list is also in `design-system/sync-report.md`). This needs Claude's Artifact tools (`mcp__claude-artifacts__*`); a session without them reports "publish needed" and stops.

Artifact: **Powerpoint House Style**, slug `bdb2a818-b0e8-4a20-b3aa-570e174fdc7e` (made from the Design System type, private).

1. `list_files` on the slug: note the `version`. If a listed file's hash differs from `state.json` → `published_files`, someone edited the design system in Claude: read that file, bring the change into the folder first (the folder wins, but don't lose work).
2. Stage the changed files from the Mac (`device_stage_files`), copy them under `/mnt/user-data/outputs/…`, then `publish_files` with `mode: "patch"`, `base_version` = that version, each file `as: "project/<path under design-system/project>"`. Everything **except** `design-system.json`.
3. Set `lastChange` in `design-system/project/design-system.json` (`at` = now, `note` = folder version and what changed), then publish `project/design-system.json` alone, last, with the new `base_version`.
4. New or changed pictures: `upload_asset`, put the returned ids into `tools/asset-blobs.json` and into `assetGroups` of `design-system.json` (step 3).
5. `python3 scripts/sync_design_system.py --mark-published <version from step 3>`, then sync GitHub.
6. If components changed, open the design system in Claude and look at the affected previews.
