export type StudentPaymentStatus = 'PAID' | 'UNPAID';

export interface StudentPaymentItem {
    id: string;
    courseId: string;
    courseName: string;
    paymentPlanId: string;
    amount: string;
    currency: string;
    status: StudentPaymentStatus;
    date: string | null;
    dueDate: string | null;
    paidAt: string | null;
}

const PAYMENT_STATUS_LABELS: Record<StudentPaymentStatus, string> = {
    PAID: 'Opłacona',
    UNPAID: 'Nieopłacona',
};

export function formatPaymentStatusLabel(status: StudentPaymentStatus): string {
    return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function getPaymentStatusVariant(
    status: StudentPaymentStatus,
): 'default' | 'secondary' {
    return status === 'PAID' ? 'default' : 'secondary';
}

function isPaymentStatus(value: string): value is StudentPaymentStatus {
    return value === 'PAID' || value === 'UNPAID';
}

function readString(o: Record<string, unknown>, key: string): string {
    const raw = o[key];

    return raw == null ? '' : String(raw).trim();
}

function readOptionalString(
    o: Record<string, unknown>,
    key: string,
): string | null {
    const value = readString(o, key);

    return value.length > 0 ? value : null;
}

function normalizePaymentItem(raw: unknown): StudentPaymentItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = readString(o, 'id');
    const courseId = readString(o, 'courseId');
    const courseName = readString(o, 'courseName');
    const paymentPlanId = readString(o, 'paymentPlanId');
    const amount = readString(o, 'amount');
    const currency = readString(o, 'currency') || 'PLN';
    const statusRaw = readString(o, 'status');

    if (
        !id ||
        !courseId ||
        !courseName ||
        !paymentPlanId ||
        !amount ||
        !isPaymentStatus(statusRaw)
    ) {
        return null;
    }

    return {
        id,
        courseId,
        courseName,
        paymentPlanId,
        amount,
        currency,
        status: statusRaw,
        date: readOptionalString(o, 'date'),
        dueDate: readOptionalString(o, 'dueDate'),
        paidAt: readOptionalString(o, 'paidAt'),
    };
}

export function normalizeStudentPayments(data: unknown): StudentPaymentItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizePaymentItem(item))
            .filter((x): x is StudentPaymentItem => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['payments', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeStudentPayments(nested);
        }
    }

    return [];
}
