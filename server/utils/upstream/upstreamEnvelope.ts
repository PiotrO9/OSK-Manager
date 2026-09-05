import { createError } from 'h3';
import type { BackendEnvelope } from './upstreamTypes';

export function parseBackendEnvelopeFromResponseText<T>(
    res: Response,
    text: string,
    options: {
        fallbackError: string;
        invalidJsonError?: string;
        htmlError?: string;
        notFoundHtmlError?: string;
        allowEmptySuccess?: boolean;
    },
): BackendEnvelope<T> {
    const trimmed = text.trim();

    if (trimmed === '') {
        if (res.ok && (res.status === 204 || options.allowEmptySuccess)) {
            return { success: true };
        }

        throw createError({
            statusCode:
                res.status >= 400 && res.status < 600 ? res.status : 502,
            statusMessage:
                options.htmlError ??
                'Serwer zwrócił pustą odpowiedź zamiast JSON.',
        });
    }

    if (trimmed.startsWith('<')) {
        throw createError({
            statusCode:
                res.status >= 400 && res.status < 600 ? res.status : 502,
            statusMessage:
                res.status === 404 && options.notFoundHtmlError
                    ? options.notFoundHtmlError
                    : (options.htmlError ??
                      'Serwer zwrócił odpowiedź HTML zamiast JSON.'),
        });
    }

    try {
        return JSON.parse(text) as BackendEnvelope<T>;
    } catch {
        throw createError({
            statusCode: 502,
            statusMessage:
                options.invalidJsonError ??
                'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
        });
    }
}
