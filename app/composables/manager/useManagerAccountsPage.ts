import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { ManagerAccount } from '~/types/manager/account';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function useManagerAccountsPage() {
    const route = useRoute();
    const { fetchList: fetchSchools } = useDrivingSchoolsApi();
    const schools = shallowRef<DrivingSchool[]>([]);
    const schoolId = shallowRef('');
    const accounts = shallowRef<ManagerAccount[]>([]);
    const selectedUserId = shallowRef('');
    const search = shallowRef('');
    const roleFilter = shallowRef<'ALL' | 'STUDENT' | 'INSTRUCTOR'>('ALL');
    const loading = shallowRef(false);
    const busy = shallowRef(false);
    const errorMessage = shallowRef('');
    const actionMessage = shallowRef('');
    const actionError = shallowRef('');

    const selectedAccount = computed(
        () =>
            accounts.value.find(
                (account) => account.id === selectedUserId.value,
            ) ?? null,
    );
    const filteredAccounts = computed(() => {
        const needle = search.value.trim().toLocaleLowerCase('pl');

        return accounts.value.filter((account) => {
            if (roleFilter.value !== 'ALL' && account.role !== roleFilter.value)
                return false;

            if (!needle) return true;

            return `${account.firstName} ${account.lastName} ${account.email}`
                .toLocaleLowerCase('pl')
                .includes(needle);
        });
    });

    async function loadAccounts() {
        if (!schoolId.value) {
            accounts.value = [];
            selectedUserId.value = '';

            return;
        }

        loading.value = true;
        errorMessage.value = '';

        try {
            const data = await requestBffData<ManagerAccount[]>(
                'GET',
                `/api/manager/accounts?schoolId=${encodeURIComponent(schoolId.value)}`,
                { fallbackMessage: 'Nie udało się pobrać kont.' },
            );

            accounts.value = Array.isArray(data) ? data : [];
            const preferred =
                typeof route.query.userId === 'string'
                    ? route.query.userId
                    : '';
            const preferredProfileId =
                typeof route.query.profileId === 'string'
                    ? route.query.profileId
                    : '';

            if (
                !accounts.value.some(
                    (account) => account.id === selectedUserId.value,
                )
            ) {
                selectedUserId.value =
                    accounts.value.find(
                        (account) =>
                            account.id === preferred ||
                            account.instructorProfile?.id ===
                                preferredProfileId,
                    )?.id ?? '';
            }
        } catch (error) {
            errorMessage.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać kont.',
            );
            accounts.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function loadSchools() {
        try {
            schools.value = await fetchSchools();
            const preferred =
                typeof route.query.schoolId === 'string'
                    ? route.query.schoolId
                    : '';

            schoolId.value =
                schools.value.find((school) => school.id === preferred)?.id ??
                schools.value[0]?.id ??
                '';
        } catch (error) {
            errorMessage.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać ośrodków.',
            );
        }
    }

    async function runAction(
        path: string,
        method: 'PATCH' | 'POST',
        body?: unknown,
        successMessage?: string,
    ) {
        if (!schoolId.value || !selectedUserId.value) return;

        busy.value = true;
        actionError.value = '';
        actionMessage.value = '';

        try {
            await requestBffData(
                method,
                `/api/manager/accounts/${encodeURIComponent(selectedUserId.value)}${path}?schoolId=${encodeURIComponent(schoolId.value)}`,
                {
                    body,
                    fallbackMessage: 'Nie udało się zapisać zmian.',
                },
            );
            actionMessage.value = successMessage ?? 'Zmiany zapisano.';
        } catch (error) {
            actionError.value = getApiFetchErrorMessage(
                error,
                'Nie udało się zapisać zmian.',
            );
        } finally {
            busy.value = false;
            await loadAccounts();
        }
    }

    function handleSchoolChange(value: string) {
        schoolId.value = value;
        selectedUserId.value = '';
        actionMessage.value = '';
        actionError.value = '';
        void loadAccounts();
    }

    onMounted(async () => {
        await loadSchools();
        await loadAccounts();
    });

    return {
        schools,
        schoolId,
        accounts,
        selectedUserId,
        search,
        roleFilter,
        loading,
        busy,
        errorMessage,
        actionMessage,
        actionError,
        selectedAccount,
        filteredAccounts,
        loadAccounts,
        handleSchoolChange,
        runAction,
    };
}
