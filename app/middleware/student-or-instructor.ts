export default defineNuxtRouteMiddleware(() => {
    const { session } = useAuthSession();

    if (hasStudentOrInstructorAccess(session.value?.role)) {
        return;
    }

    return navigateTo('/');
});
