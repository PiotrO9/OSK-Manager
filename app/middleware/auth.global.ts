import { getCookie } from 'h3';
import { useAuthReturnTo } from '~/composables/auth/useAuthReturnTo';
import { useAuthSession } from '~/composables/auth/useAuthSession';

export default defineNuxtRouteMiddleware(async (to) => {
    const isLoginPath =
        to.path === '/login' ||
        to.path.startsWith('/login/') ||
        to.path === '/forgot-password' ||
        to.path === '/reset-password';

    const { checkSession, session } = useAuthSession();

    /*
     * Publiczne strony nie wymagają /me bez ciasteczek sesji. Po stronie klienta
     * wystarczy brak sesji z SSR; przy aktywnej sesji nadal weryfikujemy ją w BFF.
     */
    if (isLoginPath) {
        if (import.meta.server) {
            const event = useRequestEvent();

            if (
                event &&
                !getCookie(event, 'access_token') &&
                !getCookie(event, 'refresh_token')
            ) {
                return;
            }
        } else if (!session.value) {
            return;
        }
    }

    const hasSession = await checkSession();

    if (to.path === '/login' && hasSession) {
        const { consumeReturnTo } = useAuthReturnTo();
        const returnTarget = consumeReturnTo();

        if (returnTarget) {
            return navigateTo(returnTarget, { replace: true });
        }

        if (session.value?.role === 'MANAGER') {
            const { fetchDefaultDrivingSchool } = useDrivingSchoolsApi();
            const result = await fetchDefaultDrivingSchool();

            if (result.outcome === 'not_configured') {
                return navigateTo('/manager/osk', { replace: true });
            }
        }

        return navigateTo('/', { replace: true });
    }

    if (isLoginPath) return;

    if (hasSession) return;

    const redirectTarget = to.fullPath || '/';
    const { setReturnTo } = useAuthReturnTo();

    setReturnTo(redirectTarget);

    return navigateTo('/login');
});
