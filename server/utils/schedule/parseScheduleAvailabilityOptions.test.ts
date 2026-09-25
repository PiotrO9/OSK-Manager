import { describe, expect, it } from 'vitest';
import { parseScheduleAvailabilityOptions } from './parseScheduleAvailabilityOptions';

const instructorId = '11111111-1111-4111-8111-111111111111';
const vehicleId = '22222222-2222-4222-8222-222222222222';
const courseId = '33333333-3333-4333-8333-333333333333';
const eventId = '44444444-4444-4444-8444-444444444444';
const lessonId = '55555555-5555-4555-8555-555555555555';

describe('parseScheduleAvailabilityOptions', () => {
    it('parses a drive request with its required vehicle', () => {
        expect(
            parseScheduleAvailabilityOptions({
                intent: 'event_create',
                instructorId: ` ${instructorId} `,
                eventType: 'DRIVE',
                date: '2026-09-26',
                vehicleId: ` ${vehicleId} `,
            }),
        ).toEqual({
            intent: 'event_create',
            instructorId,
            eventType: 'DRIVE',
            date: '2026-09-26',
            vehicleId,
        });
    });

    it('parses a drive request without a vehicle for day availability', () => {
        expect(
            parseScheduleAvailabilityOptions({
                intent: 'event_create',
                instructorId,
                eventType: 'DRIVE',
                date: '2026-09-26',
            }),
        ).toEqual({
            intent: 'event_create',
            instructorId,
            eventType: 'DRIVE',
            date: '2026-09-26',
        });
    });

    it('allows an optional course only for theory', () => {
        expect(
            parseScheduleAvailabilityOptions({
                intent: 'event_create',
                instructorId,
                eventType: 'THEORY',
                date: '2026-09-26',
                courseId,
            }),
        ).toEqual({
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-09-26',
            courseId,
        });
    });

    it.each([
        { intent: 'event_edit', idField: 'eventId', id: eventId },
        { intent: 'lesson_edit', idField: 'lessonId', id: lessonId },
    ] as const)('parses $intent availability options', (variant) => {
        expect(
            parseScheduleAvailabilityOptions({
                intent: variant.intent,
                [variant.idField]: variant.id,
                instructorId,
                date: '2026-09-26',
                vehicleId,
            }),
        ).toEqual({
            intent: variant.intent,
            [variant.idField]: variant.id,
            instructorId,
            date: '2026-09-26',
            vehicleId,
        });
    });

    it.each([
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '26.09.2026',
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-09-26',
            vehicleId,
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'DRIVE',
            date: '2026-09-26',
            vehicleId,
            courseId,
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-09-26',
            unexpected: true,
        },
        {
            intent: 'event_edit',
            lessonId,
            instructorId,
            date: '2026-09-26',
        },
        {
            intent: 'lesson_edit',
            lessonId,
            instructorId,
            eventType: 'DRIVE',
            date: '2026-09-26',
        },
    ])('rejects an invalid options request %#', (payload) => {
        expect(parseScheduleAvailabilityOptions(payload)).toBeNull();
    });
});
