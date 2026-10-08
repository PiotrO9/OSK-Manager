import { useAuthReturnTo } from '~/composables/auth/useAuthReturnTo';
import { useAuthSession } from '~/composables/auth/useAuthSession';

export default defineNuxtRouteMiddleware(async (to) => {
    const isLoginPath =
        to.path === '/login' ||
        to.path.startsWith('/login/') ||
        to.path === '/forgot-password' ||
        to.path === '/reset-password';

    const { checkSession } = useAuthSession();

    /*
     * Zawsze wołamy checkSession (GET /api/auth/me + ew. refresh), nie ufamy samemu
     * useState z pamięci — inaczej po wygaśnięciu access tokena UI zostaje „zalogowane”.
     */
    const hasSession = await checkSession();

    if (isLoginPath) return;

    if (hasSession) return;

    const redirectTarget = to.fullPath || '/';
    const { setReturnTo } = useAuthReturnTo();

    setReturnTo(redirectTarget);

    return navigateTo('/login');
});
