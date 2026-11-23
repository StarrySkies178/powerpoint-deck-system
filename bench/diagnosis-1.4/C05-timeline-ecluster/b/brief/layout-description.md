# Layout: Gantt-style implementation timeline with a risks callout below

- **Top strip:** a breadcrumb tracker on the left (three steps joined by arrows, first two dimmed, last highlighted as current) and a company logo (icon plus wordmark) on the right.
- **Title band:** a full-width filled band under the strip, slide title on the left.
- **Body, upper part: Gantt table.** A ruled grid with one wide label column on the left and six year columns to its right. Year labels sit above the grid, outside the box, with nothing above the label column.
  - Eight rows: four bold heading rows and four plain two-line task rows.
  - Order: two standalone bold rows, then a bold section heading with its two task rows, then a second bold section heading with its two task rows. The two section headings carry no bar.
  - Each other row has one horizontal filled bar across consecutive year cells: one year (first row), three (second row), three (first offline task), three ending at the last column (second offline task), two (first online task), three ending at the last column (second online task).
- **Body, lower part: risks callout.** A filled label box with a two-word label on the left, beside a wider outlined box holding a bulleted list of four single-line items.
- **Footer:** a rule across the slide with the page number at the right end. No source line.
