import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, type Ref } from 'vue';

const cookies = new Map<string, Ref<unknown>>();

function installNuxtCookieGlobals(): void {
    vi.stubGlobal(
        'useCookie',
        <T>(name: string, options?: { default?: () => T }): Ref<T> => {
            if (!cookies.has(name)) {
                cookies.set(
                    name,
                    ref(options?.default ? options.default() : null),
                );
            }

            return cookies.get(name) as Ref<T>;
        },
    );
}

describe('useAuthReturnTo', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        cookies.clear();
        installNuxtCookieGlobals();
    });

    it('stores a safe return path and consumes it once after login', async () => {
        const { useAuthReturnTo } = await import('./useAuthReturnTo');
        const returnTo = useAuthReturnTo();

        returnTo.setReturnTo('/manager/lessons?day=2026-08-16');

        expect(returnTo.cookie.value).toBe('/manager/lessons?day=2026-08-16');
        expect(returnTo.consumeReturnTo()).toBe(
            '/manager/lessons?day=2026-08-16',
        );
        expect(returnTo.cookie.value).toBeNull();
        expect(returnTo.consumeReturnTo()).toBeNull();
    });

    it('ignores unsafe return paths and clears tampered cookie values', async () => {
        const { useAuthReturnTo } = await import('./useAuthReturnTo');
        const returnTo = useAuthReturnTo();

        returnTo.setReturnTo('https://example.com/manager');
        returnTo.setReturnTo('//example.com/manager');

        expect(returnTo.cookie.value).toBeNull();

        returnTo.cookie.value = 'https://example.com/manager';

        expect(returnTo.consumeReturnTo()).toBeNull();
        expect(returnTo.cookie.value).toBeNull();
    });
});
