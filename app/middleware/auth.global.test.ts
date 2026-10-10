import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
    checkSession: vi.fn(),
    consumeReturnTo: vi.fn(),
    navigateTo: vi.fn(),
    session: { value: null as null | { role: string } },
    setReturnTo: vi.fn(),
}));

vi.mock('~/composables/auth/useAuthSession', () => ({
    useAuthSession: () => ({
        checkSession: authMocks.checkSession,
        session: authMocks.session,
    }),
}));

vi.mock('~/composables/auth/useAuthReturnTo', () => ({
    useAuthReturnTo: () => ({
        consumeReturnTo: authMocks.consumeReturnTo,
        setReturnTo: authMocks.setReturnTo,
    }),
}));

type AuthMiddleware = (to: {
    path: string;
    fullPath: string;
}) => Promise<unknown>;

async function loadMiddleware(): Promise<AuthMiddleware> {
    const module = await import('./auth.global');

    return module.default as unknown as AuthMiddleware;
}

describe('global auth middleware', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        authMocks.session.value = null;
        vi.stubGlobal(
            'defineNuxtRouteMiddleware',
            (middleware: AuthMiddleware) => middleware,
        );
        vi.stubGlobal('navigateTo', authMocks.navigateTo);
    });

    it('skips session checks on login when there is no local session', async () => {
        const middleware = await loadMiddleware();

        await middleware({ path: '/login', fullPath: '/login' });

        expect(authMocks.checkSession).not.toHaveBeenCalled();
        expect(authMocks.navigateTo).not.toHaveBeenCalled();
    });

    it('verifies an existing session before redirecting from login', async () => {
        authMocks.session.value = { role: 'MANAGER' };
        authMocks.checkSession.mockResolvedValue(true);
        authMocks.consumeReturnTo.mockReturnValue('/manager/students');
        const middleware = await loadMiddleware();

        await middleware({ path: '/login', fullPath: '/login' });

        expect(authMocks.checkSession).toHaveBeenCalledOnce();
        expect(authMocks.navigateTo).toHaveBeenCalledWith('/manager/students', {
            replace: true,
        });
        expect(authMocks.setReturnTo).not.toHaveBeenCalled();
    });

    it('stores the protected destination before redirecting to login', async () => {
        authMocks.checkSession.mockResolvedValue(false);
        authMocks.navigateTo.mockResolvedValue(undefined);
        const middleware = await loadMiddleware();

        await middleware({
            path: '/manager/students',
            fullPath: '/manager/students?status=active',
        });

        expect(authMocks.setReturnTo).toHaveBeenCalledWith(
            '/manager/students?status=active',
        );
        expect(authMocks.navigateTo).toHaveBeenCalledWith('/login');
    });
});
