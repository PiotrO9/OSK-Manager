import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { useManagerOskEditPage } from './useManagerOskEditPage';

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

const school: DrivingSchool = {
    id: 'school-1',
    name: 'OSK Centrum',
    city: 'Gdańsk',
    address: 'ul. Testowa 1',
    enabledCourseKinds: ['THEORY_GROUP'],
    offeredCourseTypes: [{ id: 'category-b', code: 'B', name: 'Kategoria B' }],
};
const fetchList = vi.fn();
const fetchCourseTypes = vi.fn();
const update = vi.fn();
const navigateTo = vi.fn();
const addToast = vi.fn();
const addWindowListener = vi.fn();
const removeWindowListener = vi.fn();

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => {
        resolve = r;
    });

    return { promise, resolve };
}

async function setup() {
    const page = useManagerOskEditPage();

    hooks.mount();
    await vi.waitFor(() => {
        expect(page.isSchoolLoading.value).toBe(false);
        expect(page.isCourseTypesLoading.value).toBe(false);
    });

    return page;
}

describe('useManagerOskEditPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        fetchList.mockResolvedValue([school]);
        fetchCourseTypes.mockResolvedValue([
            { id: 'category-b', code: 'B', name: 'Kategoria B' },
            { id: 'category-c', code: 'C', name: 'Kategoria C' },
        ]);
        update.mockResolvedValue(school);
        navigateTo.mockResolvedValue(undefined);
        vi.stubGlobal('useRoute', () => ({ params: { id: school.id } }));
        vi.stubGlobal('useDrivingSchoolsApi', () => ({ fetchList, update }));
        vi.stubGlobal('useCourseTypesApi', () => ({
            fetchList: fetchCourseTypes,
        }));
        vi.stubGlobal('useAppToast', () => ({ addToast }));
        vi.stubGlobal('navigateTo', navigateTo);
        vi.stubGlobal('window', {
            addEventListener: addWindowListener,
            removeEventListener: removeWindowListener,
        });
    });
    afterEach(() => {
        hooks.unmount();
        vi.unstubAllGlobals();
    });

    it('loads the linked school and saves every field through PATCH', async () => {
        const page = await setup();

        expect(page.name.value).toBe('OSK Centrum');
        expect(page.offeredCourseTypeIds.value).toEqual(['category-b']);
        expect(page.isDirty.value).toBe(false);

        page.name.value = '  OSK Nowa  ';
        page.city.value = '';
        page.offeredCourseTypeIds.value = ['category-b', 'category-c'];
        expect(await page.handleSubmit()).toBe('saved');
        expect(update).toHaveBeenCalledWith('school-1', {
            name: 'OSK Nowa',
            city: null,
            address: 'ul. Testowa 1',
            enabledCourseKinds: ['THEORY_GROUP'],
            offeredCourseTypeIds: ['category-b', 'category-c'],
        });
        expect(navigateTo).toHaveBeenCalledWith('/menedzer/osrodki', {
            replace: true,
        });
        expect(page.isDirty.value).toBe(false);
    });

    it('handles a missing school and incomplete settings without PATCH', async () => {
        fetchList.mockResolvedValueOnce([]);
        const missing = await setup();

        expect(missing.isSchoolMissing.value).toBe(true);
        expect(await missing.handleSubmit()).toBe('ignored');

        fetchList.mockResolvedValueOnce([
            { ...school, offeredCourseTypes: undefined },
        ]);
        const incomplete = await setup();

        expect(incomplete.schoolLoadError.value).toContain('niepełne');
        expect(await incomplete.handleSubmit()).toBe('ignored');
        expect(update).not.toHaveBeenCalled();
    });

    it('blocks saving until the category catalog loads and supports retry', async () => {
        fetchCourseTypes.mockRejectedValueOnce(
            new Error('Katalog niedostępny'),
        );
        const page = await setup();

        expect(page.courseTypesLoadError.value).toBe('Katalog niedostępny');
        expect(await page.handleSubmit()).toBe('ignored');
        fetchCourseTypes.mockResolvedValueOnce([
            { id: 'category-b', code: 'B', name: 'Kategoria B' },
        ]);
        await page.loadCourseTypes();
        expect(page.canSave.value).toBe(true);
    });

    it('keeps the draft after validation and PATCH failures', async () => {
        const page = await setup();

        page.name.value = '  ';
        expect(await page.handleSubmit()).toBe('field-error');
        expect(update).not.toHaveBeenCalled();

        page.name.value = 'OSK Zmieniona';
        update.mockRejectedValueOnce(new Error('Zapis niedostępny'));
        expect(await page.handleSubmit()).toBe('error');
        expect(page.submitError.value).toBe('Zapis niedostępny');
        expect(page.name.value).toBe('OSK Zmieniona');
        expect(page.isDirty.value).toBe(true);
    });

    it('blocks duplicate PATCH and leaving while saving', async () => {
        const page = await setup();
        const patch = deferred<DrivingSchool>();

        update.mockReturnValueOnce(patch.promise);
        page.name.value = 'Nowa nazwa';
        const saving = page.handleSubmit();

        expect(page.isSaving.value).toBe(true);
        expect(hooks.leave()).toBe(false);
        expect(await page.handleSubmit()).toBe('ignored');
        patch.resolve(school);
        await saving;
        expect(update).toHaveBeenCalledTimes(1);
        expect(hooks.leave()).toBe(true);
    });

    it('does not repeat PATCH when navigation fails after saving', async () => {
        const page = await setup();

        page.name.value = 'Nowa nazwa';
        navigateTo.mockResolvedValueOnce(false);
        expect(await page.handleSubmit()).toBe('saved');
        expect(page.navigationError.value).toContain('Zmiany zostały zapisane');
        expect(await page.handleSubmit()).toBe('ignored');
        await page.returnToList();
        expect(update).toHaveBeenCalledTimes(1);
    });

    it('confirms dirty navigation and protects reload', async () => {
        const page = await setup();
        const listener = addWindowListener.mock.calls.find(
            ([name]) => name === 'beforeunload',
        )?.[1] as (event: BeforeUnloadEvent) => void;
        const event = {
            preventDefault: vi.fn(),
            returnValue: undefined,
        } as unknown as BeforeUnloadEvent;

        listener(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        page.city.value = 'Warszawa';
        listener(event);
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        const stay = hooks.leave();

        expect(page.isLeaveDialogOpen.value).toBe(true);
        page.cancelLeave();
        expect(await stay).toBe(false);
        const discard = hooks.leave();

        page.confirmDiscard();
        expect(await discard).toBe(true);
        hooks.unmount();
        expect(removeWindowListener).toHaveBeenCalledWith(
            'beforeunload',
            listener,
        );
    });
});
