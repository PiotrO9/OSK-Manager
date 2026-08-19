export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();

    if (!hasManagerAccess(session.value?.role)) {
        return navigateTo('/');
    }
});
