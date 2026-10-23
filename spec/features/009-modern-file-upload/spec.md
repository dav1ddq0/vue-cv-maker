# 009 · Modern file upload

**Status:** implemented ✅

## What it does

One upload control, `FileDropzone`, for every file the app takes: the profile photo and the
JSON/PDF import. It replaces the browser's raw `<input type="file">` (photo) and the plain
dashed text box (import).

- A single click, drop or keyboard target with an icon, a title and a short format hint.
- States: hover, drag-over (highlight), keyboard focus (visible ring), disabled, busy (spinner),
  and a rejected file type (inline alert).
- `compact` row variant for the photo, next to an avatar preview (placeholder when empty) and
  the remove button.
- Follows light and dark themes through the existing design tokens.

## Why

The native file input looked out of place beside the rest of the UI and gave no drop target or
feedback. Dropped images were also rejected by the old type check, which did not understand
`image/*`.

## Acceptance criteria

- [x] The control is a `<label>` around a visually hidden native file input: Tab, Enter/Space and
      screen readers work without a scripted role.
- [x] Picking or dropping a matching file emits it; a non-matching one shows an alert and emits nothing.
- [x] `image/*`, `.ext` and exact MIME types in `accept` are honoured for dropped files.
- [x] Drag-over highlights and clears on drop/leave; busy and disabled ignore drops.
- [x] The focus ring shows on keyboard focus only (`:has(:focus-visible)`, with a `:focus-within`
      fallback); motion respects `prefers-reduced-motion`.
- [x] The hint is linked with `aria-describedby`; an outer field label can name the input (`inputId`).
- [x] Photo and import both use it; strings in `es` and `en`.
- [x] Checked in the browser: empty, hover, focus, drag-over, filled, rejected, dark theme, import view.
- [x] `npm test`, typecheck and build pass.

## Out of scope

- Multiple files, progress for large files, image cropping.
- Verifying a native OS drag-and-drop (simulated with DOM events in the browser check).
