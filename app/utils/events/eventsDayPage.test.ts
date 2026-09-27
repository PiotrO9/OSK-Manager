import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    displayEventMeta,
    displayEventPrimary,
    displayParticipantCount,
    eventTypeBadgeClasses,
    eventTypeLabel,
    eventsDayStatusCode,
    eventsDayStatusLabel,
    statusFilterLabel,
} from './eventsDayPage';

function scheduleEvent(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'event-1',
        kind: 'instructor_event',
        type: 'DRIVE',
        status: 'PLANNED',
        startTime: '2026-08-16T08:00:00',
        endTime: '2026-08-16T09:00:00',
        instructor: {
            id: 'instructor-1',
            firstName: 'Anna',
            lastName: 'Nowak',
        },
        participantCount: 2,
        capacity: 3,
        vehicle: {
            id: 'vehicle-1',
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
        },
        ...overrides,
    };
}

describe('eventsDayPage utils', () => {
    it('maps event status filter labels', () => {
        expect(statusFilterLabel('ALL')).toBe('Wszystkie');
        expect(statusFilterLabel('DONE')).toBe('Zrealizowane');
    });

    it('formats primary and meta event text', () => {
        const event = scheduleEvent();

        expect(displayEventPrimary(event, false)).toContain('Jazda praktyczna');
        expect(displayEventPrimary(event, true)).toContain('Anna Nowak');
        expect(displayEventMeta(event)).toContain('2/3 kursantów');
        expect(displayEventMeta(event)).toContain('Toyota Yaris');
    });

    it('falls back when participant count or event type is unknown', () => {
        expect(
            displayParticipantCount(
                scheduleEvent({ participantCount: undefined, capacity: 4 }),
            ),
        ).toBe('0/4');
        expect(eventTypeLabel('WORKSHOP')).toBe('WORKSHOP');
        expect(eventTypeBadgeClasses('WORKSHOP')).toBe('');
    });

    it('shows lesson status and its single student correctly', () => {
        const lesson = scheduleEvent({
            kind: 'lesson',
            type: 'PRACTICE',
            status: 'SCHEDULED',
            participantCount: undefined,
            capacity: undefined,
            student: { id: 's-1', firstName: 'Jan', lastName: 'Kowalski' },
        });

        expect(displayParticipantCount(lesson)).toBe('1');
        expect(eventsDayStatusCode(lesson)).toBe('PLANNED');
        expect(eventsDayStatusLabel(lesson)).toBe('Zaplanowane');
        expect(eventsDayStatusCode({ ...lesson, status: 'COMPLETED' })).toBe(
            'DONE',
        );
    });
});
