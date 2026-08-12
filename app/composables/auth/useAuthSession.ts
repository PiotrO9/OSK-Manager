/**
 * Sesja przez BFF `/api/auth/*`: access + refresh w ciasteczkach httpOnly (ten sam origin co Nuxt).
 * W `useState` trzymane są wyłącznie dane profilu (bez JWT).
 */

export interface AuthProfilePatchBody {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
}

/** OSK z `GET /auth/me` ( uproszczony DTO ). */
export interface AuthDrivingSchoolSummary {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
}

export interface AuthSession {
    userName: string;
    userId: string;
    email?: string;
    role?: string;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
    profileUpdatedAt?: string | null;
    pkkNumber?: string | null;
    /** Aktywne OSK widoczne dla roli (z `/auth/me`). */
    drivingSchools: AuthDrivingSchoolSummary[];
    /** Domyślna OSK właściciela — sens dla `MANAGER`; inne role: `null`. */
    defaultOskId: string | null;
}

const AUTH_PATH = '/api/auth';

/**
 * `GET /auth/me` (whitelist) oraz ewentualny starszy kształt z `POST /auth/login` na BE.
 */
interface BackendUserResponse {
    id: string;
    email: string;
    role: string;
    name?: string;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
    profileUpdatedAt?: string | null;
    pkkNumber?: string | null;
    drivingSchools?: unknown;
    defaultOskId?: string | null;
}

interface SessionUserPayload {
    id: string;
    userName: string;
    email: string;
    role?: string;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    bio?: string | null;
    profileUpdatedAt?: string | null;
    pkkNumber?: string | null;
    drivingSchools: AuthDrivingSchoolSummary[];
    defaultOskId: string | null;
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

function normalizeDrivingSchoolsFromBackend(
    raw: unknown,
): AuthDrivingSchoolSummary[] {
    if (!Array.isArray(raw)) return [];

    const out: AuthDrivingSchoolSummary[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;

        const o = item as Record<string, unknown>;
        const id = typeof o.id === 'string' ? o.id.trim() : '';
        const name = typeof o.name === 'string' ? o.name.trim() : '';

        if (!id || !name) continue;

        function readOptStringNull(key: string): string | null {
            if (!Object.prototype.hasOwnProperty.call(o, key)) return null;

            const v = o[key];

            if (v === null || v === undefined) return null;

            const t = String(v).trim();

            return t.length > 0 ? t : null;
        }

        out.push({
            id,
            name,
            city: readOptStringNull('city'),
            address: readOptStringNull('address'),
        });
    }

    return out;
}

function normalizeDefaultPkFromBackend(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    const t = String(raw).trim();

    return t.length > 0 ? t : null;
}

function normalizeBackendUserToSessionPayload(
    user: BackendUserResponse,
): SessionUserPayload {
    const nameFromApi = typeof user.name === 'string' ? user.name.trim() : '';

    let userName = nameFromApi;

    if (!userName) {
        const display = [user.firstName, user.lastName]
            .map((s) => String(s || '').trim())
            .filter(Boolean)
            .join(' ')
            .trim();

        userName = display || user.email;
    }

    let avatarUrl: string | null | undefined;

    if (Object.prototype.hasOwnProperty.call(user, 'avatarUrl')) {
        const raw = user.avatarUrl;

        if (raw === null || raw === undefined || String(raw).trim() === '') {
            avatarUrl = null;
        } else {
            avatarUrl = String(raw).trim();
        }
    }

    function optionalString(
        value: string | null | undefined,
    ): string | null | undefined {
        if (value === undefined) return undefined;

        if (value === null) return null;

        const t = String(value).trim();

        return t.length > 0 ? t : null;
    }

    return {
        id: user.id,
        email: user.email,
        userName,
        role: user.role,
        avatarUrl,
        firstName: optionalString(user.firstName) ?? undefined,
        lastName: optionalString(user.lastName) ?? undefined,
        phone:
            user.phone === undefined ? undefined : optionalString(user.phone),
        bio: user.bio === undefined ? undefined : optionalString(user.bio),
        profileUpdatedAt:
            typeof user.profileUpdatedAt === 'string' &&
            user.profileUpdatedAt.trim().length > 0
                ? user.profileUpdatedAt.trim()
                : user.profileUpdatedAt === null
                  ? null
                  : undefined,
        pkkNumber: Object.prototype.hasOwnProperty.call(user, 'pkkNumber')
            ? optionalString(user.pkkNumber)
            : undefined,
        drivingSchools: normalizeDrivingSchoolsFromBackend(user.drivingSchools),
        defaultOskId: Object.prototype.hasOwnProperty.call(user, 'defaultOskId')
            ? normalizeDefaultPkFromBackend(user.defaultOskId)
            : null,
    };
}

function createSessionFromUser(user: SessionUserPayload): AuthSession {
    return {
        userId: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        bio: user.bio,
        profileUpdatedAt: user.profileUpdatedAt,
        pkkNumber: user.pkkNumber,
        drivingSchools: user.drivingSchools,
        defaultOskId: user.defaultOskId,
    };
}

function sessionLoadShouldSkipRefresh(status: number | undefined): boolean {
    if (status === undefined) return false;

    return status === 403 || status === 404;
}

export function useAuthSession() {
    const session = useState<AuthSession | null>('auth_session', () => null);
    const isCheckingSession = ref(false);
    const bff = useBffClient();

    const isAuthenticated = computed(() => {
        if (!session.value?.userId) return false;

        return true;
    });

    async function refreshAccessToken(): Promise<boolean> {
        try {
            await bff.requestData<object>(`${AUTH_PATH}/refresh`, {
                method: 'POST',
                auth: 'none',
                retryUnauthorized: false,
            });

            return true;
        } catch {
            return false;
        }
    }

    async function loadMeIntoSession(): Promise<boolean> {
        const meData = await bff.requestData<{ user: BackendUserResponse }>(
            `${AUTH_PATH}/me`,
            {
                method: 'GET',
                retryUnauthorized: false,
            },
        );

        session.value = createSessionFromUser(
            normalizeBackendUserToSessionPayload(meData.user),
        );

        return true;
    }

    function buildProfilePatchPayload(
        body: AuthProfilePatchBody,
    ): Record<string, string | null> {
        const out: Record<string, string | null> = {};

        if (Object.prototype.hasOwnProperty.call(body, 'firstName')) {
            out.firstName =
                typeof body.firstName === 'string' ? body.firstName.trim() : '';
        }

        if (Object.prototype.hasOwnProperty.call(body, 'lastName')) {
            out.lastName =
                typeof body.lastName === 'string' ? body.lastName.trim() : '';
        }

        if (Object.prototype.hasOwnProperty.call(body, 'phone')) {
            const p = body.phone;

            if (p === null || p === undefined) {
                out.phone = null;
            } else {
                const t = String(p).trim();

                out.phone = t.length > 0 ? t : null;
            }
        }

        if (Object.prototype.hasOwnProperty.call(body, 'bio')) {
            const b = body.bio;

            if (b === null || b === undefined) {
                out.bio = null;
            } else {
                const t = String(b).trim();

                out.bio = t.length > 0 ? t : null;
            }
        }

        return out;
    }

    async function patchProfile(body: AuthProfilePatchBody): Promise<void> {
        const payload = buildProfilePatchPayload(body);

        if (Object.keys(payload).length === 0) {
            throw new Error('Brak pól do zapisania');
        }

        async function doPatch(): Promise<void> {
            const data = await bff.requestData<{ user: BackendUserResponse }>(
                `${AUTH_PATH}/profile`,
                {
                    method: 'PATCH',
                    body: payload,
                    retryUnauthorized: false,
                },
            );

            if (!data.user) {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            session.value = createSessionFromUser(
                normalizeBackendUserToSessionPayload(data.user),
            );
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

        isCheckingSession.value = true;

        try {
            try {
                await loadMeIntoSession();

                return true;
            } catch (err: unknown) {
                const status = getFetchStatusCode(err);

                if (sessionLoadShouldSkipRefresh(status)) {
                    session.value = null;

                    return false;
                }

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
            const body = await bff.requestData<{ user: BackendUserResponse }>(
                `${AUTH_PATH}/login`,
                {
                    method: 'POST',
                    auth: 'none',
                    retryUnauthorized: false,
                    body: { email, password },
                },
            );

            if (!body.user) {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            session.value = createSessionFromUser(
                normalizeBackendUserToSessionPayload(body.user),
            );

            try {
                await loadMeIntoSession();
            } catch {
                /* Sesja już ustawiona z odpowiedzi loginu — pełny `/me` opcjonalny. */
            }
        } catch (error: unknown) {
            const fromBody = getServerJsonErrorMessage(error);

            if (fromBody) {
                throw new Error(fromBody);
            }

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

    async function logout(): Promise<void> {
        try {
            await bff.request(`${AUTH_PATH}/logout`, {
                method: 'POST',
                auth: 'none',
                retryUnauthorized: false,
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
            drivingSchools: [],
            defaultOskId: null,
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
        refreshProfileFromServer,
        patchProfile,
        checkSession,
    };
}
