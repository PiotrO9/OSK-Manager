import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export interface BffVehicleWriteBody {
    schoolId: string;
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
    modelYear: number | null;
    mileageKm: number | null;
}

export interface BffVehiclePatchBody {
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
    modelYear: number | null;
    mileageKm: number | null;
}

export interface BffVehicleStatusBody {
    status: 'ACTIVE' | 'UNAVAILABLE';
    unavailableUntil?: string | null;
}

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return {
        success: true,
        data,
    };
}

export async function bffUpstreamVehiclesList(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
    timeFilter?: { startTime: string; endTime: string },
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/vehicles',
        method: 'GET',
        query: {
            schoolId,
            startTime: timeFilter?.startTime,
            endTime: timeFilter?.endTime,
        },
        fallbackError: 'Nie udało się pobrać listy pojazdów',
    });

    return dataSuccess(data);
}

export async function bffUpstreamVehiclesGetById(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/vehicles/${encodeURIComponent(id)}`,
        method: 'GET',
        fallbackError: 'Nie udało się pobrać pojazdu',
    });

    return dataSuccess(data);
}

export async function bffUpstreamVehiclesCreate(
    event: H3Event,
    upstreamBase: string,
    body: BffVehicleWriteBody,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/vehicles',
        method: 'POST',
        body,
        fallbackError: 'Nie udało się utworzyć pojazdu',
    });

    return dataSuccess(data);
}

export async function bffUpstreamVehiclesUpdate(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: BffVehiclePatchBody,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/vehicles/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się zaktualizować pojazdu',
    });

    return dataSuccess(data);
}

export async function bffUpstreamVehiclesUpdateStatus(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: BffVehicleStatusBody,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/vehicles/${encodeURIComponent(id)}/status`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się zmienić statusu pojazdu',
    });

    return dataSuccess(data);
}

export async function bffUpstreamVehiclesDelete(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true }> {
    await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/vehicles/${encodeURIComponent(id)}`,
        method: 'DELETE',
        fallbackError: 'Nie udało się usunąć pojazdu',
        allowEmptySuccess: true,
    });

    return { success: true };
}

export async function bffUpstreamVehiclesUploadPhoto(
    event: H3Event,
    upstreamBase: string,
    id: string,
    file: Blob,
    filename: string,
): Promise<{ success: true; data: unknown }> {
    const form = new FormData();

    form.append('file', file, filename);

    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/vehicles/${encodeURIComponent(id)}/photo`,
        method: 'POST',
        body: form,
        fallbackError: 'Nie udało się przesłać zdjęcia',
    });

    return dataSuccess(data);
}
