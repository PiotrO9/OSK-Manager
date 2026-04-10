# Mapa kodu (quick context)

Krótki przewodnik: **gdzie szukać** logiki dla modułów OSK / auth / UI. Szczegóły API BFF: [API_AND_BFF.md](./API_AND_BFF.md).

## Katalogi

| Ścieżka                                                                   | Rola                                                                                   |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [app/components/app/](../app/components/app/)                             | Layout UI aplikacji (`AppHeader`, `ToastStack`, lista pojazdów, design system sekcje). |
| [app/components/app/design-system/](../app/components/app/design-system/) | Sekcje showcase (`Section*`), `EmblaCarousel`, `AppLoader`.                            |
| [app/components/shadcn/](../app/components/shadcn/)                       | Komponenty shadcn-vue (prefiks `Ui*` w szablonie).                                     |
| [app/components/manager/](../app/components/manager/)                     | Formularze i siatki modułu managera OSK.                                               |
| [app/composables/](../app/composables/)                                   | Logika wielokrotnego użytku (`useApi`, `useAuthSession`, `useVehiclesApi`, …).         |
| [app/utils/](../app/utils/)                                               | Funkcje czyste: `apiEnvelope`, `bffEndpoint`, `date`, `keyboard`.                      |
| [app/types/](../app/types/)                                               | Typy domenowe i normalizatory (`vehicle`, `drivingSchool`, `demoMenubar`).             |
| [server/api/](../server/api/)                                             | Endpointy Nuxt BFF (proxy/mocks).                                                      |
| [server/utils/](../server/utils/)                                         | `*Bff.ts`, store mocków.                                                               |

## Pojazdy i szkoły (OSK)

- Strony: [app/pages/vehicles/](../app/pages/vehicles/), [app/pages/manager/osk/](../app/pages/manager/osk/).
- Composable strony listy: [useVehiclesListPage.ts](../app/composables/useVehiclesListPage.ts); panel: [VehiclesListPanel.vue](../app/components/app/VehiclesListPanel.vue).
- API klient: [useVehiclesApi.ts](../app/composables/useVehiclesApi.ts), [useDrivingSchoolsApi.ts](../app/composables/useDrivingSchoolsApi.ts) (`fetchDefaultDrivingSchool` dla domyślnej szkoły).
- Typy: [vehicle.ts](../app/types/vehicle.ts), [drivingSchool.ts](../app/types/drivingSchool.ts).

## Kursanci (manager)

- Strona: [app/pages/manager/students/index.vue](../app/pages/manager/students/index.vue) (lista z paginacją i filtrem po kursie, formularz rejestracji).
- Klient listy: [useStudentsApi.ts](../app/composables/useStudentsApi.ts); typy: [student.ts](../app/types/student.ts).
- BFF: [students.get.ts](../server/api/students.get.ts); mock: [mockStudentsList.ts](../server/utils/mockStudentsList.ts); upstream: [studentsBff.ts](../server/utils/studentsBff.ts).

## Instruktorzy (manager)

- Dokument kontekstowy: [MANAGER_INSTRUCTORS.md](./MANAGER_INSTRUCTORS.md).
- Strony: [app/pages/manager/instructors/](../app/pages/manager/instructors/) (`index.vue`, `[id].vue`, `new.vue`).
- Formularz rejestracji: [ManagerInstructorFormDialog.vue](../app/components/manager/instructors/ManagerInstructorFormDialog.vue).
- Klient listy: [useInstructorsApi.ts](../app/composables/useInstructorsApi.ts).
- Typy / normalizacja szczegółu: [instructor.ts](../app/types/instructor.ts) (`InstructorDetail`, `normalizeInstructorDetail`).
- BFF: [instructors.get.ts](../server/api/instructors.get.ts), [instructors/[id].get.ts](../server/api/instructors/[id].get.ts); mocki: [mockInstructorsList.ts](../server/utils/mockInstructorsList.ts).

## Auth

- [useAuthSession.ts](../app/composables/useAuthSession.ts), [useLogout.ts](../app/composables/useLogout.ts), [auth.global.ts](../app/middleware/auth.global.ts), [manager.ts](../app/middleware/manager.ts).
- Logowanie: [login.vue](../app/pages/login.vue).

## UI — zasada

- **Nowe widoki:** komponenty **shadcn** (`UiButton`, `UiCard`, `UiInput`, …).
- **Wyjątki / demo:** `NavTree`, `EmblaCarousel`, `AppLoader`, `AppDemoNavigationMenubar` w `app/components/app/`.

## i18n

Folder [i18n/locales/](../i18n/locales/) istnieje w repozytorium; **moduł `@nuxtjs/i18n` nie jest włączony** w `nuxt.config.ts`. Nie zakładaj `useI18n()` bez dodania modułu.
