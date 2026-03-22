export default defineNuxtPlugin(() => {
    if (import.meta.server) return;

    function initDarkMode() {
        const html = document.documentElement;

        const stored = localStorage.getItem('dark-mode');

        if (stored === 'true') {
            html.classList.add('dark');
        } else if (stored === 'false') {
            html.classList.remove('dark');
        } else {
            const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;

            if (prefersDark) {
                html.classList.add('dark');
                localStorage.setItem('dark-mode', 'true');
            } else {
                html.classList.remove('dark');
                localStorage.setItem('dark-mode', 'false');
            }
        }
    }

    initDarkMode();
});
