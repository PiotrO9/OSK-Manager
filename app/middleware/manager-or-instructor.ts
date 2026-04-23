export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();
    const role = session.value?.role?.trim().toUpperCase();

    if (role !== 'MANAGER' && role !== 'ADMIN' && role !== 'INSTRUCTOR') {
        return navigateTo('/');
    }
});
