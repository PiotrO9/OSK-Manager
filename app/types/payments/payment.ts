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
    method: string | null;
}

export interface StudentPaymentsSummary {
    paidAmount: string;
    unpaidAmount: string;
    overdueAmount: string;
    overdueCount: number;
    nextDueDate: string | null;
    currency: string;
}

export interface StudentPaymentsPayload {
    payments: StudentPaymentItem[];
    summary: StudentPaymentsSummary;
}

export interface CreateStudentPaymentPayload {
    paymentPlanId: string;
    amount: string;
    dueDate: string | null;
    method: string | null;
}

export interface UpdateStudentPaymentPayload {
    dueDate?: string | null;
    method?: string | null;
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
        method: readOptionalString(o, 'method'),
    };
}

const emptySummary: StudentPaymentsSummary = {
    paidAmount: '0.00',
    unpaidAmount: '0.00',
    overdueAmount: '0.00',
    overdueCount: 0,
    nextDueDate: null,
    currency: 'PLN',
};

function readSummary(raw: unknown): StudentPaymentsSummary {
    if (!raw || typeof raw !== 'object') {
        return emptySummary;
    }

    const o = raw as Record<string, unknown>;

    return {
        paidAmount: readString(o, 'paidAmount') || '0.00',
        unpaidAmount: readString(o, 'unpaidAmount') || '0.00',
        overdueAmount: readString(o, 'overdueAmount') || '0.00',
        overdueCount: Number(readString(o, 'overdueCount')) || 0,
        nextDueDate: readOptionalString(o, 'nextDueDate'),
        currency: readString(o, 'currency') || 'PLN',
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

export function normalizeStudentPaymentsPayload(
    data: unknown,
): StudentPaymentsPayload {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {
            payments: normalizeStudentPayments(data),
            summary: emptySummary,
        };
    }

    const record = data as Record<string, unknown>;

    return {
        payments: normalizeStudentPayments(record.payments ?? data),
        summary: readSummary(record.summary),
    };
}
