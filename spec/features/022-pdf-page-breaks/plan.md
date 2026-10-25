# 022 · Plan

1. Spec, plan, tasks.
2. Blank-page fix: `#print-root` off-screen and `visibility: hidden` on screen (`app.css`), static and
   visible in print (`print.css`); `paginateInto` empties the container when paged.js throws.
   Check every template's PDF with Playwright.
3. Model: `pageBreaks`, schema v5, `normalize` filter; `ResolvedSection.breakBefore` in
   `templates/shared.ts`. Tests.
4. Templates and print CSS: `:data-page-break` on every main-column `<section>`, and a
   `.cv-page [data-page-break]` rule. Tests across all templates.
5. UI: a switch per row of the section order list, i18n, note on two-column templates. Tests.
6. Playwright check, roadmap, close.

## Decisions

- **Off-screen, not `display: none`**: paged.js needs real layout boxes. `visibility: hidden` keeps
  them, `position: fixed` keeps the 210 mm wide layer out of the page's scroll width.
- **A list of ids, not a flag on each section**: built-in sections have no object of their own (only
  an id in `sectionOrder`), so a list works the same for built-in and custom sections, like
  `sectionOrder` itself.
- **Main column only**: in the sidebar templates the sidebar comes first in the DOM; a forced break in
  it would move the whole main column to the next page.
- **Attribute in the template, rule in `print.css`**: the rule must carry no comma-bearing selector
  (paged.js limitation noted in `print.css`); a plain attribute selector is safe.
