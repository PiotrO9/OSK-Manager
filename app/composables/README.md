# Composables (`app/composables/`)

Nuxt auto-imports composables from this directory and nested groups via
`nuxt.config.ts` (`app/composables/**`). Keep new composables close to the
feature domain instead of adding more files to the root.

| Folder         | Responsibility                                                                          |
| -------------- | --------------------------------------------------------------------------------------- |
| `account/`     | Account/profile page state and actions.                                                 |
| `auth/`        | Session, login return path, logout helpers.                                             |
| `core/`        | Shared app-level primitives: API client, toast, meta, dark mode, validation, shortcuts. |
| `courses/`     | Course APIs, course creation form state, manager course details.                        |
| `events/`      | Event/day views, instructor events API, manager event edit flow.                        |
| `instructors/` | Instructor APIs and manager instructor screens/calendars.                               |
| `lessons/`     | Lesson booking/editing, lesson ratings, student and manager lesson flows.               |
| `payments/`    | Payments API and payment-related page logic.                                            |
| `schedule/`    | Shared schedule APIs and manager school schedule calendar state.                        |
| `schools/`     | Driving school APIs, OSK manager page, school availability/schedule APIs.               |
| `students/`    | Student APIs, manager student list/detail/create flows, student events.                 |
| `vehicles/`    | Vehicle APIs, vehicle list page state, vehicle list panel helpers.                      |

Prefer explicit imports only for types or helpers that must be referenced by
path. Runtime composables can usually rely on Nuxt auto-imports.

Broader notes: [docs/COMPOSABLES.md](../../docs/COMPOSABLES.md).
