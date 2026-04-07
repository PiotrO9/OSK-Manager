# Server (Nuxt Nitro)

Warstwa **BFF**: endpointy w `server/api/` mapują się na `/api/...` w tej samej domenie co front (chyba że skonfigurowano inaczej).

## `server/api/` (wybrane)

| Obszar  | Pliki                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth    | `auth/login.post.ts`, `auth/me.get.ts`, `auth/logout.post.ts`, `auth/refresh.post.ts`                                                                                                                                                                  |
| Szkoły  | `driving-schools.get.ts`, `driving-schools.post.ts`, `driving-schools/default.get.ts`, `driving-schools/[id].patch.ts`, `driving-schools/[id].delete.ts`, `driving-schools/[id]/set-default.patch.ts`, `driving-schools/[id]/default-vehicle.patch.ts` |
| Pojazdy | `vehicles.get.ts`, `vehicles.post.ts`, `vehicles/[id].get.ts`, `vehicles/[id].patch.ts`, `vehicles/[id].delete.ts`, `vehicles/[id]/photo.post.ts`                                                                                                      |

Logika pomocnicza: `server/utils/*Bff.ts`, mocki `mock*.ts`.

Kontrakt klienta: [docs/API_AND_BFF.md](../docs/API_AND_BFF.md).
