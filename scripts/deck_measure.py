#!/usr/bin/env python3
"""deck_measure.py: how dense is a deck, in the numbers the reference decks are measured in.

  python3 scripts/deck_measure.py deck.pptx [more.pptx ...] [--slides]

Per content slide (a slide with a title and a body; covers, agendas, dividers and closing slides are left out):
  body words   every word on the slide outside the title, the source line, the page number and the breadcrumb,
               tables and grouped shapes included (chart-internal labels are not text shapes and are not counted)
  shapes       every drawn element, grouped ones counted one by one
  picture      the slide carries at least one picture or icon (a bitmap, or a vector icon drawn by Generators icon())
  tables       native tables
The deck line gives the median of each. Reference range, measured with this script on the 13 native case decks in
Templates/ (2026-11-24): 125 to 194 body words (most 140 to 175), 58 to 93 shapes, a picture on 85 to 100% of content
slides in 11 of 13 decks, 4 to 29 native tables per deck, 11 to 21 title words. (The first count, by hand on 7 decks
on 2026-11-23, gave 140 to 211 words and 51 to 82 shapes; the rules quote that one.)
Used by the self-audit (review/self-audit-*.md) and after every sample build: a sample far below the range is thin.
"""
import re, sys, statistics
from pptx import Presentation
from pptx.util import Emu

WORD = re.compile(r"[A-Za-z0-9%$€£¥'’\-一-鿿]+")
SRC = re.compile(r"\s*(source|sources|note|notes|photo|资料来源|来源|注)\s*[:：]", re.I)

def walk(shapes):
    for sh in shapes:
        if sh.shape_type == 6:                      # group
            yield from walk(sh.shapes)
        else:
            yield sh

def words(t): return len(WORD.findall(t or ""))

def measure(path):
    prs = Presentation(path); H = prs.slide_height; rows = []
    for n, sl in enumerate(prs.slides, 1):
        shapes = list(walk(sl.shapes)); title = None
        for sh in shapes:
            if sh.is_placeholder and sh.placeholder_format.type in (1, 3):   # TITLE, CENTER_TITLE
                title = sh; break
        if title is None:                            # decks without placeholders: the topmost large text
            cand = [s for s in shapes if s.has_text_frame and s.text_frame.text.strip() and s.top is not None and s.top < H * 0.2 and words(s.text_frame.text) >= 4]
            title = max(cand, key=lambda s: max((r.font.size or Emu(0)) for p in s.text_frame.paragraphs for r in p.runs) if any(p.runs for p in s.text_frame.paragraphs) else Emu(0)) if cand else None
        body = 0; pics = 0; tables = 0; count = 0
        for sh in shapes:
            count += 1
            if sh.shape_type == 13 or (sh.name or "").startswith("icon "): pics += 1
            if getattr(sh, "has_table", False) and sh.has_table:
                tables += 1; body += sum(words(c.text) for r in sh.table.rows for c in r.cells); continue
            if sh is title or not sh.has_text_frame: continue
            t = sh.text_frame.text
            if not t.strip() or SRC.match(t): continue
            if sh.top is not None and (sh.top > H * 0.93 or (sh.top < H * 0.04 and sh.height < H * 0.06)): continue   # footer, page number, breadcrumb
            body += words(t)
        tw = words(title.text_frame.text) if title is not None else 0
        content = title is not None and tw >= 4 and (body >= 25 or tables) and count >= 6
        rows.append(dict(n=n, content=content, body=body, shapes=count, pic=pics > 0, tables=tables, title=tw))
    return rows

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]; per = "--slides" in sys.argv
    if not args: sys.exit(__doc__)
    for p in args:
        rows = measure(p); c = [r for r in rows if r["content"]]
        if not c: print(f"{p}: no content slides found"); continue
        med = lambda k: statistics.median(r[k] for r in c)
        print(f"{p}: {len(c)} content slides of {len(rows)} | body words {med('body'):.0f} | shapes {med('shapes'):.0f} | picture on {100 * sum(r['pic'] for r in c) / len(c):.0f}% | native tables {sum(r['tables'] for r in rows)} | title words {med('title'):.0f}")
        if per:
            for r in rows: print(f"   {r['n']:>3} {'content' if r['content'] else '-      '} words {r['body']:>4} shapes {r['shapes']:>3} pic {'y' if r['pic'] else 'n'} tables {r['tables']} title {r['title']}")

if __name__ == "__main__": main()
