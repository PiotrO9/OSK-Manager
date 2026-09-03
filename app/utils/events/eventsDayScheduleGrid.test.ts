import { describe, expect, it } from 'vitest';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    getEventsDayAttentionEvents,
    getEventsDayEffectiveViewMode,
    getEventsDayFilteredEvents,
    getEventsDayHourFromIso,
    getEventsDayInitialsForName,
    getEventsDayIsManager,
    getEventsDayManagerScheduleColumns,
    getEventsDayManagerScheduleRows,
    getEventsDayPageDescription,
    getEventsDayParticipantTotal,
    getEventsDayPlannedEventsCount,
    getEventsDayScheduleHourRange,
    getEventsDaySortedEvents,
    getEventsDayVisibleEventsLabel,
} from './eventsDayScheduleGrid';

function makeEvent(overrides: Partial<ScheduleLessonItem>): ScheduleLessonItem {
    return {
        id: 'event-1',
        type: 'PRACTICE',
        status: 'PLANNED',
        startTime: '2026-08-20T08:00:00.000Z',
        endTime: '2026-08-20T09:00:00.000Z',
        ...overrides,
    };
}

function makeInstructor(
    overrides: Partial<InstructorListItem>,
): InstructorListItem {
    return {
        id: 'instructor-1',
        firstName: 'Jan',
        lastName: 'Nowak',
        email: 'jan@example.com',
        ...overrides,
    };
}

describe('eventsDayScheduleGrid', () => {
    it('rozpoznaje role managerskie i opis strony', () => {
        expect(getEventsDayIsManager(' manager ')).toBe(true);
        expect(getEventsDayIsManager('ADMIN')).toBe(true);
        expect(getEventsDayIsManager('STUDENT')).toBe(false);
        expect(getEventsDayPageDescription(true)).toContain('instruktorów');
        expect(getEventsDayPageDescription(false)).toContain('Twoje');
    });

    it('filtruje, sortuje i liczy wydarzenia', () => {
        const events = [
            makeEvent({
                id: 'cancelled',
                status: 'CANCELLED',
                startTime: '2026-08-20T10:00:00.000Z',
                participantCount: 2,
            }),
            makeEvent({
                id: 'planned',
                status: 'PLANNED',
                startTime: '2026-08-20T08:00:00.000Z',
                students: [
                    { id: 's-1', firstName: 'A', lastName: 'B' },
                    { id: 's-2', firstName: 'C', lastName: 'D' },
                ],
            }),
        ];

        expect(
            getEventsDayFilteredEvents({ events, selectedStatus: 'ALL' }),
        ).toHaveLength(2);
        expect(
            getEventsDayFilteredEvents({
                events,
                selectedStatus: 'PLANNED',
            }).map((event) => event.id),
        ).toEqual(['planned']);
        expect(
            getEventsDaySortedEvents(events).map((event) => event.id),
        ).toEqual(['planned', 'cancelled']);
        expect(
            getEventsDayAttentionEvents(events).map((event) => event.id),
        ).toEqual(['cancelled']);
        expect(getEventsDayPlannedEventsCount(events)).toBe(1);
        expect(getEventsDayParticipantTotal(events)).toBe(4);
    });

    it('liczy label widocznych wyników i wymusza listę poza desktop managerem', () => {
        expect(
            getEventsDayVisibleEventsLabel({ visibleCount: 3, totalCount: 3 }),
        ).toBe('3');
        expect(
            getEventsDayVisibleEventsLabel({ visibleCount: 1, totalCount: 3 }),
        ).toBe('1 z 3');
        expect(
            getEventsDayEffectiveViewMode({
                isManager: true,
                isCompactViewport: false,
                viewMode: 'grid',
            }),
        ).toBe('grid');
        expect(
            getEventsDayEffectiveViewMode({
                isManager: true,
                isCompactViewport: true,
                viewMode: 'grid',
            }),
        ).toBe('list');
        expect(
            getEventsDayEffectiveViewMode({
                isManager: false,
                isCompactViewport: false,
                viewMode: 'grid',
            }),
        ).toBe('list');
    });

    it('buduje kolumny managera z instruktorów i wydarzeń bez przypisania', () => {
        const columns = getEventsDayManagerScheduleColumns({
            isManager: true,
            instructors: [
                makeInstructor({
                    id: 'profile-1',
                    userId: 'user-1',
                    firstName: 'Anna',
                    lastName: 'Kowal',
                }),
            ],
            events: [
                makeEvent({
                    id: 'assigned',
                    instructor: {
                        id: 'user-1',
                        firstName: 'Anna',
                        lastName: 'Kowal',
                    },
                }),
                makeEvent({ id: 'unassigned' }),
            ],
        });

        expect(columns.map((column) => column.id)).toEqual([
            'user-1',
            'without-instructor',
        ]);
        expect(columns[1]?.name).toBe('Bez przypisanego instruktora');
        expect(columns[0]?.events.map((event) => event.id)).toEqual([
            'assigned',
        ]);
    });

    it('buduje zakres godzin i wiersze gridu', () => {
        const events = [
            makeEvent({
                id: 'early',
                startTime: '2026-08-20T06:00:00',
                endTime: '2026-08-20T07:00:00',
            }),
            makeEvent({
                id: 'late',
                startTime: '2026-08-20T19:00:00',
                endTime: '2026-08-20T20:00:00',
            }),
        ];
        const range = getEventsDayScheduleHourRange(events);
        const columns = [
            {
                id: 'column-1',
                name: 'Column',
                initials: 'C',
                events,
            },
        ];

        expect(getEventsDayHourFromIso('wrong')).toBeNull();
        expect(getEventsDayInitialsForName('Anna Maria Kowal')).toBe('AM');
        expect(range).toEqual({ startHour: 6, endHour: 20 });

        const rows = getEventsDayManagerScheduleRows({
            columns,
            startHour: range.startHour,
            endHour: range.endHour,
        });

        expect(rows[0]?.label).toBe('06:00');
        expect(rows.at(-1)?.label).toBe('20:00');
        expect(rows[13]?.cells[0]?.events.map((event) => event.id)).toEqual([
            'late',
        ]);
    });
});
