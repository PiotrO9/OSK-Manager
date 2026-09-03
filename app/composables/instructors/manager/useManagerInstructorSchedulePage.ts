import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type { CourseListItem } from '~/types/courses/course';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import { localDatetimeToIso } from '~/utils/events/managerEventEditForm';
import {
    buildManagerInstructorScheduleBackHref,
    formatManagerInstructorScheduleRangeLabel,
    formatManagerInstructorScheduleWeekCompact,
    getManagerInstructorScheduleInstructorId,
    getManagerInstructorScheduleSchoolId,
} from '~/utils/instructors/managerInstructorSchedulePage';

export type ManagerInstructorEventType = 'THEORY' | 'DRIVE';

export function useManagerInstructorSchedulePage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const { fetchScheduleForInstructor } = useScheduleApi();
    const {
        createInstructorEvent,
        deleteInstructorEvent,
        isLoading: isEventSaving,
        isDeleteLoading: isEventDeleteLoading,
    } = useInstructorEventsApi();
    const { fetchList: fetchVehiclesList } = useVehiclesApi();
    const { fetchList: fetchCoursesList } = useCoursesApi();

    const instructorId = computed(() =>
        getManagerInstructorScheduleInstructorId(route),
    );
    const schoolId = computed(() =>
        getManagerInstructorScheduleSchoolId(route),
    );

    const weekStart = ref<Date>(getMonday(new Date()));
    const items = ref<ScheduleLessonItem[]>([]);
    const isScheduleLoading = ref(false);
    const scheduleError = ref<string | null>(null);

    const vehicles = ref<Vehicle[]>([]);
    const vehiclesError = ref<string | null>(null);
    const isVehiclesLoading = ref(false);

    const courses = ref<CourseListItem[]>([]);
    const coursesError = ref<string | null>(null);
    const isCoursesLoading = ref(false);

    const eventType = ref<ManagerInstructorEventType>('THEORY');
    const eventStartLocal = ref('');
    const eventEndLocal = ref('');
    const eventVehicleId = ref('');
    const eventCourseId = ref('');
    const eventFormError = ref<string | null>(null);

    const deleteDialogOpen = ref(false);
    const pendingDeleteItem = ref<ScheduleLessonItem | null>(null);

    const range = computed(() => weekRangeFromMonday(weekStart.value));
    const scheduleItemsCount = computed(() => items.value.length);
    const lessonItemsCount = computed(
        () =>
            items.value.filter((item) => item.kind !== 'instructor_event')
                .length,
    );
    const blockItemsCount = computed(
        () =>
            items.value.filter((item) => item.kind === 'instructor_event')
                .length,
    );
    const scheduleWeekLabel = computed(() =>
        formatManagerInstructorScheduleWeekCompact(weekStart.value),
    );
    const scheduleResultLabel = computed(() => {
        if (isScheduleLoading.value) {
            return 'Wczytywanie';
        }

        return `${scheduleItemsCount.value} wpisow`;
    });
    const nextScheduledItemLabel = computed(() => {
        const item = items.value
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
            )[0];

        if (!item) {
            return 'Brak';
        }

        return formatManagerInstructorScheduleRangeLabel(item.startTime);
    });

    const pendingDeleteTimeLabel = computed(() => {
        const item = pendingDeleteItem.value;

        if (!item) {
            return '';
        }

        return `${formatManagerInstructorScheduleRangeLabel(item.startTime)} - ${formatManagerInstructorScheduleRangeLabel(item.endTime)}`;
    });

    let scheduleSeq = 0;

    async function loadSchedule(): Promise<void> {
        const id = instructorId.value;

        if (!id) {
            items.value = [];

            return;
        }

        const seq = ++scheduleSeq;

        scheduleError.value = null;
        isScheduleLoading.value = true;

        const { dateFrom, dateTo } = range.value;

        try {
            const data = await fetchScheduleForInstructor(id, dateFrom, dateTo);

            if (seq !== scheduleSeq) {
                return;
            }

            items.value = data;
        } catch (err: unknown) {
            if (seq !== scheduleSeq) {
                return;
            }

            items.value = [];
            scheduleError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać terminarza lekcji.',
            );
        } finally {
            if (seq === scheduleSeq) {
                isScheduleLoading.value = false;
            }
        }
    }

    async function loadVehicles(): Promise<void> {
        const sid = schoolId.value;

        vehiclesError.value = null;
        vehicles.value = [];

        if (!sid) {
            return;
        }

        isVehiclesLoading.value = true;

        try {
            vehicles.value = await fetchVehiclesList(sid);
        } catch (err: unknown) {
            vehiclesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy pojazdów.',
            );
        } finally {
            isVehiclesLoading.value = false;
        }
    }

    async function loadCourses(): Promise<void> {
        const sid = schoolId.value;

        coursesError.value = null;
        courses.value = [];

        if (!sid) {
            return;
        }

        isCoursesLoading.value = true;

        try {
            courses.value = await fetchCoursesList(sid);
        } catch (err: unknown) {
            coursesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy kursów.',
            );
        } finally {
            isCoursesLoading.value = false;
        }
    }

    watch(
        [range, instructorId],
        () => {
            void loadSchedule();
        },
        { immediate: true },
    );

    watch(
        schoolId,
        () => {
            void loadVehicles();
            void loadCourses();
        },
        { immediate: true },
    );

    function handlePrevWeek(): void {
        const d = new Date(weekStart.value);

        d.setDate(d.getDate() - 7);
        weekStart.value = getMonday(d);
    }

    function handleNextWeek(): void {
        const d = new Date(weekStart.value);

        d.setDate(d.getDate() + 7);
        weekStart.value = getMonday(d);
    }

    function handleInstructorEventStatusChanged(payload: {
        id: string;
        status: string;
    }): void {
        const idx = items.value.findIndex((x) => x.id === payload.id);

        if (idx < 0) {
            return;
        }

        const row = items.value[idx];

        if (!row) {
            return;
        }

        const copy = items.value.slice();

        copy[idx] = { ...row, status: payload.status };
        items.value = copy;
    }

    function handleFocusEventForm(): void {
        const target = document.getElementById('event-block-heading');

        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function handleSubmitEvent(): Promise<void> {
        eventFormError.value = null;

        const id = instructorId.value;

        if (!id) {
            eventFormError.value = 'Brak identyfikatora instruktora.';

            return;
        }

        const startIso = localDatetimeToIso(eventStartLocal.value);
        const endIso = localDatetimeToIso(eventEndLocal.value);

        if (!startIso || !endIso) {
            eventFormError.value = 'Podaj poczatek i koniec bloku.';

            return;
        }

        if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
            eventFormError.value = 'Koniec musi być pozniej niz poczatek.';

            return;
        }

        const type = eventType.value;

        if (type === 'DRIVE') {
            const vid = eventVehicleId.value.trim();

            if (!vid) {
                eventFormError.value =
                    'Dla jazdy wybierz pojazd. Wymagany jest schoolId w adresie strony.';

                return;
            }
        }

        try {
            const cid = eventCourseId.value.trim();

            await createInstructorEvent({
                instructorId: id,
                type,
                startTime: startIso,
                endTime: endIso,
                vehicleId:
                    type === 'DRIVE' ? eventVehicleId.value.trim() : undefined,
                ...(type === 'THEORY' && cid ? { courseId: cid } : {}),
            });

            addToast({
                title: 'Zapisano blok czasu',
                description: 'Blok zostal dodany do grafiku.',
                variant: 'success',
            });

            eventStartLocal.value = '';
            eventEndLocal.value = '';
            eventVehicleId.value = '';
            eventCourseId.value = '';

            await loadSchedule();
        } catch (err: unknown) {
            eventFormError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się utworzyć bloku.',
            );
        }
    }

    function handleRequestDelete(item: ScheduleLessonItem): void {
        pendingDeleteItem.value = item;
        deleteDialogOpen.value = true;
    }

    function handleDeleteDialogCancel(): void {
        deleteDialogOpen.value = false;
        pendingDeleteItem.value = null;
    }

    async function handleDeleteDialogConfirm(): Promise<void> {
        const item = pendingDeleteItem.value;

        if (!item) {
            return;
        }

        const removedId = item.id;

        try {
            await deleteInstructorEvent(removedId);

            addToast({
                title: 'Usunieto blok czasu',
                description: 'Blok zostal usuniety z harmonogramu.',
                variant: 'success',
            });

            items.value = items.value.filter((i) => i.id !== removedId);
            handleDeleteDialogCancel();
        } catch (err: unknown) {
            addToast({
                title: 'Nie udało się usunąć bloku',
                description: getApiFetchErrorMessage(
                    err,
                    'Spróbuj ponownie lub odśwież stronę.',
                ),
                variant: 'error',
            });
        }
    }

    const backHref = computed(() => {
        return buildManagerInstructorScheduleBackHref(
            instructorId.value,
            schoolId.value,
        );
    });

    return {
        instructorId,
        schoolId,
        weekStart,
        items,
        isScheduleLoading,
        scheduleError,
        vehicles,
        vehiclesError,
        isVehiclesLoading,
        courses,
        coursesError,
        isCoursesLoading,
        eventType,
        eventStartLocal,
        eventEndLocal,
        eventVehicleId,
        eventCourseId,
        eventFormError,
        deleteDialogOpen,
        isEventSaving,
        isEventDeleteLoading,
        scheduleItemsCount,
        lessonItemsCount,
        blockItemsCount,
        scheduleWeekLabel,
        scheduleResultLabel,
        nextScheduledItemLabel,
        pendingDeleteTimeLabel,
        backHref,
        loadSchedule,
        handlePrevWeek,
        handleNextWeek,
        handleInstructorEventStatusChanged,
        handleFocusEventForm,
        handleSubmitEvent,
        handleRequestDelete,
        handleDeleteDialogCancel,
        handleDeleteDialogConfirm,
    };
}
