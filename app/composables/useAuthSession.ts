/**
 * Sesja przez BFF `/api/auth/*`: access + refresh w ciasteczkach httpOnly (ten sam origin co Nuxt).
 * W `useState` trzymane są wyłącznie dane profilu (bez JWT).
 */

export interface AuthSession {
    userName: string;
    userId: string;
    email?: string;
    role?: string;
}

const AUTH_PATH = '/api/auth';

interface BackendAuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string | null;
}

type SessionUserPayload = {
    id: string;
    userName: string;
    email: string;
    role?: string;
};

function getAuthFetch() {
    return import.meta.server ? useRequestFetch() : $fetch;
}

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

function mapBackendUserToPayload(user: BackendAuthUser): SessionUserPayload {
    const display = [user.firstName, user.lastName]
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .join(' ')
        .trim();

    return {
        id: user.id,
        email: user.email,
        userName: display || user.email,
        role: user.role,
    };
}

function createSessionFromUser(user: SessionUserPayload): AuthSession {
    return {
        userId: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
    };
}

export function useAuthSession() {
    const session = useState<AuthSession | null>('auth_session', () => null);
    const isCheckingSession = ref(false);

    const isAuthenticated = computed(() => {
        if (!session.value?.userId) return false;

        return true;
    });

    async function refreshAccessToken(): Promise<boolean> {
        try {
            const raw = await getAuthFetch()(`${AUTH_PATH}/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            unwrapApiSuccessData<object>(raw);

            return true;
        } catch {
            return false;
        }
    }

    async function loadMeIntoSession(): Promise<boolean> {
        const raw = await getAuthFetch()(`${AUTH_PATH}/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const meData = unwrapApiSuccessData<{ user: BackendAuthUser }>(raw);

        session.value = createSessionFromUser(
            mapBackendUserToPayload(meData.user),
        );

        return true;
    }

    async function checkSession(): Promise<boolean> {
        if (isCheckingSession.value) return Boolean(session.value);

        if (session.value?.userId === 'demo') return true;

        isCheckingSession.value = true;

        try {
            try {
                await loadMeIntoSession();

                return true;
            } catch {
                const refreshed = await refreshAccessToken();

                if (!refreshed) {
                    session.value = null;

                    return false;
                }

                await loadMeIntoSession();

                return true;
            }
        } catch {
            session.value = null;

            return false;
        } finally {
            isCheckingSession.value = false;
        }
    }

    async function login(email: string, password: string): Promise<void> {
        if (!email || !password) {
            throw new Error('Podaj adres e-mail i hasło');
        }

        try {
            const raw = await getAuthFetch()(`${AUTH_PATH}/login`, {
                method: 'POST',
                credentials: 'include',
                body: { email, password },
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const body = unwrapApiSuccessData<{ user: BackendAuthUser }>(raw);

            if (!body.user) {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            session.value = createSessionFromUser(
                mapBackendUserToPayload(body.user),
            );
        } catch (error: unknown) {
            const fromBody = getServerJsonErrorMessage(error);

            if (fromBody) {
                throw new Error(fromBody);
            }

            const status = getFetchStatusCode(error);

            if (status === 401 || status === 403) {
                throw new Error('Nieprawidłowy e-mail lub hasło');
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

    async function logout(): Promise<void> {
        try {
            await getAuthFetch()(`${AUTH_PATH}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error(error);
        }

        session.value = null;
    }

    function loginDemo(userName: string) {
        if (!userName) return;

        session.value = {
            userId: 'demo',
            userName,
            role: 'DEMO',
        };
    }

    return {
        session,
        isAuthenticated,
        isCheckingSession: computed(() => isCheckingSession.value),
        login,
        loginDemo,
        logout,
        refreshAccessToken,
        checkSession,
    };
}
