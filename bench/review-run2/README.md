# Roadmap 4.2 Run 2: comparison images after Run 2

Made 2026-11-24 (v2.51), in the same form as `bench/review-1.3-powerpoint/`.

- **Left:** the original slide, from `bench/originals-powerpoint/<deck>-ppt.pdf`, exported by Microsoft PowerPoint on the Mac, rendered to 1920 px wide.
- **Right:** the first fresh blind rebuild made with the Run 2 rules (`phase4/run2/<case>/r1/candidate.pptx`), rendered to 1920 px wide by the benchmark's own renderer (LibreOffice in the official environment).
- Only the case id is on the image. No scores.

Run 2 (numbers come from the brief) was measured and **not kept**: C05 fell beyond the noise band (layout 0.17 to 0.00), so the files of v2.49 were restored. These rebuilds were still made under the Run 2 rules. C04's right side follows its prompt, whose numbers differ from the original (see `logs/proposals.md`).
