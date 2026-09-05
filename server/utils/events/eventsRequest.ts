import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import type { UpstreamRequestOptions } from '~~/server/utils/upstream/upstreamTypes';

export const EVENT_HTML_ERROR =
    'Serwer zwrócił odpowiedź HTML lub pustą zamiast JSON — sprawdź upstream API.';
export const EVENT_NOT_FOUND_HTML =
    'Nie znaleziono zasobu lub brak endpointu GET/PATCH /events/:id na serwerze (odpowiedź HTML zamiast JSON).';
export const INVALID_JSON =
    'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).';

export async function eventDataRequest<T>(
    event: H3Event,
    upstreamBase: string,
    options: UpstreamRequestOptions,
): Promise<T | undefined> {
    const { data } = await upstreamRequest<T>(event, upstreamBase, {
        invalidJsonError: INVALID_JSON,
        htmlError: EVENT_HTML_ERROR,
        ...options,
    });

    return data;
}
