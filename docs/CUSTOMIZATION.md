# Customization

Checklist for adapting the Frontend Starter to your new project.

## 1. Package Identity

Edit `package.json`:

```json
{
    "name": "your-project-name",
    "description": "Your project description",
    "repository": {
        "url": "https://github.com/YOUR_USERNAME/your-repo.git"
    }
}
```

## 2. Nuxt Configuration

In `nuxt.config.ts`, update:

```ts
site: {
  url: process.env.NUXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  name: 'Your App Name',
},
```

## 3. Demo Pages

Remove or repurpose demo pages as needed:

| Page                          | Action                                |
| ----------------------------- | ------------------------------------- |
| `app/pages/design-system.vue` | Remove or keep for internal reference |
| `app/pages/api-demo.vue`      | Remove or adapt for your API          |
| `app/pages/protected.vue`     | Adapt or remove                       |
| `app/pages/login.vue`         | Adapt to your auth flow               |
| `app/pages/index.vue`         | Replace with your homepage            |

## 4. Environment Variables

Create `.env` (and `.env.example` for documentation):

```env
NUXT_PUBLIC_API_BASE=https://api.your-domain.com
NUXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 5. Internationalization

- Edit `i18n/locales/en.json` and `i18n/locales/pl.json` with your copy
- Add or remove locales in `nuxt.config.ts` under `i18n.locales`
- Update `LanguageSwitch.vue` if you change locale codes

## 6. Layout and Branding

- Update `AppHeader.vue` — navigation links, logo, branding
- Update `AppFooter.vue` — footer content, links
- Adjust colors and theme in `tailwind.config.ts` if needed

## 7. Authentication

- Set `NUXT_PUBLIC_API_BASE` to your backend URL (e.g. `https://api.example.com`)
- Expected endpoints: `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` (see [ARCHITECTURE.md](ARCHITECTURE.md))
- Update login/logout flows in `app/pages/login.vue` and `app/composables/useLogout.ts`
- Adjust `app/middleware/auth.ts` for your auth logic

## 8. Cleanup

- Remove this checklist from your project docs once done
- Update `README.md` with your project-specific instructions
- Remove or update `CHANGELOG.md` for your project history
