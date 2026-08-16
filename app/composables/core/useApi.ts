import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { assertBooleanSuccessEnvelope } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    createBffClient,
    type BffClient,
    type BffFetch,
    type BffRequestOptions,
} from '~/utils/api/bffClient';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
    /** Body żądania - może być wartością, Ref lub getterem (reaktywne). */
    body?: MaybeRefOrGetter<unknown>;
    headers?: Record<string, string>;
    skipAuth?: boolean;
    signal?: AbortSignal;
}

export interface RequestBffDataOptions<T> extends ApiRequestOptions {
    fallbackMessage: string;
    invalidMessage?: string;
    normalize?: (data: unknown) => T | null;
}

export interface RequestBffSuccessOptions extends ApiRequestOptions {
    fallbackMessage: string;
}

export interface ApiError extends Error {
    statusCode?: number;
    data?: unknown;
}

function isAbsoluteHttpUrl(path: string): boolean {
    return path.startsWith('http://') || path.startsWith('https://');
}

function resolveSameOriginEndpoint(path: string): string {
    if (isAbsoluteHttpUrl(path)) {
        return path;
    }

    const clean = path.startsWith('/') ? path : `/${path}`;

    if (import.meta.client) {
        return `${window.location.origin}${clean}`;
    }

    const { origin } = useRequestURL();

    return `${origin}${clean}`;
}

function buildBffRequestOptions(
    method: Method,
    options: ApiRequestOptions,
): BffRequestOptions {
    return {
        method,
        body: toValue(options.body),
        headers: options.headers,
        auth: options.skipAuth ? 'none' : 'required',
        retryUnauthorized: options.skipAuth ? false : true,
        signal: options.signal,
    };
}

function createRequestBffDataError(
    err: unknown,
    fallbackMessage: string,
): Error {
    const message = getApiFetchErrorMessage(err, fallbackMessage);
    const out = new Error(message) as ApiError;

    if (err !== null && typeof err === 'object') {
        if ('statusCode' in err) {
            const code = (err as { statusCode: unknown }).statusCode;

            if (typeof code === 'number') {
                out.statusCode = code;
            }
        }

        if ('data' in err) {
            out.data = (err as { data: unknown }).data;
        }
    }

    return out;
}

export async function requestBffData<T = unknown>(
    method: Method,
    path: string,
    options: RequestBffDataOptions<T>,
): Promise<T> {
    try {
        const client = getActiveBffClient();
        const data = await client.requestData<unknown>(
            path,
            buildBffRequestOptions(method, options),
        );

        if (!options.normalize) {
            return data as T;
        }

        const normalized = options.normalize(data);

        if (normalized === null) {
            throw new Error(
                options.invalidMessage ?? 'Nieprawidłowa odpowiedź serwera.',
            );
        }

        return normalized;
    } catch (err) {
        throw createRequestBffDataError(err, options.fallbackMessage);
    }
}

export async function bffFetch<T = unknown>(
    method: Method,
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const client = getActiveBffClient();

    return await client.request<T>(
        path,
        buildBffRequestOptions(method, options),
    );
}

export async function requestBffSuccess(
    method: Method,
    path: string,
    options: RequestBffSuccessOptions,
): Promise<void> {
    try {
        const raw = await bffFetch<unknown>(method, path, options);

        assertBooleanSuccessEnvelope(raw);
    } catch (err) {
        throw createRequestBffDataError(err, options.fallbackMessage);
    }
}

function getActiveBffClient(): BffClient {
    const provided = getProvidedBffClient();

    if (provided) {
        return provided;
    }

    return createBffClient({
        fetch: $fetch as BffFetch,
        resolveEndpoint: resolveSameOriginEndpoint,
        onAuthFailure: clearAuthSessionState,
    });
}

function getProvidedBffClient(): BffClient | null {
    try {
        const nuxtApp = useNuxtApp() as { $bff?: BffClient };

        return nuxtApp.$bff ?? null;
    } catch {
        return null;
    }
}

function clearAuthSessionState(): void {
    try {
        const session = useState<unknown | null>('auth_session', () => null);

        session.value = null;
    } catch {
        // Keep the pure client usable outside Nuxt context.
    }
}
