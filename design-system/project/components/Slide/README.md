# Slide

The frame every content slide shares: action title, unit line, body area, source bottom-left, page number bottom-right, optional section tracker top-right.

- **Props:** `title` (an action title: a full sentence, ≤ 2 lines), `subtitle` (unit or what the exhibit shows), `source`, `page`, `tracker` `{n, current}`, `dark` (navy slide), `children` (the body: any component below).
- **Fixed geometry:** from the master: title 0.4 in from the left, 0.3 in from the top, bottom-anchored; body 12.53 × 5.21 in from 1.65 in; footer 7.01 in. Body components are drawn for that 1203 × 500 px area.
- **Colours:** reads only the semantic roles (`surface`, `title`, `ink`, `muted`), so `dark` gives correct values automatically.
- **You provide:** the action title, the unit line and the source of every number.
- **Don't:** use a topic as the title ("Margin"), or put two messages on one slide.
