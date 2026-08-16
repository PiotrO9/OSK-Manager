import { randomUUID } from 'node:crypto';
import {
    mockCoursesGetById,
    mockInstructorQualifiedForCategory,
} from '~~/server/utils/courses/mockCoursesList';
import type { BffLessonCreateBody } from './parseLessonCreateBody';

export function bffMockLessonsPost(body: BffLessonCreateBody): {
    success: true;
    data: unknown;
} {
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

    const now = new Date().toISOString();

    return {
        success: true,
        data: {
            lesson: {
                id: randomUUID(),
                courseId: body.courseId,
                studentId: randomUUID(),
                instructorId: body.instructorId,
                vehicleId: body.vehicleId,
                lessonType: body.lessonType,
                startTime: body.startTime,
                endTime: body.endTime,
                status: 'SCHEDULED',
                createdAt: now,
            },
        },
    };
}
