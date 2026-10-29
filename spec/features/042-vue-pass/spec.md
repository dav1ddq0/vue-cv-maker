# 042 · A Vue best-practices pass over the latest components

**Status:** implemented ✅

## What it does

A review of the components written in specs 038 and 039 against the `vue-best-practices` skill found
them sound (typed `defineModel` and `defineProps`, no mutated props, derived state in `computed`,
watchers only to synchronise, one responsibility per file) and two things to tidy. Behaviour does not
change.

1. **The root stays a composition surface.** Since 039 `App.vue` held the failure state and the markup
   of the "storage could not be opened" notice. The notice is now `StartupFailed.vue`: presentation
   only, with a `reload` event, and `App.vue` keeps the `v-if` and what reloading means.
2. **The rules of a month date leave the component.** `splitMonth`, `isPlausibleYear` and `joinMonth`
   (with the 1900–2100 limits) are pure functions in `core/monthDate.ts`, tested on their own. In
   `MonthField` the `watch` that follows the model reads as two assignments instead of a
   destructuring one.

Not changed: `ref` for plain values. The skill prefers `shallowRef`; spec 028 decided against it
("negligible gain for the churn") and the project uses `ref` throughout.

## Verification

- 586 unit tests, plus the typecheck. New: `monthDate` (5 cases) and `StartupFailed` (2).
- `qa:e2e` 96/96, including the check that a browser whose storage cannot be opened shows the message
  and the reload button.
