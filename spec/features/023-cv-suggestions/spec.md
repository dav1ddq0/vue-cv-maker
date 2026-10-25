# 023 · Actionable CV suggestions

**Status:** in progress

## What it does

Reviews the open CV and lists concrete things to improve ("Add a start date to Senior developer at
Cartograf", "Add at least one link, e.g. LinkedIn"), each with a button that takes the user to the step
where it is fixed. A score summarises how complete the CV is. P2 in the 011 gap analysis ("strength
percentage + concrete suggestions").

## Why

- Today the only feedback is "8 of 8 steps complete" and the summary length meter: a CV can be
  "complete" with a job that has no dates, no description and no contact phone.
- Competitors show a strength percentage with suggestions; ours must stay local and deterministic
  (no AI, no backend), so it is a pure function over `CVData`.

## Rules

Each rule is a check over the data; it produces at most a few suggestions and never blocks anything.
`important` ones hurt a CV in practice; `tip` ones make a good CV better.

| Id | Level | Fires when | Step |
|---|---|---|---|
| `name` | important | no full name | personal |
| `contact` | important | neither email nor phone | personal |
| `headline` | tip | no headline | personal |
| `links` | tip | no link | personal |
| `summary` | important | no summary | summary |
| `summaryShort` / `summaryLong` | tip | under 150 / over 450 characters (same bounds as the meter) | summary |
| `experience` | important | no experience entry | experience |
| `experienceDates` | important | an entry without a start date, or ending before it starts (per entry, up to 3) | experience |
| `experienceText` | tip | an entry with neither description nor highlights (per entry, up to 3) | experience |
| `experienceImpact` | tip | experience has text but no figure anywhere (a digit in a description or highlight) | experience |
| `experienceOrder` | tip | entries are not from most recent to oldest start date | experience |
| `education` | important | no education entry | education |
| `skills` | important | no skill | skills |
| `skillsFew` | tip | 1–3 skills in total | skills |
| `languages` | tip | no language | languages |

## Acceptance criteria

- [ ] `core/suggestions.ts` exports `suggest(data)` returning `{ id, level, step, params }[]`, important
      first, then in step order; and `cvScore(data)` (0–100) from the rules that passed, important
      rules weighing twice a tip.
- [ ] The Export step shows a "Review" card above the export options: the score, the suggestions with a
      "Go to <step>" button each, or a short "nothing to add" line when the list is empty.
- [ ] The Export step's detail in the desktop rail and the phone step sheet says how many suggestions
      there are ("3 suggestions"), instead of nothing.
- [ ] Texts are UI-language strings; entry names come from the CV ("Senior developer · Cartograf").
- [ ] No data model change.

## Out of scope

- Spelling or grammar checks, AI rewriting, suggestions per template.
- Dismissing individual suggestions.

## Verification

- Unit tests: each rule firing and not firing, caps per entry, ordering, score bounds and weighting.
- Component test for the card and the navigation button.
- Screenshot of the Export step with the sample CV and with an empty CV, desktop and phone.
