# Builder brief: C03-assumptions-table-polaris, roadmap 1.4 diagnosis, variant b

You are a fresh builder for one case of the reproduction benchmark in this folder (`/home/claude/powerpoint-deck-system`, a working copy of the deck system). Write the build for this case the way a builder following `DECK-SYSTEM.md` would.

**Read:** `DECK-SYSTEM.md` (the procedure; what applies to one slide), `bench/README.md` ("Two modes, two honesty rules"), the prompt `bench/cases/C03-assumptions-table-polaris/prompt.md`, the harness `bench/lib/bench_lib.js`, and the framework as you need it: `Generators/`, `Style/refs/`, `Objects/README.md` and `Objects/store`, `Templates/`.

**Variant b: the brief plus a description of the original slide's layout.** Read `bench/diagnosis-1.4/C03-assumptions-table-polaris/b/brief/layout-description.md` first. It was written by someone who saw the original slide and describes its layout in plain words: which zones exist, what kind of figure sits in each, how many columns or rows, what the header and footer bands are. It gives no positions, sizes, fonts or colours: take those from the deck's style profile and its other slides as usual. Build the slide so that its layout follows that description, with the content from the prompt. Choose your own approach otherwise (generators, style profile, stored objects of the deck's OTHER slides).

**Mode: deck as reference, leave-one-out.** The reference deck is `Templates/Case-2019-Polaris.pptx`; you are building slide 22, which in real use does not exist yet.
- Do not look at slide 22 in any form (the .pptx, a render, its text) and do not use its stored objects (`case19-polaris-022` and its parts).
- **Use `bench/diagnosis-1.4/C03-assumptions-table-polaris/b/brief/slide-map.csv` instead of `Style/slide-map.csv`.** It is the same file without slide 22's row. Do not open `Style/slide-map.csv`.
- If a study note in `Style/refs/` names slide 22 as an example ("Polaris 22"), skip that example.
- Renders of the deck's other slides are in `bench/diagnosis-1.4/C03-assumptions-table-polaris/other-slides/` (`NN.png` = slide NN; slide 22 is left out). Use them instead of rendering `Templates/` yourself.
- Your build files must not cite slide 22, its stored objects or its slide-map row: `bench/scripts/heldout.py` checks this and fails the build if they do.

**Do not open:** anything in `bench/cases/` except `bench/cases/C03-assumptions-table-polaris/prompt.md` (no build.js, build.py, result.json, compare.png, candidate.*, original.*, slide-text.txt, case.json, noise/ of any case), anything in `bench/diagnosis-1.4/` outside your own folder and the case's `other-slides/` `bench/diagnosis-1.4/C03-assumptions-table-polaris/b/`, `bench/results*.md`, `bench/noise.md`, `bench/review-1.3/`, `bench/rating-1.7/`, `bench/scripts/`. Do not run `bench/scripts/` or score against the original.

**Write only into your build folder `bench/diagnosis-1.4/C03-assumptions-table-polaris/b/`:** `build.js` (and `build.py` if needed; a `build.py` runs after `build.js` with your folder as working directory). `build.js` loads the harness relative to its own folder, `const L = require(require("path").join(__dirname, "../../../lib/bench_lib.js"));`, and saves with `L.save(pres, __dirname + "/candidate.pptx")`. You may run it and look at the render (LibreOffice with your own profile: `soffice -env:UserInstallation=file:///tmp/lo_C03b --headless --convert-to pdf ...`, then `pdftoppm`), and run `scripts/deck_lint.py`. Change no file outside your build folder, do not use git, and do not touch the frozen framework files.
