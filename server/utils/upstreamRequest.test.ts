import { describe, expect, it, vi } from 'vitest';
import type { H3Event } from 'h3';
import {
    parseBackendEnvelopeFromResponseText,
    parseRefreshFromSetCookieLines,
    upstreamRequest,
} from './upstreamRequest';
import { bffUpstreamRefresh } from './authUpstreamBff';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers as Record<string, string> | undefined),
        },
    });
}

function mockEvent(cookie = 'access_token=access; refresh_token=refresh') {
    const headers: Record<string, string> = {};

    return {
        event: {
            node: {
                req: {
                    headers: cookie ? { cookie } : {},
                },
                res: {
                    getHeader(name: string) {
                        return headers[name.toLowerCase()];
                    },
                    setHeader(name: string, value: string | string[]) {
                        headers[name.toLowerCase()] = Array.isArray(value)
                            ? value.join('\n')
                            : value;
                    },
                    appendHeader(name: string, value: string | string[]) {
                        const key = name.toLowerCase();
                        const next = Array.isArray(value)
                            ? value.join('\n')
                            : value;

                        headers[key] = headers[key]
                            ? `${headers[key]}\n${next}`
                            : next;
                    },
                    removeHeader(name: string) {
                        Reflect.deleteProperty(headers, name.toLowerCase());
                    },
                },
            },
        } as unknown as H3Event,
        headers,
    };
}

describe('parseBackendEnvelopeFromResponseText', () => {
    it('parses successful JSON envelopes', () => {
        const envelope = parseBackendEnvelopeFromResponseText<{ ok: boolean }>(
            jsonResponse({ success: true }),
            JSON.stringify({ success: true, data: { ok: true } }),
            { fallbackError: 'fallback' },
        );

        expect(envelope).toEqual({ success: true, data: { ok: true } });
    });

    it('treats empty 204 as success when allowed', () => {
        const envelope = parseBackendEnvelopeFromResponseText(
            new Response(null, { status: 204 }),
            '',
            { fallbackError: 'fallback', allowEmptySuccess: true },
        );

        expect(envelope).toEqual({ success: true });
    });

    it('throws a mapped error for HTML responses', () => {
        expect(() =>
            parseBackendEnvelopeFromResponseText(
                new Response('<html></html>', { status: 404 }),
                '<html></html>',
                {
                    fallbackError: 'fallback',
                    notFoundHtmlError: 'missing endpoint',
                },
            ),
        ).toThrow('missing endpoint');
    });

    it('throws for invalid JSON', () => {
        expect(() =>
            parseBackendEnvelopeFromResponseText(
                new Response('nope', { status: 200 }),
                'nope',
                {
                    fallbackError: 'fallback',
                    invalidJsonError: 'invalid json',
                },
            ),
        ).toThrow('invalid json');
    });
});

describe('upstreamRequest', () => {
    it('adds bearer auth and unwraps success data', async () => {
        const { event } = mockEvent();
        const fetchImpl: typeof fetch = vi.fn(
            async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
                expect(
                    (init?.headers as Record<string, string>).Authorization,
                ).toBe('Bearer access');

                return jsonResponse({ success: true, data: { ok: true } });
            },
        );

        const result = await upstreamRequest<{ ok: boolean }>(
            event,
            'https://api.example.test',
            {
                path: '/events',
                fallbackError: 'failed',
                fetchImpl,
            },
        );

        expect(result.data).toEqual({ ok: true });
        expect(fetchImpl).toHaveBeenCalledWith(
            'https://api.example.test/events',
            expect.objectContaining({ method: 'GET' }),
        );
    });

    it('maps success:false envelopes to errors', async () => {
        const { event } = mockEvent();

        await expect(
            upstreamRequest(event, 'https://api.example.test', {
                path: '/events',
                fallbackError: 'failed',
                fetchImpl: async () =>
                    jsonResponse(
                        { success: false, error: 'domain failed' },
                        { status: 422 },
                    ),
            }),
        ).rejects.toThrow('domain failed');
    });

    it('requires access token for authenticated requests', async () => {
        const { event } = mockEvent('');
        const fetchImpl = vi.fn();

        await expect(
            upstreamRequest(event, 'https://api.example.test', {
                path: '/events',
                fallbackError: 'failed',
                fetchImpl,
            }),
        ).rejects.toThrow('Brak tokena dostępu');
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('does not set Content-Type for FormData bodies', async () => {
        const { event } = mockEvent();
        const form = new FormData();

        form.append('file', new Blob(['x']), 'x.txt');

        await upstreamRequest(event, 'https://api.example.test', {
            path: '/upload',
            method: 'POST',
            body: form,
            fallbackError: 'failed',
            fetchImpl: async (_url, init) => {
                expect(init?.headers).not.toHaveProperty('Content-Type');

                return jsonResponse({ success: true });
            },
        });
    });

    it('maps backend connection failures to a deployment configuration error', async () => {
        const { event } = mockEvent();

        await expect(
            upstreamRequest(event, 'https://api.example.test', {
                path: '/auth/login',
                method: 'POST',
                auth: false,
                body: { email: 'manager001@post.pl', password: 'secret' },
                fallbackError: 'failed',
                fetchImpl: async () => {
                    throw new TypeError('fetch failed');
                },
            }),
        ).rejects.toThrow('Cannot connect to backend API');
    });
});

describe('refresh cookie propagation', () => {
    it('reads refresh cookies from upstream Set-Cookie lines', () => {
        expect(
            parseRefreshFromSetCookieLines([
                'refresh_token=next; Max-Age=123; Path=/auth; HttpOnly',
            ]),
        ).toEqual({ value: 'next', maxAge: 123 });
    });

    it('updates access and rotated refresh cookies after upstream refresh', async () => {
        const { event, headers } = mockEvent();

        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                jsonResponse(
                    {
                        success: true,
                        data: { access_token: 'new.access.token' },
                    },
                    {
                        headers: {
                            'Set-Cookie':
                                'refresh_token=next-refresh; Max-Age=456; Path=/auth; HttpOnly',
                        },
                    },
                ),
            ),
        );

        await bffUpstreamRefresh(event, 'https://api.example.test');

        expect(headers['set-cookie']).toContain('access_token=');
        expect(headers['set-cookie']).toContain('refresh_token=next-refresh');

        vi.unstubAllGlobals();
    });
});
