"""C08 open-book mimic: place the stored slide object case19-mindcraft-015 and refill it from content.json.
Run after build.js, with this folder (A/ or B/) as working directory. Only objstore operations and edits of the
object's own shapes are used (no new drawing code): cells recoloured, markers and labels cloned from the stored
ones, table rows refilled (and added with objstore.table_size),
then objstore.place(..., texts=..., colours="original"). Every text is filled by objstore.set_texts (through
place(texts=...)), addressed by objstore.slots(); paragraph and run formats come from the stored boxes and cells."""
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


def uniq_name(el, tag):
    """Give a cloned shape its own name, so slots() can tell the clones apart."""
    el.find("p:nvSpPr/p:cNvPr", NS).set("name", "object " + tag)


def number_in_circle(c, num_box):
    """Fault 2 (PDF split): the stored number box's paragraph goes inside the circle, centred, without the PDF's offsets."""
    bp = c.find("p:txBody/a:bodyPr", NS)
    for k, v in dict(wrap="none", lIns="0", tIns="0", rIns="0", bIns="0", anchor="ctr").items(): bp.set(k, v)
    body = c.find("p:txBody", NS)
    for p in body.findall("a:p", NS): body.remove(p)
    p = copy.deepcopy(num_box.find("p:txBody/a:p", NS)); pp = p.find("a:pPr", NS)
    if pp is not None: p.remove(pp)
    p.insert(0, etree.Element(A + "pPr", algn="ctr")); body.append(p)


def main():
    obj = O.get(STORE, OID)
    tab = SPEC["table"]; n_rows = len(tab["rows"])
    if n_rows != 4: obj = O.table_size(obj, rows=n_rows + 1)          # objstore route for a row more / fewer
    f = O._frag(obj); els = list(f)
    heat, zgrp, tblf, top = els[13], els[41], els[21], els[47]
    cells = [c for c in heat if O._xfrm(c)][:-1]; red_circle = [c for c in heat if O._xfrm(c)][-1]
    zone_rect, circle7 = [c for c in zgrp if O._xfrm(c)]
    tpl_circle, tpl_num = copy.deepcopy(els[15]), copy.deepcopy(els[16])
    tpl_label = copy.deepcopy(els[44])
    tpl_tcircle, tpl_tnum = copy.deepcopy(els[22]), copy.deepcopy(els[23])
    texts = {}                                                            # slot hint -> text, handed to place(texts=...)

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
        texts[el.find("p:nvSpPr/p:cNvPr", NS).get("name")] = t
        bp = el.find("p:txBody/a:bodyPr", NS)
        for k in list(bp): bp.remove(k)
        b = O._xfrm(el); O._set_xfrm(el, b[0], b[1], right * E - b[0], b[3])
    rule2 = copy.deepcopy(els[8]); b = O._xfrm(els[8])
    O._set_xfrm(rule2, 5.82 * E, b[1], 6.87 * E, b[3]); f.insert(list(f).index(els[8]) + 1, rule2)

    # 4. priority zone and its label
    zx, zy, zw, zh = SPEC["zone"]["box"]; set_box(zone_rect, zx, zy, zw, zh)
    tb = O._xfrm(top); O._set_xfrm(top, (zx + 0.0796) * E, (zy - 0.0527) * E, tb[2], tb[3])
    texts[top.find("p:nvSpPr/p:cNvPr", NS).get("name")] = SPEC["zone"]["label"]

    # 5. risk markers: the stored circle, number inside it (one shape, so it moves with it), name beside it
    d = 0.3618
    for r in SPEC["risks"]:
        c = copy.deepcopy(tpl_circle); cx, cy = r["c"]; set_box(c, cx - d / 2, cy - d / 2, d, d)
        set_fill_role(c, ROLE[r["col"]]); number_in_circle(c, tpl_num)
        uniq_name(c, "m%d" % r["id"]); texts["object m%d" % r["id"]] = str(r["id"])
        f.append(c)
    for r in SPEC["risks"]:
        if not r.get("label"): continue
        lb = copy.deepcopy(tpl_label); bp = lb.find("p:txBody/a:bodyPr", NS)
        for af in list(bp): bp.remove(af)
        bp.set("wrap", "none")
        w = max(len(t) for t in r["label"]) * 0.098 + 0.12
        set_box(lb, r["at"][0], r["at"][1], w, 0.2025 * len(r["label"]) + 0.03)
        uniq_name(lb, "l%d" % r["id"]); texts["object l%d" % r["id"]] = list(r["label"])   # one paragraph per line
        f.append(lb)

    # 6. table: header and rows filled cell by cell by set_texts (slots "cell r,c"); B resets row formats first
    tbl = tblf.find(".//a:tbl", NS); trs = tbl.findall("a:tr", NS)
    for c, t in enumerate(tab["header"]): texts["cell 0,%d" % c] = t
    ref_rows = [copy.deepcopy(tr) for tr in trs]                          # formats of the stored rows
    for i, (tr, row) in enumerate(zip(trs[1:], tab["rows"]), start=1):
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
            for p in sc.findall(".//a:p", NS):                            # the PDF's per-paragraph right margins and justification
                pp = p.find("a:pPr", NS)
                if pp is not None: pp.set("algn", "l"); pp.attrib.pop("marR", None)
            for p in rc.findall(".//a:p", NS):
                pp = p.find("a:pPr", NS)
                if pp is not None: pp.set("marR", "45720")
        texts["cell %d,0" % i] = [row["risk"], row["bullet"]]
        texts["cell %d,1" % i] = [[tag + " ", text] for tag, text in row["sol"]]   # runs: bold tag, plain text
    if "row_h" in tab:
        for tr, h in zip(trs[1:], tab["row_h"]): tr.set("h", str(int(h * E)))
        tblf.find("p:xfrm/a:ext", NS).set("cy", str(sum(int(tr.get("h")) for tr in trs)))
    # table markers: stored circle with its number inside, level with each row's risk name
    tops, gy = [], O._xfrm(tblf)[1] + int(trs[0].get("h"))
    for tr in trs[1:]: tops.append(gy / E); gy += int(tr.get("h"))
    for i, row in enumerate(tab["rows"]):
        x, y = tab["circles"][i] if tab.get("circles") else (5.52, tops[i] + tab.get("circle_dy", 0.02))
        c = copy.deepcopy(tpl_tcircle); set_box(c, x, y, d, d); set_fill_role(c, ROLE[row["col"]])
        number_in_circle(c, tpl_tnum); uniq_name(c, "t%d" % (i + 1)); texts["object t%d" % (i + 1)] = str(i + 1)
        f.append(c)

    obj = O._store(obj, f)
    slots = O.slots(obj)                                                  # [(index, hint)]: hint is the shape name or "cell r,c"
    hint = {h.strip(): i for i, h in slots}
    fill = [None] * len(slots)
    for k, t in texts.items():
        key = k[len("object "):] if k.startswith("object ") else k
        fill[hint[key]] = t
    X, Y, W, H = [v / E for v in obj["bbox"]]
    out = os.path.join(HERE, "candidate.pptx")
    res = O.place(out, 1, obj, (X, Y, W, H), STORE, colours="original", texts=fill)
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
