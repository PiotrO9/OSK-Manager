import type { H3Event } from 'h3';
import type { MockWeeklyEntry } from './mockAvailabilityStore';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export type WeeklyEntryResponse = MockWeeklyEntry;

export type SlotsEntryResponse = {
    date: string;
    startTime: string;
    endTime: string;
};

export async function bffSlotsGet(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
    dateFrom: string,
    dateTo: string,
): Promise<{ success: true; data: { slots: SlotsEntryResponse[] } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const query = new URLSearchParams({
        dateFrom,
        dateTo,
    });

    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(instructorId)}/availability/slots?${query.toString()}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const json = (await res.json()) as BackendEnvelope<{
        slots: SlotsEntryResponse[];
    }>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać slotów',
        });
    }

    return {
        success: true,
        data: json.data ?? { slots: [] },
    };
}

export async function bffWeeklyGet(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
): Promise<{ success: true; data: { weekly: WeeklyEntryResponse[] } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(instructorId)}/availability/weekly`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const json = (await res.json()) as BackendEnvelope<{
        weekly: WeeklyEntryResponse[];
    }>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać dostępności',
        });
    }

    return {
        success: true,
        data: json.data ?? { weekly: [] },
    };
}

export async function bffWeeklyPut(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
    dayOfWeek: number,
    body: { startTime: string; endTime: string },
): Promise<{ success: true; data: { entry: WeeklyEntryResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(instructorId)}/availability/weekly/${dayOfWeek}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify(body),
        },
    );

    const json = (await res.json()) as BackendEnvelope<{
        entry: WeeklyEntryResponse;
    }>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zapisać dnia',
        });
    }

    if (!json.data?.entry) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffWeeklyDelete(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
    dayOfWeek: number,
): Promise<{ success: true }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(instructorId)}/availability/weekly/${dayOfWeek}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${access}`,
            },
        },
    );

    if (res.status === 204 || res.status === 404) {
        return { success: true };
    }

    const text = await res.text();
    let json: BackendEnvelope<unknown> | null = null;

    if (text.trim().length > 0) {
        try {
            json = JSON.parse(text) as BackendEnvelope<unknown>;
        } catch {
            json = null;
        }
    }

    if (!res.ok) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                json !== null && typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się usunąć dnia',
        });
    }

    return { success: true };
}
