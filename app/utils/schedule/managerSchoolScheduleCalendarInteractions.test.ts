import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    getManagerSchoolScheduleBlockAccessibilityLabel,
    getManagerSchoolScheduleBlockInteractiveClasses,
    isManagerSchoolScheduleBlockClickable,
    isStudentRatingSelectableScheduleLesson,
    SCHEDULE_BLOCK_INTERACTIVE_CLASSES,
} from '~/utils/schedule/managerSchoolScheduleCalendarInteractions';

function lesson(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'SCHEDULED',
        startTime: '2026-08-10T09:00:00',
        endTime: '2026-08-10T10:00:00',
        instructor: {
            id: 'instructor-1',
            firstName: 'Jan',
            lastName: 'Kowalski',
        },
        student: {
            id: 'student-1',
            firstName: 'Anna',
            lastName: 'Nowak',
        },
        ...overrides,
    };
}

describe('managerSchoolScheduleCalendarInteractions', () => {
    it('detects student rating selectable practical lessons', () => {
        expect(
            isStudentRatingSelectableScheduleLesson(
                lesson({ status: 'COMPLETED' }),
                true,
            ),
        ).toBe(true);
        expect(
            isStudentRatingSelectableScheduleLesson(
                lesson({ status: 'SCHEDULED' }),
                true,
            ),
        ).toBe(false);
        expect(
            isStudentRatingSelectableScheduleLesson(
                lesson({ status: 'COMPLETED' }),
                false,
            ),
        ).toBe(false);
        expect(
            isStudentRatingSelectableScheduleLesson(
                lesson({ type: 'THEORY', status: 'COMPLETED' }),
                true,
            ),
        ).toBe(false);
    });

    it('marks blocks clickable for editable schedule items or rating selection', () => {
        expect(
            isManagerSchoolScheduleBlockClickable(
                lesson({ status: 'COMPLETED' }),
                {
                    eventEditEnabled: false,
                    studentRatingSelectionEnabled: true,
                },
            ),
        ).toBe(true);
        expect(
            isManagerSchoolScheduleBlockClickable(
                lesson({ kind: 'instructor_event', status: 'PLANNED' }),
                {
                    eventEditEnabled: true,
                    studentRatingSelectionEnabled: false,
                },
            ),
        ).toBe(true);
        expect(
            isManagerSchoolScheduleBlockClickable(lesson(), {
                eventEditEnabled: false,
                studentRatingSelectionEnabled: false,
            }),
        ).toBe(false);
    });

    it('builds accessibility labels for rating, event edit and non-clickable blocks', () => {
        expect(
            getManagerSchoolScheduleBlockAccessibilityLabel(
                lesson({ status: 'COMPLETED' }),
                {
                    eventEditEnabled: false,
                    studentRatingSelectionEnabled: true,
                    practicePrimaryLine: 'student',
                },
            ),
        ).toContain('otworzyć opinię');
        expect(
            getManagerSchoolScheduleBlockAccessibilityLabel(
                lesson({ kind: 'instructor_event', status: 'PLANNED' }),
                {
                    eventEditEnabled: true,
                    studentRatingSelectionEnabled: false,
                    practicePrimaryLine: 'student',
                },
            ),
        ).toContain('edytować blok czasu');
        expect(
            getManagerSchoolScheduleBlockAccessibilityLabel(lesson(), {
                eventEditEnabled: false,
                studentRatingSelectionEnabled: false,
                practicePrimaryLine: 'student',
            }),
        ).not.toContain('Naciśnij Enter');
    });

    it('returns interactive classes only for clickable blocks', () => {
        expect(
            getManagerSchoolScheduleBlockInteractiveClasses(
                lesson({ status: 'COMPLETED' }),
                {
                    eventEditEnabled: false,
                    studentRatingSelectionEnabled: true,
                },
            ),
        ).toBe(SCHEDULE_BLOCK_INTERACTIVE_CLASSES);
        expect(
            getManagerSchoolScheduleBlockInteractiveClasses(lesson(), {
                eventEditEnabled: false,
                studentRatingSelectionEnabled: false,
            }),
        ).toBe('');
    });
});
