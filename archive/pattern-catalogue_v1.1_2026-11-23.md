# Pattern catalogue — every story pattern in the 11 template decks

74 patterns, grouped by the story they tell. All 2,537 slides are linked: 2,371 to a pattern below, 49 are BCG storytelling rules (see storytelling.md), 117 are covers/dividers/legal. `slide-map.csv` lists every slide with its pattern.

**How to read an entry:** *Story* = the message the pattern carries. *Count* = how many items it supports. *Scaling* = the rule for changing the number of items (so 4 arrows → 5 arrows is a recalculation, not a new design). *Emphasis* = what gets the accent colour. *Sources* = where to find examples in Templates/.

## Contents

- **A. Argument & storyline**: `exec-summary-tree`, `issue-tree`, `driver-tree`, `text-columns`, `labelled-rows`, `synthesis`, `quotes`, `tracker`, `case-study`, `status-stickers`
- **B. Sequence & process**: `chevron-process`, `vertical-process`, `process-zoom`, `staircase`, `timeline`, `gantt`, `phase-matrix`, `swimlanes`, `value-chain`, `flow-with-shock`, `options-branch`
- **C. Cycles & loops**: `cycle`, `virtuous-cycle`, `feedback-loop`, `input-into-cycle`
- **D. Composition & structure**: `hub-spoke`, `honeycomb`, `wedges`, `pyramid`, `funnel`, `temple`, `target-onion`, `venn`, `puzzle`, `nested-sizes`, `org-chart`, `cube-3d`, `framework`
- **E. Compare & position**: `matrix-2x2`, `bubble-portfolio`, `pros-cons`, `before-after`, `balance`, `scoring-table`, `table`, `scale-position`, `radar`
- **F. Forces & cause-effect**: `forces-in`, `impact-out`, `converge`, `barrier`, `filter`, `chain-reaction`, `opposing`, `gap`, `exchange`, `separation`, `change-direction`, `metaphor`
- **G. Data**: `column-chart`, `line-chart`, `bar-chart`, `stacked-chart`, `waterfall`, `mekko`, `pie-chart`, `scatter`, `combo-chart`, `small-multiples`, `chart-commentary`, `kpi-numbers`, `curve`, `map`, `icon-infographic`

## Layout engines (used by the generators in Generators/patterns.js)

- **row**: Items on one horizontal row. w = (W - label_w - (n-1)*gap) / n. Chevrons overlap by point depth (0.25*h). Text under each item; max words per item shrinks with w (≈ w_in*12 words at 14pt). n above max -> wrap to 2 rows or group.
- **column**: Items stacked vertically. h = (H - (n-1)*gap) / n; label column 25-30% width. n above max -> two columns.
- **ring**: Items as arc segments of a ring. angle = 360/n, start at -90° (12 o'clock), clockwise; gap 2-4°; inner radius 0.55R. Labels inside if n<=6, else callouts outside at mid-angle (left half right-aligned, right half left-aligned).
- **radial**: Centre shape + n satellites at radius R, angle_i = -90° + i*360/n. R >= d/(2*sin(pi/n)) + gap so satellites never touch. Callouts follow the satellite's side.
- **grid**: rows x cols cells with equal gaps; header row/column optional. Choose cols = ceil(sqrt(n)) for n items unless orientation given.
- **tree**: Levels left->right (or top->down). Leaves evenly spaced; each parent centred on its children; elbow connectors.
- **layers**: n horizontal bands inside a triangle/funnel; band height = H/n; width at each band from the triangle edges; callouts aligned to band centres.
- **nested**: n concentric circles; radii r_i = R*(n-i)/n (or sqrt of values for area-true).
- **venn**: n circles (2-4) with centres on a regular polygon, overlap ~30% of diameter.
- **converge**: n inputs evenly spaced in a column -> lines/arrows converge to a single target at 70% width.
- **branch**: 1 source -> n branches; targets evenly spaced vertically; elbow or curved arrows.
- **chart**: Native PowerPoint chart from data; style per chart rules.
- **free**: Fixed composition; text slots only.

## A. Argument & storyline

### `exec-summary-tree` — Executive summary / storyline tree
- **Story:** The answer first, then the 3-5 chapter messages that prove it, each with its supporting points (pyramid principle).
- **Use when:** Opening summary of a deck; planning a storyline before building slides; one-page version of the whole argument.
- **Avoid when:** Detailed data; audiences that need to discover the answer gradually.
- **Parts:** report title -> main conclusion (1 sentence) -> 3-5 chapter titles -> supporting conclusions (bullets) under each
- **Count:** 3–5 · **Engine:** tree
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** chapters share width equally: w=(W-(n-1)g)/n; >5 chapters -> group into 3-4 themes
- **Emphasis:** main conclusion bar in brand colour; chapters neutral
- **Example title:** "We should enter the SE Asia market in 2026 through a JV"
- **Sources (2 slides):** Deloitte-timesaver 40-41

### `issue-tree` — Issue / logic tree
- **Story:** A question or problem broken into mutually exclusive, collectively exhaustive parts.
- **Use when:** Structuring a problem, showing analysis plan, hypothesis tree, root-cause breakdown.
- **Avoid when:** When the parts aren't MECE; more than 3 levels on one slide.
- **Parts:** root box -> level-1 branches -> level-2 leaves; optional commentary column at right
- **Count:** 2–4 · **Engine:** tree
- **Generator:** issueTree
- **Scaling:** levels left->right; leaf height = (H - (L-1)g)/L where L = leaf count; >16 leaves -> split slide; symmetric or asymmetric trees both allowed
- **Emphasis:** highlight the branch being discussed; grey the rest
- **Example title:** "Margin decline is driven by price, not volume"
- **Sources (36 slides):** Quick-Presentation-Toolkit 320-325,407-412; Roland-Berger-modules 14-15,35-36,266,345,350,352,366; Concept-graphics-mono 166-169; McKinsey-frequently-used 219-221,247; Deloitte-timesaver 36-39; BearingPoint-diagrams 158; EY-graphics 70; AT-Kearney-charts 4

### `driver-tree` — Driver / KPI tree (quantified)
- **Story:** A headline metric decomposed into its arithmetic drivers, each with value or trend.
- **Use when:** ROE/ROIC/DuPont, revenue = volume x price, cost breakdown, CAGR by component, value-creation levers.
- **Avoid when:** Qualitative issues (use issue-tree).
- **Parts:** metric box -> operator (x, +, -) -> driver boxes; each leaf carries value, trend arrow, moon or mini chart
- **Count:** 2–4 · **Engine:** tree
- **Generator:** issueTree
- **Scaling:** same as issue-tree; operators sit between siblings
- **Emphasis:** trend markers coloured (up green/brand, down red)
- **Example title:** "ROE fell 3 pts because asset turnover dropped"
- **Sources (12 slides):** Deloitte-timesaver 42-46,91-92; McKinsey-frequently-used 116,118; BearingPoint-diagrams 150-151; Roland-Berger-modules 347

### `text-columns` — Parallel text columns
- **Story:** Several equally important points side by side, each with a header and bullets.
- **Use when:** 2-6 parallel arguments, workstreams, options, regions.
- **Avoid when:** When points are sequential (use process) or unequal in weight.
- **Parts:** header (bar or rule) + bullets per column
- **Count:** 2–6 · **Engine:** row
- **Generator:** textColumns
- **Scaling:** w=(W-(n-1)g)/n; >6 -> 2 rows; min column width 1.6in for 14pt text
- **Emphasis:** one column header in accent if it is the point
- **Example title:** "Three capabilities set leaders apart"
- **Sources (78 slides):** Roland-Berger-modules 8-9,92,215-217,226-227,239-248,260,351,406-412; Deloitte-timesaver 9-11,14,16-17,20-22,25-28,31,217; EY-graphics 16-17,86,107,161-162,168,224-227,241-244; McKinsey-frequently-used 102,104,173-179,202-203,207-208,218; BearingPoint-diagrams 114,118-120; Concept-graphics-mono 21-23

### `labelled-rows` — Labelled rows (key points)
- **Story:** A short list where each item has a label/tag on the left and explanation on the right.
- **Use when:** 3-6 key points, guidelines, numbered recommendations, agenda with descriptions.
- **Avoid when:** >7 rows (split or group).
- **Parts:** tag/chevron/numbered square at left + text box at right
- **Count:** 2–7 · **Engine:** column
- **Generator:** labelledRows
- **Scaling:** row height h=(H-(n-1)g)/n; label column fixed 25-30% width
- **Emphasis:** number squares in brand colour, white bold
- **Example title:** "Five guidelines govern the new operating model"
- **Sources (25 slides):** Concept-graphics-mono 25-27,49-52; McKinsey-frequently-used 170-172,223-224; Quick-Presentation-Toolkit 311-312,398-399; EY-graphics 93-94,222; Bain-concept-diagrams 38,135; Roland-Berger-modules 11,162; Deloitte-timesaver 12-13

### `synthesis` — Inputs to conclusion (synthesis)
- **Story:** Several findings feed one conclusion: the slide's 'so what'.
- **Use when:** Summarising analysis, pulling 2-6 facts into a recommendation.
- **Avoid when:** When the conclusion doesn't follow from the inputs shown.
- **Parts:** N input boxes/columns/rows -> arrow/funnel/chevron -> conclusion box (accent)
- **Count:** 2–6 · **Engine:** converge
- **Generator:** converge
- **Scaling:** inputs on a row or column; conclusion box = 1/3 width or full-width bar below
- **Emphasis:** conclusion in accent; inputs neutral
- **Example title:** "All four signals point to under-investment in digital"
- **Sources (57 slides):** Quick-Presentation-Toolkit 15-18,297-308,384-395; Roland-Berger-modules 56-60,117-125,249-251,259; McKinsey-frequently-used 167-169; BearingPoint-diagrams 24-26; Deloitte-timesaver 18-19,30; EY-graphics 160,165

### `quotes` — Voice of the customer / quotes
- **Story:** Real words from interviews that prove a point emotionally.
- **Use when:** Interview findings, customer pain points, management quotes next to a chart.
- **Avoid when:** Unattributed or invented quotes.
- **Parts:** 2-6 quote containers (bubble, torn paper, strip) + source line each
- **Count:** 1–6 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** stack vertically 1-3; grid 2x2/2x3 for 4-6
- **Emphasis:** one key quote larger
- **Example title:** "Customers are frustrated by repeated transfers"
- **Sources (16 slides):** EY-graphics 170-171,237-240; Deloitte-timesaver 32-34,257; Quick-Presentation-Toolkit 309-310,396-397; Bain-concept-diagrams 137; Roland-Berger-modules 274

### `tracker` — Section tracker / navigator
- **Story:** Shows where we are in the storyline.
- **Use when:** Section openers and top-right navigation in long decks.
- **Avoid when:** Decks under 10 slides.
- **Parts:** row of mini boxes/chevrons/numbered squares; current one filled, others greyed
- **Count:** 3–8 · **Engine:** row
- **Generator:** frame({tracker})
- **Scaling:** equal small cells
- **Emphasis:** current section filled brand colour
- **Sources (5 slides):** Deloitte-timesaver 1-2,116; BCG-writing-clear-slides 44-45

### `case-study` — Case study / credential
- **Story:** What the client faced, what was done, what it achieved.
- **Use when:** Credentials, proof of capability, success stories.
- **Parts:** 3-4 panels: situation/challenge -> approach/what we did -> result/value (accent); optional photo strip
- **Count:** 3–4 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** columns or 2x2
- **Emphasis:** result panel in accent
- **Example title:** "Redesigned sourcing cut costs 12% in 9 months"
- **Sources (13 slides):** EY-graphics 199-200,231-236; Quick-Presentation-Toolkit 273-274,359-360; AT-Kearney-charts 165

### `status-stickers` — Status stickers & legends
- **Story:** Labels that tell the reader how to read the slide (draft, illustrative, preliminary, backup).
- **Use when:** Drafts, illustrative numbers, appendix material.
- **Parts:** upper-case tag top-right
- **Count:** 1 · **Engine:** free
- **Generator:** -
- **Scaling:** -
- **Emphasis:** -
- **Sources (28 slides):** McKinsey-frequently-used 37,152,156-157,302-304; Roland-Berger-modules 401,404-405,427-430; Quick-Presentation-Toolkit 329-332,417-419; EY-graphics 214-219; Deloitte-timesaver 259


## B. Sequence & process

### `chevron-process` — Chevron process
- **Story:** A fixed sequence of steps/phases, left to right, with what happens in each.
- **Use when:** 2-8 steps, project phases, customer journey, approach slide.
- **Avoid when:** Non-sequential items; loops (use cycle).
- **Parts:** chevron header per step + text column below; optional row labels at left; optional result box at end
- **Count:** 2–8 · **Engine:** row
- **Generator:** chevronProcess
- **Scaling:** w=(W-label_w-(n-1)*overlap)/n, chevron point = 0.25*h; >8 -> group into phases or wrap; text under each <= 25 words at n=6
- **Emphasis:** current/most important step in accent, completed steps darker, future lighter
- **Example title:** "A four-phase approach delivers results in 16 weeks"
- **Sources (165 slides):** McKinsey-frequently-used 14-25,46-55,73-86,166,187-199,204,210; Roland-Berger-modules 41-43,54,81,89-90,182,212-214,273,289-300,323; EY-graphics 37-38,41,59,89-92,97-100,108-111,113,128,159,163-164,167,186-187; Concept-graphics-mono 14-20,24,35-41,46-48,114-115,144-145; Quick-Presentation-Toolkit 1-2,66-67,69-77,139,263,349; Deloitte-timesaver 8,94,97,171-175,180,185-186; Bain-concept-diagrams 16,27-29,44,110; BearingPoint-diagrams 97-98,137,141,146; AT-Kearney-charts 2,6,184-185

### `vertical-process` — Vertical process
- **Story:** Steps top to bottom with detail to the right.
- **Use when:** Many steps with long text, 3-7 phases with 2 text columns.
- **Parts:** vertical chevron/arrow stack at left + text rows/columns right
- **Count:** 3–7 · **Engine:** column
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** row height=(H-(n-1)g)/n
- **Emphasis:** accent current step
- **Sources (5 slides):** Deloitte-timesaver 15,198; Bain-concept-diagrams 45; Roland-Berger-modules 360; EY-graphics 158

### `process-zoom` — Process zoom (phase -> sub-steps)
- **Story:** One phase of a high-level process expanded into its detailed steps.
- **Use when:** Drilling into the part of a process that matters.
- **Parts:** high-level chevron row; shaded wedge from selected phase; detailed chevron row below
- **Count:** 2–8 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** top row as chevron-process; bottom row n_sub steps spread over full width
- **Emphasis:** selected phase accent
- **Example title:** "Most delay sits in the approval step"
- **Sources (6 slides):** Bain-concept-diagrams 35-37; Deloitte-timesaver 23-24; Roland-Berger-modules 262

### `staircase` — Staircase / maturity steps
- **Story:** Progress through stages, each a step up (maturity, capability, value).
- **Use when:** Maturity models, roadmaps to a target state, incremental gains.
- **Avoid when:** Decline (use descending variant).
- **Parts:** N rising steps with label + description; optional figure/goal at top
- **Count:** 3–6 · **Engine:** row
- **Generator:** staircase
- **Scaling:** step width=W/n, rise=(H*0.7)/n; descending variant mirrors
- **Emphasis:** target step in accent
- **Example title:** "Moving from 'emerging' to 'leading' needs two breakthroughs"
- **Sources (62 slides):** Concept-graphics-mono 105-106,110-111,118-119,135-136,140-141,148-149; BearingPoint-diagrams 30-37,99-100,135-136; McKinsey-frequently-used 36,88,180-186; Deloitte-timesaver 141-142,170,176-179,189-190; EY-graphics 69,101-105,112; Bain-concept-diagrams 17-20,22-23; Roland-Berger-modules 133,161,312,324; Quick-Presentation-Toolkit 40,251; AT-Kearney-charts 166

### `timeline` — Timeline / milestones
- **Story:** Events in chronological order.
- **Use when:** History, roadmap, key dates, launch plan.
- **Avoid when:** When durations matter (use gantt).
- **Parts:** horizontal axis/arrow with ticks; callouts alternate above/below
- **Count:** 3–10 · **Engine:** row
- **Generator:** timeline
- **Scaling:** tick spacing proportional to time (or equal if events uneven but labelled); alternate callouts to avoid collision; >10 -> two rows
- **Emphasis:** today line or key milestone in accent
- **Sources (18 slides):** Bain-concept-diagrams 39-43,161; Deloitte-timesaver 199-204; Concept-graphics-mono 160-162; Quick-Presentation-Toolkit 328,415; EY-graphics 185

### `gantt` — Gantt / workplan
- **Story:** Who does what when; durations and milestones.
- **Use when:** Project plans, implementation plans, workplans.
- **Avoid when:** Executive audiences (summarise into phases).
- **Parts:** activity column (+ owner/status) x time columns; bars; triangle milestones; meeting row
- **Count:** 3–20 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** column width = (W-label_w)/periods; row height fixed 0.28in; >20 rows -> split by phase
- **Emphasis:** critical path or current phase in accent; today line
- **Sources (71 slides):** McKinsey-frequently-used 119-120,251-266; Quick-Presentation-Toolkit 47-52,89,264-268,350-354; AT-Kearney-charts 10-17,161-163; Roland-Berger-modules 10,179-181,252,348-349,421; EY-graphics 188-194; BearingPoint-diagrams 80-82,121,126; Concept-graphics-mono 163-165; Bain-concept-diagrams 141-142

### `phase-matrix` — Phases x workstreams matrix
- **Story:** A plan where several workstreams run through the same phases.
- **Use when:** Programme plans, transformation roadmaps, activity by function.
- **Parts:** phase chevrons across top; workstream rows; cells with activities
- **Count:** 2–8 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** grid: cols=phases, rows=streams
- **Emphasis:** one stream or phase highlighted
- **Sources (26 slides):** Quick-Presentation-Toolkit 262,313-318,348,400-401; EY-graphics 173-178; BearingPoint-diagrams 101-103,129; Deloitte-timesaver 138,140,161; McKinsey-frequently-used 242-243; Roland-Berger-modules 265

### `swimlanes` — Swimlane process map
- **Story:** A process across roles/departments, showing handoffs.
- **Use when:** Process redesign, RACI-like flows.
- **Parts:** lanes (rows) per role; activity boxes; connectors; decision diamonds
- **Count:** 2–7 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** lane height=(H)/lanes; activities on a column grid
- **Emphasis:** pain-point activities in accent
- **Sources (17 slides):** Concept-graphics-mono 107,137,170-173; Bain-concept-diagrams 164-167; Roland-Berger-modules 191-193; Deloitte-timesaver 162-163; BearingPoint-diagrams 130; AT-Kearney-charts 5

### `value-chain` — Value chain
- **Story:** Activities from supplier to customer, where value is added.
- **Use when:** Industry or company value chain, where to play.
- **Parts:** supplier -> N activity shapes (chevrons/diamonds) -> customer; optional loop-back
- **Count:** 3–8 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** as chevron-process
- **Emphasis:** activity where client plays in accent
- **Sources (9 slides):** Bain-concept-diagrams 120-123,134; Roland-Berger-modules 80,253; BearingPoint-diagrams 122; Deloitte-timesaver 160

### `flow-with-shock` — Process with external shock
- **Story:** An event disrupts or redirects a normal flow.
- **Use when:** Regulation change, new entrant, crisis impact on business system.
- **Parts:** starburst + chevron flow (+ row labels)
- **Count:** 2–6 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** as chevron-process
- **Emphasis:** burst in accent
- **Sources (4 slides):** McKinsey-frequently-used 200-201,211,214

### `options-branch` — Options / branching paths
- **Story:** From one starting point, several possible paths or decisions.
- **Use when:** Strategic options, scenarios, decision points.
- **Parts:** source box -> branching arrows/pipe -> N option boxes
- **Count:** 2–5 · **Engine:** branch
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** options stacked vertically, h=(H-(n-1)g)/n
- **Emphasis:** recommended option in accent
- **Example title:** "Of three options, a partnership gives the best risk/return"
- **Sources (27 slides):** Roland-Berger-modules 116,194-196,325,332,336-337; Bain-concept-diagrams 31-34,143; McKinsey-frequently-used 89,96,100-101; BearingPoint-diagrams 23,87-88,133; Quick-Presentation-Toolkit 55-56,174; Concept-graphics-mono 53-54; Deloitte-timesaver 182


## C. Cycles & loops

### `cycle` — Cycle
- **Story:** A repeating sequence with no end; each step feeds the next.
- **Use when:** Continuous improvement, planning cycles, life cycles, flywheels.
- **Avoid when:** One-off sequences.
- **Parts:** N curved arrow segments in a ring; text inside or as callouts outside
- **Count:** 2–9 · **Engine:** ring
- **Generator:** cycle
- **Scaling:** segment angle=360/n, start 12 o'clock, clockwise; gap 2-4 deg; callouts placed at segment mid-angle (left side right-aligned, right side left-aligned); >9 -> numbered list beside ring
- **Emphasis:** one segment in accent (where we are / biggest issue)
- **Example title:** "Planning works as a monthly four-step cycle"
- **Sources (108 slides):** McKinsey-frequently-used 28,56-66,68-71,87,231-240; Roland-Berger-modules 44-45,70-76,304,315-317,319-322; Bain-concept-diagrams 2-12,14,124-125,144; Quick-Presentation-Toolkit 191-204; EY-graphics 114-118,121-123,134-135; Concept-graphics-mono 28-34,42-43; BearingPoint-diagrams 14-20,95,138; Deloitte-timesaver 98,101,104,183,240; AT-Kearney-charts 195-196

### `virtuous-cycle` — Virtuous cycle around a core
- **Story:** Self-reinforcing loop whose result is a central goal.
- **Use when:** Flywheels, ecosystem effects, 'more X brings more Y'.
- **Parts:** ring of N labelled arcs around a core circle (goal)
- **Count:** 3–6 · **Engine:** ring
- **Generator:** cycle (with centre)
- **Scaling:** as cycle; core radius = 0.45R
- **Emphasis:** core in accent
- **Sources (7 slides):** Bain-concept-diagrams 15,92-94,98-99,104

### `feedback-loop` — Feedback loop between boxes
- **Story:** Output of one stage returns to an earlier one.
- **Use when:** Learning loops, rework, control systems.
- **Parts:** 2-4 boxes with forward arrow and return arrow
- **Count:** 2–4 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** boxes on a row; return path below
- **Emphasis:** return arrow in accent
- **Sources (33 slides):** Quick-Presentation-Toolkit 32-33,88,140,205-209,253-256; Roland-Berger-modules 85,150-154,173,367; BearingPoint-diagrams 60-64; EY-graphics 4-7,120; Concept-graphics-mono 44-45

### `input-into-cycle` — Input into an ongoing cycle
- **Story:** Something new enters an existing loop.
- **Use when:** New initiative joining operations, onboarding into a cycle.
- **Parts:** entry arrow + cycle
- **Count:** 3–8 · **Engine:** ring
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** as cycle
- **Emphasis:** entry arrow in accent
- **Sources (5 slides):** Quick-Presentation-Toolkit 210-211; McKinsey-frequently-used 67; Roland-Berger-modules 318; EY-graphics 127


## D. Composition & structure

### `hub-spoke` — Hub and spoke / radial
- **Story:** One central theme with N related elements around it.
- **Use when:** Capabilities around a strategy, stakeholders around a decision, levers around a goal.
- **Avoid when:** When the items are sequential.
- **Parts:** centre circle/shape + N satellites (circles/boxes) + optional callouts
- **Count:** 3–10 · **Engine:** radial
- **Generator:** hubSpoke
- **Scaling:** satellite angle=360/n starting -90deg; radius R so satellites don't touch: R >= d/(2 sin(pi/n)); callouts left/right by angle; >10 -> group
- **Emphasis:** centre in accent; or one satellite in accent
- **Example title:** "Six levers drive shareholder value"
- **Sources (116 slides):** Roland-Berger-modules 7,16,19,21,23-27,55,61-69,136-149,165,236-237,276,311,341,346,370; BearingPoint-diagrams 40-58,70,117,131,168; Quick-Presentation-Toolkit 28-31,156-161,186-188,243-246,289,376; EY-graphics 26,28,31,119,136-137,139-143,183,223,228; McKinsey-frequently-used 35,108,111,117,209,212-213; Bain-concept-diagrams 91,108,158-159; Deloitte-timesaver 103,145,149,191; AT-Kearney-charts 186,188-190

### `honeycomb` — Honeycomb
- **Story:** Interlocking components around a core: tightly linked, all needed.
- **Use when:** Capabilities, ecosystem, integrated offering.
- **Parts:** centre hexagon + ring of 6 (or 5-8 pentagon/hexagon variants)
- **Count:** 5–19 · **Engine:** radial
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** hex grid; ring 1 = 6 cells, ring 2 = 12
- **Emphasis:** core in accent
- **Sources (16 slides):** Bain-concept-diagrams 56-59; Quick-Presentation-Toolkit 292-293,379-380; Concept-graphics-mono 154-155; EY-graphics 210-211; BearingPoint-diagrams 139; Roland-Berger-modules 373; Deloitte-timesaver 110; AT-Kearney-charts 208

### `wedges` — Segmented wheel / wedges
- **Story:** A whole divided into N parts; optionally a core.
- **Use when:** Components of an offering, segments of a market (qualitative).
- **Avoid when:** Quantities (use pie).
- **Parts:** circle/donut split into N equal wedges + centre
- **Count:** 3–10 · **Engine:** ring
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** angle=360/n; label at mid-angle
- **Emphasis:** one wedge in accent
- **Sources (41 slides):** Bain-concept-diagrams 49,51,65-74,101-103,105,153-157; Quick-Presentation-Toolkit 11-14,183-185,189; AT-Kearney-charts 206,213-218; Deloitte-timesaver 106,115; BearingPoint-diagrams 125; Roland-Berger-modules 257; EY-graphics 30

### `pyramid` — Pyramid / hierarchy
- **Story:** Layers that build on each other: foundation at the bottom, top depends on what's below.
- **Use when:** Hierarchy of needs, strategy pyramid (vision -> initiatives), maturity levels.
- **Avoid when:** Funnels (use funnel).
- **Parts:** triangle split in N horizontal layers + callouts at right
- **Count:** 2–9 · **Engine:** layers
- **Generator:** pyramid
- **Scaling:** layer height=H/n (equal); widths follow triangle; callouts aligned to layer mid-heights; >6 -> callouts only
- **Emphasis:** one layer in accent
- **Example title:** "Sustainable advantage rests on three foundations"
- **Sources (61 slides):** EY-graphics 65-66,72,83,87,204-209; Concept-graphics-mono 87,89,120-127; Quick-Presentation-Toolkit 285-288,371-375; Roland-Berger-modules 17-18,91,270-271,288,338; Bain-concept-diagrams 13,50,52-53,80-81; AT-Kearney-charts 175-176,178-180,183; McKinsey-frequently-used 13,103,248-250; Deloitte-timesaver 111-112,146,148; BearingPoint-diagrams 108,161-162

### `funnel` — Funnel / narrowing
- **Story:** Many become few through successive stages (conversion, prioritisation, filtering).
- **Use when:** Sales funnel, idea screening, prioritisation, market sizing to target.
- **Parts:** N tiers narrowing (inverted pyramid/funnel) with stage labels and values
- **Count:** 2–7 · **Engine:** layers
- **Generator:** funnel
- **Scaling:** tier height=H/n; widths taper linearly or proportional to value
- **Emphasis:** final tier in accent
- **Example title:** "Only 12 of 140 ideas pass all four screens"
- **Sources (35 slides):** Concept-graphics-mono 128-134,201; Bain-concept-diagrams 46-48,75-77,146; EY-graphics 12-13,54,80-81; Quick-Presentation-Toolkit 34-36,150-151; Roland-Berger-modules 49,155-156,211; BearingPoint-diagrams 65-66,96; McKinsey-frequently-used 230; Deloitte-timesaver 211; AT-Kearney-charts 3

### `temple` — Temple / strategy house
- **Story:** A vision supported by N pillars standing on a foundation.
- **Use when:** Strategy on a page, operating model, programme structure.
- **Parts:** roof (vision) + N pillars (themes with bullets) + base (enablers/values)
- **Count:** 2–6 · **Engine:** row
- **Generator:** temple
- **Scaling:** pillar width=(W-(n-1)g)/n; roof spans pillars
- **Emphasis:** roof in accent
- **Sources (24 slides):** Roland-Berger-modules 12-13,258,263-264,400; Concept-graphics-mono 150-153; Quick-Presentation-Toolkit 294-295,381-382; McKinsey-frequently-used 225-227; EY-graphics 45,212-213; AT-Kearney-charts 192-193,199; Bain-concept-diagrams 95

### `target-onion` — Target / onion
- **Story:** Layers from core to periphery (influence, priority, scope).
- **Use when:** Stakeholder circles, core vs adjacent business, focus.
- **Parts:** N concentric rings; labels per ring; optional sectors
- **Count:** 2–6 · **Engine:** nested
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** radii equal steps
- **Emphasis:** core in accent
- **Sources (20 slides):** Bain-concept-diagrams 60-64; Roland-Berger-modules 235,305,369; Deloitte-timesaver 95-96,105; EY-graphics 14,78,126; AT-Kearney-charts 95,119,187; McKinsey-frequently-used 29; BearingPoint-diagrams 116; Quick-Presentation-Toolkit 190

### `venn` — Venn / overlap
- **Story:** Where two or three areas meet is what matters (sweet spot).
- **Use when:** Capability fit, overlap of segments, shared ground.
- **Avoid when:** >4 sets.
- **Parts:** 2-4 overlapping circles; label in intersection
- **Count:** 2–4 · **Engine:** venn
- **Generator:** venn
- **Scaling:** centres on a regular polygon; overlap 30%
- **Emphasis:** intersection in accent
- **Example title:** "The opportunity sits where our strengths meet unmet need"
- **Sources (41 slides):** Quick-Presentation-Toolkit 177-182,257-260; Bain-concept-diagrams 96-97,100,106-107,162-163; Roland-Berger-modules 20,186-187,269,302,375-376; EY-graphics 22,129-133; McKinsey-frequently-used 26,121-122; Deloitte-timesaver 99-100,108; Concept-graphics-mono 158-159; BearingPoint-diagrams 83-84; AT-Kearney-charts 209

### `puzzle` — Puzzle
- **Story:** Pieces that only work together; or the missing piece.
- **Use when:** Integration, fit, the missing capability.
- **Parts:** grid of N puzzle pieces; one highlighted or missing
- **Count:** 4–16 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** rows x cols near-square
- **Emphasis:** key/missing piece in accent
- **Sources (19 slides):** Roland-Berger-modules 86,218,399,423; EY-graphics 73,201-203; BearingPoint-diagrams 104-106; McKinsey-frequently-used 110,205; Deloitte-timesaver 113-114; AT-Kearney-charts 197-198; Concept-graphics-mono 190; Quick-Presentation-Toolkit 78

### `nested-sizes` — Nested sizes (market sizing)
- **Story:** From total to served to target: each a subset of the previous.
- **Use when:** TAM/SAM/SOM, market definition, drill-down.
- **Parts:** N nested circles/semicircles with values
- **Count:** 2–6 · **Engine:** nested
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** area proportional to value if quantitative
- **Emphasis:** innermost in accent
- **Sources (10 slides):** Roland-Berger-modules 197,308,371; Quick-Presentation-Toolkit 57-58,149; McKinsey-frequently-used 32; BearingPoint-diagrams 154; Deloitte-timesaver 102; EY-graphics 138

### `org-chart` — Organisation / team structure
- **Story:** Who reports to whom; how a team is set up.
- **Use when:** Org design, project governance (steering committee, PMO, workstreams).
- **Parts:** tree of boxes with name/title; optional side labels
- **Count:** 2–30 · **Engine:** tree
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** tree engine top-down; >6 children -> vertical stack under parent
- **Emphasis:** changed units in accent
- **Sources (33 slides):** Concept-graphics-mono 93-100; Quick-Presentation-Toolkit 269-272,355-358; Bain-concept-diagrams 131-133,145; Roland-Berger-modules 5-6,238,422; EY-graphics 195-198; Deloitte-timesaver 47-49; McKinsey-frequently-used 222; AT-Kearney-charts 1

### `cube-3d` — Cube (three dimensions)
- **Story:** Segmentation across three dimensions at once.
- **Use when:** Customer x product x channel.
- **Avoid when:** Most audiences (hard to read).
- **Parts:** isometric cube grid with one highlighted cell
- **Count:** 8–48 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** target cell in accent
- **Sources (21 slides):** Roland-Berger-modules 278,283-285,313,363; McKinsey-frequently-used 2,7-9,38; EY-graphics 147-151; Quick-Presentation-Toolkit 166-168; Bain-concept-diagrams 55; AT-Kearney-charts 205

### `framework` — Classic consulting frameworks
- **Story:** A recognised framework applied to the client.
- **Use when:** 5 forces, 7S, 3Cs, SWOT, SCP, 4P/5P, BCG growth-share, GE/McKinsey 9-box, value creation.
- **Parts:** framework-specific
- **Count:** 3–9 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** fixed geometry per framework
- **Emphasis:** the element under discussion in accent
- **Sources (27 slides):** McKinsey-frequently-used 4,11,91,95,107,112-115,241; Roland-Berger-modules 261,280-281,286,331,340,342,344; Deloitte-timesaver 147,153,195; EY-graphics 27,182; BearingPoint-diagrams 152; Bain-concept-diagrams 109; AT-Kearney-charts 167; Quick-Presentation-Toolkit 242


## E. Compare & position

### `matrix-2x2` — Positioning matrix (2x2 / 3x3)
- **Story:** Items classified on two dimensions; the quadrant says what to do.
- **Use when:** Prioritisation (impact vs ease), portfolio, segmentation, scenarios.
- **Avoid when:** One dimension (use bar).
- **Parts:** axes with labels low->high; quadrant titles + bullets; optional plotted items
- **Count:** 4–16 · **Engine:** grid
- **Generator:** matrix
- **Scaling:** grid rows x cols; 2x2, 2x3, 3x3, 4x3, 4x4 seen; 'extended' variant adds commentary column per row
- **Emphasis:** target quadrant in accent
- **Example title:** "Two of seven initiatives are quick wins"
- **Sources (72 slides):** Roland-Berger-modules 22,175-178,206-207,279,339,353-358,361,424; BearingPoint-diagrams 59,78-79,92-93,127-128,132,147-149,156-157,159; Quick-Presentation-Toolkit 46,61-62,118-119,162-165,169,402-405; McKinsey-frequently-used 106,109,215-217,244-246; EY-graphics 79,82,85,124-125,145,166; Deloitte-timesaver 109,150-152,210; AT-Kearney-charts 32,177,234; Concept-graphics-mono 85-86; Bain-concept-diagrams 54,150

### `bubble-portfolio` — Bubble portfolio
- **Story:** Items positioned on two measures with size as third.
- **Use when:** Business portfolio, market attractiveness, risk heat.
- **Parts:** scatter axes + sized bubbles + quadrant lines/zones
- **Count:** 3–20 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** bubble area proportional to size
- **Emphasis:** client bubble in accent
- **Sources (24 slides):** AT-Kearney-charts 31,33-37,106-112; BearingPoint-diagrams 134,142,153,155,160; Roland-Berger-modules 268,382; McKinsey-frequently-used 130; Deloitte-timesaver 221; EY-graphics 88; Quick-Presentation-Toolkit 117

### `pros-cons` — Pros & cons / plus-minus
- **Story:** Two sides of a decision.
- **Use when:** Option evaluation, advantages/disadvantages, chances/risks, opportunities/threats.
- **Parts:** two columns (+ / -) or item splitting into + and -
- **Count:** 2 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** columns equal
- **Emphasis:** verdict box below in accent
- **Sources (20 slides):** Roland-Berger-modules 30-31,98,201-205,228; BearingPoint-diagrams 12,89-91,115; Quick-Presentation-Toolkit 59-60,218-220; EY-graphics 184

### `before-after` — From-to / before-after
- **Story:** Current state vs target state; what changes.
- **Use when:** Transformation, today vs tomorrow, old vs new model.
- **Parts:** left box (from, grey) -> arrow/chevron -> right box (to, accent); or table with from/to rows
- **Count:** 1–8 · **Engine:** row
- **Generator:** beforeAfter
- **Scaling:** rows of from->to pairs for multiple changes
- **Emphasis:** target state in accent
- **Example title:** "Moving from product silos to customer teams"
- **Sources (33 slides):** Quick-Presentation-Toolkit 7-10,79-82,87; BearingPoint-diagrams 38,107,123-124,140,166-167; Roland-Berger-modules 88,220,255-256,272,277,301; EY-graphics 42-43,84,146; Deloitte-timesaver 139,144,184; McKinsey-frequently-used 10,72; AT-Kearney-charts 96

### `balance` — Balance / trade-off
- **Story:** Weighing two sides; equilibrium vs imbalance.
- **Use when:** Trade-offs, cost vs benefit, risk vs reward, imbalance that needs fixing.
- **Parts:** beam on fulcrum with boxes/balls on each side; level or tilted
- **Count:** 2–4 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** tilt angle shows which side outweighs (max 12 deg)
- **Emphasis:** heavier side in accent
- **Example title:** "Benefits outweigh the transition costs"
- **Sources (45 slides):** Bain-concept-diagrams 83-89,117-118,160; Roland-Berger-modules 37-40,95-97,306-307,364; Quick-Presentation-Toolkit 129-137; EY-graphics 62,64,67-68,71; McKinsey-frequently-used 30-31,228-229; Concept-graphics-mono 76-77; BearingPoint-diagrams 10-11; Deloitte-timesaver 192-193; AT-Kearney-charts 212

### `scoring-table` — Scoring / evaluation table
- **Story:** Options rated against criteria with symbols.
- **Use when:** Option evaluation, capability assessment, vendor comparison, status reporting.
- **Parts:** options x criteria table with Harvey balls / stars / arrows / traffic lights / heat cells + legend
- **Count:** 2–12 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** grid; symbol size 0.22in; legend bottom
- **Emphasis:** recommended row highlighted
- **Example title:** "Option B scores best on four of five criteria"
- **Sources (22 slides):** Quick-Presentation-Toolkit 213-215,217,222-223; Deloitte-timesaver 165-169; BearingPoint-diagrams 144-145,163; EY-graphics 179-181; AT-Kearney-charts 49,173,232; McKinsey-frequently-used 155; Roland-Berger-modules 403

### `table` — Text / data table
- **Story:** Many values or attributes that must be referenced.
- **Use when:** Detail, methodology, backup, comparison of attributes.
- **Avoid when:** Main message slides (BCG: tables in appendix).
- **Parts:** header row, row labels, thin rules, totals bold, numbers right-aligned
- **Count:** 2–12 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** auto column widths; max ~8 cols x 12 rows
- **Emphasis:** key row/column shaded
- **Sources (21 slides):** Roland-Berger-modules 101-103,229-234,426; McKinsey-frequently-used 160-164; Deloitte-timesaver 4-7; Concept-graphics-mono 182; Bain-concept-diagrams 136

### `scale-position` — Spectrum / gauge / thermometer
- **Story:** Where something sits on a scale.
- **Use when:** Maturity rating, confidence, readiness, temperature of opinion.
- **Parts:** scale bar/arc/thermometer with marker(s) and labelled zones
- **Count:** 1–8 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** zones equal
- **Emphasis:** marker in accent
- **Sources (12 slides):** Bain-concept-diagrams 127-129; Deloitte-timesaver 212-214; Concept-graphics-mono 199-200; AT-Kearney-charts 168-169; Roland-Berger-modules 183; Quick-Presentation-Toolkit 216

### `radar` — Spider / radar
- **Story:** Profile across many dimensions vs a benchmark.
- **Use when:** Capability gaps, perception vs reality, client vs competitors.
- **Avoid when:** >2 series.
- **Parts:** N axes, filled polygons
- **Count:** 5–10 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** axis angle=360/n
- **Emphasis:** client polygon in accent
- **Sources (10 slides):** AT-Kearney-charts 51-52,170,207; Bain-concept-diagrams 138-140; Quick-Presentation-Toolkit 115-116; Deloitte-timesaver 76


## F. Forces & cause-effect

### `forces-in` — Forces acting on a centre
- **Story:** External pressures pushing on one subject.
- **Use when:** Market forces, pressures on margin, influences on a decision.
- **Parts:** centre shape + N arrows pointing in, each labelled
- **Count:** 2–8 · **Engine:** radial
- **Generator:** forcesIn
- **Scaling:** arrow angle=360/n; arrows stop 0.15in short of centre
- **Emphasis:** strongest force in accent
- **Example title:** "Four pressures are squeezing retail margins"
- **Sources (73 slides):** Quick-Presentation-Toolkit 42-45,63-65,225-241,291,378; Roland-Berger-modules 52,166-171,208-210,326-327,330,334; Concept-graphics-mono 63-73; EY-graphics 11,18-21,23-24,29,39,49; BearingPoint-diagrams 71-76,94; McKinsey-frequently-used 90,94,98; Deloitte-timesaver 196-197

### `impact-out` — Impact radiating out
- **Story:** One change and its effects on N areas/stakeholders.
- **Use when:** Impact of a decision, consequences, ripple effects.
- **Parts:** centre + N arrows/lines out to effect boxes
- **Count:** 2–8 · **Engine:** radial
- **Generator:** hubSpoke
- **Scaling:** as hub-spoke
- **Emphasis:** centre in accent
- **Sources (13 slides):** Roland-Berger-modules 160,184-185,282; Quick-Presentation-Toolkit 21-22,53-54; Deloitte-timesaver 181,187-188; McKinsey-frequently-used 6; BearingPoint-diagrams 68

### `converge` — Convergence to one goal
- **Story:** Many initiatives/inputs aligned towards one goal.
- **Use when:** Alignment, programme of initiatives, integration.
- **Parts:** N arrows/lines from left converging into goal circle/arrow
- **Count:** 2–10 · **Engine:** converge
- **Generator:** converge
- **Scaling:** input rows evenly spaced; converge point at 70% width
- **Emphasis:** goal in accent
- **Example title:** "Eight initiatives all serve one goal: margin"
- **Sources (37 slides):** Bain-concept-diagrams 24-26,30,111-115; EY-graphics 8,15,32-33,44,46,95-96; Concept-graphics-mono 7-8,75,101-104; Roland-Berger-modules 50,135,287,314,374; McKinsey-frequently-used 5,12,39,105; Quick-Presentation-Toolkit 27,247-248; BearingPoint-diagrams 39

### `barrier` — Barrier / obstacle / breakthrough
- **Story:** Something blocks progress, or progress breaks through.
- **Use when:** Barriers to growth, resistance to change, dead ends, breakthroughs.
- **Parts:** arrow(s) + wall; variants: stopped, blocked, passing through, broken wall
- **Count:** 1–6 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** arrows stacked vertically
- **Emphasis:** barrier or breakthrough in accent
- **Example title:** "Regulation is the main barrier to scale"
- **Sources (39 slides):** Quick-Presentation-Toolkit 6,23,84-86,142-148,153-154; Roland-Berger-modules 47-48,131,164,188-190,219,359; EY-graphics 34,47-48,51-52,56; Concept-graphics-mono 88,90,92,177; BearingPoint-diagrams 28,85-86,109; Bain-concept-diagrams 82; AT-Kearney-charts 210

### `filter` — Filter / screening
- **Story:** Many items pass through criteria; few remain.
- **Use when:** Selection, due diligence screens, prioritisation.
- **Parts:** items -> N screens/filters (shrinking arrow) -> result
- **Count:** 1–5 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** screens evenly spaced along arrow
- **Emphasis:** result in accent
- **Sources (16 slides):** Concept-graphics-mono 1-6; McKinsey-frequently-used 40-45; EY-graphics 50,55; BearingPoint-diagrams 77; Roland-Berger-modules 172

### `chain-reaction` — Chain reaction / cause and effect
- **Story:** One action triggers the next (domino, Newton's cradle, gears).
- **Use when:** Knock-on effects, causal chains, interdependent mechanisms.
- **Parts:** N elements in a chain with arrows; or gears meshing
- **Count:** 2–6 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** elements evenly spaced on a row
- **Emphasis:** first cause and final effect in accent
- **Example title:** "A price cut triggers a chain of competitor responses"
- **Sources (28 slides):** Quick-Presentation-Toolkit 3-5,171-173,175; Roland-Berger-modules 78-79,82-84,93; BearingPoint-diagrams 5-8; Bain-concept-diagrams 147-149; EY-graphics 57-58,61; AT-Kearney-charts 200,202-203; Concept-graphics-mono 109,139

### `opposing` — Opposing forces / conflict / tension
- **Story:** Two sides pulling apart or clashing.
- **Use when:** Conflicts of interest, tensions, controversy.
- **Parts:** two arrows facing/opposing, lightning, spring, opposing brackets
- **Count:** 2–3 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** conflict point in accent
- **Sources (23 slides):** Concept-graphics-mono 57-62,112-113,142-143; Roland-Berger-modules 32-34,94,114-115; BearingPoint-diagrams 9,21-22; Quick-Presentation-Toolkit 19-20,41; EY-graphics 40

### `gap` — Gap / level shift
- **Story:** Distance between current and target level.
- **Use when:** Performance gaps, capacity vs demand, ambition gap.
- **Parts:** two levels with gap bracket/arrow; or step in a line
- **Count:** 1–3 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** gap in accent
- **Sources (7 slides):** Concept-graphics-mono 79-80; EY-graphics 35-36; Quick-Presentation-Toolkit 83,250; Roland-Berger-modules 53

### `exchange` — Exchange / cooperation between two parties
- **Story:** Two parties interacting, exchanging, cooperating or depending on each other.
- **Use when:** Partnerships, interfaces, supplier-customer, dependence.
- **Parts:** two boxes + arrows between (exchange, coupled, interlocking)
- **Count:** 2 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** 
- **Sources (27 slides):** Roland-Berger-modules 51,127-129,132,163,328-329; Concept-graphics-mono 55-56,74,78; BearingPoint-diagrams 27,29,69,170; McKinsey-frequently-used 92-93,206; EY-graphics 9-10,169; Deloitte-timesaver 29,107; Quick-Presentation-Toolkit 24,138; Bain-concept-diagrams 21

### `separation` — Separation / split
- **Story:** Something splits into parts (spin-off, carve-out, break).
- **Use when:** Carve-outs, demergers, broken links.
- **Parts:** one shape torn/jagged/zipped into two
- **Count:** 2–3 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** 
- **Sources (17 slides):** EY-graphics 25,74-77,106; Roland-Berger-modules 222-225,333; BearingPoint-diagrams 111-113; Concept-graphics-mono 13; McKinsey-frequently-used 97; Quick-Presentation-Toolkit 90

### `change-direction` — Change of direction / turnaround
- **Story:** A pivot or U-turn: the path changes.
- **Use when:** Turnaround, strategic pivot, rethink.
- **Parts:** arrow bending/turning; moment-of-change marker
- **Count:** 1 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** new direction in accent
- **Sources (15 slides):** Roland-Berger-modules 99,157-159,221,335; Quick-Presentation-Toolkit 37-39,249; BearingPoint-diagrams 13,67,110; McKinsey-frequently-used 99; EY-graphics 60

### `metaphor` — Visual metaphor
- **Story:** A picture that carries the idea (maze=complexity, summit=goal, iceberg=hidden, dice=uncertainty, bullseye=focus).
- **Use when:** Section openers, conceptual messages for senior audiences.
- **Avoid when:** Data-heavy slides; clip-art look (RB rule: use linear monochrome pictograms).
- **Parts:** single illustrative graphic + 2-5 labels
- **Count:** 1–5 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** 
- **Sources (54 slides):** Concept-graphics-mono 9-12,91,174-176,178-181,183-189,191-198; Roland-Berger-modules 46,77,87,134,254,303,309-310,362,365,368,425; McKinsey-frequently-used 27,33-34; Bain-concept-diagrams 78-79,116; AT-Kearney-charts 171-172,204; Quick-Presentation-Toolkit 25-26,68; Deloitte-timesaver 143,194; EY-graphics 144


## G. Data

### `column-chart` — Column chart (time series)
- **Story:** How a value changes over a few periods.
- **Use when:** <= ~10 periods, discrete values (BCG rule).
- **Avoid when:** Long continuous series (use line).
- **Parts:** columns, data labels on top, CAGR arrow/callout, no gridlines
- **Count:** 2–12 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** bar gap 50-60% of bar width
- **Emphasis:** latest/forecast or key column in accent; forecast hatched/lighter
- **Example title:** "Sales grew 11% a year since 2019"
- **Sources (42 slides):** AT-Kearney-charts 56,62-63,65-70,124-125,129-136; Deloitte-timesaver 60-64,87-88; Quick-Presentation-Toolkit 91,99-103,105; McKinsey-frequently-used 131-133,143; Roland-Berger-modules 383-385,395; BCG-writing-clear-slides 24

### `line-chart` — Line / area chart (trend)
- **Story:** Trend or slope over many periods.
- **Use when:** >10 points, continuous data, slope is the point.
- **Parts:** lines with end labels instead of legend
- **Count:** 1–5 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** client line in accent, others grey
- **Sources (42 slides):** AT-Kearney-charts 39,41-44,47,82-85,114-115,117-118,120,148-150; Deloitte-timesaver 77-82; Quick-Presentation-Toolkit 106-107,110-113; Concept-graphics-mono 116-117,146-147; McKinsey-frequently-used 124,138-140; Roland-Berger-modules 377,390-392

### `bar-chart` — Bar chart (ranking)
- **Story:** Comparison of items, sorted.
- **Use when:** Competitors, survey answers, long labels.
- **Avoid when:** Time series.
- **Parts:** horizontal bars sorted by value, labels at left, values at end
- **Count:** 3–15 · **Engine:** chart
- **Generator:** barRanking
- **Scaling:** -
- **Emphasis:** client bar in accent, others grey/main
- **Example title:** "We rank 4th of 9 on cost per unit"
- **Sources (20 slides):** AT-Kearney-charts 23,26-29,100,102-104; McKinsey-frequently-used 3,125-127; Deloitte-timesaver 51,54-56; Roland-Berger-modules 378-379; EY-graphics 53

### `stacked-chart` — Stacked / 100% chart (mix)
- **Story:** How the composition of a total differs or shifts.
- **Use when:** Cost structures, share shifts, mix by segment.
- **Avoid when:** >6 segments.
- **Parts:** stacked columns/bars with totals on top; series lines between stacks; segment labels at right
- **Count:** 2–8 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** the segment that moved in accent
- **Example title:** "Online share doubled to 34% in three years"
- **Sources (46 slides):** AT-Kearney-charts 21-22,24-25,54-55,57-61,64,71-74,98-99,101,123,126-128,137,139-140,233; Deloitte-timesaver 52-53,57-59,65-67,72; McKinsey-frequently-used 128-129,134-135; Roland-Berger-modules 380-381,386-387; EY-graphics 63; Quick-Presentation-Toolkit 104

### `waterfall` — Waterfall / bridge
- **Story:** How you get from one total to another through additions and subtractions.
- **Use when:** Profit bridges, cost breakdowns, price-to-margin walks, budget variance.
- **Parts:** start bar, floating delta bars, end bar; connector lines; values on bars
- **Count:** 3–12 · **Engine:** chart
- **Generator:** waterfall
- **Scaling:** -
- **Emphasis:** start and end bars in accent; increases/decreases neutral or green/red
- **Example title:** "Price increases more than offset higher input costs"
- **Sources (26 slides):** AT-Kearney-charts 81,89-92,147,153-156; Quick-Presentation-Toolkit 93-98; Roland-Berger-modules 130,174,397-398; Deloitte-timesaver 83-86; McKinsey-frequently-used 145-146

### `mekko` — Mekko / market map
- **Story:** Two dimensions in one chart: segment size (width) and share within (height).
- **Use when:** Market maps, share by segment.
- **Parts:** variable-width 100% stacked columns
- **Count:** 2–8 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** client share in accent
- **Sources (5 slides):** AT-Kearney-charts 7-9,158-159

### `pie-chart` — Pie / doughnut (share)
- **Story:** Parts of a whole at one point in time.
- **Use when:** <= 5 slices, one slice is the point.
- **Avoid when:** Comparisons across time (use stacked).
- **Parts:** pie/doughnut with labels outside; total in centre; breakout to stacked column for detail
- **Count:** 2–6 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** the slice that matters in accent, others grey
- **Sources (43 slides):** Quick-Presentation-Toolkit 120,122-127,282-284,333,368-370,420; AT-Kearney-charts 76-80,86-87,142-146,151; Roland-Berger-modules 198-200,388,393-394; Deloitte-timesaver 69-71,73; McKinsey-frequently-used 136,141-142; Concept-graphics-mono 156-157

### `scatter` — Scatter / correlation
- **Story:** Relationship between two variables.
- **Use when:** Regression, causal claims, positioning on two numbers.
- **Parts:** points with labels; trend line only if sure (BCG)
- **Count:** 5–50 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** client point in accent
- **Sources (11 slides):** AT-Kearney-charts 40,45-46,48,116,121; Deloitte-timesaver 89-90; McKinsey-frequently-used 144; BCG-writing-clear-slides 30; Roland-Berger-modules 396

### `combo-chart` — Column + line (dual axis)
- **Story:** A value and a rate together.
- **Use when:** Units vs percentage only (ATK rule).
- **Avoid when:** Two unrelated units.
- **Parts:** columns on primary, line on secondary axis
- **Count:** 1–2 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** 
- **Sources (4 slides):** BearingPoint-diagrams 164-165; BCG-writing-clear-slides 17; AT-Kearney-charts 138

### `small-multiples` — Small multiples
- **Story:** The same chart repeated for several entities.
- **Use when:** Comparing regions/products on the same measure.
- **Avoid when:** >4 charts (ATK: max 3 stacked vertically).
- **Parts:** 2-4 identical charts, shared scale, one highlighted
- **Count:** 2–4 · **Engine:** grid
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** grid; same axes
- **Emphasis:** the outlier chart in accent
- **Sources (10 slides):** Quick-Presentation-Toolkit 152,221,290,377; Bain-concept-diagrams 151-152; Roland-Berger-modules 28-29; BCG-writing-clear-slides 32; Deloitte-timesaver 68

### `chart-commentary` — Chart with commentary / conclusion
- **Story:** Data on one side, its meaning on the other.
- **Use when:** Most data slides: chart left 60%, takeaway bullets right 40% or conclusion box after arrow.
- **Parts:** chart + text column or arrow -> conclusion box; tombstone bar at bottom
- **Count:** 1 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** 60/40 split
- **Emphasis:** conclusion box in accent
- **Sources (72 slides):** McKinsey-frequently-used 267-301; Roland-Berger-modules 104-113,343,413-420; AT-Kearney-charts 94,201,219-231; Deloitte-timesaver 74-75; Quick-Presentation-Toolkit 114

### `kpi-numbers` — Big numbers / KPI callouts
- **Story:** A few headline figures that tell the story alone.
- **Use when:** Executive summaries, results, reach (countries, people, revenue).
- **Parts:** 2-5 large numbers (44-60pt) with short labels; optional icons/map
- **Count:** 1–5 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** w=(W-(n-1)g)/n
- **Emphasis:** most important number in accent
- **Sources (10 slides):** Deloitte-timesaver 118,233-239,256; EY-graphics 229

### `curve` — Conceptual curves
- **Story:** Life cycle, S-curve, experience/cost curve, bell curve.
- **Use when:** Positioning on a maturity/lifecycle curve.
- **Parts:** curve on axes with labelled points
- **Count:** 1–6 · **Engine:** chart
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** client point in accent
- **Sources (9 slides):** Deloitte-timesaver 205-209; Roland-Berger-modules 275,389; McKinsey-frequently-used 137; BearingPoint-diagrams 169

### `map` — Geographic map
- **Story:** Where things are: footprint, regional differences.
- **Use when:** Market presence, regional metrics, China provinces/cities, world regions.
- **Parts:** editable map shapes; shaded regions; callouts/numbers
- **Count:** 1–40 · **Engine:** free
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** -
- **Emphasis:** focus regions in accent, others grey
- **Sources (89 slides):** Maps-world-US-China 1-40; Deloitte-timesaver 119-136,154-159; Quick-Presentation-Toolkit 335-346; Roland-Berger-modules 100,431-435; Concept-graphics-mono 81-84; McKinsey-frequently-used 158,305; BearingPoint-diagrams 143

### `icon-infographic` — Icon infographic / ranking elements
- **Story:** Numbered or iconised items for a visual list.
- **Use when:** Marketing-style lists, steps with icons, ranking.
- **Avoid when:** Analytical decks.
- **Parts:** N numbered shapes (bubbles, ribbons, arrows, cubes) with icon + text
- **Count:** 3–6 · **Engine:** row
- **Generator:** not yet — build on its engine when first needed
- **Scaling:** row or staircase
- **Emphasis:** first item in accent
- **Sources (35 slides):** Deloitte-timesaver 216,218-220,222-232,242-252; EY-graphics 152-157,172; Roland-Berger-modules 267; AT-Kearney-charts 174
