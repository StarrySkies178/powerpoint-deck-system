"""Build A, step 2 (run in A/): place the stored table case19-polaris-022 as is, at its own position,
with its original colours; then two file-level touches done outside objstore:
 - every table cell side the object leaves unset gets an explicit 'no line' (LibreOffice otherwise draws a
   rule under each '#stores' row that PowerPoint does not draw; in PowerPoint the result is identical);
 - the slide number reads 22 as in the source deck (static text: LibreOffice ignores firstSlideNum)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import mimic_util as U
O = U.O
deck = os.path.abspath("candidate.pptx")
obj = O.get(U.STORE, "case19-polaris-022")
X, Y, W, H = (v / U.EMU for v in obj["bbox"])
r = O.place(deck, 1, obj, (X, Y, W, H), U.STORE, colours="original")
print("placed", obj["id"], r)
U.explicit_borders(deck)
U.page_number(deck, 22)
