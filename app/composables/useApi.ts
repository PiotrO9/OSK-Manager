import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
    /** Body żądania - może być wartością, Ref lub getterem (reaktywne). */
    body?: MaybeRefOrGetter<unknown>;
    headers?: Record<string, string>;
    skipAuth?: boolean;
}

export interface ApiResponse<T = unknown> {
    data: ComputedRef<T | null>;
    error: ComputedRef<Error | null>;
    isLoading: ComputedRef<boolean>;
    execute: () => Promise<T | null>;
}

export interface ApiError extends Error {
    statusCode?: number;
    data?: unknown;
}

function isApiError(err: unknown): err is ApiError {
    return (
        err !== null &&
        typeof err === 'object' &&
        ('statusCode' in err || err instanceof Error)
    );
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

function buildFetchOptions(
    method: Method,
    options: ApiRequestOptions,
): Parameters<typeof $fetch>[1] {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const fetchOptions: Parameters<typeof $fetch>[1] = {
        method,
        credentials: 'include',
        headers,
    };

    if (method !== 'GET' && options.body !== undefined) {
        const bodyValue = toValue(options.body);

        if (bodyValue !== undefined) {
            fetchOptions.body = bodyValue as BodyInit;
        }
    }

    return fetchOptions;
}

function createApiError(err: unknown, defaultMessage: string): Error {
    if (err instanceof Error) {
        return err;
    }

    if (isApiError(err)) {
        const error = new Error(defaultMessage) as ApiError;

        error.statusCode = err.statusCode;
        error.data = err.data;

        return error;
    }

    return new Error(defaultMessage);
}

export async function bffFetch<T = unknown>(
    method: Method,
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    if (!path) {
        throw new Error('URL is required');
    }

    const response = await $fetch<T>(
        resolveSameOriginEndpoint(path),
        buildFetchOptions(method, options),
    );

    return response as T;
}

export async function externalFetch<T = unknown>(
    method: Method,
    url: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    if (!isAbsoluteHttpUrl(url)) {
        throw new Error('External API URL must be absolute');
    }

    const response = await $fetch<T>(url, buildFetchOptions(method, options));

    return response as T;
}

function useFetchState<T>(
    request: () => Promise<T>,
    skipAuth: boolean,
): ApiResponse<T> {
    const isLoading = ref(false);
    const data = ref<T | null>(null);
    const error = ref<Error | null>(null);

    async function execute(): Promise<T | null> {
        if (isLoading.value) return null;

        isLoading.value = true;
        error.value = null;

        try {
            const response = await request();

            data.value = response;

            return response;
        } catch (err: unknown) {
            if (!skipAuth && isApiError(err) && err.statusCode === 401) {
                const { refreshAccessToken, logout } = useAuthSession();
                const refreshed = await refreshAccessToken();

                if (refreshed) {
                    try {
                        const retryResponse = await request();

                        data.value = retryResponse;

                        return retryResponse;
                    } catch (retryErr) {
                        await logout();
                        navigateTo('/login');
                        error.value = createApiError(
                            retryErr,
                            'An unexpected error occurred',
                        );

                        return null;
                    }
                }

                await logout();
                navigateTo('/login');
                error.value = new Error('Session expired');

                return null;
            }

            error.value = createApiError(err, 'An unexpected error occurred');

            return null;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        data: computed(() => data.value),
        error: computed(() => error.value),
        isLoading: computed(() => isLoading.value),
        execute,
    };
}

export function useBffApi<T = unknown>(
    method: Method,
    url: string | (() => string),
    options: ApiRequestOptions = {},
): ApiResponse<T> {
    return useFetchState<T>(() => {
        const path = typeof url === 'function' ? url() : url;

        return bffFetch<T>(method, path, options);
    }, options.skipAuth ?? false);
}

export function useExternalApi<T = unknown>(
    method: Method,
    url: string | (() => string),
    options: ApiRequestOptions = {},
): ApiResponse<T> {
    return useFetchState<T>(() => {
        const path = typeof url === 'function' ? url() : url;

        return externalFetch<T>(method, path, options);
    }, options.skipAuth ?? true);
}

/**
 * Compatibility wrapper. New internal API calls should use `useBffApi`.
 */
export function useApi<T = unknown>(
    method: Method,
    url: string | (() => string),
    options: ApiRequestOptions = {},
): ApiResponse<T> {
    return useBffApi<T>(method, url, options);
}

export function useApiLazy<T = unknown>(
    method: Method,
    url: string | (() => string),
    options: ApiRequestOptions = {},
): ApiResponse<T> {
    const api = useBffApi<T>(method, url, options);

    onMounted(() => {
        api.execute();
    });

    return api;
}
