import type { ManagerAccount } from '~/types/manager/account';
import type { AccountObligation } from '~/types/manager/accountObligation';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function useManagerAccountObligationsPage() {
    const route = useRoute();
    const router = useRouter();
    const userId = computed(() =>
        typeof route.params.userId === 'string' ? route.params.userId : '',
    );

    const account = shallowRef<ManagerAccount | null>(null);
    const schoolId = computed(() => account.value?.schoolId ?? '');
    const obligations = shallowRef<AccountObligation[]>([]);
    const loading = shallowRef(true);
    const errorMessage = shallowRef('');
    let fetchSequence = 0;

    async function loadObligations() {
        const requestSequence = ++fetchSequence;

        account.value = null;
        obligations.value = [];
        errorMessage.value = '';

        if (!userId.value) {
            errorMessage.value = 'Brak identyfikatora konta.';
            loading.value = false;

            return;
        }

        loading.value = true;
        const path = `/api/manager/accounts/${encodeURIComponent(userId.value)}`;

        try {
            const [accountData, obligationData] = await Promise.all([
                requestBffData<ManagerAccount>('GET', path, {
                    fallbackMessage: 'Nie udało się pobrać konta.',
                }),
                requestBffData<AccountObligation[]>(
                    'GET',
                    `${path}/archive-obligations`,
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

    watch(userId, () => {
        void loadObligations();
    });
    watch(
        () => route.query.schoolId,
        (value) => {
            if (value !== undefined) {
                const query = { ...route.query };

                delete query.schoolId;
                void router.replace({
                    path: route.path,
                    query,
                    hash: route.hash,
                });
            }
        },
        { immediate: true },
    );
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
