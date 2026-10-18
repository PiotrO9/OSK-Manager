import type { ManagerAccount } from '~/types/manager/account';
import type { AccountObligation } from '~/types/manager/accountObligation';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function useManagerAccountObligationsPage() {
    const route = useRoute();
    const userId = computed(() =>
        typeof route.params.userId === 'string' ? route.params.userId : '',
    );
    const schoolId = computed(() =>
        typeof route.query.schoolId === 'string' ? route.query.schoolId : '',
    );
    const account = shallowRef<ManagerAccount | null>(null);
    const obligations = shallowRef<AccountObligation[]>([]);
    const loading = shallowRef(true);
    const errorMessage = shallowRef('');
    let fetchSequence = 0;

    async function loadObligations() {
        const requestSequence = ++fetchSequence;

        account.value = null;
        obligations.value = [];
        errorMessage.value = '';

        if (!userId.value || !schoolId.value) {
            errorMessage.value = 'Brak konta lub ośrodka w adresie strony.';
            loading.value = false;

            return;
        }

        loading.value = true;
        const query = `?schoolId=${encodeURIComponent(schoolId.value)}`;
        const path = `/api/manager/accounts/${encodeURIComponent(userId.value)}`;

        try {
            const [accountData, obligationData] = await Promise.all([
                requestBffData<ManagerAccount>('GET', `${path}${query}`, {
                    fallbackMessage: 'Nie udało się pobrać konta.',
                }),
                requestBffData<AccountObligation[]>(
                    'GET',
                    `${path}/archive-obligations${query}`,
                    { fallbackMessage: 'Nie udało się pobrać zobowiązań.' },
                ),
            ]);

            if (requestSequence !== fetchSequence) return;

            account.value = accountData;
            obligations.value = obligationData;
        } catch (error) {
            if (requestSequence !== fetchSequence) return;

            errorMessage.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać zobowiązań.',
            );
        } finally {
            if (requestSequence === fetchSequence) loading.value = false;
        }
    }

    watch([userId, schoolId], () => {
        void loadObligations();
    });
    onMounted(() => {
        void loadObligations();
    });
    onUnmounted(() => {
        fetchSequence += 1;
    });

    return {
        userId,
        schoolId,
        account,
        obligations,
        loading,
        errorMessage,
        loadObligations,
    };
}
