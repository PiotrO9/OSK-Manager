import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, shallowRef, watch } from 'vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

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

describe('useManagerOskFormDialogState', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.stubGlobal('computed', computed);
        vi.stubGlobal('shallowRef', shallowRef);
        vi.stubGlobal('watch', watch);
    });

    async function setup() {
        const { useManagerOskFormDialogState } =
            await import('./useManagerOskFormDialogState');

        return useManagerOskFormDialogState({
            deletingId: shallowRef<string | null>(null),
            isUpdateLoading: shallowRef(false),
            isSetDefaultLoading: shallowRef(false),
        });
    }

    it('prefills edit values and can mark a saved draft as clean', async () => {
        const editedSchool = school('one', {
            name: 'OSK Centrum',
            city: 'Gdańsk',
            address: 'ul. Testowa 1',
            isDefault: true,
            offeredCourseTypes: [
                { id: 'category-b', code: 'B', name: 'Kategoria B' },
            ],
        });
        const state = await setup();

        state.openEditFormDialog(editedSchool);

        expect(state.formName.value).toBe('OSK Centrum');
        expect(state.formCity.value).toBe('Gdańsk');
        expect(state.formAddress.value).toBe('ul. Testowa 1');
        expect(state.formEnabledCourseKinds.value).toEqual([]);
        expect(state.formOfferedCourseTypeIds.value).toEqual(['category-b']);
        expect(state.isFormDirty.value).toBe(false);

        state.formOfferedCourseTypeIds.value = ['category-b', 'category-a'];
        expect(state.isFormDirty.value).toBe(true);

        state.markFormClean();
        expect(state.isFormDirty.value).toBe(false);
    });
});
