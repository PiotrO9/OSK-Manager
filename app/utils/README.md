# Utils (`app/utils/`)

Pure helpers are grouped by concern. Nuxt auto-imports nested utility folders
via `nuxt.config.ts` (`app/utils/**`), but explicit imports should still point
to the domain folder to keep dependencies easy to scan.

| Folder | Responsibility |
| --- | --- |
| `api/` | API envelopes, `$fetch` error messages, and BFF endpoint helpers. |
| `auth/` | Auth return-path and token helpers. |
| `browser/` | Browser-only utilities such as clipboard helpers. |
| `date/` | Date and weekly-calendar formatting/conversion helpers. |
| `events/` | Event normalization, attendance parsing, status labels, theory students. |
| `forms/` | Form toast helpers and form schemas. |
| `schedule/` | Schedule grid, free-window, availability, and schedule navigation helpers. |
| `schools/` | Driving school business rules. |
| `ui/` | Small UI interaction helpers. |

Prefer utilities for pure reusable functions. Stateful feature logic belongs in
`app/composables/<domain>/`.
