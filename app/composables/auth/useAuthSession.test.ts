import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, readonly, ref, type Ref } from 'vue';

type StateValue = Ref<unknown>;

const bff = {
    request: vi.fn(),
    requestData: vi.fn(),
};

const state = new Map<string, StateValue>();

function installNuxtAuthGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('useBffClient', () => bff);
    vi.stubGlobal('useState', <T>(key: string, init: () => T): Ref<T> => {
        if (!state.has(key)) {
            state.set(key, ref(init()) as StateValue);
        }

        return state.get(key) as Ref<T>;
    });
}

function backendUser(overrides: Record<string, unknown> = {}) {
    return {
        id: 'user-1',
        email: 'manager@example.com',
        role: 'MANAGER',
        firstName: 'Anna',
        lastName: 'Nowak',
        drivingSchools: [
            {
                id: 'school-1',
                name: 'OSK Test',
                city: 'Warszawa',
                address: 'Prosta 1',
            },
        ],
        defaultOskId: 'school-1',
        ...overrides,
    };
}

function fetchError(statusCode: number, data?: Record<string, unknown>) {
    return {
        statusCode,
        data,
    };
}

describe('useAuthSession', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        state.clear();
        installNuxtAuthGlobals();
    });

    it('logs in and stores the normalized session from /me when available', async () => {
        bff.requestData
            .mockResolvedValueOnce({
                user: backendUser({ firstName: 'Login', lastName: 'User' }),
            })
            .mockResolvedValueOnce({
                user: backendUser({ firstName: 'Session', lastName: 'User' }),
            });
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        await auth.login('manager@example.com', 'secret');

        expect(bff.requestData).toHaveBeenNthCalledWith(1, '/api/auth/login', {
            method: 'POST',
            auth: 'none',
            retryUnauthorized: false,
            body: {
                email: 'manager@example.com',
                password: 'secret',
            },
        });
        expect(bff.requestData).toHaveBeenNthCalledWith(2, '/api/auth/me', {
            method: 'GET',
            retry: 0,
            retryUnauthorized: false,
        });
        expect(auth.session.value).toMatchObject({
            userId: 'user-1',
            userName: 'Session User',
            email: 'manager@example.com',
            role: 'MANAGER',
            defaultOskId: 'school-1',
        });
    });

    it('refreshes the access token through the BFF refresh endpoint', async () => {
        bff.requestData.mockResolvedValue({ ok: true });
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        await expect(auth.refreshAccessToken()).resolves.toBe(true);

        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/refresh', {
            method: 'POST',
            auth: 'none',
            retryUnauthorized: false,
        });
    });

    it('returns false when access token refresh fails', async () => {
        bff.requestData.mockRejectedValue(new Error('refresh failed'));
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        await expect(auth.refreshAccessToken()).resolves.toBe(false);
    });

    it('maps 401 login failures to invalid credentials', async () => {
        bff.requestData.mockRejectedValue(
            fetchError(401, { message: 'Invalid login credentials' }),
        );
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        await expect(
            auth.login('manager@example.com', 'wrong-password'),
        ).rejects.toThrow('Nieprawidłowy e-mail lub hasło');
        expect(auth.session.value).toBeNull();
    });

    it('clears session and skips refresh when session check returns 403', async () => {
        bff.requestData.mockRejectedValue(fetchError(403));
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        auth.session.value = {
            userId: 'user-1',
            userName: 'Anna',
            role: 'MANAGER',
            drivingSchools: [],
            defaultOskId: null,
        };

        await expect(auth.checkSession()).resolves.toBe(false);

        expect(auth.session.value).toBeNull();
        expect(bff.requestData).toHaveBeenCalledTimes(1);
        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/me', {
            method: 'GET',
            retry: 0,
            retryUnauthorized: false,
        });
    });

    it('delegates refresh handling to the atomic session endpoint', async () => {
        bff.requestData.mockRejectedValue(fetchError(401));
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        await expect(auth.checkSession()).resolves.toBe(false);

        expect(bff.requestData).toHaveBeenCalledTimes(1);
        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/me', {
            method: 'GET',
            retry: 0,
            retryUnauthorized: false,
        });
    });

    it('keeps a known session on a temporary background /me failure', async () => {
        bff.requestData.mockRejectedValue(fetchError(502));
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        auth.session.value = {
            userId: 'user-1',
            userName: 'Anna',
            role: 'MANAGER',
            drivingSchools: [],
            defaultOskId: null,
        };

        await expect(auth.revalidateSessionInBackground()).resolves.toBe(
            'unavailable',
        );
        expect(auth.session.value?.userId).toBe('user-1');
    });

    it('reports a revoked session without exposing an intermediate fallback view', async () => {
        bff.requestData.mockRejectedValue(fetchError(401));
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        auth.session.value = {
            userId: 'user-1',
            userName: 'Anna',
            role: 'MANAGER',
            drivingSchools: [],
            defaultOskId: null,
        };

        await expect(auth.revalidateSessionInBackground()).resolves.toBe(
            'invalid',
        );
        expect(auth.session.value?.userId).toBe('user-1');

        auth.discardSession();
        expect(auth.session.value).toBeNull();
    });

    it('ignores a stale background response after logout', async () => {
        let release!: (value: unknown) => void;

        bff.requestData.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    release = resolve;
                }),
        );
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        auth.session.value = {
            userId: 'user-1',
            userName: 'Anna',
            role: 'MANAGER',
            drivingSchools: [],
            defaultOskId: null,
        };

        const pending = auth.revalidateSessionInBackground();

        auth.discardSession();
        release({ user: backendUser() });

        await expect(pending).resolves.toBe('skipped');
        expect(auth.session.value).toBeNull();
    });

    it('requires a fresh page for a changed account role', async () => {
        bff.requestData.mockResolvedValue({
            user: backendUser({ role: 'INSTRUCTOR' }),
        });
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        auth.session.value = {
            userId: 'user-1',
            userName: 'Anna',
            role: 'MANAGER',
            drivingSchools: [],
            defaultOskId: null,
        };

        await expect(auth.revalidateSessionInBackground()).resolves.toBe(
            'changed',
        );
        expect(auth.session.value?.role).toBe('MANAGER');
    });

    it('maps unavailable backend login failures to a connection error', async () => {
        bff.requestData.mockRejectedValue(new TypeError('fetch failed'));
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        await expect(
            auth.login('manager@example.com', 'secret'),
        ).rejects.toThrow(
            'Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.',
        );
        expect(auth.session.value).toBeNull();
    });

    it('patches profile with normalized optional fields and updates session', async () => {
        bff.requestData.mockResolvedValue({
            user: backendUser({
                firstName: 'Piotr',
                lastName: 'Kowalski',
                phone: null,
                bio: 'Nowy opis',
            }),
        });
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        await auth.patchProfile({
            firstName: ' Piotr ',
            lastName: ' Kowalski ',
            phone: '   ',
            bio: ' Nowy opis ',
        });

        expect(bff.requestData).toHaveBeenCalledWith('/api/auth/profile', {
            method: 'PATCH',
            body: {
                firstName: 'Piotr',
                lastName: 'Kowalski',
                phone: null,
                bio: 'Nowy opis',
            },
            retryUnauthorized: false,
        });
        expect(auth.session.value).toMatchObject({
            userName: 'Piotr Kowalski',
            firstName: 'Piotr',
            lastName: 'Kowalski',
            phone: null,
            bio: 'Nowy opis',
        });
    });

    it('logs out through the BFF and clears session state', async () => {
        bff.request.mockResolvedValue({ success: true });
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        auth.session.value = {
            userId: 'user-1',
            userName: 'Anna',
            role: 'MANAGER',
            drivingSchools: [],
            defaultOskId: null,
        };

        expect(await auth.logout()).toBe(true);

        expect(bff.request).toHaveBeenCalledWith('/api/auth/logout', {
            method: 'POST',
            auth: 'none',
            retryUnauthorized: false,
        });
        expect(auth.session.value).toBeNull();
    });

    it('keeps the visible session when logout cannot reach the server', async () => {
        bff.request.mockRejectedValueOnce(new Error('network unavailable'));
        const logError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        const { useAuthSession } = await import('./useAuthSession');
        const auth = useAuthSession();

        auth.session.value = {
            userId: 'user-1',
            userName: 'Anna',
            role: 'MANAGER',
            drivingSchools: [],
            defaultOskId: null,
        };

        expect(
            await auth.logout({ preserveSessionUntilNavigation: true }),
        ).toBe(false);
        expect(auth.session.value?.userId).toBe('user-1');
        expect(logError).toHaveBeenCalledOnce();

        logError.mockRestore();
    });

    it('keeps session state in the shared auth_session useState key', async () => {
        const { useAuthSession } = await import('./useAuthSession');
        const first = useAuthSession();
        const second = useAuthSession();

        first.loginDemo('Demo User');

        expect(second.session.value).toMatchObject({
            userId: 'demo',
            userName: 'Demo User',
            role: 'DEMO',
        });
        expect(state.has('auth_session')).toBe(true);
    });
});
