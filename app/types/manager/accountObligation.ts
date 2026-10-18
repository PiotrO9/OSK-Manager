export type AccountObligationType =
    | 'LESSON'
    | 'COURSE'
    | 'EVENT'
    | 'PAYMENT'
    | 'TIME_BLOCK';

export interface AccountObligation {
    type: AccountObligationType;
    id: string;
    title: string;
    startTime: string | null;
    endTime: string | null;
    amount?: string;
    currency?: string;
    status?: string;
}
