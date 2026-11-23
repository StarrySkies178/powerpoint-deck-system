---
name: "deck-system"
description: "Use for any presentation, slide deck, pitch deck or PowerPoint (.pptx) task: creating, editing, planning, checking or improving slides, including Chinese requests (演示文稿, 幻灯片, PPT). Builds in the user's house style."
---

# Deck System (pointer skill)

The rules are NOT in this skill. They live in the user's Powerpoint folder (Documents/Claude/Projects/Powerpoint). That folder is the single source of truth and changes over time, so always read the current files. The only copy you may use is the private GitHub mirror named in step 1, and only when the Mac can't be reached. Never rely on memory or on past chats.

## Every deck task
1. Find the Powerpoint folder at `~/Documents/Claude/Projects/Powerpoint` on the user's Mac. If it isn't connected to this chat, request access to that exact folder with the device folder-access tool.

   **Fallback when the Mac can't be reached** (phone, another PC, Mac asleep or off, or no device tools in this session): do not stop and do not ask the user to open their Mac. Pull the private mirror `StarrySkies178/powerpoint-deck-system` instead. Attach it with the add-repo tool (read access) if the session has one, clone it as that tool says (`git clone --depth 1`, with a long timeout), and treat the clone as the Powerpoint folder for this task. In fallback mode:
   - Say in one line at the top of the reply that the deck is built from the GitHub copy, and give the date of its last commit.
   - Right after cloning, run `python3 scripts/bigfiles.py join .` in the clone. Files over GitHub's size limit (such as `Objects/store/media.zip`, the pictures of the stored objects) are kept in the repo as parts; this rebuilds them and checks them. Every line it prints must say `OK`. Details: `maintenance/github-sync.md`.
   - Send the finished deck in the chat. Nothing can be saved to the Mac folder.
   - Do not edit rules in the clone and do not push: the Mac folder stays the source of truth, and the next sync from the Mac overwrites the mirror. Instead, end the reply with the "After every deck" items written out ready to apply (the usage-log line and each lesson), so they can be applied the next time the Mac is reachable.
   - A new reference can't be learned in fallback mode. Use it for this deck only and tell the user to give it again when the Mac is reachable.

   If the repo can't be pulled either, stop and tell the user. Do not build from memory.
2. Read `DECK-SYSTEM.md` and follow it.
3. Open other files only when the "What to read, and when" table in `DECK-SYSTEM.md` says the current step needs them.

## After every deck (this is how the system keeps evolving)
Follow `maintenance/learning-loop.md` in the folder. In short: log the deck in `logs/usage-log.md`, write each correction to `logs/lessons-log.md`, apply it straight away exactly as that file describes (archive, test briefs, changelog), and tell the user what changed so they can undo it. Do not leave learnings as proposals waiting for approval. If an archetype was flagged NEW, add it to the catalogue and build its generator.

## Every new reference
Follow `maintenance/new-reference.md` in full: every slide saved and split into single diagrams, pictures and embedded charts turned into editable shapes, story, slide composition and formatting studied, lessons applied to every presentation. Finish with `scripts/audit_reference.py`; never call a reference learned until it says ALL PASS.

## Other chats work in the folder too
Several chats (and Hermes) change this folder at the same time. Before changing any file in it, the logs included, follow `maintenance/working-together.md`: sign in with `python3 scripts/work.py start "<your chat>" "<what you are doing>" <files>`, take your version number and add your changelog row with the script, never by hand, and sign out with `done`. If it answers `CONFLICT`, another chat holds that file: leave it alone and work on something else or wait.

## Be dynamic
Don't stop for approval. Show the storyline and slide plan at the top of the reply and keep building; wait only if the user asks to review first. Everything learned, including style rules (fonts, colours, sizes), is applied straight away.

## Hard limits
- Never change `Style/style-rules.md` or any rule silently: archive the old version, apply the change, re-render the test briefs, log it, and tell the user (they can undo it).
- Never copy rules into this skill, Project docs or memory. New rules go into the folder files only.
- This skill should rarely change. If you think it needs to, propose the change to the user instead of editing it.