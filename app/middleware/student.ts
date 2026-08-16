export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();

    if (isAuthRole(session.value?.role, 'STUDENT')) {
        return;
    }

    return navigateTo('/');
});
