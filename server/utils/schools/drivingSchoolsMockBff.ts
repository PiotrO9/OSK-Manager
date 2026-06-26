import {
    mockDrivingSchoolsDelete,
    mockDrivingSchoolsGetDefault,
    mockDrivingSchoolsList,
    mockDrivingSchoolsPush,
    mockDrivingSchoolsSetDefault,
    mockDrivingSchoolsUpdate,
} from '~~/server/utils/schools/mockDrivingSchoolsStore';
import {
    mockVehiclesGetById,
    mockVehiclesResponseFromRow,
    mockVehiclesSetDefaultForSchool,
} from '~~/server/utils/vehicles/mockVehiclesStore';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

export function bffMockDrivingSchoolsList(): {
    success: true;
    data: unknown;
} {
    return dataSuccess(mockDrivingSchoolsList());
}

export function bffMockDrivingSchoolsDefault(): {
    success: true;
    data: unknown;
} {
    return dataSuccess(mockDrivingSchoolsGetDefault());
}

export function bffMockDrivingSchoolsCreate(body: {
    name: string;
    city?: string | null;
    address?: string | null;
}): { success: true; data: unknown } {
    return dataSuccess(
        mockDrivingSchoolsPush({
            name: body.name,
            city: body.city ?? null,
            address: body.address ?? null,
        }),
    );
}

export function bffMockDrivingSchoolsUpdate(
    id: string,
    body: { name: string; city?: string | null; address?: string | null },
): { success: true; data: unknown } {
    const updated = mockDrivingSchoolsUpdate(id, body);

    if (!updated) {
        throw createError({ statusCode: 404, message: 'SzkoĹ‚a nie istnieje' });
    }

    const row = mockDrivingSchoolsList().find((school) => school.id === id);

    return dataSuccess(row ?? { ...updated, isDefault: false });
}

export function bffMockDrivingSchoolsDelete(id: string): { success: true } {
    const deleted = mockDrivingSchoolsDelete(id);

    if (!deleted) {
        throw createError({ statusCode: 404, message: 'SzkoĹ‚a nie istnieje' });
    }

    return { success: true };
}

export function bffMockDrivingSchoolsSetDefault(id: string): {
    success: true;
    data: unknown;
} {
    const ok = mockDrivingSchoolsSetDefault(id);

    if (!ok) {
        throw createError({ statusCode: 404, message: 'SzkoĹ‚a nie istnieje' });
    }

    const row = mockDrivingSchoolsList().find((school) => school.id === id);

    return dataSuccess(row ?? null);
}

export function bffMockDrivingSchoolsSetDefaultVehicle(
    schoolId: string,
    vehicleId: string,
): { success: true; data: unknown } {
    const ok = mockVehiclesSetDefaultForSchool(schoolId, vehicleId);

    if (!ok) {
        throw createError({
            statusCode: 404,
            message:
                'SzkoĹ‚a lub pojazd nie istnieje, albo pojazd nie naleĹĽy do tej szkoĹ‚y.',
        });
    }

    const row = mockVehiclesGetById(vehicleId);

    return dataSuccess(row ? mockVehiclesResponseFromRow(row) : null);
}
