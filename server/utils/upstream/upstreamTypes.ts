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
