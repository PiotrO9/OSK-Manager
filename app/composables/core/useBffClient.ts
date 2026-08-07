import type { BffClient } from '~/utils/api/bffClient';

export function useBffClient(): BffClient {
    const { $bff } = useNuxtApp();

    return $bff;
}
