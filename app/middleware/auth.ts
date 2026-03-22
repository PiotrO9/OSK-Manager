export default defineNuxtRouteMiddleware(async (to) => {
    const { isAuthenticated, checkSession } = useAuthSession();
    const localePath = useLocalePath();

    if (isAuthenticated.value) return;

    const hasSession = await checkSession();

    if (hasSession) return;

    const redirectTarget = to.fullPath || localePath('/');

    return navigateTo({
        path: localePath('/login'),
        query: { redirect: redirectTarget },
    });
});
