# Learning from the reference libraries (~2,500 slides)

Read this when studying the decks in `Templates/`, not during a deck task. Claude doesn't get smarter just by looking at slides: nothing carries over to the next chat unless it's written into a file, so **every pass must produce saved outputs**. Do the passes in batches across several chats. Each chat starts by reading the status below and `catalogue/index.md` to see where the last one stopped.

## Status

- **Done:** `Style/style-findings.md`. All 11 decks surveyed (look, palette, best use, shared consulting rules).
- **Done (raw):** `Style/slide-index.md`. Every slide's title text, by deck. Caveat: the titles in Concept-graphics-mono show only a garbled date, so that deck needs a visual pass.
- **Next:** Pass 1 classification, starting with the deck that covers the most starter archetypes (AT-Kearney-charts for charts, then McKinsey-frequently-used).

## Pass 1: Inventory (fast, low resolution)

- Render each deck as contact sheets (~24–36 thumbnails per image). Use `Style/slide-index.md` to speed this up.
- Work on one deck at a time. After each deck, append to `catalogue/index.md`:
  `deck | slide | archetype (or NEW) | message type | quality 1–3 | notes`
- Mark duplicates as duplicates. Most slides repeat across firms.
- Never leave more than one deck's findings only in the chat. Write them down before moving on.

## Pass 2: Cluster

- From `catalogue/index.md`, group the slides into archetypes. Expect ~80–150 distinct ones, plus frameworks.
- Rank them by frequency × usefulness, starting with the 18 starter archetypes (`maintenance/setup.md`).
- Frameworks (Five Forces, value chain, SWOT, BCG matrix, 7S, etc., mainly from McKinsey-frequently-used) go in `catalogue/frameworks.md` as the message type "apply a known model".

## Pass 3: Study the best examples (high resolution)

- For each archetype, pick the 2–3 best examples, from different firms.
- Save them as images in `catalogue/examples/<archetype>/`.
- Write the full spec (format in `catalogue/README.md`). Describe **structure only**: layout, proportions, label placement, how emphasis is shown. Ignore each firm's colours and fonts.

## Pass 4: Turn into templates

- Build a code template for each studied archetype in the house style (`templates-code/`).
- Run the test briefs.

Later, when building a deck, look at `catalogue/examples/<archetype>/` for the chosen archetype before building it. That's how the libraries keep improving the output.
