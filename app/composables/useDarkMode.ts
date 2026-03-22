export function useDarkMode() {
    const isDark = ref(false);

    function updateIsDarkFromDOM() {
        if (import.meta.server) return;

        isDark.value = document.documentElement.classList.contains('dark');
    }

    function toggleDarkMode() {
        if (import.meta.server) return;

        const html = document.documentElement;
        const currentIsDark = html.classList.contains('dark');

        if (currentIsDark) {
            html.classList.remove('dark');
            localStorage.setItem('dark-mode', 'false');
        } else {
            html.classList.add('dark');
            localStorage.setItem('dark-mode', 'true');
        }

        updateIsDarkFromDOM();
    }

    function setDarkMode(value: boolean) {
        if (import.meta.server) return;

        const html = document.documentElement;

        if (value) {
            html.classList.add('dark');
            localStorage.setItem('dark-mode', 'true');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('dark-mode', 'false');
        }

        updateIsDarkFromDOM();
    }

    onMounted(() => {
        const savedDarkMode = localStorage.getItem('dark-mode');

        if (savedDarkMode === 'true') {
            document.documentElement.classList.add('dark');
        } else if (savedDarkMode === 'false') {
            document.documentElement.classList.remove('dark');
        }

        updateIsDarkFromDOM();

        const observer = new MutationObserver(() => {
            updateIsDarkFromDOM();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        onUnmounted(() => {
            observer.disconnect();
        });
    });

    return {
        isDark: readonly(isDark),
        toggleDarkMode,
        setDarkMode,
    };
}
