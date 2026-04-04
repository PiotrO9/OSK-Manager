/**
 * Adres BFF na tym samym originie co aplikacja (np. /api/driving-schools).
 * Wymagany, gdy NUXT_PUBLIC_API_BASE wskazuje na zewnętrzny backend — inaczej useApi doda złą bazę.
 */
export function resolveBffEndpoint(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const clean = path.startsWith('/') ? path : `/${path}`;

    if (import.meta.client) {
        return `${window.location.origin}${clean}`;
    }

    const { origin } = useRequestURL();

    return `${origin}${clean}`;
}
