export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();

    if (!hasManagerOrInstructorAccess(session.value?.role)) {
        return navigateTo('/');
    }
});
