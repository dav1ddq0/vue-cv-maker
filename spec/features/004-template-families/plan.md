# 004 · Plan

One template per commit, in this order: `ledger`, `harbor`, `frame`. Each follows the
pattern of `meridian`/`banner`: `resolveSections`, `styleVars`, `LevelDots` with the
variant that gives it its identity, neutral inks only for fixed colours (contract test).

Defaults (accent / font): ledger `#0e7490` / Source Sans, harbor `#0369a1` / Inter,
frame `#b45309` / Georgia. Tags reuse the existing set.

The registry-driven tests (contract, render, defaults) cover every new folder
automatically; each commit adds only what is specific to the template.
