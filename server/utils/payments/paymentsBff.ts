import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export interface MyPaymentResponse {
    id: string;
    courseId: string;
    courseName: string;
    paymentPlanId: string;
    amount: string;
    currency: string;
    status: string;
    date: string | null;
    dueDate: string | null;
    paidAt: string | null;
}

export interface MyPaymentsPayload {
    payments: MyPaymentResponse[];
}

export async function bffUpstreamMyPaymentsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: MyPaymentsPayload }> {
    const { data } = await upstreamRequest<MyPaymentsPayload>(
        event,
        upstreamBase,
        {
            path: '/me/payments',
            method: 'GET',
            fallbackError: 'Nie udało się pobrać listy opłat użytkownika',
        },
    );

    return {
        success: true,
        data: {
            payments: Array.isArray(data?.payments) ? data.payments : [],
        },
    };
}

export async function bffUpstreamStudentPaymentsList(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/payments`,
        method: 'GET',
        query: { schoolId: schoolId.trim() },
        fallbackError: 'Nie udało się pobrać listy opłat kursanta',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamCreateStudentPayment(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/payments`,
        method: 'POST',
        body,
        fallbackError: 'Nie udało się dodać płatności kursanta',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamUpdateStudentPayment(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    paymentId: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/payments/${encodeURIComponent(paymentId)}`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się zapisać płatności kursanta',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamMarkStudentPaymentPaid(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    paymentId: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/payments/${encodeURIComponent(paymentId)}/mark-paid`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się oznaczyć płatności jako opłaconej',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamMarkStudentPaymentUnpaid(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    paymentId: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/payments/${encodeURIComponent(paymentId)}/mark-unpaid`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się oznaczyć płatności jako nieopłaconej',
    });

    return {
        success: true,
        data,
    };
}
