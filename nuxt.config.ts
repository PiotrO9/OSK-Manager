import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: [
        '@nuxt/eslint',
        '@nuxt/icon',
        '@nuxtjs/seo',
        '@nuxt/ui',
    ],
    ui: {
        colorMode: false,
    },
    colorMode: {
        preference: 'light',
        fallback: 'light',
        classSuffix: '',
    },
    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        name: 'Frontend Starter',
    },
    runtimeConfig: {
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
