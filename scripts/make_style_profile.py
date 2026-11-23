"""make_style_profile.py <reference.pptx> [Style/refs/<deck>.profile.json] [--slides 3-20]

Measures a reference deck and writes a STYLE PROFILE that the generators apply (house.js useStyle):
slide size, title (position, size, bold, colour, font, band behind it, rule under it, second line),
breadcrumb/tracker line, fonts, body/label sizes, colour roles ranked by use, source line, page number,
margins, chart style (axes, gridlines, label size) and table style (header fill, row lines vs bands).

Values are medians over the deck's content slides. Look at rendered slides before trusting a value;
edit the JSON by hand where the eye disagrees, and record that in the style card.
"""
import sys, os, json, re, math, statistics as st, collections
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "bench", "scripts"))   # shared .pptx measuring (bench_score.py)
from bench_score import Ctx, walk, run_props, EMU, SRC, de, rgb2lab, hex2rgb, inherited_anchor, insets, count_lines
from pptx import Presentation
from pptx.oxml.ns import qn
from pptx.util import Emu

def chroma(h):
    L, a, b = rgb2lab(hex2rgb(h)); return math.hypot(a, b), L

def fill_hex(ctx, sh):
    sp = sh._element.find(qn("p:spPr"))
    if sp is None: return None
    sf = sp.find(qn("a:solidFill"))
    if sf is not None: return ctx.colour(sf)
    if sp.find(qn("a:noFill")) is not None: return None
    # style-based fill (fillRef) -> scheme colour
    style = sh._element.find(qn("p:style"))
    if style is not None:
        fr = style.find(qn("a:fillRef"))
        if fr is not None and len(fr) and fr.get("idx") not in ("0", None): return ctx.colour(fr)
    return None

def line_hex(ctx, sh):
    sp = sh._element.find(qn("p:spPr"))
    ln = sp.find(qn("a:ln")) if sp is not None else None
    if ln is None or ln.find(qn("a:noFill")) is not None: return None
    sf = ln.find(qn("a:solidFill"))
    return ctx.colour(sf) if sf is not None else None

def mode(xs, default=None):
    xs = [x for x in xs if x is not None]
    return collections.Counter(xs).most_common(1)[0][0] if xs else default

def pct(xs, q, default=None, nd=2):
    xs = sorted(x for x in xs if x is not None)
    return round(xs[min(len(xs) - 1, int(q * len(xs)))], nd) if xs else default

def med(xs, default=None, nd=2):
    xs = [x for x in xs if x is not None]
    return round(st.median(xs), nd) if xs else default

def profile(path, slides=None):
    prs = Presentation(path); W, H = prs.slide_width / EMU, prs.slide_height / EMU
    n = len(prs.slides); idx = slides or list(range(2, min(n, 40) + 1))
    T = collections.defaultdict(list); fills = collections.Counter(); textc = collections.Counter(); lines = collections.Counter()
    for i in idx:
        s = prs.slides[i - 1]; ctx = Ctx(prs, s)
        items = list(walk(s.shapes))
        texts = []
        for sh, (x, y, w, h) in items:
            f = fill_hex(ctx, sh)
            if f and not (w > 0.95 * W and h > 0.95 * H): fills[f.upper()] += w * h
            lc = line_hex(ctx, sh)
            if lc: lines[lc.upper()] += max(w, h)
            if getattr(sh, "has_text_frame", False) and sh.has_text_frame:
                runs = [(r.text,) + run_props(ctx, sh, p, r) for p in sh.text_frame.paragraphs for r in p.runs if r.text.strip()]
                if runs:
                    paras = [p for p in sh.text_frame.paragraphs if p.text.strip()]
                    texts.append(dict(sh=sh, x=x, y=y, w=w, h=h, runs=runs, text="".join(r[0] for r in runs), paras=paras, size=max(r[1] for r in runs)))
                    for r in runs: textc[r[5].upper()] += len(r[0])
        # title: biggest text in the top quarter (not a breadcrumb)
        top = [t for t in texts if t["y"] < 0.25 * H and len(t["text"]) >= 3 and not re.search(r"►|▶|→|»", t["text"]) and not SRC.match(t["text"])]
        if not top: continue
        t = max(top, key=lambda t: (round(t["size"]), -t["y"]))
        if len(t["text"]) < 8 and i != idx[0] and t["size"] >= 28 and False: continue
        r0 = [r for r in t["runs"] if r[1] == t["size"]][0]
        T["title_x"].append(t["x"]); T["title_y"].append(t["y"]); T["title_w"].append(t["w"]); T["title_h"].append(t["h"]); T["title_r"].append(min(W, t["x"] + t["w"]))
        T["title_pt"].append(r0[1]); T["title_bold"].append(r0[2]); T["title_font"].append(r0[3]); T["title_col"].append(r0[5].upper())
        bp = t["sh"].text_frame._txBody.find(qn("a:bodyPr"))
        T["title_anchor"].append(inherited_anchor(ctx, t["sh"]))
        il, it_, ir, ib = insets(t["sh"]); T["ins_l"].append(il); T["ins_t"].append(it_); T["ins_b"].append(ib)
        paras = []
        for p_ in t["paras"]:
            rr = [r for r in p_.runs if r.text.strip()]
            if rr: rp = run_props(ctx, t["sh"], p_, rr[0]); paras.append(("".join(r.text for r in p_.runs), rp[2], rp[1], max(run_props(ctx, t["sh"], p_, r)[0] for r in rr)))
        nl, hs = count_lines(paras, max(0.1, t["w"] - il - ir)); th = sum(hs); an = T["title_anchor"][-1]
        top = t["y"] + t["h"] - ib - th if an == "b" else (t["y"] + (t["h"] - th) / 2 if an == "ctr" else t["y"] + it_)
        T["text_top"].append(top); T["text_bot"].append(top + th); T["nlines"].append(nl)
        T["title_lines"].append(len(t["paras"]))
        # second line in a different colour (title + subtitle in one box, Deloitte)
        cols_in_title = [r[5].upper() for r in t["runs"]]
        if len(set(cols_in_title)) > 1 and cols_in_title[-1] != r0[5].upper():
            last = t["runs"][-1]; T["sub_col"].append(last[5].upper()); T["sub_pt"].append(last[1])
        elif len(t["paras"]) >= 2:
            p2 = t["paras"][1]; rr = [r for r in p2.runs if r.text.strip()]
            if rr:
                rp = run_props(ctx, t["sh"], p2, rr[0])
                if rp[4].upper() != r0[5].upper() and abs(rp[0] - r0[1]) <= 6: T["sub_col"].append(rp[4].upper()); T["sub_pt"].append(rp[0])
        # band behind the title: a filled rect containing the title's centre and wider than 70% of the slide
        cx, cy = t["x"] + t["w"] / 2, t["y"] + t["h"] / 2
        band = None
        for sh, (x, y, w, h) in items:
            if sh is t["sh"]: continue
            f = fill_hex(ctx, sh)
            if f and w > 0.7 * W and x <= cx <= x + w and y <= cy <= y + h and h < 0.4 * H: band = (f.upper(), x, y, w, h)
        T["band"].append(band)
        for sh, (x, y, w, h) in items:
            f = fill_hex(ctx, sh)
            if sh is not t["sh"] and f and w * h > 0.4 * W * H and x <= cx <= x + w and y <= cy <= y + h and chroma(f)[1] < 45:
                body_runs = [r for b in texts if b is not t and b["y"] > t["y"] + t["h"] - 0.05 for r in b["runs"]]
                T["variant"].append(dict(slide=i, fill=f.upper(), x=round(x, 2), y=round(y, 2), w=round(w, 2), h=round(h, 2),
                    title=dict(colour=r0[5].upper(), bold=r0[2], pt=r0[1], x=round(t["x"], 2), y=round(t["y"], 2), w=round(t["w"], 2)),
                    body=dict(colour=mode([r[5].upper() for r in body_runs]), pt=med([r[1] for r in body_runs]), italic=None)))
                break
        # rule under the title: a line / thin rect within 0.5 in below the title, wider than 60%
        rule = None
        for sh, (x, y, w, h) in items:
            if w > 0.6 * W and h < 0.06 and t["y"] + t["h"] - 0.3 < y < t["y"] + t["h"] + 0.6:
                c = line_hex(ctx, sh) or fill_hex(ctx, sh)
                if c: rule = (c.upper(), x, y, w)
        T["rule"].append(rule)
        # breadcrumb: small text above / beside the title containing an arrow
        for b in texts:
            if b["y"] < t["y"] + 0.05 and b is not t and re.search(r"►|▶|→|»|\t", b["text"]) and b["size"] < t["size"]:
                cols = [r[5].upper() for r in b["runs"]]
                T["crumb"].append((b["x"], b["y"], b["size"], b["runs"][0][2], b["runs"][0][3], collections.Counter(cols).most_common()))
        # panel sub-headline: a small chip with a number/letter, a headline to its right, often a rule underneath
        for sh, (x, y, w, h) in items:
            if not (0.12 < w < 0.5 and 0.12 < h < 0.5) or not getattr(sh, "has_text_frame", False) or not sh.has_text_frame: continue
            ct = sh.text_frame.text.strip()
            if not re.fullmatch(r"[0-9A-Za-z]{1,2}|[0-9][.][0-9]", ct): continue
            heads = [b for b in texts if b["sh"] is not sh and abs((b["y"] + b["h"] / 2) - (y + h / 2)) < 0.2 and 0 < b["x"] - x < 0.9 and len(b["text"]) > 8
                     and b["size"] < t["size"] - 2 and b is not t]
            if not heads: continue
            hd = min(heads, key=lambda b: b["x"] - x)
            geom = sh._element.find(".//" + qn("a:prstGeom"))
            cr = [r for p_ in sh.text_frame.paragraphs for r in p_.runs if r.text.strip()]
            cprops = run_props(ctx, sh, sh.text_frame.paragraphs[0], cr[0]) if cr else None
            r1 = hd["runs"][0]
            rule = None
            for sh2, (x2, y2, w2, h2) in items:
                if h2 < 0.04 and w2 > 1.5 and hd["y"] + hd["h"] - 0.15 < y2 < hd["y"] + hd["h"] + 0.35 and abs(x2 - x) < 0.6:
                    rc = line_hex(ctx, sh2) or fill_hex(ctx, sh2)
                    if rc:
                        ln = sh2._element.find(qn("p:spPr") + "/" + qn("a:ln")); wd = int(ln.get("w")) / 12700 if ln is not None and ln.get("w") else 1
                        rule = (rc.upper(), round(wd, 2), round(y2 - y, 2))
            cf = fill_hex(ctx, sh)
            if not cf:   # number in its own text box over a filled shape (circle/square): take that shape
                cx2, cy2 = x + w / 2, y + h / 2
                under = [(sh2, b2) for sh2, b2 in items if sh2 is not sh and fill_hex(ctx, sh2) and b2[0] <= cx2 <= b2[0] + b2[2] and b2[1] <= cy2 <= b2[1] + b2[3] and b2[2] < 0.6 and b2[3] < 0.6]
                if under:
                    sh2, b2 = under[0]; cf = fill_hex(ctx, sh2); geom = sh2._element.find(".//" + qn("a:prstGeom"))
                    if geom is None and abs(b2[2] - b2[3]) < 0.04: geom = {"prst": "ellipse"}   # drawn circle (custom geometry)
                    w = h = max(b2[2], b2[3])
            T["panel"].append(dict(chip=geom.get("prst") if geom is not None else "rect", fill=(cf or "").upper() or None,
                text=cprops[4].upper() if cprops else "FFFFFF", size=round((w + h) / 2, 2), chip_pt=cprops[0] if cprops else 11,
                pt=r1[1], bold=r1[2], colour=r1[5].upper(), italic=None, rule=rule))
        # source line and page number
        for b in texts:
            if SRC.match(b["text"]) and b["y"] > 0.75 * H:
                T["src_x"].append(b["x"]); T["src_y"].append(b["y"]); T["src_pt"].append(min(r[1] for r in b["runs"])); T["src_col"].append(b["runs"][0][5].upper())
            if b["y"] > 0.9 * H and b["x"] < 0.5 * W and not SRC.match(b["text"]) and b["size"] <= 10:
                T["foot_x"].append(b["x"]); T["foot_y"].append(b["y"]); T["foot_pt"].append(b["size"]); T["foot_col"].append(b["runs"][0][5].upper()); T["foot_text"].append(b["text"][:120])
        # page number: a slide-number field (or a bare number) low on the right
        for sh, (x, y, w, h) in items:
            if not (getattr(sh, "has_text_frame", False) and sh.has_text_frame) or y < 0.85 * H or x < 0.6 * W: continue
            fld = sh._element.find(".//" + qn("a:fld"))
            txt_ = sh.text_frame.text.strip()
            if (fld is not None and "slidenum" in (fld.get("type") or "")) or re.fullmatch(r"\d{1,3}", txt_):
                rp = (fld.find(qn("a:rPr")) if fld is not None else None)
                pt = int(rp.get("sz")) / 100 if rp is not None and rp.get("sz") else None
                if pt is None and sh.text_frame.paragraphs[0].runs: pt = run_props(ctx, sh, sh.text_frame.paragraphs[0], sh.text_frame.paragraphs[0].runs[0])[0]
                col = None
                if rp is not None and rp.find(qn("a:solidFill")) is not None: col = ctx.colour(rp.find(qn("a:solidFill")))
                bp2 = sh.text_frame._txBody.find(qn("a:bodyPr"))
                T["pg_x"].append(x + w); T["pg_y"].append(y); T["pg_pt"].append(pt); T["pg_col"].append(col.upper() if col else None); T["pg_h"].append(h)
        # body text
        t_bot = t["y"] + t["h"]
        body = [b for b in texts if b is not t and b["y"] > t_bot - 0.05 and not SRC.match(b["text"]) and b["y"] < 0.93 * H]
        for b in body:
            for r in b["runs"]: T["body_pt"] += [r[1]] * max(1, len(r[0]) // 10); T["body_font"].append(r[3])
        bb = [(x, y, w, h) for sh, (x, y, w, h) in items if y > t_bot - 0.05 and y + h < 0.93 * H and w < 0.9 * W and w * h > 0.02]
        if bb: T["m_left"].append(min(b[0] for b in bb)); T["m_right"].append(W - max(b[0] + b[2] for b in bb)); T["body_top"].append(min(b[1] for b in bb))
        # charts and tables
        for sh, _ in items:
            if getattr(sh, "has_chart", False) and sh.has_chart:
                cx_ = sh.chart._chartSpace
                va = cx_.findall(".//" + qn("c:valAx"))
                T["chart_valax"].append(bool(va) and va[0].find(qn("c:delete")) is not None and va[0].find(qn("c:delete")).get("val") in ("0", "false") or (bool(va) and va[0].find(qn("c:delete")) is None))
                T["chart_grid"].append(bool(cx_.findall(".//" + qn("c:majorGridlines"))))
                szs = [int(e.get("sz")) / 100 for e in cx_.iter(qn("a:defRPr")) if e.get("sz")] + [int(e.get("sz")) / 100 for e in cx_.iter(qn("a:rPr")) if e.get("sz")]
                if szs: T["chart_pt"].append(st.median(szs))
            if getattr(sh, "has_table", False) and sh.has_table:
                tb = sh.table; c0 = tb.cell(0, min(1, len(tb.columns) - 1)); c1 = tb.cell(min(1, len(tb.rows) - 1), min(1, len(tb.columns) - 1))
                tcp = lambda c: c._tc.find(qn("a:tcPr"))
                def cfill(c):
                    p = tcp(c); f = p.find(qn("a:solidFill")) if p is not None else None
                    return ctx.colour(f).upper() if f is not None else None
                T["tbl_head"].append(cfill(c0)); T["tbl_body"].append(cfill(c1))
                def lnb(c, side="a:lnB"):
                    p = tcp(c); l = p.find(qn(side)) if p is not None else None
                    if l is None or l.find(qn("a:noFill")) is not None: return None
                    f = l.find(qn("a:solidFill")); return (ctx.colour(f).upper(), round(int(l.get("w", "12700")) / 12700, 2)) if f is not None else None
                T["tbl_head_rule"].append(lnb(c0)); T["tbl_body_rule"].append(lnb(c1))
                hr = [r for p in c0.text_frame.paragraphs for r in p.runs if r.text.strip()]
                if hr: T["tbl_head_bold"].append(run_props(ctx, sh, c0.text_frame.paragraphs[0], hr[0])[1])
                rr = [r for p in c0.text_frame.paragraphs for r in p.runs if r.text.strip()]
                if rr: T["tbl_head_text"].append(run_props(ctx, sh, c0.text_frame.paragraphs[0], rr[0])[4].upper())
                rr = [r for p in c1.text_frame.paragraphs for r in p.runs if r.text.strip()]
                if rr: T["tbl_pt"].append(run_props(ctx, sh, c1.text_frame.paragraphs[0], rr[0])[0])
    # ---- colour roles: area-ranked fills, split into colours and neutrals
    ranked = [(c, a) for c, a in fills.most_common() if c not in ("FFFFFF",)]
    colours, neutrals = [], []
    for c, a in ranked:
        ch, L = chroma(c)
        if ch > 18: colours.append((c, a, L))
        elif 15 < L < 96: neutrals.append((c, a, L))
    def dedupe(lst, tol=12):
        out = []
        for c, a, L in lst:
            if all(de(c, o[0]) > tol for o in out): out.append((c, a, L))
        return out
    colours, neutrals = dedupe(colours, 20), dedupe(neutrals, 8)
    title_col = mode(T["title_col"], "000000")
    textcol = mode([c for c, _ in textc.most_common(3) if c != "FFFFFF"] or ["000000"])
    main = colours[0][0] if colours else "333333"
    secondary = colours[1][0] if len(colours) > 1 else main
    # accent: the most saturated colour that is not main (the highlight), else main
    cand = [c for c, a, L in colours[1:4] if a >= 0.15 * colours[0][1]]
    accent = max(cand, key=lambda c: chroma(c)[0]) if cand else main
    panel = max([x for x in neutrals[:6] if x[2] > 88], key=lambda x: x[1], default=None)
    ng = sorted([x for x in neutrals[:6] if x is not panel], key=lambda x: x[2])[:4]  # dark -> light
    greys = [c for c, a, L in ng]
    while len(greys) < 4: greys.append(["575757", "8C8C8C", "B4B4B4", "DCDCDC"][len(greys)])
    band = mode(T["band"]); rule = mode(T["rule"])
    prof = dict(
        source=os.path.basename(path), size=[round(W, 3), round(H, 3)],
        fonts=dict(latin=mode(T["title_font"], "Arial"), body=mode(T["body_font"], mode(T["title_font"], "Arial")), ea=None),
        title=dict(text_top=med(T["text_top"]), text_bottom=med(T["text_bot"]),
                   align_to="bottom" if (st.pstdev(T["text_bot"]) if len(T["text_bot"]) > 1 else 0) < (st.pstdev(T["text_top"]) if len(T["text_top"]) > 1 else 0) - 0.02 else "top",
                   x=round(med(T["title_x"]) + med(T["ins_l"], 0), 3), y=med(T["title_y"]), w=round(pct(T["title_r"], 0.9) - med(T["title_x"]), 3), h=med(T["title_h"]), ins_t=med(T["ins_t"], 0), ins_b=med(T["ins_b"], 0), pt=med(T["title_pt"], 24, 1), lines=mode(T["title_lines"], 1),
                   bold=mode(T["title_bold"], False), colour=title_col, anchor=mode(T["title_anchor"], "b"),
                   sub=dict(colour=mode(T["sub_col"]), pt=med(T["sub_pt"], None, 1)) if T["sub_col"] else None,
                   band=dict(colour=band[0], x=round(band[1], 2), y=round(band[2], 2), w=round(band[3], 2), h=round(band[4], 2)) if band else None,
                   rule=dict(colour=rule[0], x=round(rule[1], 2), y=round(rule[2], 2), w=round(rule[3], 2)) if rule else None),
        crumb=None,
        body=dict(pt=med(T["body_pt"], 14, 1), label_pt=round(sorted(T["body_pt"])[len(T["body_pt"]) // 5], 1) if T["body_pt"] else 11, text=textcol),
        margins=dict(left=med(T["m_left"], 0.4), right=pct(T["m_right"], 0.25, 0.4), body_top=med(T["body_top"], 1.6)),
        source_line=dict(x=med(T["src_x"]), y=med(T["src_y"]), pt=med(T["src_pt"], 9, 1), colour=mode(T["src_col"])) if T["src_y"] else None,
        page=dict(right=med(T["pg_x"]), y=med(T["pg_y"]), h=med(T["pg_h"]), pt=med(T["pg_pt"], 9, 1), colour=mode(T["pg_col"]) or mode(T["src_col"]) or "808080") if T["pg_y"] else None,
        footer=dict(x=med(T["foot_x"]), y=med(T["foot_y"]), pt=med(T["foot_pt"], 8, 1), colour=mode(T["foot_col"]), text=mode(T["foot_text"])) if len(T["foot_y"]) >= max(2, len(idx) // 3) else None,
        roles=dict(main=main, secondary=secondary, accent=accent, text=textcol, grey1=greys[0], grey2=greys[1], grey3=greys[2], grey4=greys[3],
                   panel=panel[0] if panel else "F2F2F2",
                   tint=max([c for c, a, L in colours if L > 80] or [panel[0] if panel else "F2F2F2"], key=lambda c: chroma(c)[1])),
        colours_ranked=[c for c, a, L in colours[:6]], neutrals_ranked=[c for c, a, L in neutrals[:6]],
        chart=dict(value_axis=mode(T["chart_valax"], False), gridlines=mode(T["chart_grid"], False), pt=med(T["chart_pt"], None, 1)),
        table=dict(header_fill=mode(T["tbl_head"]), header_text=mode(T["tbl_head_text"]), body_fill=mode(T["tbl_body"]), pt=med(T["tbl_pt"], None, 1),
                   header_rule=mode(T["tbl_head_rule"]), row_rule=mode(T["tbl_body_rule"]), header_bold=mode(T["tbl_head_bold"], True),
                   style="lines" if (mode(T["tbl_head_rule"]) or mode(T["tbl_body_rule"])) and not mode(T["tbl_body"]) else "bands"),
        panel=(lambda P: dict(chip=mode([q["chip"] for q in P]), fill=mode([q["fill"] for q in P]), text=mode([q["text"] for q in P]), size=med([q["size"] for q in P]),
                              chip_pt=med([q["chip_pt"] for q in P], 11, 1), pt=med([q["pt"] for q in P], 13, 1), bold=mode([q["bold"] for q in P], True),
                              colour=mode([q["colour"] for q in P]), rule=mode([q["rule"] for q in P]), n=len(P)))(T["panel"]) if len(T["panel"]) >= 3 else None,
        theme=sorted(set(Ctx(prs, prs.slides[0]).scheme.values())),
        variants={"dark_panel": T["variant"][0]} if T["variant"] else {},
    )
    if T["crumb"]:
        x, y, pt, bold, font, cols = T["crumb"][0]
        prof["crumb"] = dict(x=round(med([c[0] for c in T["crumb"]]), 2), y=round(med([c[1] for c in T["crumb"]]), 2), pt=med([c[2] for c in T["crumb"]]),
                             bold=bold, colours=[c for c, _ in cols])
    return prof

if __name__ == "__main__":
    a = sys.argv[1:]; sl = None
    if "--slides" in a:
        k = a.index("--slides"); lo, hi = map(int, a[k + 1].split("-")); sl = list(range(lo, hi + 1)); a = a[:k] + a[k + 2:]
    p = profile(a[0], sl)
    out = a[1] if len(a) > 1 else None
    s = json.dumps(p, indent=1, ensure_ascii=False)
    if out: open(out, "w").write(s)
    print(s)
