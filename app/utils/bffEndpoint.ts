/**
 * Same-origin BFF endpoint helper kept for compatibility.
 * New API code should prefer `bffFetch` / `useBffApi`.
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
