import { getQuery, type H3Event } from 'h3';
import type { BffEventPatchBody } from './parseEventPatchBody';
import { assertEventPayload } from './eventsPayload';
import { eventDataRequest, EVENT_NOT_FOUND_HTML } from './eventsRequest';
import type { InstructorEventResponse } from './eventsTypes';

function shouldForwardIncludeSlots(event: H3Event): boolean {
    const q = getQuery(event);
    const raw = q.includeSlots;

    if (raw === true || raw === 'true' || raw === '1') {
        return true;
    }

    if (Array.isArray(raw)) {
        return raw.some((v) => v === 'true' || v === '1');
    }

    return false;
}

export async function bffEventsPost(
    event: H3Event,
    upstreamBase: string,
    body: unknown,
): Promise<{ success: true; data: { event: InstructorEventResponse } }> {
    const data = await eventDataRequest<{ event: InstructorEventResponse }>(
        event,
        upstreamBase,
        {
            path: '/events',
            method: 'POST',
            body: body ?? {},
            fallbackError: 'Nie udało się utworzyć bloku czasu',
        },
    );

    return {
        success: true,
        data: { event: assertEventPayload(data) },
    };
}

export async function bffEventsGet(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
): Promise<{ success: true; data: { event: InstructorEventResponse } }> {
    const data = await eventDataRequest<{ event: InstructorEventResponse }>(
        event,
        upstreamBase,
        {
            path: `/events/${encodeURIComponent(eventId)}`,
            method: 'GET',
            query: shouldForwardIncludeSlots(event)
                ? { includeSlots: true }
                : undefined,
            fallbackError: 'Nie udało się pobrać wydarzenia',
            notFoundHtmlError: EVENT_NOT_FOUND_HTML,
        },
    );

    return {
        success: true,
        data: { event: assertEventPayload(data) },
    };
}

export async function bffEventsDelete(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
): Promise<{ success: true }> {
    await eventDataRequest<unknown>(event, upstreamBase, {
        path: `/events/${encodeURIComponent(eventId)}`,
        method: 'DELETE',
        fallbackError: 'Nie udało się usunąć wydarzenia',
        allowEmptySuccess: true,
        notFoundHtmlError: EVENT_NOT_FOUND_HTML,
    });

    return { success: true };
}

export async function bffEventsPatch(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
    body: BffEventPatchBody,
): Promise<{ success: true; data: { event: InstructorEventResponse } }> {
    const data = await eventDataRequest<{ event: InstructorEventResponse }>(
        event,
        upstreamBase,
        {
            path: `/events/${encodeURIComponent(eventId)}`,
            method: 'PATCH',
            body: body ?? {},
            fallbackError: 'Nie udało się zaktualizować wydarzenia',
            notFoundHtmlError: EVENT_NOT_FOUND_HTML,
        },
    );

    return {
        success: true,
        data: { event: assertEventPayload(data) },
    };
}
