import type { H3Event } from 'h3';
import { resolveBffAdapter } from '~~/server/utils/auth/authUpstreamBff';

export interface BffAdapterUpstreamContext {
    event: H3Event;
    mode: 'upstream';
    upstreamBase: string;
}

export interface BffAdapterMockContext {
    event: H3Event;
    mode: 'mock';
}

export interface ExecuteBffAdapterOptions<T> {
    upstream: (context: BffAdapterUpstreamContext) => T | Promise<T>;
    mock: (context: BffAdapterMockContext) => T | Promise<T>;
}

export async function executeBffAdapter<T>(
    event: H3Event,
    options: ExecuteBffAdapterOptions<T>,
): Promise<T> {
    const adapter = resolveBffAdapter(event);

    if (adapter.mode === 'upstream') {
        return options.upstream({
            event,
            mode: 'upstream',
            upstreamBase: adapter.upstreamBase,
        });
    }

    return options.mock({
        event,
        mode: 'mock',
    });
}
