import { describe, expect, it } from 'vitest';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import {
    buildManagerLessonHeaderMeta,
    formatManagerLessonDateRangeLabel,
    getManagerLessonStatusLabel,
    getManagerLessonStatusTone,
} from '~/utils/lessons/managerLessonEditPresentation';

function lesson(
    overrides: Partial<ManagerLessonDetail> = {},
): ManagerLessonDetail {
    return {
        id: 'lesson-1',
        courseId: 'course-1',
        studentId: 'student-123456789',
        instructorId: 'instructor-1',
        vehicleId: null,
        lessonType: 'PRACTICE',
        startTime: '2026-09-12T08:00:00',
        endTime: '2026-09-12T09:30:00',
        status: 'SCHEDULED',
        ...overrides,
    };
}

describe('managerLessonEditPresentation', () => {
    it('maps known lesson statuses to labels and keeps unknown status raw', () => {
        expect(getManagerLessonStatusLabel(undefined)).toBe('-');
        expect(getManagerLessonStatusLabel('')).toBe('-');
        expect(getManagerLessonStatusLabel('SCHEDULED')).toBe('Zaplanowana');
        expect(getManagerLessonStatusLabel('COMPLETED')).toBe('Zakonczona');
        expect(getManagerLessonStatusLabel('CANCELLED')).toBe('Anulowana');
        expect(getManagerLessonStatusLabel('CANCELED')).toBe('Anulowana');
        expect(getManagerLessonStatusLabel('DONE')).toBe('DONE');
    });

    it('maps known lesson statuses to tones', () => {
        expect(getManagerLessonStatusTone('SCHEDULED')).toBe('info');
        expect(getManagerLessonStatusTone('COMPLETED')).toBe('success');
        expect(getManagerLessonStatusTone('CANCELLED')).toBe('danger');
        expect(getManagerLessonStatusTone('CANCELED')).toBe('danger');
        expect(getManagerLessonStatusTone('DONE')).toBe('neutral');
        expect(getManagerLessonStatusTone(undefined)).toBe('neutral');
    });

    it('formats lesson date range and falls back for invalid dates', () => {
        expect(formatManagerLessonDateRangeLabel()).toBe('Termin lekcji');
        expect(
            formatManagerLessonDateRangeLabel('invalid', '2026-09-12T09:30:00'),
        ).toBe('Termin lekcji');
        expect(
            formatManagerLessonDateRangeLabel(
                '2026-09-12T08:00:00',
                '2026-09-12T09:30:00',
            ),
        ).toBe(
            `${new Intl.DateTimeFormat('pl-PL', {
                day: '2-digit',
                month: 'long',
            }).format(
                new Date('2026-09-12T08:00:00'),
            )}, ${new Intl.DateTimeFormat('pl-PL', {
                hour: '2-digit',
                minute: '2-digit',
            }).format(
                new Date('2026-09-12T08:00:00'),
            )}-${new Intl.DateTimeFormat('pl-PL', {
                hour: '2-digit',
                minute: '2-digit',
            }).format(new Date('2026-09-12T09:30:00'))}`,
        );
    });

    it('builds header meta from loaded lesson', () => {
        expect(buildManagerLessonHeaderMeta(null, 'Jan Kowalski')).toEqual([]);
        expect(buildManagerLessonHeaderMeta(lesson(), 'Jan Kowalski')).toEqual([
            {
                label: 'Kursant',
                value: 'Jan Kowalski',
                tone: 'neutral',
            },
            {
                label: 'Status',
                value: 'Zaplanowana',
                tone: 'info',
            },
        ]);
        expect(buildManagerLessonHeaderMeta(lesson(), null)[0]?.value).toBe(
            'student-...',
        );
    });
});
