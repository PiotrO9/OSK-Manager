# UI Components Reference

Komponenty są **auto-importowane** (bez ścieżek w szablonie). Szczegóły shadcn-vue: [SHADCN.md](SHADCN.md), [SHADCN_SKILLS.md](SHADCN_SKILLS.md), [MCP_SHADCN.md](MCP_SHADCN.md).

## shadcn-vue (`app/components/shadcn/`)

Prefiks **`Ui`** (np. `UiButton`, `UiCard`, `UiDialog`, `UiInput`, `UiMenubar`, …). Dodawanie: `npx shadcn-vue@latest add <nazwa>`.

## App (`app/components/app/`)

### AppHeader

Nagłówek (logo, nawigacja, logowanie/wylogowanie).

### ToastStack

Kontener toastów. Używaj **`useAppToast().addToast()`**. Renderowany w [app.vue](../app/app.vue).

### NavTree

Drzewo nawigacji (ARIA tree), eksport typu `NavTreeItem` ze [NavTree.vue](../app/components/app/NavTree.vue).

### VehiclesListPanel

Lista/karty pojazdów + taby managera — używana ze [useVehiclesListPage](../app/composables/vehicles/useVehiclesListPage.ts).

### AppDemoNavigationMenubar, AppDemoMenubarContent

Demo paska menu (shadcn `UiMenubar*`), typ elementów: [demoMenubar.ts](../app/types/demo/demoMenubar.ts).

## Design system (`app/components/app/design-system/`)

Sekcje `Section*` (podstrona design-system), m.in.:

- **EmblaCarousel** — karuzela Embla (nie mylić z `UiSlider`).
- **AppLoader** — loadery SVG / animacje.

## Manager (`app/components/manager/`)

Komponenty modułu OSK (formularze, siatki).

- **Instruktorzy** (`manager/instructors/`): formularz rejestracji (`ManagerInstructorFormDialog`), edycja / usuwanie (`ManagerInstructorEditDialog`, `ManagerInstructorDeleteDialog`), **dostępność tygodniowa** — [`ManagerInstructorAvailabilityEditor`](../app/components/manager/instructors/ManagerInstructorAvailabilityEditor.vue) (edycja + podgląd paska na osi 6:00–22:00), [`ManagerInstructorWeeklyAvailabilityPreview`](../app/components/manager/instructors/ManagerInstructorWeeklyAvailabilityPreview.vue) (podgląd na karcie szczegółów), **terminarz slotów** — [`ManagerInstructorWeeklyCalendar`](../app/components/manager/instructors/ManagerInstructorWeeklyCalendar.vue) (widok tygodniowy siatki godzin, sloty z API). Wspólna logika pozycji paska: [`availabilityTimeline.ts`](../app/utils/schedule/availabilityTimeline.ts). Opis tras, BFF i MVP: [MANAGER_INSTRUCTORS.md](./MANAGER_INSTRUCTORS.md).

## Zasady

- **Nowe UI:** wyłącznie shadcn `Ui*` o ile komponent istnieje w rejestrze.
- **Konwencje:** Composition API, styl Tailwind, prefiks `handle` dla zdarzeń — patrz [ARCHITECTURE.md](ARCHITECTURE.md).
