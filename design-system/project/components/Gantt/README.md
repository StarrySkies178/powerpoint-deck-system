# Gantt

Workstreams (rows, optionally grouped) against periods: navy period headers, zebra rows, bars in cyan, the workstream in focus in green, milestones as green diamonds.

- **Props:** `periods`, `rows` `[{label, start, end, milestone, group}]` (0-based period indexes; a `group` row is a bold heading), `highlight` (row index).
- **Use:** when timing and overlap matter; a single sequence of steps → `ChevronProcess`; dated events → `Timeline`. Generator: `gantt`.
