import type { ZodError } from 'zod';
import type { AddToastInput } from '~/composables/core/useAppToast';

export function toastFormZodError(
    addToast: (input: AddToastInput) => string,
    zodError: ZodError,
    title = 'Formularz',
): void {
    const first = zodError.issues[0];

    addToast({
        title,
        description: first?.message ?? 'Sprawdź pola.',
        variant: 'error',
    });
}
