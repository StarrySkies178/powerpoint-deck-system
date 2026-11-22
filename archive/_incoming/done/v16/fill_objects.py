"""fill_objects.py <deck.pptx> <slots.json> <store_dir>
Drops store objects (template drawings, diagram parts, vectorised charts) into the boxes composeSlide() left for them."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import objstore as O
deck, slots, store = sys.argv[1:4]
for s in json.load(open(slots)):
    o = O.get(store, s["object"])
    if s.get("recolour"): o = O.recolour(o, s["recolour"])
    O.place(deck, s["slide"], o, tuple(s["box"]), store, out_path=deck, texts=s.get("texts"))
print("placed", len(json.load(open(slots))))
