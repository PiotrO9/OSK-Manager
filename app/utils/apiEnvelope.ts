/**
 * Odpowiedzi API backendu OSK — koperta wg context/api-guidelines (BE).
 */
export function unwrapApiSuccessData<T>(body: unknown): T {
    if (!body || typeof body !== 'object') {
        throw new Error('Nieprawidłowa odpowiedź serwera');
    }

    const record = body as {
        success?: boolean;
        data?: T;
        error?: string;
    };

    if (record.success === true && record.data !== undefined) {
        return record.data;
    }

    if (record.success === false && typeof record.error === 'string') {
        throw new Error(record.error);
    }

    throw new Error('Nieprawidłowa odpowiedź serwera');
}
