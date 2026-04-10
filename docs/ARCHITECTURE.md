# Architecture

Struktura projektu, konwencje i przepływy. **Mapa plików:** [CODEMAP.md](CODEMAP.md). **API / BFF:** [API_AND_BFF.md](API_AND_BFF.md).

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── app/           # UI aplikacji, ToastStack, NavTree, VehiclesListPanel, design-system/
│   │   ├── shadcn/        # shadcn-vue (prefiks Ui*)
│   │   └── manager/       # moduł managera OSK
│   ├── composables/
│   ├── layouts/
│   ├── middleware/        # auth.global.ts, manager.ts
│   ├── pages/
│   ├── types/
│   ├── utils/
│   ├── app.vue
│   └── error.vue
├── server/
│   ├── api/               # BFF Nitro
│   └── utils/
├── i18n/locales/          # pliki JSON (moduł i18n opcjonalny — patrz niżej)
├── docs/
└── nuxt.config.ts
```

## Pages & Routes (wybrane)

| Route                                   | Plik                                              | Opis                                     |
| --------------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| `/`                                     | `pages/index.vue`                                 | Pulpit                                   |
| `/login`                                | `pages/login.vue`                                 | Logowanie                                |
| `/design-system`                        | `pages/design-system.vue`                         | Podgląd UI                               |
| `/vehicles`                             | `pages/vehicles/index.vue`                        | Lista pojazdów                           |
| `/account`                              | `pages/account/index.vue`                         | Moje konto, avatar                       |
| `/manager/osk`                          | `pages/manager/osk/index.vue`                     | Zarządzanie OSK                          |
| `/manager/instructors`                  | `pages/manager/instructors/index.vue`             | Lista instruktorów (szkoła, rejestracja) |
| `/manager/instructors/:id`              | `pages/manager/instructors/[id]/index.vue`        | Szczegóły instruktora (odczyt)           |
| `/manager/instructors/:id/availability` | `pages/manager/instructors/[id]/availability.vue` | Edycja tygodniowej dostępności           |

Szerszy kontekst modułu: [MANAGER_INSTRUCTORS.md](MANAGER_INSTRUCTORS.md).

## Authentication Flow

1. **Sesja** — `useAuthSession().checkSession()` woła `GET` auth/me (przez `apiBase` lub proxy).
2. **Logowanie** — `login(email, password)` → `POST` auth/login.
3. **Odświeżanie** — przy 401 `useApi` próbuje refresh, potem redirect na `/login`.
4. **Wylogowanie** — `logout()` czyści sesję.

## Middleware

- **`auth.global.ts`** — globalna ochrona tras (sesja / redirect).
- **`manager.ts`** — dodatkowa rola managera tam, gdzie ustawione w `definePageMeta`.

## Layouts

- **`default`** — klasyczny header + main + footer (m.in. login).
- **`app-shell`** — aplikacja z panelem bocznym (np. pulpity, pojazdy).

## Configuration (`nuxt.config.ts`)

- **Modules:** `@nuxt/eslint`, `@nuxt/icon`, `@nuxtjs/seo`, `shadcn-nuxt`.
- **Components:** `~/components/app`, `~/components/app/design-system`, `~/components/shadcn`, `~/components/manager` (bez prefiksu ścieżki).
- **Imports:** `app/composables`, `app/utils` (auto-import).
- **Runtime:** `apiUpstream`, `public.apiBase`, `public.siteUrl`, `public.demoMockLogin`.

## Conventions

- **Composition API**, **Tailwind** do stylowania.
- **Zdarzenia:** prefiks `handle` (np. `handleClick`).
- **Dostępność:** `aria-*`, obsługa klawiatury tam, gdzie interakcja.

## Utilities (wybrane)

| Plik                   | Eksporty                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| `utils/apiEnvelope.ts` | `unwrapApiSuccessData`, `assertBooleanSuccessEnvelope`, `getApiErrorStatusCode` |
| `utils/bffEndpoint.ts` | `resolveBffEndpoint`                                                            |
| `utils/date.ts`        | `formatDate`                                                                    |
| `utils/keyboard.ts`    | `isEnterOrSpaceKey`                                                             |

## i18n

W repo są pliki w **`i18n/locales/`**, ale **`@nuxtjs/i18n` nie jest obecnie w `modules`** — `useI18n()` nie jest dostępny bez dodania modułu i konfiguracji.
