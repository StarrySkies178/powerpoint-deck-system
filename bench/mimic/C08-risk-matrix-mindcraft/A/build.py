"""C08 open-book mimic: place the stored slide object case19-mindcraft-015 and refill it from content.json.
Run after build.js, with this folder (A/ or B/) as working directory. Only objstore operations and edits of the
object's own shapes are used (no new drawing code): cells recoloured, markers and labels cloned from the stored
ones, table rows refilled (and added with objstore.table_size), then objstore.place(..., colours="original")."""
import copy, json, os, re, sys, zipfile
from lxml import etree

HERE = os.path.abspath(os.getcwd())
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "Generators"))
import objstore as O

STORE = os.path.join(ROOT, "Objects/store")
OID = "case19-mindcraft-015"
E = O.EMU; A = O.A; NS = O.NS
SPEC = json.load(open(os.path.join(HERE, "content.json"), encoding="utf-8"))
ROLE = {"red": "accent1", "blue": "accent2", "dark": "accent5"}          # the object's own roles (role_src: C00000, 46637A, 252525)
SHADES = ["FFFFFF", "F1F1F1", "D9D9D9", "BEBEBE", "A6A6A6", "7E7E7E", "585858", "404040", "252525"]  # measured on the original


def set_box(el, x, y, w, h): O._set_xfrm(el, x * E, y * E, w * E, h * E)


def set_fill_role(el, role):
    sf = el.find("p:spPr/a:solidFill", NS)
    for c in list(sf): sf.remove(c)
    etree.SubElement(sf, A + "schemeClr", val=role)


def norm(t): return re.sub(r"\s+", " ", t).strip()
def same(p, text): return norm("".join(t.text or "" for t in p.iter(A + "t"))) == norm(text)


def one_run_text(el_or_p, text, rpr=None):
    """Replace the runs of a paragraph (or of the first paragraph of a shape) by one run that keeps the first run's format."""
    p = el_or_p if etree.QName(el_or_p).localname == "p" else el_or_p.find(".//a:p", NS)
    runs = p.findall("a:r", NS)
    if same(p, text): return None                                         # unchanged text keeps its stored runs (spacing included)
    rp = copy.deepcopy(rpr if rpr is not None else runs[0].find("a:rPr", NS))
    for r in runs: p.remove(r)
    r = etree.Element(A + "r"); r.append(rp); t = etree.SubElement(r, A + "t"); t.text = text
    end = p.find("a:endParaRPr", NS)
    (p.insert(list(p).index(end), r) if end is not None else p.append(r))
    return r


def main():
    obj = O.get(STORE, OID)
    tab = SPEC["table"]; n_rows = len(tab["rows"])
    if n_rows != 4: obj = O.table_size(obj, rows=n_rows + 1)          # objstore route for a row more / fewer
    f = O._frag(obj); els = list(f)
    heat, zgrp, tblf, top = els[13], els[41], els[21], els[47]
    cells = [c for c in heat if O._xfrm(c)][:-1]; red_circle = [c for c in heat if O._xfrm(c)][-1]
    zone_rect, circle7 = [c for c in zgrp if O._xfrm(c)]
    tpl_circle, tpl_num = copy.deepcopy(els[15]), copy.deepcopy(els[16].find(".//a:r/a:rPr", NS))
    tpl_label = copy.deepcopy(els[44])
    tpl_tcircle, tpl_tnum = copy.deepcopy(els[22]), copy.deepcopy(els[23].find(".//a:r/a:rPr", NS))

    # 1. heat map: 5 x 5 cells shaded by (severity + likelihood), the original's 9 greys (the store keeps only 4 grey roles)
    x0, y0 = O._xfrm(heat)[0], O._xfrm(heat)[1]; step = 720090
    for c in cells:
        b = O._xfrm(c); col = round((b[0] - x0) / step); row = round((b[1] - y0) / step)
        sf = c.find("p:spPr/a:solidFill", NS)
        for k in list(sf): sf.remove(k)
        etree.SubElement(sf, A + "srgbClr", val=SHADES[col + (4 - row)])

    # 2. drop the PDF-split marker numbers and labels (rebuilt below as one shape each), the old table markers
    drop = [14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 32, 33, 34, 35, 36, 37, 38, 39, 40, 43, 44, 45, 46, 48, 49, 50, 51, 52]
    for i in drop: f.remove(els[i])
    heat.remove(red_circle); zgrp.remove(circle7)
    O._ungroup_into(f, zgrp)                                              # dashed zone becomes its own shape
    f.remove(top); f.append(top)                                          # "Top priority" above the zone

    # 3. panel heads, second head rule (the original has one under each head; the store kept the left one only)
    for el, t, right in zip((els[9], els[12]), SPEC["panels"], (4.82, 12.69)):     # head box runs to the end of its rule
        one_run_text(el, t); bp = el.find("p:txBody/a:bodyPr", NS)
        for k in list(bp): bp.remove(k)
        b = O._xfrm(el); O._set_xfrm(el, b[0], b[1], right * E - b[0], b[3])
    rule2 = copy.deepcopy(els[8]); b = O._xfrm(els[8])
    O._set_xfrm(rule2, 5.82 * E, b[1], 6.87 * E, b[3]); f.insert(list(f).index(els[8]) + 1, rule2)

    # 4. priority zone and its label
    zx, zy, zw, zh = SPEC["zone"]["box"]; set_box(zone_rect, zx, zy, zw, zh)
    tb = O._xfrm(top); O._set_xfrm(top, (zx + 0.0796) * E, (zy - 0.0527) * E, tb[2], tb[3])
    one_run_text(top, SPEC["zone"]["label"])

    # 5. risk markers: the stored circle, number inside it (one shape, so it moves with it), name beside it
    d = 0.3618
    for r in SPEC["risks"]:
        c = copy.deepcopy(tpl_circle); cx, cy = r["c"]; set_box(c, cx - d / 2, cy - d / 2, d, d)
        set_fill_role(c, ROLE[r["col"]])
        bp = c.find("p:txBody/a:bodyPr", NS)
        for k, v in dict(wrap="none", lIns="0", tIns="0", rIns="0", bIns="0", anchor="ctr").items(): bp.set(k, v)
        p = c.find("p:txBody/a:p", NS); etree.SubElement(p, A + "pPr", algn="ctr")
        rp = copy.deepcopy(tpl_num); rp.attrib.pop("spc", None)
        one_run_text(p, str(r["id"]), rp)
        f.append(c)
    for r in SPEC["risks"]:
        if not r.get("label"): continue
        lb = copy.deepcopy(tpl_label); body = lb.find("p:txBody", NS)
        for af in body.find("a:bodyPr", NS): body.find("a:bodyPr", NS).remove(af)
        body.find("a:bodyPr", NS).set("wrap", "none")
        ptpl = body.find("a:p", NS)
        for p in body.findall("a:p", NS): body.remove(p)
        for k, line in enumerate(r["label"]):
            p = copy.deepcopy(ptpl); sb = p.find("a:pPr/a:spcBef", NS)
            if sb is not None and k: sb.getparent().remove(sb)
            one_run_text(p, line); body.append(p)
        w = max(len(t) for t in r["label"]) * 0.098 + 0.12
        set_box(lb, r["at"][0], r["at"][1], w, 0.2025 * len(r["label"]) + 0.03)
        f.append(lb)

    # 6. table: header, rows refilled paragraph by paragraph in the stored formats
    tbl = tblf.find(".//a:tbl", NS); trs = tbl.findall("a:tr", NS)
    for tc, t in zip(trs[0].findall("a:tc", NS), tab["header"]): one_run_text(tc.find(".//a:p", NS), t)
    ref_rows = [copy.deepcopy(tr) for tr in trs]                          # formats of the stored rows
    for i, (tr, row) in enumerate(zip(trs[1:], tab["rows"]), start=1):
        src = ref_rows[min(i, 4)]
        rc, sc = tr.findall("a:tc", NS)
        if tab["normalise"]:                                              # changed content: every row in stored row 1 / row 2 formats, alternately
            src = ref_rows[1 + (i - 1) % 2]
            for k, tc in enumerate((rc, sc)):
                new = copy.deepcopy(src.findall("a:tc", NS)[k]); tr.replace(tc, new)
            rc, sc = tr.findall("a:tc", NS)
            for tc in (rc, sc):                                           # banding: odd rows white, even rows grey; one top rule only
                pr = tc.find("a:tcPr", NS)
                for k in list(pr):
                    if etree.QName(k).localname in ("solidFill", "noFill", "lnT"): pr.remove(k)
                if i % 2 == 0: etree.SubElement(pr, A + "solidFill").append(etree.Element(A + "schemeClr", val="bg2"))
                if i == 1:
                    ln = etree.Element(A + "lnT", w="12700"); sf = etree.SubElement(ln, A + "solidFill")
                    etree.SubElement(sf, A + "schemeClr", val="tx1"); etree.SubElement(ln, A + "prstDash", val="solid"); pr.insert(0, ln)
                pr.set("marT", str(int(tab.get("marT", 0.05) * E)))
        ps = rc.findall(".//a:p", NS)
        one_run_text(ps[0], row["risk"]); one_run_text(ps[1], row["bullet"])
        sps = [p for p in sc.findall(".//a:p", NS)]
        filled = [p for p in sps if p.find("a:r", NS) is not None]
        if tab["normalise"]:
            for p in sps:
                if p.find("a:r", NS) is None: p.getparent().remove(p)
        body = filled[0].getparent()
        while len(filled) < len(row["sol"]):
            nb = copy.deepcopy(filled[-1]); body.insert(list(body).index(filled[-1]) + 1, nb); filled.append(nb)
        for p in filled[len(row["sol"]):]: body.remove(p)
        for p, (tag, text) in zip(filled, row["sol"]):
            if same(p, tag + " " + text): continue
            runs = p.findall("a:r", NS); rtag = copy.deepcopy(runs[0].find("a:rPr", NS))
            rtxt = copy.deepcopy(next(r.find("a:rPr", NS) for r in runs if r.find("a:rPr", NS).get("b") != "1"))
            one_run_text(p, tag + " ", rtag)
            r2 = etree.Element(A + "r"); r2.append(rtxt); etree.SubElement(r2, A + "t").text = text
            p.insert(list(p).index(p.findall("a:r", NS)[-1]) + 1, r2)
            if tab["normalise"]:
                pp = p.find("a:pPr", NS); pp.set("algn", "l"); pp.attrib.pop("marR", None)
        if tab["normalise"]:
            for p in rc.findall(".//a:p", NS):
                pp = p.find("a:pPr", NS)
                if pp is not None: pp.set("marR", "45720")
    if "row_h" in tab:
        for tr, h in zip(trs[1:], tab["row_h"]): tr.set("h", str(int(h * E)))
        tblf.find("p:xfrm/a:ext", NS).set("cy", str(sum(int(tr.get("h")) for tr in trs)))
    # table markers: stored circle with its number inside, level with each row's risk name
    tops, gy = [], O._xfrm(tblf)[1] + int(trs[0].get("h"))
    for tr in trs[1:]: tops.append(gy / E); gy += int(tr.get("h"))
    for i, row in enumerate(tab["rows"]):
        x, y = tab["circles"][i] if tab.get("circles") else (5.52, tops[i] + tab.get("circle_dy", 0.02))
        c = copy.deepcopy(tpl_tcircle); set_box(c, x, y, d, d); set_fill_role(c, ROLE[row["col"]])
        bp = c.find("p:txBody/a:bodyPr", NS)
        for k, v in dict(wrap="none", lIns="0", tIns="0", rIns="0", bIns="0", anchor="ctr").items(): bp.set(k, v)
        p = c.find("p:txBody/a:p", NS); etree.SubElement(p, A + "pPr", algn="ctr")
        rp = copy.deepcopy(tpl_tnum); rp.attrib.pop("spc", None); one_run_text(p, str(i + 1), rp)
        f.append(c)

    obj = O._store(obj, f)
    X, Y, W, H = [v / E for v in obj["bbox"]]
    out = os.path.join(HERE, "candidate.pptx")
    res = O.place(out, 1, obj, (X, Y, W, H), STORE, scale_text=False, colours="original")
    print("placed", OID, res)

    # page number: the deck's page (12 in A) as plain text, as the original shows it
    z = zipfile.ZipFile(out); files = {n: z.read(n) for n in z.namelist()}; z.close()
    s = files["ppt/slides/slide1.xml"].decode()
    s = re.sub(r'<a:fld [^>]*type="slidenum"[^>]*>(<a:rPr[^>]*/>)<a:t>\d+</a:t></a:fld>', lambda m: "<a:r>" + m.group(1) + "<a:t>" + str(SPEC["page"]) + "</a:t></a:r>", s)
    # source line in italics, as the deck sets it
    s = re.sub(r'(<a:rPr [^>]*?)(/?>(?:(?!</a:r>).)*?<a:t>Source:)', lambda m: (m.group(1) if ' i="' in m.group(1) else m.group(1) + ' i="1"') + m.group(2), s, flags=re.S)
    files["ppt/slides/slide1.xml"] = s.encode()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zo:
        for n, data in files.items(): zo.writestr(n, data)


if __name__ == "__main__":
    main()
