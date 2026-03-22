export default defineNuxtRouteMiddleware(async (to) => {
    const { isAuthenticated, checkSession } = useAuthSession();

    if (isAuthenticated.value) return;

    const hasSession = await checkSession();

    if (hasSession) return;

    const redirectTarget = to.fullPath || '/';

    return navigateTo({
        path: '/login',
        query: { redirect: redirectTarget },
    });
});
