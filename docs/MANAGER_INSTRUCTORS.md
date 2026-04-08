# Manager — instruktorzy (kontekst)

Moduł listy i **szczegółów** instruktora w panelu managera. BFF na tym samym originie co front; z klienta adresy buduje się przez [`resolveBffEndpoint`](../app/utils/bffEndpoint.ts).

## Trasy (pages)

| URL                        | Plik                                                                                    | Opis                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `/manager/instructors`     | [`app/pages/manager/instructors/index.vue`](../app/pages/manager/instructors/index.vue) | Lista wg wybranej szkoły (`schoolId`), modal rejestracji (`ManagerInstructorFormDialog`) |
| `/manager/instructors/new` | [`app/pages/manager/instructors/new.vue`](../app/pages/manager/instructors/new.vue)     | Redirect na listę (z zachowaniem query)                                                  |
| `/manager/instructors/:id` | [`app/pages/manager/instructors/[id].vue`](../app/pages/manager/instructors/[id].vue)   | Szczegóły — odczyt, stan lokalny, `$fetch` przy wejściu / zmianie `id`                   |

Layout: `app-shell`, middleware: [`manager`](../app/middleware/manager.ts).

## API BFF (Nitro)

| Metoda | Ścieżka                            | Opis                                                                                                         |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/api/instructors?schoolId=<uuid>` | Lista instruktorów dla szkoły — handler [`server/api/instructors.get.ts`](../server/api/instructors.get.ts)  |
| `GET`  | `/api/instructors/:id`             | Szczegół instruktora — handler [`server/api/instructors/[id].get.ts`](../server/api/instructors/[id].get.ts) |

- Przy ustawionym **upstream** (`resolveUpstreamBase`): proxy do backendu z nagłówkiem `Authorization: Bearer` z ciasteczka `access_token` — logika w [`server/utils/instructorsBff.ts`](../server/utils/instructorsBff.ts) (`bffUpstreamInstructorsList`, `bffUpstreamInstructorsGetById`).
- **Tryb mock** (bez upstreamu): po `requireManagerFromCookie` zwracana jest koperta `{ success: true, data: … }`; lista z [`mockInstructorsListPayload`](../server/utils/mockInstructorsList.ts), szczegół przez [`mockInstructorsGetById`](../server/utils/mockInstructorsList.ts) (wyszukanie `id` po wszystkich szkołach w pamięciowym store).

Koperta odpowiedzi jak w reszcie API: parsowanie **`data`** przez [`unwrapApiSuccessData`](../app/utils/apiEnvelope.ts).

## Kształt `data` dla szczegółu (FE)

Typ domenowy: [`InstructorDetail`](../app/types/instructor.ts) — m.in. `id`, `name`, `email`, `licenseNumber`, `phone`, `qualifications`, `experience`. Normalizacja z odpowiedzi BE: [`normalizeInstructorDetail`](../app/types/instructor.ts) (obsługa m.in. `license_number`, `phone_number`, `firstName`/`lastName` zamiast `name`).

Lista w UI używa [`useInstructorsApi`](../app/composables/useInstructorsApi.ts) (`fetchList`). **Szczegóły** celowo bez osobnego composable — fetch w stronie `[id].vue`.

## Zachowanie UI (szczegóły)

- Ładowanie, błąd (`role="alert"` / `status`), sukces — karta z polami; **400** i **404** z BFF mapowane na komunikat braku instruktora (spójnie z wymogiem MVP).
- Szybka zmiana `:id` w URL: guard kolejności żądań (`fetchSeq`), żeby nie nadpisywać stanu starym wynikiem.

## Powiązane

- Rejestracja instruktora (POST): [API_AND_BFF.md](API_AND_BFF.md) — sekcja o `POST /api/auth/register`.
- Szybka mapa repo: [CODEMAP.md](CODEMAP.md).
