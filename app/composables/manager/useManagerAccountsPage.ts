import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { useManagerAccountsList } from './useManagerAccountsList';
import { useManagerAccountSelection } from './useManagerAccountSelection';

export function useManagerAccountsPage() {
    const route = useRoute();
    const toast = useAppToast();
    const { fetchList: fetchSchools } = useDrivingSchoolsApi();
    const schools = shallowRef<DrivingSchool[]>([]);
    const schoolId = shallowRef('');
    const list = useManagerAccountsList(schoolId);
    const selection = useManagerAccountSelection(schoolId);
    const { selectedUserId } = selection;
    const busy = shallowRef(false);
    const actionMessage = shallowRef('');
    const actionError = shallowRef('');
    const archiveObligationsUserId = shallowRef('');

    let mounted = false;

    function resetActionMessages() {
        archiveObligationsUserId.value = '';
        actionMessage.value = '';
        actionError.value = '';
    }

    function selectAccount(userId: string) {
        if (busy.value || userId === selectedUserId.value) return;

        resetActionMessages();
        void selection.selectAccount(userId);
    }

    async function selectPreferredAccount() {
        const userId =
            typeof route.query.userId === 'string' ? route.query.userId : '';
        const profileId =
            typeof route.query.profileId === 'string'
                ? route.query.profileId
                : '';

        resetActionMessages();
        await selection.selectAccount(userId, profileId);
    }

    async function loadSchools() {
        try {
            schools.value = await fetchSchools();

            if (!mounted) return;

            const preferred =
                typeof route.query.schoolId === 'string'
                    ? route.query.schoolId
                    : '';

            schoolId.value =
                schools.value.find((school) => school.id === preferred)?.id ??
                schools.value[0]?.id ??
                '';
        } catch (error) {
            if (!mounted) return;

            list.errorMessage.value = getApiFetchErrorMessage(
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
        if (
            busy.value ||
            !schoolId.value ||
            !selection.selectedAccount.value ||
            selection.detailLoading.value
        )
            return;

        const targetSchoolId = schoolId.value;
        const targetUserId = selectedUserId.value;
        const isCurrent = () =>
            mounted &&
            schoolId.value === targetSchoolId &&
            selectedUserId.value === targetUserId;

        busy.value = true;
        actionError.value = '';
        actionMessage.value = '';
        archiveObligationsUserId.value = '';

        try {
            await requestBffData(
                method,
                `/api/manager/accounts/${encodeURIComponent(targetUserId)}${path}?schoolId=${encodeURIComponent(targetSchoolId)}`,
                {
                    body,
                    fallbackMessage: 'Nie udało się zapisać zmian.',
                },
            );

            if (!isCurrent()) return;

            await Promise.all([
                selection.selectAccount(targetUserId),
                list.loadAccounts(),
            ]);

            if (isCurrent())
                actionMessage.value = successMessage ?? 'Zmiany zapisano.';
        } catch (error) {
            if (!isCurrent()) return;

            if (path === '/archive') {
                const message = getApiFetchErrorMessage(error, '');
                const record =
                    error && typeof error === 'object'
                        ? (error as {
                              data?: {
                                  data?: { code?: unknown };
                                  code?: unknown;
                              };
                          })
                        : null;
                const code = record?.data?.data?.code ?? record?.data?.code;
                const hasObligations =
                    code === 'ACCOUNT_ARCHIVE_OBLIGATIONS' ||
                    /^(Student|Instructor) has active school obligations$/i.test(
                        message,
                    );

                if (hasObligations)
                    archiveObligationsUserId.value = selectedUserId.value;

                toast.addToast({
                    title: 'Nie udało się zarchiwizować konta',
                    description: hasObligations
                        ? 'Konto ma aktywne zobowiązania w szkole. Zakończ je przed archiwizacją.'
                        : 'Spróbuj ponownie później.',
                    variant: 'error',
                    durationMs: 6000,
                });
            } else {
                actionError.value = getApiFetchErrorMessage(
                    error,
                    'Nie udało się zapisać zmian.',
                );
            }
        } finally {
            busy.value = false;
        }
    }

    function handleSchoolChange(value: string) {
        if (busy.value || !schools.value.some((school) => school.id === value))
            return;

        resetActionMessages();
        schoolId.value = value;
    }

    onMounted(async () => {
        mounted = true;
        await loadSchools();

        if (mounted) await selectPreferredAccount();
    });

    watch(
        () => [route.query.schoolId, route.query.userId, route.query.profileId],
        () => {
            if (!mounted || busy.value) return;

            const preferredSchoolId = route.query.schoolId;

            if (typeof preferredSchoolId === 'string')
                handleSchoolChange(preferredSchoolId);

            void selectPreferredAccount();
        },
    );
    onUnmounted(() => {
        mounted = false;
    });

    return {
        schools,
        schoolId,
        ...list,
        ...selection,
        busy,
        actionMessage,
        actionError,
        archiveObligationsUserId,
        selectAccount,
        retrySelectedAccount: () =>
            selectedUserId.value
                ? selection.selectAccount(selectedUserId.value)
                : selectPreferredAccount(),
        handleSchoolChange,
        runAction,
    };
}
