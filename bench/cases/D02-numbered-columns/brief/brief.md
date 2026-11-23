# Builder brief: D02-numbered-columns

You are a fresh builder for one case of the reproduction benchmark in this folder. Write the build for this case from its prompt alone, the way a builder following `DECK-SYSTEM.md` would.

**Read:** `DECK-SYSTEM.md` (the procedure; what applies to one slide), `bench/README.md` ("Two modes, two honesty rules"), the prompt `bench/cases/D02-numbered-columns/prompt.md`, the harness `bench/lib/bench_lib.js` and `bench/lib/place_named.py`, and the framework as you need it: `Generators/`, `Style/refs/`, `Objects/README.md` and `Objects/store`, `Templates/`.
**Mode: named slide.** You may look at the named reference slide (slide 11 of `Templates/Deloitte-timesaver.pptx`) and use that slide's own stored object, as `bench/README.md` allows.

**Do not open:** anything else in `bench/cases/` (no build.js, build.py, result.json, compare.png, candidate.*, original.*, slide-text.txt, case.json of any case, no `noise/` folder but your own), `bench/results*.md`, `bench/noise.md`, `bench/review-1.3/`, `bench/scripts/`. Do not run `bench/scripts/` or score against the original.

**Write only into your build folder:** `build.js` (and `build.py` if needed). `build.js` loads the harness relative to its own folder and saves with `L.save(pres, __dirname + "/candidate.pptx")`. You may run it and look at the render (use your own `-env:UserInstallation` for LibreOffice) and run `scripts/deck_lint.py`. Change no file outside your build folder.
