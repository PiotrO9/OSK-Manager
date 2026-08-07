import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBffClient, type BffFetch } from './bffClient';

function createClient(fetch: BffFetch, onAuthFailure = vi.fn()) {
    return {
        client: createBffClient({
            fetch,
            resolveEndpoint: (path) => `http://localhost:3000${path}`,
            onAuthFailure,
        }),
        onAuthFailure,
    };
}

function httpError(statusCode: number, data?: unknown): Error {
    return Object.assign(new Error(`HTTP ${statusCode}`), {
        statusCode,
        data,
    });
}

describe('createBffClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns successful responses without refreshing', async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true });
        const { client } = createClient(fetch);

        await expect(client.request('/api/items')).resolves.toEqual({
            ok: true,
        });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/api/items',
            expect.objectContaining({
                method: 'GET',
                credentials: 'include',
            }),
        );
    });

    it('does not refresh on non-401 errors', async () => {
        const fetch = vi.fn().mockRejectedValue(httpError(403));
        const { client, onAuthFailure } = createClient(fetch);

        await expect(client.request('/api/items')).rejects.toMatchObject({
            statusCode: 403,
        });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(onAuthFailure).not.toHaveBeenCalled();
    });

    it('refreshes once and retries the original request after 401', async () => {
        const fetch = vi
            .fn()
            .mockRejectedValueOnce(httpError(401))
            .mockResolvedValueOnce({ success: true, data: {} })
            .mockResolvedValueOnce({ ok: true });
        const { client } = createClient(fetch);

        await expect(client.request('/api/items')).resolves.toEqual({
            ok: true,
        });

        expect(fetch).toHaveBeenNthCalledWith(
            1,
            'http://localhost:3000/api/items',
            expect.objectContaining({ method: 'GET' }),
        );
        expect(fetch).toHaveBeenNthCalledWith(
            2,
            'http://localhost:3000/api/auth/refresh',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(fetch).toHaveBeenNthCalledWith(
            3,
            'http://localhost:3000/api/items',
            expect.objectContaining({ method: 'GET' }),
        );
    });

    it('shares one refresh request across parallel 401 responses', async () => {
        let resolveRefresh: (value: unknown) => void = () => undefined;
        const fetch = vi.fn((url: string) => {
            if (url.endsWith('/api/auth/refresh')) {
                return new Promise((resolve) => {
                    resolveRefresh = resolve;
                });
            }

            const matchingCalls = fetch.mock.calls.filter(
                ([calledUrl]) => calledUrl === url,
            );

            if (matchingCalls.length === 1) {
                return Promise.reject(httpError(401));
            }

            return Promise.resolve({ ok: url });
        }) as unknown as BffFetch & ReturnType<typeof vi.fn>;
        const { client } = createClient(fetch);
        const first = client.request('/api/items/1');
        const second = client.request('/api/items/2');

        await Promise.resolve();
        resolveRefresh({ success: true, data: {} });

        await expect(Promise.all([first, second])).resolves.toEqual([
            { ok: 'http://localhost:3000/api/items/1' },
            { ok: 'http://localhost:3000/api/items/2' },
        ]);

        const refreshCalls = fetch.mock.calls.filter(([url]) =>
            String(url).endsWith('/api/auth/refresh'),
        );

        expect(refreshCalls).toHaveLength(1);
    });

    it('does not recursively refresh the refresh endpoint', async () => {
        const fetch = vi.fn().mockRejectedValue(httpError(401));
        const { client } = createClient(fetch);

        await expect(
            client.request('/api/auth/refresh', {
                method: 'POST',
                auth: 'none',
                retryUnauthorized: false,
            }),
        ).rejects.toMatchObject({ statusCode: 401 });

        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('notifies auth failure once when refresh fails', async () => {
        const fetch = vi
            .fn()
            .mockRejectedValueOnce(httpError(401))
            .mockRejectedValueOnce(httpError(401));
        const { client, onAuthFailure } = createClient(fetch);

        await expect(client.request('/api/items')).rejects.toMatchObject({
            statusCode: 401,
        });

        expect(onAuthFailure).toHaveBeenCalledTimes(1);
    });

    it('unwraps data envelopes with requestData', async () => {
        const fetch = vi.fn().mockResolvedValue({
            success: true,
            data: { item: { id: 'abc' } },
        });
        const { client } = createClient(fetch);

        await expect(client.requestData('/api/items/abc')).resolves.toEqual({
            item: { id: 'abc' },
        });
    });

    it('passes AbortSignal to fetch options', async () => {
        const fetch = vi.fn().mockResolvedValue({ ok: true });
        const controller = new AbortController();
        const { client } = createClient(fetch);

        await client.request('/api/items', {
            signal: controller.signal,
        });

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/api/items',
            expect.objectContaining({
                signal: controller.signal,
            }),
        );
    });
});
