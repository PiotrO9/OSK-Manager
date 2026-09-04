import { CalendarDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import type { LessonBookingAggregatedSlot } from '~/types/lessons/lessonBooking';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import {
    buildSchoolAvailabilityAggregatedSlots,
    buildSchoolAvailabilityCalendarFiltersPayload,
    buildSchoolAvailabilityWeekDays,
    formatSchoolAvailabilityWeekRangeLabel,
    getSchoolAvailabilitySelectedWeekMonday,
    getSchoolAvailabilitySlotTopPx,
    isSchoolAvailabilitySlotInsideTimeline,
    schoolAvailabilityTimeToMinutes,
} from './managerSchoolWeeklyAvailabilityCalendar';

const slot = (
    overrides: Partial<SchoolAvailabilitySlot> = {},
): SchoolAvailabilitySlot => ({
    instructorId: 'instructor-1',
    instructorFirstName: 'Anna',
    instructorLastName: 'Nowak',
    date: '2026-09-07',
    startTime: '08:00',
    endTime: '09:00',
    ...overrides,
});

const aggregatedSlot = (
    overrides: Partial<LessonBookingAggregatedSlot> = {},
): LessonBookingAggregatedSlot => ({
    date: '2026-09-07',
    startTime: '08:00',
    endTime: '09:00',
    instructorCount: 1,
    availableInstructors: [
        {
            id: 'instructor-1',
            firstName: 'Anna',
            lastName: 'Nowak',
        },
    ],
    ...overrides,
});

describe('manager school weekly availability calendar utilities', () => {
    it('builds the availability API filters payload', () => {
        expect(buildSchoolAvailabilityCalendarFiltersPayload()).toEqual({
            limit: 500,
            sort: 'startTime',
        });
    });

    it('builds calendar week days with stable date strings and today marker', () => {
        expect(
            buildSchoolAvailabilityWeekDays(
                new Date(2026, 8, 7),
                new Date(2026, 8, 9),
            ).map((day) => ({
                dateStr: day.dateStr,
                isToday: day.isToday,
            })),
        ).toEqual([
            { dateStr: '2026-09-07', isToday: false },
            { dateStr: '2026-09-08', isToday: false },
            { dateStr: '2026-09-09', isToday: true },
            { dateStr: '2026-09-10', isToday: false },
            { dateStr: '2026-09-11', isToday: false },
            { dateStr: '2026-09-12', isToday: false },
            { dateStr: '2026-09-13', isToday: false },
        ]);
    });

    it('formats the selected week range label', () => {
        expect(
            formatSchoolAvailabilityWeekRangeLabel(new Date(2026, 8, 7)),
        ).toBe('7 września 2026 – 13 września 2026');
    });

    it('picks the monday for the latest selected calendar date', () => {
        expect(getSchoolAvailabilitySelectedWeekMonday(undefined)).toBeNull();
        expect(getSchoolAvailabilitySelectedWeekMonday([])).toBeNull();
        expect(
            getSchoolAvailabilitySelectedWeekMonday([
                new CalendarDate(2026, 9, 8),
                new CalendarDate(2026, 9, 10),
            ]),
        ).toEqual(new Date(2026, 8, 7));
    });

    it('converts valid time strings to minutes and rejects invalid values', () => {
        expect(schoolAvailabilityTimeToMinutes('07:30')).toBe(450);
        expect(schoolAvailabilityTimeToMinutes(' 19:00 ')).toBe(1140);
        expect(schoolAvailabilityTimeToMinutes('bad')).toBeNull();
        expect(schoolAvailabilityTimeToMinutes('12:xx')).toBeNull();
    });

    it('aggregates slots by date and time while deduplicating instructors', () => {
        expect(
            buildSchoolAvailabilityAggregatedSlots([
                slot({
                    instructorId: 'instructor-2',
                    instructorFirstName: 'Jan',
                    instructorLastName: 'Kowalski',
                }),
                slot(),
                slot(),
                slot({
                    date: '2026-09-08',
                    startTime: '10:00',
                    endTime: '11:00',
                }),
            ]),
        ).toEqual([
            {
                date: '2026-09-07',
                startTime: '08:00',
                endTime: '09:00',
                instructorCount: 2,
                availableInstructors: [
                    {
                        id: 'instructor-2',
                        firstName: 'Jan',
                        lastName: 'Kowalski',
                    },
                    {
                        id: 'instructor-1',
                        firstName: 'Anna',
                        lastName: 'Nowak',
                    },
                ],
            },
            {
                date: '2026-09-08',
                startTime: '10:00',
                endTime: '11:00',
                instructorCount: 1,
                availableInstructors: [
                    {
                        id: 'instructor-1',
                        firstName: 'Anna',
                        lastName: 'Nowak',
                    },
                ],
            },
        ]);
    });

    it('keeps only slots fully inside the 7-19 timeline', () => {
        expect(isSchoolAvailabilitySlotInsideTimeline(aggregatedSlot())).toBe(
            true,
        );
        expect(
            isSchoolAvailabilitySlotInsideTimeline(
                aggregatedSlot({ startTime: '06:30' }),
            ),
        ).toBe(false);
        expect(
            isSchoolAvailabilitySlotInsideTimeline(
                aggregatedSlot({ endTime: '19:30' }),
            ),
        ).toBe(false);
        expect(
            isSchoolAvailabilitySlotInsideTimeline(
                aggregatedSlot({ startTime: '09:00', endTime: '09:00' }),
            ),
        ).toBe(false);
    });

    it('calculates vertical position from the timeline base hour', () => {
        expect(getSchoolAvailabilitySlotTopPx('07:00')).toBe(0);
        expect(getSchoolAvailabilitySlotTopPx('08:30')).toBe(90);
        expect(getSchoolAvailabilitySlotTopPx('invalid')).toBe(0);
    });
});
