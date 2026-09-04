import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    displaySchedulePerson,
    displayScheduleVehicle,
    formatScheduleLessonDateTime,
    isStudentCancellableScheduleLesson,
    labelForScheduleLessonStatus,
    labelForScheduleLessonType,
} from '~/utils/schedule/managerScheduleLessonTable';

function lesson(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'SCHEDULED',
        startTime: '2026-09-12T08:00:00',
        endTime: '2026-09-12T09:00:00',
        ...overrides,
    };
}

describe('managerScheduleLessonTable', () => {
    it('formats valid date-times and preserves invalid raw values', () => {
        expect(formatScheduleLessonDateTime('not-a-date')).toBe('not-a-date');
        expect(formatScheduleLessonDateTime('2026-09-12T08:15:00')).toContain(
            '08:15',
        );
    });

    it('displays schedule people with fallback', () => {
        expect(displaySchedulePerson(undefined)).toBe('—');
        expect(
            displaySchedulePerson({ id: 'p1', firstName: '', lastName: '' }),
        ).toBe('—');
        expect(
            displaySchedulePerson({
                id: 'p1',
                firstName: 'Jan',
                lastName: 'Kowalski',
            }),
        ).toBe('Jan Kowalski');
    });

    it('displays vehicles with name and registration fallbacks', () => {
        expect(displayScheduleVehicle(undefined)).toBe('—');
        expect(
            displayScheduleVehicle({
                id: 'v1',
                name: 'Toyota',
                registrationNumber: 'WX12345',
            }),
        ).toBe('Toyota (WX12345)');
        expect(
            displayScheduleVehicle({
                id: 'v1',
                name: 'Toyota',
                registrationNumber: '',
            }),
        ).toBe('Toyota');
        expect(
            displayScheduleVehicle({
                id: 'v1',
                name: '',
                registrationNumber: 'WX12345',
            }),
        ).toBe('WX12345');
    });

    it('maps lesson types to labels', () => {
        expect(labelForScheduleLessonType('PRACTICE')).toBe('Jazda praktyczna');
        expect(labelForScheduleLessonType(' theory ')).toBe('Teoria');
        expect(labelForScheduleLessonType('EXAM')).toBe('EXAM');
        expect(labelForScheduleLessonType('   ')).toBe('—');
    });

    it('maps lesson statuses to labels', () => {
        expect(labelForScheduleLessonStatus('SCHEDULED')).toBe('Zaplanowana');
        expect(labelForScheduleLessonStatus('planned')).toBe('Zaplanowana');
        expect(labelForScheduleLessonStatus('COMPLETED')).toBe('Zrealizowana');
        expect(labelForScheduleLessonStatus('FINISHED')).toBe('Zrealizowana');
        expect(labelForScheduleLessonStatus('CANCELLED')).toBe('Anulowana');
        expect(labelForScheduleLessonStatus('CANCELED')).toBe('Anulowana');
        expect(labelForScheduleLessonStatus('NO_SHOW')).toBe('Nie stawil sie');
        expect(labelForScheduleLessonStatus('CUSTOM')).toBe('CUSTOM');
        expect(labelForScheduleLessonStatus('   ')).toBe('—');
    });

    it('detects student cancellable practical lessons', () => {
        expect(isStudentCancellableScheduleLesson(lesson())).toBe(true);
        expect(
            isStudentCancellableScheduleLesson(lesson({ kind: 'event' })),
        ).toBe(false);
        expect(
            isStudentCancellableScheduleLesson(lesson({ type: 'THEORY' })),
        ).toBe(false);
        expect(
            isStudentCancellableScheduleLesson(lesson({ status: 'COMPLETED' })),
        ).toBe(false);
    });
});
