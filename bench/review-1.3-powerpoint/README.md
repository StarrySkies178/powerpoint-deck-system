# Roadmap step 1.3: comparison images with the originals drawn by PowerPoint

Made 2026-11-24 (v2.41) because the first set (`bench/review-1.3/`) showed the originals as LibreOffice draws them with substitute fonts: labels broke mid-word and text overlapped, which the original decks do not do.

- **Left:** the original slide, from `bench/originals-powerpoint/<deck>-ppt.pdf`, exported by Microsoft PowerPoint on the Mac (real fonts, real layout), rendered to 1920 px wide.
- **Right:** the system's stored build (`cases/<id>/candidate.pptx`), rendered to 1920 px wide by the benchmark's own renderer.
- Only the case id is on the image. No scores.

**What the PowerPoint originals change in the scores (measured, nothing in the benchmark changed):** the PowerPoint picture and the old picture of the same original share 85% to 100% of their ink cells (lowest: C03 0.85, C02 0.89, C07 0.91). Rescoring the stored builds against the PowerPoint originals, with floors recomputed from PowerPoint pictures, moves mean layout from 0.14 to 0.13 and mean visual from 0.20 to 0.21. No case passes either way. So the wrong rendering made the pictures misleading to look at, but it is not why the cases fail.

The benchmark still scores against its old originals (`cases/<id>/original.png`). Replacing them with the PowerPoint ones is a change to the measuring tool and is the user's decision.
