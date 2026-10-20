import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    computed,
    effectScope,
    nextTick,
    reactive,
    shallowRef,
    watch,
    type EffectScope,
} from 'vue';
import { useManagerAccountsList } from './useManagerAccountsList';
import { useManagerAccountSelection } from './useManagerAccountSelection';
import { useManagerAccountsPage } from './useManagerAccountsPage';

const schoolId = '11111111-1111-4111-8111-111111111111';
const otherSchoolId = '22222222-2222-4222-8222-222222222222';
const userId = '33333333-3333-4333-8333-333333333333';
const otherUserId = '44444444-4444-4444-8444-444444444444';
const profileId = '55555555-5555-4555-8555-555555555555';
const account = {
    id: userId,
    schoolId,
    role: 'STUDENT',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan@example.test',
    phone: null,
    isActive: true,
    deletedAt: null,
    accountActionsFor: [],
};
const request = vi.fn();
const addToast = vi.fn();
let route: { query: Record<string, string> };
let scope: EffectScope;
let cleanup: (() => void)[];
let mounted: Promise<unknown>;
const responsePage = (
    items: unknown[] = [account],
    total = items.length,
    page = 1,
    limit = 20,
) => ({ items, total, page, limit });
const deferred = () => {
    let resolve!: (value: unknown) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
};

async function flush() {
    for (let index = 0; index < 12; index++) await Promise.resolve();

    await nextTick();
}

function startList() {
    const selectedSchool = shallowRef('');
    const list = scope.run(() => useManagerAccountsList(selectedSchool))!;

    selectedSchool.value = schoolId;

    return { list, selectedSchool };
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    cleanup = [];
    scope = effectScope();
    route = reactive({ query: {} });
    mounted = Promise.resolve();

    for (const [key, value] of Object.entries({
        shallowRef,
        computed,
        watch,
        requestBffData: request,
        onUnmounted: (fn: () => void) => cleanup.push(fn),
        onMounted: (fn: () => unknown) => {
            mounted = Promise.resolve(fn());
        },
        useRoute: () => route,
        useAppToast: () => ({ addToast }),
        useDrivingSchoolsApi: () => ({
            fetchList: async () => [{ id: schoolId }, { id: otherSchoolId }],
        }),
    }))
        vi.stubGlobal(key, value);

    request.mockImplementation(async (_method: string, path: string) =>
        path.includes(`/accounts/${userId}`) ? account : responsePage(),
    );
});
afterEach(() => {
    cleanup.forEach((fn) => fn());
    scope.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('server account list', () => {
    it('requests a bounded page and sends role and debounced search to the server', async () => {
        const { list } = startList();

        await flush();
        expect(request.mock.calls[0]![1]).toContain(
            `schoolId=${schoolId}&page=1&limit=20`,
        );
        list.roleFilter.value = 'INSTRUCTOR';
        await flush();
        list.search.value = 'Kow';
        list.search.value = 'Kowalski';
        await vi.advanceTimersByTimeAsync(299);
        expect(request).toHaveBeenCalledTimes(2);
        await vi.advanceTimersByTimeAsync(1);
        expect(request.mock.lastCall?.[1]).toContain(
            'search=Kowalski&role=INSTRUCTOR',
        );
        expect(list.accounts.value).toHaveLength(1);
    });

    it('invalidates an old response as soon as the user types, before debounce expires', async () => {
        const old = deferred();

        request.mockImplementationOnce(() => old.promise);
        const { list } = startList();
        const signal = request.mock.calls[0]![2].signal as AbortSignal;

        list.search.value = 'Anna';
        expect(signal.aborted).toBe(true);
        old.resolve(responsePage());
        await flush();
        expect(list.accounts.value).toEqual([]);
        expect(list.loading.value).toBe(true);
        await vi.advanceTimersByTimeAsync(300);
        expect(list.loading.value).toBe(false);
        expect(request.mock.lastCall?.[1]).toContain('search=Anna');
    });

    it('clears previous school data and ignores its late failure', async () => {
        const old = deferred();

        request.mockImplementationOnce(() => old.promise);
        const { list, selectedSchool } = startList();

        selectedSchool.value = otherSchoolId;
        await flush();
        old.reject(new Error('old school error'));
        await flush();
        expect(list.errorMessage.value).toBe('');
        expect(list.loading.value).toBe(false);
        expect(request.mock.lastCall?.[1]).toContain(
            `schoolId=${otherSchoolId}`,
        );
    });

    it('reloads the last available page when the count shrinks', async () => {
        request.mockResolvedValueOnce(responsePage([account], 100));
        const { list } = startList();

        await flush();
        request.mockResolvedValueOnce(responsePage([], 21, 5));
        request.mockResolvedValueOnce(responsePage([account], 21, 2));
        list.changePage(5);
        await flush();
        expect(list.currentPage.value).toBe(2);
        expect(list.accounts.value).toHaveLength(1);
        expect(list.loading.value).toBe(false);
        expect(request.mock.lastCall?.[1]).toContain('page=2');
    });

    it('treats a legacy array or malformed page as an error instead of empty results', async () => {
        request.mockResolvedValue([]);
        const { list } = startList();

        await flush();
        expect(list.errorMessage.value).toContain('Nieprawidłowa odpowiedź');
    });

    it('cancels the debounce on unmount', async () => {
        const { list } = startList();

        await flush();
        list.search.value = 'pending';
        cleanup.forEach((fn) => fn());
        await vi.advanceTimersByTimeAsync(300);
        expect(request).toHaveBeenCalledTimes(1);
    });
});

describe('account selection and actions', () => {
    it('loads an account from a direct link even when it is absent from the list page', async () => {
        route.query.userId = userId;
        request.mockImplementation(async (_method: string, path: string) =>
            path.includes(`/accounts/${userId}`)
                ? account
                : responsePage([], 40),
        );
        const page = scope.run(() => useManagerAccountsPage())!;

        await mounted;
        expect(page.accounts.value).toEqual([]);
        expect(page.selectedAccount.value?.id).toBe(userId);
        page.search.value = 'other';
        await vi.advanceTimersByTimeAsync(300);
        expect(page.selectedAccount.value?.id).toBe(userId);
    });

    it('resolves legacy instructor profile links with a scoped exact query', async () => {
        request
            .mockResolvedValueOnce(responsePage([account], 1, 1, 1))
            .mockResolvedValueOnce(account);
        const selection = scope.run(() =>
            useManagerAccountSelection(shallowRef(schoolId)),
        )!;

        await selection.selectAccount('', profileId);
        expect(request.mock.calls[0]![1]).toContain(
            `profileId=${profileId}&page=1&limit=1`,
        );
        expect(request.mock.calls[1]![1]).toBe(
            `/api/manager/accounts/${userId}?schoolId=${schoolId}`,
        );
        expect(selection.selectedAccount.value?.id).toBe(userId);
    });

    it('does not allow a slow account response to replace the newer selection', async () => {
        const old = deferred();

        request
            .mockImplementationOnce(() => old.promise)
            .mockResolvedValueOnce({ ...account, id: otherUserId });
        const selection = scope.run(() =>
            useManagerAccountSelection(shallowRef(schoolId)),
        )!;
        const pending = selection.selectAccount(userId);

        await selection.selectAccount(otherUserId);
        old.resolve(account);
        await pending;
        expect(selection.selectedAccount.value?.id).toBe(otherUserId);
    });

    it('clears details and invalidates requests when changing schools', async () => {
        const old = deferred();

        request.mockImplementationOnce(() => old.promise);
        const selectedSchool = shallowRef(schoolId);
        const selection = scope.run(() =>
            useManagerAccountSelection(selectedSchool),
        )!;
        const pending = selection.selectAccount(userId);

        selectedSchool.value = otherSchoolId;
        old.resolve(account);
        await pending;
        expect(selection.selectedAccount.value).toBeNull();
        expect(selection.selectedUserId.value).toBe('');
        expect(selection.detailLoading.value).toBe(false);
    });

    it('refuses to display details returned for another school', async () => {
        request.mockResolvedValue({ ...account, schoolId: otherSchoolId });
        const selection = scope.run(() =>
            useManagerAccountSelection(shallowRef(schoolId)),
        )!;

        await selection.selectAccount(userId);
        expect(selection.selectedAccount.value).toBeNull();
        expect(selection.detailError.value).toContain('Nieprawidłowe konto');
    });

    it('saves the captured account, refreshes list and details, and keeps the success message', async () => {
        route.query.userId = userId;
        const page = scope.run(() => useManagerAccountsPage())!;

        await mounted;
        const body = { firstName: 'Jan', lastName: 'Nowy', phone: null };

        await page.runAction('/profile', 'PATCH', body, 'Zapisano.');
        expect(request).toHaveBeenCalledWith(
            'PATCH',
            `/api/manager/accounts/${userId}/profile?schoolId=${schoolId}`,
            expect.objectContaining({ body }),
        );
        expect(page.selectedAccount.value?.id).toBe(userId);
        expect(page.actionMessage.value).toBe('Zapisano.');
        expect(page.busy.value).toBe(false);
    });

    it('preserves unsaved form data and the obligations link after rejected archival', async () => {
        route.query.userId = userId;
        const page = scope.run(() => useManagerAccountsPage())!;

        await mounted;
        const selected = page.selectedAccount.value;

        request.mockRejectedValueOnce({
            data: { code: 'ACCOUNT_ARCHIVE_OBLIGATIONS' },
        });
        await page.runAction('/archive', 'POST');
        expect(page.selectedAccount.value).toBe(selected);
        expect(page.archiveObligationsUserId.value).toBe(userId);
        expect(addToast).toHaveBeenCalledOnce();
    });
});
