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
    paymentPlans: StudentPaymentPlan[];
    summary: StudentPaymentsSummary;
}

export interface StudentPaymentPlan {
    id: string;
    courseId: string;
    courseName: string;
    currency: string;
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

function readString(record: Record<string, unknown>, key: string): string {
    const raw = record[key];

    return raw == null ? '' : String(raw).trim();
}

function readOptionalString(
    record: Record<string, unknown>,
    key: string,
): string | null {
    const value = readString(record, key);

    return value.length > 0 ? value : null;
}

function normalizePaymentItem(raw: unknown): StudentPaymentItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const id = readString(record, 'id');
    const courseId = readString(record, 'courseId');
    const courseName = readString(record, 'courseName');
    const paymentPlanId = readString(record, 'paymentPlanId');
    const amount = readString(record, 'amount');
    const currency = readString(record, 'currency') || 'PLN';
    const statusRaw = readString(record, 'status');

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
        date: readOptionalString(record, 'date'),
        dueDate: readOptionalString(record, 'dueDate'),
        paidAt: readOptionalString(record, 'paidAt'),
        method: readOptionalString(record, 'method'),
    };
}

function normalizePaymentPlan(raw: unknown): StudentPaymentPlan | null {
    if (!raw || typeof raw !== 'object') return null;

    const record = raw as Record<string, unknown>;
    const id = readString(record, 'id');
    const courseId = readString(record, 'courseId');
    const courseName = readString(record, 'courseName');

    if (!id || !courseId || !courseName) return null;

    return {
        id,
        courseId,
        courseName,
        currency: readString(record, 'currency') || 'PLN',
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

    const record = raw as Record<string, unknown>;

    return {
        paidAmount: readString(record, 'paidAmount') || '0.00',
        unpaidAmount: readString(record, 'unpaidAmount') || '0.00',
        overdueAmount: readString(record, 'overdueAmount') || '0.00',
        overdueCount: Number(readString(record, 'overdueCount')) || 0,
        nextDueDate: readOptionalString(record, 'nextDueDate'),
        currency: readString(record, 'currency') || 'PLN',
    };
}

export function normalizeStudentPayments(data: unknown): StudentPaymentItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizePaymentItem(item))
            .filter(
                (payment): payment is StudentPaymentItem => payment !== null,
            );
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
            paymentPlans: [],
            summary: emptySummary,
        };
    }

    const record = data as Record<string, unknown>;

    return {
        payments: normalizeStudentPayments(record.payments ?? data),
        paymentPlans: Array.isArray(record.paymentPlans)
            ? record.paymentPlans
                  .map(normalizePaymentPlan)
                  .filter((plan): plan is StudentPaymentPlan => plan !== null)
            : [],
        summary: readSummary(record.summary),
    };
}
