# Build B (changed content, same objects): run after build.js with B/ as working directory.
# Same stored body (case19-polaris-016): its circles, Brand/Design tags, text boxes and bars are re-used, refilled
# and re-laid from the data below. One Gantt row more than the original: Digital Strategy has 3 initiatives (was 2).
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(HERE))
import common as C

XS = [3.660, 4.681, 5.708, 6.729, 7.764, 8.694]          # year columns (same grid as the original)
YEARS = ["2024", "2025", "2026", "2027", "2028"]
# (section letter, section name, [ (group name or None, [ (initiative, first year, last year, bar kind, tag) ]) ])
PLAN = [
    ("a", "Retail Strategy", [
        ("Network Build-out", [("Open flagship stores", 0, 4, "red", None), ("Refit legacy stores", 1, 4, "grey", None),
                               ("Launch pop-up kiosks", 1, 1, "grey", None)]),
        ("Revenue per Store Growth", [("Membership tiers", 1, 4, "red", "Loyalty"), ("Seasonal capsules", 2, 3, "red2", "Loyalty"),
                                      ("Tailored bundles", 1, 4, "red2", "Product"), ("Craft workshops", 0, 2, "red", "Product")])]),
    ("b", "Digital Strategy", [
        (None, [("Join new marketplaces", 0, 1, "grey", None), ("Streamline fulfilment", 0, 2, "grey", None),
                ("Live-stream selling", 1, 2, "red2", None)])]),
    ("c", "Connected Retail", [
        (None, [("Unify inventory data", 2, 4, "grey", None), ("Clienteling & CRM", 2, 4, "grey", None)])]),
]
P_ITEM = 0.295                                         # item pitch (original 0.32-0.33; one row more has to fit)

def layout():
    """Rows top-down with the original's own spacings (section > group > items, dotted rule between groups,
    grey rule between blocks); only the item pitch is tighter."""
    rows, bars, circles, tags, rules, dotted = [], [], [], [], [], []
    y = 2.003                                        # first section line, as in the original
    for si, (letter, name, groups) in enumerate(PLAN):
        rows.append(dict(kind="section", x=0.755, y=y, text=name)); circles.append(dict(x=0.352, y=y - 0.13, letter=letter))
        for gi, (gname, items) in enumerate(groups):
            if gname:
                if gi: dotted.append(y + 0.14 - P_ITEM); y += 0.26 - P_ITEM
                else: y += 0.27
                rows.append(dict(kind="group", x=0.385 if gi == 0 else 0.40, y=y, text=gname))
                y += 0.24 if gi == 0 else 0.21
            else:
                y += 0.25
            tagged = {}
            for (txt, s_, e, kind, tag) in items:
                rows.append(dict(kind="item", x=1.315, y=y, text=txt))
                x0, x1 = XS[s_] + 0.025, XS[e + 1] - 0.005
                bars.append(dict(kind=kind, box=(x0, y - 0.085, x1 - x0, 0.208)))
                if tag: tagged.setdefault(tag, []).append(y)
                y += P_ITEM
            for tag, ys in tagged.items():
                tags.append(dict(x=0.365, y=sum(ys) / len(ys) - 0.337 / 2 + 0.01, text=tag))
        y -= P_ITEM
        if si < len(PLAN) - 1:
            rules.append(y + 0.15); y += 0.15 + 0.24
    return rows, bars, circles, tags, rules, dotted, y + 0.12

rows, bars, circles, tags, rules, dotted, bottom = layout()
r1, r2 = rules
def spans(x):            # solid column pieces (table borders, drawn natively)
    return [(1.80, 2.35), (r1, r2)] + ([(r2, bottom)] if x < 6 else [(r2, r2 + 0.28)])
# dashed column pieces (column k of the stored ones): copies of the stored dashed piece, re-laid with the rows
col_dashes = [(k, 2.35, r1) for k in range(4)] + [(k, r2 + 0.28, bottom) for k in (2, 3)]
bars += [dict(kind="red", box=(2.243, 6.840, 0.993, 0.208)), dict(kind="grey", box=(5.625, 6.854, 0.993, 0.208))]   # legend

M = "Response: "
SPEC = dict(client="AURORA",
    grid=dict(xs=XS, top=1.80, bottom=bottom, spans=spans, block_rules=rules),
    col_dashes=col_dashes, dotted=dotted, circles=circles, tags=tags, rows=rows, bars=bars,
    legend_text=[(3.335, 6.955, "Period of priority focus"), (6.717, 6.975, "Period of roll-out")],
    texts=[                                              # in slot order (objstore.slots): elements 1, 2, 8, 9, 12, 10, 13, 11, 14
        [["Roll-out Timeline\t", "Execution Risks"]],
        [["\t".join(YEARS)]],
        [["and Planned Responses"]],
        [["Uneven service quality across cities"], ["Store formats that do not travel well"], ["Mixed brand voice on marketplaces"]],
        [[M, "Certify all store staff; work with regional teams on local market studies; remove grey-market resellers"]],
        [["Price pressure from new online-first brands in affordable luxury"]],
        [[M, "Hold a clear edge in design, materials and positioning"]],
        [["Patchy data from partner platforms"], ["Costly IT work to unify stock data"]],
        [[M, "Agree data-sharing terms with partners and buy in analytics support"]],
    ],
)

if __name__ == "__main__":
    print("rows", len([r for r in rows if r["kind"] == "item"]), "bottom", round(bottom, 2))
    print(C.build(os.path.join(HERE, "candidate.pptx"), SPEC, page=12))
