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

/**
 * PATCH bez payloadu w `data` — tylko `{ success: true }` lub `{ success: false, error }`.
 */
export function assertBooleanSuccessEnvelope(raw: unknown): void {
    if (typeof raw !== 'object' || raw === null) {
        throw new Error('Nieprawidłowa odpowiedź serwera.');
    }

    const envelope = raw as { success?: boolean; error?: string };

    if (envelope.success === false && typeof envelope.error === 'string') {
        throw new Error(envelope.error);
    }

    if (envelope.success !== true) {
        throw new Error('Nieprawidłowa odpowiedź serwera.');
    }
}

export function getApiErrorStatusCode(err: unknown): number | undefined {
    if (err === null || typeof err !== 'object') return undefined;

    if (!('statusCode' in err)) return undefined;

    const raw = (err as { statusCode: unknown }).statusCode;

    return typeof raw === 'number' ? raw : undefined;
}
