# Roadmap: making the deck system measurable, coordinated, lean and portable

**Status: APPROVED by the user on 2026-11-24 ("lets do this now"). Phase 0 is in progress. Phase 1 building starts when Phase 0 is closed. The freeze of step 0.3 is in force (see the top of `maintenance/working-together.md`).**
Written by the "Accessing Claude skills across devices" chat. Every step names what backs it: **[Research]** a published source, **[Files]** something measured in this folder, or **[Logic]** reasoning with no outside source. Sources are listed at the end.

## Where the system stands (measured 2026-11-24)

- 42 logged versions in three days; `logs/usage-log.md` records one deck. **[Files]**
- Reproduction benchmark: 9 of 20, unchanged since v2.4. Named slide: 9 of 10. Deck as reference: 0 of 10 in every run, layout 0.00 to 0.30 against a bar of 0.60; 6 of the 10 also fail on body text size. The v2.6 sibling-layout work moved their mean layout from about 0.12 to 0.17. **[Files]** `bench/results-log.md`
- A deck task reads about 78 KB before it starts; `DECK-SYSTEM.md` is 241 lines against its own cap of about 200. **[Files]**
- Three chats change the folder at once; the sign-in sheet exists since v2.19 but only one chat uses it. **[Files]**

## Rules for the whole plan

- **A phase ends with a written result and the user's sign-off.** The result goes under the phase in this file. **[Logic]** A plan with no gates turns back into continuous change.
- **Every pass test is fixed before the work starts and never moved quietly.** **[Files]** The benchmark already works this way (`bench/README.md`).
- **Start with the simplest thing that works; add machinery only when a measurement says it is needed.** **[Research]** Anthropic, Building effective agents.

## Phase 0. Finish the foundation and freeze

0.1 **Adopt the sign-in sheet in all chats.** Save the pending skill card; paste "Read maintenance/working-together.md in the Powerpoint folder and follow it from now on." into the other two chats. **[Research]** Cognition: multi-agent setups work when "writes stay single-threaded". **[Files]** version numbers collided four times without it.
0.2 **Collision drill.** Two chats deliberately sign in for the same file; the second must get CONFLICT. **[Logic]** The sheet has only been tested with simulated chats in one session.
0.3 **Freeze the rules and builders, and take a baseline snapshot** (a tag on the GitHub mirror and the current benchmark numbers). No change to `Generators/`, `Style/` or `DECK-SYSTEM.md` until Phase 1 is signed off, except fixes the measuring work itself needs. **[Research]** Miller (Anthropic): evaluations are experiments. **[Logic]** An experiment needs a baseline that holds still.
- **Pass test:** each chat's next change shows on the sheet; the drill gives CONFLICT; the tag exists.

**Phase 0 result (2026-11-24, v2.23). Waiting for the user's sign-off.**
- 0.1 Done. The skill card is saved (the saved skill has the "Other chats work in the folder too" section). Both other chats were given the line and answered that they follow the sheet: the deck building and style chat signs in as "Combining markdown files for skills", the references chat as "reference rebuild". Still to be seen: their next real change appearing on the sheet.
- 0.2 Done. With this chat holding `maintenance/working-together.md`, the "Combining markdown files for skills" chat ran `work.py start` for the same file and got `CONFLICT: not signed in. Already held by another chat`, exit code 1, no id.
- 0.3 Done. Freeze notice at the top of `maintenance/working-together.md`; both chats confirmed it. Baseline: tag `baseline-phase0` on the GitHub mirror (the v2.23 commit; builders and rules are as at v2.18). Baseline numbers, last full run (2026-11-24 00:40, v2.18): 9 of 20 pass, standards checks 196 of 212, mean layout 0.44, mean visual 0.49.
- Also done alongside (allowed to start at any time): `logs/proposals.md` (step 2.1), `AGENTS.md` (step 5.1), `skill/deck-system/SKILL.md` (step 5.2).

## Phase 1. Build the measuring instrument

1.1 **Split the benchmark report into two suites.** Regression: the 9 passing cases, which must stay 9 of 9. Capability: the 11 failing cases. **[Research]** Anthropic evals guide: regression tests should sit near 100%, capability tests start low; a capability test that starts passing graduates into the regression suite.
1.2 **Measure the noise.** Rebuild 5 cases from their prompts 3 times each with nothing changed. From then on a case counts as passing only if it passes 3 of 3 rebuilds. **[Research]** Anthropic evals guide: run several trials because outputs vary; Miller: report results with error bars and compare the same items pairwise. **[Logic]** A case that truly passes 70% of the time passes 3 of 3 only 34% of the time, so this rule is strict on purpose: it accepts fewer false improvements.
1.3 **Check the benchmark against the user's eye.** The user looks at the 10 deck-as-reference comparisons (`compare.png`) and marks each acceptable or not. **[Research]** Anthropic evals guide: a 0% pass rate over many trials usually means a broken task or grader, and two experts should reach the same verdict on a task. **[Logic]** If the user accepts slides the metric fails, the layout bar measures something the user does not care about, and that is a decision for the user, not a builder problem.
1.4 **Find the cause of the 0 of 10, one part at a time.** Three builds per case: (a) today's build; (b) the builder is told the original's layout in words, no positions; (c) the builder edits the closest other slide of the same deck. **[Research]** Ng, error analysis by parts: give one component the right answer and see how the result changes. Zheng et al. (PPTAgent): new slides made by editing a chosen reference slide. **[Files]** Leave-one-out still applies: the target slide's own objects stay off limits.
- *Reading it:* (b) passes and (a) fails: the builders can draw it, the gap is choosing a layout from content. (b) fails too: builders are missing. Nothing passes and 1.3 says the slides look fine: the test asks for more than the prompt holds.
1.5 **Three real decks.** Build three decks the user needs, log each in `logs/usage-log.md`. **[Research]** Anthropic evals guide: start from 20 to 50 tasks drawn from real failures. **[Files]** One logged deck is too little.
1.6 **Error analysis before any judge.** A chat and the user go through the slides from 1.5 and write down the kinds of failure they see. These become the judge's criteria. **[Research]** Husain and Shankar: error analysis decides which tests to write in the first place, and writing a rubric before looking at real output is a common mistake.
1.7 **The user rates 60 slides, pass or fail, with one line of reason.** 50 different slides (about half from references, half from the system) in random order, plus 10 of them shown a second time. Source labels hidden. About an hour.
- *Pass or fail with a reason:* **[Research]** Husain. (Note: research on text evaluation by van der Lee et al. prefers 7-point scales or ranking for comparing systems; pass or fail is chosen here because the goal is a judge the user can act on, not a fine ranking.)
- *Random order:* **[Research]** van der Lee et al.: a fixed order can turn order effects into apparent differences.
- *Repeats:* **[Research]** Abercrombie et al.: annotators changed their own answer on more than 25% of items; rating the same item twice measures that, and it is rarely done. The user's own consistency is the ceiling for any judge.
- *Hidden source:* **[Logic]** No source found for this in slide or text evaluation; it is standard blinding from experimental practice.
1.8 **Tune an AI judge on 20 of the slides and check it on the other 30.** **[Research]** Husain: refine the judge until it agrees with the expert, validate on separate data, and report both kinds of error because raw agreement misleads when failures are rare.
- *Pass test for the judge:* at least 27 of 30, with misses listed by kind. **[Research]** Brown, Cai and DasGupta recommend the Wilson interval for small samples; 27 of 30 gives 74% to 97%, while the 13 of 15 in the first draft gave 62% to 96%, too wide to trust. If the judge fails, the user's own ratings stay the measure.
- **Pass test for Phase 1:** two suites reported with a noise band; the cause of the 0 of 10 written down with numbers; the judge passes or is dropped; user's sign-off.
- **Owners:** deck building and style chat (1.1, 1.2, 1.5 to 1.8); references and rebuild chat (1.4c); user (1.3, 1.7, three briefs).

## Phase 2. One writer, one list (alongside Phase 1)

2.1 **Name one chat the editor of the shared files** (`DECK-SYSTEM.md`, `Style/storytelling.md`, `maintenance/learning-loop.md`). Others append proposals to `logs/proposals.md`. *Set by default on 2026-11-24, the user can change it: the editor is the deck building and style chat ("Combining markdown files for skills").* **[Research]** Cognition.
2.2 **This file is the shared to-do list;** a chat names the phase and step in its sign-in. **[Research]** Anthropic: simplest solution first.
2.3 **Decision rule for more tooling:** after two weeks, more than one recorded conflict a week, or a real need for chats to message each other, leads to a trial of MCP Agent Mail; a to-do list that outgrows this file leads to a trial of Beads. Any third-party tool is read through before it is installed. **[Research]** Both tools exist and are documented; neither is tested here. **[Logic]** Evidence first, then machinery.
- **Pass test:** two weeks with no duplicate version number, no lost edit, GitHub equal to the folder at each check.

## Phase 3. Slim the always-read files (after Phase 1)

3.1 **Give every rule an id and two counters** (used and helped, used and hurt) in `logs/rules.tsv`; builders mark the rules they used after each deck. **[Research]** Zhang et al. (ACE): lessons as separate bullets with an identifier and helpful and harmful counts, added to and updated in place.
3.2 **Observe before cutting.** No rule is retired until it has been used in at least 3 decks. **[Logic]** A counter with one observation is noise.
3.3 **Move detail out of `DECK-SYSTEM.md` to get under 200 lines;** never rewrite a rules file whole. **[Research]** Chroma: 18 models got less reliable as input grew. ACE: a rulebook rewritten whole shrank from 18,282 to 122 tokens and accuracy fell below having none.
3.4 **Test the slim version against the old one on both suites;** keep it only if neither drops beyond the noise band. **[Research]** Miller: paired comparison on the same items.
- **Pass test:** under 200 lines, no drop in either suite.

## Phase 4. Work the capability suite (after 1.4 names the cause)

4.1 **Fix body text size from the deck's style profile first.** **[Files]** It fails in 6 of 10 and is a mechanical fix.
4.2 **Then the route 1.4 points to:** sibling-slide editing, or new builders for the layouts that failed when the layout was given.
4.3 **One change per run; compare before and after on the same cases.** **[Research]** Miller: compare the same items pairwise. Dietterich: McNemar's test, which counts only the cases where the two versions differ, keeps false alarms at an acceptable rate. **[Logic]** Its exact form for a handful of cases is the sign test.
- **Pass test:** at least 5 of the 10 pass in 3 of 3 rebuilds and none of the 9 regression cases breaks. **[Logic]** With 5 improved and 0 worse the sign test gives p = 0.03 one-sided; with 4 it gives 0.06, which could still be chance. The first draft's "4 of 10" was too low.
4.4 **Passing cases graduate into the regression suite.** **[Research]** Anthropic evals guide.
4.5 **Add fresh cases from decks not used so far each time cases graduate** (proposed: 10 new for every 5 graduated). **[Research]** Anthropic evals guide: a suite the system fully passes can no longer show improvement, so keep adding tasks. Recht et al.: image models scored 11% to 14% lower on a freshly built copy of their usual test, although their ranking held. **[Logic]** So the pass count on 20 reused cases will overstate how the system does on a new deck; fresh cases give the honest number. The 10 for 5 ratio is this plan's own choice.

## Phase 5. Portable to other AIs (5.1 to 5.3 can start any time)

5.1 **`AGENTS.md` at the folder root.** **[Research]** Read by Codex, Cursor, Copilot, Kimi Code and Hermes among others; held by the Linux Foundation's Agentic AI Foundation. Gemini CLI needs a setting.
5.2 **Master copy of the skill in the folder and on GitHub.** **[Research]** SKILL.md is an open standard used by more than 70 agent platforms, given to the same foundation in October 2026.
5.3 **Phone test.** Build one slide from a phone with the Mac closed. **[Logic]** The fallback has never been run end to end.
5.4 **Three thin tools on an MCP server on the Mac:** change, sync, check. Each only runs the folder's current scripts. **[Research]** MCP is supported by Claude, ChatGPT, Gemini, Cursor, Copilot, Hermes and Kimi Code. Anthropic's tool guidance: few tools, each built around a whole job.
- *Check first:* git on the Mac logged in to GitHub. **[Files]** Reaching a local server from a cloud chat already works for three servers on this Mac (winmux, claude-hermes, setsmart show up as tools in this chat), so a fourth should work the same way; it still gets tested.
- **Pass tests:** Hermes, with no Claude skill, answers a house-style question from the folder and signs in and out correctly; a 150 MB sync completes in one call.

## Phase 6. Controlled self-improvement (last)

6.1 **The loop:** one change, both suites with 3 rebuilds, accept only if regression holds and the result improves beyond the noise band, otherwise roll back from `archive/`. **[Research]** Anthropic: an evaluate-and-refine loop pays off when the evaluation criteria are clear, which is what Phase 1 provides.
6.2 **Re-check the judge every two weeks** on 10 fresh slides rated by the user. **[Research]** Husain: revisit after material changes or periodically.
6.3 **Only after a month of a stable judge:** automatic rule tuning that reads the system's own runs. **[Research]** Agrawal et al. (GEPA). ACE's results got worse on one test when it had no reliable feedback, which is why this comes last.

## Numbers that are this plan's own choices, not taken from a source

3 rebuilds per case; 5 cases for the noise check; 60 slides with 10 repeats; the 20 and 30 split; 27 of 30; 5 of 10; 3 uses before a rule can be retired; two weeks and one conflict a week; 10 new cases per 5 graduated. The methods behind them are sourced above; the exact figures are sized to what one person can rate and what 20 cases can show, and can be changed by the user before a phase starts.

## What could stop this, and what then

- *The judge cannot reach 27 of 30:* the user's ratings stay the measure, 10 slides a week.
- *1.3 and 1.4 show the 0 of 10 test asks for more than the prompt holds:* the user decides between a one-line layout hint in the prompt and a lower layout bar for that group.
- *The other chats do not adopt the sign-in sheet:* all rule changes go through one editor chat.

## Sources

- Anthropic, Building effective agents: anthropic.com/engineering/building-effective-agents
- Anthropic, Demystifying evals for AI agents: anthropic.com/engineering/demystifying-evals-for-ai-agents
- Miller (Anthropic), Adding Error Bars to Evals: arxiv.org/abs/2411.00640
- Husain, Using LLM-as-a-Judge for Evaluation: hamel.dev/blog/posts/llm-judge. Husain and Shankar, Why is error analysis so important in AI evals: hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html
- Ng, Advice for applying machine learning (error analysis): web.stanford.edu/class/cs129/advice.pdf
- van der Lee et al., Best practices for the human evaluation of automatically generated text: aclanthology.org/W19-8643
- Abercrombie et al., Consistency is Key (intra-annotator agreement): arxiv.org/abs/2301.10684
- Brown, Cai and DasGupta, Interval Estimation for a Binomial Proportion: doi.org/10.1214/ss/1009213286
- Dietterich, Approximate Statistical Tests for Comparing Supervised Classification Learning Algorithms: doi.org/10.1162/089976698300017197
- Recht et al., Do ImageNet Classifiers Generalize to ImageNet?: arxiv.org/abs/1902.10811
- Cognition, Multi-Agents: What's Actually Working: cognition.com/blog/multi-agents-working
- Chroma, Context Rot: research.trychroma.com/context-rot
- Zhang et al., Agentic Context Engineering: arxiv.org/abs/2510.04618
- Zheng et al., PPTAgent: arxiv.org/abs/2501.03936
- Agrawal et al., GEPA: arxiv.org/abs/2507.19457
- Agentic AI Foundation: openai.com/index/agentic-ai-foundation; anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation
- Anthropic, Writing effective tools for agents: anthropic.com/engineering/writing-tools-for-agents
- MCP Agent Mail: github.com/Dicklesworthstone/mcp_agent_mail. Beads: github.com/steveyegge/beads
