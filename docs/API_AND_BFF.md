# API klienta i BFF (Nuxt)

## Klient BFF i bazowe URL

1. **BFF Nuxt** — te same origin co front: ścieżki `/api/...` obsługiwane przez [server/api/](../server/api/).
2. **Shared client** — aplikacja kliencka używa [`createBffClient`](../app/utils/api/bffClient.ts), providowanego jako `$bff` w [`app/plugins/bff-client.ts`](../app/plugins/bff-client.ts). Domenowe composables powinny iść przez [`requestBffData`](../app/composables/core/useApi.ts), [`requestBffSuccess`](../app/composables/core/useApi.ts), [`bffFetch`](../app/composables/core/useApi.ts) albo bezpośrednio `useBffClient()` tylko gdy potrzebują niskopoziomowego zachowania.
3. **`NUXT_PUBLIC_API_BASE`** — bezpośrednio backend (Express itd.), używane tylko dla jawnie zewnętrznych wywołań przez [`externalFetch`](../app/composables/core/useApi.ts). Nowe wewnętrzne wywołania `/api/...` nie powinny omijać BFF.

Adresy BFF rozwiązuje [`resolveBffEndpoint`](../app/utils/api/bffEndpoint.ts), ale normalny kod domenowy nie powinien wołać go bezpośrednio — robi to plugin `$bff`.

## Tryb BFF: upstream vs mock

`NUXT_BFF_ADAPTER` może mieć wartość `upstream` albo `mock`. Gdy flaga jest pusta, działa kompatybilny fallback: BFF używa upstreamu, jeśli skonfigurowano `NUXT_API_UPSTREAM` lub `NUXT_PUBLIC_API_BASE`; w przeciwnym razie używa lokalnych mocków z domenowych grup `server/utils/*/`. Wymuszenie `NUXT_BFF_ADAPTER=mock` ignoruje skonfigurowany upstream, a `NUXT_BFF_ADAPTER=upstream` wymaga ustawionego URL backendu.

## Koperta odpowiedzi

Backend zwraca obiekty z polem `success` i `data` lub `error`. Parsowanie:

- [unwrapApiSuccessData](../app/utils/api/apiEnvelope.ts) — gdy oczekujesz **`data`** przy `success: true`.
- [assertBooleanSuccessEnvelope](../app/utils/api/apiEnvelope.ts) — gdy odpowiedź to tylko **`success: true/false`** (np. niektóre PATCH).

Błędy z BFF client / `useApi`: [getApiFetchErrorMessage](../app/utils/api/apiFetchErrorMessage.ts), [getApiErrorStatusCode](../app/utils/api/apiEnvelope.ts).

## `requestBffData` / `$bff` vs surowe `$fetch`

- Standardowe JSON w composables: **`requestBffData(method, path, { fallbackMessage, normalize? })`**. Funkcja unwrapuje kopertę `success/data`, mapuje błędy przez `getApiFetchErrorMessage` i korzysta ze shared `$bff`.
- Odpowiedzi bez `data`, np. niektóre `DELETE`: **`requestBffSuccess(method, path, { fallbackMessage })`**. Funkcja waliduje `{ success: true }` i mapuje błędy tak samo jak `requestBffData`.
- Reaktywne wywołania w UI: **`useApi` / `useBffApi`** + `execute()` zostają kompatybilnym wrapperem dla starszego API composable; nie rozszerzamy ich użycia w nowym kodzie domenowym.
- Pełna koperta albo nietypowy kontrakt: **`bffFetch`** albo `$bff.request`, tylko gdy `requestBffData` / `requestBffSuccess` nie pasują.
- Upload `FormData`, np. zdjęcie pojazdu i avatar profilu: również **`requestBffData` / `$bff`**. Shared client nie ustawia `Content-Type: application/json` dla `FormData`, żeby przeglądarka mogła dodać multipart boundary.
- Surowy `$fetch` jest dopuszczalny tylko w centralnej warstwie transportu (`bffClient`, `useApi`/`externalFetch`) albo w testach.

## Serwer

- Handlery: pliki w `server/api/**` (konwencja Nuxt Nitro).
- Logika wspólna: domenowe grupy w `server/utils/*/` (`*Bff.ts`, mock adaptery i store).

## Rejestracja instruktora z panelu (MANAGER / ADMIN)

Tworzenie konta instruktora w backendzie odbywa się przez **`POST /auth/register`** z rolą **`INSTRUCTOR`** i ważnym JWT wywołującego. Front wysyła żądanie na **BFF `POST /api/auth/register`**: Nitro dokłada nagłówek **`Authorization: Bearer …`** z ciasteczka `access_token`, przekazuje body do upstreamu i zwraca kopertę API (dla instruktora zwykle **HTTP 201** oraz `data` z polami m.in. `instructor`, `user`, `session`). Ciasteczka sesji zalogowanego użytkownika nie są nadpisywane odpowiedzią rejestracji — `session` w JSON służy ewentualnie do osobnego flow logowania nowego konta, a nie do automatycznej podmiany sesji w panelu.

Formularz w modalu ([`ManagerInstructorFormDialog.vue`](../app/components/manager/instructors/ManagerInstructorFormDialog.vue), strona [`app/pages/manager/instructors/index.vue`](../app/pages/manager/instructors/index.vue)) musi zebrać m.in. **`schoolId`** (UUID OSK), **`licenseNumber`** oraz **`email`**, **`password`**, **`firstName`**, **`lastName`** — bez tego upstream zwróci **400**. Komunikaty jak `Email already exists`, **403** czy **409** warto pokazać użytkownikowi na podstawie pola **`error`** przy `{ success: false }` oraz kodu HTTP (patrz [getApiFetchErrorMessage](../app/utils/api/apiFetchErrorMessage.ts), [getApiErrorStatusCode](../app/utils/api/apiEnvelope.ts)). Po sukcesie wyświetlany jest toast sukcesu ([`useAppToast`](../app/composables/core/useAppToast.ts)), modal się zamyka i następuje nawigacja na **`/manager/instructors`** bez query (żeby nie otwierać ponownie formularza z `?schoolId=`). Adres **`/manager/instructors/new`** przekierowuje na listę (z zachowaniem **`?schoolId=`** w query).

## Lista i szczegóły instruktora (GET)

- **Lista:** `GET /api/instructors?schoolId=<uuid>` — [`server/api/instructors.get.ts`](../server/api/instructors.get.ts); z klienta lista przez [`useInstructorsApi`](../app/composables/instructors/useInstructorsApi.ts) (`requestBffData`).
- **Szczegóły:** `GET /api/instructors/:id` — [`server/api/instructors/[id].get.ts`](../server/api/instructors/[id].get.ts); proxy upstream w [`instructorsBff.ts`](../server/utils/instructors/instructorsBff.ts) (`bffUpstreamInstructorsGetById` → `GET {upstream}/instructors/:id`). Odpowiedź: koperta z `data` zgodna z [`InstructorDetail`](../app/types/instructors/instructor.ts) (normalizacja: `normalizeInstructorDetail`). Widok korzysta z domenowego composable i shared BFF client.

Pełny opis tras, mocków i zachowania UI: [MANAGER_INSTRUCTORS.md](MANAGER_INSTRUCTORS.md).

## Dostępność tygodniowa instruktora (BFF)

Pełny opis: [MANAGER_INSTRUCTORS.md](MANAGER_INSTRUCTORS.md) (tabele BFF, koperty, walidacja, autoryzacja, MVP).

| Operacja              | BFF (Nuxt)                                             | Handler                                                                                 |
| --------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Lista wpisów tygodnia | `GET /api/instructors/:id/availability/weekly`         | [`weekly.get.ts`](../server/api/instructors/[id]/availability/weekly.get.ts)            |
| Upsert jednego dnia   | `PUT /api/instructors/:id/availability/weekly/:day`    | [`[day].put.ts`](../server/api/instructors/[id]/availability/weekly/[day].put.ts)       |
| Usunięcie dnia        | `DELETE /api/instructors/:id/availability/weekly/:day` | [`[day].delete.ts`](../server/api/instructors/[id]/availability/weekly/[day].delete.ts) |

**Koperta dla frontu:** `GET` / `PUT` zwracają `{ success: true, data: … }` (`data.weekly` / `data.entry`). `DELETE` z BFF zwraca **`{ success: true }` bez `data`** — upstream może używać **204 No Content**; mapowanie w [`availabilityBff.ts`](../server/utils/instructors/availabilityBff.ts).

**`dayOfWeek`:** `0` = niedziela … `6` = sobota (jak `Date.getUTCDay()`). **`:id`:** profil instruktora (ten sam identyfikator co w liście instruktorów).

Z klienta: [`useInstructorAvailabilityApi`](../app/composables/instructors/useInstructorAvailabilityApi.ts), które używa `requestBffData` dla `GET` / `PUT` oraz `requestBffSuccess` dla `DELETE` bez `data`; nie wymaga ręcznego `$fetch`. Przy **upstreamie:** [`availabilityBff.ts`](../server/utils/instructors/availabilityBff.ts). W **mocku:** [`mockAvailabilityStore.ts`](../server/utils/instructors/mockAvailabilityStore.ts) po [`requireManagerFromCookie`](../server/utils/auth/requireManagerFromCookie.ts).
