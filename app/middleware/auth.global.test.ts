import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
    checkSession: vi.fn(),
    navigateTo: vi.fn(),
    setReturnTo: vi.fn(),
}));

vi.mock('~/composables/auth/useAuthSession', () => ({
    useAuthSession: () => ({ checkSession: authMocks.checkSession }),
}));

vi.mock('~/composables/auth/useAuthReturnTo', () => ({
    useAuthReturnTo: () => ({ setReturnTo: authMocks.setReturnTo }),
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
        vi.stubGlobal(
            'defineNuxtRouteMiddleware',
            (middleware: AuthMiddleware) => middleware,
        );
        vi.stubGlobal('navigateTo', authMocks.navigateTo);
    });

    it('hydrates an existing session on the public login page', async () => {
        authMocks.checkSession.mockResolvedValue(true);
        const middleware = await loadMiddleware();

        await middleware({ path: '/login', fullPath: '/login' });

        expect(authMocks.checkSession).toHaveBeenCalledOnce();
        expect(authMocks.navigateTo).not.toHaveBeenCalled();
        expect(authMocks.setReturnTo).not.toHaveBeenCalled();
    });

    it('keeps non-authentication public pages free of session requests', async () => {
        const middleware = await loadMiddleware();

        await middleware({ path: '/palette-test', fullPath: '/palette-test' });

        expect(authMocks.checkSession).not.toHaveBeenCalled();
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
