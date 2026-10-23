# 014 · Optional personal data

**Status:** in progress

## What it does

A collapsed "Additional data" block in the personal step lets the user add date of birth, place of
birth, nationality, driving licence and marital status. Whatever is filled shows in the CV's contact
block, labelled in the CV's content language ("Nacionalidad: Española"); empty fields show nothing.

## Why

CVMaker and Jobseeker both offer these fields and users in several markets (Spain, Germany, Latin
America) still expect them. The gap analysis (011) listed them as P1. They are also sensitive, so the
design makes them opt-in: collapsed by default, empty by default, with a note that they are usually
not needed.

## Acceptance criteria

- [ ] `PersonalDetails` gains `birthDate`, `birthPlace`, `nationality`, `drivingLicense`, `maritalStatus` (strings, `''` by default); schema version 3 with a migration from 2 and tests.
- [ ] Older CVs and JSON files open unchanged; the fields default to empty.
- [ ] The block is collapsed by default and opens on its own when any of its fields has a value.
- [ ] It carries a short note that these data are usually not needed and can invite discrimination.
- [ ] All 13 templates show the filled fields through one shared helper; no template shows anything when they are empty.
- [ ] Labels and the marital-status options follow the CV language (es/en), independent of the UI language.
- [ ] The birth date is formatted in the CV language and an invalid or partial date is shown as typed, never as `Invalid Date`.

## Out of scope

- Gender: only worth adding behind an explicit opt-in; not now.
- Postal code / address split, a free-form custom field (P2/P3 in 011).
- Importing these fields from a PDF (the heuristics do not look for them).
