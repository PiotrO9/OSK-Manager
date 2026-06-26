import { randomUUID } from 'node:crypto';
import {
    mockCoursesGetById,
    mockInstructorQualifiedForCategory,
} from './mockCoursesList';

export function bffMockLessonsPost(body: Record<string, unknown>): {
    success: true;
    data: unknown;
} {
    const course = mockCoursesGetById(String(body.courseId));

    if (
        course &&
        !mockInstructorQualifiedForCategory(
            course.schoolId,
            String(body.instructorId),
            course.category,
        )
    ) {
        throw createError({
            statusCode: 400,
            message: 'Instructor is not qualified for this course category',
        });
    }

    const now = new Date().toISOString();

    return {
        success: true,
        data: {
            lesson: {
                id: randomUUID(),
                courseId: String(body.courseId),
                studentId: randomUUID(),
                instructorId: String(body.instructorId),
                vehicleId: String(body.vehicleId ?? ''),
                lessonType: String(body.lessonType),
                startTime: String(body.startTime),
                endTime: String(body.endTime),
                status: 'SCHEDULED',
                createdAt: now,
            },
        },
    };
}
