import { mockCoursesGetById } from '~~/server/utils/courses/mockCoursesList';
import {
    mockCourseParticipantAssign,
    mockStudentDetailPayload,
    mockStudentProcessStatusPayload,
    mockStudentsListPayload,
    mockUpdateStudentNotes,
} from './mockStudentsList';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

export function bffMockStudentsList(params: {
    schoolId: string;
    page: number;
    limit: number;
    courseId?: string;
}): { success: true; data: unknown } {
    if (params.courseId !== undefined) {
        const course = mockCoursesGetById(params.courseId);

        if (!course || course.schoolId !== params.schoolId) {
            throw createError({
                statusCode: 404,
                message: 'Course not found',
            });
        }
    }

    return dataSuccess(
        mockStudentsListPayload(
            params.schoolId,
            params.page,
            params.limit,
            params.courseId,
        ),
    );
}

export function bffMockStudentDetail(
    studentUserId: string,
    schoolId: string,
): { success: true; data: unknown } {
    const detail = mockStudentDetailPayload(studentUserId, schoolId);

    if (!detail) {
        throw createError({
            statusCode: 404,
            message: 'Student not found',
        });
    }

    return dataSuccess(detail);
}

export function bffMockStudentProcessStatus(
    studentUserId: string,
    schoolId: string,
): { success: true; data: unknown } {
    const status = mockStudentProcessStatusPayload(studentUserId, schoolId);

    if (!status) {
        throw createError({
            statusCode: 404,
            message: 'Student not found',
        });
    }

    return dataSuccess(status);
}

export function bffMockUpdateStudentNotes(
    studentUserId: string,
    notes: string | null,
    notesMaxLen: number,
): { success: true; data: unknown } {
    const updated = mockUpdateStudentNotes(studentUserId, notes);

    if (!updated.ok) {
        if (updated.code === 'NOT_FOUND') {
            throw createError({
                statusCode: 404,
                message: 'Nie znaleziono kursanta.',
            });
        }

        throw createError({
            statusCode: 400,
            message: `Notatka nie moĹĽe przekraczaÄ‡ ${notesMaxLen} znakĂłw.`,
        });
    }

    return dataSuccess({
        userId: updated.userId,
        notes: updated.notes,
    });
}

export function bffMockStudentAssignToCourse(
    studentUserId: string,
    courseId: string,
): { success: true; data: unknown } {
    const result = mockCourseParticipantAssign({
        studentUserId,
        courseId,
    });

    if (!result.ok) {
        if (result.code === 'COURSE_NOT_FOUND') {
            throw createError({
                statusCode: 404,
                message: 'Course not found',
            });
        }

        if (result.code === 'STUDENT_NOT_IN_SCHOOL') {
            throw createError({
                statusCode: 403,
                message: 'Forbidden',
            });
        }

        throw createError({
            statusCode: 409,
            message: 'Student is already enrolled in this course',
        });
    }

    return dataSuccess({ participant: result.participant });
}

export function bffMockStudentPaymentsList(): {
    success: true;
    data: unknown;
} {
    return dataSuccess({
        payments: [
            {
                id: '11111111-1111-4111-8111-111111111111',
                courseId: '22222222-2222-4222-8222-222222222222',
                courseName: 'Kurs podstawowy kategorii B',
                paymentPlanId: '33333333-3333-4333-8333-333333333333',
                amount: '1200.00',
                currency: 'PLN',
                status: 'PAID',
                date: '2026-06-20T12:00:00.000Z',
                dueDate: '2026-06-10T00:00:00.000Z',
                paidAt: '2026-06-20T12:00:00.000Z',
            },
            {
                id: '44444444-4444-4444-8444-444444444444',
                courseId: '22222222-2222-4222-8222-222222222222',
                courseName: 'Kurs podstawowy kategorii B',
                paymentPlanId: '33333333-3333-4333-8333-333333333333',
                amount: '500.00',
                currency: 'PLN',
                status: 'UNPAID',
                date: '2026-07-10T00:00:00.000Z',
                dueDate: '2026-07-10T00:00:00.000Z',
                paidAt: null,
            },
        ],
    });
}
