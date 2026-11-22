# Learning loop: how the system improves

Read this after every deck (Stage 6) and whenever a rule changes. Claude **applies** what it learns and **tells** the user (who can undo anything); the **test briefs** guard quality. Nothing changes silently. This covers style rules (fonts, colours, sizes) and the DECK-SYSTEM workflow too: always archive first and report afterwards.

---

## After every deck (always)

1. Append one line to `logs/usage-log.md`.
2. For each correction the user made, append a line to `logs/lessons-log.md` with status `proposed`.
3. Apply the new rules (storytelling, patterns, checklists, generators), then list them in one message so the user can undo any. Style-rule changes are applied the same way (archive, apply, re-render the master, report).
4. For each slide flagged **NEW**, propose a catalogue entry (spec, 2–3 reference examples, code template).

## What triggers a change

1. **User correction**: goes in the lessons log.
2. **No archetype fits**: the slide is flagged NEW; it gets a spec, examples, a generator and a catalogue entry straight away.
3. **Repeated pattern**: the same kind of correction 2+ times → propose a general rule.
4. **Periodic review**: see below.

## Applying a change

1. Copy the file being changed to `archive/<file>_<YYYY-MM-DD>.md` so it can be rolled back.
2. Put the rule in the file where it will be read (a catalogue entry, `DECK-SYSTEM.md` Section 5, or `Style/style-rules.md`), not just in the log. Every rule states its *why*.
3. Run `maintenance/test-briefs.md`. If any brief now fails, don't apply the change. Report the conflict instead.
4. Add a test brief for every new archetype or important rule, so the test set grows with the system.
5. Add a line to `logs/changelog.md` and bump the version (minor change → 0.x+1; restructure → x+1.0).
6. Set the lesson's status to `applied`.
7. Sync the folder to GitHub (`maintenance/github-sync.md`).
8. If `Style/style-rules.md`, the master or `Generators/house.js` changed, update the Claude design system **Powerpoint House Style** (https://claude.ai/artifact/QRdhaeQi9cizMGrfLQHru3) to match: tokens, README and the affected previews. The folder stays the source of truth.

## Review every ~5 decks (or monthly)

Using `logs/usage-log.md` and `logs/lessons-log.md`, report:
- The most-corrected archetypes → fix their spec or template
- Archetypes never used → keep, merge or retire
- Archetypes overused → is deck variety too low?
- Contradictory or stale lessons → consolidate
- Proposed changes, each with its reason

Apply changes only if all test briefs still pass; if one fails, fix the change or roll it back and say so.

## Consolidate every ~10 applied lessons

Merge duplicates, resolve contradictions, and retire stale rules to `archive/` with the reason. Keep the files short. A rule that is never read is worth nothing.

## Hard limits

- Never change `Style/style-rules.md` (fonts, colours, sizes) silently: archive, apply, re-render, report.
- Never change the structure of `DECK-SYSTEM.md` silently: archive, apply, report.
- Never delete a rule. Retire it to `archive/` with the reason.
- Never apply a change that makes a test brief fail.
- Keep `DECK-SYSTEM.md` under ~200 lines. When it grows, move detail into catalogue or style files. *Why: it's read in full every time, so every extra line dilutes the rest.*
- The `deck-system` skill only points to this folder. Never put rules in it.
