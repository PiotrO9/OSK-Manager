import { canonicalizeAppUrl, isAppRoute } from '~~/shared/routing/routePaths';
import { setResponseHeader } from 'h3';

export default defineNuxtRouteMiddleware((to) => {
    // Recovery tokens live in the fragment. The page must read them before cleanup.
    if (isAppRoute(to.path, 'resetPassword')) return;

    const path = canonicalizeAppUrl(to.path);

    if (path === to.path) return;

    if (import.meta.server) {
        const event = useRequestEvent();

        if (event)
            setResponseHeader(event, 'Cache-Control', 'private, no-store');
    }

    return navigateTo(
        { path, query: to.query, hash: to.hash },
        { replace: true, redirectCode: 302 },
    );
});
