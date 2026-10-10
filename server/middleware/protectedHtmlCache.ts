import { isPublicAuthPath } from '~~/shared/utils/publicAuthPath';

export default defineEventHandler((event) => {
    if (event.method !== 'GET') return;

    const accept = getRequestHeader(event, 'accept') ?? '';

    if (!accept.includes('text/html')) return;

    const path = getRequestURL(event).pathname;

    if (
        isPublicAuthPath(path) ||
        path.startsWith('/api/') ||
        path.startsWith('/_nuxt/')
    ) {
        return;
    }

    setResponseHeader(event, 'Cache-Control', 'private, no-store');
});
