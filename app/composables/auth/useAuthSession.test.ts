import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, type Ref } from 'vue';

type StateValue = Ref<unknown>;

const bff = {
    request: vi.fn(),
    requestData: vi.fn(),
};

const state = new Map<string, StateValue>();

function installNuxtAuthGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
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
        bff.requestData.mockRejectedValue(fetchError(401));
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
            retryUnauthorized: false,
        });
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

        await auth.logout();

        expect(bff.request).toHaveBeenCalledWith('/api/auth/logout', {
            method: 'POST',
            auth: 'none',
            retryUnauthorized: false,
        });
        expect(auth.session.value).toBeNull();
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
