# ExecSummary

Numbered key messages, one row each: number square, bold label, the message on a panel. The decision row is the highlight.

- **Props:** `items` `[{label, text}]` (3–6 rows), `highlight` (index; usually the decision).
- **Write:** the messages read top to bottom as the storyline (answer first; SCQA); each message is a full sentence.
- **Generator:** `labelledRows` in `Generators/patterns.js`.
