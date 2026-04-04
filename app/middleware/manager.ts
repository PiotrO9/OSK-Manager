export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();

    if (session.value?.role !== 'MANAGER') {
        return navigateTo('/');
    }
});
