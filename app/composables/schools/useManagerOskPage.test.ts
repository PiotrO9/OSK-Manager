import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, reactive, ref, shallowRef, watch } from 'vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

const fetchList = vi.fn();
const fetchCourseTypesList = vi.fn();
const remove = vi.fn();
const create = vi.fn();
const update = vi.fn();
const setAsDefault = vi.fn();
const addToast = vi.fn();
const navigateTo = vi.fn();
const route = {
    path: '/menedzer/osrodki',
    query: {} as Record<string, string>,
};
const isListLoading = shallowRef(false);
const isUpdateLoading = shallowRef(false);
const isSetDefaultLoading = shallowRef(false);

vi.mock('vue-router', () => ({
    onBeforeRouteLeave: vi.fn(),
}));

function school(
    id: string,
    overrides: Partial<DrivingSchool> = {},
): DrivingSchool {
    return {
        id,
        name: `OSK ${id}`,
        city: null,
        address: null,
        isDefault: false,
        ...overrides,
    };
}

async function installGlobals() {
    const { useManagerOskFormDialogState } =
        await import('./useManagerOskFormDialogState');

    vi.stubGlobal('computed', computed);
    vi.stubGlobal('reactive', reactive);
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('onMounted', (callback: () => void) => callback());
    vi.stubGlobal('onBeforeUnmount', vi.fn());
    vi.stubGlobal('window', {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        confirm: vi.fn(() => true),
    });
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('navigateTo', navigateTo);
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('useManagerOskFormDialogState', useManagerOskFormDialogState);
    vi.stubGlobal('useDrivingSchoolsApi', () => ({
        fetchList,
        remove,
        create,
        update,
        setAsDefault,
        isListLoading,
        isUpdateLoading,
        isSetDefaultLoading,
    }));
    vi.stubGlobal('useCourseTypesApi', () => ({
        fetchList: fetchCourseTypesList,
    }));
}

describe('useManagerOskPage', () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        route.query = {};
        isListLoading.value = false;
        isUpdateLoading.value = false;
        isSetDefaultLoading.value = false;
        fetchList.mockResolvedValue([]);
        fetchCourseTypesList.mockResolvedValue([
            { id: 'category-b', code: 'B', name: 'Kategoria B' },
        ]);
        remove.mockResolvedValue(undefined);
        update.mockResolvedValue(undefined);
        setAsDefault.mockResolvedValue(undefined);
        navigateTo.mockResolvedValue(undefined);
        await installGlobals();
    });

    it('updates the local default school after a successful action', async () => {
        const main = school('main', { isDefault: true });
        const branch = school('branch');

        fetchList.mockResolvedValue([main, branch]);
        const { useManagerOskPage } = await import('./useManagerOskPage');
        const page = useManagerOskPage();

        await vi.waitFor(() => expect(page.schools.value).toHaveLength(2));
        await page.handleSetDefault(branch);

        expect(setAsDefault).toHaveBeenCalledWith('branch');
        expect(page.defaultSchool.value?.id).toBe('branch');
        expect(
            page.schools.value.find((item) => item.id === 'main'),
        ).toMatchObject({ isDefault: false });
    });

    it('keeps the confirmation open until deletion and reload finish', async () => {
        const target = school('main', { isDefault: true });

        fetchList.mockResolvedValueOnce([target]).mockResolvedValueOnce([]);
        const { useManagerOskPage } = await import('./useManagerOskPage');
        const page = useManagerOskPage();

        await vi.waitFor(() => expect(page.schools.value).toHaveLength(1));
        page.handleRequestDelete(target);
        expect(page.isConfirmOpen.value).toBe(true);

        await page.handleConfirmDelete();

        expect(remove).toHaveBeenCalledWith('main');
        expect(page.isConfirmOpen.value).toBe(false);
        expect(page.schools.value).toEqual([]);
    });

    it('loads the category catalog and saves the selected OSK offer', async () => {
        const target = school('main', {
            isDefault: true,
            enabledCourseKinds: ['THEORY_GROUP'],
        });

        fetchList.mockResolvedValue([target]);
        const { useManagerOskPage } = await import('./useManagerOskPage');
        const page = useManagerOskPage();

        await vi.waitFor(() => expect(page.schools.value).toHaveLength(1));
        page.openEditFormDialog(target);
        await vi.waitFor(() => expect(page.courseTypes.value).toHaveLength(1));
        page.formOfferedCourseTypeIds.value = ['category-b'];
        await page.submitFormDialog();

        expect(fetchCourseTypesList).toHaveBeenCalledTimes(1);
        expect(update).toHaveBeenCalledWith('main', {
            name: 'OSK main',
            city: null,
            address: null,
            enabledCourseKinds: ['THEORY_GROUP'],
            offeredCourseTypeIds: ['category-b'],
        });
    });
});
