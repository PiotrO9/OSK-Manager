import {
    mockLessonRatingsListPayload,
    mockOwnLessonRatingsPayload,
} from './lessonRatingsBff';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

export function bffMockLessonRatingsList(params: {
    schoolId: string;
    instructorId?: string;
}): { success: true; data: unknown } {
    return dataSuccess(
        mockLessonRatingsListPayload(params.schoolId, params.instructorId),
    );
}

export function bffMockOwnLessonRatingsList(): {
    success: true;
    data: unknown;
} {
    return dataSuccess(mockOwnLessonRatingsPayload());
}
