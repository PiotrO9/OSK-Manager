import { computed, ref, watch } from 'vue';
import { isNavigationFailure, onBeforeRouteLeave } from 'vue-router';
import {
    getFirstInstructorErrorField,
    INSTRUCTOR_FORM_FIELD_ORDER,
    useManagerInstructorForm,
    type InstructorFormField,
    type InstructorFormErrors,
    type InstructorRegisterPayload,
} from './useManagerInstructorForm';
import { useManagerInstructorSchoolSelection } from './useManagerInstructorSchoolSelection';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { requestBffSuccess } from '../../core/useApi';
import {
    INSTRUCTOR_REGISTER_GENERIC_FALLBACK,
    classifyInstructorRegisterError,
} from '~/utils/instructors/managerInstructorsPage';

export type InstructorSubmitResult =
    | { status: 'created' }
    | { status: 'field-error'; field: InstructorFormField }
    | { status: 'error' }
    | { status: 'ignored' };

export function useManagerInstructorCreatePage() {
    const { fetchList } = useDrivingSchoolsApi();
    const { addToast } = useAppToast();
    const { activeSchoolId } = useManagerInstructorSchoolSelection();

    const schools = ref<DrivingSchool[]>([]);
    const isSchoolsLoading = ref(true);
    const schoolsLoadError = ref<string | null>(null);
    const isSaving = ref(false);
    const apiError = ref<string | null>(null);
    const serverFieldErrors = ref<InstructorFormErrors>({});
    const isCreated = ref(false);
    const isNavigating = ref(false);
    const navigationError = ref<string | null>(null);
    const isLeaveDialogOpen = ref(false);
    let leaveDecision: Promise<boolean> | null = null;
    let resolveLeave: ((allow: boolean) => void) | null = null;
    let schoolsLoadSequence = 0;

    const form = useManagerInstructorForm({
        schools,
        isSchoolsLoading,
        selectedSchoolId: activeSchoolId,
    });
    const fieldErrors = computed(() => ({
        ...serverFieldErrors.value,
        ...form.fieldErrors.value,
    }));

    watch(
        form.draft,
        (draft, previous) => {
            for (const field of INSTRUCTOR_FORM_FIELD_ORDER) {
                if (draft[field] !== previous[field])
                    serverFieldErrors.value[field] = undefined;
            }
        },
        { flush: 'sync' },
    );

    function finishLeave(allow: boolean) {
        const resolve = resolveLeave;

        resolveLeave = null;
        leaveDecision = null;
        isLeaveDialogOpen.value = false;
        resolve?.(allow);
    }

    onBeforeRouteLeave(() => {
        if (isCreated.value) return true;

        if (isSaving.value) return false;

        if (!form.isDirty.value) return true;

        if (leaveDecision) return leaveDecision;

        isLeaveDialogOpen.value = true;
        leaveDecision = new Promise<boolean>((resolve) => {
            resolveLeave = resolve;
        });

        return leaveDecision;
    });

    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (isCreated.value || (!form.isDirty.value && !isSaving.value)) return;

        event.preventDefault();
        event.returnValue = '';
    }

    async function returnToList() {
        if (isNavigating.value) return;

        navigationError.value = null;
        isNavigating.value = true;

        try {
            const result = await navigateTo('/manager/instructors', {
                replace: true,
            });

            if (result === false || isNavigationFailure(result)) {
                navigationError.value =
                    'Konto zostało utworzone. Nie udało się wrócić na listę instruktorów.';
            }
        } catch {
            navigationError.value =
                'Konto zostało utworzone. Nie udało się wrócić na listę instruktorów.';
        } finally {
            isNavigating.value = false;
        }
    }

    async function loadSchools() {
        const sequence = ++schoolsLoadSequence;

        schoolsLoadError.value = null;

        isSchoolsLoading.value = true;

        try {
            const items = await fetchList();

            if (sequence !== schoolsLoadSequence) return;

            schools.value = items;
        } catch (error) {
            if (sequence !== schoolsLoadSequence) return;

            schoolsLoadError.value =
                error instanceof Error
                    ? error.message
                    : 'Nie udało się pobrać listy OSK.';
        } finally {
            if (sequence === schoolsLoadSequence) {
                isSchoolsLoading.value = false;
            }
        }
    }

    async function handleInstructorSubmit(
        payload: InstructorRegisterPayload,
    ): Promise<InstructorSubmitResult> {
        if (isSaving.value || isCreated.value) return { status: 'ignored' };

        apiError.value = null;
        serverFieldErrors.value = {};
        isSaving.value = true;

        try {
            await requestBffSuccess('POST', '/api/auth/register', {
                body: {
                    role: 'INSTRUCTOR',
                    email: payload.email,
                    password: payload.password,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    licenseNumber: payload.licenseNumber,
                    schoolId: payload.schoolId,
                    birthDate: payload.birthDate,
                },
                fallbackMessage: INSTRUCTOR_REGISTER_GENERIC_FALLBACK,
            });
        } catch (error) {
            const { field, message } = classifyInstructorRegisterError(error);

            if (field) {
                serverFieldErrors.value[field] = message;

                return { status: 'field-error', field };
            }

            apiError.value = message;
            addToast({
                title: 'Nie udało się utworzyć konta',
                description: message,
                variant: 'error',
            });

            return { status: 'error' };
        } finally {
            isSaving.value = false;
        }

        isCreated.value = true;
        form.markPristine();
        activeSchoolId.value = payload.schoolId;
        addToast({ title: 'Instruktor został utworzony', variant: 'success' });
        await returnToList();

        return { status: 'created' };
    }

    async function handleSubmit(): Promise<InstructorSubmitResult> {
        if (
            isSaving.value ||
            isCreated.value ||
            isSchoolsLoading.value ||
            schoolsLoadError.value ||
            schools.value.length === 0
        ) {
            return { status: 'ignored' };
        }

        const payload = form.validateForSubmit();
        const invalidField = getFirstInstructorErrorField(
            form.fieldErrors.value,
        );

        if (!payload && invalidField)
            return { status: 'field-error', field: invalidField };

        if (!payload) return { status: 'error' };

        if (!schools.value.some((school) => school.id === payload.schoolId)) {
            serverFieldErrors.value.schoolId = 'Wybierz dostępną szkołę jazdy.';

            return { status: 'field-error', field: 'schoolId' };
        }

        return handleInstructorSubmit(payload);
    }

    onMounted(() => {
        void loadSchools();
        window.addEventListener('beforeunload', handleBeforeUnload);
    });
    onBeforeUnmount(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        finishLeave(false);
        schoolsLoadSequence++;
    });

    return {
        ...form,
        schools,
        schoolsLoadError,
        isSchoolsLoading,
        isSaving,
        apiError,
        fieldErrors,
        isCreated,
        isNavigating,
        navigationError,
        isLeaveDialogOpen,
        cancelLeave: () => finishLeave(false),
        confirmDiscard: () => finishLeave(true),
        returnToList,
        loadSchools,
        handleInstructorSubmit,
        handleSubmit,
    };
}
