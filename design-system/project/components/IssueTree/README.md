# IssueTree

A logic tree: the question or result on navy, drivers on grey-1 boxes (the main one green), sub-drivers on panels (the main branch on light cyan), a comment per branch.

- **Props:** `root`, `branches` `[{label, children, comment}]`, `highlight` (branch index).
- **Rules:** branches are mutually exclusive and add up to the root; quantify them when you can. Generator: `issueTree`.
