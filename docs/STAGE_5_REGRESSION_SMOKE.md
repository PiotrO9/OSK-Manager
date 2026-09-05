# Stage 5 — regression and smoke checks

Stage 5 is the stabilization layer after the Stage 4 refactor.

The goal is not to refactor more code. The goal is to catch regressions in the most important product flows before continuing with deeper API/BFF or UI work.

## Scope

Run the dedicated smoke suite:

```powershell
npm run test:stage5
```

This command runs selected tests for:

- auth and login return flow;
- students list, details, course assignment, process status, schedule and payments;
- courses list/detail/create/instructor assignment/current-user courses;
- instructors list/detail/edit;
- events day view, instructor events API, event edit and theory event creation;
- lesson booking/edit/cancel/rating;
- payments API;
- BFF adapter boundary and mock adapter behavior.

## Full local gate

Before merging stabilization work, run:

```powershell
npm run format:check
npm run lint
npm run test:stage5
npm run test
npm run typecheck
```

## Explicitly out of scope

- Design-system refactor.
- `app/components/shadcn/date-time-picker/DateTimePicker.vue`.
- Generated API types.
- Adding a full browser E2E framework before the smoke suite is stable.

## Next recommended expansion

After this smoke suite is reliable, add browser-level checks for:

1. login;
2. manager students list and detail;
3. course detail and instructor assignment;
4. event edit;
5. lesson booking;
6. student payments.
