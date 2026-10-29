# 046 · Cobalt, a template with a tinted header and a round photo

**Status:** implemented ✅

## What it does

A new template, **Cobalt**, laid out like a reference the user shared (a two-column résumé with a
coloured header): original code and tints, no assets taken from it.

- A full-width header in a tint of the accent, with a round photo on the left that overlaps the
  header's lower edge with a ring in the header's tint, and the name (heavy, wrapping over two lines
  when long) and the headline in tracked capitals on the right.
- A pale sidebar (8 % of the accent): contact in discs with icons (e-mail, phone, location, links),
  skills (bullets, or level dots when the skills have levels) and languages (level dots).
- The main column: summary (justified), experience, education and custom sections, each entry as a
  bullet with the position in bold capitals, then company, dates and description.
- Section titles are heavy, widely tracked capitals over a short accent rule.
- Without a photo the header is just the name, from the page margin.
- Defaults: navy `#26416e`, Inter. Capabilities: photo, sidebar, accent colour, custom font,
  multi-page, skill levels. The header and the sidebar are tints with the text in ink, so any accent
  stays legible.

## Decisions

- **Education is in the main column, not the sidebar of the reference.** paged.js drops what follows
  a sidebar that overflows the page (the main column and the rest of the sidebar vanished from the
  PDF when education sat on the left). Education is the longest block a CV can put there, so it lives
  with the career; skills and languages are the short ones the sidebar holds, as in Aurora.
- A skill group's name is set a little smaller than its items, which is how the PDF import tells it
  apart from a skill (spec 040).

## Acceptance criteria

1. [x] The template registers itself (`src/templates/cobalt/`) and shows in the gallery with a thumbnail.
2. [x] It passes the template contract tests (variables only, no store, page-break rules, empty CV).
3. [x] Its PDF (direct and print) has the same pages and imports back with every skill, language,
   experience and education entry (`qa:roundtrip` 392/392).
4. [x] The photo shows in the header and in the PDF only when there is one.

## Verification

- 605 unit tests, `vue-tsc`, `qa:e2e` 96/96, `qa:pdf` 119/119, `qa:roundtrip` 392/392,
  `qa:consistency` 10/10.
- Rendered with the sample CV and a photo, and compared to the reference by eye.
