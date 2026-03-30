import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

function cookieBaseOptions() {
    return {
        httpOnly: true as const,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/' as const,
    };
}

export function resolveUpstreamBase(event: H3Event): string {
    const c = useRuntimeConfig(event);
    const raw = String(c.apiUpstream || c.public?.apiBase || '').trim();

    if (!raw) return '';

    return raw.replace(/\/$/, '');
}

function getSetCookieLines(res: Response): string[] {
    const fn = res.headers.getSetCookie?.bind(res.headers);

    if (fn) {
        const list = fn();

        if (list.length) return list;
    }

    const single = res.headers.get('set-cookie');

    if (!single) return [];

    return [single];
}

function parseRefreshFromSetCookieLines(
    lines: string[],
): { value: string; maxAge: number } | null {
    for (const line of lines) {
        if (!/^\s*refresh_token=/i.test(line)) continue;

        const main = line.split(';')[0] ?? '';
        const eq = main.indexOf('=');

        if (eq < 0) continue;

        const value = main.slice(eq + 1).trim();
        const maxAgeM = /Max-Age=(\d+)/i.exec(line);
        const maxAge = maxAgeM ? parseInt(maxAgeM[1], 10) : 60 * 60 * 24 * 30;

        return { value, maxAge };
    }

    return null;
}

function accessCookieMaxAgeSeconds(token: string, fallbackSec: number): number {
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

export async function bffUpstreamLogin(
    event: H3Event,
    upstreamBase: string,
    body: { email?: string; password?: string },
): Promise<{ success: true; data: { user: unknown } }> {
    const res = await fetch(`${upstreamBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: body.email,
            password: body.password,
        }),
    });

    const json = (await res.json()) as BackendEnvelope<{
        user: unknown;
        access_token: string;
    }>;

    if (!res.ok || !json.success || !json.data?.access_token) {
        throw createError({
            statusCode: res.status || 400,
            statusMessage:
                typeof json.error === 'string' ? json.error : 'Błąd logowania',
        });
    }

    const access = json.data.access_token;
    const opt = cookieBaseOptions();

    setCookie(event, 'access_token', access, {
        ...opt,
        maxAge: accessCookieMaxAgeSeconds(access, 3600),
    });

    const setLines = getSetCookieLines(res);
    const parsed = parseRefreshFromSetCookieLines(setLines);

    if (parsed) {
        setCookie(event, 'refresh_token', parsed.value, {
            ...opt,
            maxAge: parsed.maxAge,
        });
    }

    return {
        success: true,
        data: {
            user: json.data.user,
        },
    };
}

export async function bffUpstreamRefresh(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: object }> {
    const refresh = getCookie(event, 'refresh_token');

    if (!refresh) {
        throw createError({
            statusCode: 401,
            message: 'Brak refresh token',
        });
    }

    const res = await fetch(`${upstreamBase}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Cookie: `refresh_token=${refresh}`,
        },
    });

    const json = (await res.json()) as BackendEnvelope<{
        access_token: string;
    }>;

    if (!res.ok || !json.success || !json.data?.access_token) {
        deleteCookie(event, 'access_token', { path: '/' });
        deleteCookie(event, 'refresh_token', { path: '/' });

        throw createError({
            statusCode: res.status || 401,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Błąd odświeżania',
        });
    }

    const access = json.data.access_token;
    const opt = cookieBaseOptions();

    setCookie(event, 'access_token', access, {
        ...opt,
        maxAge: accessCookieMaxAgeSeconds(access, 3600),
    });

    return { success: true, data: {} };
}

export async function bffUpstreamMe(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: { user: unknown } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    const json = (await res.json()) as BackendEnvelope<{ user: unknown }>;

    if (!res.ok || !json.success || !json.data?.user) {
        deleteCookie(event, 'access_token', { path: '/' });

        if (res.status !== 401) {
            deleteCookie(event, 'refresh_token', { path: '/' });
        }

        throw createError({
            statusCode: res.status || 401,
            statusMessage:
                typeof json.error === 'string' ? json.error : 'Sesja nieważna',
        });
    }

    return {
        success: true,
        data: { user: json.data.user },
    };
}

export async function bffUpstreamLogout(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true }> {
    const access = getCookie(event, 'access_token');
    const refresh = getCookie(event, 'refresh_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (access) {
        headers.Authorization = `Bearer ${access}`;
    }

    const cookies: string[] = [];

    if (refresh) {
        cookies.push(`refresh_token=${refresh}`);
    }

    if (cookies.length) {
        headers.Cookie = cookies.join('; ');
    }

    try {
        await fetch(`${upstreamBase}/auth/logout`, {
            method: 'POST',
            headers,
        });
    } catch {
        /* lokalne wyczyszczenie i tak jest potrzebne */
    }

    deleteCookie(event, 'access_token', { path: '/' });
    deleteCookie(event, 'refresh_token', { path: '/' });

    return { success: true };
}
