import type { AuthSession } from '~/utils/auth/authSessionMapper';
import { appendResponseHeader, type H3Event } from 'h3';
import {
    createBffClient,
    type BffClient,
    type BffFetch,
} from '~/utils/api/bffClient';
import { resolveBffEndpoint } from '~/utils/api/bffEndpoint';
import { showAuthPrivacyCurtain } from '~/utils/auth/authPrivacyCurtain';
import { isPublicAuthPath } from '~~/shared/utils/publicAuthPath';

interface FetchErrorWithResponse {
    response?: {
        headers?: Headers;
    };
}

function getSetCookieLines(headers: Headers | undefined): string[] {
    if (!headers) return [];

    const getSetCookie = headers.getSetCookie?.bind(headers);

    if (getSetCookie) {
        const lines = getSetCookie();

        if (lines.length > 0) return lines;
    }

    const single = headers.get('set-cookie');

    return single ? [single] : [];
}

function forwardSetCookieHeaders(
    event: H3Event | undefined,
    headers: Headers | undefined,
): void {
    if (!event) return;

    for (const cookie of getSetCookieLines(headers)) {
        appendResponseHeader(event, 'Set-Cookie', cookie);
    }
}

function createServerBffFetch(): BffFetch {
    const event = useRequestEvent();
    const requestHeaders = useRequestHeaders(['cookie']);

    return async <T = unknown>(
        url: string,
        options?: Parameters<BffFetch>[1],
    ): Promise<T> => {
        const fetchOptions = {
            ...options,
            headers: {
                ...requestHeaders,
                ...options?.headers,
            },
        } as Parameters<typeof $fetch.raw>[1];

        try {
            const response = await $fetch.raw<T>(url, fetchOptions);

            forwardSetCookieHeaders(event, response.headers);

            return response._data as T;
        } catch (error) {
            const response = (error as FetchErrorWithResponse)?.response;

            forwardSetCookieHeaders(event, response?.headers);

            throw error;
        }
    };
}

export default defineNuxtPlugin(() => {
    const fetch = import.meta.server
        ? createServerBffFetch()
        : ($fetch as BffFetch);
    const client = createBffClient({
        fetch,
        resolveEndpoint: resolveBffEndpoint,
        onAuthFailure: () => {
            if (
                import.meta.client &&
                !isPublicAuthPath(window.location.pathname)
            ) {
                showAuthPrivacyCurtain();
            }

            const session = useState<AuthSession | null>(
                'auth_session',
                () => null,
            );

            session.value = null;

            if (
                import.meta.client &&
                !isPublicAuthPath(window.location.pathname)
            ) {
                window.location.replace('/login');
            }
        },
    });

    return {
        provide: {
            bff: client,
        },
    };
});

declare module '#app' {
    interface NuxtApp {
        $bff: BffClient;
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $bff: BffClient;
    }
}
