import {
    mockInstructorsDeleteById,
    mockInstructorsGetById,
    mockInstructorsListPayload,
    mockInstructorsPatchById,
} from './mockInstructorsList';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

export function bffMockInstructorsList(schoolId: string): {
    success: true;
    data: unknown;
} {
    return dataSuccess(mockInstructorsListPayload(schoolId));
}

export function bffMockInstructorsGetById(id: string): {
    success: true;
    data: unknown;
} {
    const detail = mockInstructorsGetById(id);

    if (!detail) {
        throw createError({
            statusCode: 404,
            message: 'Instruktor nie istnieje.',
        });
    }

    return dataSuccess(detail);
}

export function bffMockInstructorsPatch(
    id: string,
    patch: Record<string, unknown>,
): { success: true; data: unknown } {
    const updated = mockInstructorsPatchById(id, patch);

    if (!updated) {
        throw createError({
            statusCode: 404,
            message: 'Instruktor nie istnieje.',
        });
    }

    return dataSuccess(updated);
}

export function bffMockInstructorsDelete(id: string): { success: true } {
    const deleted = mockInstructorsDeleteById(id);

    if (!deleted) {
        throw createError({
            statusCode: 404,
            message: 'Instruktor nie istnieje.',
        });
    }

    return { success: true };
}
