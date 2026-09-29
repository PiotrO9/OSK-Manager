# End-to-end tests

Browser tests use Playwright and are split into two explicitly named suites.

## UI suite

The UI suite starts Nuxt with `NUXT_BFF_ADAPTER=mock`. It verifies browser
behavior, Nuxt middleware, role routing, cookies and mock BFF integration. It
does not claim to verify the Express backend or database.

```powershell
npm run test:e2e:ui
```

Use `npm run test:e2e:headed` only when interactive debugging is needed.
Artifacts are written to `output/playwright/` and are ignored by Git.

## Full-stack suite

The full suite starts Nuxt with `NUXT_BFF_ADAPTER=upstream`. It must only point
to a dedicated E2E backend and Supabase project. The runner deliberately rejects
environment names `dev`, `development`, `prod` and `production`.

Required environment variables:

```env
E2E_ENVIRONMENT_NAME=osk-e2e
E2E_CONFIRM_ISOLATED_ENVIRONMENT=true
E2E_API_UPSTREAM=https://api-e2e.example.test
E2E_MANAGER_EMAIL=manager001@post.pl
E2E_MANAGER_PASSWORD=<test-only-password>
```

Run the full smoke suite:

```powershell
npm run test:e2e:smoke
```

Run every full-stack scenario:

```powershell
npm run test:e2e:full
```

Never set `E2E_CONFIRM_ISOLATED_ENVIRONMENT=true` for a backend connected to
development or production data. The full suite will eventually reset and mutate
its database as part of deterministic test setup.

## Optional runner settings

- `E2E_BASE_URL` changes the frontend URL (default `http://127.0.0.1:3100`).
- `E2E_PORT` changes the local Nuxt port.
- `E2E_SKIP_WEBSERVER=true` uses an already running frontend.
- `E2E_REUSE_SERVER=true` permits Playwright to reuse the configured URL.
- `E2E_USE_PREVIEW_SERVER=true` starts an already built production preview
  instead of the default Nuxt dev server. Run `npm run build` first.

Authentication state and browser artifacts must never be committed.
