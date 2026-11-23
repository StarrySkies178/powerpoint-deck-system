# ChevronProcess

Equal chevrons for 3–6 steps: done steps grey-2, the current step green, steps ahead navy; detail under each; optional result panel and takeaway bar.

- **Props:** `steps` `[{label, text}]`, `current` (index), `result` `{label, text}`, `takeaway`.
- **Rules:** dates or durations matter → `Timeline`; > 6 steps → split into phases. Generator: `chevronProcess`.
