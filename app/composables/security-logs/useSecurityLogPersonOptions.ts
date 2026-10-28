import { shallowRef } from 'vue';
import type { useSecurityLogsApi } from './useSecurityLogsApi';
import type { SecurityLogPersonOption } from '~/types/security-logs/securityLog';
import type { SecurityLogFilterDraft } from '~~/shared/utils/securityLogFilters';

export function useSecurityLogPersonOptions(input: {
    schoolId: () => string;
    field: () => SecurityLogFilterDraft['field'];
    fetchPersonOptions: ReturnType<
        typeof useSecurityLogsApi
    >['fetchPersonOptions'];
}) {
    const personOptions = shallowRef<SecurityLogPersonOption[]>([]);
    const personOptionsLoading = shallowRef(false);
    let optionSequence = 0;

    async function loadPersonOptions(searchValue = ''): Promise<void> {
        const kind =
            input.field() === 'actorUserId'
                ? 'actor'
                : input.field() === 'targetUserId'
                  ? 'target'
                  : null;

        personOptions.value = [];

        if (!kind || !input.schoolId()) return;

        const requestSequence = ++optionSequence;

        personOptionsLoading.value = true;

        try {
            const data = await input.fetchPersonOptions({
                schoolId: input.schoolId(),
                kind,
                search: searchValue,
            });

            if (requestSequence === optionSequence)
                personOptions.value = data.items;
        } catch {
            if (requestSequence === optionSequence) personOptions.value = [];
        } finally {
            if (requestSequence === optionSequence)
                personOptionsLoading.value = false;
        }
    }

    function invalidatePersonOptions(): void {
        optionSequence++;
        personOptions.value = [];
    }

    return {
        personOptions,
        personOptionsLoading,
        loadPersonOptions,
        invalidatePersonOptions,
    };
}
