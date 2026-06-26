# Server Utils Layout

Server helpers are grouped by responsibility:

- `auth/` - auth upstream calls, cookie/session guards, avatar mock store.
- `courses/` - course BFF adapters, course mock data, course request parsers.
- `events/` - event BFF adapters and event mock adapters.
- `instructors/` - instructor BFF adapters, availability, slots, instructor mock data.
- `lessons/` - lesson booking/edit/rating BFF adapters.
- `payments/` - payment upstream adapters.
- `ratings/` - lesson rating adapters and rating mocks.
- `schedule/` - schedule adapters, schedule query validation, school slot filtering.
- `schools/` - driving school adapters and driving school mock store.
- `students/` - student adapters and student mock data.
- `upstream/` - shared upstream request transport and tests.
- `validation/` - shared request/query/route parameter validation and tests.
- `vehicles/` - vehicle adapters, vehicle mock store, vehicle request parsers.
- `tests/` - cross-domain server utility tests.

Keep endpoint handlers in `server/api/*` thin: validate the request, choose the BFF adapter, then delegate to the relevant grouped utility.
