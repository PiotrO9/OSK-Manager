# BFF — kursanci (frontend)

Kontrakty warstwy Nitro dla modułu kursantów w tym repozytorium. Upstream (gdy ustawiony `resolveUpstreamBase`): proxy z `Authorization: Bearer` z ciasteczka `access_token`, jak w pozostałych handlerach BFF.

## Szczegóły kursanta — pole `notes`

W odpowiedzi `GET /api/students/:userId?schoolId=<uuid>` pole `data.notes` jest typu `string | null` (notatka globalna profilu; normalizacja w [`app/types/students/student.ts`](../app/types/students/student.ts) w `normalizeStudentDetail`).

## `PATCH /api/students/:userId`

Handler: [`server/api/students/[userId]/index.patch.ts`](../server/api/students/[userId]/index.patch.ts). Proxy upstream: [`bffUpstreamUpdateStudentNotes`](../server/utils/students/studentsBff.ts) → `PATCH {upstreamBase}/students/:userId`.

### Treść żądania (JSON)

| Pole    | Wymagane                  | Opis                                                                                                                           |
| ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `notes` | tak (klucz musi wystąpić) | `string` lub `null`. Pusty string po `trim` traktowany jak `null`. Maks. **5000** znaków po normalizacji BFF; powyżej **400**. |

Brak klucza `notes` w obiekcie JSON → **400**, komunikat: pole wymagane.

### Walidacja routingu

- `:userId` — niepusty, poprawny UUID; w przeciwnym razie **400**.

### Odpowiedź sukcesu

Koperta jak w reszcie API: `{ success: true, data: … }`.

- **Tryb mock** (brak upstreamu): po `requireManagerFromCookie`, `data` = `{ userId: string, notes: string | null }`. Zapis w pamięci: [`mockUpdateStudentNotes`](../server/utils/students/mockStudentsList.ts) (klucz po `userId` kursanta). Brak kursanta w mocku → **404**.
- **Upstream**: `data` przekazywane z odpowiedzi backendu (jak w kopercie upstream).

### UI

Edycja notatki na stronie szczegółów: [`app/pages/manager/students/[userId].vue`](../app/pages/manager/students/[userId].vue), komponent [`ManagerStudentNotes.vue`](../app/components/manager/students/ManagerStudentNotes.vue).

## Terminarz lekcji (podgląd biura)

Na tej samej stronie szczegółów (z wczytanym kursantem) wyświetlany jest **tygodniowy** terminarz lekcji: żądanie `GET /api/schedule?studentId=<uuid>&schoolId=<uuid>&dateFrom=&dateTo=` — **`studentId`** to **`id` profilu kursanta** z odpowiedzi szczegółów (`StudentDetail.id`), nie `userId` z ścieżki URL; **`schoolId`** pochodzi z query strony szczegółów.

Opis BFF: [schedule-events-bff.md](./schedule-events-bff.md).
