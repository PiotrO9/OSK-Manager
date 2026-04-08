# Documentation Index

This project is a **starter template** — a base for bootstrapping new frontend applications, not a production app.

## Documents

| File                                             | Purpose                                                    |
| ------------------------------------------------ | ---------------------------------------------------------- |
| [GETTING_STARTED.md](GETTING_STARTED.md)         | Setup, installation, first run, demo mode                  |
| [ARCHITECTURE.md](ARCHITECTURE.md)               | Project structure, auth flow, middleware, config           |
| [CODEMAP.md](CODEMAP.md)                         | Szybka mapa folderów (OSK, auth, UI)                       |
| [API_AND_BFF.md](API_AND_BFF.md)                 | `resolveBffEndpoint`, koperta API, `useApi` vs `$fetch`    |
| [MANAGER_INSTRUCTORS.md](MANAGER_INSTRUCTORS.md) | Moduł instruktorów: trasy, BFF lista/szczegół, typy, mocki |
| [COMPONENTS.md](COMPONENTS.md)                   | UI components reference (props, slots, events)             |
| [COMPOSABLES.md](COMPOSABLES.md)                 | Composables API reference                                  |
| [CUSTOMIZATION.md](CUSTOMIZATION.md)             | Checklist for adapting starter to a new project            |
| [DEPLOYMENT.md](DEPLOYMENT.md)                   | Build, env vars, platform-specific deployment              |
| [SHADCN.md](SHADCN.md)                           | shadcn-vue: skąd brać UI, CLI, katalog `shadcn/`           |
| [SHADCN_SKILLS.md](SHADCN_SKILLS.md)             | Pakiet skilli `.agents/skills/shadcn/` + użycie z Vue      |
| [MCP_SHADCN.md](MCP_SHADCN.md)                   | MCP shadcn w Cursorze (`.cursor/mcp.json`)                 |

## Quick Reference

- **Stack:** Nuxt 3, Vue 3, TypeScript, TailwindCSS
- **UI (shadcn-vue):** `app/components/shadcn/` — komponenty z rejestru, prefiks `Ui`; zasady repo: [SHADCN.md](SHADCN.md); **skille AI:** [SHADCN_SKILLS.md](SHADCN_SKILLS.md); MCP: [MCP_SHADCN.md](MCP_SHADCN.md)
- **Components:** `app/components/app/`, `app/components/shadcn/` (`Ui*`), `app/components/manager/`
- **Composables:** `useAuthSession`, `useApi`, `useAppToast`, `useDarkMode`, `useFormValidation`, `usePageMeta`, `useLogout`, `useKeyboardShortcut`, `useVehiclesApi`, `useDrivingSchoolsApi`, `useVehiclesListPage`
- **Auth API:** `/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/logout` (via `NUXT_PUBLIC_API_BASE`)
- **Conventions:** Composition API, Tailwind only, `handle` prefix for events, early returns
- **Indeks w repo:** [app/composables/README.md](../app/composables/README.md), [server/README.md](../server/README.md)
