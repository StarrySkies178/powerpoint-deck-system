# Roadmap: making the deck system measurable, coordinated, lean and portable

**Status: PROPOSED on 2026-11-24. Not approved yet. No chat starts a phase until the user says so.**
Written by the "Accessing Claude skills across devices" chat after reading the two other running chats, the folder and outside research. Sources are at the end.

## Where the system stands (measured 2026-11-24, v2.20)

- 42 logged versions in three days. `logs/usage-log.md` records **one** deck (the sample deck). The system has been changed far more often than it has been used.
- Reproduction benchmark: **9 of 20**, unchanged since v2.4 (`bench/results-log.md`).
  - Named slide ("make it like slide 62"): 9 of 10 pass.
  - Deck as reference ("in the style of this deck"): **0 of 10** in every run. Layout scores are 0.00 to 0.30 against a bar of 0.60. Six of the ten also fail on body text size.
  - The v2.6 sibling-layout work moved the mean layout score of these cases from about 0.12 to 0.17.
- What a deck task reads before it starts: `DECK-SYSTEM.md` (241 lines, over its own cap of about 200), `Style/style-rules.md` (99), `Style/storytelling.md` (161), `Style/refs/case-competitions.md` (225). About 78 KB.
- Three chats change the folder at once. Since v2.19 there is a sign-in sheet (`scripts/work.py`); the two other chats have not adopted it yet.
- GitHub holds the whole folder (checked file by file on 2026-11-24).

## The reasoning behind the order

1. **Measure before changing.** A change is an experiment. Without a trusted measurement nobody can tell an improvement from a side-step, which is what 14 versions at 9 of 20 show.
2. **A test that nothing ever passes is suspect.** Guidance on agent tests says a 0% pass rate over many runs usually points to a broken task or grader, not an incapable builder. The 0 of 10 group has to be diagnosed before more effort goes into it.
3. **One variable at a time, against a bar fixed in advance.** The benchmark already fixes its bar before the first run. Keep that, and extend it to every new test.
4. **One writer per file.** Teams building multi-agent systems report that parallel writers are what fails; setups work when several agents contribute thinking and one does the writing.
5. **Short always-read files.** Tests on 18 models show answers get less reliable as the input grows, even on easy tasks.
6. **Add to the rulebook, never rewrite it whole.** In one published case a rulebook rewritten by a model shrank from 18,282 tokens to 122 in a single step and accuracy fell below having no rulebook.
7. **Open standards for anything another AI must use.** AGENTS.md, Agent Skills (SKILL.md) and MCP are read by most agent tools and are held by a neutral foundation.
8. **Automate last.** Automatic self-improvement multiplies whatever the measurement rewards, so the measurement comes first.

## Phase 0. Finish the foundation (hours)

- **Do:** save the pending `deck-system` skill card. Paste into the two other chats: "Read maintenance/working-together.md in the Powerpoint folder and follow it from now on." Ask "powerpoint learning" to redo its own skill card on top of the current skill.
- **Pass test:** the next change from each chat shows up in `python3 scripts/work.py status` while it runs, and its version number comes from the script.
- **Owner:** the user (two pastes, one save).

## Phase 1. Build the measuring instrument (first, everything depends on it)

**1a. Split the benchmark report into two suites.**
- *Regression suite:* the 9 cases that pass. Must stay 9 of 9 after every change.
- *Capability suite:* the 11 that fail. This is the hill to climb.
- *Why:* the two questions are different ("did we break something" and "can we do more") and one mixed number hides both.

**1b. Diagnose the 0 of 10 group before working on it.** Three runs per case, each changing one thing:
1. *Oracle run:* the builder is told the original's layout in words (for example "two charts left, table right, insight box bottom right"). No positions or sizes.
2. *Sibling run:* the builder picks the closest other slide of the same deck by role and layout and edits that slide's stored object.
3. *Baseline:* today's build.
- *Reading the result:* if the oracle run passes and the baseline fails, the generators can draw the slide and the missing piece is choosing the layout from content. If the oracle run also fails, the generators cannot express that layout and need new builders. If nothing passes, the test asks for more than the prompt contains, and the prompt rule ("never positions") or the layout bar needs a decision from the user.
- *Why:* this separates three different problems that currently look like one.

**1c. Measure the noise.** Rebuild five cases from their prompts three times each with no change to the system. A case only counts as improved if it passes in all three rebuilds.
- *Why:* with 20 cases, one case is 5 points. Builds written by a model vary from run to run, so a single run cannot separate signal from chance.

**1d. A quality suite for whole decks, calibrated on the user.**
- The user rates 40 slides **pass or fail with one line of reason**: 20 from the reference decks and 20 made by the system, shuffled, source hidden. About 40 minutes.
- An AI judge is tuned on 25 of them and checked on the 15 it has not seen.
- *Pass test for the judge:* it agrees with the user on at least 13 of the 15, and its misses are listed by kind (called good when the user said bad, and the reverse). Below that, the judge is not used and the user's own ratings stay the measure.
- *Why pass or fail:* a yes or no with a reason is easier to act on and to stay consistent with than a 1 to 5 score. *Why hidden source:* knowing which slides are the system's biases the rating. *Why held-out slides:* a judge tuned and tested on the same slides only shows it memorised them.

**1e. Three real decks.** Build three decks the user actually needs, log each in `logs/usage-log.md`, and add their slides to the quality suite.
- *Why:* one logged deck is too little evidence about real use.

- **Pass test for Phase 1:** `bench/results.md` reports both suites and the noise band; the 0 of 10 diagnosis is written down with numbers; the judge passes its check or is dropped.
- **Owner:** deck building and style chat (1a, 1c, 1d, 1e); references and rebuild chat (1b sibling run). **User:** 40 ratings, three briefs.

## Phase 2. One writer, one list (can run beside Phase 1)

- **Do:** name one chat as the editor of the shared files (`DECK-SYSTEM.md`, `Style/storytelling.md`, `maintenance/learning-loop.md`). Other chats put proposed wording in `logs/proposals.md` (append only) and the editor applies it. This roadmap is the shared to-do list: each chat signs in with the phase and step it is taking.
- **Decision rule:** if the sign-in sheet records more than one conflict a week after two weeks, or chats need to message each other, trial MCP Agent Mail (identities, inbox, file reservations). If the to-do list outgrows this file, trial Beads. Not before: the simplest thing that works comes first.
- **Pass test:** two weeks with no duplicate version number, no lost edit, and GitHub equal to the folder at each check.
- **Owner:** access and sync chat.

## Phase 3. Put the always-read files on a diet (after Phase 1)

- **Do:** bring `DECK-SYSTEM.md` back under 200 lines by moving detail into the topic files it already points to. Give every rule an id and two counters, used-and-helped and used-and-hurt, kept in `logs/rules.tsv`. After each deck the builder marks the rules it used. A rule with hurt at 2 or more and helped at 0 is retired to `archive/` with its counts.
- **Experiment:** build the Phase 1 suites with the old and the slim files. Accept the slim version only if the regression suite holds and the quality suite does not drop beyond the noise band.
- **Pass test:** under 200 lines, and no drop in either suite.
- **Owner:** the editor chat from Phase 2.

## Phase 4. Work the capability suite (after 1b says which problem it is)

- If the diagnosis says *layout choice*: build "pick the closest sibling slide, then edit its stored object" as the default route for deck-as-reference work. Target: at least 4 of the 10 pass in all three rebuilds. If fewer than 2 improve, drop the route.
- If it says *builders*: write the missing builders for the layouts that failed the oracle run.
- In both cases fix body text size from the deck's style profile first: it fails in 6 of 10 and is a deterministic fix.
- **Rule:** one change per benchmark run, logged with before and after numbers.
- **Owner:** references and rebuild chat (object store, sibling choice); deck building chat (builders, text size).

## Phase 5. Portable to other AIs (first two steps can start any time)

1. `AGENTS.md` at the folder root, about ten lines: read `DECK-SYSTEM.md`; sign in before changing anything.
2. The skill's master copy in the folder (`skill/deck-system/SKILL.md`) and on GitHub; each AI installs from there.
3. Three tools on a standard MCP server on the Mac: *change* (sign in, log, sign out), *sync* (push to GitHub from the Mac itself), *check* (lint plus benchmark). Thin: each runs the folder's current scripts.
- **Pass tests:** Hermes, with no Claude skill, answers "which fonts does the house style use" from the folder and signs in and out correctly. A sync of 150 MB completes in one call.
- **Needs checking first:** whether git on the Mac is logged in to GitHub; whether cloud chats can reach a new local server.
- **Owner:** access and sync chat.

## Phase 6. Let it improve itself, under control (last)

- **The loop:** propose one change, run both suites three times, accept only if regression holds and the capability or quality result improves beyond the noise band, log the numbers, otherwise roll back.
- **Later:** automatic rule tuning that reads the system's own runs and tests rule changes. Only once the Phase 1 judge has stayed in agreement with the user for a month.
- **Standing review:** every two weeks the user re-rates 10 fresh slides so the judge is re-checked against them.

## What could stop this, and what then

- *The judge cannot be brought into agreement.* Use the user's ratings directly: 10 slides a week.
- *The 0 of 10 test turns out to ask for more than the prompt holds.* The user decides between allowing a one-line layout hint in the prompt and lowering the layout bar for that group. The bar is never moved silently.
- *The other chats do not adopt the sign-in sheet.* Move to one editor chat for all rule changes.

## Sources

- Anthropic, "Demystifying evals for AI agents" (capability and regression suites, 0% pass rates, calibration, several trials): anthropic.com/engineering/demystifying-evals-for-ai-agents
- Hamel Husain, "Using LLM-as-a-Judge for Evaluation" (one expert, pass or fail with critiques, check both error types): hamel.dev/blog/posts/llm-judge
- Cognition, "Multi-Agents: What's Actually Working", 22 April 2026 (writes stay single-threaded): cognition.com/blog/multi-agents-working
- Chroma, "Context Rot" (18 models, reliability falls as input grows): research.trychroma.com/context-rot
- Zhang et al., "Agentic Context Engineering" (bullets with counters; the 18,282 to 122 token collapse): arxiv.org/abs/2510.04618
- Zheng et al., "PPTAgent" (edit-based slides from reference decks): arxiv.org/abs/2501.03936
- Agrawal et al., "GEPA" (reflective tuning of rules from the system's own runs): arxiv.org/abs/2507.19457
- Agentic AI Foundation (AGENTS.md, MCP, Agent Skills under the Linux Foundation): openai.com/index/agentic-ai-foundation and anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation
- MCP Agent Mail: github.com/Dicklesworthstone/mcp_agent_mail. Beads: github.com/steveyegge/beads
