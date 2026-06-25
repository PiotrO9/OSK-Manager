import type { InstructorRegisterPayload } from '~/components/manager/instructors/ManagerInstructorFormDialog.vue';
import type { DrivingSchool } from '~/types/drivingSchool';
import type { InstructorListItem } from '~/types/instructor';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

const REGISTER_GENERIC_FALLBACK = 'Nie udało się utworzyć konta instruktora.';
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

function resolveInstructorRegisterError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak uprawnień do tej operacji.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (status === 400 || status === 409) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane lub konflikt.');
    }

    return getApiFetchErrorMessage(err, REGISTER_GENERIC_FALLBACK);
}

function resolveInstructorsListError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do listy instruktorów dla wybranej szkoły.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(
        err,
        'Nie udało się pobrać listy instruktorów.',
    );
}

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

        if (!isUuid(t)) return null;

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

    const visibleInstructorsLabel = computed(() => {
        const count = instructors.value.length;

        if (count === 1) {
            return '1 wynik';
        }

        if (count >= 2 && count <= 4) {
            return `${count} wyniki`;
        }

        return `${count} wyników`;
    });

    const qualificationFilterLabel = computed(() => {
        if (uniqueQualificationCodesCount.value === 0) {
            return 'Kwalifikacje: brak danych';
        }

        return 'Kwalifikacje: wszystkie';
    });

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
        return {
            path: `/manager/instructors/${instructor.id}`,
            query:
                activeSchoolId.value.trim().length > 0
                    ? {
                          schoolId: activeSchoolId.value.trim(),
                      }
                    : {},
        };
    }

    function instructorQualificationLabel(
        instructor: InstructorListItem,
    ): string {
        const labels = (instructor.qualifiedCourseTypes ?? [])
            .map(
                (courseType) =>
                    courseType.code.trim() || courseType.name.trim(),
            )
            .filter((label) => label.length > 0);

        if (labels.length === 0) {
            return 'Brak kwalifikacji';
        }

        return labels.join(', ');
    }

    function instructorInitials(instructor: InstructorListItem): string {
        const first = instructor.firstName.trim().charAt(0);
        const last = instructor.lastName.trim().charAt(0);
        const initials = `${first}${last}`.trim();

        return initials.length > 0 ? initials.toUpperCase() : 'IN';
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
            const raw = await $fetch<unknown>(
                resolveBffEndpoint('/api/auth/register'),
                {
                    method: 'POST',
                    credentials: 'include',
                    body: {
                        role: 'INSTRUCTOR',
                        email: payload.email,
                        password: payload.password,
                        firstName: payload.firstName,
                        lastName: payload.lastName,
                        licenseNumber: payload.licenseNumber,
                        schoolId: payload.schoolId,
                    },
                },
            );

            unwrapApiSuccessData(raw);

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
