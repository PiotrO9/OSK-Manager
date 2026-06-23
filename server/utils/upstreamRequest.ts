import {
    createError,
    deleteCookie,
    getCookie,
    setCookie,
    type H3Event,
} from 'h3';

export interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export type UpstreamMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface UpstreamRequestOptions {
    method?: UpstreamMethod;
    path: string;
    query?:
        | URLSearchParams
        | Record<string, string | number | boolean | null | undefined>;
    headers?: Record<string, string>;
    body?: unknown;
    auth?: boolean;
    refreshCookie?: boolean;
    fallbackError: string;
    invalidJsonError?: string;
    htmlError?: string;
    notFoundHtmlError?: string;
    allowEmptySuccess?: boolean;
    clearCookiesOnUnauthorized?: 'none' | 'access' | 'session';
    fetchImpl?: typeof fetch;
}

export interface UpstreamRequestResult<T = unknown> {
    response: Response;
    envelope: BackendEnvelope<T>;
    data: T | undefined;
}

export function cookieBaseOptions() {
    return {
        httpOnly: true as const,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/' as const,
    };
}

export function clearAccessCookie(event: H3Event): void {
    deleteCookie(event, 'access_token', { path: '/' });
}

export function clearSessionCookies(event: H3Event): void {
    deleteCookie(event, 'access_token', { path: '/' });
    deleteCookie(event, 'refresh_token', { path: '/' });
}

export function accessCookieMaxAgeSeconds(
    token: string,
    fallbackSec: number,
): number {
    try {
        const part = token.split('.')[1];

        if (!part) return fallbackSec;

        const json = JSON.parse(
            Buffer.from(part, 'base64url').toString('utf8'),
        ) as { exp?: number };
        const now = Math.floor(Date.now() / 1000);

        if (!json.exp || json.exp <= now) return fallbackSec;

        return json.exp - now;
    } catch {
        return fallbackSec;
    }
}

export function setAccessTokenCookie(
    event: H3Event,
    accessToken: string,
    fallbackMaxAgeSec = 3600,
): void {
    setCookie(event, 'access_token', accessToken, {
        ...cookieBaseOptions(),
        maxAge: accessCookieMaxAgeSeconds(accessToken, fallbackMaxAgeSec),
    });
}

export function getSetCookieLines(res: Response): string[] {
    const fn = res.headers.getSetCookie?.bind(res.headers);

    if (fn) {
        const list = fn();

        if (list.length) return list;
    }

    const single = res.headers.get('set-cookie');

    if (!single) return [];

    return [single];
}

export function parseRefreshFromSetCookieLines(
    lines: string[],
): { value: string; maxAge: number } | null {
    for (const line of lines) {
        if (!/^\s*refresh_token=/i.test(line)) continue;

        const main = line.split(';')[0] ?? '';
        const eq = main.indexOf('=');

        if (eq < 0) continue;

        const value = main.slice(eq + 1).trim();
        const maxAgeM = /Max-Age=(\d+)/i.exec(line);
        const maxAgeRaw = maxAgeM?.[1];
        const maxAge = maxAgeRaw ? parseInt(maxAgeRaw, 10) : 60 * 60 * 24 * 30;

        return { value, maxAge };
    }

    return null;
}

export function syncRefreshCookieFromResponse(
    event: H3Event,
    res: Response,
): void {
    const parsed = parseRefreshFromSetCookieLines(getSetCookieLines(res));

    if (!parsed) return;

    setCookie(event, 'refresh_token', parsed.value, {
        ...cookieBaseOptions(),
        maxAge: parsed.maxAge,
    });
}

export function buildUpstreamUrl(
    upstreamBase: string,
    path: string,
    query?: UpstreamRequestOptions['query'],
): string {
    const cleanBase = upstreamBase.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${cleanBase}${cleanPath}`);

    if (query instanceof URLSearchParams) {
        query.forEach((value, key) => url.searchParams.set(key, value));
    } else if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === null || value === undefined) continue;

            url.searchParams.set(key, String(value));
        }
    }

    return url.toString();
}

function readAccessToken(event: H3Event): string {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    return access;
}

function readRefreshToken(event: H3Event): string {
    const refresh = getCookie(event, 'refresh_token');

    if (!refresh) {
        throw createError({
            statusCode: 401,
            message: 'Brak refresh token',
        });
    }

    return refresh;
}

export function parseBackendEnvelopeFromResponseText<T>(
    res: Response,
    text: string,
    options: {
        fallbackError: string;
        invalidJsonError?: string;
        htmlError?: string;
        notFoundHtmlError?: string;
        allowEmptySuccess?: boolean;
    },
): BackendEnvelope<T> {
    const trimmed = text.trim();

    if (trimmed === '') {
        if (res.ok && (res.status === 204 || options.allowEmptySuccess)) {
            return { success: true };
        }

        throw createError({
            statusCode:
                res.status >= 400 && res.status < 600 ? res.status : 502,
            statusMessage:
                options.htmlError ??
                'Serwer zwrócił pustą odpowiedź zamiast JSON.',
        });
    }

    if (trimmed.startsWith('<')) {
        throw createError({
            statusCode:
                res.status >= 400 && res.status < 600 ? res.status : 502,
            statusMessage:
                res.status === 404 && options.notFoundHtmlError
                    ? options.notFoundHtmlError
                    : (options.htmlError ??
                      'Serwer zwrócił odpowiedź HTML zamiast JSON.'),
        });
    }

    try {
        return JSON.parse(text) as BackendEnvelope<T>;
    } catch {
        throw createError({
            statusCode: 502,
            statusMessage:
                options.invalidJsonError ??
                'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
        });
    }
}

function buildBodyAndHeaders(
    body: unknown,
    headers: Record<string, string>,
): BodyInit | undefined {
    if (body === undefined) return undefined;

    if (body instanceof FormData) {
        return body;
    }

    headers['Content-Type'] ??= 'application/json';

    if (
        typeof body === 'string' ||
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        body instanceof URLSearchParams
    ) {
        return body as BodyInit;
    }

    return JSON.stringify(body ?? {});
}

function clearUnauthorizedCookies(
    event: H3Event,
    strategy: UpstreamRequestOptions['clearCookiesOnUnauthorized'],
): void {
    if (strategy === 'session') {
        clearSessionCookies(event);
    } else if (strategy === 'access') {
        clearAccessCookie(event);
    }
}

export async function upstreamRequest<T = unknown>(
    event: H3Event,
    upstreamBase: string,
    options: UpstreamRequestOptions,
): Promise<UpstreamRequestResult<T>> {
    const headers: Record<string, string> = { ...options.headers };

    if (options.auth !== false) {
        headers.Authorization = `Bearer ${readAccessToken(event)}`;
    }

    if (options.refreshCookie) {
        headers.Cookie = `refresh_token=${readRefreshToken(event)}`;
    }

    const body = buildBodyAndHeaders(options.body, headers);
    const res = await (options.fetchImpl ?? fetch)(
        buildUpstreamUrl(upstreamBase, options.path, options.query),
        {
            method: options.method ?? 'GET',
            headers,
            ...(body !== undefined ? { body } : {}),
        },
    );
    const text = await res.text();
    const envelope = parseBackendEnvelopeFromResponseText<T>(res, text, {
        fallbackError: options.fallbackError,
        invalidJsonError: options.invalidJsonError,
        htmlError: options.htmlError,
        notFoundHtmlError: options.notFoundHtmlError,
        allowEmptySuccess: options.allowEmptySuccess,
    });

    if (!res.ok || !envelope.success) {
        if (res.status === 401) {
            clearUnauthorizedCookies(
                event,
                options.clearCookiesOnUnauthorized ?? 'access',
            );
        }

        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof envelope.error === 'string'
                    ? envelope.error
                    : options.fallbackError,
        });
    }

    return {
        response: res,
        envelope,
        data: envelope.data,
    };
}
