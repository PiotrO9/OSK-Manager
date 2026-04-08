export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();
    const role = session.value?.role;

    if (role !== 'MANAGER' && role !== 'ADMIN') {
        return navigateTo('/');
    }
});
