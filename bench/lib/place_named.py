"""place_named.py: the "named reference slide" path. Put the reference slide's own stored object (Objects/store)
into the candidate slide at the same box, then refill its text, chart data and table cells.
Used by a case's build.py after build.js has drawn the frame in the reference style."""
import os, sys
GEN = os.environ.get("GEN") or os.path.join(os.path.dirname(__file__), "../../Generators")
STORE = os.environ.get("STORE") or os.path.join(os.path.dirname(__file__), "../../Objects/store")
sys.path.insert(0, GEN)
import objstore as O
from pptx import Presentation

def place_named(cand, oid, texts=None, chart=None, recolour=None, table=None, box=None, colours="original", replace=None):
    o = O.get(STORE, oid)
    if recolour: o = O.recolour(o, recolour)
    if chart: o = O.set_chart_data(o, chart[0], chart[1])
    bb = box or [v / 914400 for v in o["bbox"]]
    O.place(cand, 1, o, bb, STORE, out_path=cand, texts=texts, colours=colours)
    if replace:                                 # fixed (non-slot) text in the object: {old: new}
        p = Presentation(cand)
        for sh in p.slides[0].shapes:
            for el in sh._element.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}t"):
                if el.text in replace: el.text = replace[el.text]
        p.save(cand)
    if table:                                   # fill empty table cells: table = list of rows (None keeps the cell)
        p = Presentation(cand)
        for sh in p.slides[0].shapes:
            if sh.has_table:
                for i, row in enumerate(table):
                    for j, v in enumerate(row):
                        if v is None or i >= len(sh.table.rows) or j >= len(sh.table.columns): continue
                        c = sh.table.cell(i, j); tf = c.text_frame
                        if tf.text.strip(): continue
                        para = tf.paragraphs[0]
                        if para.runs: para.runs[0].text = v
                        else:
                            r = para.add_run(); r.text = v
                break
        p.save(cand)
    return o
