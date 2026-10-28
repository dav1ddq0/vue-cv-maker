# 034 · Import hardening (security review)

**Status:** implemented ✅

## What it does

A security review of everything since 019 (and of the import paths, where untrusted content enters)
found no way to run code, leak data or reach a third party, and three weaknesses, fixed here:

1. **(Medium, robustness) A JSON with wrong types broke the editor.** `meta` was copied as is and
   list entries kept non-string fields; an object where a string belongs threw in templates and
   exports ("`.trim is not a function`"), leaving that CV unusable. Every field is now typed on
   import; the CV language is one of the supported codes.
2. **(Functional, found by the review) An ongoing education lost "currently studying" on import:**
   `endDate ?? ''` turned `null` into `''`, so a JSON round trip changed the CV. `null` is kept.
3. **(Low) Control and bidi characters** (e.g. U+202E, which can make "…exe.pdf" read differently)
   reached the PDF file name proposed by the print dialog and the PDF title. They are removed.
4. **(Defence in depth)** pdf.js parses user PDFs with `isEvalSupported: false` (the CSP already
   forbids eval).

## Verification

- 491 unit tests; new: type-confused file normalised, education `null` round trip, language
  restricted, control/bidi characters out of the PDF name.
- Hostile JSON imported through the UI (built site, CSP): XSS payloads in every text field,
  `javascript:`/`data:`/`vbscript:` links, remote and SVG photos, CSS injection in colour, font and
  margin, PDF-syntax injection in title and link, `__proto__` keys, bidi characters, wrong types.
  Result: no script ran, no prototype pollution, no request left the origin, no dialog, no console
  error; every step renders; print, direct PDF, HTML and JSON all export. PDFs checked with pdf.js:
  no document JavaScript, open action or attachment, every link annotation http(s). HTML export
  opened from disk: no `<script>`, `<iframe>` or `on*` attribute, only http(s) links, nothing
  loaded remotely, nothing ran. JSON export: style reset to safe values, photo not remote.
- Hostile PDF imported (OpenAction JavaScript, `javascript:` link, markup in its text): nothing ran,
  no request, no error.
- `npm audit`: 0 vulnerabilities. pdf.js 4.10.38 (after the CVE-2024-4367 fix). Production CSP
  unchanged, no `unsafe-eval`. Static scan: `v-html` only for the bundled template thumbnails;
  `innerHTML` only with Vue-rendered (escaped) markup; no `eval`, `new Function`, `attr()`,
  `window.open`; every template link through `absoluteUrl`.
