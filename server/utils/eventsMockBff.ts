import { randomUUID } from 'node:crypto';
import {
    mockCoursesGetById,
    mockInstructorQualifiedForCategory,
} from './mockCoursesList';

interface MockEventPostBody {
    instructorId: string;
    type: 'DRIVE' | 'THEORY';
    startTime: string;
    endTime: string;
    vehicleId?: string;
    capacity?: number;
    courseId?: string;
}

export function bffMockEventsPost(body: MockEventPostBody): {
    success: true;
    data: unknown;
} {
    if (body.type === 'THEORY' && body.courseId) {
        const course = mockCoursesGetById(body.courseId);

        if (
            course &&
            !mockInstructorQualifiedForCategory(
                course.schoolId,
                body.instructorId,
                course.category,
            )
        ) {
            throw createError({
                statusCode: 400,
                message: 'Instructor is not qualified for this course category',
            });
        }
    }

    const now = new Date().toISOString();

    return {
        success: true,
        data: {
            event: {
                id: randomUUID(),
                instructorId: body.instructorId,
                type: body.type,
                startTime: body.startTime,
                endTime: body.endTime,
                vehicleId:
                    body.type === 'DRIVE' ? (body.vehicleId ?? null) : null,
                capacity: body.capacity ?? null,
                courseId:
                    body.type === 'THEORY' ? (body.courseId ?? null) : null,
                status: 'SCHEDULED',
                createdAt: now,
                students: [],
            },
        },
    };
}
