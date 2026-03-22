# Getting Started

This guide walks you through setting up a new project from the Frontend Starter template.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (recommended) or npm/yarn

```bash
# Install pnpm if needed
npm install -g pnpm
```

## Creating a New Project

### Option A: GitHub Template

1. Go to [nuxt-frontend-starter](https://github.com/PiotrO9/nuxt-frontend-starter)
2. Click **Use this template** → **Create a new repository**
3. Name your repository and create it
4. Clone your new repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
    cd YOUR_REPO
    ```

### Option B: Manual Clone

```bash
git clone https://github.com/PiotrO9/nuxt-frontend-starter.git my-project
cd my-project
rm -rf .git
git init
git add .
git commit -m "Initial commit from frontend-starter"
```

## Installation

```bash
pnpm install
```

## First Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the starter homepage.

## Project Customization

Before building your app, complete the [Customization checklist](CUSTOMIZATION.md):

1. Update `package.json` — name, description, repository
2. Update `nuxt.config.ts` — site name and URL
3. Remove or adapt demo pages (`design-system.vue`, `api-demo.vue`)
4. Configure environment variables for your backend
5. Update i18n locales for your branding

## Key Pages to Explore

| Route            | Purpose                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `/`              | Homepage — intro to starter, links to protected/login                                                                           |
| `/login`         | Login form — email/password, supports `?redirect=` query                                                                        |
| `/protected`     | Protected route — uses `auth` middleware, requires session                                                                      |
| `/design-system` | UI component showcase — all components, toasts, forms                                                                           |
| `/api-demo`      | API composable — `useApi` GET/POST examples. Set `NUXT_PUBLIC_API_BASE` (e.g. `https://jsonplaceholder.typicode.com`) for demo. |

## Demo Mode (No Backend)

For testing without a backend, use `loginDemo(userName)` from `useAuthSession`:

```ts
const { loginDemo } = useAuthSession();
loginDemo('Demo User');
```

This sets a local demo session. The `auth` middleware will treat it as authenticated for `/protected`.

## Next Steps

- Read [Architecture](ARCHITECTURE.md) to understand the project structure
- Follow [Customization](CUSTOMIZATION.md) to tailor the starter
- See [Deployment](DEPLOYMENT.md) when ready to ship
