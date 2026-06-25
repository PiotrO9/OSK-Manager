import {
    createError,
    deleteCookie,
    getCookie,
    setResponseStatus,
    type H3Event,
} from 'h3';
import {
    clearAccessCookie,
    clearSessionCookies,
    setAccessTokenCookie,
    syncRefreshCookieFromResponse,
    upstreamRequest,
} from './upstreamRequest';

export type BffAdapter =
    | { mode: 'upstream'; upstreamBase: string }
    | { mode: 'mock' };

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

export function resolveUpstreamBase(event: H3Event): string {
    const adapter = resolveBffAdapter(event);

    return adapter.mode === 'upstream' ? adapter.upstreamBase : '';
}

type ProfilePatchPayload = Record<string, string | null | undefined>;

export async function bffUpstreamLogin(
    event: H3Event,
    upstreamBase: string,
    body: { email?: string; password?: string },
): Promise<{ success: true; data: { user: unknown } }> {
    const { data, response } = await upstreamRequest<{
        user: unknown;
        access_token: string;
    }>(event, upstreamBase, {
        path: '/auth/login',
        method: 'POST',
        auth: false,
        body: {
            email: body.email,
            password: body.password,
        },
        fallbackError: 'Błąd logowania',
        clearCookiesOnUnauthorized: 'none',
    });

    if (!data?.access_token) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    setAccessTokenCookie(event, data.access_token);
    syncRefreshCookieFromResponse(event, response);

    return {
        success: true,
        data: {
            user: data.user,
        },
    };
}

export async function bffUpstreamRefresh(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: object }> {
    const { data, response } = await upstreamRequest<{
        access_token: string;
    }>(event, upstreamBase, {
        path: '/auth/refresh',
        method: 'POST',
        auth: false,
        refreshCookie: true,
        fallbackError: 'Błąd odświeżania',
        clearCookiesOnUnauthorized: 'session',
    });

    if (!data?.access_token) {
        clearSessionCookies(event);
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    setAccessTokenCookie(event, data.access_token);
    syncRefreshCookieFromResponse(event, response);

    return { success: true, data: {} };
}

export async function bffUpstreamMe(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: { user: unknown } }> {
    const { data } = await upstreamRequest<{ user: unknown }>(
        event,
        upstreamBase,
        {
            path: '/auth/me',
            method: 'GET',
            fallbackError: 'Sesja nieważna',
            clearCookiesOnUnauthorized: 'access',
        },
    );

    if (!data?.user) {
        clearAccessCookie(event);
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { user: data.user },
    };
}

export async function bffUpstreamProfilePatch(
    event: H3Event,
    upstreamBase: string,
    body: ProfilePatchPayload,
): Promise<{ success: true; data: { user: unknown } }> {
    const { data } = await upstreamRequest<{ user?: unknown }>(
        event,
        upstreamBase,
        {
            path: '/auth/profile',
            method: 'PATCH',
            body,
            fallbackError: 'Nie udało się zaktualizować profilu',
            clearCookiesOnUnauthorized: 'access',
        },
    );

    if (!data?.user || typeof data.user !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { user: data.user },
    };
}

export async function bffUpstreamProfileAvatarUpload(
    event: H3Event,
    upstreamBase: string,
    file: Blob,
    filename: string,
): Promise<{ success: true; data: { photoUrl: string } }> {
    const form = new FormData();

    form.append('file', file, filename);

    const { data } = await upstreamRequest<{ photoUrl?: string }>(
        event,
        upstreamBase,
        {
            path: '/auth/profile/avatar',
            method: 'POST',
            body: form,
            fallbackError: 'Nie udało się przesłać avatara',
            clearCookiesOnUnauthorized: 'access',
        },
    );

    const photoUrl =
        typeof data?.photoUrl === 'string' && data.photoUrl.trim().length > 0
            ? data.photoUrl.trim()
            : '';

    if (!photoUrl) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { photoUrl },
    };
}

export async function bffUpstreamRegister(
    event: H3Event,
    upstreamBase: string,
    body: unknown,
): Promise<unknown> {
    const { response, envelope } = await upstreamRequest<unknown>(
        event,
        upstreamBase,
        {
            path: '/auth/register',
            method: 'POST',
            body: body ?? {},
            fallbackError: 'Nie udało się utworzyć konta instruktora',
            clearCookiesOnUnauthorized: 'access',
        },
    );

    setResponseStatus(event, response.status);

    return envelope;
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

    if (refresh) {
        headers.Cookie = `refresh_token=${refresh}`;
    }

    try {
        await fetch(`${upstreamBase}/auth/logout`, {
            method: 'POST',
            headers,
        });
    } catch {
        /* Local cookie cleanup is still required. */
    }

    deleteCookie(event, 'access_token', { path: '/' });
    deleteCookie(event, 'refresh_token', { path: '/' });

    return { success: true };
}
