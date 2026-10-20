import type { ShallowRef } from 'vue';
import type { ManagerAccount } from '~/types/manager/account';
import {
    parseManagerAccount,
    parseManagerAccountsPage,
} from '~/utils/manager/managerAccounts';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function useManagerAccountSelection(schoolId: ShallowRef<string>) {
    const selectedUserId = shallowRef('');
    const selectedAccount = shallowRef<ManagerAccount | null>(null);
    const detailLoading = shallowRef(false);
    const detailError = shallowRef('');
    let fetchSequence = 0;
    let controller: AbortController | undefined;

    function clearSelection() {
        ++fetchSequence;
        controller?.abort();
        selectedUserId.value = '';
        selectedAccount.value = null;
        detailLoading.value = false;
        detailError.value = '';
    }

    async function selectAccount(userId: string, profileId = '') {
        clearSelection();

        if (!schoolId.value || (!userId && !profileId)) return;

        const requestSequence = fetchSequence;
        const requestedSchoolId = schoolId.value;

        selectedUserId.value = userId;
        detailLoading.value = true;
        controller = new AbortController();
        const options = {
            signal: controller.signal,
            fallbackMessage: 'Nie udało się pobrać konta.',
        };

        try {
            if (!userId) {
                const query = new URLSearchParams({
                    schoolId: requestedSchoolId,
                    profileId,
                    page: '1',
                    limit: '1',
                });
                const raw = await requestBffData<unknown>(
                    'GET',
                    `/api/manager/accounts?${query}`,
                    options,
                );

                if (requestSequence !== fetchSequence) return;

                const page = parseManagerAccountsPage(raw);

                userId = page.items[0]?.id ?? '';

                if (!userId)
                    throw new Error(
                        'Nie znaleziono konta instruktora w wybranym OSK.',
                    );

                selectedUserId.value = userId;
            }

            const raw = await requestBffData<unknown>(
                'GET',
                `/api/manager/accounts/${encodeURIComponent(userId)}?schoolId=${encodeURIComponent(requestedSchoolId)}`,
                options,
            );

            if (requestSequence !== fetchSequence) return;

            const account = parseManagerAccount(raw);

            if (account.id !== userId || account.schoolId !== requestedSchoolId)
                throw new Error('Nieprawidłowe konto w odpowiedzi serwera.');

            selectedAccount.value = account;
        } catch (error) {
            if (requestSequence !== fetchSequence) return;

            detailError.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać konta.',
            );
        } finally {
            if (requestSequence === fetchSequence) detailLoading.value = false;
        }
    }

    watch(schoolId, clearSelection, { flush: 'sync' });
    onUnmounted(clearSelection);

    return {
        selectedUserId,
        selectedAccount,
        detailLoading,
        detailError,
        selectAccount,
        clearSelection,
    };
}
