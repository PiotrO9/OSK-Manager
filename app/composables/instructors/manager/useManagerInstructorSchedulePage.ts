import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import { getManagerInstructorScheduleInstructorId } from '~/utils/instructors/managerInstructorSchedulePage';
import { useManagerInstructorScheduleData } from './useManagerInstructorScheduleData';
import { useManagerInstructorScheduleEventForm } from './useManagerInstructorScheduleEventForm';
import { useManagerInstructorScheduleDelete } from './useManagerInstructorScheduleDelete';
import { useManagerInstructorScheduleReadModel } from './useManagerInstructorScheduleReadModel';
import { useManagerInstructorScheduleResources } from './useManagerInstructorScheduleResources';

export type { ManagerInstructorEventType } from '~/types/instructors/managerInstructorSchedule';

export function useManagerInstructorSchedulePage() {
    const route = useRoute();
    const instructorId = computed(() =>
        getManagerInstructorScheduleInstructorId(route),
    );
    const {
        schoolId,
        isSchoolContextLoading,
        schoolContextError,
        loadInstructorSchoolContext,
    } = useManagerInstructorSchoolContext({ instructorId });

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
        eventDateLocal,
        eventStartLocal,
        eventEndLocal,
        eventVehicleId,
        eventCourseId,
        eventFormError,
        isEventSaving,
        eventAvailabilityStatus,
        eventAvailabilityMessage,
        isEventSubmitReady,
        eventMinDurationMinutes,
        availableStartTimes,
        availableEndTimes,
        availableVehicleIds,
        isAvailabilityOptionsLoading,
        availabilityOptionsError,
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
        instructorId,
        () => {
            void loadInstructorSchoolContext();
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

    return {
        instructorId,
        schoolId,
        isSchoolContextLoading,
        schoolContextError,
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
        eventDateLocal,
        eventStartLocal,
        eventEndLocal,
        eventVehicleId,
        eventCourseId,
        eventFormError,
        deleteDialogOpen,
        isEventSaving,
        eventAvailabilityStatus,
        eventAvailabilityMessage,
        isEventSubmitReady,
        eventMinDurationMinutes,
        availableStartTimes,
        availableEndTimes,
        availableVehicleIds,
        isAvailabilityOptionsLoading,
        availabilityOptionsError,
        isEventDeleteLoading,
        scheduleItemsCount,
        lessonItemsCount,
        blockItemsCount,
        scheduleWeekLabel,
        scheduleResultLabel,
        nextScheduledItemLabel,
        pendingDeleteTimeLabel,
        loadSchedule,
        loadResources,
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
