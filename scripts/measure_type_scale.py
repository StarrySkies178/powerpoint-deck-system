"""Measure the formatting system of story decks: title, sub-headlines, body, sources, panels, emphasis."""
import sys, re, statistics as st, collections, json
from pptx import Presentation
from pptx.util import Emu
EMU=914400
def runs(sh):
    out=[]
    if not sh.has_text_frame: return out
    for p in sh.text_frame.paragraphs:
        for r in p.runs:
            if r.text.strip(): out.append((r.text, r.font.size.pt if r.font.size else None, r.font.bold, r.font.name))
    return out
def walk(shapes):
    for sh in shapes:
        try: st = sh.shape_type
        except NotImplementedError: st = None
        if st==6:  # group
            yield from walk(sh.shapes)
        else: yield sh
def measure(path):
    p=Presentation(path); W=p.slide_width; H=p.slide_height; K=7.5*EMU/H  # normalise pt to a 7.5in-tall slide
    R=collections.defaultdict(list); fonts=collections.Counter(); colors=collections.Counter()
    for s in p.slides:
        shapes=list(walk(s.shapes))
        txt=[(sh,runs(sh)) for sh in shapes if getattr(sh,'has_text_frame',False) and runs(sh) and sh.top is not None]
        if not txt: continue
        # title: largest font in top 22% (or title placeholder)
        top=[(sh,r) for sh,r in txt if sh.top < 0.25*H and len("".join(x[0] for x in r).strip())>=25 and not re.search(r'►|→|⇨|➔|\|', "".join(x[0] for x in r))]
        cand=[(max((x[1] or 0) for x in r), sh, r) for sh,r in top]
        cand=[c for c in cand if c[0]>0]
        if cand:
            sz,sh,r=max(cand,key=lambda c:(c[0], -c[1].top))
            t="".join(x[0] for x in r); R['title_pt'].append(round(sz*K*2)/2); R['title_chars'].append(len(t)); R['title_words'].append(len(t.split()))
            R['title_left_in'].append(round(sh.left/EMU,2)); R['title_top_in'].append(round(sh.top/EMU,2))
        # chips: small shapes with a single number/letter
        chips=[sh for sh,r in txt if len("".join(x[0] for x in r).strip())<=2 and sh.width<0.45*EMU and sh.height<0.45*EMU]
        R['chips_per_slide'].append(len(chips))
        # subheads: bold text right of a chip on same line
        for c in chips:
            for sh,r in txt:
                if sh is c: continue
                if abs(sh.top - c.top) < 0.15*EMU and 0 <= sh.left - c.left < 0.8*EMU:
                    s_=[x[1] for x in r if x[1]]; 
                    if s_: R['subhead_pt'].append(round(max(s_)*K*2)/2); R['subhead_words'].append(len("".join(x[0] for x in r).split()))
        for sh,r in txt:
            t="".join(x[0] for x in r)
            if re.match(r'\s*(Source|Sources|来源|Note)', t):
                s_=[x[1] for x in r if x[1]]
                if s_: R['source_pt'].append(round(min(s_)*K*2)/2); R['source_top_pct'].append(round(sh.top/H*100))
            for x in r:
                if x[1]: R['all_pt'].append(x[1]*K)
                if x[3]: fonts[x[3]]+=1
            if re.search(r'insight|comment|key point|implication|recommend', t, re.I) and len(t)<40: R['insight_label'].append(t.strip())
    q=lambda v:(round(st.median(v),1) if v else None)
    def dist(v,n=6): return collections.Counter(v).most_common(n)
    return dict(slides=len(p.slides), size_in=(round(W/EMU,2),round(H/EMU,2)),
        title_pt=dist(R['title_pt']), title_words_median=q(R['title_words']), title_chars_median=q(R['title_chars']), title_chars_max=max(R['title_chars'] or [0]),
        title_left_in=q(R['title_left_in']), title_top_in=q(R['title_top_in']),
        chips_per_slide=dist(R['chips_per_slide']), subhead_pt=dist(R['subhead_pt']), subhead_words_median=q(R['subhead_words']),
        source_pt=dist(R['source_pt'],3), source_top_pct=q(R['source_top_pct']),
        text_pt=dist([round(x) for x in R['all_pt']],8), min_pt=min(R['all_pt'] or [0]), share_below_9pt=round(sum(1 for x in R['all_pt'] if x<9)/max(1,len(R['all_pt']))*100),
        fonts=fonts.most_common(4), insight_labels=collections.Counter(R['insight_label']).most_common(5))
if __name__=="__main__":
    out={}
    for f in sys.argv[1:]: out[f]=measure(f)
    print(json.dumps(out,indent=1,ensure_ascii=False))
