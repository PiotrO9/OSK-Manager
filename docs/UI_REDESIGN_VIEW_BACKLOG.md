# OSK Manager UI Redesign View Backlog

Ten backlog porzadkuje widoki OSK Managera do iteracyjnego redesignu UI. Lista bazuje na aktualnych plikach w `app/pages`.

Dokument sluzy do planowania kolejnosci prac. Nie jest lista zmian funkcjonalnych.

Szczegolowa lista kontrolna dla kazdego widoku jest w `UI_REDESIGN_VIEW_SPECS.md`.

Tracker wdrozenia z linkami do zaakceptowanych mockupow PNG jest w `UI_REDESIGN_IMPLEMENTATION_TODO.md`.

Mockupy w `docs/ui-redesign-mockups/` sa wzorcem UI. Nie sa zrodlem prawdy o danych, akcjach ani funkcjach. Jezeli mockup pokazuje element, ktorego aktualny widok/API nie ma, wpisz brak w trackerze i nie mockuj go w aplikacji.

## Legenda

Role:

- `manager` - widoki zarzadcze OSK;
- `student` - widoki kursanta;
- `instructor` - widoki instruktora;
- `shared` - widoki wspolne dla kilku rol;
- `public` - widoki poza panelem aplikacji;
- `internal` - widoki pomocnicze dla developmentu.

Typy:

- `dashboard`
- `list`
- `details`
- `form`
- `schedule`
- `booking`
- `account`
- `auth`
- `dev`

Priorytety:

- `P0` - foundation albo pierwszy widok wzorcowy;
- `P1` - najwazniejsze widoki operacyjne;
- `P2` - pozostale widoki robocze;
- `P3` - dopracowanie, polish, mniej krytyczne obszary.

## Etap 1: Foundation

Foundation nie powinien byc osobnym wielkim refactorem. Komponenty maja powstawac przy pierwszych realnych widokach, glownie przy `manager/students/index.vue`.

| Element               | Priorytet | Wzorce                                       | Uwagi                                                                                                   |
| --------------------- | --------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Shared page structure | P0        | `PageHeader`                                 | Wspolny naglowek dla list, szczegolow, harmonogramow i formularzy.                                      |
| Shared status display | P0        | `StatusBadge`                                | Jedno miejsce dla statusow: aktywny, nieaktywny, zaplanowany, zakonczony, anulowany, oplacony, zalegly. |
| Shared states         | P0        | `EmptyState`, `LoadingState`, `ErrorState`   | Stany powinny byc stabilne layoutowo i spojne wizualnie.                                                |
| Shared list shell     | P0        | `FilterBar`, `DataTableShell`, `ActionGroup` | Pierwsze uzycie przy liscie kursantow.                                                                  |

## Etap 2: Manager Core

Najpierw przerobic rdzen pracy managera. Te widoki zdefiniuja wiekszosc wzorcow uzywanych dalej.

| Kolejnosc | Widok                                          | Rola    | Typ      | Priorytet | Wzorce                                                                                                                         |
| --------- | ---------------------------------------------- | ------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1         | `app/pages/manager/students/index.vue`         | manager | list     | P0        | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup`, `EmptyState`, `LoadingState`, `ErrorState`          |
| 2         | `app/pages/manager/students/[userId].vue`      | manager | details  | P1        | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `DataTableShell`, `StatusBadge`, `EmptyState`, `LoadingState`, `ErrorState` |
| 3         | `app/pages/manager/instructors/index.vue`      | manager | list     | P1        | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup`, `EmptyState`, `LoadingState`, `ErrorState`          |
| 4         | `app/pages/manager/instructors/[id]/index.vue` | manager | details  | P1        | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `ScheduleLayout`, `StatusBadge`, `ActionGroup`                              |
| 5         | `app/pages/manager/schedule/index.vue`         | manager | schedule | P1        | `PageHeader`, `FilterBar`, `ScheduleLayout`, `StatusBadge`, `EmptyState`, `LoadingState`, `ErrorState`                         |

## Etap 3: Operational Views

Po Manager Core przeniesc styl i komponenty na pozostale widoki operacyjne.

| Widok                                                 | Rola               | Typ      | Priorytet | Wzorce                                                                                          |
| ----------------------------------------------------- | ------------------ | -------- | --------- | ----------------------------------------------------------------------------------------------- |
| `app/pages/manager/courses/index.vue`                 | manager            | list     | P2        | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup`, `EmptyState`         |
| `app/pages/manager/courses/[id].vue`                  | manager            | details  | P2        | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `StatusBadge`, `FormSection`, `ActionGroup`  |
| `app/pages/manager/courses/new.vue`                   | manager            | form     | P2        | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState`                                        |
| `app/pages/vehicles/index.vue`                        | manager            | list     | P2        | `PageHeader`, `DataTableShell`, `EntitySummaryCard`, `StatusBadge`, `ActionGroup`, `EmptyState` |
| `app/pages/vehicles/[id]/index.vue`                   | manager            | details  | P2        | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `StatusBadge`, `ActionGroup`                 |
| `app/pages/vehicles/[id]/edit.vue`                    | manager            | form     | P2        | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState`                                        |
| `app/pages/vehicles/new.vue`                          | manager            | form     | P2        | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState`                                        |
| `app/pages/manager/osk/index.vue`                     | manager            | list     | P2        | `PageHeader`, `DataTableShell`, `EntitySummaryCard`, `StatusBadge`, `ActionGroup`, `EmptyState` |
| `app/pages/manager/osk/new.vue`                       | manager            | form     | P2        | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState`                                        |
| `app/pages/manager/reviews/index.vue`                 | manager            | list     | P2        | `PageHeader`, `FilterBar`, `SummaryStrip`, `DataTableShell`, `StatusBadge`, `EmptyState`        |
| `app/pages/events/index.vue`                          | manager/instructor | schedule | P2        | `PageHeader`, `FilterBar`, `ScheduleLayout`, `StatusBadge`, `EmptyState`, `ActionGroup`         |
| `app/pages/manager/events/[id]/edit.vue`              | manager            | form     | P2        | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState`                                        |
| `app/pages/manager/lessons/[id]/edit.vue`             | manager            | form     | P2        | `PageHeader`, `FormSection`, `EntitySummaryCard`, `ActionGroup`, `ErrorState`                   |
| `app/pages/manager/instructors/[id]/availability.vue` | manager            | schedule | P2        | `PageHeader`, `ScheduleLayout`, `StatusBadge`, `EmptyState`, `ActionGroup`                      |
| `app/pages/manager/instructors/[id]/schedule.vue`     | manager            | schedule | P2        | `PageHeader`, `ScheduleLayout`, `StatusBadge`, `ActionGroup`, `EmptyState`                      |
| `app/pages/manager/instructors/[id]/slots.vue`        | manager            | schedule | P2        | `PageHeader`, `ScheduleLayout`, `StatusBadge`, `EmptyState`, `LoadingState`                     |
| `app/pages/manager/instructors/new.vue`               | manager            | form     | P2        | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState`                                        |

## Etap 4: Student/Instructor Views

Te widoki maja korzystac z komponentow wypracowanych w etapach 1-3, ale z mniejsza gestoscia niz widoki managera.

| Widok                       | Rola               | Typ      | Priorytet | Wzorce                                                                                  |
| --------------------------- | ------------------ | -------- | --------- | --------------------------------------------------------------------------------------- |
| `app/pages/my-lessons.vue`  | student/instructor | schedule | P2        | `PageHeader`, `ScheduleLayout`, `StatusBadge`, `EmptyState`, `ActionGroup`              |
| `app/pages/book-lesson.vue` | student            | booking  | P2        | `PageHeader`, `FilterBar`, `ScheduleLayout`, `EmptyState`, `LoadingState`, `ErrorState` |
| `app/pages/my-courses.vue`  | student/instructor | list     | P2        | `PageHeader`, `DataTableShell`, `EntitySummaryCard`, `StatusBadge`, `EmptyState`        |
| `app/pages/my-payments.vue` | student            | list     | P2        | `PageHeader`, `SummaryStrip`, `DataTableShell`, `StatusBadge`, `EmptyState`             |
| `app/pages/my-reviews.vue`  | instructor         | list     | P2        | `PageHeader`, `DataTableShell`, `StatusBadge`, `EmptyState`                             |

## Etap 5: Shared/Polish

Na koncu dopracowac widoki wspolne, shell i obszary pomocnicze.

| Widok                         | Rola     | Typ       | Priorytet | Wzorce                                                                            |
| ----------------------------- | -------- | --------- | --------- | --------------------------------------------------------------------------------- |
| `app/pages/index.vue`         | shared   | dashboard | P2        | `PageHeader`, `SummaryStrip`, `ScheduleLayout`, `EntitySummaryCard`, `EmptyState` |
| `app/pages/account/index.vue` | shared   | account   | P3        | `PageHeader`, `DetailLayout`, `FormSection`, `EntitySummaryCard`, `ActionGroup`   |
| `app/pages/login.vue`         | public   | auth      | P3        | `FormSection`, `ErrorState`, `ActionGroup`                                        |
| `app/pages/design-system.vue` | internal | dev       | P3        | Dokumentacja nowych komponentow UI po ich wdrozeniu.                              |
| `app/layouts/app-shell.vue`   | shared   | shell     | P3        | Sprawdzic dopiero po wdrozeniu foundation i kilku widokow.                        |

## Pokrycie `app/pages`

Backlog obejmuje wszystkie aktualne widoki:

- `app/pages/account/index.vue`
- `app/pages/book-lesson.vue`
- `app/pages/design-system.vue`
- `app/pages/events/index.vue`
- `app/pages/index.vue`
- `app/pages/login.vue`
- `app/pages/manager/courses/[id].vue`
- `app/pages/manager/courses/index.vue`
- `app/pages/manager/courses/new.vue`
- `app/pages/manager/events/[id]/edit.vue`
- `app/pages/manager/instructors/[id]/availability.vue`
- `app/pages/manager/instructors/[id]/index.vue`
- `app/pages/manager/instructors/[id]/schedule.vue`
- `app/pages/manager/instructors/[id]/slots.vue`
- `app/pages/manager/instructors/index.vue`
- `app/pages/manager/instructors/new.vue`
- `app/pages/manager/lessons/[id]/edit.vue`
- `app/pages/manager/osk/index.vue`
- `app/pages/manager/osk/new.vue`
- `app/pages/manager/reviews/index.vue`
- `app/pages/manager/schedule/index.vue`
- `app/pages/manager/students/[userId].vue`
- `app/pages/manager/students/index.vue`
- `app/pages/my-courses.vue`
- `app/pages/my-lessons.vue`
- `app/pages/my-payments.vue`
- `app/pages/my-reviews.vue`
- `app/pages/vehicles/[id]/edit.vue`
- `app/pages/vehicles/[id]/index.vue`
- `app/pages/vehicles/index.vue`
- `app/pages/vehicles/new.vue`

## Pierwsze zadanie UI po dokumentacji

Pierwsze realne zadanie redesignu:

```text
Przerob app/pages/manager/students/index.vue zgodnie z:
- docs/UI_REDESIGN_GUIDELINES.md
- docs/UI_COMPONENT_PATTERNS.md
- docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md
- docs/UI_REDESIGN_IMPLEMENTATION_TODO.md
- docs/UI_REDESIGN_VIEW_BACKLOG.md
- docs/UI_REDESIGN_VIEW_SPECS.md

Nie zmieniaj logiki biznesowej, routingu, middleware, kontraktow API/BFF ani flow uzytkownika.
Uzyj mockupow:
- docs/ui-redesign-mockups/07-manager-students-list-desktop.png
- docs/ui-redesign-mockups/07-manager-students-list-mobile.png

Mockupy traktuja jako wzorzec wygladu. Nie dodawaj fikcyjnych danych ani akcji, ktorych nie ma w aktualnym widoku.
Najpierw dodaj lub wykorzystaj foundation: PageHeader, FilterBar, DataTableShell, StatusBadge, ActionGroup, EmptyState.
Zachowaj dodawanie kursanta, przypisanie do kursu, filtrowanie po OSK/kursie, paginacje oraz stany loading/empty/error.
```
