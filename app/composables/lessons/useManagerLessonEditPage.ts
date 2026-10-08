import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { buildEventsDayReturnRoute } from '~/utils/events/eventsDayNavigation';
import { getLocalTimeZone, today } from '@internationalized/date';
import { dateValueToIsoDateString } from '~/utils/date/weeklyCalendarDates';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import type {
    AssignedCourseInstructor,
    ManagerLessonDetail,
} from '~/types/lessons/managerLesson';
import { isManagerLessonEditable } from '~/utils/lessons/managerLessonEditability';
import { mergeManagerLessonAfterUpdate } from '~/utils/lessons/managerLessonsApi';
import {
    getManagerLessonStatusLabel,
    getManagerLessonStatusTone,
} from '~/utils/lessons/managerLessonEditPresentation';

const FORM_ID = 'manager-lesson-edit-form';

export function useManagerLessonEditPage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const { fetchLesson, updateLesson, isFetchLoading, isUpdateLoading } =
        useManagerLessonsApi();
    const { fetchList: fetchVehiclesList, fetchVehicleById } = useVehiclesApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();

    const workingWeekdays = ref<number[] | undefined>();
    const dayOffDates = ref<string[]>([]);
    const workingExceptionDates = ref<string[]>([]);
    let availabilityDaysSequence = 0;

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

    const loadedLesson = ref<ManagerLessonDetail | null>(null);
    const lessonId = computed(getLessonIdFromRoute);
    const schoolId = computed(() => loadedLesson.value?.schoolId?.trim() ?? '');

    usePageMeta({
        title: () => 'Edycja jazdy praktycznej',
        description: () => 'Zmień termin, pojazd lub instruktora lekcji.',
    });

    const assignedCourseInstructor = ref<AssignedCourseInstructor | null>(null);
    const loadError = ref<string | null>(null);
    const notFound = ref(false);
    const isNotEditable = ref(false);
    const isSaving = computed(() => isUpdateLoading.value);

    const {
        formStartLocal,
        formEndLocal,
        formVehicleId,
        formInstructorId,
        formError,
        isFormDirty,
        isFormComplete,
        applyPrefill,
        buildPatchPayload,
        lessonAvailabilityStatus,
        lessonAvailabilityMessage,
        availableStartTimes,
        availableEndTimes,
        availableVehicleIds,
        isAvailabilityOptionsLoading,
        availabilityOptionsError,
        noHoursMessage,
        nextAvailableDay,
        nextAvailableStatus,
        findNextAvailableDay,
        lessonMinDurationMinutes,
        recheckLessonAvailability,
    } = useManagerLessonEditForm(loadedLesson);

    const {
        vehiclesError,
        isVehiclesLoading,
        instructorsError,
        instructorOptionsError,
        hasAvailableInstructors,
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
        formStartLocal,
        formEndLocal,
        formVehicleId,
        fetchVehiclesList,
        fetchVehicleById,
        fetchInstructorsList,
    });

    let loadSequence = 0;

    const scheduleBackHref = computed(() => {
        const eventsDayRoute = buildEventsDayReturnRoute(
            route.query.from,
            route.query.date,
            schoolId.value,
        );

        if (eventsDayRoute) {
            return eventsDayRoute;
        }

        const schoolIdForRoute = schoolId.value.trim();

        if (schoolIdForRoute) {
            return {
                path: '/manager/schedule',
                query: { schoolId: schoolIdForRoute },
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
    const nowMs = ref(Date.now());
    let clockId: ReturnType<typeof setInterval> | null = null;

    onMounted(() => {
        clockId = setInterval(() => {
            nowMs.value = Date.now();
        }, 1000);
    });
    onUnmounted(() => {
        if (clockId !== null) clearInterval(clockId);
    });
    const canChangeInstructor = computed(
        () =>
            loadedLesson.value?.status === 'SCHEDULED' &&
            new Date(loadedLesson.value.startTime).getTime() > nowMs.value,
    );

    watch(
        [formInstructorId, () => loadedLesson.value?.bookingMaxDaysAhead],
        async () => {
            const requestSequence = ++availabilityDaysSequence;
            const instructorId = formInstructorId.value.trim();

            workingWeekdays.value = undefined;
            dayOffDates.value = [];
            workingExceptionDates.value = [];

            if (!instructorId) return;

            const base = `/api/instructors/${encodeURIComponent(instructorId)}/availability`;
            const from = dateValueToIsoDateString(today(getLocalTimeZone()));
            const to = dateValueToIsoDateString(
                today(getLocalTimeZone()).add({
                    days: loadedLesson.value?.bookingMaxDaysAhead ?? 30,
                }),
            );

            try {
                const [weekly, exceptions] = await Promise.all([
                    requestBffData<{ dayOfWeek: number }[]>(
                        'GET',
                        `${base}/weekly`,
                        {
                            fallbackMessage:
                                'Nie udało się pobrać grafiku instruktora.',
                            normalize: (raw) =>
                                (raw as { weekly?: { dayOfWeek: number }[] })
                                    ?.weekly ?? [],
                        },
                    ),
                    requestBffData<{ date: string; isDayOff: boolean }[]>(
                        'GET',
                        `${base}/exceptions?from=${from}&to=${to}`,
                        {
                            fallbackMessage:
                                'Nie udało się pobrać wyjątków grafiku.',
                            normalize: (raw) =>
                                (
                                    raw as {
                                        exceptions?: {
                                            date: string;
                                            isDayOff: boolean;
                                        }[];
                                    }
                                )?.exceptions ?? [],
                        },
                    ),
                ]);

                if (requestSequence !== availabilityDaysSequence) return;

                workingWeekdays.value = weekly.map((entry) => entry.dayOfWeek);
                dayOffDates.value = exceptions
                    .filter((entry) => entry.isDayOff)
                    .map((entry) => entry.date);
                workingExceptionDates.value = exceptions
                    .filter((entry) => !entry.isDayOff)
                    .map((entry) => entry.date);
            } catch {
                // Gdy grafik nie jest dostępny, walidacja API nadal sprawdza termin.
            }
        },
        { immediate: true },
    );

    async function loadLesson(): Promise<void> {
        const id = lessonId.value;

        if (!id) {
            loadedLesson.value = null;
            loadError.value = 'Brak identyfikatora lekcji.';
            notFound.value = false;

            return;
        }

        const requestSequence = ++loadSequence;

        loadError.value = null;
        notFound.value = false;
        isNotEditable.value = false;
        loadedLesson.value = null;
        assignedCourseInstructor.value = null;

        try {
            const lesson = await fetchLesson(id);

            if (requestSequence !== loadSequence) {
                return;
            }

            if (!isManagerLessonEditable(lesson.status, lesson.endTime)) {
                isNotEditable.value = true;
                addToast({
                    title: 'Nie można edytować tej jazdy',
                    description: 'Jazda została zakończona lub anulowana.',
                    variant: 'info',
                });
                await navigateTo(
                    buildEventsDayReturnRoute(
                        route.query.from,
                        route.query.date,
                        lesson.schoolId ?? '',
                    ) ??
                        (lesson.schoolId
                            ? {
                                  path: '/manager/schedule',
                                  query: { schoolId: lesson.schoolId },
                              }
                            : '/manager/schedule'),
                    { replace: true },
                );

                return;
            }

            assignedCourseInstructor.value =
                lesson.assignedCourseInstructor ?? null;
            loadedLesson.value = lesson;
            clearFallbacks();
            applyPrefill(lesson);
            loadLessonReferences(lesson);
        } catch (err: unknown) {
            if (requestSequence !== loadSequence) {
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

        if (
            loadedLesson.value &&
            !isManagerLessonEditable(
                loadedLesson.value.status,
                loadedLesson.value.endTime,
            )
        ) {
            formError.value = 'Zakończonej jazdy nie można już edytować.';

            return;
        }

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

        if (result.payload.instructorId && !canChangeInstructor.value) {
            formError.value =
                'Jazda już się rozpoczęła. Nie można zmienić instruktora.';

            return;
        }

        if (Object.keys(result.payload).length === 0) {
            return;
        }

        if (result.payload.instructorId && loadedLesson.value) {
            result.payload.expectedLessonState = {
                instructorId: loadedLesson.value.instructorId,
                startTime: loadedLesson.value.startTime,
                endTime: loadedLesson.value.endTime,
                vehicleId: loadedLesson.value.vehicleId,
            };
        }

        const availabilityStatus = await recheckLessonAvailability();

        if (availabilityStatus === 'unavailable') {
            return;
        }

        try {
            const updated = await updateLesson(id, result.payload);
            const lesson = loadedLesson.value
                ? mergeManagerLessonAfterUpdate(loadedLesson.value, updated)
                : updated;

            loadedLesson.value = lesson;
            clearFallbacks();
            applyPrefill(updated);
            loadLessonReferences(lesson);

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
        assignedCourseInstructor,
        workingWeekdays,
        dayOffDates,
        workingExceptionDates,
        loadError,
        notFound,
        isNotEditable,
        formStartLocal,
        formEndLocal,
        formVehicleId,
        formInstructorId,
        formError,
        vehiclesError,
        isVehiclesLoading,
        instructorsError,
        instructorOptionsError,
        hasAvailableInstructors,
        canChangeInstructor,
        isInstructorsLoading,
        studentDisplayName,
        isSaving,
        isFetchLoading,
        schoolId,
        lessonStatusLabel,
        lessonStatusTone,
        instructorsForSelect,
        vehiclesForSelect,
        instructorSelectLabel,
        scheduleBackHref,
        isFormDirty,
        isFormComplete,
        lessonAvailabilityStatus,
        lessonAvailabilityMessage,
        availableStartTimes,
        availableEndTimes,
        availableVehicleIds,
        isAvailabilityOptionsLoading,
        availabilityOptionsError,
        noHoursMessage,
        nextAvailableDay,
        nextAvailableStatus,
        findNextAvailableDay,
        lessonMinDurationMinutes,
        loadLesson,
        handleCancel,
        handleSubmit,
    };
}
