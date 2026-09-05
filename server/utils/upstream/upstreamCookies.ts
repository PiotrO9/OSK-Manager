import {
    createError,
    deleteCookie,
    getCookie,
    setCookie,
    type H3Event,
} from 'h3';

function resolveCookieSecure(): boolean {
    const override = process.env.NUXT_COOKIE_SECURE?.trim().toLowerCase();

    if (override === 'true') return true;

    if (override === 'false') return false;

    return process.env.NODE_ENV === 'production';
}

export function cookieBaseOptions() {
    return {
        httpOnly: true as const,
        secure: resolveCookieSecure(),
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

export function readAccessToken(event: H3Event): string {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    return access;
}

export function readRefreshToken(event: H3Event): string {
    const refresh = getCookie(event, 'refresh_token');

    if (!refresh) {
        throw createError({
            statusCode: 401,
            message: 'Brak refresh token',
        });
    }

    return refresh;
}
