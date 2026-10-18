import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type {
    SecurityLogDetail,
    SecurityLogItem,
    SecurityLogPersonOption,
    SecurityLogsPageInfo,
} from '~/types/security-logs/securityLog';
import type {
    SecurityLogFilter,
    SecurityLogFilterDraft,
} from '~~/shared/utils/securityLogFilters';
import {
    buildSecurityLogFilter,
    createSecurityLogFilterDraft,
} from '~~/shared/utils/securityLogFilters';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export type SecurityLogQuickView =
    | 'all'
    | 'failed-logins'
    | 'suspicious'
    | 'access-denied'
    | 'account-changes';

function localDate(daysAgo = 0): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const value = (type: string) =>
        parts.find((part) => part.type === type)?.value ?? '';
    const calendarDate = new Date(
        Date.UTC(
            Number(value('year')),
            Number(value('month')) - 1,
            Number(value('day')) - daysAgo,
        ),
    );

    return calendarDate.toISOString().slice(0, 10);
}

export function useManagerSecurityLogsPage() {
    const route = useRoute();
    const { session } = useAuthSession();
    const { fetchList: fetchSchools } = useDrivingSchoolsApi();
    const api = useSecurityLogsApi();
    const schools = shallowRef<DrivingSchool[]>([]);
    const schoolId = shallowRef('');
    const schoolsLoading = shallowRef(false);
    const schoolsError = shallowRef('');
    const items = shallowRef<SecurityLogItem[]>([]);
    const pageInfo = shallowRef<SecurityLogsPageInfo>({
        nextCursor: null,
        previousCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
    });
    const collectionStatus = shallowRef<'OK' | 'DEGRADED' | 'UNKNOWN'>(
        'UNKNOWN',
    );
    const loading = shallowRef(false);
    const error = shallowRef('');
    const search = shallowRef('');
    const quickView = shallowRef<SecurityLogQuickView>('all');
    const filters = shallowRef<SecurityLogFilter[]>([
        {
            id: 'default-period',
            field: 'occurredAt',
            operator: 'between',
            value: { from: localDate(6), to: localDate() },
        },
    ]);
    const draft = shallowRef<SecurityLogFilterDraft>(
        createSecurityLogFilterDraft(),
    );
    const draftError = shallowRef('');
    const cursor = shallowRef('');
    const selectedEventId = shallowRef('');
    const detail = shallowRef<SecurityLogDetail | null>(null);
    const detailLoading = shallowRef(false);
    const detailError = shallowRef('');
    const personOptions = shallowRef<SecurityLogPersonOption[]>([]);
    const personOptionsLoading = shallowRef(false);
    const activeSchool = computed(
        () =>
            schools.value.find((school) => school.id === schoolId.value) ??
            null,
    );
    let listSequence = 0;
    let detailSequence = 0;
    let optionSequence = 0;
    let searchTimer: ReturnType<typeof setTimeout> | undefined;
    let listController: AbortController | undefined;
    let detailController: AbortController | undefined;

    function invalidate(): void {
        listSequence++;
        detailSequence++;
        optionSequence++;
        listController?.abort();
        detailController?.abort();
        items.value = [];
        detail.value = null;
        selectedEventId.value = '';
        personOptions.value = [];
        pageInfo.value = {
            nextCursor: null,
            previousCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
        };
        collectionStatus.value = 'UNKNOWN';
        cursor.value = '';
    }

    async function loadList(): Promise<void> {
        if (!schoolId.value || session.value?.role !== 'MANAGER') {
            invalidate();

            return;
        }

        const requestSequence = ++listSequence;

        listController?.abort();
        listController = new AbortController();
        loading.value = true;
        error.value = '';

        try {
            const data = await api.fetchList({
                schoolId: schoolId.value,
                cursor: cursor.value || undefined,
                search: search.value.trim() || undefined,
                view: quickView.value,
                rules: filters.value.map(({ id: _id, ...rule }) => rule),
                signal: listController.signal,
            });

            if (requestSequence !== listSequence) return;

            items.value = data.items;
            pageInfo.value = data.pageInfo;
            collectionStatus.value = data.collectionStatus;
        } catch (cause) {
            if (requestSequence !== listSequence) return;

            items.value = [];
            error.value = getApiFetchErrorMessage(
                cause,
                'Nie udało się pobrać logów bezpieczeństwa.',
            );
        } finally {
            if (requestSequence === listSequence) loading.value = false;
        }
    }

    function resetAndLoad(): void {
        cursor.value = '';
        void loadList();
    }

    function updateSearch(value: string): void {
        search.value = value.slice(0, 120);
        clearTimeout(searchTimer);
        listSequence++;
        listController?.abort();
        items.value = [];
        loading.value = false;
        cursor.value = '';
        pageInfo.value = {
            nextCursor: null,
            previousCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
        };
        searchTimer = setTimeout(resetAndLoad, 300);
    }

    function updateView(value: SecurityLogQuickView): void {
        quickView.value = value;
        resetAndLoad();
    }

    function changeSchool(value: string): void {
        if (
            !schools.value.some((school) => school.id === value) ||
            value === schoolId.value
        )
            return;

        clearTimeout(searchTimer);
        invalidate();
        schoolId.value = value;
        search.value = '';
        filters.value = filters.value.filter((item) =>
            [
                'occurredAt',
                'type',
                'category',
                'severity',
                'outcome',
                'operationCode',
            ].includes(item.field),
        );
        draft.value = createSecurityLogFilterDraft();
        void loadList();
    }

    function refresh(): void {
        cursor.value = '';
        void loadList();
    }

    function clearFilters(): void {
        filters.value = [];
        search.value = '';
        quickView.value = 'all';
        draft.value = createSecurityLogFilterDraft();
        resetAndLoad();
    }

    function startNewFilter(): void {
        draft.value = createSecurityLogFilterDraft();
        draftError.value = '';
        personOptions.value = [];
    }

    function startEditFilter(filterId: string): void {
        draft.value = createSecurityLogFilterDraft(
            filters.value.find((item) => item.id === filterId),
        );
        draftError.value = '';
        void loadPersonOptions();
    }

    function updateDraft(value: SecurityLogFilterDraft): void {
        const changedField = draft.value.field !== value.field;

        draft.value = value;
        draftError.value = '';

        if (changedField) void loadPersonOptions();
    }

    function applyDraft(): void {
        const filter = buildSecurityLogFilter(draft.value);

        if (!filter) {
            draftError.value = 'Uzupełnij poprawnie filtr.';

            return;
        }

        if (filters.value.length >= 10 && !draft.value.id) {
            draftError.value = 'Możesz dodać maksymalnie 10 filtrów.';

            return;
        }

        const other = filters.value.filter((item) => item.id !== filter.id);
        const { id: _filterId, ...candidateRule } = filter;

        if (
            other.some(
                ({ id: _id, ...rule }) =>
                    JSON.stringify(rule) === JSON.stringify(candidateRule),
            )
        ) {
            draftError.value = 'Taki filtr jest już aktywny.';

            return;
        }

        filters.value = [...other, filter];
        draft.value = createSecurityLogFilterDraft();
        resetAndLoad();
    }

    function removeFilter(filterId: string): void {
        filters.value = filters.value.filter((item) => item.id !== filterId);
        resetAndLoad();
    }

    function pageOlder(): void {
        if (!pageInfo.value.nextCursor) return;

        cursor.value = pageInfo.value.nextCursor;
        void loadList();
    }

    function pageNewer(): void {
        if (!pageInfo.value.previousCursor) return;

        cursor.value = pageInfo.value.previousCursor;
        void loadList();
    }

    async function openDetails(eventId: string): Promise<void> {
        selectedEventId.value = eventId;
        detail.value = null;
        detailError.value = '';
        detailLoading.value = true;
        const requestSequence = ++detailSequence;

        detailController?.abort();
        detailController = new AbortController();

        try {
            const data = await api.fetchDetail(
                schoolId.value,
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

    async function loadPersonOptions(searchValue = ''): Promise<void> {
        const kind =
            draft.value.field === 'actorUserId'
                ? 'actor'
                : draft.value.field === 'targetUserId'
                  ? 'target'
                  : null;

        personOptions.value = [];

        if (!kind || !schoolId.value) return;

        const requestSequence = ++optionSequence;

        personOptionsLoading.value = true;

        try {
            const data = await api.fetchPersonOptions({
                schoolId: schoolId.value,
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

    async function loadSchools(): Promise<void> {
        schoolsLoading.value = true;
        schoolsError.value = '';

        try {
            const loadedSchools = await fetchSchools();

            if (schools.value.length > 0) invalidate();

            schools.value = loadedSchools;
            const preferred =
                typeof route.query.schoolId === 'string'
                    ? route.query.schoolId
                    : '';

            schoolId.value =
                schools.value.find((school) => school.id === preferred)?.id ??
                schools.value[0]?.id ??
                '';

            if (schoolId.value) await loadList();
        } catch (cause) {
            schoolsError.value = getApiFetchErrorMessage(
                cause,
                'Nie udało się pobrać ośrodków.',
            );
        } finally {
            schoolsLoading.value = false;
        }
    }

    watch(
        () => session.value?.role,
        (role) => {
            if (role !== 'MANAGER') invalidate();
        },
    );
    onMounted(() => {
        void loadSchools();
    });
    onScopeDispose(() => {
        clearTimeout(searchTimer);
        invalidate();
    });

    return {
        schools,
        schoolId,
        activeSchool,
        schoolsLoading,
        schoolsError,
        items,
        pageInfo,
        collectionStatus,
        loading,
        error,
        search,
        quickView,
        filters,
        draft,
        draftError,
        selectedEventId,
        detail,
        detailLoading,
        detailError,
        personOptions,
        personOptionsLoading,
        loadSchools,
        loadList,
        updateSearch,
        updateView,
        changeSchool,
        refresh,
        clearFilters,
        startNewFilter,
        startEditFilter,
        updateDraft,
        applyDraft,
        removeFilter,
        pageOlder,
        pageNewer,
        openDetails,
        closeDetails,
        loadPersonOptions,
    };
}
