/**
 * Sesja przez BFF `/api/auth/*`: access + refresh w ciasteczkach httpOnly (ten sam origin co Nuxt).
 * W `useState` trzymane są wyłącznie dane profilu (bez JWT).
 */
import { createDemoAuthSession } from '~/utils/auth/demoAuthSession';
import {
    buildAuthProfilePatchPayload,
    createAuthSessionFromBackendUser,
    type AuthProfilePatchBody,
    type AuthSession,
} from '~/utils/auth/authSessionMapper';
import {
    requestAuthLogin,
    requestAuthLogout,
    requestAuthMe,
    requestAuthProfilePatch,
    requestAuthRefresh,
} from '~/utils/auth/authSessionApi';

export type BackgroundSessionCheckResult =
    | 'valid'
    | 'invalid'
    | 'changed'
    | 'unavailable'
    | 'skipped';

function getFetchStatusCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    if (!('statusCode' in error)) return undefined;

    const code = (error as { statusCode?: number }).statusCode;

    return typeof code === 'number' ? code : undefined;
}

function getServerJsonErrorMessage(error: unknown): string | null {
    if (typeof error !== 'object' || error === null) return null;

    const data = (error as { data?: unknown }).data;

    if (!data || typeof data !== 'object') return null;

    const d = data as { message?: unknown; statusMessage?: unknown };

    if (typeof d.message === 'string') return d.message;

    if (typeof d.statusMessage === 'string') return d.statusMessage;

    return null;
}

function sessionLoadShouldSkipRefresh(status: number | undefined): boolean {
    if (status === undefined) return false;

    return status === 403 || status === 404;
}

export function useAuthSession() {
    const session = useState<AuthSession | null>('auth_session', () => null);
    const sessionVerifiedAt = useState<number>(
        'auth_session_verified_at',
        () => 0,
    );
    const sessionRevision = useState<number>('auth_session_revision', () => 0);
    const isLoggingOut = useState<boolean>('auth_logging_out', () => false);
    const isCheckingSession = ref(false);
    const bff = useBffClient();

    const isAuthenticated = computed(() => {
        if (!session.value?.userId) return false;

        return true;
    });

    async function refreshAccessToken(): Promise<boolean> {
        try {
            await requestAuthRefresh(bff);

            return true;
        } catch {
            return false;
        }
    }

    async function loadMeIntoSession(): Promise<boolean> {
        const user = await requestAuthMe(bff);

        session.value = createAuthSessionFromBackendUser(user);
        sessionVerifiedAt.value = Date.now();

        return true;
    }

    async function patchProfile(body: AuthProfilePatchBody): Promise<void> {
        const payload = buildAuthProfilePatchPayload(body);

        if (Object.keys(payload).length === 0) {
            throw new Error('Brak pól do zapisania');
        }

        async function doPatch(): Promise<void> {
            const user = await requestAuthProfilePatch(bff, payload);

            if (!user) {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            session.value = createAuthSessionFromBackendUser(user);
        }

        try {
            await doPatch();
        } catch (err: unknown) {
            const status = getFetchStatusCode(err);
            const fromBodyEarly = getServerJsonErrorMessage(err);

            if (status === 403) {
                throw new Error(
                    fromBodyEarly ?? 'Brak uprawnień do tej operacji.',
                );
            }

            if (sessionLoadShouldSkipRefresh(status)) {
                throw new Error(fromBodyEarly ?? 'Sesja nieważna');
            }

            if (status === 401) {
                const refreshed = await refreshAccessToken();

                if (!refreshed) {
                    session.value = null;

                    throw new Error('Sesja wygasła. Zaloguj się ponownie.');
                }

                await doPatch();

                return;
            }

            if (fromBodyEarly) {
                throw new Error(fromBodyEarly);
            }

            throw err instanceof Error
                ? err
                : new Error('Nie udało się zapisać profilu');
        }
    }

    async function refreshProfileFromServer(): Promise<void> {
        try {
            await loadMeIntoSession();

            return;
        } catch (err: unknown) {
            const status = getFetchStatusCode(err);

            if (sessionLoadShouldSkipRefresh(status)) {
                const msg = getServerJsonErrorMessage(err);

                throw new Error(msg ?? 'Sesja nieważna');
            }

            const refreshed = await refreshAccessToken();

            if (!refreshed) {
                throw new Error('Nie udało się odświeżyć sesji');
            }

            await loadMeIntoSession();
        }
    }

    async function checkSession(): Promise<boolean> {
        if (isCheckingSession.value) return Boolean(session.value);

        if (session.value?.userId === 'demo') return true;

        // SSR always verifies the cookie before rendering a protected page.
        // A hydrated client session is revalidated independently of navigation.
        if (import.meta.client && session.value?.userId) {
            return true;
        }

        isCheckingSession.value = true;

        try {
            await loadMeIntoSession();

            return true;
        } catch {
            session.value = null;
            sessionVerifiedAt.value = 0;

            return false;
        } finally {
            isCheckingSession.value = false;
        }
    }

    function discardSession(): void {
        sessionRevision.value += 1;
        session.value = null;
        sessionVerifiedAt.value = 0;
    }

    async function revalidateSessionInBackground(): Promise<BackgroundSessionCheckResult> {
        const previousUserId = session.value?.userId;
        const previousRole = session.value?.role;

        if (
            !previousUserId ||
            previousUserId === 'demo' ||
            isLoggingOut.value
        ) {
            return 'skipped';
        }

        const previousRevision = sessionRevision.value;

        try {
            const user = await requestAuthMe(bff);

            if (
                sessionRevision.value !== previousRevision ||
                session.value?.userId !== previousUserId ||
                isLoggingOut.value
            ) {
                return 'skipped';
            }

            const nextSession = createAuthSessionFromBackendUser(user);

            if (
                nextSession.userId !== previousUserId ||
                nextSession.role !== previousRole
            ) {
                return 'changed';
            }

            session.value = nextSession;
            sessionVerifiedAt.value = Date.now();

            return 'valid';
        } catch (error) {
            if (
                sessionRevision.value !== previousRevision ||
                session.value?.userId !== previousUserId ||
                isLoggingOut.value
            ) {
                return 'skipped';
            }

            const status = getFetchStatusCode(error);

            if (status !== 401 && status !== 403 && status !== 404) {
                return 'unavailable';
            }

            return 'invalid';
        }
    }

    async function login(email: string, password: string): Promise<void> {
        if (!email || !password) {
            throw new Error('Podaj adres e-mail i hasło');
        }

        try {
            const user = await requestAuthLogin(bff, email, password);

            if (!user) {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            session.value = createAuthSessionFromBackendUser(user);
            sessionRevision.value += 1;
            sessionVerifiedAt.value = Date.now();

            try {
                await loadMeIntoSession();
            } catch {
                /* Sesja już ustawiona z odpowiedzi loginu — pełny `/me` opcjonalny. */
            }
        } catch (error: unknown) {
            const status = getFetchStatusCode(error);

            if (status === 401) {
                throw new Error('Nieprawidłowy e-mail lub hasło');
            }

            if (status === 403) {
                throw new Error(
                    'Konto jest niedostępne lub wyłączone. Skontaktuj się z pomocą.',
                );
            }

            if (status !== undefined && status >= 500) {
                throw new Error(
                    'Serwer jest chwilowo niedostępny. Spróbuj ponownie.',
                );
            }

            if (status !== undefined && status >= 400) {
                throw new Error('Nieprawidłowy e-mail lub hasło');
            }

            throw new Error(
                'Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.',
            );
        }
    }

    async function logout(options?: {
        preserveSessionUntilNavigation?: boolean;
    }): Promise<boolean> {
        let succeeded = true;

        try {
            await requestAuthLogout(bff);
        } catch (error) {
            console.error(error);
            succeeded = false;
        }

        if (!options?.preserveSessionUntilNavigation) {
            session.value = null;
        }

        if (succeeded || !options?.preserveSessionUntilNavigation) {
            sessionVerifiedAt.value = 0;
            sessionRevision.value += 1;
        }

        return succeeded;
    }

    function loginDemo(userName: string) {
        const demoSession = createDemoAuthSession(userName);

        if (!demoSession) return;

        session.value = demoSession;
        sessionRevision.value += 1;
    }

    return {
        session,
        isAuthenticated,
        isCheckingSession: computed(() => isCheckingSession.value),
        login,
        loginDemo,
        logout,
        refreshAccessToken,
        refreshProfileFromServer,
        patchProfile,
        checkSession,
        discardSession,
        revalidateSessionInBackground,
        sessionVerifiedAt: readonly(sessionVerifiedAt),
    };
}
