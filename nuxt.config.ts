import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxtjs/seo', 'shadcn-nuxt'],
    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL,
        name: 'OSK Manager',
    },
    /** Komponenty z CLI: `npx shadcn-vue@latest add button` → app/components/shadcn, w szablonie np. <UiButton>. */
    shadcn: {
        prefix: 'Ui',
        componentDir: '@/components/shadcn',
    },
    runtimeConfig: {
        /** URL Expressa (bez końcowego /). Env: NUXT_API_UPSTREAM. Jeśli pusty — używane jest public.apiBase. */
        apiUpstream: process.env.NUXT_API_UPSTREAM || '',
        /** Adapter BFF: upstream | mock. Jeśli pusty, działa kompatybilny fallback. */
        bffAdapter: process.env.NUXT_BFF_ADAPTER || '',
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
            /** MVP/demo: panel logowania — przyciski auto-fill. Włącz na stagingu: NUXT_PUBLIC_DEMO_MOCK_LOGIN=true */
            demoMockLogin: process.env.NUXT_PUBLIC_DEMO_MOCK_LOGIN === 'true',
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
            path: '~/components/shadcn',
            pathPrefix: false,
        },
        {
            path: '~/components/manager',
            pathPrefix: false,
        },
        {
            path: '~/components/vehicles',
            pathPrefix: false,
        },
        {
            path: '~/components/student',
            pathPrefix: false,
        },
    ],
    css: ['~/assets/css/tailwind.css'],
    imports: {
        dirs: ['composables', 'composables/**', 'utils', 'utils/**'],
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
