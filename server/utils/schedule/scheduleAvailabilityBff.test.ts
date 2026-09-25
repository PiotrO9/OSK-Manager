import type { H3Event } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    bffScheduleAvailabilityCheck,
    bffScheduleAvailabilityOptions,
} from './scheduleAvailabilityBff';

const requestMocks = vi.hoisted(() => ({
    eventDataRequest: vi.fn(),
}));

vi.mock('../events/eventsRequest', () => ({
    eventDataRequest: requestMocks.eventDataRequest,
}));

describe('bffScheduleAvailabilityCheck', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('preserves the success envelope expected by the browser BFF client', async () => {
        const event = {} as H3Event;
        const body = {
            intent: 'event_create',
            instructorId: 'instructor-1',
            eventType: 'DRIVE',
            date: '2026-09-26',
            startTime: '09:00',
            endTime: '10:00',
        };
        const availability = {
            available: false,
            issues: [{ code: 'INSTRUCTOR_BUSY', field: 'instructorId' }],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        };

        requestMocks.eventDataRequest.mockResolvedValue(availability);

        await expect(
            bffScheduleAvailabilityCheck(event, 'http://localhost:4000', body),
        ).resolves.toEqual({ success: true, data: availability });
        expect(requestMocks.eventDataRequest).toHaveBeenCalledWith(
            event,
            'http://localhost:4000',
            {
                path: '/schedule/availability-check',
                method: 'POST',
                body,
                fallbackError: 'Nie udało się sprawdzić dostępności terminu',
            },
        );
    });
});

describe('bffScheduleAvailabilityOptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('forwards the request and preserves the BFF success envelope', async () => {
        const event = {} as H3Event;
        const body = {
            intent: 'event_create',
            instructorId: 'instructor-1',
            eventType: 'THEORY',
            date: '2026-09-26',
        };
        const options = {
            stepMinutes: 15,
            options: [{ startTime: '10:00', endTimes: ['11:00'] }],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        };

        requestMocks.eventDataRequest.mockResolvedValue(options);

        await expect(
            bffScheduleAvailabilityOptions(
                event,
                'http://localhost:4000',
                body,
            ),
        ).resolves.toEqual({ success: true, data: options });
        expect(requestMocks.eventDataRequest).toHaveBeenCalledWith(
            event,
            'http://localhost:4000',
            {
                path: '/schedule/availability-options',
                method: 'POST',
                body,
                fallbackError: 'Nie udało się pobrać dostępnych godzin',
            },
        );
    });
});
