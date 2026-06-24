# Manager Event Edit Refactor Pattern

Use this pattern when splitting the next large manager views.

- Keep the container responsible for route/query parsing, page loading, submit orchestration, navigation and toast side effects.
- Move cohesive state machines into composables named after the workflow, for example `useManagerEventEditForm`, `useManagerEventParticipants` and `useManagerEventSlots`.
- Keep API composables out of section UI components. Pass ready data through props and send intent back through emits or typed callbacks from the container.
- Preserve existing domain types from `app/types/*`; do not duplicate DTOs inside Vue components.
- Refactor one behavioral area at a time and keep route, endpoint, payload and visible UX contracts unchanged.
