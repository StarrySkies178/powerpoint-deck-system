"""tables.py: build a native PowerPoint table from a spec measured on the page.

spec: {"slide", "name", "clear": [[x0,y0,x1,y1],...], "keep": [regex...], "x": [col edges px], "y": [row edges px],
       "default": {cell defaults}, "cells": {"r,c": cell}, "merge": [[r0,c0,r1,c1],...], "col_bg": {c: hex}}
cell: {"t": text or [[text, {b,c,i,sz}]...] per paragraph list, "fill": hex|None, "c": hex, "b": bool, "i": bool, "sz": pt,
       "al": l|c|r, "va": t|m|b, "pad": [l,t,r,b] px, "chip": [w,h] px (fill drawn as a chip: borders in col_bg/row colour),
       "bB": [hex, px] bottom border, "bT": [hex, px] top border}
"""
import copy, re
from lxml import etree
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

A = "http://schemas.openxmlformats.org/drawingml/2006/main"
def q(t): return "{%s}%s" % (A, t.split(":")[1])

def set_border(tcPr, side, color, w_emu):
    tag = {"L": "a:lnL", "R": "a:lnR", "T": "a:lnT", "B": "a:lnB"}[side]
    for e in tcPr.findall(q(tag)): tcPr.remove(e)
    ln = etree.Element(q(tag), w=str(int(w_emu)), cap="flat", cmpd="sng", algn="ctr")
    if color is None or w_emu <= 0:
        etree.SubElement(ln, q("a:noFill"))
    else:
        sf = etree.SubElement(ln, q("a:solidFill")); etree.SubElement(sf, q("a:srgbClr"), val=color)
        etree.SubElement(ln, q("a:prstDash"), val="solid")
    order = ["lnL", "lnR", "lnT", "lnB"]
    pos = 0
    for i, ch in enumerate(tcPr):
        ln_ = etree.QName(ch).localname
        if ln_ in order and order.index(ln_) < order.index("ln" + side): pos = i + 1
    tcPr.insert(pos, ln)

def build(slide, spec, px):
    xs, ys = spec["x"], spec["y"]
    R, C = len(ys) - 1, len(xs) - 1
    E = lambda v: Emu(int(round(v * px)))
    gf = slide.shapes.add_table(R, C, E(xs[0]), E(ys[0]), E(xs[-1] - xs[0]), E(ys[-1] - ys[0]))
    gf.name = "table: " + spec.get("name", "table")
    tbl = gf.table
    tbl.first_row = False; tbl.horz_banding = False; tbl.vert_banding = False; tbl.first_col = False; tbl.last_row = False; tbl.last_col = False
    # no table style
    tblPr = tbl._tbl.find(q("a:tblPr"))
    for e in tblPr.findall(q("a:tableStyleId")): tblPr.remove(e)
    for c in range(C): tbl.columns[c].width = E(xs[c + 1] - xs[c])
    for r in range(R): tbl.rows[r].height = E(ys[r + 1] - ys[r])
    for m in spec.get("merge", []):
        r0, c0, r1, c1 = m; tbl.cell(r0, c0).merge(tbl.cell(r1, c1))
    dflt = spec.get("default", {})
    col_bg = {int(k): v for k, v in spec.get("col_bg", {}).items()}
    for r in range(R):
        for c in range(C):
            cell = tbl.cell(r, c)
            if cell.is_spanned: continue
            d = dict(dflt); d.update(spec.get("cells", {}).get(f"{r},{c}", {}))
            bg = col_bg.get(c)
            fill = d.get("fill")
            if d.get("chip"): pass
            elif fill is None: fill = bg
            if fill: cell.fill.solid(); cell.fill.fore_color.rgb = RGBColor.from_string(fill)
            else: cell.fill.background()
            pad = d.get("pad", [3, 1, 3, 1])
            cell.margin_left, cell.margin_top, cell.margin_right, cell.margin_bottom = [E(p) for p in pad]
            cell.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}[d.get("va", "m")]
            tcPr = cell._tc.get_or_add_tcPr()
            w = xs[c + 1] - xs[c]; h = ys[r + 1] - ys[r]
            if d.get("chip"):
                cw, ch = d["chip"]; lr = max(0, (w - cw) / 2); tb = max(0, (h - ch) / 2)
                cell.fill.solid(); cell.fill.fore_color.rgb = RGBColor.from_string(d["fill"])
                bc = bg or "FFFFFF"
                # a border is drawn centred on the cell edge: twice the gap paints the gap on this side
                for side, g in (("L", lr), ("R", lr), ("T", tb), ("B", tb)): set_border(tcPr, side, bc, 2 * g * px)
            else:
                for side in "LRTB": set_border(tcPr, side, None, 0)
                if d.get("bB"): set_border(tcPr, "B", d["bB"][0], d["bB"][1] * px)
                if d.get("bT"): set_border(tcPr, "T", d["bT"][0], d["bT"][1] * px)
                if d.get("bL"): set_border(tcPr, "L", d["bL"][0], d["bL"][1] * px)
                if d.get("bR"): set_border(tcPr, "R", d["bR"][0], d["bR"][1] * px)
            # text
            tf = cell.text_frame; tf.word_wrap = True
            t = d.get("t", "") or " "                     # an empty cell takes the default 18 pt line in LibreOffice
            paras = t if isinstance(t, list) else [[[t, {}]]] if isinstance(t, str) else t
            if isinstance(t, str): paras = [[[line, {}]] for line in t.split("\n")]
            for p_ in tf.paragraphs:                      # empty cells keep the table's size (else 18 pt rows)
                epr = p_._p.find(q("a:endParaRPr"))
                if epr is None: epr = etree.SubElement(p_._p, q("a:endParaRPr"))
                epr.set("sz", str(int(d.get("sz", 12) * 100)))
            for i, runs in enumerate(paras):
                p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                p.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[d.get("al", "l")]
                for txt, o in runs:
                    rr = p.add_run(); rr.text = txt
                    f = rr.font; f.name = "Arial"; f.size = Pt(o.get("sz", d.get("sz", 12)))
                    f.bold = o.get("b", d.get("b", False)); f.italic = o.get("i", d.get("i", False)) or None
                    f.color.rgb = RGBColor.from_string(o.get("c", d.get("c", "262626")))
    return gf
