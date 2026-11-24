# Builder brief: C06-exec-summary-mindcraft, run7, rebuild 2

You are a fresh builder for one case of the reproduction benchmark in this folder (a working copy of the deck system). Write the build for this case the way a builder following `DECK-SYSTEM.md` would.

**Read:** `DECK-SYSTEM.md` (the procedure; what applies to one slide), `bench/README.md` ("Two modes, two honesty rules"), the prompt `bench/cases/C06-exec-summary-mindcraft/prompt.md`, the harness `bench/lib/bench_lib.js`, and the framework as you need it: `Generators/`, `Style/refs/`, `Objects/README.md` and `Objects/store`, `Templates/`. Build the slide the way a builder following `DECK-SYSTEM.md` would, choosing your own approach (generators, the deck's style profile, stored objects of the deck's OTHER slides, or a mix).

**Mode: deck as reference, leave-one-out.** The reference deck is `Templates/Case-2019-Mindcraft.pptx`; you are building slide 3, which in real use does not exist yet.
- Do not look at slide 3 in any form (the .pptx, a render, its text) and do not use its stored objects (`case19-mindcraft-003` and its parts).
- **Use `bench/phase4/run7/C06-exec-summary-mindcraft/r2/brief/slide-map.csv` instead of `Style/slide-map.csv`.** It is the same file without the target's row. Do not open `Style/slide-map.csv`.
- If a study note in `Style/refs/` names slide 3 as an example ("Mindcraft 3"), skip that example.
- Renders of the deck's other slides are in `bench/phase4/other-slides/C06-exec-summary-mindcraft/` (`NN.png` = slide NN; slide 3 is left out). Use them instead of rendering `Templates/` yourself.
- Your build files must not cite slide 3, its stored objects or its slide-map row: `bench/scripts/heldout.py` checks this and fails the build if they do.

**Do not open:** anything in `bench/cases/` except `bench/cases/C06-exec-summary-mindcraft/prompt.md` (no build.js, build.py, result.json, compare.png, candidate.*, original.*, slide-text.txt, case.json, brief/, noise/ of any case), anything in `bench/phase4/` outside your own folder `bench/phase4/run7/C06-exec-summary-mindcraft/r2/` and the case's `other-slides/`, `bench/diagnosis-1.4/`, `bench/originals-powerpoint/`, `bench/review-*`, `bench/rating-1.7/`, `bench/results*.md`, `bench/noise.md`, `bench/scripts/`. Do not run `bench/scripts/` or score against the original.

**Write only into your build folder `bench/phase4/run7/C06-exec-summary-mindcraft/r2/`:** `build.js` (and `build.py` if needed; a `build.py` runs after `build.js` with your folder as working directory). `build.js` loads the harness relative to its own folder, `const L = require(require("path").join(__dirname, "../../../../lib/bench_lib.js"));`, and saves with `L.save(pres, __dirname + "/candidate.pptx")`. You may run it and look at the render (LibreOffice with your own profile: `soffice -env:UserInstallation=file:///tmp/lo_run7C062 --headless --convert-to pdf ...`, then `pdftoppm`), and run `scripts/deck_lint.py`. Change no file outside your build folder, do not use git, and do not change the framework files.
