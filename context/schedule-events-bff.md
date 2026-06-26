# BFF — terminarz lekcji i eventy instruktora (frontend)

Kontrakty warstwy Nitro. Upstream (gdy ustawiony `resolveUpstreamBase` / `NUXT_API_UPSTREAM`): proxy z nagłówkiem `Authorization: Bearer` z ciasteczka `access_token`, jak w pozostałych handlerach BFF.

Szczegóły domenowe backendu (osobne repo): plik `context/events-schedule-api.md` w projekcie API.

## `GET /api/schedule/me`

Handler: [`server/api/schedule/me.get.ts`](../server/api/schedule/me.get.ts). Upstream: [`bffScheduleMeGet`](../server/utils/schedule/scheduleBff.ts) → `GET {upstream}/schedule/me`.

### Query

| Parametr   | Wymagane | Opis                                |
| ---------- | -------- | ----------------------------------- |
| `dateFrom` | tak      | `YYYY-MM-DD`                        |
| `dateTo`   | tak      | `YYYY-MM-DD`; musi być ≥ `dateFrom` |

Walidacja: [`parseScheduleMeQuery`](../server/utils/schedule/scheduleQueryValidation.ts). Błędny format lub zakres → **400**.

### Odpowiedź

`{ success: true, data: { items: [...] } }` — elementy lekcji jak w upstream (patrz BE).

### Tryb bez upstreamu

Po [`requireStudentOrInstructorFromCookie`](../server/utils/auth/requireStudentOrInstructorFromCookie.ts) (JWT: rola **STUDENT** lub **INSTRUCTOR**): `data.items` = `[]`. Inne role / brak tokenu → **401** / **403**.

## `GET /api/schedule`

Handler: [`server/api/schedule/index.get.ts`](../server/api/schedule/index.get.ts). Upstream: [`bffScheduleManagerGet`](../server/utils/schedule/scheduleBff.ts) → `GET {upstream}/schedule`.

### Query

Uwaga: przy wariancie `studentId` wymagany jest równie? `schoolId`, aby podgląd terminarza kursanta był ograniczony do jednej OSK.

| Parametr       | Wymagane               | Opis                                        |
| -------------- | ---------------------- | ------------------------------------------- |
| `dateFrom`     | tak                    | `YYYY-MM-DD`                                |
| `dateTo`       | tak                    | `YYYY-MM-DD`                                |
| `instructorId` | dokładnie jeden z parą | UUID profilu instruktora                    |
| `studentId`    | dokładnie jeden z parą | UUID profilu kursanta (`StudentProfile.id`) |

Nie wolno podać obu ani żadnego — **400**. UUID walidowane w [`parseScheduleManagerQuery`](../server/utils/schedule/scheduleQueryValidation.ts).

### Odpowiedź

`{ success: true, data: { items: [...] } }`.

### Tryb bez upstreamu

Po `requireManagerFromCookie`: `data.items` = `[]`.

## `POST /api/events`

Handler: [`server/api/events/index.post.ts`](../server/api/events/index.post.ts). Upstream: [`bffEventsPost`](../server/utils/events/eventsBff.ts) → `POST {upstream}/events`.

### Body (JSON)

| Pole           | Wymagane     | Opis                |
| -------------- | ------------ | ------------------- |
| `instructorId` | tak          | UUID                |
| `type`         | tak          | `DRIVE` \| `THEORY` |
| `startTime`    | tak          | ISO 8601            |
| `endTime`      | tak          | ISO 8601            |
| `vehicleId`    | przy `DRIVE` | UUID pojazdu        |

### Tryb bez upstreamu

Po `requireManagerFromCookie`: syntetyczna odpowiedź sukcesu z `data.event` (m.in. losowe `id`, `createdAt`).

## Composable i strony (skrót)

| Zasób                            | Plik                                                                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Klient HTTP                      | [`app/composables/schedule/useScheduleApi.ts`](../app/composables/schedule/useScheduleApi.ts), [`useInstructorEventsApi.ts`](../app/composables/events/useInstructorEventsApi.ts) |
| Moje lekcje (STUDENT/INSTRUCTOR) | [`app/pages/my-lessons.vue`](../app/pages/my-lessons.vue), middleware [`student-or-instructor.ts`](../app/middleware/student-or-instructor.ts)                                    |
| Panel: lekcje instruktora + blok | [`app/pages/manager/instructors/[id]/schedule.vue`](../app/pages/manager/instructors/[id]/schedule.vue)                                                                           |
