"""C10 mimic, build B: the same stored object (case-truenorth-pola-008), refilled with new content and
re-laid out from four journey rows to five, text filled by objstore.set_texts. objstore.extend() refuses this object (NeedsGenerator, see
report.md), so the rows are re-counted here: the stored row shapes (grey panel + text box, left and middle
column) are cloned and re-spaced over the same height, each row sized to its text. Run after build.js."""
import copy, importlib.util, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("buildA", os.path.join(HERE, "../A/build.py"))
BA = importlib.util.module_from_spec(spec); spec.loader.exec_module(BA)       # fill(), name_of(), finish(), bbox_in()
O, NS = BA.O, BA.NS
DECK = os.path.join(HERE, "candidate.pptx")
E = O.EMU

TOP = {
    21: ["Premium tea market growing 12% a year", "Younger buyers switching from coffee", "Weak brand outside Singapore"],
    3: ["Win young urban buyers with modern formats", "Tell one brand story in every channel, from discovery to advocacy"],
    5: ["Market Risks", "Supply Risks"],
    7: ["Price Hold", "Dual Sourcing", "Stock Buffer"],
}
# five journey rows: (buyer phase, initiative), each a sub-heading + bullets
ROWS = [
    (["Discovery phase", "Low awareness of tea brands", "Find new drinks on short-video apps"],
     ["Brand awareness", "Launch Lumi Sparkling for buyers under 30", "Partner with 40 food creators on TikTok"]),
    (["Research phase", "Compare prices online before buying", "Trust peer reviews more than ads"],
     ["Content strategy", "Publish brewing guides and origin stories", "Seed 500 verified reviews in launch month"]),
    (["Purchase phase", "Buy mainly in convenience stores", "Expect delivery within one day", "Pay by e-wallet"],
     ["Channel expansion", "List in 1,200 convenience stores by 2027", "Open flagship kiosks in 3 malls", "Accept all major e-wallets online and in store"]),
    (["Usage phase", "Drink tea at work and on the go", "Want lower-sugar options"],
     ["Product range", "Add ready-to-drink cans in 4 flavours", "Cut sugar by 30% across the range"]),
    (["Advocacy phase", "Share purchases on social media", "Join brand clubs for rewards"],
     ["Community programme", "Start Lumi Club with tiered rewards", "Run monthly tastings in 6 cities"]),
]
RISK_MKT = ["Market Risks", "Local brands cut prices by 15-20%", "Coffee chains add tea to their menus"]
RISK_SUP = ["Supply Risks", "Leaf costs rose 9% in 2025", "Shipping delays from Yunnan farms"]
MIT_MKT = ["Hold price and compete on taste and quality", "Co-brand tea menus with 2 café chains"]
MIT_SUP = ["Fixed-price contracts with 3 estates for 2 years", "Keep 8 weeks of stock in the Singapore hub"]

SRC_ROWS = [(24, 25, 22, 23), (10, 11, 8, 9), (12, 13, 14, 15), (18, 19, 16, 17)]   # (left panel, left text, mid panel, mid text)


def lines_needed(paras, width_in):
    n = 0.0
    for k, p in enumerate(paras):
        if k == 0: n += 1.25; continue                     # the row's bold sub-heading
        n += math.ceil(len(p) * 0.068 / (width_in - 0.15))
    return n


def build_object():
    obj = O.get(BA.STORE, "case-truenorth-pola-008")
    f = O._frag(obj); els = list(f)
    texts = {BA.name_of(els[i]): t for i, t in TOP.items()}   # shape name -> paragraphs, filled by set_texts
    # rows: the four stored rows plus a clone of a 3-bullet row
    rows = [[els[i] for i in r] for r in SRC_ROWS]
    while len(rows) < len(ROWS):
        clone = [copy.deepcopy(e) for e in rows[1]]
        for e in clone:
            f.append(e); c = e.find("./*/p:cNvPr", NS); c.set("name", c.get("name") + " copy%d" % len(rows))
        rows.append(clone)
    for e_rows in rows[len(ROWS):]:
        for e in e_rows: f.remove(e)
    rows = rows[:len(ROWS)]
    y0 = O._xfrm(els[24])[1]; y1 = O._xfrm(els[18])[1] + O._xfrm(els[18])[3]; gap = 0.06 * E
    lp, mp = O._xfrm(els[24]), O._xfrm(els[22])           # column x / width
    need = [max(lines_needed(l, 2.98), lines_needed(m, 3.57)) * 0.2 + 0.12 for l, m in ROWS]
    spare = ((y1 - y0 - gap * (len(ROWS) - 1)) / E - sum(need)) / len(ROWS)
    if spare < 0: print("WARNING: rows over-full by %.2f in" % (-spare * len(ROWS)))
    y = y0
    for (l_txt, m_txt), (lpan, ltxt, mpan, mtxt), nd in zip(ROWS, rows, need):
        h = (nd + spare) * E
        O._set_xfrm(lpan, lp[0], y, lp[2], h); O._set_xfrm(mpan, mp[0], y, mp[2], h)
        O._set_xfrm(ltxt, lp[0] + 0.035 * E, y + 0.02 * E, 2.98 * E, h - 0.04 * E)
        O._set_xfrm(mtxt, mp[0] + 0.04 * E, y + 0.02 * E, 3.57 * E, h - 0.04 * E)
        texts[BA.name_of(ltxt)] = l_txt; texts[BA.name_of(mtxt)] = m_txt
        y += h + gap
    # risks and mitigation columns: same panels, text boxes widened, second group aligned
    for i, t in {27: RISK_MKT, 28: RISK_SUP, 30: MIT_MKT, 31: MIT_SUP}.items(): texts[BA.name_of(els[i])] = t
    for i, (yy, w) in {27: (2.96, 1.47), 28: (4.50, 1.47), 30: (2.95, 1.28), 31: (4.66, 1.28)}.items():
        b = O._xfrm(els[i]); O._set_xfrm(els[i], b[0], yy * E, w * E, b[3])
    b = O._xfrm(els[7]); O._set_xfrm(els[7], b[0], b[1], 1.25 * E, b[3])
    f.remove(els[1])                                       # stored title box: the frame draws the title
    return BA.fill(O._store(obj, f), texts)


if __name__ == "__main__":
    obj = build_object()
    r = O.place(DECK, 1, obj, BA.bbox_in(obj), BA.STORE, colours="original", scale_text=False)
    print("table object at", [round(v, 2) for v in r["box"]], r["warnings"])
    logo = O.element(O.get(BA.STORE, "case-truenorth-pola-004"), 0)
    O.place(DECK, 1, logo, BA.bbox_in(logo), BA.STORE, colours="original", scale_text=False)
    BA.finish(DECK)
