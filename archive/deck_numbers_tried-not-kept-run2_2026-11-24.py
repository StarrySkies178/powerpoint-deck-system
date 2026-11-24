"""deck_numbers.py <deck.pptx> <prompt or brief file> [--json]

Every number on a slide must come from the brief (roadmap 4.2 Run 2, v2.50). Lists the numbers on each slide (text boxes,
tables, the values and categories stored in native charts) that do not appear in the brief, and exits 1 when there is one.

What counts as "appears in the brief": the same number written there in any common form: 1,234 = 1234; 23% = 23 = 0.23
(a chart stores percentages as fractions); 2023E = 2023; a range 13-18 gives 13 and 18; 1.60 = 1.6. A number the brief
does not have is an error even when it is right arithmetic (a total, a CAGR, a rescaled unit): the builder copies, it
does not compute. One exception: a value stored in a native chart may be the sum or difference of two numbers of the
brief (the segments of a stacked chart when the brief gives totals); its labels must still be the brief's. Allowed
without the brief: a single digit 1-9 standing alone in its own shape (a step or item number,
a chip), the slide's own page number when the brief gives it, footnote markers (¹ ² ³ and *).

Why: C04's stored build showed numbers that differ from the original slide, and two of the roadmap 1.5 test decks had
summary numbers that no exhibit showed; both were caught only by reading slide by slide.
"""
import re, sys, json
from pptx import Presentation
from pptx.util import Emu

NUM = re.compile(r"(?<![\w.])[-−–]?\d[\d,]*(?:\.\d+)?(?![\d])")

def norm(tok):
    t = tok.replace("−", "-").replace("–", "-").replace(",", "")
    if t.startswith("-"): t = t[1:]
    try: v = float(t)
    except ValueError: return None
    return round(v, 6)

def numbers_in(text):
    out = []
    for m in NUM.finditer(text):
        tok = m.group(0)
        if "," in tok and not re.fullmatch(r"[-−–]?\d{1,3}(,\d{3})+(\.\d+)?", tok):   # "2,3" is a list, not 2.3 thousand
            for part in tok.split(","):
                v = norm(part)
                if v is not None and part: out.append((part, v))
            continue
        v = norm(tok)
        if v is not None: out.append((tok, v))
    return out

YEARS = re.compile(r"\b((?:19|20)\d\d)[A-Za-z]?\s*(?:-|–|—|to)\s*((?:19|20)\d\d)[A-Za-z]?\b")

def brief_set(text):
    s = set()
    for _, v in numbers_in(text):
        s.add(v); s.add(round(v / 100, 6)); s.add(round(v * 100, 6))   # 23% in the brief = 0.23 in a chart, and back
    for a, b in YEARS.findall(text):                                    # "2019–2023", "2016e-2021e": every year between
        if int(a) < int(b) <= int(a) + 30: s.update(float(y) for y in range(int(a), int(b) + 1))
    s.add(0.0)                                                          # a zero (an empty cell, a chart's base) is not data
    return s

def derived_set(text):
    """sums and differences of two numbers of the brief: the segments of a stacked chart when the brief gives totals"""
    v = sorted({x for _, x in numbers_in(text)})[:400]
    return {round(a - b, 6) for a in v for b in v if a > b} | {round(a + b, 6) for a in v for b in v}

def in_brief(v, S):
    if v in S: return True
    return any(abs(v - b) <= 1e-6 * max(1, abs(b)) for b in S)

ABBR = re.compile(r"(?<![\d.])'?(\d\d)\s*([-–])\s*'?(\d\d)([A-Za-z]?)(?![\d.%])")
def expand_years(text, S):
    """'18-23E' on a slide is 2018-2023E when the brief has those years"""
    def f(m):
        a, b = 2000 + int(m.group(1)), 2000 + int(m.group(3))
        return f"{a}{m.group(2)}{b}{m.group(4)}" if float(a) in S and float(b) in S else m.group(0)
    return ABBR.sub(f, text)

def slide_numbers(slide, page_no, S=frozenset()):
    """(number token, value, where) for every number a reader sees on the slide, plus native chart data"""
    found = []
    def walk(shapes):
        for sh in shapes:
            if sh.shape_type == 6: walk(sh.shapes); continue
            if getattr(sh, "has_text_frame", False) and sh.has_text_frame:
                txt = expand_years(sh.text_frame.text, S)
                nums = numbers_in(txt)
                if len(nums) == 1 and txt.strip() == nums[0][0] and 1 <= nums[0][1] <= 9 and float(nums[0][1]).is_integer():
                    continue                                       # a lone step / item number in its own shape
                for tok, v in nums: found.append((tok, v, txt.strip()[:50]))
            if getattr(sh, "has_table", False) and sh.has_table:
                for r in sh.table.rows:
                    for c in r.cells:
                        for tok, v in numbers_in(c.text): found.append((tok, v, "table: " + c.text.strip()[:40]))
            if getattr(sh, "has_chart", False) and sh.has_chart:
                cx = sh.chart._chartSpace
                for ser in cx.iter():
                    if not ser.tag.endswith("}ser"): continue
                    sp = [e for e in ser if e.tag.endswith("}spPr")]
                    if sp and any(e.tag.endswith("}noFill") for e in sp[0].iter()) and not any(e.tag.endswith("}dLbls") for e in ser):
                        continue                                   # an invisible helper series (a waterfall's base) is not shown
                    for pt in ser.iter():
                        if pt.tag.endswith("}v") and pt.text:
                            for tok, v in numbers_in(pt.text): found.append((tok, v, "chart data"))
    walk(slide.shapes)
    # the slide-number field and footnote markers are not data
    return [(t, v, w) for t, v, w in found if not (page_no is not None and v == page_no and len(t) <= 3 and len(w) <= 4)]

def check(pptx_path, brief_text):
    S = brief_set(brief_text); D = derived_set(brief_text)
    pm = re.search(r"\bpage(?: number)?\s*(\d+)", brief_text, re.I); page = float(pm.group(1)) if pm else None
    out = []
    for i, s in enumerate(Presentation(pptx_path).slides, 1):
        bad = []
        for tok, v, where in slide_numbers(s, page, S):
            if where == "chart data" and in_brief(v, D): continue   # a stacked segment = total minus the other part
            if not in_brief(v, S) and (tok, where) not in [(b[0], b[2]) for b in bad]: bad.append((tok, v, where))
        out.append(dict(slide=i, missing=[f"{t} (in “{w}”)" for t, v, w in bad]))
    return out

if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if x != "--json"]
    r = check(a[0], open(a[1], encoding="utf-8").read())
    if "--json" in sys.argv: print(json.dumps(r, indent=1, ensure_ascii=False))
    else:
        n = sum(len(s["missing"]) for s in r)
        print(f"deck_numbers: {n} number(s) not in the brief")
        for s in r:
            for m in s["missing"]: print(f"  {s['slide']:>3}  E number not in the brief: {m}")
    sys.exit(1 if any(s["missing"] for s in r) else 0)
