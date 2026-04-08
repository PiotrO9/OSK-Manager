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
