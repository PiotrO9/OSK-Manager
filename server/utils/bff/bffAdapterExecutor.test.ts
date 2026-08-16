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
});
