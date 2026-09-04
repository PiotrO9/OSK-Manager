import type {
    CreateStudentPaymentPayload,
    StudentPaymentItem,
    UpdateStudentPaymentPayload,
} from '~/types/payments/payment';

export interface StudentPaymentPlanOption {
    id: string;
    label: string;
}

export interface StudentPaymentEditState {
    dueDate: string;
    method: string;
}

export function toStudentPaymentDateInput(value: string | null): string {
    if (!value) {
        return '';
    }

    return value.slice(0, 10);
}

export function formatStudentPaymentAmount(
    amount: string,
    currency: string,
): string {
    const numeric = Number.parseFloat(amount.replace(',', '.'));

    if (!Number.isFinite(numeric)) {
        return `${amount} ${currency}`.trim();
    }

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: currency || 'PLN',
        maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    }).format(numeric);
}

export function formatStudentPaymentDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

export function buildStudentPaymentPlanOptions(
    payments: readonly StudentPaymentItem[],
): StudentPaymentPlanOption[] {
    const seen = new Set<string>();
    const options: StudentPaymentPlanOption[] = [];

    for (const payment of payments) {
        if (seen.has(payment.paymentPlanId)) {
            continue;
        }

        seen.add(payment.paymentPlanId);
        options.push({
            id: payment.paymentPlanId,
            label: payment.courseName,
        });
    }

    return options;
}

export function buildStudentPaymentEditState(
    payment: StudentPaymentItem,
): StudentPaymentEditState {
    return {
        dueDate: toStudentPaymentDateInput(payment.dueDate),
        method: payment.method ?? '',
    };
}

export function canCreateStudentPayment(
    paymentPlanId: string,
    amount: string,
    isSaving: boolean,
): boolean {
    return paymentPlanId.length > 0 && amount.trim().length > 0 && !isSaving;
}

export function buildCreateStudentPaymentPayload(input: {
    paymentPlanId: string;
    amount: string;
    dueDate: string;
    method: string;
}): CreateStudentPaymentPayload {
    return {
        paymentPlanId: input.paymentPlanId,
        amount: input.amount.trim().replace(',', '.'),
        dueDate: input.dueDate || null,
        method: input.method.trim() || null,
    };
}

export function buildUpdateStudentPaymentPayload(
    state: StudentPaymentEditState,
): UpdateStudentPaymentPayload {
    return {
        dueDate: state.dueDate || null,
        method: state.method.trim() || null,
    };
}
