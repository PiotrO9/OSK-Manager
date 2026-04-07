# Composables (`app/composables/`)

Auto-import w Nuxt. Krótki indeks:

| Plik                       | Rola                                          |
| -------------------------- | --------------------------------------------- |
| `useApi.ts` / `useApiLazy` | Klient HTTP z obsługą 401 / refresh           |
| `useAppToast.ts`           | Kolejka toastów + `addToast` / `removeToast`  |
| `useAuthSession.ts`        | Sesja, login, logout, checkSession            |
| `useAuthReturnTo.ts`       | Cookie / redirect po logowaniu                |
| `useDarkMode.ts`           | Tryb jasny/ciemny                             |
| `useDrivingSchoolsApi.ts`  | API szkół jazdy + `fetchDefaultDrivingSchool` |
| `useFormValidation.ts`     | Walidacja Zod                                 |
| `useKeyboardShortcut.ts`   | Skróty klawiatury                             |
| `useLogout.ts`             | Wylogowanie z redirectem                      |
| `useManagerOskPage.ts`     | Stan strony managera OSK                      |
| `usePageMeta.ts`           | Tytuł / SEO meta                              |
| `useVehiclesApi.ts`        | API pojazdów                                  |
| `useVehiclesListPage.ts`   | Logika listy pojazdów (strona)                |

Pełniejszy opis: [docs/COMPOSABLES.md](../../docs/COMPOSABLES.md).
