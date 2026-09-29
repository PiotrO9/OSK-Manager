import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, shallowRef, watch } from 'vue';
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
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('shallowRef', shallowRef);
        vi.stubGlobal('watch', watch);
    });

    async function setup(initialSchools: DrivingSchool[]) {
        const { useManagerOskFormDialogState } =
            await import('./useManagerOskFormDialogState');

        return useManagerOskFormDialogState({
            schools: ref(initialSchools),
            deletingId: shallowRef<string | null>(null),
            isUpdateLoading: shallowRef(false),
            isSetDefaultLoading: shallowRef(false),
            isLocalCreateSaving: shallowRef(false),
        });
    }

    it('marks the first created school as default and starts with a clean draft', async () => {
        const state = await setup([]);

        state.openCreateFormDialog();

        expect(state.formDialogOpen.value).toBe(true);
        expect(state.formAsDefault.value).toBe(true);
        expect(state.isDefaultSwitchLocked.value).toBe(true);
        expect(state.isFormDirty.value).toBe(false);

        state.formName.value = 'OSK Centrum';

        expect(state.isFormDirty.value).toBe(true);
    });

    it('allows an additional school to be created without changing the default', async () => {
        const state = await setup([
            school('one', { isDefault: true, name: 'OSK Główna' }),
        ]);

        state.openCreateFormDialog();

        expect(state.formAsDefault.value).toBe(false);
        expect(state.isDefaultSwitchLocked.value).toBe(false);
    });

    it('prefills edit values and can mark a saved draft as clean', async () => {
        const editedSchool = school('one', {
            name: 'OSK Centrum',
            city: 'Gdańsk',
            address: 'ul. Testowa 1',
            isDefault: true,
        });
        const state = await setup([editedSchool]);

        state.openEditFormDialog(editedSchool);

        expect(state.formName.value).toBe('OSK Centrum');
        expect(state.formCity.value).toBe('Gdańsk');
        expect(state.formAddress.value).toBe('ul. Testowa 1');
        expect(state.isFormDirty.value).toBe(false);

        state.formCity.value = 'Sopot';
        expect(state.isFormDirty.value).toBe(true);

        state.markFormClean();
        expect(state.isFormDirty.value).toBe(false);
    });
});
