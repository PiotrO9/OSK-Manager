import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { useManagerOskCreatePage } from './useManagerOskCreatePage';

const hooks = vi.hoisted(() => ({
    mount: () => {},
    unmount: () => {},
    leave: (() => true) as () => boolean | Promise<boolean>,
}));

vi.mock('vue', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vue')>()),
    onMounted: (callback: () => void) => {
        hooks.mount = callback;
    },
    onBeforeUnmount: (callback: () => void) => {
        hooks.unmount = callback;
    },
}));
vi.mock('vue-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vue-router')>()),
    onBeforeRouteLeave: (callback: typeof hooks.leave) => {
        hooks.leave = callback;
    },
}));

const addWindowListener =
    vi.fn<
        (type: string, listener: (event: BeforeUnloadEvent) => void) => void
    >();
const removeWindowListener = vi.fn();
const fetchList = vi.fn();
const create = vi.fn();
const setAsDefault = vi.fn();
const navigateTo = vi.fn();
const addToast = vi.fn();
const existing: DrivingSchool = {
    id: 'old',
    name: 'OSK Główna',
    city: null,
    address: null,
    isDefault: true,
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => {
        resolve = r;
    });

    return { promise, resolve };
}

async function setup(schools = [existing]) {
    fetchList.mockResolvedValue(schools);
    const page = useManagerOskCreatePage();

    hooks.mount();
    await vi.waitFor(() => expect(page.isSchoolsLoading.value).toBe(false));

    return page;
}

describe('useManagerOskCreatePage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubGlobal('useDrivingSchoolsApi', () => ({
            fetchList,
            create,
            setAsDefault,
        }));
        vi.stubGlobal('useAppToast', () => ({ addToast }));
        vi.stubGlobal('navigateTo', navigateTo);
        vi.stubGlobal('window', {
            addEventListener: addWindowListener,
            removeEventListener: removeWindowListener,
        });
        create.mockResolvedValue({ ...existing, id: 'created' });
        navigateTo.mockResolvedValue(undefined);
        setAsDefault.mockResolvedValue(undefined);
    });
    afterEach(() => {
        hooks.unmount();
        vi.unstubAllGlobals();
    });

    it('initializes a clean first-school draft and relies on automatic default selection', async () => {
        const page = await setup([]);

        expect(page.asDefault.value).toBe(true);
        expect(page.defaultSwitchLocked.value).toBe(true);
        expect(page.isDirty.value).toBe(false);
        page.name.value = '  OSK Nowa  ';
        page.city.value = ' Warszawa ';
        page.address.value = '  ';
        expect(await page.handleSubmit()).toBe('created');
        expect(create).toHaveBeenCalledWith({
            name: 'OSK Nowa',
            city: 'Warszawa',
        });
        expect(setAsDefault).not.toHaveBeenCalled();
        expect(navigateTo).toHaveBeenCalledWith('/menedzer/osrodki', {
            replace: true,
        });
        expect(page.isDirty.value).toBe(false);
    });

    it('leaves the default unchanged for another school unless selected', async () => {
        const page = await setup();

        expect(page.asDefault.value).toBe(false);
        expect(page.defaultSwitchLocked.value).toBe(false);
        page.name.value = 'Nowa';
        await page.handleSubmit();
        expect(setAsDefault).not.toHaveBeenCalled();
    });

    it('does not interpret a failed load as an empty account and supports retry', async () => {
        fetchList.mockRejectedValueOnce(new Error('Lista niedostępna'));
        const page = useManagerOskCreatePage();

        hooks.mount();
        await vi.waitFor(() =>
            expect(page.schoolsLoadError.value).toBe('Lista niedostępna'),
        );
        page.name.value = 'Nowa';
        expect(await page.handleSubmit()).toBe('ignored');
        expect(create).not.toHaveBeenCalled();
        fetchList.mockResolvedValue([]);
        await page.loadSchools();
        expect(page.defaultSwitchLocked.value).toBe(true);
        expect(page.schoolsLoadError.value).toBeNull();
    });

    it('validates before POST and preserves the draft after a failed POST', async () => {
        const page = await setup();

        page.name.value = '  ';
        expect(await page.handleSubmit()).toBe('field-error');
        expect(create).not.toHaveBeenCalled();
        page.name.value = 'Nowa';
        expect(page.nameError.value).toBe('');
        create.mockRejectedValueOnce(new Error('Zapis niedostępny'));
        expect(await page.handleSubmit()).toBe('error');
        expect(page.submitError.value).toBe('Zapis niedostępny');
        expect(page.name.value).toBe('Nowa');
        expect(page.isCreated.value).toBe(false);
        expect(page.isDirty.value).toBe(true);
        expect(await page.handleSubmit()).toBe('created');
    });

    it('blocks duplicate submit and route leave throughout POST and PATCH', async () => {
        const page = await setup();
        const post = deferred<DrivingSchool>();
        const patch = deferred<undefined>();

        create.mockReturnValueOnce(post.promise);
        setAsDefault.mockReturnValueOnce(patch.promise);
        page.name.value = 'Nowa';
        page.asDefault.value = true;
        const saving = page.handleSubmit();

        expect(hooks.leave()).toBe(false);
        expect(await page.handleSubmit()).toBe('ignored');
        post.resolve({ ...existing, id: 'created' });
        await vi.waitFor(() =>
            expect(setAsDefault).toHaveBeenCalledWith('created'),
        );
        expect(page.isCreated.value).toBe(true);
        expect(page.isSaving.value).toBe(true);
        expect(hooks.leave()).toBe(false);
        patch.resolve(undefined);
        await saving;
        expect(create).toHaveBeenCalledTimes(1);
        expect(hooks.leave()).toBe(true);
    });

    it('treats failed default change as a partial success and never repeats POST', async () => {
        const page = await setup();

        page.name.value = 'Nowa';
        page.asDefault.value = true;
        setAsDefault.mockRejectedValueOnce(new Error('PATCH failed'));
        expect(await page.handleSubmit()).toBe('created');
        expect(addToast).toHaveBeenCalledWith(
            expect.objectContaining({ variant: 'warning' }),
        );
        expect(navigateTo).toHaveBeenCalledTimes(1);
        expect(await page.handleSubmit()).toBe('ignored');
        expect(create).toHaveBeenCalledTimes(1);
    });

    it.each(['throw', 'abort'])(
        'retries only navigation after %s following successful POST',
        async (failure) => {
            const page = await setup();

            page.name.value = 'Nowa';

            if (failure === 'throw')
                navigateTo.mockRejectedValueOnce(
                    new Error('Navigation failed'),
                );
            else navigateTo.mockResolvedValueOnce(false);

            expect(await page.handleSubmit()).toBe('created');
            expect(page.navigationError.value).toContain(
                'Szkoła została dodana',
            );
            expect(await page.handleSubmit()).toBe('ignored');
            await page.returnToList();
            expect(page.navigationError.value).toBeNull();
            expect(create).toHaveBeenCalledTimes(1);
        },
    );

    it('uses one leave decision, supports stay/discard, and resolves on unmount', async () => {
        const page = await setup();

        expect(hooks.leave()).toBe(true);
        page.city.value = 'Warszawa';
        const stay = hooks.leave();

        expect(hooks.leave()).toBe(stay);
        page.cancelLeave();
        expect(await stay).toBe(false);
        expect(page.city.value).toBe('Warszawa');
        const discard = hooks.leave();

        page.confirmDiscard();
        expect(await discard).toBe(true);
        const leaving = hooks.leave();

        hooks.unmount();
        expect(await leaving).toBe(false);
    });

    it('ignores stale load results and results after unmount', async () => {
        const first = deferred<DrivingSchool[]>();

        fetchList
            .mockReturnValueOnce(first.promise)
            .mockResolvedValueOnce([existing]);
        const page = useManagerOskCreatePage();

        hooks.mount();
        await page.loadSchools();
        first.resolve([]);
        await first.promise;
        expect(page.defaultSwitchLocked.value).toBe(false);
        const late = deferred<DrivingSchool[]>();

        fetchList.mockReturnValueOnce(late.promise);
        const loading = page.loadSchools();

        hooks.unmount();
        late.resolve([]);
        await loading;
        expect(page.defaultSwitchLocked.value).toBe(false);
    });

    it('protects reload only for a dirty or saving draft and removes its listener', async () => {
        const page = await setup([]);
        const listener = addWindowListener.mock.calls.find(
            ([name]) => name === 'beforeunload',
        )?.[1] as (event: BeforeUnloadEvent) => void;
        const event = {
            preventDefault: vi.fn(),
            returnValue: undefined,
        } as unknown as BeforeUnloadEvent;

        listener(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        page.name.value = 'Nowa';
        listener(event);
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        await page.handleSubmit();
        listener(event);
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        hooks.unmount();
        expect(removeWindowListener).toHaveBeenCalledWith(
            'beforeunload',
            listener,
        );
    });
});
