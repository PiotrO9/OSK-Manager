import { describe, expect, it } from 'vitest';
import { parseScheduleAvailabilityCheck } from './parseScheduleAvailabilityCheck';

const instructorId = '11111111-1111-4111-8111-111111111111';
const vehicleId = '22222222-2222-4222-8222-222222222222';
const eventId = '33333333-3333-4333-8333-333333333333';
const lessonId = '44444444-4444-4444-8444-444444444444';
const courseId = '55555555-5555-4555-8555-555555555555';
const studentId = '66666666-6666-4666-8666-666666666666';

describe('parseScheduleAvailabilityCheck', () => {
    it('parses and trims a drive candidate', () => {
        expect(
            parseScheduleAvailabilityCheck({
                intent: 'event_create',
                instructorId: ` ${instructorId} `,
                eventType: 'DRIVE',
                date: '2026-09-24',
                startTime: '10:00',
                endTime: '11:00',
                vehicleId: ` ${vehicleId} `,
            }),
        ).toEqual({
            intent: 'event_create',
            instructorId,
            eventType: 'DRIVE',
            date: '2026-09-24',
            startTime: '10:00',
            endTime: '11:00',
            vehicleId,
        });
    });

    it('parses a drive candidate without a vehicle for an early instructor check', () => {
        expect(
            parseScheduleAvailabilityCheck({
                intent: 'event_create',
                instructorId,
                eventType: 'DRIVE',
                date: '2026-09-24',
                startTime: '10:00',
                endTime: '11:00',
            }),
        ).toEqual({
            intent: 'event_create',
            instructorId,
            eventType: 'DRIVE',
            date: '2026-09-24',
            startTime: '10:00',
            endTime: '11:00',
        });
    });

    it('parses an event edit candidate without client-owned event type', () => {
        expect(
            parseScheduleAvailabilityCheck({
                intent: 'event_edit',
                eventId,
                instructorId,
                date: '2026-09-24',
                startTime: '12:00',
                endTime: '13:00',
                vehicleId,
            }),
        ).toEqual({
            intent: 'event_edit',
            eventId,
            instructorId,
            date: '2026-09-24',
            startTime: '12:00',
            endTime: '13:00',
            vehicleId,
        });
    });

    it('parses a lesson edit candidate', () => {
        expect(
            parseScheduleAvailabilityCheck({
                intent: 'lesson_edit',
                lessonId,
                instructorId,
                vehicleId,
                date: '2026-09-26',
                startTime: '12:00',
                endTime: '13:00',
            }),
        ).toEqual({
            intent: 'lesson_edit',
            lessonId,
            instructorId,
            vehicleId,
            date: '2026-09-26',
            startTime: '12:00',
            endTime: '13:00',
        });
    });

    it('parses manager and student lesson booking candidates', () => {
        expect(
            parseScheduleAvailabilityCheck({
                intent: 'lesson_create',
                courseId,
                studentId,
                instructorId,
                vehicleId,
                date: '2026-09-26',
                startTime: '12:00',
                endTime: '13:00',
            }),
        ).toEqual({
            intent: 'lesson_create',
            courseId,
            studentId,
            instructorId,
            vehicleId,
            date: '2026-09-26',
            startTime: '12:00',
            endTime: '13:00',
        });

        expect(
            parseScheduleAvailabilityCheck({
                intent: 'lesson_self_book',
                courseId,
                instructorId,
                date: '2026-09-26',
                startTime: '12:00',
                endTime: '13:00',
            }),
        ).toEqual({
            intent: 'lesson_self_book',
            courseId,
            instructorId,
            date: '2026-09-26',
            startTime: '12:00',
            endTime: '13:00',
        });
    });

    it.each([
        {},
        {
            intent: 'event_edit',
            eventId,
            instructorId,
            eventType: 'DRIVE',
            date: '2026-09-24',
            startTime: '10:00',
            endTime: '11:00',
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '24.09.2026',
            startTime: '10:00',
            endTime: '11:00',
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-02-30',
            startTime: '10:00',
            endTime: '11:00',
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-09-24',
            startTime: '11:00',
            endTime: '10:00',
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-03-29',
            startTime: '02:00',
            endTime: '03:00',
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-09-24',
            startTime: '10:00',
            endTime: '11:00',
            vehicleId,
        },
        {
            intent: 'event_create',
            instructorId,
            eventType: 'THEORY',
            date: '2026-09-24',
            startTime: '10:00',
            endTime: '11:00',
            unexpected: 'field',
        },
    ])('rejects invalid payload %#', (payload) => {
        expect(parseScheduleAvailabilityCheck(payload)).toBeNull();
    });
});
