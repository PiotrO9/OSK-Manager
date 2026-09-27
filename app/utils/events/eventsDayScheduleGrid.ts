import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    displayEventsDayInstructorName,
    eventsDayStatusCode,
    type EventsDayStatusFilterOption,
} from '~/utils/events/eventsDayPage';

export type EventsDayGridViewMode = 'grid' | 'list';
export const EVENTS_DAY_HOUR_HEIGHT_PX = 96;

export interface EventsDayPositionedEvent {
    event: ScheduleLessonItem;
    topPx: number;
    heightPx: number;
    lane: number;
    laneCount: number;
}

export interface EventsDayGridInstructorColumn {
    id: string;
    name: string;
    initials: string;
    avatarUrl: string | null;
    events: ScheduleLessonItem[];
}

export interface EventsDayGridInstructorRow {
    hour: number;
    label: string;
    cells: {
        key: string;
        columnId: string;
        events: ScheduleLessonItem[];
    }[];
}

export function getEventsDayIsManager(role: string | undefined): boolean {
    const normalized = role?.trim().toUpperCase();

    return normalized === 'MANAGER' || normalized === 'ADMIN';
}

export function getEventsDayFilteredEvents(options: {
    events: ScheduleLessonItem[];
    selectedStatus: EventsDayStatusFilterOption;
}): ScheduleLessonItem[] {
    if (options.selectedStatus === 'ALL') {
        return options.events;
    }

    return options.events.filter(
        (event) => eventsDayStatusCode(event) === options.selectedStatus,
    );
}

export function getEventsDayAttentionEvents(
    events: ScheduleLessonItem[],
): ScheduleLessonItem[] {
    return events.filter((event) => {
        const status = eventsDayStatusCode(event);

        return status === 'NO_SHOW' || status === 'CANCELLED';
    });
}

export function getEventsDayPlannedEventsCount(
    events: ScheduleLessonItem[],
): number {
    return events.filter((event) => eventsDayStatusCode(event) === 'PLANNED')
        .length;
}

export function getEventsDayParticipantTotal(
    events: ScheduleLessonItem[],
): number {
    return events.reduce((sum, event) => {
        if (typeof event.participantCount === 'number') {
            return sum + event.participantCount;
        }

        if (Array.isArray(event.students)) {
            return sum + event.students.length;
        }

        if (event.student) {
            return sum + 1;
        }

        return sum;
    }, 0);
}

export function getEventsDayPageDescription(isManager: boolean): string {
    return isManager
        ? 'Dzienne lekcje, teoria i bloki czasu instruktorów.'
        : 'Twoje lekcje i bloki czasu w wybranym dniu.';
}

export function getEventsDayVisibleEventsLabel(options: {
    visibleCount: number;
    totalCount: number;
}): string {
    if (options.visibleCount === options.totalCount) {
        return `${options.visibleCount}`;
    }

    return `${options.visibleCount} z ${options.totalCount}`;
}

export function getEventsDayEffectiveViewMode(options: {
    isManager: boolean;
    isCompactViewport: boolean;
    viewMode: EventsDayGridViewMode;
}): EventsDayGridViewMode {
    return options.isManager && !options.isCompactViewport
        ? options.viewMode
        : 'list';
}

export function getEventsDaySortedEvents(
    events: ScheduleLessonItem[],
): ScheduleLessonItem[] {
    return [...events].sort(
        (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
}

export function getEventsDayHourFromIso(iso: string): number | null {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return null;
    }

    return d.getHours();
}

export function getEventsDayInitialsForName(name: string): string {
    const parts = name
        .split(/\s+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    if (parts.length === 0) {
        return '?';
    }

    return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function getEventsDayManagerScheduleColumns(options: {
    isManager: boolean;
    instructors: InstructorListItem[];
    events: ScheduleLessonItem[];
}): EventsDayGridInstructorColumn[] {
    if (!options.isManager) {
        return [];
    }

    const columns = new Map<string, EventsDayGridInstructorColumn>();

    for (const instructor of options.instructors) {
        const userId = instructor.userId?.trim();
        const id = userId || instructor.id;
        const name = formatInstructorDisplayName(instructor);
        const column = {
            id,
            name,
            initials: getEventsDayInitialsForName(name),
            avatarUrl: instructor.avatarUrl,
            events: [],
        };

        columns.set(id, column);
        columns.set(instructor.id, column);
    }

    for (const event of options.events) {
        const id = event.instructor?.id?.trim() || 'without-instructor';
        const fallbackName = displayEventsDayInstructorName(event);
        const existing = columns.get(id);

        if (existing) {
            existing.events.push(event);
            continue;
        }

        columns.set(id, {
            id,
            name:
                fallbackName === '-'
                    ? 'Bez przypisanego instruktora'
                    : fallbackName,
            initials:
                fallbackName === '-'
                    ? '?'
                    : getEventsDayInitialsForName(fallbackName),
            avatarUrl: event.instructor?.avatarUrl ?? null,
            events: [event],
        });
    }

    return Array.from(
        new Map(columns.values().map((column) => [column.id, column])).values(),
    )
        .filter((column) => column.events.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

export function getEventsDayScheduleHourRange(events: ScheduleLessonItem[]): {
    startHour: number;
    endHour: number;
} {
    const starts = events
        .map((event) => getEventsDayHourFromIso(event.startTime))
        .filter((hour): hour is number => hour !== null);

    const ends = events
        .map((event) => {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                return null;
            }

            const startMinute = start.getHours() * 60 + start.getMinutes();
            const durationMinutes = Math.max(
                0,
                (end.getTime() - start.getTime()) / 60_000,
            );

            return Math.min(
                24,
                Math.ceil((startMinute + durationMinutes) / 60),
            );
        })
        .filter((hour): hour is number => hour !== null);

    return {
        startHour: Math.min(7, ...starts),
        endHour: Math.max(18, ...ends),
    };
}

export function getEventsDayPositionedEvents(
    events: ScheduleLessonItem[],
    startHour: number,
): EventsDayPositionedEvent[] {
    const valid = events
        .flatMap((event) => {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                return [];
            }

            const startMinute = start.getHours() * 60 + start.getMinutes();
            const durationMinutes = Math.min(
                24 * 60 - startMinute,
                Math.max(15, (end.getTime() - start.getTime()) / 60_000),
            );

            return [
                {
                    event,
                    startMinute,
                    endMinute: startMinute + durationMinutes,
                },
            ];
        })
        .sort(
            (a, b) =>
                a.startMinute - b.startMinute || a.endMinute - b.endMinute,
        );

    const result: EventsDayPositionedEvent[] = [];
    let group: EventsDayPositionedEvent[] = [];
    let groupEnd = -1;
    let laneEnds: number[] = [];

    function finishGroup(): void {
        for (const item of group) {
            item.laneCount = laneEnds.length;
        }

        group = [];
        laneEnds = [];
    }

    for (const item of valid) {
        if (item.startMinute >= groupEnd) {
            finishGroup();
            groupEnd = -1;
        }

        let lane = laneEnds.findIndex((end) => end <= item.startMinute);

        if (lane < 0) {
            lane = laneEnds.length;
        }

        laneEnds[lane] = item.endMinute;
        groupEnd = Math.max(groupEnd, item.endMinute);

        const positioned = {
            event: item.event,
            topPx:
                ((item.startMinute - startHour * 60) / 60) *
                EVENTS_DAY_HOUR_HEIGHT_PX,
            heightPx:
                ((item.endMinute - item.startMinute) / 60) *
                EVENTS_DAY_HOUR_HEIGHT_PX,
            lane,
            laneCount: 1,
        };

        group.push(positioned);
        result.push(positioned);
    }

    finishGroup();

    return result;
}

export function getEventsDayManagerScheduleRows(options: {
    columns: EventsDayGridInstructorColumn[];
    startHour: number;
    endHour: number;
}): EventsDayGridInstructorRow[] {
    const rows: EventsDayGridInstructorRow[] = [];

    for (let hour = options.startHour; hour < options.endHour; hour += 1) {
        rows.push({
            hour,
            label: `${String(hour).padStart(2, '0')}:00`,
            cells: options.columns.map((column) => ({
                key: `${column.id}-${hour}`,
                columnId: column.id,
                events: column.events.filter(
                    (event) =>
                        getEventsDayHourFromIso(event.startTime) === hour,
                ),
            })),
        });
    }

    return rows;
}
