import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import {
    buildManagerInstructorScheduleBackHref,
    getManagerInstructorScheduleInstructorId,
    getManagerInstructorScheduleSchoolId,
} from '~/utils/instructors/managerInstructorSchedulePage';
import { useManagerInstructorScheduleData } from './useManagerInstructorScheduleData';
import { useManagerInstructorScheduleEventForm } from './useManagerInstructorScheduleEventForm';
import { useManagerInstructorScheduleDelete } from './useManagerInstructorScheduleDelete';
import { useManagerInstructorScheduleReadModel } from './useManagerInstructorScheduleReadModel';
import { useManagerInstructorScheduleResources } from './useManagerInstructorScheduleResources';

export type ManagerInstructorEventType = 'THEORY' | 'DRIVE';

export function useManagerInstructorSchedulePage() {
    const route = useRoute();
    const instructorId = computed(() =>
        getManagerInstructorScheduleInstructorId(route),
    );
    const schoolId = computed(() =>
        getManagerInstructorScheduleSchoolId(route),
    );

    const weekStart = ref<Date>(getMonday(new Date()));
    const range = computed(() => weekRangeFromMonday(weekStart.value));
    const { items, isScheduleLoading, scheduleError, loadSchedule } =
        useManagerInstructorScheduleData({
            instructorId,
            range,
        });

    const {
        vehicles,
        vehiclesError,
        isVehiclesLoading,
        courses,
        coursesError,
        isCoursesLoading,
        loadResources,
    } = useManagerInstructorScheduleResources({ schoolId });

    const {
        scheduleItemsCount,
        lessonItemsCount,
        blockItemsCount,
        scheduleWeekLabel,
        scheduleResultLabel,
        nextScheduledItemLabel,
        handleInstructorEventStatusChanged,
    } = useManagerInstructorScheduleReadModel({
        items,
        isScheduleLoading,
        weekStart,
    });

    const {
        eventType,
        eventStartLocal,
        eventEndLocal,
        eventVehicleId,
        eventCourseId,
        eventFormError,
        isEventSaving,
        handleFocusEventForm,
        handleSubmitEvent,
    } = useManagerInstructorScheduleEventForm({
        instructorId,
        reloadSchedule: loadSchedule,
    });
    const {
        deleteDialogOpen,
        pendingDeleteTimeLabel,
        isEventDeleteLoading,
        handleRequestDelete,
        handleDeleteDialogCancel,
        handleDeleteDialogConfirm,
    } = useManagerInstructorScheduleDelete({ items });

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
            void loadResources();
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
