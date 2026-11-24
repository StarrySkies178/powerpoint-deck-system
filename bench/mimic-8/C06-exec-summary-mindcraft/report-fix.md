# C06: store fix 2 (extract keeps zero-width and zero-height shapes)

No builder was needed: C06 had no hand code for this fault. Rebuilt (A and B) by the run's chat with the re-extracted store.

case19-mindcraft-003 now has 3 top-level shapes instead of 2: the new one is a zero-width line at the left edge of the
slide (x 0, from y 4.18 in to 7.38 in). The v2.74 builder took the original's thin dark line at the left edge for "a PDF
render artefact"; it is a real line in the deck, which the store used to drop. A and B now show it, as the original does.
Everything else in the slide XML is unchanged.
