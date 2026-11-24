# Store-tool fix re-run: what to do (one case)

You are a fresh builder. Your case folder is `bench/mimic-1/<case>/` (or `mimic-<n>/` as your prompt says) in the working copy
`/home/claude/powerpoint-deck-system`. It is a copy of the open-book mimic build of v2.74: `brief.md` (the original task: read it),
`report-v2.74.md` (what that builder did, and which store faults it worked round), `A/` and `B/` with its code, and `original.png`.

One store tool has just been fixed in `Generators/objstore.py` (named in your prompt). Your job:

1. Find the hand code in A and B (and any shared helper in the case folder) that worked round THAT fault. Delete it and use the fixed
   store tool instead (read its docstring in `Generators/objstore.py`).
2. **Do not work round the fixed tool.** If it still gives a wrong result, leave the result as the tool makes it and describe the
   fault exactly (which object, what you passed, what came out). Do not add new hand code for it. Hand code for OTHER faults (the
   other work-arounds listed in report-v2.74.md) stays as it is.
3. Keep the content of A and B exactly as before (same text, same numbers). Rebuild `A/candidate.pptx` and `B/candidate.pptx`
   (run build.js then build.py, as before). Render both (LibreOffice, `soffice --headless --convert-to pdf`, then `pdftoppm`) into
   `/tmp/<your case>-fix/` and compare A with `original.png` and with the v2.74 render of A (render `../../mimic/<case>/A/candidate.pptx`
   the same way). Say whether A and B look as good as before, better, or worse, and where.
4. Write `report-fix.md` in the case folder: which hand code was removed (function names, and lines before and after: `wc -l` of
   the files), what still needed hand code for this fault and why (should be nothing), anything the fixed tool did wrong, and the
   look of A and B against v2.74. Write it with the Bash tool (a heredoc) if your file tool refuses report files.

Rules: write only inside your case folder and /tmp; do not change any framework file (`Generators/`, `scripts/`, `Objects/`); no git;
no pictures of the slide. Open nothing under `bench/cases/`.
