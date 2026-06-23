import type { H3Event } from 'h3';
import type { MockWeeklyEntry } from './mockAvailabilityStore';
import { upstreamRequest } from '~~/server/utils/upstreamRequest';

export type WeeklyEntryResponse = MockWeeklyEntry;

export interface SlotsEntryResponse {
    date: string;
    startTime: string;
    endTime: string;
}

export interface SchoolSlotsEntryResponse {
    instructorId: string;
    instructorFirstName: string;
    instructorLastName: string;
    date: string;
    startTime: string;
    endTime: string;
}

function statusCodeFromError(err: unknown): number | undefined {
    if (err && typeof err === 'object' && 'statusCode' in err) {
        const code = (err as { statusCode?: unknown }).statusCode;

        return typeof code === 'number' ? code : undefined;
    }

    return undefined;
}

export async function bffSchoolSlotsGet(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
    queryString: string,
): Promise<{
    success: true;
    data: { slots: SchoolSlotsEntryResponse[]; total?: number };
}> {
    const suffix = queryString.trim();
    const { data } = await upstreamRequest<{
        slots?: SchoolSlotsEntryResponse[];
        total?: number;
    }>(event, upstreamBase, {
        path: `/driving-schools/${encodeURIComponent(schoolId)}/availability/slots${suffix ? `?${suffix}` : ''}`,
        fallbackError: 'Nie udało się pobrać slotów szkoły',
    });
    const slots = Array.isArray(data?.slots) ? data.slots : [];

    return {
        success: true,
        data: {
            slots,
            total: typeof data?.total === 'number' ? data.total : slots.length,
        },
    };
}

export async function bffSlotsGet(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
    dateFrom: string,
    dateTo: string,
): Promise<{ success: true; data: { slots: SlotsEntryResponse[] } }> {
    const { data } = await upstreamRequest<{ slots?: SlotsEntryResponse[] }>(
        event,
        upstreamBase,
        {
            path: `/instructors/${encodeURIComponent(instructorId)}/availability/slots`,
            query: { dateFrom, dateTo },
            fallbackError: 'Nie udało się pobrać slotów',
        },
    );

    return {
        success: true,
        data: { slots: Array.isArray(data?.slots) ? data.slots : [] },
    };
}

export async function bffWeeklyGet(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
): Promise<{ success: true; data: { weekly: WeeklyEntryResponse[] } }> {
    const { data } = await upstreamRequest<{ weekly?: WeeklyEntryResponse[] }>(
        event,
        upstreamBase,
        {
            path: `/instructors/${encodeURIComponent(instructorId)}/availability/weekly`,
            fallbackError: 'Nie udało się pobrać dostępności',
        },
    );

    return {
        success: true,
        data: { weekly: Array.isArray(data?.weekly) ? data.weekly : [] },
    };
}

export async function bffWeeklyPut(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
    dayOfWeek: number,
    body: { startTime: string; endTime: string },
): Promise<{ success: true; data: { entry: WeeklyEntryResponse } }> {
    const { data } = await upstreamRequest<{ entry?: WeeklyEntryResponse }>(
        event,
        upstreamBase,
        {
            path: `/instructors/${encodeURIComponent(instructorId)}/availability/weekly/${dayOfWeek}`,
            method: 'PUT',
            body,
            fallbackError: 'Nie udało się zapisać dnia',
        },
    );

    if (!data?.entry) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { entry: data.entry },
    };
}

export async function bffWeeklyDelete(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
    dayOfWeek: number,
): Promise<{ success: true }> {
    try {
        await upstreamRequest(event, upstreamBase, {
            path: `/instructors/${encodeURIComponent(instructorId)}/availability/weekly/${dayOfWeek}`,
            method: 'DELETE',
            fallbackError: 'Nie udało się usunąć dnia',
            allowEmptySuccess: true,
        });
    } catch (err: unknown) {
        if (statusCodeFromError(err) !== 404) {
            throw err;
        }
    }

    return { success: true };
}
