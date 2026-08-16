export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();

    if (!isAuthRole(session.value?.role, 'INSTRUCTOR')) {
        return navigateTo('/');
    }
});
