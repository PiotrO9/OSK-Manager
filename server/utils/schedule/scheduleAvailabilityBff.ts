import type { H3Event } from 'h3';
import { eventDataRequest } from '../events/eventsRequest';

export function bffScheduleAvailabilityCheck(
    event: H3Event,
    upstreamBase: string,
    body: unknown,
) {
    return eventDataRequest(event, upstreamBase, {
        path: '/schedule/availability-check',
        method: 'POST',
        body,
        fallbackError: 'Nie udało się sprawdzić dostępności terminu',
    }).then((data) => ({ success: true as const, data }));
}

export function bffScheduleAvailabilityOptions(
    event: H3Event,
    upstreamBase: string,
    body: unknown,
) {
    return eventDataRequest(event, upstreamBase, {
        path: '/schedule/availability-options',
        method: 'POST',
        body,
        fallbackError: 'Nie udało się pobrać dostępnych godzin',
    }).then((data) => ({ success: true as const, data }));
}
