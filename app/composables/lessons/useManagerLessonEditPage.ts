import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import {
    buildManagerLessonHeaderMeta,
    formatManagerLessonDateRangeLabel,
    getManagerLessonStatusLabel,
    getManagerLessonStatusTone,
} from '~/utils/lessons/managerLessonEditPresentation';

const FORM_ID = 'manager-lesson-edit-form';

export function useManagerLessonEditPage() {
    const route = useRoute();
    const { session } = useAuthSession();
    const { addToast } = useAppToast();
    const { fetchLesson, updateLesson, isFetchLoading, isUpdateLoading } =
        useManagerLessonsApi();
    const { fetchList: fetchVehiclesList, fetchVehicleById } = useVehiclesApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();

    function getLessonIdFromRoute(): string {
        const raw = route.params.id;

        if (typeof raw === 'string') {
            return raw.trim();
        }

        if (Array.isArray(raw)) {
            return String(raw[0] ?? '').trim();
        }

        return '';
    }

    function readSchoolIdFromQuery(): string {
        const raw = route.query.schoolId;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') {
            return '';
        }

        return s.trim();
    }

    const lessonId = computed(getLessonIdFromRoute);
    const schoolId = computed((): string => {
        const q = readSchoolIdFromQuery();

        if (q) {
            return q;
        }

        const def = session.value?.defaultOskId;

        return typeof def === 'string' ? def.trim() : '';
    });

    usePageMeta({
        title: () => 'Edycja jazdy praktycznej',
        description: () => 'Zmień termin, pojazd lub instruktora lekcji.',
    });

    const loadedLesson = ref<ManagerLessonDetail | null>(null);
    const loadError = ref<string | null>(null);
    const notFound = ref(false);
    const isSaving = computed(() => isUpdateLoading.value);

    const {
        formStartLocal,
        formEndLocal,
        formVehicleId,
        formInstructorId,
        formError,
        isFormDirty,
        applyPrefill,
        buildPatchPayload,
    } = useManagerLessonEditForm(loadedLesson);

    const {
        vehiclesError,
        isVehiclesLoading,
        instructorsError,
        isInstructorsLoading,
        studentDisplayName,
        instructorsForSelect,
        vehiclesForSelect,
        instructorSelectLabel,
        clearFallbacks,
        loadLessonReferences,
        loadVehicles,
        loadInstructors,
    } = useManagerLessonEditReferences({
        schoolId,
        loadedLesson,
        formInstructorId,
        formVehicleId,
        fetchVehiclesList,
        fetchVehicleById,
        fetchInstructorsList,
    });

    let loadSeq = 0;

    const scheduleBackHref = computed(() => {
        const sid = schoolId.value.trim();

        if (sid) {
            return {
                path: '/manager/schedule',
                query: { schoolId: sid },
            };
        }

        return '/manager/schedule';
    });

    const lessonStatusLabel = computed(() =>
        getManagerLessonStatusLabel(loadedLesson.value?.status),
    );
    const lessonStatusTone = computed(() =>
        getManagerLessonStatusTone(loadedLesson.value?.status),
    );

    const lessonDateLabel = computed(() =>
        formatManagerLessonDateRangeLabel(
            loadedLesson.value?.startTime,
            loadedLesson.value?.endTime,
        ),
    );

    const lessonHeaderMeta = computed(() =>
        buildManagerLessonHeaderMeta(
            loadedLesson.value,
            studentDisplayName.value,
        ),
    );

    async function loadLesson(): Promise<void> {
        const id = lessonId.value;

        if (!id) {
            loadedLesson.value = null;
            loadError.value = 'Brak identyfikatora lekcji.';
            notFound.value = false;

            return;
        }

        const seq = ++loadSeq;

        loadError.value = null;
        notFound.value = false;
        loadedLesson.value = null;

        try {
            const lesson = await fetchLesson(id);

            if (seq !== loadSeq) {
                return;
            }

            loadedLesson.value = lesson;
            clearFallbacks();
            applyPrefill(lesson);
            loadLessonReferences(lesson);
        } catch (err: unknown) {
            if (seq !== loadSeq) {
                return;
            }

            loadedLesson.value = null;

            const status = getApiErrorStatusCode(err);

            if (status === 404) {
                notFound.value = true;
                loadError.value = null;
            } else {
                notFound.value = false;
                loadError.value = getApiFetchErrorMessage(
                    err,
                    'Nie udało się wczytać lekcji.',
                );
            }
        }
    }

    watch(lessonId, () => void loadLesson(), { immediate: true });
    watch(
        schoolId,
        () => {
            void loadVehicles();
            void loadInstructors();
        },
        { immediate: true },
    );

    function handleCancel(): void {
        void navigateTo(scheduleBackHref.value);
    }

    async function handleSubmit(): Promise<void> {
        formError.value = null;

        if (!isFormDirty.value) {
            return;
        }

        const id = lessonId.value;

        if (!id) {
            formError.value = 'Brak identyfikatora lekcji.';

            return;
        }

        const result = buildPatchPayload();

        if (!result.ok) {
            formError.value = result.error;

            return;
        }

        if (Object.keys(result.payload).length === 0) {
            return;
        }

        try {
            const updated = await updateLesson(id, result.payload);

            loadedLesson.value = updated;
            clearFallbacks();
            applyPrefill(updated);
            loadLessonReferences(updated);

            addToast({
                title: 'Zapisano lekcję',
                description: 'Zmiany zostały zapisane.',
                variant: 'success',
            });
        } catch (err: unknown) {
            formError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać lekcji.',
            );
        }
    }

    return {
        FORM_ID,
        loadedLesson,
        loadError,
        notFound,
        formStartLocal,
        formEndLocal,
        formVehicleId,
        formInstructorId,
        formError,
        vehiclesError,
        isVehiclesLoading,
        instructorsError,
        isInstructorsLoading,
        studentDisplayName,
        isSaving,
        isFetchLoading,
        schoolId,
        lessonStatusLabel,
        lessonStatusTone,
        lessonDateLabel,
        lessonHeaderMeta,
        instructorsForSelect,
        vehiclesForSelect,
        instructorSelectLabel,
        scheduleBackHref,
        isFormDirty,
        loadLesson,
        handleCancel,
        handleSubmit,
    };
}
