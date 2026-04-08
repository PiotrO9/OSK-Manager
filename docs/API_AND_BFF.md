# API klienta i BFF (Nuxt)

## Dwa „bazowe” URL

1. **`NUXT_PUBLIC_API_BASE`** — bezpośrednio backend (Express itd.), używane m.in. przez [useApi.ts](../app/composables/useApi.ts) dla ścieżek względnych.
2. **BFF Nuxt** — te same origin co front: ścieżki `/api/...` obsługiwane przez [server/api/](../server/api/). Z klienta buduje się je przez [resolveBffEndpoint](../app/utils/bffEndpoint.ts) (uwzględnia `NUXT_API_UPSTREAM` gdy ustawione).

## Koperta odpowiedzi

Backend zwraca obiekty z polem `success` i `data` lub `error`. Parsowanie:

- [unwrapApiSuccessData](../app/utils/apiEnvelope.ts) — gdy oczekujesz **`data`** przy `success: true`.
- [assertBooleanSuccessEnvelope](../app/utils/apiEnvelope.ts) — gdy odpowiedź to tylko **`success: true/false`** (np. niektóre PATCH).

Błędy z `$fetch` / `useApi`: [getApiFetchErrorMessage](../app/utils/apiFetchErrorMessage.ts), [getApiErrorStatusCode](../app/utils/apiEnvelope.ts).

## `useApi` vs surowe `$fetch`

- Standardowe JSON: **`useApi`** + `execute()` (retry auth przy 401).
- Upload `FormData` (np. zdjęcie pojazdu): **`$fetch`** z `credentials: 'include'` — patrz `uploadVehiclePhoto` w [useVehiclesApi.ts](../app/composables/useVehiclesApi.ts).
- Avatar profilu: BFF **`POST /api/auth/profile/avatar`** (pole `file`) — proxy pod upstream `POST /auth/profile/avatar`, odpowiedź `data.photoUrl`; po sukcesie zwykle **`useAuthSession().refreshProfileFromServer()`** (GET `/api/auth/me`). Patrz [account/index.vue](../app/pages/account/index.vue).

## Serwer

- Handlery: pliki w `server/api/**` (konwencja Nuxt Nitro).
- Logika wspólna: `server/utils/*Bff.ts`, mocki w `server/utils/mock*.ts`.

## Rejestracja instruktora z panelu (MANAGER / ADMIN)

Tworzenie konta instruktora w backendzie odbywa się przez **`POST /auth/register`** z rolą **`INSTRUCTOR`** i ważnym JWT wywołującego. Front wysyła żądanie na **BFF `POST /api/auth/register`**: Nitro dokłada nagłówek **`Authorization: Bearer …`** z ciasteczka `access_token`, przekazuje body do upstreamu i zwraca kopertę API (dla instruktora zwykle **HTTP 201** oraz `data` z polami m.in. `instructor`, `user`, `session`). Ciasteczka sesji zalogowanego użytkownika nie są nadpisywane odpowiedzią rejestracji — `session` w JSON służy ewentualnie do osobnego flow logowania nowego konta, a nie do automatycznej podmiany sesji w panelu.

Formularz w modalu ([`ManagerInstructorFormDialog.vue`](../app/components/manager/instructors/ManagerInstructorFormDialog.vue), strona [`app/pages/manager/instructors/index.vue`](../app/pages/manager/instructors/index.vue)) musi zebrać m.in. **`schoolId`** (UUID OSK), **`licenseNumber`** oraz **`email`**, **`password`**, **`firstName`**, **`lastName`** — bez tego upstream zwróci **400**. Komunikaty jak `Email already exists`, **403** czy **409** warto pokazać użytkownikowi na podstawie pola **`error`** przy `{ success: false }` oraz kodu HTTP (patrz [getApiFetchErrorMessage](../app/utils/apiFetchErrorMessage.ts), [getApiErrorStatusCode](../app/utils/apiEnvelope.ts)). Po sukcesie wyświetlany jest toast sukcesu ([`useAppToast`](../app/composables/useAppToast.ts)), modal się zamyka i następuje nawigacja na **`/manager/instructors`** bez query (żeby nie otwierać ponownie formularza z `?schoolId=`). Adres **`/manager/instructors/new`** przekierowuje na listę (z zachowaniem **`?schoolId=`** w query).

## Lista i szczegóły instruktora (GET)

- **Lista:** `GET /api/instructors?schoolId=<uuid>` — [`server/api/instructors.get.ts`](../server/api/instructors.get.ts); z klienta lista przez [`useInstructorsApi`](../app/composables/useInstructorsApi.ts) (`resolveBffEndpoint`).
- **Szczegóły:** `GET /api/instructors/:id` — [`server/api/instructors/[id].get.ts`](../server/api/instructors/[id].get.ts); proxy upstream w [`instructorsBff.ts`](../server/utils/instructorsBff.ts) (`bffUpstreamInstructorsGetById` → `GET {upstream}/instructors/:id`). Odpowiedź: koperta z `data` zgodna z [`InstructorDetail`](../app/types/instructor.ts) (normalizacja: `normalizeInstructorDetail`). Widok: [`app/pages/manager/instructors/[id].vue`](../app/pages/manager/instructors/[id].vue) (`unwrapApiSuccessData` + `$fetch`).

Pełny opis tras, mocków i zachowania UI: [MANAGER_INSTRUCTORS.md](MANAGER_INSTRUCTORS.md).
