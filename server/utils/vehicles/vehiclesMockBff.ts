import { mockCoursesGetById } from '../courses/mockCoursesList';
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
} from '~~/server/utils/vehicles/mockVehiclesStore';
import type {
    BffVehiclePatchBody,
    BffVehicleStatusBody,
    BffVehicleWriteBody,
} from './vehiclesBff';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

export function bffMockVehiclesList(
    schoolId: string,
    courseId?: string,
): {
    success: true;
    data: unknown;
} {
    const vehicles = mockVehiclesListForSchool(schoolId) as {
        status: string;
        supportedCourseTypes: { id: string }[];
    }[];

    if (!courseId) return dataSuccess(vehicles);

    const course = mockCoursesGetById(courseId);

    if (!course || course.schoolId !== schoolId)
        throw createError({
            statusCode: 404,
            message: 'Kurs nie istnieje w tej szkole.',
        });

    return dataSuccess(
        vehicles.filter(
            (vehicle) =>
                vehicle.status === 'ACTIVE' &&
                vehicle.supportedCourseTypes.some(
                    (type) => type.id === course.courseType?.id,
                ),
        ),
    );
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
    body: BffVehicleStatusBody,
): { success: true; data: unknown } {
    const existing = mockVehiclesGetById(id);

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    const updated = mockVehiclesUpdateStatus(id, body);

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

    const updated = mockVehiclesSetPhotoUrl(id, demoPhotoUrl);

    return dataSuccess({
        photoUrl: demoPhotoUrl,
        updatedAt: updated?.updatedAt ?? null,
    });
}
