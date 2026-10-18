import {
    canonicalizeAppUrl,
    isAppRoute,
} from '../../shared/routing/routePaths';

export default defineEventHandler((event) => {
    if (event.method !== 'GET' && event.method !== 'HEAD') return;

    const url = getRequestURL(event);

    if (isAppRoute(url.pathname, 'resetPassword')) return;

    const canonicalPath = canonicalizeAppUrl(url.pathname);

    if (canonicalPath === url.pathname) return;

    setResponseHeader(event, 'Cache-Control', 'private, no-store');

    return sendRedirect(event, canonicalPath + url.search, 302);
});
