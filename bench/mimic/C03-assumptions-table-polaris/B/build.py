"""Build B, step 2 (run in B/): the stored table case19-polaris-022 with one year column more (2024-2029),
new scenario names, row labels and numbers. table_size(cols=7) adds the column; the columns are then
re-spaced evenly and every cell refilled (fill_table: objstore.set_texts does not reach table cells)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import mimic_util as U
O = U.O
deck = os.path.abspath("candidate.pptx")
obj = O.get(U.STORE, "case19-polaris-022")
X, Y, W, H = (v / U.EMU for v in obj["bbox"])
WE = obj["bbox"][2]
obj = O.table_size(obj, cols=7)
first, last_edge = 2780030, 4438650          # label column; right edge of the first number column in the source
step = (WE - last_edge) / 5
obj = U.respace_columns(obj, first, last_edge - first, step)

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
obj = U.fill_table(obj, rows)
r = O.place(deck, 1, obj, (X, Y, W, H), U.STORE, colours="original")
print("placed", obj["id"], r)
U.explicit_borders(deck)
U.page_number(deck, 22)
