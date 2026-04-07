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

Lista/karty pojazdów + taby managera — używana ze [useVehiclesListPage](../app/composables/useVehiclesListPage.ts).

### AppDemoNavigationMenubar, AppDemoMenubarContent

Demo paska menu (shadcn `UiMenubar*`), typ elementów: [demoMenubar.ts](../app/types/demoMenubar.ts).

## Design system (`app/components/app/design-system/`)

Sekcje `Section*` (podstrona design-system), m.in.:

- **EmblaCarousel** — karuzela Embla (nie mylić z `UiSlider`).
- **AppLoader** — loadery SVG / animacje.

## Manager (`app/components/manager/`)

Komponenty modułu OSK (formularze, siatki).

## Zasady

- **Nowe UI:** wyłącznie shadcn `Ui*` o ile komponent istnieje w rejestrze.
- **Konwencje:** Composition API, styl Tailwind, prefiks `handle` dla zdarzeń — patrz [ARCHITECTURE.md](ARCHITECTURE.md).
