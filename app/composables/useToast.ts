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

export function useToast() {
    const toasts = useState<ToastItem[]>('ui_toasts', () => []);

    function removeToast(toastId: string) {
        if (!toastId) return;

        toasts.value = toasts.value.filter((toast) => toast.id !== toastId);
    }

    function addToast(input: AddToastInput): string {
        if (!input?.title) return '';

        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const variant = input.variant ?? 'info';
        const durationMs = input.durationMs ?? 3500;

        toasts.value = [
            ...toasts.value,
            {
                id,
                title: input.title,
                description: input.description,
                variant,
                createdAt: Date.now(),
            },
        ];

        if (durationMs > 0) {
            setTimeout(() => removeToast(id), durationMs);
        }

        return id;
    }

    return {
        toasts,
        addToast,
        removeToast,
    };
}
