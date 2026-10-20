import type { ShallowRef } from 'vue';
import type { ManagerAccountSummary } from '~/types/manager/account';
import { parseManagerAccountsPage } from '~/utils/manager/managerAccounts';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

const PAGE_LIMIT = 20;

export function useManagerAccountsList(schoolId: ShallowRef<string>) {
    const accounts = shallowRef<ManagerAccountSummary[]>([]);
    const search = shallowRef('');
    const roleFilter = shallowRef<'ALL' | 'STUDENT' | 'INSTRUCTOR'>('ALL');
    const currentPage = shallowRef(1);
    const total = shallowRef(0);
    const totalPages = computed(() =>
        Math.max(1, Math.ceil(total.value / PAGE_LIMIT)),
    );
    const loading = shallowRef(false);
    const errorMessage = shallowRef('');
    let fetchSequence = 0;
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function invalidate() {
        ++fetchSequence;
        controller?.abort();
        clearTimeout(timer);
        timer = undefined;
    }

    async function loadAccounts() {
        invalidate();
        const requestSequence = fetchSequence;
        const requestedSchoolId = schoolId.value;
        const requestedPage = currentPage.value;

        errorMessage.value = '';
        accounts.value = [];

        if (!requestedSchoolId) {
            total.value = 0;
            loading.value = false;

            return;
        }

        loading.value = true;
        controller = new AbortController();
        const query = new URLSearchParams({
            schoolId: requestedSchoolId,
            page: String(requestedPage),
            limit: String(PAGE_LIMIT),
        });

        if (search.value.trim()) query.set('search', search.value.trim());

        if (roleFilter.value !== 'ALL') query.set('role', roleFilter.value);

        try {
            const raw = await requestBffData<unknown>(
                'GET',
                `/api/manager/accounts?${query}`,
                {
                    signal: controller.signal,
                    fallbackMessage: 'Nie udało się pobrać kont.',
                },
            );

            if (requestSequence !== fetchSequence) return;

            const page = parseManagerAccountsPage(raw);

            if (page.page !== requestedPage || page.limit !== PAGE_LIMIT)
                throw new Error('Nieprawidłowa strona wyników kont.');

            total.value = page.total;

            if (requestedPage > totalPages.value) {
                currentPage.value = totalPages.value;
                await loadAccounts();

                return;
            }

            accounts.value = page.items;
        } catch (error) {
            if (requestSequence !== fetchSequence) return;

            total.value = 0;
            errorMessage.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać kont.',
            );
        } finally {
            if (requestSequence === fetchSequence) loading.value = false;
        }
    }

    function reloadFilters(delay: number) {
        invalidate();
        currentPage.value = 1;
        accounts.value = [];
        total.value = 0;
        errorMessage.value = '';
        loading.value = Boolean(schoolId.value);

        if (delay) timer = setTimeout(() => void loadAccounts(), delay);
        else void loadAccounts();
    }

    watch(search, () => reloadFilters(300), { flush: 'sync' });
    watch(roleFilter, () => reloadFilters(0), { flush: 'sync' });
    watch(schoolId, () => reloadFilters(0), { flush: 'sync' });

    function changePage(page: number) {
        if (
            loading.value ||
            page < 1 ||
            page > totalPages.value ||
            page === currentPage.value
        )
            return;

        currentPage.value = page;
        void loadAccounts();
    }

    onUnmounted(invalidate);

    return {
        accounts,
        search,
        roleFilter,
        currentPage,
        total,
        totalPages,
        loading,
        errorMessage,
        loadAccounts,
        changePage,
    };
}
