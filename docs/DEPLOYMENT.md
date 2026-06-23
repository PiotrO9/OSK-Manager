# Deployment

Wytyczne deploymentu frontendu OSK Manager.

## Build

```bash
npm run build
```

Output trafia do katalogu `.output/`.

## Static Generation

Jeśli aplikacja ma być generowana statycznie:

```bash
npm run generate
```

Output trafia do `.output/public/`.

## Environment Variables

Ustaw w środowisku deploymentu:

| Variable               | Required           | Description                              |
| ---------------------- | ------------------ | ---------------------------------------- |
| `NUXT_API_UPSTREAM`    | Yes for BFF proxy  | Backend API URL used by Nitro server     |
| `NUXT_BFF_ADAPTER`     | No                 | `upstream` or `mock`; empty uses fallback |
| `NUXT_PUBLIC_API_BASE` | Yes if client calls API directly | Public API base URL              |
| `NUXT_PUBLIC_SITE_URL` | Yes for build/deploy | Public HTTPS URL for SEO/sitemap/OG    |

`NUXT_PUBLIC_SITE_URL` should be the real public HTTPS URL. Do not leave it as `localhost` in production builds.

## Vercel

- Nuxt is detected automatically.
- Set env vars in Project Settings -> Environment Variables.
- Use `npm run build` as build command.

## Netlify

- Build command: `npm run build`.
- Publish directory for static generation: `.output/public`.
- Configure redirects for SPA/static hosting if needed: `/* /index.html 200`.

## Node.js Server

```bash
npm run build
node .output/server/index.mjs
```

Set `HOST` and `PORT` env vars if needed.

## Preview

```bash
npm run preview
```
