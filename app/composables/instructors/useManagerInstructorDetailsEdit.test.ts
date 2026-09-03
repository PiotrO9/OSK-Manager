import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, watch } from 'vue';
import type {
    InstructorDetail,
    InstructorEditFormModel,
} from '~/types/instructors/instructor';

const addToast = vi.fn();
const requestBffData = vi.fn();
const route = {
    params: {
        id: 'instructor-1',
    },
};

vi.mock('../core/useApi', () => ({
    requestBffData,
}));

function installNuxtEditGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('useAppToast', () => ({ addToast }));
}

function createInstructor(): InstructorDetail {
    return {
        id: 'instructor-1',
        name: 'Anna Nowak',
        email: 'anna@example.com',
        licenseNumber: 'LIC-123',
        phone: '—',
        qualifications: 'Kat. B',
        qualifiedCourseTypes: [],
        experience: '5 lat',
    };
}

function createEditForm(
    overrides: Partial<InstructorEditFormModel> = {},
): InstructorEditFormModel {
    return {
        id: 'instructor-1',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.com',
        qualifications: 'Kat. B',
        qualifiedCourseTypeIds: ['course-b'],
        experienceYears: 5,
        ...overrides,
    };
}

describe('useManagerInstructorDetailsEdit', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        route.params.id = 'instructor-1';
        installNuxtEditGlobals();
    });

    it('opens edit dialog with a fresh copy of the edit baseline', async () => {
        const { useManagerInstructorDetailsEdit } =
            await import('./useManagerInstructorDetailsEdit');
        const instructor = ref(createInstructor());
        const editForm = ref(createEditForm({ firstName: 'Changed' }));
        const editBaseline = ref(createEditForm());
        const data = useManagerInstructorDetailsEdit({
            instructor,
            editForm,
            editBaseline,
        });

        data.handleEnterEdit();

        expect(data.submitError.value).toBeNull();
        expect(data.isEditDialogOpen.value).toBe(true);
        expect(editForm.value).toEqual(editBaseline.value);
        expect(editForm.value).not.toBe(editBaseline.value);
    });

    it('closes edit dialog without API calls when form has no changes', async () => {
        const { useManagerInstructorDetailsEdit } =
            await import('./useManagerInstructorDetailsEdit');
        const editBaseline = ref(createEditForm());
        const data = useManagerInstructorDetailsEdit({
            instructor: ref(createInstructor()),
            editForm: ref(createEditForm()),
            editBaseline,
        });

        data.isEditDialogOpen.value = true;
        await data.handleSubmitEdit();

        expect(requestBffData).not.toHaveBeenCalled();
        expect(data.isEditDialogOpen.value).toBe(false);
        expect(data.submitError.value).toBeNull();
    });

    it('reports validation errors before calling API', async () => {
        const { useManagerInstructorDetailsEdit } =
            await import('./useManagerInstructorDetailsEdit');
        const data = useManagerInstructorDetailsEdit({
            instructor: ref(createInstructor()),
            editForm: ref(createEditForm({ firstName: '   ' })),
            editBaseline: ref(createEditForm()),
        });

        await data.handleSubmitEdit();

        expect(requestBffData).not.toHaveBeenCalled();
        expect(data.submitError.value).toBe('Imię nie może być puste.');
    });

    it('saves changed fields and updates instructor edit baseline', async () => {
        requestBffData.mockResolvedValue({
            id: 'instructor-1',
            firstName: 'Anna Maria',
            lastName: 'Nowak',
            email: 'anna@example.com',
            licenseNumber: 'LIC-123',
            qualifications: 'Kat. B',
            qualifiedCourseTypes: [],
            experienceYears: 6,
        });

        const { useManagerInstructorDetailsEdit } =
            await import('./useManagerInstructorDetailsEdit');
        const instructor = ref(createInstructor());
        const editForm = ref(
            createEditForm({ firstName: 'Anna Maria', experienceYears: 6 }),
        );
        const editBaseline = ref(createEditForm());
        const data = useManagerInstructorDetailsEdit({
            instructor,
            editForm,
            editBaseline,
        });

        data.isEditDialogOpen.value = true;
        await data.handleSubmitEdit();

        expect(requestBffData).toHaveBeenCalledWith(
            'PATCH',
            '/api/instructors/instructor-1',
            {
                body: {
                    firstName: 'Anna Maria',
                    experienceYears: 6,
                },
                fallbackMessage: 'Nie udało się zapisać zmian.',
            },
        );
        expect(instructor.value?.name).toBe('Anna Maria Nowak');
        expect(editForm.value?.firstName).toBe('Anna Maria');
        expect(editBaseline.value).toEqual(editForm.value);
        expect(addToast).toHaveBeenCalledWith({
            title: 'Zapisano zmiany',
            description: 'Dane instruktora zostały zaktualizowane.',
            variant: 'success',
        });
        expect(data.isEditDialogOpen.value).toBe(false);
        expect(data.isSubmitting.value).toBe(false);
    });

    it('reports invalid save response without closing dialog', async () => {
        requestBffData.mockResolvedValue({ id: '' });

        const { useManagerInstructorDetailsEdit } =
            await import('./useManagerInstructorDetailsEdit');
        const data = useManagerInstructorDetailsEdit({
            instructor: ref(createInstructor()),
            editForm: ref(createEditForm({ firstName: 'Anna Maria' })),
            editBaseline: ref(createEditForm()),
        });

        data.isEditDialogOpen.value = true;
        await data.handleSubmitEdit();

        expect(data.submitError.value).toBe(
            'Nieprawidłowa odpowiedź serwera po zapisie. Spróbuj ponownie.',
        );
        expect(data.isEditDialogOpen.value).toBe(true);
        expect(data.isSubmitting.value).toBe(false);
    });

    it('reports API save errors and clears submitting state', async () => {
        requestBffData.mockRejectedValue(new Error('API down'));

        const { useManagerInstructorDetailsEdit } =
            await import('./useManagerInstructorDetailsEdit');
        const data = useManagerInstructorDetailsEdit({
            instructor: ref(createInstructor()),
            editForm: ref(createEditForm({ firstName: 'Anna Maria' })),
            editBaseline: ref(createEditForm()),
        });

        await data.handleSubmitEdit();

        expect(data.submitError.value).toBe('API down');
        expect(data.isSubmitting.value).toBe(false);
    });
});
