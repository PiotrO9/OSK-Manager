import { formatPolishCount } from '~/utils/text/polishPlural';
import type {
    StudentPaymentItem,
    StudentPaymentsSummary,
} from '~/types/payments/payment';

export type MyPaymentDisplayStatus = 'OVERDUE' | 'UNPAID' | 'PAID';
export type MyPaymentsFilter = 'UNPAID' | 'ALL' | 'PAID';

function utcDayStart(value: Date): number {
    return Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
    );
}

function readDateTime(value: string | null): number | null {
    if (!value) {
        return null;
    }

    const timestamp = new Date(value).getTime();

    return Number.isNaN(timestamp) ? null : timestamp;
}

export function getMyPaymentDisplayStatus(
    payment: StudentPaymentItem,
    now = new Date(),
): MyPaymentDisplayStatus {
    if (payment.status === 'PAID') {
        return 'PAID';
    }

    const dueTime = readDateTime(payment.dueDate);

    if (dueTime !== null && dueTime < utcDayStart(now)) {
        return 'OVERDUE';
    }

    return 'UNPAID';
}

export function getMyPaymentPaidDate(
    payment: StudentPaymentItem,
): string | null {
    return payment.status === 'PAID' ? payment.paidAt : null;
}

function sortTime(value: string | null, fallback: number): number {
    return readDateTime(value) ?? fallback;
}

export function sortMyPayments(
    payments: readonly StudentPaymentItem[],
    now = new Date(),
): StudentPaymentItem[] {
    return [...payments].sort((left, right) => {
        const leftStatus = getMyPaymentDisplayStatus(left, now);
        const rightStatus = getMyPaymentDisplayStatus(right, now);
        const order: Record<MyPaymentDisplayStatus, number> = {
            OVERDUE: 0,
            UNPAID: 1,
            PAID: 2,
        };
        const statusDifference = order[leftStatus] - order[rightStatus];

        if (statusDifference !== 0) {
            return statusDifference;
        }

        if (leftStatus === 'PAID') {
            return (
                sortTime(right.paidAt, Number.NEGATIVE_INFINITY) -
                sortTime(left.paidAt, Number.NEGATIVE_INFINITY)
            );
        }

        return (
            sortTime(left.dueDate, Number.POSITIVE_INFINITY) -
            sortTime(right.dueDate, Number.POSITIVE_INFINITY)
        );
    });
}

export function filterMyPayments(
    payments: readonly StudentPaymentItem[],
    filter: MyPaymentsFilter,
    now = new Date(),
): StudentPaymentItem[] {
    if (filter === 'ALL') {
        return [...payments];
    }

    return payments.filter((payment) => {
        const status = getMyPaymentDisplayStatus(payment, now);

        return filter === 'PAID' ? status === 'PAID' : status !== 'PAID';
    });
}

export function formatPaymentMethod(value: string | null): string | null {
    const method = value?.trim();

    if (!method) {
        return null;
    }

    const labels: Record<string, string> = {
        transfer: 'Przelew',
        card: 'Karta',
        cash: 'Gotówka',
    };

    return labels[method.toLocaleLowerCase('pl-PL')] ?? method;
}

export interface MyPaymentsToolbarSummary {
    primary: string;
    secondary: string;
    tone: 'danger' | 'neutral' | 'success';
}

function parseAmount(value: string): number {
    const amount = Number.parseFloat(value.replace(',', '.'));

    return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(value: string, currency: string): string {
    const amount = parseAmount(value);

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: currency || 'PLN',
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Brak';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Brak';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatOverdueCount(count: number): string {
    const absoluteCount = Math.abs(count);
    const lastTwoDigits = absoluteCount % 100;
    const lastDigit = absoluteCount % 10;

    if (count === 1) {
        return '1 zaległa';
    }

    if (lastTwoDigits < 12 || lastTwoDigits > 14) {
        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${count} zaległe`;
        }
    }

    return `${count} zaległych`;
}

export function getMyPaymentsToolbarSummary(
    payments: readonly StudentPaymentItem[],
    summary: StudentPaymentsSummary,
    activeFilter: MyPaymentsFilter,
): MyPaymentsToolbarSummary {
    const paidCount = payments.filter(
        (payment) => payment.status === 'PAID',
    ).length;
    const unpaidCount = payments.length - paidCount;
    const currency = summary.currency;

    if (activeFilter === 'PAID') {
        return {
            primary: `${formatCurrency(summary.paidAmount, currency)} opłacono`,
            secondary: formatPolishCount(paidCount, [
                'pozycja',
                'pozycje',
                'pozycji',
            ]),
            tone: 'success',
        };
    }

    if (activeFilter === 'ALL') {
        return {
            primary: formatPolishCount(payments.length, [
                'płatność',
                'płatności',
                'płatności',
            ]),
            secondary: `${formatCurrency(summary.unpaidAmount, currency)} do opłacenia · ${formatCurrency(summary.paidAmount, currency)} opłacono`,
            tone: 'neutral',
        };
    }

    const details: string[] = [];

    if (summary.overdueCount > 0) {
        details.push(
            `${formatOverdueCount(summary.overdueCount)} · ${formatCurrency(summary.overdueAmount, currency)}`,
        );
    }

    if (summary.nextDueDate) {
        details.push(`najbliższy termin ${formatDate(summary.nextDueDate)}`);
    }

    return {
        primary: `${formatCurrency(summary.unpaidAmount, currency)} do opłacenia`,
        secondary:
            details.join(' · ') ||
            formatPolishCount(unpaidCount, ['pozycja', 'pozycje', 'pozycji']),
        tone: summary.overdueCount > 0 ? 'danger' : 'neutral',
    };
}
