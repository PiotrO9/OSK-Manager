import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
    /** Body żądania – może być wartością, Ref lub getterem (reaktywne) */
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

export function useApi<T = unknown>(
    method: Method,
    url: string | (() => string),
    options: ApiRequestOptions = {},
): ApiResponse<T> {
    const config = useRuntimeConfig();
    const localePath = useLocalePath();

    const isLoading = ref(false);
    const data = ref<T | null>(null);
    const error = ref<Error | null>(null);

    const skipAuth = options.skipAuth ?? false;

    function buildUrl(path: string): string {
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        const apiBase = config.public.apiBase;

        if (!apiBase) {
            return path;
        }

        const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        return `${baseUrl}${cleanPath}`;
    }

    function buildFetchOptions(path: string): {
        endpoint: string;
        fetchOptions: Parameters<typeof $fetch>[1];
    } {
        const endpoint = buildUrl(path);

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

        return { endpoint, fetchOptions };
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

    async function execute(): Promise<T | null> {
        if (isLoading.value) return null;

        isLoading.value = true;
        error.value = null;

        try {
            const path = typeof url === 'function' ? url() : url;

            if (!path) {
                throw new Error('URL is required');
            }

            const { endpoint, fetchOptions } = buildFetchOptions(path);
            const response = await $fetch<T>(endpoint, fetchOptions);

            data.value = response;

            return response;
        } catch (err: unknown) {
            if (!skipAuth && isApiError(err) && err.statusCode === 401) {
                const { refreshAccessToken, logout } = useAuthSession();
                const refreshed = await refreshAccessToken();

                if (refreshed) {
                    try {
                        const path = typeof url === 'function' ? url() : url;
                        const { endpoint, fetchOptions } =
                            buildFetchOptions(path);
                        const retryResponse = await $fetch<T>(
                            endpoint,
                            fetchOptions,
                        );

                        data.value = retryResponse;

                        return retryResponse;
                    } catch (retryErr) {
                        await logout();
                        navigateTo(localePath('/login'));
                        error.value = createApiError(
                            retryErr,
                            'An unexpected error occurred',
                        );

                        return null;
                    }
                } else {
                    await logout();
                    navigateTo(localePath('/login'));
                    error.value = new Error('Session expired');

                    return null;
                }
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

export function useApiLazy<T = unknown>(
    method: Method,
    url: string | (() => string),
    options: ApiRequestOptions = {},
): ApiResponse<T> {
    const api = useApi<T>(method, url, options);

    onMounted(() => {
        api.execute();
    });

    return api;
}
