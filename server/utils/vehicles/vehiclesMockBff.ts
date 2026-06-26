import {
    mockVehicleRowToDetailPayload,
    mockVehiclesCreate,
    mockVehiclesDelete,
    mockVehiclesFindDuplicateRegistration,
    mockVehiclesGetById,
    mockVehiclesListForSchool,
    mockVehiclesResponseFromRow,
    mockVehiclesSetPhotoUrl,
    mockVehiclesUpdate,
    mockVehiclesUpdateStatus,
    type MockVehicleStatus,
} from '~~/server/utils/vehicles/mockVehiclesStore';
import type { BffVehiclePatchBody, BffVehicleWriteBody } from './vehiclesBff';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

export function bffMockVehiclesList(schoolId: string): {
    success: true;
    data: unknown;
} {
    return dataSuccess(mockVehiclesListForSchool(schoolId));
}

export function bffMockVehiclesGetById(id: string): {
    success: true;
    data: unknown;
} {
    const row = mockVehiclesGetById(id);

    if (!row) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return dataSuccess(mockVehicleRowToDetailPayload(row));
}

export function bffMockVehiclesCreate(body: BffVehicleWriteBody): {
    success: true;
    data: unknown;
} {
    if (
        mockVehiclesFindDuplicateRegistration(
            body.schoolId,
            body.registrationNumber,
        )
    ) {
        throw createError({
            statusCode: 409,
            message:
                'Pojazd z tym numerem rejestracyjnym jest już zapisany dla tej szkoły.',
        });
    }

    const created = mockVehiclesCreate(body);

    return dataSuccess(mockVehiclesResponseFromRow(created));
}

export function bffMockVehiclesUpdate(
    id: string,
    body: BffVehiclePatchBody,
): { success: true; data: unknown } {
    const existing = mockVehiclesGetById(id);

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    if (
        mockVehiclesFindDuplicateRegistration(
            existing.schoolId,
            body.registrationNumber,
            id,
        )
    ) {
        throw createError({
            statusCode: 409,
            message:
                'Pojazd z tym numerem rejestracyjnym jest już zapisany dla tej szkoły.',
        });
    }

    const updated = mockVehiclesUpdate(id, body);

    if (!updated) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return dataSuccess(mockVehiclesResponseFromRow(updated));
}

export function bffMockVehiclesUpdateStatus(
    id: string,
    status: MockVehicleStatus,
): { success: true; data: unknown } {
    const existing = mockVehiclesGetById(id);

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    const updated = mockVehiclesUpdateStatus(id, status);

    if (!updated) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return dataSuccess(mockVehiclesResponseFromRow(updated));
}

export function bffMockVehiclesDelete(id: string): { success: true } {
    const deleted = mockVehiclesDelete(id);

    if (!deleted) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return { success: true };
}

export function bffMockVehiclesUploadPhoto(id: string): {
    success: true;
    data: unknown;
} {
    const row = mockVehiclesGetById(id);

    if (!row) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    const demoPhotoUrl = 'https://placehold.co/600x400/png?text=Demo+pojazd';

    mockVehiclesSetPhotoUrl(id, demoPhotoUrl);

    return dataSuccess({ photoUrl: demoPhotoUrl });
}
