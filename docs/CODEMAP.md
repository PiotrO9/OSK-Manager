# Mapa kodu (quick context)

Krótki przewodnik: **gdzie szukać** logiki dla modułów OSK / auth / UI. Szczegóły API BFF: [API_AND_BFF.md](./API_AND_BFF.md).

## Katalogi

| Ścieżka                                                                   | Rola                                                                                                                         |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [app/components/app/](../app/components/app/)                             | Layout UI aplikacji (`AppHeader`, `ToastStack`, `NavTree`) i sekcje demo/design-system.                                      |
| [app/components/app/design-system/](../app/components/app/design-system/) | Sekcje showcase (`Section*`), `EmblaCarousel`, `AppLoader`.                                                                  |
| [app/components/shadcn/](../app/components/shadcn/)                       | Komponenty shadcn-vue (prefiks `Ui*` w szablonie).                                                                           |
| [app/components/account/](../app/components/account/)                     | Komponenty strony konta użytkownika.                                                                                         |
| [app/components/events/](../app/components/events/)                       | Komponenty dziennego widoku wydarzeń.                                                                                        |
| [app/components/manager/](../app/components/manager/)                     | Formularze i siatki modułu managera OSK.                                                                                     |
| [app/components/student/](../app/components/student/)                     | Komponenty widoków kursanta: lekcje, płatności, oceny.                                                                       |
| [app/components/vehicles/](../app/components/vehicles/)                   | Komponenty domeny pojazdów: lista, formularz, szczegóły, status dostępności i zdjęcie.                                       |
| [app/composables/](../app/composables/)                                   | Logika wielokrotnego użytku (`useApi`, `useAuthSession`, `useVehiclesApi`, …).                                               |
| [app/utils/](../app/utils/)                                               | Funkcje czyste: `apiEnvelope`, `bffEndpoint`, `availabilityTimeline` (oś 6:00–22:00 dla UI dostępności), `date`, `keyboard`. |
| [app/types/](../app/types/)                                               | Typy domenowe i normalizatory (`vehicle`, `drivingSchool`, `demoMenubar`).                                                   |
| [server/api/](../server/api/)                                             | Endpointy Nuxt BFF (proxy/mocks).                                                                                            |
| [server/utils/](../server/utils/)                                         | Domenowe grupy BFF, mock adaptery, walidacja requestow i transport upstream.                                                 |
| [shared/contracts/](../shared/contracts/)                                 | Małe kontrakty domenowe współdzielone przez `app/` i `server/`, bez zależności od UI, Nuxt runtime ani BFF adapterów.        |

## Shared contracts

`shared/contracts/` jest używane wtedy, gdy frontend i BFF muszą korzystać z
tej samej wartości domenowej albo tego samego małego typu. Przykładem jest
[courses.ts](../shared/contracts/courses.ts), czyli jedno źródło prawdy dla
`COURSE_KINDS`, `CourseKind` i `isCourseKind`.

Zasada zależności:

- `app/` może importować z `shared/`;
- `server/` może importować z `shared/`;
- `shared/` nie importuje z `app/`, `server/`, Vue, Nuxt runtime ani klientów
  HTTP.

Jeżeli kod dotyczy prezentacji, np. etykiety `Teoria (grupa)`, zostaje w
`app/types` albo przy komponencie. Jeżeli kod dotyczy obsługi requestu,
upstreamu albo mocka BFF, zostaje w `server/`. Do `shared/` trafia tylko
kontrakt, który naprawdę ma być identyczny po obu stronach.

## Pojazdy i szkoły (OSK)

- Strony: [app/pages/vehicles/](../app/pages/vehicles/), [app/pages/manager/osk/](../app/pages/manager/osk/).
- Composable strony listy: [useVehiclesListPage.ts](../app/composables/vehicles/useVehiclesListPage.ts); panel: [VehiclesListPanel.vue](../app/components/vehicles/VehiclesListPanel.vue).
- API klient: [useVehiclesApi.ts](../app/composables/vehicles/useVehiclesApi.ts), [useDrivingSchoolsApi.ts](../app/composables/schools/useDrivingSchoolsApi.ts) (`fetchDefaultDrivingSchool` dla domyślnej szkoły).
- Typy: [vehicle.ts](../app/types/vehicles/vehicle.ts), [drivingSchool.ts](../app/types/schools/drivingSchool.ts).

## Kursanci (manager)

- Strona: [app/pages/manager/students/index.vue](../app/pages/manager/students/index.vue) (lista z paginacją i filtrem po kursie, formularz rejestracji).
- Klient listy: [useStudentsApi.ts](../app/composables/students/useStudentsApi.ts); typy: [student.ts](../app/types/students/student.ts).
- BFF: [students.get.ts](../server/api/students.get.ts); mock: [mockStudentsList.ts](../server/utils/students/mockStudentsList.ts); upstream: [studentsBff.ts](../server/utils/students/studentsBff.ts).

## Instruktorzy (manager)

- Dokument kontekstowy: [MANAGER_INSTRUCTORS.md](./MANAGER_INSTRUCTORS.md).
- Strony: [app/pages/manager/instructors/](../app/pages/manager/instructors/) — `index.vue`, `new.vue`, folder **[id]/**: [`index.vue`](../app/pages/manager/instructors/[id]/index.vue) (szczegóły), [`availability.vue`](../app/pages/manager/instructors/[id]/availability.vue) (edycja tygodnia).
- Formularz rejestracji: [ManagerInstructorFormDialog.vue](../app/components/manager/instructors/ManagerInstructorFormDialog.vue).
- Dostępność tygodniowa: [ManagerInstructorAvailabilityEditor.vue](../app/components/manager/instructors/ManagerInstructorAvailabilityEditor.vue), [ManagerInstructorWeeklyAvailabilityPreview.vue](../app/components/manager/instructors/ManagerInstructorWeeklyAvailabilityPreview.vue).
- Klient listy: [useInstructorsApi.ts](../app/composables/instructors/useInstructorsApi.ts); klient harmonogramu: [useInstructorAvailabilityApi.ts](../app/composables/instructors/useInstructorAvailabilityApi.ts).
- Typy: [instructor.ts](../app/types/instructors/instructor.ts) (profil); [instructorAvailability.ts](../app/types/instructors/instructorAvailability.ts) (`WeeklyEntry`, kolejność dni); oś czasu UI: [availabilityTimeline.ts](../app/utils/schedule/availabilityTimeline.ts).
- BFF instruktorzy: [instructors.get.ts](../server/api/instructors.get.ts), [instructors/[id].get.ts](../server/api/instructors/[id].get.ts), [instructors/[id].patch.ts](../server/api/instructors/[id].patch.ts), [instructors/[id].delete.ts](../server/api/instructors/[id].delete.ts).
- BFF weekly: [weekly.get.ts](../server/api/instructors/[id]/availability/weekly.get.ts), [[day].put.ts](../server/api/instructors/[id]/availability/weekly/[day].put.ts), [[day].delete.ts](../server/api/instructors/[id]/availability/weekly/[day].delete.ts); upstream: [availabilityBff.ts](../server/utils/instructors/availabilityBff.ts); mock: [mockAvailabilityStore.ts](../server/utils/instructors/mockAvailabilityStore.ts).
- Mocki listy/szczegółu: [mockInstructorsList.ts](../server/utils/instructors/mockInstructorsList.ts).

## Auth

- [useAuthSession.ts](../app/composables/auth/useAuthSession.ts), [useLogout.ts](../app/composables/auth/useLogout.ts), [auth.global.ts](../app/middleware/auth.global.ts), [manager.ts](../app/middleware/manager.ts).
- Logowanie: [login.vue](../app/pages/login.vue).

## UI — zasada

- **Nowe widoki:** komponenty **shadcn** (`UiButton`, `UiCard`, `UiInput`, …).
- **Wyjątki / demo:** `NavTree`, `EmblaCarousel`, `AppLoader`, `AppDemoNavigationMenubar` w `app/components/app/`.

## i18n

Folder [i18n/locales/](../i18n/locales/) istnieje w repozytorium; **moduł `@nuxtjs/i18n` nie jest włączony** w `nuxt.config.ts`. Nie zakładaj `useI18n()` bez dodania modułu.
