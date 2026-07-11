import {
    normalizeManagerAttentionPayload,
    type ManagerAttentionPayload,
} from '~/types/manager/attentionItem';

export function useManagerAttentionItemsApi() {
    const isLoading = shallowRef(false);

    async function fetchAttentionItems(
        schoolId: string,
    ): Promise<ManagerAttentionPayload> {
        const trimmedSchoolId = schoolId.trim();

        return await runWithLoading(() =>
            requestBffData<ManagerAttentionPayload>(
                'GET',
                `/api/manager/attention-items?schoolId=${encodeURIComponent(
                    trimmedSchoolId,
                )}`,
                {
                    fallbackMessage: 'Nie udało się pobrać spraw do obsługi.',
                    normalize: normalizeManagerAttentionPayload,
                },
            ),
        );
    }

    async function runWithLoading<T>(request: () => Promise<T>): Promise<T> {
        isLoading.value = true;

        try {
            return await request();
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        fetchAttentionItems,
    };
}
