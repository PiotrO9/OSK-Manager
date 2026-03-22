import type { z } from 'zod';

export type FormValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: Partial<Record<keyof T, string>> };

export interface UseFormValidationOptions<T> {
    /** Schemat Zod do walidacji */
    schema: z.ZodType<T>;
    /** Funkcja zwracająca aktualne dane formularza */
    getFormData: () => T;
}

export function useFormValidation<T extends Record<string, unknown>>(
    options: UseFormValidationOptions<T>,
) {
    const { schema, getFormData } = options;

    const formData = computed(getFormData);
    const errors = ref<Partial<Record<keyof T, string>>>({});

    const isValid = computed(() => schema.safeParse(formData.value).success);

    function parseZodErrors(result: {
        success: false;
        error: z.ZodError<T>;
    }): Partial<Record<keyof T, string>> {
        const parsedErrors: Partial<Record<keyof T, string>> = {};

        for (const issue of result.error.issues) {
            const fieldKey = issue.path[0];

            if (typeof fieldKey !== 'string') {
                continue;
            }

            const key = fieldKey as keyof T;

            if (!parsedErrors[key]) {
                parsedErrors[key] = issue.message;
            }
        }

        return parsedErrors;
    }

    function validate(): FormValidationResult<T> {
        const result = schema.safeParse(formData.value);

        if (result.success) {
            return { success: true, data: result.data };
        }

        return {
            success: false,
            errors: parseZodErrors(result),
        };
    }

    function resetErrors(): void {
        errors.value = {};
    }

    function setErrors(newErrors: Partial<Record<keyof T, string>>): void {
        errors.value = { ...newErrors };
    }

    function setFieldError(field: keyof T, message: string): void {
        errors.value = { ...errors.value, [field]: message };
    }

    function clearFieldError(field: keyof T): void {
        const { [field]: _, ...rest } = errors.value;

        errors.value = rest;
    }

    function handleSubmit(
        onValid: (data: T) => void | Promise<void>,
    ): (event?: Event) => Promise<void> {
        return async (event?: Event) => {
            if (event) {
                event.preventDefault();
            }

            const validation = validate();

            if (!validation.success) {
                errors.value = validation.errors;

                return;
            }

            resetErrors();
            await onValid(validation.data);
        };
    }

    return {
        errors,
        isValid,
        validate,
        resetErrors,
        setErrors,
        setFieldError,
        clearFieldError,
        handleSubmit,
    };
}
