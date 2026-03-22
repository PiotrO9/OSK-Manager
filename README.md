# Frontend Starter

> A starter template for bootstrapping new frontend projects with Nuxt 3, Vue 3, TypeScript, and TailwindCSS.

[![Use this template](https://img.shields.io/badge/Use_this_template-Repository-blue?style=flat-square)](https://github.com/PiotrO9/nuxt-frontend-starter/generate)

## Purpose

This project **is not a production application** — it is a **base template** from which you create new projects. It includes pre-configured tooling, UI components, authentication system, and other building blocks that you can immediately leverage when starting new applications.

## How to Use as a Starter

1. **GitHub:** Click "Use this template" in the repository, or use the link above.
2. **Manual:** Clone the repo and remove git history:
    ```bash
    git clone https://github.com/PiotrO9/nuxt-frontend-starter.git my-project
    cd my-project
    rm -rf .git
    git init
    ```
3. Update `package.json` (name, description, repository) for your new project.
4. Follow the [Customization guide](docs/CUSTOMIZATION.md) to adapt the starter to your needs.

## What's Included

- Nuxt 3 + Vue 3 + TypeScript
- TailwindCSS 4 with PostCSS
- UI components (Action, Badge, Card, Dialog, Input, Loader, Skeleton, Spinner, Switch, ToastStack, etc.)
- Authentication system (login, logout, refresh token, session management)
- Dark mode with system preference detection
- i18n (English, Polish)
- Toast notification system
- Keyboard shortcuts composable
- ESLint + Prettier
- Vitest for unit tests

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

| Document                                   | Description                               |
| ------------------------------------------ | ----------------------------------------- |
| [Getting Started](docs/GETTING_STARTED.md) | Setup, installation, first run, demo mode |
| [Architecture](docs/ARCHITECTURE.md)       | Project structure, auth flow, middleware  |
| [Components](docs/COMPONENTS.md)           | UI components reference                   |
| [Composables](docs/COMPOSABLES.md)         | Composables API reference                 |
| [Customization](docs/CUSTOMIZATION.md)     | Adapting the starter for your project     |
| [Deployment](docs/DEPLOYMENT.md)           | Build and deployment                      |

## Environment Variables

| Variable               | Description             | Default                 |
| ---------------------- | ----------------------- | ----------------------- |
| `NUXT_PUBLIC_API_BASE` | Backend API base URL    | `''`                    |
| `NUXT_PUBLIC_SITE_URL` | Public site URL for SEO | `http://localhost:3000` |

## Scripts

| Script          | Description               |
| --------------- | ------------------------- |
| `pnpm dev`      | Start development server  |
| `pnpm build`    | Build for production      |
| `pnpm generate` | Generate static site      |
| `pnpm preview`  | Preview production build  |
| `pnpm lint`     | Run ESLint                |
| `pnpm format`   | Format code with Prettier |
| `pnpm test`     | Run Vitest                |

## License

MIT
