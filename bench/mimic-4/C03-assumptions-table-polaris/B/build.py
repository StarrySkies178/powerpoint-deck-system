"""Build B, step 2 (run in B/): the stored table case19-polaris-022 with one year column more (2024-2029),
new scenario names, row labels and numbers. table_size(cols=7) adds the column and re-divides the data columns
(with matching paragraph indents); every cell is refilled with objstore.set_texts (one item per cell, row by row)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import mimic_util as U
O = U.O
deck = os.path.abspath("candidate.pptx")
obj = O.get(U.STORE, "case19-polaris-022")
X, Y, W, H = (v / U.EMU for v in obj["bbox"])
obj = O.table_size(obj, cols=7)

years = [str(y) for y in range(2024, 2030)]
scen = [
    ("Upside Case",   [180, 215, 250, 290, 335, 385], [3, 6, 7, 9, 9, 11], [22, 28, 30, 33, 31, 29]),
    ("Central Case",  [180, 205, 230, 255, 280, 305], [3, 5, 6, 6, 7, 7],  [22, 24, 25, 23, 22, 21]),
    ("Downside Case", [180, 195, 210, 222, 234, 245], [3, 2, 2, 1, 3, 2],  [22, 19, 18, 17, 15, 14]),
]
rows = []
for name, outlets, lfl, ecom in scen:
    rows.append([name] + years)
    rows.append(["#outlets"] + [str(v) for v in outlets])
    rows.append(["Like-for-like Growth(%)"] + [f"{v}%" for v in lfl])
    rows.append(["E-commerce Growth(%)"] + [f"{v}%" for v in ecom])
obj = O.set_texts(obj, [c for row in rows for c in row])
r = O.place(deck, 1, obj, (X, Y, W, H), U.STORE, colours="original")
print("placed", obj["id"], r)
U.explicit_borders(deck)
U.page_number(deck, 22)
