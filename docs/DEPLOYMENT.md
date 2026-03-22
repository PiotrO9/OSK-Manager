# Deployment

Guidelines for deploying projects based on the Frontend Starter.

## Build

```bash
pnpm build
```

Output is in `.output/` directory.

## Static Generation (SSG)

For static hosting (e.g. Netlify, Vercel static):

```bash
pnpm generate
```

Output is in `.output/public/`.

## Environment Variables

Ensure these are set in your deployment environment:

| Variable               | Required           | Description             |
| ---------------------- | ------------------ | ----------------------- |
| `NUXT_PUBLIC_API_BASE` | Yes (if using API) | Backend API base URL    |
| `NUXT_PUBLIC_SITE_URL` | Yes (for SEO)      | Public URL of your site |

## Platform-Specific Notes

### Vercel

- Nuxt is detected automatically
- Set env vars in Project Settings → Environment Variables
- Use `pnpm build` as build command

### Netlify

- Build command: `pnpm build`
- Publish directory: `dist` (for Nuxt 3) or `.output/public` (for static)
- Configure redirects for SPA if needed: `/* /index.html 200`

### Node.js (Server)

```bash
pnpm build
node .output/server/index.mjs
```

Set `HOST` and `PORT` env vars if needed.

## Previews

Test production build locally:

```bash
pnpm preview
```
