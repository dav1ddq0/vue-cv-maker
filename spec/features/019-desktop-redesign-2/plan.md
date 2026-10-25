# 019 · Plan

## Implementation

1. Spec, plan, tasks.
2. `TemplateGallery.vue`: filter chips from `template.tags`.
3. `StepLanguages.vue`: level buttons (`LanguageLevelPicker.vue`), CV-language "Native".
4. Theme `'light' | 'dark' | 'system'` in prefs and `ui` store; a `matchMedia` listener; three-way controls in the preferences popover and the phone menu.
5. `ui.view = 'welcome'` when `cv.init()` finds no saved CV; `WelcomeView.vue`.
6. Templates mark each section with `data-section="<kind>"`; `PreviewPane` outlines the current one through a scoped rule on the preview wrapper only.
7. `PdfReview.vue`: two-column grid ≥ 1001px with the raw text always visible.
8. Sweep and close.

## Decisions

- **Filters from existing tags**: no new template metadata; a new template is filterable by declaring tags.
- **`data-section` on the section element**: inert outside the preview (the outline rule lives only in `PreviewPane`), so exports are unchanged.
- **Theme stored as chosen** (`system` stays `system`); the resolved value goes to `data-theme`, so all existing dark CSS keeps working.
