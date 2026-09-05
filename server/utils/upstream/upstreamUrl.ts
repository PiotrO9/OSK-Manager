import type { UpstreamRequestOptions } from './upstreamTypes';

export function buildUpstreamUrl(
    upstreamBase: string,
    path: string,
    query?: UpstreamRequestOptions['query'],
): string {
    const cleanBase = upstreamBase.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${cleanBase}${cleanPath}`);

    if (query instanceof URLSearchParams) {
        query.forEach((value, key) => url.searchParams.set(key, value));
    } else if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === null || value === undefined) continue;

            url.searchParams.set(key, String(value));
        }
    }

    return url.toString();
}
