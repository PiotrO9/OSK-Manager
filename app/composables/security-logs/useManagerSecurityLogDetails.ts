import { shallowRef } from 'vue';
import type { useSecurityLogsApi } from './useSecurityLogsApi';
import type { SecurityLogDetail } from '~/types/security-logs/securityLog';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function useManagerSecurityLogDetails(input: {
    schoolId: () => string;
    fetchDetail: ReturnType<typeof useSecurityLogsApi>['fetchDetail'];
}) {
    const selectedEventId = shallowRef('');
    const detail = shallowRef<SecurityLogDetail | null>(null);
    const detailLoading = shallowRef(false);
    const detailError = shallowRef('');
    let detailSequence = 0;
    let detailController: AbortController | undefined;

    async function openDetails(eventId: string): Promise<void> {
        selectedEventId.value = eventId;
        detail.value = null;
        detailError.value = '';
        detailLoading.value = true;
        const requestSequence = ++detailSequence;

        detailController?.abort();
        detailController = new AbortController();

        try {
            const data = await input.fetchDetail(
                input.schoolId(),
                eventId,
                detailController.signal,
            );

            if (requestSequence === detailSequence) detail.value = data;
        } catch (cause) {
            if (requestSequence === detailSequence)
                detailError.value = getApiFetchErrorMessage(
                    cause,
                    'Nie udało się pobrać szczegółów.',
                );
        } finally {
            if (requestSequence === detailSequence) detailLoading.value = false;
        }
    }

    function closeDetails(): void {
        ++detailSequence;
        detailController?.abort();
        selectedEventId.value = '';
        detail.value = null;
        detailError.value = '';
    }

    function invalidateDetails(): void {
        detailSequence++;
        detailController?.abort();
        detail.value = null;
        selectedEventId.value = '';
    }

    return {
        selectedEventId,
        detail,
        detailLoading,
        detailError,
        openDetails,
        closeDetails,
        invalidateDetails,
    };
}
