import { createError, deleteCookie, getCookie, type H3Event } from 'h3';
import {
    clearAccessCookie,
    clearSessionCookies,
    setAccessTokenCookie,
    syncRefreshCookieFromResponse,
} from '~~/server/utils/upstream/upstreamCookies';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import type { BffAuthUserResponse } from './authTypes';

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
): Promise<{ success: true; data: { user: BffAuthUserResponse } }> {
    const { data } = await upstreamRequest<{ user: BffAuthUserResponse }>(
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
