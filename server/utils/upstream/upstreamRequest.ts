import { createError, type H3Event } from 'h3';
import { buildBodyAndHeaders } from './upstreamBody';
import {
    clearAccessCookie,
    clearSessionCookies,
    readAccessToken,
    readRefreshToken,
} from './upstreamCookies';
import { parseBackendEnvelopeFromResponseText } from './upstreamEnvelope';
import type {
    UpstreamRequestOptions,
    UpstreamRequestResult,
} from './upstreamTypes';
import { buildUpstreamUrl } from './upstreamUrl';

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
    const upstreamUrl = buildUpstreamUrl(
        upstreamBase,
        options.path,
        options.query,
    );
    let res: Response;

    try {
        res = await (options.fetchImpl ?? fetch)(upstreamUrl, {
            method: options.method ?? 'GET',
            headers,
            ...(body !== undefined ? { body } : {}),
        });
    } catch {
        throw createError({
            statusCode: 502,
            statusMessage:
                'Cannot connect to backend API. Check NUXT_API_UPSTREAM in deployment environment variables.',
            message:
                'Cannot connect to backend API. Check NUXT_API_UPSTREAM in deployment environment variables.',
        });
    }

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
