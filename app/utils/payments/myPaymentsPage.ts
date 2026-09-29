import type { StudentPaymentItem } from '~/types/payments/payment';

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

export function formatPolishCount(
    count: number,
    forms: readonly [singular: string, plural: string, genitive: string],
): string {
    const absolute = Math.abs(count);
    const lastTwoDigits = absolute % 100;
    const lastDigit = absolute % 10;
    const form =
        absolute === 1
            ? forms[0]
            : lastDigit >= 2 &&
                lastDigit <= 4 &&
                !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
              ? forms[1]
              : forms[2];

    return `${count} ${form}`;
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
