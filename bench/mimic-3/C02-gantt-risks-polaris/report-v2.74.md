# C02 gantt and risks (Polaris): open-book mimic report

(Written by the builder; saved by the run's chat because the builder's file tool refused report files.)

Files: `A/build.js` + `A/build.py`, `B/build.js` + `B/build.py`, shared body code in `common.py`. Each build.js draws the frame with the harness (`L.start({ ref: "Case-2019-Polaris" })`). build.py adds the redrawn native parts and places the stored body on top. No pictures anywhere.

## Stored objects placed
- **`case19-polaris-016`** (the slide's whole body, 25 shapes): placed at 1:1 in its own position with `colours="original"`.
  - **As is (A), refilled (B):** the header box (el. 1), the year axis (2), the "and Potential Mitigations" box (8), the three challenge boxes (9-11), the three mitigation boxes (12-14) and the red rule under the right header (0).
  - **Kept, with letters written into their own text bodies:** the three letter circles (3-5) and the Brand / Design boxes (6, 7). Moved to the rows in B.
  - **Gantt bars (15-23):** kept where they are in A. In B re-laid from data as copies of the stored bars.
  - **Two online bars and both legend bars:** copies of the stored bars in A and B.
- **`case19-polaris-016p1`** not used (a subset of 016).
- **The table (graphicFrame) inside 016 was removed** and its content redrawn.

## Redrawn natively, and why
- **The left label column and the Gantt grid.** In the store these are one PDF-converted table with import margins (marR 1.33 in, marL 1.1 in) and character spacing. The a/b/c letters and the Brand/Design words are table text, and the online bars are cell fills. Placed as is in LibreOffice, the labels wrapped word by word, the letters fell outside their circles and the Online/Omni rows were lost. Redrawn as text boxes at measured positions, with the column lines, year rule, block rules and dotted sub-group rule.
- **Parts missing from the stored object:** the red rule under "Implementation Timeline"; the dashed divider between the halves; the two grey rules between challenge blocks; the footer rule; the legend words.
- **Logos:** frame pictures, stripped from the store; no logo files. Following `Objects/images.md`, a plain grey text label.
- **Page number:** plain run "16" (B: "12"), since LibreOffice ignores `firstSlideNum`.

## Failures and workarounds (framework left unchanged)
1. **`place()` shrinks text even at 1:1 scale.** `_autofit` runs whenever `scale_text=True`; its width estimate (0.52 em per character) is too wide, so 14 pt text came out at 12-13 pt with no warning. Workaround: `scale_text=False`.
2. **`role_src` merges two greys.** The mitigation boxes (F1F1F1) and the grey bars (D9D9D9) both map to `bg2`, so `colours="original"` makes the boxes D9D9D9. Set to F1F1F1 explicitly.
3. **`set_texts()` cannot refill these boxes.** It writes the whole string into the first run (loses the red bold "Mitigation:" run) and keeps the PDF-import `spc` and `marR`. Workaround: a run-level refill (`_runs_text`).
4. **`extend()` not used.** The Gantt bars are not a regular row, so a changed row count is laid out from data with copies of the stored bars.

## Build B (changed content)
- New title ("During roll-out, Aurora should act early to contain its execution risks"), page 12, new source, years 2024-2028, new sections, bar spans, headers, challenge blocks with "Response:" boxes, legend words.
- **One item more:** Digital Strategy has 3 initiatives instead of 2, so 12 Gantt rows (the original has 11).
- **Manual fixes:** item pitch tightened from 0.32-0.33 in to 0.295 in; "Key Execution Risks" shortened to "Execution Risks" (wrapped in the stored box); two challenge bullets shortened (fixed-height boxes, no autofit).

## Lint (`--profile Style/refs/Case-2019-Polaris.profile.json`)
- **A:** 0 errors, 1 warning (accent: 11 red bars, the original's own design).
- **B:** 0 errors, 1 warning (accent: 12 shapes).

A matches the layout, positions, colours and type sizes closely. Visible differences: bullet glyphs slightly raised, logos as a text label.
