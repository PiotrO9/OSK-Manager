import type { Ref } from 'vue';
import type { StudentRegisterPayload } from '~/components/manager/students/ManagerStudentFormDialog.vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { useManagerStudentCreate } from './useManagerStudentCreate';

interface UseManagerStudentRegistrationOptions {
    schools: Ref<DrivingSchool[]>;
    isSchoolsLoading: Ref<boolean>;
    activeSchoolId: Ref<string>;
    activeCourseId: Ref<string>;
    currentPage: Ref<number>;
    loadSchools: () => Promise<void>;
    loadCoursesForFilter: () => Promise<void>;
    loadStudents: () => Promise<void>;
}

export function useManagerStudentRegistration({
    schools,
    isSchoolsLoading,
    activeSchoolId,
    activeCourseId,
    currentPage,
    loadSchools,
    loadCoursesForFilter,
    loadStudents,
}: UseManagerStudentRegistrationOptions) {
    const { addToast } = useAppToast();
    const {
        isSaving: isFormSaving,
        apiError,
        createStudent,
        clearCreateError,
        resolveStudentRegisterError,
    } = useManagerStudentCreate();

    const formDialogOpen = ref(false);

    function openInitialRegisterForm(): void {
        clearCreateError();
        formDialogOpen.value = true;
    }

    function handleOpenCreateDialog(): void {
        clearCreateError();
        formDialogOpen.value = true;

        if (schools.value.length === 0 && !isSchoolsLoading.value) {
            void loadSchools();
        }
    }

    function handleFormDialogOpenChange(open: boolean): void {
        formDialogOpen.value = open;

        if (!open) {
            clearCreateError();
        }
    }

    async function handleStudentSubmit(
        payload: StudentRegisterPayload,
    ): Promise<void> {
        if (isFormSaving.value) return;

        try {
            await createStudent(payload);

            addToast({
                title: 'Kursant został utworzony',
                variant: 'success',
            });

            formDialogOpen.value = false;

            if (schools.value.some((s) => s.id === payload.schoolId)) {
                activeSchoolId.value = payload.schoolId;
            }

            activeCourseId.value = '';
            currentPage.value = 1;

            if (activeSchoolId.value) {
                await Promise.all([loadCoursesForFilter(), loadStudents()]);
            }

            await navigateTo('/manager/students', { replace: true });
        } catch (err) {
            const message = resolveStudentRegisterError(err);

            addToast({
                title: 'Nie udało się utworzyć konta',
                description: message,
                variant: 'error',
            });
        }
    }

    return {
        formDialogOpen,
        isFormSaving,
        apiError,
        openInitialRegisterForm,
        handleOpenCreateDialog,
        handleFormDialogOpenChange,
        handleStudentSubmit,
    };
}
