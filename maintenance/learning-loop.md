# Learning loop: how the system improves

Read this after every deck (Stage 6) and whenever a rule changes. Claude **proposes**, the user **approves**, and the **test briefs** guard quality. Nothing changes silently.

---

## After every deck (always)

1. Append one line to `logs/usage-log.md`.
2. For each correction the user made, append a line to `logs/lessons-log.md` with status `proposed`.
3. List the proposed rules in one message and ask the user to approve or reject each one.
4. For each slide flagged **NEW**, propose a catalogue entry (spec, 2–3 reference examples, code template).

## What triggers a change

1. **User correction**: goes in the lessons log.
2. **No archetype fits**: the slide is flagged NEW. If approved, it gets a spec, examples and a template.
3. **Repeated pattern**: the same kind of correction 2+ times → propose a general rule.
4. **Periodic review**: see below.

## Applying an approved change

1. Copy the file being changed to `archive/<file>_<YYYY-MM-DD>.md` so it can be rolled back.
2. Put the rule in the file where it will be read (a catalogue entry, `DECK-SYSTEM.md` Section 5, or `Style/style-rules.md`), not just in the log. Every rule states its *why*.
3. Run `maintenance/test-briefs.md`. If any brief now fails, don't apply the change. Report the conflict instead.
4. Add a test brief for every new archetype or important rule, so the test set grows with the system.
5. Add a line to `logs/changelog.md` and bump the version (minor change → 0.x+1; restructure → x+1.0).
6. Set the lesson's status to `applied`.
7. Sync the folder to GitHub (`maintenance/github-sync.md`).

## Review every ~5 decks (or monthly)

Using `logs/usage-log.md` and `logs/lessons-log.md`, report:
- The most-corrected archetypes → fix their spec or template
- Archetypes never used → keep, merge or retire
- Archetypes overused → is deck variety too low?
- Contradictory or stale lessons → consolidate
- Proposed changes, each with its reason

Apply changes only after approval, and only if all test briefs still pass.

## Consolidate every ~10 applied lessons

Merge duplicates, resolve contradictions, and retire stale rules to `archive/` with the reason. Keep the files short. A rule that is never read is worth nothing.

## Hard limits

- Never change `Style/style-rules.md` (fonts, colours, sizes) without explicit approval.
- Never change the structure of `DECK-SYSTEM.md` (its sections or workflow) without approval.
- Never delete a rule. Retire it to `archive/` with the reason.
- Never apply a change that makes a test brief fail.
- Keep `DECK-SYSTEM.md` under ~200 lines. When it grows, move detail into catalogue or style files. *Why: it's read in full every time, so every extra line dilutes the rest.*
- The `deck-system` skill only points to this folder. Never put rules in it.
