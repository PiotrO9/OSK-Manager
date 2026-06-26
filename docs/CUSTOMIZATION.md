# Project Configuration Checklist

Lista miejsc, które trzeba sprawdzić przy zmianie środowiska, brandingu lub integracji OSK Manager.

## Package Identity

`package.json` powinien opisywać projekt OSK Manager, a nie bazowy szablon:

```json
{
    "name": "osk-manager-fe",
    "description": "Frontend aplikacji OSK Manager..."
}
```

## Nuxt Configuration

`nuxt.config.ts` korzysta z `NUXT_PUBLIC_SITE_URL` dla konfiguracji SEO:

```ts
site: {
  url: process.env.NUXT_PUBLIC_SITE_URL,
  name: 'OSK Manager',
}
```

Nie ustawiaj `localhost` jako domyślnego URL dla buildów produkcyjnych.

## Environment Variables

Przykład deploymentu:

```env
NUXT_API_UPSTREAM=https://api.example.com
NUXT_BFF_ADAPTER=upstream
NUXT_PUBLIC_API_BASE=https://api.example.com
NUXT_PUBLIC_SITE_URL=https://app.example.com
```

## Application Areas

- `app/pages/login.vue` - logowanie i sesja
- `app/pages/manager/*` - widoki managera OSK
- `app/pages/my-*` - widoki kursanta
- `server/api/*` - Nitro BFF
- `app/components/shadcn/*` - komponenty shadcn-vue

## Branding

- `app/components/app/AppHeader.vue` - nazwa i nawigacja
- `app/components/app/AppFooter.vue` - stopka
- `app/assets/css/tailwind.css` - tokeny kolorów i style globalne

## Auth And API

- Backend auth: `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`
- Frontend session flow: `app/composables/auth/useAuthSession.ts`
- Shared API helpers: `app/composables/core/useApi.ts`, `app/utils/api/apiEnvelope.ts`
