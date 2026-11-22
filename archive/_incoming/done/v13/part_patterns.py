"""Map a part's reviewed 'kind' description to a catalogue pattern id."""
import re
RULES = [("bubble chart", "bubble-portfolio"), ("wheel", "cycle"), ("scoring table", "scoring-table"), ("guideline", "labelled-rows"), ("speech|callout|call-out", "quotes"),
 ("project governance", "org-chart"), ("external shock", "flow-with-shock"), ("drivers with braces|inputs → method", "driver-tree"), ("arrow and connector", "icon-infographic"),
 ("icon|flag", "icon-infographic"), ("sticker|status text|draft stamp", "status-stickers"), ("legend", "status-stickers"),
 ("takeaway", "chart-commentary"), ("recommendation|decision box|implication", "synthesis"), ("insights|comment", "chart-commentary"),
 ("harvey|star rating|scoring", "scoring-table"), ("thermometer", "scale-position"), ("persona|speech", "persona-cards"), ("callout|call-out|bubble", "quotes"),
 ("positioning|bubble chart|bubbles", "bubble-portfolio"), ("scatter", "scatter"), ("issue question|goal → strategy", "issue-tree"), (r"\btree\b|org chart|org/", "org-chart"),
 ("exec summary|story diagram|decision-framework", "exec-summary-tree"), ("gantt|calendar|stage bars", "gantt"), ("swimlane", "swimlanes"), ("flowchart|single-lane|process", "chevron-process"),
 ("timeline", "timeline"), ("chevron|ribbon|phase", "chevron-process"), ("vertical-steps", "vertical-process"), ("ladder|maturity", "staircase"), (r"\bcycle\b|wheel|refresh", "cycle"),
 ("radar", "radar"), (r"\bmap\b|activity map", "map"), ("donut|kpi", "kpi-numbers"), ("waterfall|bridge", "waterfall"), ("100% stacked|stacked", "stacked-chart"),
 ("combo", "combo-chart"), (r"line chart|\+ line|line spike|multi-line|path", "line-chart"), (r"\bbars?\b|bar chart|column chart", "bar-chart"), (r"\bpie\b", "pie-chart"),
 ("pyramid", "pyramid"), ("hub|satellite|ecosystem", "hub-spoke"), ("venn|overlapping", "venn"), ("five forces|suppliers", "forces-in"), ("converg", "converge"),
 ("criteria arrows|→ result|consequences|reactions", "chain-reaction"), ("against|counter-trend|with the tide", "opposing"), ("tap metaphor|metaphor|mini-diagram", "metaphor"),
 ("opportunities vs threats|vs", "pros-cons"), ("2x2|selection grid", "matrix-2x2"), ("puzzle", "puzzle"), ("diamonds|circle and", "framework"), ("question checklist|checkbox|guideline|numbered section", "labelled-rows"),
 ("table", "table"), ("pillar|cards", "framework"), ("strategy columns|strategy boxes|column", "text-columns"), (r"\brows\b|\blist\b|numeral", "labelled-rows")]
def pattern_for(kind):
    for kw, p in RULES:
        if re.search(kw, kind.lower()): return p
    return "framework"
