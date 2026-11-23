# Builder brief: C01-exec-summary-polaris

You are a fresh builder for one case of the reproduction benchmark in this folder. Write the build for this case from its prompt alone, the way a builder following `DECK-SYSTEM.md` would.

**Read:** `DECK-SYSTEM.md` (the procedure; what applies to one slide), `bench/README.md` ("Two modes, two honesty rules"), the prompt `bench/cases/C01-exec-summary-polaris/prompt.md`, the harness `bench/lib/bench_lib.js`, and the framework as you need it: `Generators/`, `Style/refs/`, `Objects/README.md` and `Objects/store`, `Templates/`.
**Mode: deck as reference, leave-one-out.** The reference deck is `Templates/Case-2019-Polaris.pptx`; you are building slide 2, which in real use does not exist yet.
- Do not look at slide 2 in any form (the .pptx, a render, its text) and do not use its stored objects (`case19-polaris-002` and its parts).
- **Use `bench/cases/C01-exec-summary-polaris/brief/slide-map.csv` instead of `Style/slide-map.csv`.** It is the same file without slide 2's row. Do not open `Style/slide-map.csv`.
- If a study note in `Style/refs/` names slide 2 as an example ("Polaris 2"), skip that example.
- Your build files must not cite slide 2, its stored objects or its slide-map row: `bench/scripts/heldout.py` checks this and fails the case if they do.

**Do not open:** anything else in `bench/cases/` (no build.js, build.py, result.json, compare.png, candidate.*, original.*, slide-text.txt, case.json of any case, no `noise/` folder but your own), `bench/results*.md`, `bench/noise.md`, `bench/review-1.3/`, `bench/scripts/`. Do not run `bench/scripts/` or score against the original.

**Write only into your build folder:** `build.js` (and `build.py` if needed). `build.js` loads the harness relative to its own folder and saves with `L.save(pres, __dirname + "/candidate.pptx")`. You may run it and look at the render (use your own `-env:UserInstallation` for LibreOffice) and run `scripts/deck_lint.py`. Change no file outside your build folder.
