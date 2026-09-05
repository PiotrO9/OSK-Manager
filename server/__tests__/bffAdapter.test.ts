import { describe, expect, it } from 'vitest';
import { resolveBffAdapterFromConfig } from '../utils/auth/authBffAdapter';

describe('resolveBffAdapterFromConfig', () => {
    it('uses explicit upstream adapter and trims the upstream URL', () => {
        expect(
            resolveBffAdapterFromConfig({
                adapter: 'upstream',
                apiUpstream: 'http://localhost:4000/',
            }),
        ).toEqual({
            mode: 'upstream',
            upstreamBase: 'http://localhost:4000',
        });
    });

    it('uses explicit mock adapter even when upstream is configured', () => {
        expect(
            resolveBffAdapterFromConfig({
                adapter: 'mock',
                apiUpstream: 'http://localhost:4000',
            }),
        ).toEqual({ mode: 'mock' });
    });

    it('falls back to upstream when a base URL is configured', () => {
        expect(
            resolveBffAdapterFromConfig({
                publicApiBase: 'http://localhost:4000/',
            }),
        ).toEqual({
            mode: 'upstream',
            upstreamBase: 'http://localhost:4000',
        });
    });

    it('falls back to mock when no base URL is configured', () => {
        expect(resolveBffAdapterFromConfig({})).toEqual({ mode: 'mock' });
    });

    it('rejects invalid explicit adapter values', () => {
        expect(() => resolveBffAdapterFromConfig({ adapter: 'demo' })).toThrow(
            'NUXT_BFF_ADAPTER must be "upstream" or "mock"',
        );
    });

    it('rejects explicit upstream without an upstream URL', () => {
        expect(() =>
            resolveBffAdapterFromConfig({ adapter: 'upstream' }),
        ).toThrow(
            'NUXT_BFF_ADAPTER=upstream requires NUXT_API_UPSTREAM or NUXT_PUBLIC_API_BASE',
        );
    });

    it('rejects localhost upstreams in production', () => {
        const previousNodeEnv = process.env.NODE_ENV;

        process.env.NODE_ENV = 'production';

        try {
            expect(() =>
                resolveBffAdapterFromConfig({
                    adapter: 'upstream',
                    apiUpstream: 'http://localhost:3001',
                }),
            ).toThrow('Production backend URL cannot point to localhost');
        } finally {
            process.env.NODE_ENV = previousNodeEnv;
        }
    });
});
