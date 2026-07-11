import { randomUUID } from 'node:crypto';
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

interface MockPayment {
    id: string;
    courseId: string;
    courseName: string;
    paymentPlanId: string;
    amount: string;
    currency: string;
    status: 'PAID' | 'UNPAID';
    date: string | null;
    dueDate: string | null;
    paidAt: string | null;
    method: string | null;
}

const mockStudentPayments: MockPayment[] = [
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
        method: 'transfer',
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
        method: null,
    },
];

function toIsoDate(date: string | null): string | null {
    return date ? `${date}T00:00:00.000Z` : null;
}

function mockStudentPaymentsPayload() {
    const today = new Date();
    const todayStart = new Date(
        Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
        ),
    );
    let paidAmount = 0;
    let unpaidAmount = 0;
    let overdueAmount = 0;
    let overdueCount = 0;
    let nextDueDate: string | null = null;
    let nextDueTime = Number.POSITIVE_INFINITY;

    for (const payment of mockStudentPayments) {
        const amount = Number(payment.amount);

        if (!Number.isFinite(amount)) {
            continue;
        }

        if (payment.status === 'PAID') {
            paidAmount += amount;
            continue;
        }

        unpaidAmount += amount;

        if (!payment.dueDate) {
            continue;
        }

        const dueDate = new Date(payment.dueDate);

        if (dueDate < todayStart) {
            overdueAmount += amount;
            overdueCount += 1;
        } else if (dueDate.getTime() < nextDueTime) {
            nextDueTime = dueDate.getTime();
            nextDueDate = payment.dueDate;
        }
    }

    return {
        payments: [...mockStudentPayments],
        summary: {
            paidAmount: paidAmount.toFixed(2),
            unpaidAmount: unpaidAmount.toFixed(2),
            overdueAmount: overdueAmount.toFixed(2),
            overdueCount,
            nextDueDate,
            currency: mockStudentPayments[0]?.currency ?? 'PLN',
        },
    };
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
            message: `Notatka nie może przekraczać ${notesMaxLen} znaków.`,
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
    return dataSuccess(mockStudentPaymentsPayload());
}

export function bffMockCreateStudentPayment(body: {
    paymentPlanId: string;
    amount: string;
    dueDate: string | null;
    method: string | null;
}): { success: true; data: unknown } {
    const existingPlan = mockStudentPayments.find(
        (payment) => payment.paymentPlanId === body.paymentPlanId,
    );

    if (!existingPlan) {
        throw createError({
            statusCode: 404,
            message: 'Payment plan not found',
        });
    }

    const dueDate = toIsoDate(body.dueDate);

    mockStudentPayments.unshift({
        id: randomUUID(),
        courseId: existingPlan.courseId,
        courseName: existingPlan.courseName,
        paymentPlanId: body.paymentPlanId,
        amount: body.amount,
        currency: existingPlan.currency,
        status: 'UNPAID',
        date: dueDate ?? new Date().toISOString(),
        dueDate,
        paidAt: null,
        method: body.method,
    });

    return dataSuccess(mockStudentPaymentsPayload());
}

export function bffMockUpdateStudentPayment(
    paymentId: string,
    body: { dueDate?: string | null; method?: string | null },
): { success: true; data: unknown } {
    const payment = mockStudentPayments.find((item) => item.id === paymentId);

    if (!payment) {
        throw createError({
            statusCode: 404,
            message: 'Payment not found',
        });
    }

    if ('dueDate' in body) {
        payment.dueDate = toIsoDate(body.dueDate ?? null);

        if (payment.status === 'UNPAID') {
            payment.date = payment.dueDate;
        }
    }

    if ('method' in body) {
        payment.method = body.method ?? null;
    }

    return dataSuccess(mockStudentPaymentsPayload());
}

export function bffMockMarkStudentPaymentPaid(paymentId: string): {
    success: true;
    data: unknown;
} {
    const payment = mockStudentPayments.find((item) => item.id === paymentId);

    if (!payment) {
        throw createError({
            statusCode: 404,
            message: 'Payment not found',
        });
    }

    payment.status = 'PAID';
    payment.paidAt = new Date().toISOString();
    payment.date = payment.paidAt;

    return dataSuccess(mockStudentPaymentsPayload());
}

export function bffMockMarkStudentPaymentUnpaid(paymentId: string): {
    success: true;
    data: unknown;
} {
    const payment = mockStudentPayments.find((item) => item.id === paymentId);

    if (!payment) {
        throw createError({
            statusCode: 404,
            message: 'Payment not found',
        });
    }

    payment.status = 'UNPAID';
    payment.paidAt = null;
    payment.date = payment.dueDate;

    return dataSuccess(mockStudentPaymentsPayload());
}
