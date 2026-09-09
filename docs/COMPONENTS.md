# UI Components Reference

Komponenty są **auto-importowane** (bez ścieżek w szablonie). Szczegóły shadcn-vue: [SHADCN.md](SHADCN.md), [SHADCN_SKILLS.md](SHADCN_SKILLS.md), [MCP_SHADCN.md](MCP_SHADCN.md).

## Tokeny i reużycie

Kolorystyka, radius i font aplikacji są sterowane przez CSS custom properties w
[`app/assets/css/tailwind.css`](../app/assets/css/tailwind.css) oraz
[`app/assets/css/osk-design-tokens.css`](../app/assets/css/osk-design-tokens.css).
Nowe widoki powinny używać tokenów `bg-background`, `bg-card`, `text-foreground`,
`text-muted-foreground`, `border-border`, `bg-primary`, `text-primary` oraz skal
semantycznych `success`, `warning`, `danger`, `info`.

Nie kopiuj kolorów typu `sky-*`, `emerald-*`, `violet-*` do nowych ekranów. Jeżeli
wzorzec ma wracać w kilku miejscach, najpierw rozbuduj komponent z
`app/components/app/ui/`, a dopiero potem użyj go w widoku i w `/design-system`.

## shadcn-vue (`app/components/shadcn/`)

Prefiks **`Ui`** (np. `UiButton`, `UiCard`, `UiDialog`, `UiInput`, `UiMenubar`, …). Dodawanie: `npx shadcn-vue@latest add <nazwa>`.

## App (`app/components/app/`)

### AppHeader

Nagłówek (logo, nawigacja, logowanie/wylogowanie).

### ToastStack

Kontener toastów. Używaj **`useAppToast().addToast()`**. Renderowany w [app.vue](../app/app.vue).

### NavTree

Drzewo nawigacji (ARIA tree), eksport typu `NavTreeItem` ze [NavTree.vue](../app/components/app/NavTree.vue).

### AppDemoNavigationMenubar, AppDemoMenubarContent

Demo paska menu (shadcn `UiMenubar*`), typ elementów: [demoMenubar.ts](../app/types/demo/demoMenubar.ts).

## Account (`app/components/account/`)

Komponenty strony konta: `AccountPageHeader` i `AccountProfileCard`. Strona
[account/index.vue](../app/pages/account/index.vue) importuje je jawnie.

## Events (`app/components/events/`)

Komponenty dziennego widoku wydarzeń: nawigacja dnia, podsumowanie, panel
schedule, filtr statusu i przełącznik trybu widoku.

## Vehicles (`app/components/vehicles/`)

Komponenty domeny pojazdów:

- **VehiclesListPanel** — lista/karty pojazdów + taby managera, używana z [useVehiclesListPage](../app/composables/vehicles/useVehiclesListPage.ts).
- **VehicleForm** — formularz create/edit pojazdu.
- **VehicleDetailsContent** — widok szczegółów pojazdu.
- **VehicleAvailabilityControl**, **VehicleStatusControl**, **VehicleManagerStatusGrid** — status dostępności i szybkie akcje managera.
- **VehicleEditPhotoSection** — sekcja zdjęcia w edycji pojazdu.
- **VehicleDeleteDialog** — potwierdzenie usunięcia.

## Design system (`app/components/app/design-system/`)

Aktualna podstrona `/design-system` składa się z jednej długiej strony z nawigacją po sekcjach. To showcase komponentów używanych w aplikacji, nie osobny zestaw produkcyjnych primitive'ów:

- **DesignSystemNavigation** — lewa nawigacja przewijająca do sekcji.
- **Colors**, **Typography** — fundamenty wizualne.
- **SectionActions**, **SectionFormControls**, **SectionData**, **SectionSchedule** — wzorce operacyjne CRM.
- **SectionFoundationStates**, **SectionToasts**, **SectionDialog** — komunikaty i stany interfejsu.
- **SectionScreenPatterns** oraz komponenty z `examples/` — gotowe kompozycje ekranów OSK.

## Manager (`app/components/manager/`)

Komponenty modułu OSK (formularze, siatki).

- **Instruktorzy** (`manager/instructors/`): formularz rejestracji (`ManagerInstructorFormDialog`), edycja / usuwanie (`ManagerInstructorEditDialog`, `ManagerInstructorDeleteDialog`), **dostępność tygodniowa** — [`ManagerInstructorAvailabilityEditor`](../app/components/manager/instructors/ManagerInstructorAvailabilityEditor.vue) (edycja + podgląd paska na osi 6:00–22:00), [`ManagerInstructorWeeklyAvailabilityPreview`](../app/components/manager/instructors/ManagerInstructorWeeklyAvailabilityPreview.vue) (podgląd na karcie szczegółów), **terminarz slotów** — [`ManagerInstructorWeeklyCalendar`](../app/components/manager/instructors/ManagerInstructorWeeklyCalendar.vue) (widok tygodniowy siatki godzin, sloty z API). Wspólna logika pozycji paska: [`availabilityTimeline.ts`](../app/utils/schedule/availabilityTimeline.ts). Opis tras, BFF i MVP: [MANAGER_INSTRUCTORS.md](./MANAGER_INSTRUCTORS.md).

## Zasady

- **Nowe UI:** wyłącznie shadcn `Ui*` o ile komponent istnieje w rejestrze.
- **Konwencje:** Composition API, styl Tailwind, prefiks `handle` dla zdarzeń — patrz [ARCHITECTURE.md](ARCHITECTURE.md).
