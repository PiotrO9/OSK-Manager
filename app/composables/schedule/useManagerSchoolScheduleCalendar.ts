import type { DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    ariaSummaryForLesson,
    BASE_HOUR,
    GRID_HEIGHT_PX,
    isoToDateStr,
    isoToHm,
    lessonDurationMinutes,
    PX_PER_MINUTE,
    SAME_START_TILE_GAP_PX,
    SLOT_END_GUTTER_PX,
    slotTopPx,
} from '~/utils/schedule/managerScheduleCalendarUtils';
import { isScheduleBookedPracticalLesson } from '~/utils/schedule/scheduleBookedPracticalLesson';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import {
    buildScheduleManagerItemEditRoute,
    isScheduleManagerItemEditable,
} from '~/utils/schedule/scheduleManagerEditNavigation';
import {
    formatDateOnly,
    getMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';

export interface ManagerSchoolScheduleCalendarProps {
    schoolId: string;
    eventEditEnabled?: boolean;
    parentSchedule?: boolean;
    parentItems?: ScheduleLessonItem[];
    parentLoading?: boolean;
    parentError?: string | null;
    weekStart?: Date;
    scheduleCountBadgeLabel?: string;
    emptyDayMessage?: string;
    practicePrimaryLine?: 'student' | 'instructor';
    studentRatingSelectionEnabled?: boolean;
}

type ManagerSchoolScheduleCalendarResolvedProps = Required<
    Omit<ManagerSchoolScheduleCalendarProps, 'weekStart'>
> & {
    weekStart?: Date;
};

interface ManagerSchoolScheduleCalendarEmit {
    'update:weekStart': [value: Date];
    'lesson-selected': [lesson: ScheduleLessonItem];
}

export function useManagerSchoolScheduleCalendar(
    props: Readonly<ManagerSchoolScheduleCalendarResolvedProps>,
    emit: <K extends keyof ManagerSchoolScheduleCalendarEmit>(
        event: K,
        ...args: ManagerSchoolScheduleCalendarEmit[K]
    ) => void,
) {
    const localWeekStart = ref<Date>(getMonday(new Date()));
    const internalItems = ref<ScheduleLessonItem[]>([]);
    const errorMessage = ref<string | null>(null);
    const isCalendarOpen = ref(false);
    const calendarSelected = shallowRef<DateValue[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );

    const { fetchSchoolSchedule, isLoading } = useSchoolScheduleApi();

    let fetchSeq = 0;

    const calendarSelectedModel = computed<DateValue[]>(
        () => calendarSelected.value as unknown as DateValue[],
    );

    const activeWeekStart = computed(() => {
        if (props.parentSchedule && props.weekStart) {
            return getMonday(props.weekStart);
        }

        return localWeekStart.value;
    });

    const displayItems = computed((): ScheduleLessonItem[] =>
        props.parentSchedule ? props.parentItems : internalItems.value,
    );

    const displayLoading = computed(() =>
        props.parentSchedule ? props.parentLoading : isLoading.value,
    );

    const displayError = computed(() =>
        props.parentSchedule ? props.parentError : errorMessage.value,
    );

    const hourLabels = computed(() =>
        Array.from({ length: 12 }, (_, i) => BASE_HOUR + i),
    );

    const weekDays = computed(() => {
        const out: {
            date: Date;
            dateStr: string;
            header: string;
            isToday: boolean;
        }[] = [];

        const start = new Date(
            activeWeekStart.value.getFullYear(),
            activeWeekStart.value.getMonth(),
            activeWeekStart.value.getDate(),
        );
        const todayStr = formatDateOnly(new Date());

        for (let i = 0; i < 7; i += 1) {
            const d = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate() + i,
            );
            const dateStr = formatDateOnly(d);

            out.push({
                date: d,
                dateStr,
                header: d.toLocaleDateString('pl-PL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'numeric',
                }),
                isToday: dateStr === todayStr,
            });
        }

        return out;
    });

    const weekRangeLabel = computed(() => {
        const ws = activeWeekStart.value;
        const end = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);
        const opts: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        };

        return `${ws.toLocaleDateString('pl-PL', opts)} - ${end.toLocaleDateString('pl-PL', opts)}`;
    });

    const compactWeekRangeLabel = computed(() => {
        const ws = activeWeekStart.value;
        const end = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);
        const startDay = ws.toLocaleDateString('pl-PL', { day: 'numeric' });
        const endDay = end.toLocaleDateString('pl-PL', { day: 'numeric' });
        const startMonth = ws.toLocaleDateString('pl-PL', { month: 'long' });
        const endMonth = end.toLocaleDateString('pl-PL', { month: 'long' });

        if (
            ws.getMonth() === end.getMonth() &&
            ws.getFullYear() === end.getFullYear()
        ) {
            return `${startDay}-${endDay} ${endMonth}`;
        }

        return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    });

    const itemsByDate = computed(() => {
        const map = new Map<string, ScheduleLessonItem[]>();

        for (const it of displayItems.value) {
            const ds = isoToDateStr(it.startTime);

            if (!ds) {
                continue;
            }

            if (!map.has(ds)) {
                map.set(ds, []);
            }

            map.get(ds)!.push(it);
        }

        for (const arr of map.values()) {
            arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
        }

        return map;
    });

    const scheduleInstructorCount = computed(() => {
        const ids = new Set<string>();
        const names = new Set<string>();

        for (const item of displayItems.value) {
            const instructor = item.instructor;

            if (!instructor) {
                continue;
            }

            if (instructor.id.trim()) {
                ids.add(instructor.id);
                continue;
            }

            const name =
                `${instructor.firstName} ${instructor.lastName}`.trim();

            if (name) {
                names.add(name);
            }
        }

        return ids.size + names.size;
    });

    const earliestStartLabel = computed(() => {
        const times = displayItems.value
            .map((item) => new Date(item.startTime))
            .filter((date) => !Number.isNaN(date.getTime()))
            .sort((a, b) => a.getTime() - b.getTime());

        if (times.length === 0) {
            return '--:--';
        }

        return `${String(times[0]!.getHours()).padStart(2, '0')}:${String(
            times[0]!.getMinutes(),
        ).padStart(2, '0')}`;
    });

    function lessonsForDate(dateStr: string): ScheduleLessonItem[] {
        return itemsByDate.value.get(dateStr) ?? [];
    }

    function sameStartSorted(
        item: ScheduleLessonItem,
        dateStr: string,
    ): ScheduleLessonItem[] {
        const list = lessonsForDate(dateStr);
        const hm = isoToHm(item.startTime);
        const same = list.filter((x) => isoToHm(x.startTime) === hm);

        same.sort((a, b) => a.id.localeCompare(b.id));

        return same;
    }

    function sameStartGroupDurationMinutes(
        lesson: ScheduleLessonItem,
        dateStr: string,
    ): number {
        const same = sameStartSorted(lesson, dateStr);
        let maxMin = 1;

        for (const s of same) {
            maxMin = Math.max(maxMin, lessonDurationMinutes(s));
        }

        return maxMin;
    }

    function sameStartSlotInnerPx(
        lesson: ScheduleLessonItem,
        dateStr: string,
    ): number {
        return Math.max(
            0,
            sameStartGroupDurationMinutes(lesson, dateStr) * PX_PER_MINUTE -
                SLOT_END_GUTTER_PX,
        );
    }

    function sameStartTileHeightPx(
        lesson: ScheduleLessonItem,
        dateStr: string,
    ): number {
        const same = sameStartSorted(lesson, dateStr);
        const inner = sameStartSlotInnerPx(lesson, dateStr);
        const n = Math.max(1, same.length);

        if (n === 1) {
            return Math.max(1, inner);
        }

        return Math.max(1, (inner - (n - 1) * SAME_START_TILE_GAP_PX) / n);
    }

    function lessonBlockTopPx(
        lesson: ScheduleLessonItem,
        dateStr: string,
    ): number {
        const same = sameStartSorted(lesson, dateStr);
        const h = sameStartTileHeightPx(lesson, dateStr);
        const idx = same.findIndex((x) => x.id === lesson.id);

        if (idx < 0) {
            return slotTopPx(isoToHm(lesson.startTime));
        }

        return (
            slotTopPx(isoToHm(lesson.startTime)) +
            idx * (h + SAME_START_TILE_GAP_PX)
        );
    }

    function lessonBlockHeightPx(
        lesson: ScheduleLessonItem,
        dateStr: string,
    ): number {
        return sameStartTileHeightPx(lesson, dateStr);
    }

    async function loadWeek(): Promise<void> {
        if (props.parentSchedule) {
            return;
        }

        const sid = props.schoolId.trim();

        if (!sid) {
            internalItems.value = [];
            errorMessage.value = null;

            return;
        }

        const seq = ++fetchSeq;

        errorMessage.value = null;

        const { dateFrom, dateTo } = weekRangeFromMonday(localWeekStart.value);

        try {
            const data = await fetchSchoolSchedule(sid, dateFrom, dateTo);

            if (seq !== fetchSeq) {
                return;
            }

            internalItems.value = data;
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
                return;
            }

            internalItems.value = [];
            errorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać harmonogramu lekcji.',
            );
        }
    }

    watch(
        [localWeekStart, () => props.schoolId],
        () => {
            if (!props.parentSchedule) {
                void loadWeek();
            }
        },
        { immediate: true },
    );

    watch(
        activeWeekStart,
        (w) => {
            calendarSelected.value = weekCalendarDatesFromMonday(w);
        },
        { immediate: true },
    );

    function commitWeekMonday(monday: Date): void {
        const m = getMonday(monday);

        if (props.parentSchedule) {
            emit('update:weekStart', m);

            return;
        }

        localWeekStart.value = m;
    }

    function handlePrevWeek(): void {
        const d = new Date(activeWeekStart.value);

        d.setDate(d.getDate() - 7);
        commitWeekMonday(d);
    }

    function handleNextWeek(): void {
        const d = new Date(activeWeekStart.value);

        d.setDate(d.getDate() + 7);
        commitWeekMonday(d);
    }

    function handleCalendarUpdate(
        value: DateValue | DateValue[] | undefined,
    ): void {
        if (value === undefined) {
            return;
        }

        const arr = Array.isArray(value) ? value : [value];

        if (arr.length === 0) {
            return;
        }

        let anchor = arr[0]!;

        for (const v of arr) {
            if (toDate(v).getTime() > toDate(anchor).getTime()) {
                anchor = v;
            }
        }

        const monday = getMonday(toDate(anchor));

        commitWeekMonday(monday);
        isCalendarOpen.value = false;
    }

    function handleKeyDownWeekNav(
        event: KeyboardEvent,
        direction: 'prev' | 'next',
    ): void {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();

        if (direction === 'prev') {
            handlePrevWeek();
        } else {
            handleNextWeek();
        }
    }

    function isStudentRatingSelectableLesson(
        lesson: ScheduleLessonItem,
    ): boolean {
        return (
            props.studentRatingSelectionEnabled &&
            lesson.kind === 'lesson' &&
            lesson.type.trim().toUpperCase() === 'PRACTICE' &&
            lesson.status.trim().toUpperCase() === 'COMPLETED'
        );
    }

    function blockIsClickable(lesson: ScheduleLessonItem): boolean {
        return (
            isScheduleManagerItemEditable(props.eventEditEnabled, lesson) ||
            isStudentRatingSelectableLesson(lesson)
        );
    }

    function blockAccessibilityLabel(lesson: ScheduleLessonItem): string {
        const base = ariaSummaryForLesson(lesson, props.practicePrimaryLine);

        if (isStudentRatingSelectableLesson(lesson)) {
            return `${base}. Naciśnij Enter lub Spację, aby otworzyć opinię.`;
        }

        if (!props.eventEditEnabled) {
            return base;
        }

        if (isScheduleInstructorEvent(lesson)) {
            return `${base}. Naciśnij Enter lub Spację, aby edytować blok czasu.`;
        }

        if (isScheduleBookedPracticalLesson(lesson)) {
            return `${base}. Naciśnij Enter lub Spację, aby edytować jazdę praktyczną.`;
        }

        return base;
    }

    function lessonBlockInteractiveClasses(lesson: ScheduleLessonItem): string {
        if (!blockIsClickable(lesson)) {
            return '';
        }

        return 'cursor-pointer hover:brightness-[0.97] focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none dark:hover:brightness-[1.08]';
    }

    function handleScheduleBlockClick(lesson: ScheduleLessonItem): void {
        if (!blockIsClickable(lesson)) {
            return;
        }

        if (isStudentRatingSelectableLesson(lesson)) {
            emit('lesson-selected', lesson);

            return;
        }

        const target = buildScheduleManagerItemEditRoute(
            lesson,
            props.schoolId,
        );

        if (!target) {
            return;
        }

        void navigateTo(target);
    }

    function handleScheduleBlockKeydown(
        e: KeyboardEvent,
        lesson: ScheduleLessonItem,
    ): void {
        if (!blockIsClickable(lesson)) {
            return;
        }

        if (e.key !== 'Enter' && e.key !== ' ') {
            return;
        }

        e.preventDefault();
        handleScheduleBlockClick(lesson);
    }

    return {
        BASE_HOUR,
        GRID_HEIGHT_PX,
        WEEK_PICKER_CALENDAR_MAX,
        WEEK_PICKER_CALENDAR_MIN,
        blockAccessibilityLabel,
        blockIsClickable,
        calendarSelectedModel,
        compactWeekRangeLabel,
        displayError,
        displayItems,
        displayLoading,
        earliestStartLabel,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
        handleNextWeek,
        handlePrevWeek,
        handleScheduleBlockClick,
        handleScheduleBlockKeydown,
        hourLabels,
        isCalendarOpen,
        lessonBlockHeightPx,
        lessonBlockInteractiveClasses,
        lessonBlockTopPx,
        lessonsForDate,
        loadWeek,
        scheduleInstructorCount,
        weekDays,
        weekRangeLabel,
    };
}
