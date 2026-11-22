# Test briefs

Run these after any change to the rules. **How:** for each brief, choose the archetype using only `DECK-SYSTEM.md` and the catalogue, as a fresh build would, then compare your choice with the expected answer. A change is accepted only if every brief still passes.

| # | Brief | Expected archetype |
|---|---|---|
| 1 | Revenue 2019–2025, 7 points, steady growth | Column |
| 2 | Daily active users over 18 months | Line |
| 3 | Cost bridge from budget to actual, 5 drivers that sum | Waterfall |
| 4 | Market share of 4 competitors, sums to 100% | 100% stacked bar or pie |
| 5 | NPS for 11 brands | Horizontal bar, sorted |
| 6 | 4 vendors rated on 6 qualitative criteria | Harvey-ball table |
| 7 | 12 product lines placed by growth vs margin, to decide focus | 2×2 matrix |
| 8 | 200 stores: size vs revenue | Scatter |
| 9 | Deal sizes for 300 deals | Histogram |
| 10 | Why profit is below target: 3 drivers, each with 2–3 sub-drivers | Driver / issue tree |
| 11 | 4-phase implementation plan with dates over 18 months | Timeline / roadmap |
| 12 | 5-step customer onboarding, dates not important | Chevron process |
| 13 | Revenue grew 32% this year (one number) | KPI hero |
| 14 | 3 headline metrics for the quarter | KPI row |
| 15 | Sales by province across China | Map |
| 16 | Market size by segment × share by competitor | Marimekko |
| 17 | Option A vs Option B, pros and cons | Split comparison |
| 18 | 5 strategic priorities, short descriptions | Icon grid |
| 19 | The value chain from sourcing to after-sales | Value chain |
| 20 | Customer quote that captures the problem | Big statement / quote |
| 21 | Revenue split by region for 2023 and 2025 side by side | 100% stacked bar (2 bars) |
| 22 | Headcount change from 300 to 410 via hires, leavers, transfers | Waterfall |
| 23 | Which competitive forces threaten the business most | Five Forces (framework) |

**Style-source tests** (expected style source):

| # | Brief | Expected |
|---|---|---|
| S1 | Board update, no reference given | House default (navy / cyan / green accent, Arial) |
| S2 | Same brief plus a client .pptx attached "use this look" | Build on the client file's master and theme; no house colours |
| S3 | Screenshot of one slide as a reference | Match the palette, font and title position read off the image; state what was inferred; fill gaps from the house default |
| S4 | Reference contains a firm logo | Match the look; never copy the logo |
| S6 | "做一份中文的季度汇报" (Chinese deck, no reference) | House default with Microsoft YaHei for Chinese and Arial for Latin/numbers; full-width punctuation; ≤ ~80 characters of body text per slide |
| S7 | Competitor landscape with 6 company logos, none in Objects/ | Company names as text labels in equal logo slots; all 6 listed under "assets needed"; nothing pulled from the web |
| S8 | Leadership slide with 4 executives' photos, none supplied | Initials circles (same size and shape); headshots requested; no photos from the web |
| S5 | Any reference given | Before the storyline: `study_reference.py` run, rendered slides looked at, a style card with "Standards to follow" saved in `Style/refs/`, and key standards listed in the brief |

**Rhythm test:** write a 15-slide plan for a typical update. It must never repeat an archetype back to back, and it must pass the title test.

Add a brief for every new archetype or important rule.
