import type { AuthSession } from '~/utils/auth/authSessionMapper';
import {
    createBffClient,
    type BffClient,
    type BffFetch,
} from '~/utils/api/bffClient';
import { resolveBffEndpoint } from '~/utils/api/bffEndpoint';

export default defineNuxtPlugin(() => {
    const fetch = (import.meta.server ? useRequestFetch() : $fetch) as BffFetch;
    const client = createBffClient({
        fetch,
        resolveEndpoint: resolveBffEndpoint,
        onAuthFailure: () => {
            const session = useState<AuthSession | null>(
                'auth_session',
                () => null,
            );

            session.value = null;
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
