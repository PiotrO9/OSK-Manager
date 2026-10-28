import {
    computed,
    effectScope,
    nextTick,
    onScopeDispose,
    ref,
    shallowRef,
    watch,
} from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useManagerSecurityLogsPage } from './useManagerSecurityLogsPage';

const api = {
    fetchList: vi.fn(),
    fetchDetail: vi.fn(),
    fetchPersonOptions: vi.fn(),
};
const fetchSchools = vi.fn();
const session = ref({ role: 'MANAGER' });
const scopes: ReturnType<typeof effectScope>[] = [];

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });

    return { promise, resolve };
}

function list(id: string) {
    return {
        items: [{ id }],
        collectionStatus: 'OK',
        pageInfo: {
            nextCursor: null,
            previousCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
        },
    };
}

function createPage() {
    const scope = effectScope();

    scopes.push(scope);

    return { page: scope.run(() => useManagerSecurityLogsPage())!, scope };
}

beforeEach(() => {
    vi.resetAllMocks();
    session.value = { role: 'MANAGER' };

    for (const [name, value] of Object.entries({
        computed,
        shallowRef,
        watch,
        onScopeDispose,
        onMounted: vi.fn(),
        useRoute: () => ({ query: {} }),
        useAuthSession: () => ({ session }),
        useDrivingSchoolsApi: () => ({ fetchList: fetchSchools }),
        useSecurityLogsApi: () => api,
    }))
        vi.stubGlobal(name, value);

    fetchSchools.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    api.fetchList.mockResolvedValue(list('initial'));
    api.fetchPersonOptions.mockResolvedValue({ items: [] });
});
afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop();

    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('security log page coordination', () => {
    it('ignores a late list response after switching schools', async () => {
        const { page } = createPage();

        await page.loadSchools();
        const old = deferred<ReturnType<typeof list>>();

        api.fetchList.mockReturnValueOnce(old.promise);
        const pending = page.loadList();

        api.fetchList.mockResolvedValueOnce(list('school-b'));
        page.changeSchool('b');
        await nextTick();
        old.resolve(list('school-a'));
        await pending;
        expect(page.items.value.map((item) => item.id)).toEqual(['school-b']);
        expect(api.fetchList.mock.calls[1]![0].signal.aborted).toBe(true);
    });
    it('ignores old details when another event is opened or the dialog is closed', async () => {
        const { page } = createPage();

        await page.loadSchools();
        const first = deferred<{ id: string }>();
        const second = deferred<{ id: string }>();

        api.fetchDetail
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        const one = page.openDetails('one');
        const two = page.openDetails('two');

        first.resolve({ id: 'one' });
        await one;
        expect(page.detail.value).toBeNull();
        page.closeDetails();
        second.resolve({ id: 'two' });
        await two;
        expect(page.detail.value).toBeNull();
        expect(page.selectedEventId.value).toBe('');
    });
    it('ignores old person options after switching from actor to target', async () => {
        const { page } = createPage();

        await page.loadSchools();
        page.draft.value = { ...page.draft.value, field: 'actorUserId' };
        const old = deferred<{ items: { id: string }[] }>();

        api.fetchPersonOptions.mockReturnValueOnce(old.promise);
        const pending = page.loadPersonOptions();

        api.fetchPersonOptions.mockResolvedValueOnce({
            items: [{ id: 'target' }],
        });
        page.updateDraft({ ...page.draft.value, field: 'targetUserId' });
        await nextTick();
        old.resolve({ items: [{ id: 'actor' }] });
        await pending;
        expect(page.personOptions.value).toEqual([{ id: 'target' }]);
    });
    // Existing behavior: the early return does not invalidate the pending actor request.
    // Keep this explicit diagnostic separate from the behavior-preserving extraction.
    it.fails(
        'known issue: switching to a non-person filter should discard pending person options',
        async () => {
            const { page } = createPage();

            await page.loadSchools();
            page.draft.value = { ...page.draft.value, field: 'actorUserId' };
            const old = deferred<{ items: { id: string }[] }>();

            api.fetchPersonOptions.mockReturnValueOnce(old.promise);
            const pending = page.loadPersonOptions();

            page.updateDraft({ ...page.draft.value, field: 'severity' });
            old.resolve({ items: [{ id: 'actor' }] });
            await pending;
            expect(page.personOptions.value).toEqual([]);
        },
    );
    it('clears person filters but retains the common filters when switching schools', async () => {
        const { page } = createPage();

        await page.loadSchools();
        page.filters.value = [
            {
                id: 'person',
                field: 'actorUserId',
                operator: 'is',
                value: 'user',
            },
            {
                id: 'severity',
                field: 'severity',
                operator: 'is',
                value: 'HIGH',
            },
        ];
        page.changeSchool('b');
        expect(page.filters.value.map((filter) => filter.id)).toEqual([
            'severity',
        ]);
    });
    it('debounces searches and clears the timer on disposal', async () => {
        vi.useFakeTimers();
        const { page, scope } = createPage();

        await page.loadSchools();
        api.fetchList.mockClear();
        page.updateSearch('a');
        page.updateSearch('abc');
        await vi.advanceTimersByTimeAsync(299);
        expect(api.fetchList).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        expect(api.fetchList).toHaveBeenCalledTimes(1);
        expect(api.fetchList.mock.lastCall![0].search).toBe('abc');
        page.updateSearch('discard');
        scope.stop();
        await vi.advanceTimersByTimeAsync(300);
        expect(api.fetchList).toHaveBeenCalledTimes(1);
    });
    it('clears data and rejects pending responses on role loss', async () => {
        const { page } = createPage();

        await page.loadSchools();
        const old = deferred<ReturnType<typeof list>>();

        api.fetchList.mockReturnValueOnce(old.promise);
        const pending = page.loadList();

        session.value = { role: 'STUDENT' };
        await nextTick();
        old.resolve(list('private'));
        await pending;
        expect(page.items.value).toEqual([]);
        expect(page.collectionStatus.value).toBe('UNKNOWN');
    });
    it('ignores pending details after disposal', async () => {
        const { page, scope } = createPage();

        await page.loadSchools();
        const old = deferred<{ id: string }>();

        api.fetchDetail.mockReturnValueOnce(old.promise);
        const pending = page.openDetails('old');

        scope.stop();
        old.resolve({ id: 'old' });
        await pending;
        expect(page.detail.value).toBeNull();
    });
});
