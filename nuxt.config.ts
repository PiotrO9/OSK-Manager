import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxtjs/seo', 'shadcn-nuxt'],
    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        name: 'Frontend Starter',
    },
    /**
     * Osobny katalog — moduł szuka podfolderów z index.ts; mieszanie z płaskimi .vue w ui/ powoduje WARN przy prepare.
     * Komponenty z CLI: `npx shadcn-vue@latest add button` → app/components/shadcn, w szablonie np. <UiButton>.
     */
    shadcn: {
        prefix: 'Ui',
        componentDir: '@/components/shadcn',
    },
    runtimeConfig: {
        /** URL Expressa (bez końcowego /). Env: NUXT_API_UPSTREAM. Jeśli pusty — używane jest public.apiBase. */
        apiUpstream: process.env.NUXT_API_UPSTREAM || '',
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
            siteUrl:
                process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        },
    },
    components: [
        {
            path: '~/components/app',
            pathPrefix: false,
        },
        {
            path: '~/components/app/design-system',
            pathPrefix: false,
        },
        {
            path: '~/components/ui',
            pathPrefix: false,
        },
        {
            path: '~/components/shadcn',
            pathPrefix: false,
        },
    ],
    css: ['~/assets/css/tailwind.css'],
    imports: {
        dirs: ['app/composables', 'app/utils'],
    },
    vite: {
        plugins: [tailwindcss()],
    },
    postcss: {
        plugins: {
            autoprefixer: {},
        },
    },
});
