# Initial Spec — CV Editor

**Version:** 0.1 (draft)
**Date:** September 13, 2026

---

## 1. Overview

A web app that generates résumés from a guided form, with live preview and an extensible template system. It runs entirely in the browser (*local-first*): no accounts, no server, no required connection. It can import data from an existing PDF and export both the finished CV and the raw data.

### Design principles

1. **Local-first.** The app is fully functional without a backend. Any future server is an optional sync layer, never a requirement.
2. **Data separate from presentation.** A single `CVData` model; templates only render it.
3. **One source of truth per template.** A single Vue component serves the live preview, the printable HTML, and the PDF.
4. **Data is never lost.** Switching templates, importing, or changing language never deletes information the user entered.
5. **Always selectable text.** The PDF must be readable by ATS systems. No rasterizing the DOM.

### Out of scope (v1)

User accounts, multi-device sync, shareable public links, AI writing suggestions, ATS analysis, OCR for scanned PDFs.

The backend (section 9) is out of scope for v1 and arrives in a later phase as an **optional** layer. The app must always work fully without it.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Build | Vite |
| State | Pinia |
| Local persistence | IndexedDB (`idb-keyval`) |
| PDF extraction | `pdf.js` (`pdfjs-dist`) |
| PDF generation | Browser print (`window.print()` + `@media print` CSS) |
| Pagination | `paged.js` (from Phase 2) |
| Frontend hosting | GitHub Pages |
| Backend (optional) | Python + FastAPI |
| Database (optional) | SQLite + Litestream |
| Server-side PDF | WeasyPrint |

**Note on PDF generation:** `html2pdf.js` and `html2canvas` are ruled out because they rasterize the content, producing a PDF with no selectable text — useless for ATS. `pdfmake` and `jsPDF` are ruled out because they would force every template to be maintained twice (HTML + PDF definition), breaking the single-source-of-truth principle.

---

## 3. Data model

`CVData` is the app's central contract. Everything else depends on it.

```ts
interface CVData {
  schemaVersion: number;          // for future migrations
  meta: {
    id: string;
    title: string;                // internal document name
    createdAt: string;
    updatedAt: string;
    language: string;             // language of the CV content
  };
  personal: {
    fullName: string;
    headline: string;             // e.g. "Full-Stack Developer"
    email: string;
    phone: string;
    location: string;
    photo?: string;               // IndexedDB reference (`photo:{id}`)
    links: Array<{ label: string; url: string }>;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillGroup[];
  languages: Array<{ name: string; level: string }>;
  customSections: CustomSection[];
  sectionOrder: string[];         // section render order
  style: StyleTokens;
}

interface ExperienceEntry {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;              // partial ISO: "2023-04"
  endDate: string | null;         // null = present
  description: string;
  highlights: string[];           // bulleted achievements
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  description?: string;
}

interface SkillGroup {
  id: string;
  category: string;               // e.g. "Languages"
  items: string[];
}

interface CustomSection {
  id: string;
  title: string;                  // "Publications", "Volunteering"...
  entries: Array<{
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    description?: string;
  }>;
}

interface StyleTokens {
  accentColor: string;
  fontFamily: string;
  fontScale: number;              // multiplier, 0.85–1.15
  spacingScale: number;
  pageMargin: string;
}
```

`customSections` and `sectionOrder` exist from v1 even if their UI is minimal: adding them later would mean touching every template.

---

## 4. Template system

### Contract

```ts
interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  supports: TemplateCapability[];
  component: () => Promise<Component>;   // receives { data: CVData }
}

type TemplateCapability =
  | 'photo'
  | 'sidebar'
  | 'accentColor'
  | 'customFont'
  | 'multiPage';
```

Rules:

- A template receives **exactly one prop**: `data: CVData`.
- It holds no state of its own and never mutates the data.
- It never accesses the Pinia store directly.
- It consumes `StyleTokens` as CSS variables; it hardcodes no colors or fonts.

### Auto-registration

```ts
const modules = import.meta.glob('./templates/*/index.ts', { eager: true });
```

Adding a template = creating a folder with its `index.ts` and `.vue`. Zero changes to existing code.

### Uneven capabilities

If the active template does not declare a capability, the corresponding data is **ignored, never deleted**. The UI shows a quiet notice (*"This template doesn't display a photo"*) and dims the related form control. Switching back to a compatible template brings the data back intact.

### Initial templates

| ID | Name | Capabilities | Description |
|---|---|---|---|
| `classic` | Classic | `accentColor`, `multiPage` | Single column, no photo, maximum ATS compatibility |
| `modern` | Modern | all | Two columns with sidebar and color accent |
| `compact` | Compact | `accentColor`, `customFont`, `multiPage` | Dense, aimed at profiles with long experience |

Chosen deliberately to exercise the contract from different angles and prove the system is genuinely extensible.

---

## 5. Guided form

Step-based wizard with free navigation (sections can be skipped), a progress bar, and a live preview alongside.

**Steps:** Personal details → Summary → Experience → Education → Skills → Languages → Custom sections → Template and style → Export.

Requirements:

- Autosave to IndexedDB, debounced (~500 ms).
- Drag-to-reorder entries within each section.
- Non-blocking validation: a malformed email is flagged, but never prevents moving on.
- On mobile, the preview becomes a collapsible panel instead of a side column.
- Undo/redo on the store (minimum 20 steps).

---

## 6. Export

| Format | Method | Notes |
|---|---|---|
| PDF | `window.print()` with an `@media print` stylesheet | Selectable text, clickable links |
| Printable HTML | Self-contained document with embedded CSS | Downloads as `.html` |
| JSON | `CVData` serialization | Official backup and portability format |

Print rules: A4 size, `break-inside: avoid` on every entry so it never splits mid-way, hide all application UI, and disable the browser's color adjustment with `print-color-adjust: exact`.

### Pagination with paged.js

From Phase 2, `paged.js` is added as a CSS Paged Media polyfill, providing:

- Page numbering and repeating headers or footers.
- Widow and orphan control (`widows`, `orphans`).
- `@page` rules and margins with real support across browsers.
- A faithful pagination preview **inside the app**, without going through the print dialog.

Integration constraints:

- paged.js rewrites the DOM it processes. It must run on an **isolated, non-reactive container** (a copy of the rendered CV), never on the Vue-managed preview.
- Pagination is asynchronous: it must resolve before `window.print()` is invoked.
- All interaction with the library is encapsulated in `services/export/pdf.ts`. Templates neither know about it nor depend on it, so it can be replaced without touching them.

Phase 1 uses plain `window.print()`. paged.js arrives once several templates exist and the real pagination problems are known.

JSON is the canonical portability format. The PDF is the deliverable to send to third parties; it is not used as a round-trip format for the data itself.

---

## 7. Import

### 7.1 From JSON

Exact reconstruction. `schemaVersion` is validated and migrations applied if the file comes from an earlier version.

### 7.2 From an external PDF

100% client-side extraction with `pdf.js`, in three stages:

**Stage 1 — Extraction.** `getTextContent()` returns text fragments with their position, font size, and font name. Lines are reconstructed by grouping on the Y coordinate within a tolerance.

**Stage 2 — Heuristics.**

- *Direct fields via regex:* email, phone, URLs, and profiles (LinkedIn, GitHub).
- *Date ranges:* patterns such as `2020 - 2023`, `Mar 2021 – present`, in both English and Spanish.
- *Name:* usually the largest font-size text on the first page.
- *Section headers:* a combination of signals — multi-language keywords (Experience/Experiencia, Education/Formación, Skills/Habilidades, Languages/Idiomas), above-average font size, bold weight, short and isolated line.
- *Assignment:* everything between two headers belongs to the preceding section.

**Stage 3 — Mandatory review.** Nothing is ever imported silently. A screen shows:

- The detected fields, with low-confidence ones visually flagged.
- A panel of **unclassified** text blocks the user can drag into a section.
- The full plain text, always available for manual copy-paste.

If the PDF contains no extractable text (it's a scan), this is detected and clearly reported; OCR is out of scope for v1.

### 7.3 Known limits

Two-column CVs tend to interleave text badly during extraction, and heavily creative layouts degrade detection considerably. The goal of import is not perfection — it's saving the initial typing. The review screen is what makes an imperfect extraction useful.

---

## 8. Persistence

### 8.1 Browser storage

**IndexedDB** as the primary store, via `idb-keyval` (~600 bytes) to avoid the verbosity of the native API.

`localStorage` is ruled out for storing CVs for three reasons: its ~5 MB per-origin limit is exhausted by two or three CVs containing photos; it is synchronous and blocks the main thread on every autosave; and when full it throws rather than degrading. `localStorage` is reserved for trivial preferences (last template used, UI language).

Key scheme:

| Key | Contents |
|---|---|
| `cv:{id}` | Full `CVData` object |
| `photo:{id}` | Photo as a `Blob` |
| `index` | List of CVs with `id`, title, and modified date |

Photos are stored as `Blob`, not base64 dataURLs: this saves roughly 33% of space and avoids serialization cost. Conversion to a dataURL happens only at render time, via `URL.createObjectURL()`.

As a consequence, the `photo` field in `CVData` **does not hold the image** — it holds a reference (`photo:{id}`). Exported JSON does embed the image as base64, so the file stays self-contained and portable.

### 8.2 Behavior

- Autosave, debounced ~500 ms.
- List of saved CVs, with duplicate and delete options.
- Clear notice that data lives only in this browser, with a reminder to export the JSON as a backup.
- Explicit handling of quota-exceeded errors and of private browsing mode, where storage may not persist.

### 8.3 Abstraction

All logic sits behind a `StorageAdapter` interface:

```ts
interface StorageAdapter {
  list(): Promise<CVSummary[]>;
  load(id: string): Promise<CVData>;
  save(data: CVData): Promise<void>;
  delete(id: string): Promise<void>;
}
```

Planned implementations: `IndexedDBAdapter` (v1) and `RemoteAdapter` (Phase 6). The rest of the app doesn't know which one is in use.

### 8.4 Server-side persistence (Phase 6)

**SQLite** as the database, with `CVData` stored as JSON in a single column. The app never needs to query the CV's internal fields, and write volume is low, so a client-server engine adds nothing: one file, zero administration.

Backups via **Litestream**, which continuously replicates the file to S3-style storage.

PostgreSQL would only be justified if full-text search inside CV content or high write concurrency became necessary. Neither is anticipated.

### 8.5 Alternative to evaluate before Phase 6

Before building custom persistence, it's worth considering **syncing to the user's own cloud storage** (Google Drive, Dropbox) by exporting the JSON via their API. It avoids the database, the authentication, and the liability for other people's personal data, and it covers the most common real case: syncing between one person's own devices.

---

## 9. Optional backend (Python + FastAPI)

### 9.1 Purpose

The backend is **not a requirement for the app to work**. The app must remain fully usable without it, on IndexedDB plus JSON export/import. Its reason to exist is to provide capabilities the browser can't match in quality — not merely to be a CRUD layer.

Value, in priority order:

1. **High-quality PDF generation with WeasyPrint.** Better typographic and pagination control than the browser, and an identical result for every user regardless of their browser.
2. **More accurate PDF extraction** with `pdfplumber`, which detects columns and tables considerably better than client-side `pdf.js` heuristics.
3. Cross-device sync and remote backup.
4. Shareable public links.

Items 1 and 2 need no accounts and no database: they are stateless endpoints. They should be built first, as they deliver the most value for the least operational cost.

### 9.2 Architecture

Two adoption tiers, independent of each other:

**Tier A — stateless service.** Conversion endpoints only. No database, no authentication, no stored data. The frontend sends the rendered HTML, receives the PDF, and nothing remains on the server.

**Tier B — persistence.** Adds a database, accounts, and sync. Only tackled once Tier A is in production and a real need exists.

### 9.3 Endpoints (Tier A)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/pdf/render` | Takes `{ html, css, options }`, returns a PDF generated by WeasyPrint |
| `POST` | `/api/pdf/parse` | Takes a PDF, returns text structured into blocks with position and styling |
| `GET` | `/api/health` | Health check |

**Design decision for `/api/pdf/render`:** the frontend sends the **already-rendered HTML** produced by the template's Vue component, not the `CVData`. The server therefore needs no knowledge of templates and duplicates none of their logic, keeping the single-source-of-truth principle intact. The server is a dumb conversion engine.

### 9.4 Endpoints (Tier B)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register`, `/api/auth/login` | Authentication |
| `GET` | `/api/cvs` | List the user's CVs |
| `POST` | `/api/cvs` | Create |
| `GET/PUT/DELETE` | `/api/cvs/{id}` | Read, update, delete |
| `POST` | `/api/cvs/{id}/share` | Generate a public link |

Persistence on SQLite; `CVData` is stored as JSON in a single column (see section 8.4).

### 9.5 Frontend integration

- The backend URL is configured through an environment variable. If unset, the app runs in purely local mode and the UI shows no server options at all.
- PDF export offers two paths: *fast* (browser, always available) and *high quality* (server, if configured). If the server fails or doesn't respond, it falls back to the browser path automatically.
- Sync is implemented as a remote `StorageAdapter` that coexists with the local one rather than replacing it.

### 9.6 Considerations

- WeasyPrint depends on system libraries (Pango, Cairo, GDK-PixBuf). Deploy in Docker to avoid environment problems.
- Fonts must be installed in the image or embedded as base64 in the submitted CSS; WeasyPrint won't fetch Google Fonts unless given network egress.
- WeasyPrint doesn't execute JavaScript. Irrelevant here, since the HTML arrives pre-rendered.
- Its CSS Paged Media support is native and solid: page numbering, `@page`, margins, and widow/orphan control all work without a polyfill.
- The render endpoint receives personal data. It must not log request bodies or write temporary files that persist.
- Request size limits and rate limiting are needed, since these are open, unauthenticated endpoints.

---

## 10. Project structure

```
src/
├── components/
│   ├── form/          # wizard steps
│   ├── preview/       # preview container
│   └── import/        # import and review flow
├── templates/
│   ├── classic/
│   │   ├── index.ts       # TemplateDefinition
│   │   └── Template.vue
│   ├── modern/
│   ├── compact/
│   └── registry.ts        # auto-discovery via import.meta.glob
├── stores/
│   ├── cv.ts              # CVData + undo/redo
│   └── ui.ts
├── services/
│   ├── storage.ts
│   ├── pdfImport/         # extraction and heuristics
│   └── export/
├── types/
│   └── cv.ts
└── styles/
    └── print.css
```

Backend (separate repository or folder, independently deployable):

```
backend/
├── app/
│   ├── main.py            # FastAPI instance
│   ├── routers/
│   │   ├── pdf.py         # /render and /parse
│   │   └── cvs.py         # Tier B
│   ├── services/
│   │   ├── weasy.py       # HTML+CSS -> PDF
│   │   └── parser.py      # pdfplumber
│   └── schemas.py         # Pydantic models
├── Dockerfile             # includes Pango, Cairo, and fonts
└── pyproject.toml
```

---

## 11. Phases

**Phase 1 — Core.** `CVData` model, store with persistence, full wizard, `classic` template, live preview, PDF export, JSON import/export.

**Phase 2 — Templates and pagination.** Auto-discovery registry, `modern` and `compact` templates, customizable style tokens, handling of uneven capabilities, HTML export, and `paged.js` integration.

**Phase 3 — PDF import.** Extraction with pdf.js, heuristics, review screen with manual assignment.

**Phase 4 — Polish.** Multi-CV management, section reordering, custom sections in the UI, mobile responsiveness, undo/redo.

**Phase 5 — Backend Tier A.** Stateless FastAPI service in Docker: `/api/pdf/render` with WeasyPrint and `/api/pdf/parse` with `pdfplumber`. The frontend uses it when configured and falls back to the browser when not.

**Phase 6 — Backend Tier B.** Authentication, CV persistence, sync via a remote `StorageAdapter`, and shareable public links.

**Future (uncommitted).** AI writing suggestions, ATS checking, OCR for scanned PDFs.

---

## 12. Open decisions

- Final names and visual style for the three initial templates?
- UI languages in v1 (Spanish only, or Spanish + English from the start)?
- Is more than one saved CV allowed in Phase 1, or is that deferred to Phase 4?
- Should sample data be included so users see a result before typing anything?

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Print page breaks behave differently across browsers | Test early in Chrome and Firefox; document the recommended browser |
| User loses data by clearing the browser | Visible notice and periodic reminder to export the JSON |
| IndexedDB doesn't persist in private browsing, or gets evicted | Detect private mode and warn; request `navigator.storage.persist()` |
| PDF import creates unrealistic expectations | Communicate in the UI that it's an aid, not an automatic conversion |
| Templates accumulate logic and break the contract | Review that no template imports the store or transforms data |
| `paged.js` has low maintenance activity | Encapsulate it in `services/export/pdf.ts`; the app must still export via plain `print()` if it's dropped |
| Conflict between paged.js DOM rewriting and Vue reactivity | Always run it on an isolated container, outside the reactive tree |
| The backend becomes a de facto requirement and the app stops working without it | No Phase 1–4 feature may depend on the server; test periodically with the backend switched off |
| Visual divergence between browser PDF and WeasyPrint PDF | One shared print stylesheet; document known differences |
| Backend hosting cost and maintenance | Stateless, scale-to-zero service; Tier B only on real demand |
| Personal data passing through the server | Don't log request bodies, don't persist temp files, and state this clearly in the UI |
