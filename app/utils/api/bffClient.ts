import { unwrapApiSuccessData } from './apiEnvelope';

export type BffMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type BffAuthMode = 'required' | 'optional' | 'none';

export interface BffFetchOptions {
    method?: BffMethod;
    credentials?: 'include' | 'omit' | 'same-origin';
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;
}

export type BffFetch = <T = unknown>(
    url: string,
    options?: BffFetchOptions,
) => Promise<T>;

export interface BffRequestOptions {
    method?: BffMethod;
    body?: unknown;
    headers?: Record<string, string>;
    auth?: BffAuthMode;
    retryUnauthorized?: boolean;
    signal?: AbortSignal;
}

export interface BffClient {
    request<T = unknown>(path: string, options?: BffRequestOptions): Promise<T>;
    requestData<T = unknown>(
        path: string,
        options?: BffRequestOptions,
    ): Promise<T>;
}

export interface BffClientError extends Error {
    statusCode?: number;
    data?: unknown;
}

export interface CreateBffClientOptions {
    fetch: BffFetch;
    resolveEndpoint: (path: string) => string;
    refreshPath?: string;
    onAuthFailure?: () => void | Promise<void>;
}

const DEFAULT_REFRESH_PATH = '/api/auth/refresh';

function getStatusCode(error: unknown): number | undefined {
    if (error === null || typeof error !== 'object') return undefined;

    const raw = (error as { statusCode?: unknown }).statusCode;

    return typeof raw === 'number' ? raw : undefined;
}

function toBffClientError(error: unknown): BffClientError {
    if (error instanceof Error) {
        return error as BffClientError;
    }

    const out = new Error('Request failed') as BffClientError;

    if (error !== null && typeof error === 'object') {
        const record = error as { statusCode?: unknown; data?: unknown };

        if (typeof record.statusCode === 'number') {
            out.statusCode = record.statusCode;
        }

        if ('data' in record) {
            out.data = record.data;
        }
    }

    return out;
}

function buildRequestOptions(options: BffRequestOptions): BffFetchOptions {
    const method = options.method ?? 'GET';
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const request: BffFetchOptions = {
        method,
        credentials: 'include',
        headers,
    };

    if (options.signal) {
        request.signal = options.signal;
    }

    if (method !== 'GET' && options.body !== undefined) {
        request.body = options.body;
    }

    return request;
}

export function createBffClient(config: CreateBffClientOptions): BffClient {
    const refreshPath = config.refreshPath ?? DEFAULT_REFRESH_PATH;
    let refreshPromise: Promise<boolean> | null = null;

    async function notifyAuthFailure(): Promise<void> {
        await config.onAuthFailure?.();
    }

    async function refreshOnce(): Promise<boolean> {
        if (!refreshPromise) {
            refreshPromise = config
                .fetch(config.resolveEndpoint(refreshPath), {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then((raw) => {
                    unwrapApiSuccessData<unknown>(raw);

                    return true;
                })
                .catch(async () => {
                    await notifyAuthFailure();

                    return false;
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        return refreshPromise;
    }

    async function request<T = unknown>(
        path: string,
        options: BffRequestOptions = {},
    ): Promise<T> {
        if (!path) {
            throw new Error('URL is required');
        }

        const auth = options.auth ?? 'required';
        const retryUnauthorized =
            options.retryUnauthorized ?? auth === 'required';
        const endpoint = config.resolveEndpoint(path);
        const fetchOptions = buildRequestOptions(options);

        try {
            return await config.fetch<T>(endpoint, fetchOptions);
        } catch (error) {
            const normalized = toBffClientError(error);
            const status = getStatusCode(normalized);

            if (
                status !== 401 ||
                !retryUnauthorized ||
                auth === 'none' ||
                path === refreshPath
            ) {
                throw normalized;
            }

            const refreshed = await refreshOnce();

            if (!refreshed) {
                throw normalized;
            }

            try {
                return await config.fetch<T>(endpoint, fetchOptions);
            } catch (retryError) {
                const retryNormalized = toBffClientError(retryError);

                if (getStatusCode(retryNormalized) === 401) {
                    await notifyAuthFailure();
                }

                throw retryNormalized;
            }
        }
    }

    async function requestData<T = unknown>(
        path: string,
        options: BffRequestOptions = {},
    ): Promise<T> {
        const raw = await request<unknown>(path, options);

        return unwrapApiSuccessData<T>(raw);
    }

    return {
        request,
        requestData,
    };
}
