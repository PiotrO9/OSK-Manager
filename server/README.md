# Server (Nuxt Nitro)

Warstwa **BFF**: endpointy w `server/api/` mapują się na `/api/...` w tej samej domenie co front (chyba że skonfigurowano inaczej).

## `server/api/` (wybrane)

| Obszar  | Pliki                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth    | `auth/login.post.ts`, `auth/me.get.ts`, `auth/profile/avatar.post.ts`, `auth/logout.post.ts`, `auth/refresh.post.ts`                                                                                                                                   |
| Szkoły  | `driving-schools.get.ts`, `driving-schools.post.ts`, `driving-schools/default.get.ts`, `driving-schools/[id].patch.ts`, `driving-schools/[id].delete.ts`, `driving-schools/[id]/set-default.patch.ts`, `driving-schools/[id]/default-vehicle.patch.ts` |
| Pojazdy | `vehicles.get.ts`, `vehicles.post.ts`, `vehicles/[id].get.ts`, `vehicles/[id].patch.ts`, `vehicles/[id].delete.ts`, `vehicles/[id]/photo.post.ts`                                                                                                      |

Logika pomocnicza: domenowe grupy w `server/utils/*/` (`*Bff.ts`, mock adaptery i store).

Kontrakt klienta: [docs/API_AND_BFF.md](../docs/API_AND_BFF.md).

Żądania chronione, które BFF zatrzyma z powodu braku ciasteczka dostępu, mogą wysłać minimalne zgłoszenie do BE przez `/internal/security-events/bff-denial`. Wymaga to identycznego, serwerowego `SECURITY_LOGS_BFF_SHARED_SECRET` (co najmniej 32 znaki) po obu stronach; bez niego zgłoszenie jest pomijane, a odmowa 401 pozostaje bez zmian. Nie wystawiaj tego sekretu przez `NUXT_PUBLIC_*`.
