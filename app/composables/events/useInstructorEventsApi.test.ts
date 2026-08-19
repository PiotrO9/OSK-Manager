import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';

const requestBffData = vi.fn();
const requestBffSuccess = vi.fn();

function eventApiData(overrides: Record<string, unknown> = {}) {
    return {
        event: {
            id: 'event-1',
            instructorId: 'instructor-1',
            type: 'DRIVE',
            startTime: '2026-08-16T08:00:00.000Z',
            endTime: '2026-08-16T09:00:00.000Z',
            vehicleId: 'vehicle-1',
            createdAt: '2026-08-15T10:00:00.000Z',
            ...overrides,
        },
    };
}

describe('useInstructorEventsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('requestBffData', requestBffData);
        vi.stubGlobal('requestBffSuccess', requestBffSuccess);
    });

    it('creates instructor events with a trimmed request body', async () => {
        requestBffData.mockResolvedValue(eventApiData());
        const { useInstructorEventsApi } =
            await import('./useInstructorEventsApi');
        const api = useInstructorEventsApi();

        await api.createInstructorEvent({
            instructorId: ' instructor-1 ',
            type: 'DRIVE',
            startTime: ' 2026-08-16T08:00:00.000Z ',
            endTime: ' 2026-08-16T09:00:00.000Z ',
            vehicleId: ' vehicle-1 ',
            capacity: 2,
        });

        expect(requestBffData).toHaveBeenCalledWith('POST', '/api/events', {
            body: {
                instructorId: 'instructor-1',
                type: 'DRIVE',
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
                vehicleId: 'vehicle-1',
                capacity: 2,
            },
            fallbackMessage: 'Nie udało się utworzyć wydarzenia.',
        });
    });

    it('patches instructor events with only provided fields', async () => {
        requestBffData.mockResolvedValue(
            eventApiData({
                instructorId: 'instructor-2',
                status: 'DONE',
                vehicleId: null,
            }),
        );
        const { useInstructorEventsApi } =
            await import('./useInstructorEventsApi');
        const api = useInstructorEventsApi();

        await api.updateInstructorEvent(' event-1 ', {
            instructorId: ' instructor-2 ',
            vehicleId: null,
            status: 'DONE',
        });

        expect(requestBffData).toHaveBeenCalledWith(
            'PATCH',
            '/api/events/event-1',
            {
                body: {
                    instructorId: 'instructor-2',
                    vehicleId: null,
                    status: 'DONE',
                },
                fallbackMessage: 'Nie udało się zapisać wydarzenia.',
            },
        );
    });
});
