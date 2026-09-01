# OSK Manager Frontend

Frontend aplikacji OSK Manager zbudowany na Nuxt 4, Vue 3, TypeScript i TailwindCSS.

## Purpose

Projekt dostarcza panel do obsługi szkoły jazdy: kursantów, instruktorów, pojazdów, płatności, opinii i harmonogramów. Frontend komunikuje się z backendem przez API/BFF Nitro.

## What's Included

- Nuxt 4 + Vue 3 + TypeScript
- TailwindCSS 4 with PostCSS
- shadcn-vue components under `app/components/shadcn`
- Authentication flow with login, logout, refresh token, and session management
- Manager, instructor, and student-facing application views
- BFF routes under `server/api`
- Toast notification system
- ESLint + Prettier
- Vitest for unit tests

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

| Document                                   | Description                              |
| ------------------------------------------ | ---------------------------------------- |
| [Getting Started](docs/GETTING_STARTED.md) | Setup, installation, first run           |
| [Architecture](docs/ARCHITECTURE.md)       | Project structure, auth flow, middleware |
| [Components](docs/COMPONENTS.md)           | UI components reference                  |
| [Composables](docs/COMPOSABLES.md)         | Composables API reference                |
| [Deployment](docs/DEPLOYMENT.md)           | Build and deployment                     |

## Environment Variables

| Variable               | Description                              | Default |
| ---------------------- | ---------------------------------------- | ------- |
| `NUXT_API_UPSTREAM`    | Backend API URL for Nitro BFF proxy      | `''`    |
| `NUXT_BFF_ADAPTER`     | BFF adapter: `upstream` or `mock`        | `''`    |
| `NUXT_PUBLIC_API_BASE` | Public API base URL for client calls     | `''`    |
| `NUXT_PUBLIC_SITE_URL` | Public HTTPS site URL for SEO/sitemap/OG | `''`    |

`NUXT_PUBLIC_SITE_URL` must be set to the real public HTTPS URL in build/deploy environments.

## Scripts

| Script             | Description               |
| ------------------ | ------------------------- |
| `npm run dev`      | Start development server  |
| `npm run build`    | Build for production      |
| `npm run generate` | Generate static site      |
| `npm run preview`  | Preview production build  |
| `npm run lint`     | Run ESLint                |
| `npm run format`   | Format code with Prettier |
| `npm run test`     | Run Vitest                |

## Homelab Deployment

Pushes to `master` run the frontend CI workflow. When CI passes, it triggers the homelab deployment workflow in the deploy repository.

## License

MIT
