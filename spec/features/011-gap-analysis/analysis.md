# 011 · Gap analysis: fields and flow vs. CVMaker and Jobseeker

**Status:** analysis only; nothing here is implemented. Items become features through the SDD
process (spec → plan → tasks) when chosen.

## Evidence and its limits

- **CVMaker (cvmaker.es):** the 621 Spanish UI strings in the editor bundles that `/app/login`
  serves publicly, plus a page the user saved from their own session (design tab) and its assets.
- **Jobseeker (jobseeker.com):** `/app/resumes` redirects to the marketing home without a session.
  Its public JS includes the Spanish locale for the resume editor (102 entries) and its document
  worker. It is a **different build** from CVMaker (different bundle layout), so the two lists are
  reported separately where they differ.
- Strings prove that a field or section exists in the product, not how it behaves. Nothing was seen
  logged in on Jobseeker; no private data, account or paid feature was used.
- Our model is `src/types/cv.ts` (schema v2).

## Fields

### Personal details

| Field | CVMaker | Jobseeker | CV Maker (ours) | Recommendation |
|---|---|---|---|---|
| Full name | first + last (required, validated) | given + family name | `fullName` | Keep; consider splitting only if a template needs the first name alone |
| Desired job / headline | "Puesto deseado" | `desiredJobPosition`, "Usar como título" | `headline` | Covered |
| Email, phone | yes (email validated) | yes | yes (email warning) | Covered |
| Photo | JPG/PNG, size limit, crop/zoom/rotate | yes | any image, no size limit, no crop | **Add** size/type message and optional crop (P2) |
| Address | street, postal code, city | city, zip code | one `location` string | **Add** optional postal code + city split (P2) |
| Date / place of birth | yes | `dateOfBirth`, `placeOfBirth`, combined line | no | **Add**, optional, off by default (P1) |
| Nationality | yes | yes | no | **Add**, optional (P1) |
| Driving licence | yes | `driversLicense` | no | **Add**, optional (P1) |
| Marital status | 5 options | `civilStatus`, 5 options | no | **Add**, optional, off by default (P1) |
| Gender | 2 options | yes | no | Add only behind an explicit opt-in (see Privacy) |
| Website, LinkedIn | yes | yes | generic `links[]` | Covered by `links` |
| Custom field | — | "Campo personalizado" | no | Optional (P3) |

### Sections

| Section | CVMaker | Jobseeker | Ours | Recommendation |
|---|---|---|---|---|
| Profile / summary | yes (+ AI draft) | `profile` | `summary` | Covered |
| Work experience | yes | `employment` | `experience` | Covered |
| Education | yes | `educations`, `degree` | `education` | Covered |
| Skills | yes (+ level) | `skills` **and** `qualities` ("aptitudes") + suggestions | `skills` groups with level (003) | Covered; suggestions are an AI/data feature (P3) |
| Languages | yes | levels: beginner, fluent, good, very good | free-text level | Offer a level picker (CEFR + words) that still stores text (P2) |
| Courses | recommended section | `courses` | via custom section | **Preset** (P1) |
| Certificates | recommended section | `certificates` | via custom section | **Preset** (P1) |
| Internships | recommended section | `internships` | via custom section | **Preset** (P1) |
| Projects | — | `projects` | via custom section | **Preset** (P1) |
| Hobbies / interests | — | `hobbies` | via custom section | **Preset** as a list (P1) |
| Extracurricular activities | — | `sideActivities` | via custom section | **Preset** (P2) |
| References | — | `references` + "disponibles bajo petición" | via custom section | **Preset** with a one-click "on request" line (P1) |
| Privacy / consent clause | yes ("Doy mi consentimiento…") | consent text for the application | no | **Preset** (P1, Spain/EU) |
| Signature (city, date) | — | `signatureFormat` "%{city}, %{date}" | no | Optional footer line (P3) |
| Custom sections | yes | 4 kinds: description, list, entries, skills | one kind (entries) | Add list and description kinds (P2) |
| Page break | per-section toggle | "Añadir salto de página" | no | Per-section toggle (P2) |

**Key observation:** most missing *sections* need no schema change. The existing `customSections`
(title + entries with title, subtitle, date, description) already fit courses, certificates,
internships and projects; hobbies and the privacy clause are one-line or one-paragraph entries.
What is missing is a **section library of presets** with proper titles, an "add section" picker
and per-type hints, not new data shapes. The personal extras (birth, nationality, licence, marital
status) are the only additions that change the model (additive and optional, schema v3 with a
migration).

## Flow

| Step | CVMaker / Jobseeker | Ours | Gap |
|---|---|---|---|
| Start | "How would you like to start?": from scratch / upload / pick an example | New CV, or Import from the header | **No start chooser**; "Cargar ejemplo" is hidden in Mis CVs |
| Examples | "Elige un ejemplo de CV" for a job | one sample CV | **Example library by profession** (local static data) |
| Import | PDF/DOC/DOCX, up to 10MB, progress steps, privacy note, failure messages | PDF only, heuristic, review screen | DOCX is missing (needs a dependency, which needs approval); progress/errors are thinner |
| Wizard | "Paso X de Y", next button names the next step, per-step description | step pills, Back/Next | **Name the next step** on the button; short description per step |
| Guidance | recruiter tips per section with length targets (e.g. 200-400 characters) | none | **Tips + character counter**: static text, no backend (P2) |
| Quality | strength percentage + concrete suggestions ("Añadir formación") | "6 de 6 secciones con contenido" | **Actionable suggestions** from a pure function over `CVData` (P2) |
| AI help | improve (grammar, impact, shorter, quantify, tone), write for me | none | Out of scope for local-first unless the user brings their own key (P3) |
| Autosave | Guardando / Guardado / No guardado | a check mark | Show the three states with text (P2) |
| Editor shell | inline title, Content / Design tabs, back to dashboard, Download | steps 1-9 with design as step 8 | Fine; consider separating Design |
| Design | 21 templates, 5 colours, 24 fonts, CV language (31 countries) | 13 templates, palette + custom colour, 14 fonts, es/en | Languages beyond es/en need translated tables; web fonts need a dependency decision |
| Download | PDF behind a subscription | PDF / HTML / JSON, free | Ours is ahead on openness |
| Documents | resume list, cover letters, job tracker | CV list | Cover letter and tracker are separate products (out of scope) |

## Privacy and legal notes

- Date and place of birth, gender, marital status and photo can enable discrimination and are
  discouraged in several markets. They must be **optional and off by default**; a short note should
  say they are usually not needed. Gender is the one most worth leaving out unless asked for.
- The privacy/consent clause is a Spanish/EU habit; offer it as a preset, never add it silently.

## Proposed order (each becomes its own spec and commits)

1. **P1 · Section library:** presets for courses, certificates, internships, projects, hobbies,
   references (+ "on request"), privacy clause on top of `customSections`; an "Add section" picker.
   No schema change.
2. **P1 · Optional personal data:** date/place of birth, nationality, driving licence, marital
   status, in a collapsed "additional data" block, rendered by templates only when filled.
   Schema v3 (additive) with migration and tests.
3. **P2 · Flow:** start chooser + example CVs by profession; next-step button label; autosave text.
4. **P2 · Guidance:** recruiter tips, character counters, strength suggestions.
5. **P2 · Inputs:** language level picker, photo size/type validation and crop, page-break toggle.
6. **P3 · Needs a decision:** DOCX import (dependency), web fonts (dependency), AI assistance
   (privacy and key handling), cover letters, job tracker.
