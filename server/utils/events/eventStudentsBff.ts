import { createError, getQuery, type H3Event } from 'h3';
import { normalizeStudentUserIds } from './eventsPayload';
import { eventDataRequest } from './eventsRequest';
import type {
    EventStudentsAssignResponse,
    EventStudentsReplaceResponse,
} from './eventsTypes';

export async function bffEventStudentsGet(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
): Promise<{ success: true; data: EventStudentsReplaceResponse }> {
    const data = await eventDataRequest<{ studentUserIds?: unknown }>(
        event,
        upstreamBase,
        {
            path: `/events/${encodeURIComponent(eventId)}/students`,
            method: 'GET',
            fallbackError: 'Nie udało się pobrać kursantów wydarzenia',
        },
    );

    return {
        success: true,
        data: {
            studentUserIds: normalizeStudentUserIds(data?.studentUserIds),
        },
    };
}

export async function bffEventEligibleStudentsGet(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
): Promise<{ success: true; data: unknown }> {
    const q = getQuery(event);
    const startTime =
        typeof q.startTime === 'string' && q.startTime.trim()
            ? q.startTime.trim()
            : undefined;
    const endTime =
        typeof q.endTime === 'string' && q.endTime.trim()
            ? q.endTime.trim()
            : undefined;
    const data = await eventDataRequest<unknown>(event, upstreamBase, {
        path: `/events/${encodeURIComponent(eventId)}/eligible-students`,
        method: 'GET',
        query: { startTime, endTime },
        fallbackError: 'Nie udało się pobrać listy kwalifikacji kursantów',
    });

    return { success: true, data };
}

export async function bffEventStudentsPut(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
    body: { studentIds: string[] },
): Promise<{
    success: true;
    data: EventStudentsReplaceResponse;
}> {
    const data = await eventDataRequest<{ studentUserIds?: unknown }>(
        event,
        upstreamBase,
        {
            path: `/events/${encodeURIComponent(eventId)}/students`,
            method: 'PUT',
            body,
            fallbackError: 'Nie udało się zapisać listy kursantów wydarzenia',
        },
    );

    return {
        success: true,
        data: {
            studentUserIds: normalizeStudentUserIds(data?.studentUserIds),
        },
    };
}

export async function bffEventStudentsPost(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
    body: { studentIds: string[] },
): Promise<{
    success: true;
    data: EventStudentsAssignResponse;
}> {
    const data = await eventDataRequest<EventStudentsAssignResponse>(
        event,
        upstreamBase,
        {
            path: `/events/${encodeURIComponent(eventId)}/students`,
            method: 'POST',
            body,
            fallbackError: 'Nie udało się przypisać kursantów do wydarzenia',
        },
    );

    if (
        !data ||
        typeof data !== 'object' ||
        typeof data.assigned !== 'number' ||
        typeof data.skipped !== 'number'
    ) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: {
            assigned: data.assigned,
            skipped: data.skipped,
        },
    };
}

export async function bffEventStudentDeleteOne(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
    studentUserId: string,
): Promise<{
    success: true;
    data: EventStudentsReplaceResponse;
}> {
    const data = await eventDataRequest<{ studentUserIds?: unknown }>(
        event,
        upstreamBase,
        {
            path: `/events/${encodeURIComponent(eventId)}/students/${encodeURIComponent(studentUserId)}`,
            method: 'DELETE',
            fallbackError: 'Nie udało się usunąć kursanta z wydarzenia',
        },
    );

    return {
        success: true,
        data: {
            studentUserIds: normalizeStudentUserIds(data?.studentUserIds),
        },
    };
}
