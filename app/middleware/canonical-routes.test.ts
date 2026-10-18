import { afterEach, describe, expect, it, vi } from 'vitest';

interface Target {
    path: string;
    query: Record<string, string | string[]>;
    hash: string;
}

describe('canonical route middleware', () => {
    afterEach(() => vi.unstubAllGlobals());

    async function load() {
        const navigate = vi.fn();

        vi.stubGlobal(
            'defineNuxtRouteMiddleware',
            (handler: (to: Target) => unknown) => handler,
        );
        vi.stubGlobal('navigateTo', navigate);
        const module = await import('./00.canonical-routes.global');

        return {
            run: module.default as unknown as (to: Target) => unknown,
            navigate,
        };
    }

    it('maps a known legacy URL without losing query arrays or hash', async () => {
        const { run, navigate } = await load();
        const query = { tag: ['one', 'two'], schoolId: 'school-1' };

        run({ path: '/manager/students/user-1', query, hash: '#payments' });
        expect(navigate).toHaveBeenCalledWith(
            { path: '/menedzer/kursanci/user-1', query, hash: '#payments' },
            { replace: true, redirectCode: 302 },
        );
    });

    it.each([
        '/menedzer/kursanci/user-1',
        '/api/vehicles',
        '/unknown',
        '/reset-password',
        '/ustaw-haslo',
    ])(
        'does not redirect canonical, unknown or recovery paths: %s',
        async (path) => {
            const { run, navigate } = await load();

            run({ path, query: {}, hash: '' });
            expect(navigate).not.toHaveBeenCalled();
        },
    );
});
