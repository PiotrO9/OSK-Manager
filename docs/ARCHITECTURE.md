# Architecture

This document describes the project structure, conventions, and how the application works.

## Project Structure

```
frontend-starter/
├── app/
│   ├── components/
│   │   ├── app/              # App-specific components
│   │   │   ├── AppHeader.vue  # Main header with nav, dark mode, auth
│   │   │   ├── AppFooter.vue # Footer with tagline
│   │   │   └── LanguageSwitch.vue  # i18n locale dropdown
│   │   └── ui/               # Reusable UI components (see COMPONENTS.md)
│   ├── composables/          # Vue composables (see COMPOSABLES.md)
│   ├── layouts/
│   │   └── default.vue       # Main layout: header, main slot, footer
│   ├── middleware/
│   │   └── auth.ts           # Protects routes, redirects to /login
│   ├── pages/                # File-based routing
│   ├── utils/                # Pure utility functions
│   ├── app.vue               # Root: layout, ToastStack, body classes
│   └── error.vue             # Error page
├── assets/
│   └── css/
│       └── tailwind.css     # Tailwind entry
├── i18n/
│   └── locales/             # en.json, pl.json
├── docs/                    # Documentation
├── nuxt.config.ts
├── tailwind.config.ts
└── package.json
```

## Pages & Routes

| Route            | File                | Purpose                                       |
| ---------------- | ------------------- | --------------------------------------------- |
| `/`              | `index.vue`         | Homepage, intro to starter features           |
| `/login`         | `login.vue`         | Login form, redirect support via `?redirect=` |
| `/protected`     | `protected.vue`     | Protected page (uses `auth` middleware)       |
| `/design-system` | `design-system.vue` | UI component showcase                         |
| `/api-demo`      | `api-demo.vue`      | `useApi` composable examples (GET/POST)       |

## Authentication Flow

1. **Session check** — `useAuthSession().checkSession()` calls `GET /api/auth/me` (or `NUXT_PUBLIC_API_BASE/auth/me`).
2. **Login** — `login(email, password)` calls `POST /api/auth/login`, stores session from response.
3. **Token refresh** — On 401, `useApi` calls `POST /api/auth/refresh`, retries request, or redirects to `/login`.
4. **Logout** — `logout()` calls `POST /api/auth/logout`, clears session.
5. **Demo mode** — `loginDemo(userName)` sets a local demo session without backend (for testing).

### Expected Backend API

| Endpoint        | Method | Purpose                                         |
| --------------- | ------ | ----------------------------------------------- |
| `/auth/login`   | POST   | `{ email, password }` → `{ accessToken, user }` |
| `/auth/me`      | GET    | Returns `{ user, accessToken? }` (cookie-based) |
| `/auth/refresh` | POST   | Returns `{ accessToken }`                       |
| `/auth/logout`  | POST   | Clears session cookie                           |

## Middleware

### `auth`

- **File:** `app/middleware/auth.ts`
- **Usage:** `definePageMeta({ middleware: ['auth'] })`
- **Behavior:** If not authenticated, runs `checkSession()`. If no session, redirects to `/login?redirect=<currentPath>`.

## Layout

- **default.vue** — `AppHeader`, `<main>` with slot, `AppFooter`.
- **app.vue** — Wraps `NuxtLayout` + `NuxtPage`, renders `ToastStack` globally. Sets `dark` class on `<html>` for dark mode.

## Configuration

### nuxt.config.ts

- **Modules:** `@nuxt/eslint`, `@nuxt/icon`, `@nuxtjs/seo`, `@nuxtjs/i18n`
- **i18n:** `no_prefix`, lazy locales (en, pl), `langDir: 'locales'`
- **Components:** Auto-import from `app/components/app` and `app/components/ui` (no prefix)
- **Imports:** `app/composables`, `app/utils` auto-imported
- **Runtime:** `apiBase`, `siteUrl` from env

### tailwind.config.ts

- **darkMode:** `'class'` (toggle via `<html class="dark">`)
- **content:** `app/`, `components/`, `layouts/`, `pages/`, `plugins/`

## Conventions

- **Composition API** — All components use `<script setup>` and Composition API
- **Tailwind** — Styling via Tailwind classes only
- **Event handlers** — Prefixed with `handle` (e.g. `handleClick`, `handleKeyDown`)
- **Early returns** — Prefer early returns for readability
- **Accessibility** — Use `tabindex`, `aria-label`, keyboard handlers on interactive elements

## Utilities

| File                | Exports                       | Purpose                                      |
| ------------------- | ----------------------------- | -------------------------------------------- |
| `utils/jwt.ts`      | `decodeJwt`, `isTokenExpired` | JWT parsing and expiry check                 |
| `utils/date.ts`     | `formatDate`                  | Date formatting: `short`, `long`, `relative` |
| `utils/keyboard.ts` | `isEnterOrSpaceKey`           | Check Enter/Space for activation             |

## i18n

- **Locales:** `en`, `pl` (lazy-loaded from `i18n/locales/`)
- **Strategy:** `no_prefix` — no `/en/` or `/pl/` in URL
- **Usage:** `useI18n()`, `useLocalePath()` for links
