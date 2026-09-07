export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
    createdAt: number;
}

export interface AddToastInput {
    title: string;
    description?: string;
    variant?: ToastVariant;
    durationMs?: number;
}
