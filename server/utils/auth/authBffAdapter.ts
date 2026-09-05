import { createError, type H3Event } from 'h3';
import type { BffAdapter } from './authTypes';

function isLoopbackUpstream(upstreamBase: string): boolean {
    try {
        const { hostname } = new URL(upstreamBase);

        return (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1'
        );
    } catch {
        return false;
    }
}

function assertProductionUpstream(upstreamBase: string): void {
    if (process.env.NODE_ENV !== 'production') return;

    if (!isLoopbackUpstream(upstreamBase)) return;

    throw createError({
        statusCode: 500,
        statusMessage:
            'Production backend URL cannot point to localhost. Set NUXT_API_UPSTREAM to the public backend URL.',
        message:
            'Production backend URL cannot point to localhost. Set NUXT_API_UPSTREAM to the public backend URL.',
    });
}

export function resolveBffAdapterFromConfig(config: {
    adapter?: unknown;
    apiUpstream?: unknown;
    publicApiBase?: unknown;
}): BffAdapter {
    const explicitAdapter = String(config.adapter ?? '')
        .trim()
        .toLowerCase();
    const rawUpstream = String(config.apiUpstream || config.publicApiBase || '')
        .trim()
        .replace(/\/$/, '');

    if (explicitAdapter === 'mock') {
        return { mode: 'mock' };
    }

    if (explicitAdapter === 'upstream') {
        if (!rawUpstream) {
            throw createError({
                statusCode: 500,
                statusMessage:
                    'NUXT_BFF_ADAPTER=upstream requires NUXT_API_UPSTREAM or NUXT_PUBLIC_API_BASE',
            });
        }

        assertProductionUpstream(rawUpstream);

        return { mode: 'upstream', upstreamBase: rawUpstream };
    }

    if (explicitAdapter) {
        throw createError({
            statusCode: 500,
            statusMessage: 'NUXT_BFF_ADAPTER must be "upstream" or "mock"',
        });
    }

    if (!rawUpstream) {
        return { mode: 'mock' };
    }

    assertProductionUpstream(rawUpstream);

    return { mode: 'upstream', upstreamBase: rawUpstream };
}

export function resolveBffAdapter(event: H3Event): BffAdapter {
    const c = useRuntimeConfig(event);

    return resolveBffAdapterFromConfig({
        adapter: c.bffAdapter,
        apiUpstream: c.apiUpstream,
        publicApiBase: c.public?.apiBase,
    });
}
