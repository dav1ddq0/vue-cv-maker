# 005 · Tasks

- [x] 1. Readable ink on accent backgrounds  — commit: `631cf54` feat(templates): readable ink on accent backgrounds (--cv-on-accent)
- [x] 2. `chevron`  — commit: `06570c2` feat(templates): add chevron, a V-shaped header template with the photo in the notch
- [x] 3. `facet`  — commit: `c251407` feat(templates): add facet, a corner-shapes template with a ruled side column

Checked in the browser with the yellow accent (`#ffd86f`): ink on accent areas is dark and readable in
meridian, banner and chevron; facet's corner shapes follow the accent.

Known limitation (not fixed here): with light accents such as yellow, text that uses the accent
**on white** (headlines, company names, section titles) has low contrast in every template that does so.
A follow-up would add an accent-for-text token (the accent darkened until it reaches 4.5:1 on white).
