# Manager — instruktorzy (kontekst)

Moduł listy i **szczegółów** instruktora w panelu managera oraz **edycji tygodniowej dostępności** (MVP: jeden przedział godzin na dzień). BFF na tym samym originie co front; z klienta żądania idą przez shared BFF client (`requestBffData`, `bffFetch`, `$bff`).

## Trasy (pages)

| URL                                     | Plik                                                                                                            | Opis                                                                                                                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/manager/instructors`                  | [`app/pages/manager/instructors/index.vue`](../app/pages/manager/instructors/index.vue)                         | Lista wg wybranej szkoły (`schoolId`), modal rejestracji (`ManagerInstructorFormDialog`)                                                                                                                                                |
| `/manager/instructors/new`              | [`app/pages/manager/instructors/new.vue`](../app/pages/manager/instructors/new.vue)                             | Redirect na listę (z zachowaniem query)                                                                                                                                                                                                 |
| `/manager/instructors/:id`              | [`app/pages/manager/instructors/[id]/index.vue`](../app/pages/manager/instructors/[id]/index.vue)               | Szczegóły; edycja w modalu [`ManagerInstructorEditDialog`](../app/components/manager/instructors/ManagerInstructorEditDialog.vue) (bez zamykania po kliknięciu w tło) — GET/PATCH/DELETE przez shared BFF client                        |
| `/manager/instructors/:id/availability` | [`app/pages/manager/instructors/[id]/availability.vue`](../app/pages/manager/instructors/[id]/availability.vue) | Tygodniowa dostępność — [`ManagerInstructorAvailabilityEditor`](../app/components/manager/instructors/ManagerInstructorAvailabilityEditor.vue), BFF `GET/PUT/DELETE` pod `/api/instructors/:id/availability/weekly`                     |
| `/manager/instructors/:id/slots`        | [`app/pages/manager/instructors/[id]/slots.vue`](../app/pages/manager/instructors/[id]/slots.vue)               | Terminarz wolnych slotów (widok tygodniowy) — [`ManagerInstructorWeeklyCalendar`](../app/components/manager/instructors/ManagerInstructorWeeklyCalendar.vue), BFF `GET` pod `/api/instructors/:id/availability/slots?dateFrom=&dateTo=` |

Layout: `app-shell`, middleware: [`manager`](../app/middleware/manager.ts).

## API BFF (Nitro)

| Metoda   | Ścieżka                                         | Opis                                                                                                                                                                                                                                                                                                                                                                                           |
| -------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/instructors?schoolId=<uuid>`              | Lista instruktorów dla szkoły — handler [`server/api/instructors.get.ts`](../server/api/instructors.get.ts)                                                                                                                                                                                                                                                                                    |
| `GET`    | `/api/instructors/:id`                          | Szczegół instruktora — handler [`server/api/instructors/[id].get.ts`](../server/api/instructors/[id].get.ts)                                                                                                                                                                                                                                                                                   |
| `PATCH`  | `/api/instructors/:id`                          | Częściowa aktualizacja — handler [`server/api/instructors/[id].patch.ts`](../server/api/instructors/[id].patch.ts); body: opcjonalnie `firstName`, `lastName`, `experienceYears` (liczba całkowita), `qualifications`                                                                                                                                                                          |
| `GET`    | `/api/instructors/:id/availability/weekly`      | Tygodniowy wzorzec dostępności — [`server/api/instructors/[id]/availability/weekly.get.ts`](../server/api/instructors/[id]/availability/weekly.get.ts); odpowiedź: `data.weekly` — tablica wpisów `{ id, dayOfWeek, startTime, endTime }`                                                                                                                                                      |
| `PUT`    | `/api/instructors/:id/availability/weekly/:day` | Ustawienie / nadpisanie jednego dnia — [`server/api/instructors/[id]/availability/weekly/[day].put.ts`](../server/api/instructors/[id]/availability/weekly/[day].put.ts); body JSON: `{ startTime, endTime }` (`HH:mm`); `day` ∈ 0–6; odpowiedź: `data.entry`                                                                                                                                  |
| `DELETE` | `/api/instructors/:id/availability/weekly/:day` | Usunięcie wpisu dnia (brak dostępności tego dnia) — [`server/api/instructors/[id]/availability/weekly/[day].delete.ts`](../server/api/instructors/[id]/availability/weekly/[day].delete.ts); **odpowiedź BFF dla klienta** zawsze JSON: `{ success: true }` (upstream **204** / **404** jest mapowany w [`availabilityBff.ts`](../server/utils/instructors/availabilityBff.ts) na ten kształt) |
| `GET`    | `/api/instructors/:id/availability/slots`       | Sloty 60 min w zakresie dat — [`server/api/instructors/[id]/availability/slots.get.ts`](../server/api/instructors/[id]/availability/slots.get.ts); query: `dateFrom`, `dateTo` (`YYYY-MM-DD`), max 30 dni włącznie; upstream: `bffSlotsGet` w [`availabilityBff.ts`](../server/utils/instructors/availabilityBff.ts); mock: [`mockSlots.ts`](../server/utils/instructors/mockSlots.ts)         |

### Koperty odpowiedzi (weekly)

| Operacja               | `success: true` | `data` (pole w kopercie)                                                                                                                                                                                      |
| ---------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET …/weekly`         | tak             | `{ weekly: WeeklyEntry[] }` — pusta tablica = brak wzorca                                                                                                                                                     |
| `PUT …/weekly/:day`    | tak             | `{ entry: WeeklyEntry }` — zapisany / zaktualizowany wpis                                                                                                                                                     |
| `DELETE …/weekly/:day` | tak             | brak pola `data` (tylko `{ success: true }`) — patrz [`useInstructorAvailabilityApi`](../app/composables/instructors/useInstructorAvailabilityApi.ts): `deleteDay` waliduje odpowiedź bez unwrapowania `data` |

Typ `WeeklyEntry`: [`instructorAvailability.ts`](../app/types/instructors/instructorAvailability.ts) (`id`, `dayOfWeek`, `startTime`, `endTime`).

### Walidacja po stronie BFF (weekly)

- `:id` — UUID ([`isUuid`](../server/utils/vehicles/parseVehicleRequestBody.ts) w handlerach).
- `:day` — liczba całkowita **0–6** (inaczej **400**).
- `PUT` — body: `startTime`, `endTime` w formacie **`HH:mm`**; w [`[day].put.ts`](../server/api/instructors/[id]/availability/weekly/[day].put.ts) dodatkowo **`startTime < endTime`** (inaczej **400**).
- Błędy upstreamu: propagowane jako `createError` z kodem HTTP serwera i `statusMessage` / treść `error` z koperty.

### Autoryzacja (weekly + reszta modułu)

- **Strony** (`/manager/instructors/...`): middleware [`manager`](../app/middleware/manager.ts) — tylko role **MANAGER** lub **ADMIN** (stan z `useAuthSession`; rola **DEMO** nie wchodzi w panel).
- **BFF bez upstreamu:** [`requireManagerFromCookie`](../server/utils/auth/requireManagerFromCookie.ts) — JWT w ciasteczku `access_token`, role **MANAGER** / **ADMIN**.
- **BFF z upstreamem:** ten sam token w cookie; handlery wołają `resolveUpstreamBase` i proxy przekazuje **`Authorization: Bearer`** do backendu.

### Upstream i mock (profil + weekly)

- **Profil instruktora (lista, GET, PATCH):** [`instructorsBff.ts`](../server/utils/instructors/instructorsBff.ts).
- **Tygodniowa dostępność:** [`availabilityBff.ts`](../server/utils/instructors/availabilityBff.ts) — `bffWeeklyGet` / `bffWeeklyPut` / `bffWeeklyDelete` → `{upstream}/instructors/:id/availability/weekly` (i `…/weekly/:day`).
- **Mock (brak upstreamu):** po `requireManagerFromCookie` koperta `{ success: true, data: … }`. Instruktorzy: [`mockInstructorsList.ts`](../server/utils/instructors/mockInstructorsList.ts). Weekly: [`mockAvailabilityStore.ts`](../server/utils/instructors/mockAvailabilityStore.ts) (pre-seed pon–pt 8:00–16:00 przy pierwszym `GET` dla danego `:id`).

Dla odpowiedzi **z polem `data`**: composables używają [`requestBffData`](../app/composables/core/useApi.ts), które parsuje kopertę BFF przez shared client.

### Zakres vs pełne API backendu

Backend może udostępniać także **wyjątki** (np. `…/availability/exceptions`) i **compute** (np. gotowe okna na datę). **W tym repozytorium FE zaimplementowano wyłącznie wzorzec tygodniowy** (`…/weekly` + BFF opisany powyżej).

## Kształt `data` dla szczegółu (FE)

Typ domenowy: [`InstructorDetail`](../app/types/instructors/instructor.ts) — m.in. `id`, `name`, `email`, `licenseNumber`, `phone`, `qualifications`, `experience`. Normalizacja z odpowiedzi BE: [`normalizeInstructorDetail`](../app/types/instructors/instructor.ts) (obsługa m.in. `license_number`, `phone_number`, `firstName`/`lastName` zamiast `name`). Prefill formularza edycji: [`normalizeInstructorDetailForEdit`](../app/types/instructors/instructor.ts) / [`InstructorEditFormModel`](../app/types/instructors/instructor.ts).

Lista w UI używa [`useInstructorsApi`](../app/composables/instructors/useInstructorsApi.ts) (`fetchList`). Szczegóły i akcje strony są skupione w [`useManagerInstructorDetailsPage`](../app/composables/instructors/useManagerInstructorDetailsPage.ts).

## Dostępność tygodniowa (MVP)

- **Model:** jeden przedział `startTime`–`endTime` na dzień (`HH:mm`, zgodny z `<input type="time">` i backendem). Brak wpisu dla `dayOfWeek` = dzień niedostępny. **Wyjątki kalendarzowe** (exceptions) nie są częścią tego widoku.
- **`dayOfWeek`:** jak `Date.getUTCDay()` — `0` = niedziela, `1` = poniedziałek, …, `6` = sobota. UI listuje dni od poniedziałku ([`WEEK_DAYS_ORDER`](../app/types/instructors/instructorAvailability.ts)).
- **`:id` w ścieżkach API:** profil instruktora (**`InstructorProfile.id`** / to samo `id` co na liście `GET /api/instructors?schoolId=`).
- **FE — typy i logika wizualna:** [`app/types/instructors/instructorAvailability.ts`](../app/types/instructors/instructorAvailability.ts); wspólna oś graficzna **6:00–22:00:** [`app/utils/schedule/availabilityTimeline.ts`](../app/utils/schedule/availabilityTimeline.ts) (`getAvailabilityTimelineBarStyle`).
- **FE — klient HTTP:** [`useInstructorAvailabilityApi`](../app/composables/instructors/useInstructorAvailabilityApi.ts) — `fetchWeekly` / `saveDay` używają `requestBffData`; `deleteDay` waliduje odpowiedź `{ success: true }` bez `data`.
- **Komponenty:**
    - [`ManagerInstructorWeeklyAvailabilityPreview.vue`](../app/components/manager/instructors/ManagerInstructorWeeklyAvailabilityPreview.vue) — podsumowanie tygodnia na karcie szczegółów (paski + skróty dni).
    - [`ManagerInstructorAvailabilityEditor.vue`](../app/components/manager/instructors/ManagerInstructorAvailabilityEditor.vue) — pełna edycja: przełącznik dnia, godziny, pasek na żywo, zapis per dzień.
- **Routing:** szczegóły i edycja dostępności to **osobne strony** pod [`app/pages/manager/instructors/[id]/`](../app/pages/manager/instructors/[id]/): `index.vue` (szczegóły), `availability.vue` (harmonogram). **Uwaga (Nuxt):** równoległy plik `pages/.../[id].vue` i podfolder `pages/.../[id]/*.vue` tworzy zagnieżdżenie — bez `<NuxtPage />` w rodzicu podstrona nie renderuje się poprawnie; stąd szczegóły są w **`[id]/index.vue`**, a nie w `[id].vue` obok folderu.
- **Strefa czasu:** backend w specyfikacji OSK zakłada czas lokalny jak dla Polski; API zwraca same stringi `HH:mm` bez offsetu — UI nie powinien konwertować stref przy tym MVP.
- **Poza zakresem wykresu:** komponenty z [`availabilityTimeline.ts`](../app/utils/schedule/availabilityTimeline.ts) pokazują pasek na osi **6:00–22:00** (przycięcie do tego zakresu); rzeczywisty zapis `PUT` może obejmować inne godziny zgodnie z walidacją backendu.

## Zachowanie UI (szczegóły)

- Ładowanie, błąd (`role="alert"` / `status`), sukces — karta z polami; **400** i **404** z BFF mapowane na komunikat braku instruktora (spójnie z wymogiem MVP).
- Szybka zmiana `:id` w URL: guard kolejności żądań (`fetchSeq`), żeby nie nadpisywać stanu starym wynikiem.
- Edycja: przycisk „Edytuj” otwiera modal (`ManagerInstructorEditDialog`, `close-on-outside-click: false`); formularz wysyła tylko zmienione pola (`PATCH`); e‑mail tylko do odczytu; po udanym zapisie zamknięcie modala i odświeżenie danych z odpowiedzi (toast sukcesu); przy zmianie `:id` modal się zamyka.
- Link **„Dostępność”** prowadzi do `/manager/instructors/:id/availability`. Sekcja **Tygodniowa dostępność** (podgląd graficzny) ładuje `GET …/weekly` osobno — po zmianach w edytorze odśwież stronę szczegółów, aby zobaczyć aktualny podgląd.

## Zachowanie UI (edycja dostępności)

- Strona [`availability.vue`](../app/pages/manager/instructors/[id]/availability.vue): ten sam layout i middleware `manager` co reszta panelu.
- Zapis **per dzień** (`PUT` po „Zapisz”); wyłączenie dnia z istniejącym wpisem wykonuje `DELETE`. Walidacja po stronie FE: oba czasy przy aktywnym dniu, `startTime < endTime`.

## Powiązane

- Rejestracja instruktora (POST): [API_AND_BFF.md](API_AND_BFF.md) — sekcja o `POST /api/auth/register`.
- Dostępność w API klient/BFF (skrót): [API_AND_BFF.md](API_AND_BFF.md) — sekcja „Dostępność tygodniowa instruktora”.
- Composable: [COMPOSABLES.md](COMPOSABLES.md) — `useInstructorAvailabilityApi`.
- Komponenty UI: [COMPONENTS.md](COMPONENTS.md) — sekcja Manager / instruktorzy.
- Szybka mapa repo: [CODEMAP.md](CODEMAP.md).
