# Build A (same content): run after build.js with A/ as working directory.
# Body = stored object case19-polaris-016 at 1:1, original colours, its stored bars kept where they are;
# the parts the store lost (the PDF-converted label table, two online bars, legend, rules) are redrawn or re-placed.
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(HERE))
import common as C

XS = [3.660, 4.681, 5.708, 6.729, 7.764, 8.694]
def spans(x):            # column line pieces (y1, y2, dashed) as the original draws them
    tail = [(5.82, 6.736, False)] if x < 6 else [(5.82, 6.11, False), (6.11, 6.736, True)]
    return [(1.80, 2.45, False), (2.45, 4.86, True), (4.86, 5.82, False)] + tail

SPEC = dict(
    grid=dict(xs=XS, top=1.80, bottom=6.736, spans=spans, block_rules=[4.86, 5.82], dotted=[3.337]),
    right_rules=[3.75, 5.542],
    circles=[dict(x=0.352, y=1.873, letter="a"), dict(x=0.352, y=4.943, letter="b"), dict(x=0.368, y=5.893, letter="c")],
    tags=[dict(x=0.363, y=3.705, text="Brand"), dict(x=0.370, y=4.373, text="Design")],
    rows=[
        dict(kind="section", x=0.755, y=2.003, text="Offline Strategy"),
        dict(kind="group", x=0.385, y=2.292, text="Store Expansion"),
        dict(kind="item", x=1.315, y=2.542, text="Open new concept stores"),
        dict(kind="item", x=1.315, y=2.861, text="Open theme stores"),
        dict(kind="item", x=1.315, y=3.198, text="Open digital stores"),
        dict(kind="group", x=0.40, y=3.458, text="Sales per Store Improvement"),
        dict(kind="item", x=1.343, y=3.667, text="Loyal customer AD"),
        dict(kind="item", x=1.315, y=4.030, text="Charity series"),
        dict(kind="item", x=1.315, y=4.333, text="Personalized offerings"),
        dict(kind="item", x=1.315, y=4.700, text="Design competence"),
        dict(kind="section", x=0.762, y=5.115, text="Online Strategy"),
        dict(kind="item", x=1.295, y=5.375, text="Enter new platforms"),
        dict(kind="item", x=1.295, y=5.708, text="Optimize operations"),
        dict(kind="section", x=0.770, y=6.031, text="Omni-channel Strategy"),
        dict(kind="item", x=1.281, y=6.281, text="Data synchronization"),
        dict(kind="item", x=1.281, y=6.615, text="Product mgt. & CRM"),
    ],
    bars=[{"el": i} for i in C.BARS] + [
        dict(kind="grey", box=(3.667, 5.271, 2.041, 0.208)),   # Enter new platforms (a table-cell fill in the store)
        dict(kind="grey", box=(3.667, 5.597, 2.041, 0.229)),   # Optimize operations
        dict(kind="red", box=(2.243, 6.840, 0.993, 0.208)),    # legend
        dict(kind="grey", box=(5.625, 6.854, 0.993, 0.208)),
    ],
    legend_text=[(3.335, 6.955, "Period for prioritized strategy"), (6.717, 6.975, "Period for implementation")],
)

if __name__ == "__main__":
    print(C.build(os.path.join(HERE, "candidate.pptx"), SPEC, page=16))
