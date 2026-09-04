import type { InstructorRegisterPayload } from './useManagerInstructorFormDialog';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { InstructorListItem } from '~/types/instructors/instructor';
import { requestBffSuccess } from '../../core/useApi';
import {
    buildInstructorDetailsRoute,
    formatQualificationFilterLabel,
    formatVisibleInstructorsLabel,
    INSTRUCTOR_REGISTER_GENERIC_FALLBACK,
    instructorInitials,
    instructorQualificationLabel,
    isInstructorSchoolIdUuid,
    resolveInstructorRegisterError,
    resolveInstructorsListError,
} from '~/utils/instructors/managerInstructorsPage';

export function useManagerInstructorsPage() {
    const route = useRoute();
    const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();
    const { addToast } = useAppToast();

    const schools = ref<DrivingSchool[]>([]);
    const schoolsLoadError = ref<string | null>(null);
    const isSchoolsLoading = ref(false);

    const activeSchoolId = ref('');
    const instructors = ref<InstructorListItem[]>([]);
    const isInstructorsLoading = ref(false);
    const instructorsLoadError = ref<string | null>(null);

    const formDialogOpen = ref(false);
    const isFormSaving = ref(false);
    const apiError = ref<string | null>(null);

    const prefillSchoolId = computed((): string | null => {
        const raw = route.query.schoolId;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') return null;

        const t = s.trim();

        if (!isInstructorSchoolIdUuid(t)) return null;

        return t;
    });

    const activeSchool = computed(
        () =>
            schools.value.find(
                (school) => school.id === activeSchoolId.value,
            ) ?? null,
    );

    const instructorsWithQualificationsCount = computed(
        () =>
            instructors.value.filter(
                (instructor) =>
                    (instructor.qualifiedCourseTypes ?? []).length > 0,
            ).length,
    );

    const uniqueQualificationCodesCount = computed(() => {
        const codes = new Set<string>();

        for (const instructor of instructors.value) {
            for (const courseType of instructor.qualifiedCourseTypes ?? []) {
                const code = courseType.code.trim();

                if (code.length > 0) {
                    codes.add(code);
                }
            }
        }

        return codes.size;
    });

    const visibleInstructorsLabel = computed(() =>
        formatVisibleInstructorsLabel(instructors.value.length),
    );

    const qualificationFilterLabel = computed(() =>
        formatQualificationFilterLabel(uniqueQualificationCodesCount.value),
    );

    function resolveInitialActiveSchoolId(): string {
        const pre = prefillSchoolId.value;

        if (pre && schools.value.some((s) => s.id === pre)) {
            return pre;
        }

        return schools.value[0]?.id ?? '';
    }

    async function loadSchools() {
        schoolsLoadError.value = null;
        isSchoolsLoading.value = true;

        try {
            schools.value = await fetchSchoolsList();
        } catch (e) {
            schoolsLoadError.value =
                e instanceof Error
                    ? e.message
                    : 'Nie udało się pobrać listy OSK.';
        } finally {
            isSchoolsLoading.value = false;
        }
    }

    async function loadInstructors() {
        const sid = activeSchoolId.value.trim();

        if (!sid) {
            instructors.value = [];

            return;
        }

        instructorsLoadError.value = null;
        isInstructorsLoading.value = true;

        try {
            instructors.value = await fetchInstructorsList(sid);
        } catch (err) {
            instructors.value = [];
            instructorsLoadError.value = resolveInstructorsListError(err);
        } finally {
            isInstructorsLoading.value = false;
        }
    }

    async function handleActiveSchoolChange() {
        instructorsLoadError.value = null;
        await loadInstructors();
    }

    onMounted(async () => {
        await loadSchools();
        activeSchoolId.value = resolveInitialActiveSchoolId();

        if (prefillSchoolId.value) {
            apiError.value = null;
            formDialogOpen.value = true;
        }

        if (activeSchoolId.value) {
            await loadInstructors();
        }
    });

    function instructorDetailsTo(instructor: InstructorListItem) {
        return buildInstructorDetailsRoute(instructor, activeSchoolId.value);
    }

    function handleOpenCreateDialog() {
        apiError.value = null;
        formDialogOpen.value = true;

        if (schools.value.length === 0 && !isSchoolsLoading.value) {
            void loadSchools();
        }
    }

    function handleFormDialogOpenChange(open: boolean) {
        formDialogOpen.value = open;

        if (!open) {
            apiError.value = null;
        }
    }

    async function handleInstructorSubmit(payload: InstructorRegisterPayload) {
        if (isFormSaving.value) return;

        apiError.value = null;
        isFormSaving.value = true;

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
                },
                fallbackMessage: INSTRUCTOR_REGISTER_GENERIC_FALLBACK,
            });

            addToast({
                title: 'Instruktor został utworzony',
                variant: 'success',
            });

            formDialogOpen.value = false;

            const createdSchoolId = payload.schoolId;

            if (schools.value.some((s) => s.id === createdSchoolId)) {
                activeSchoolId.value = createdSchoolId;
            }

            if (activeSchoolId.value) {
                await loadInstructors();
            }

            await navigateTo('/manager/instructors', { replace: true });
        } catch (err) {
            const message = resolveInstructorRegisterError(err);

            apiError.value = message;

            addToast({
                title: 'Nie udało się utworzyć konta',
                description: message,
                variant: 'error',
            });
        } finally {
            isFormSaving.value = false;
        }
    }

    return {
        schools,
        schoolsLoadError,
        isSchoolsLoading,
        activeSchoolId,
        activeSchool,
        instructors,
        isInstructorsLoading,
        instructorsLoadError,
        formDialogOpen,
        isFormSaving,
        apiError,
        prefillSchoolId,
        instructorsWithQualificationsCount,
        uniqueQualificationCodesCount,
        visibleInstructorsLabel,
        qualificationFilterLabel,
        loadSchools,
        loadInstructors,
        handleActiveSchoolChange,
        instructorDetailsTo,
        instructorQualificationLabel,
        instructorInitials,
        handleOpenCreateDialog,
        handleFormDialogOpenChange,
        handleInstructorSubmit,
    };
}
