import { createError, getQuery, type H3Event } from 'h3';
import {
    upstreamRequest,
    type UpstreamRequestOptions,
} from '~~/server/utils/upstream/upstreamRequest';
import type { BffEventPatchBody } from './parseEventPatchBody';

const EVENT_HTML_ERROR =
    'Serwer zwrócił odpowiedź HTML lub pustą zamiast JSON — sprawdź upstream API.';
const EVENT_NOT_FOUND_HTML =
    'Nie znaleziono zasobu lub brak endpointu GET/PATCH /events/:id na serwerze (odpowiedź HTML zamiast JSON).';
const INVALID_JSON = 'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).';

export interface InstructorEventResponse {
    id: string;
    instructorId: string;
    type: string;
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    capacity?: number | null;
    courseId?: string | null;
    status?: string;
    createdAt: string;
}

export interface EventStudentsReplaceResponse {
    studentUserIds: string[];
}

export interface EventStudentsAssignResponse {
    assigned: number;
    skipped: number;
}

function assertEventPayload(
    data: { event?: InstructorEventResponse } | undefined,
): InstructorEventResponse {
    const ev = data?.event;

    if (!ev || typeof ev !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return ev;
}

function normalizeStudentUserIds(raw: unknown): string[] {
    const out: string[] = [];

    if (!Array.isArray(raw)) return out;

    for (const item of raw) {
        if (typeof item === 'string' && item.trim()) {
            out.push(item.trim());
        }
    }

    return out;
}

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

async function eventDataRequest<T>(
    event: H3Event,
    upstreamBase: string,
    options: UpstreamRequestOptions,
): Promise<T | undefined> {
    const { data } = await upstreamRequest<T>(event, upstreamBase, {
        invalidJsonError: INVALID_JSON,
        htmlError: EVENT_HTML_ERROR,
        ...options,
    });

    return data;
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

export async function bffEventStudentsGet(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
): Promise<{ success: true; data: unknown }> {
    const data = await eventDataRequest<unknown>(event, upstreamBase, {
        path: `/events/${encodeURIComponent(eventId)}/students`,
        method: 'GET',
        fallbackError: 'Nie udało się pobrać kursantów wydarzenia',
    });

    return { success: true, data };
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
