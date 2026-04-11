export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();
    const role = session.value?.role?.trim().toUpperCase();

    if (role === 'STUDENT' || role === 'INSTRUCTOR') {
        return;
    }

    return navigateTo('/');
});
