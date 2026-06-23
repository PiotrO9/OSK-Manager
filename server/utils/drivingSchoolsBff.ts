import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstreamRequest';

function statusCodeFromError(err: unknown): number | undefined {
    if (err && typeof err === 'object' && 'statusCode' in err) {
        const code = (err as { statusCode?: unknown }).statusCode;

        return typeof code === 'number' ? code : undefined;
    }

    return undefined;
}

export async function bffUpstreamDrivingSchoolsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/driving-schools',
        fallbackError: 'Nie udało się pobrać listy OSK',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamDrivingSchoolsDefault(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown | null }> {
    try {
        const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
            path: '/driving-schools/default',
            fallbackError: 'Nie udało się pobrać domyślnego OSK',
        });

        return {
            success: true,
            data: data ?? null,
        };
    } catch (err: unknown) {
        if (statusCodeFromError(err) === 404) {
            return { success: true, data: null };
        }

        throw err;
    }
}

export async function bffUpstreamDrivingSchoolsCreate(
    event: H3Event,
    upstreamBase: string,
    body: { name: string; city?: string; address?: string },
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/driving-schools',
        method: 'POST',
        body,
        fallbackError: 'Nie udało się utworzyć OSK',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamDrivingSchoolsDelete(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true }> {
    await upstreamRequest(event, upstreamBase, {
        path: `/driving-schools/${encodeURIComponent(id)}`,
        method: 'DELETE',
        fallbackError: 'Nie udało się usunąć OSK',
        allowEmptySuccess: true,
    });

    return { success: true };
}

export async function bffUpstreamDrivingSchoolsUpdate(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: { name: string; city?: string | null; address?: string | null },
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/driving-schools/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się zaktualizować OSK',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamDrivingSchoolsSetDefault(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true; data?: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/driving-schools/${encodeURIComponent(id)}/set-default`,
        method: 'PATCH',
        fallbackError: 'Nie udało się ustawić domyślnego OSK',
        allowEmptySuccess: true,
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamDrivingSchoolsSetDefaultVehicle(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
    vehicleId: string,
): Promise<{ success: true; data?: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/driving-schools/${encodeURIComponent(schoolId)}/default-vehicle`,
        method: 'PATCH',
        body: { vehicleId },
        fallbackError: 'Nie udało się ustawić domyślnego pojazdu',
        allowEmptySuccess: true,
    });

    return {
        success: true,
        data,
    };
}
