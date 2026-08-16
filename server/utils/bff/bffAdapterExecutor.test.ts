import type { H3Event } from 'h3';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeBffAdapter } from './bffAdapterExecutor';

function stubRuntimeConfig(config: {
    bffAdapter?: string;
    apiUpstream?: string;
    publicApiBase?: string;
}): void {
    vi.stubGlobal('useRuntimeConfig', () => ({
        bffAdapter: config.bffAdapter,
        apiUpstream: config.apiUpstream,
        public: {
            apiBase: config.publicApiBase,
        },
    }));
}

describe('executeBffAdapter', () => {
    const event = {} as H3Event;

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('uses the explicit upstream adapter', async () => {
        stubRuntimeConfig({
            bffAdapter: 'upstream',
            apiUpstream: 'http://localhost:4000/',
        });

        await expect(
            executeBffAdapter(event, {
                upstream: ({ mode, upstreamBase }) => ({
                    mode,
                    upstreamBase,
                }),
                mock: () => ({ mode: 'mock' }),
            }),
        ).resolves.toEqual({
            mode: 'upstream',
            upstreamBase: 'http://localhost:4000',
        });
    });

    it('uses the explicit mock adapter', async () => {
        stubRuntimeConfig({
            bffAdapter: 'mock',
            apiUpstream: 'http://localhost:4000',
        });

        await expect(
            executeBffAdapter(event, {
                upstream: () => ({ mode: 'upstream' }),
                mock: ({ mode }) => ({ mode }),
            }),
        ).resolves.toEqual({ mode: 'mock' });
    });

    it('falls back to upstream when a base URL is configured', async () => {
        stubRuntimeConfig({
            publicApiBase: 'http://localhost:4000/',
        });

        await expect(
            executeBffAdapter(event, {
                upstream: ({ mode, upstreamBase }) => ({
                    mode,
                    upstreamBase,
                }),
                mock: () => ({ mode: 'mock' }),
            }),
        ).resolves.toEqual({
            mode: 'upstream',
            upstreamBase: 'http://localhost:4000',
        });
    });

    it('falls back to mock when no base URL is configured', async () => {
        stubRuntimeConfig({});

        await expect(
            executeBffAdapter(event, {
                upstream: () => ({ mode: 'upstream' }),
                mock: ({ mode }) => ({ mode }),
            }),
        ).resolves.toEqual({ mode: 'mock' });
    });

    it('rejects the explicit upstream adapter without an upstream URL', async () => {
        stubRuntimeConfig({
            bffAdapter: 'upstream',
        });

        await expect(
            executeBffAdapter(event, {
                upstream: () => ({ mode: 'upstream' }),
                mock: () => ({ mode: 'mock' }),
            }),
        ).rejects.toThrow(
            'NUXT_BFF_ADAPTER=upstream requires NUXT_API_UPSTREAM or NUXT_PUBLIC_API_BASE',
        );
    });

    it('does not execute the inactive adapter callback', async () => {
        stubRuntimeConfig({
            bffAdapter: 'upstream',
            apiUpstream: 'http://localhost:4000',
        });

        const upstream = vi.fn(() => ({ mode: 'upstream' }));
        const mock = vi.fn(() => ({ mode: 'mock' }));

        await expect(
            executeBffAdapter(event, {
                upstream,
                mock,
            }),
        ).resolves.toEqual({ mode: 'upstream' });

        expect(upstream).toHaveBeenCalledOnce();
        expect(mock).not.toHaveBeenCalled();
    });
});
