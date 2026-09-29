export default defineNuxtPlugin({
    hooks: {
        'app:suspense:resolve': () => {
            document.documentElement.dataset.appReady = 'true';
        },
    },
});
