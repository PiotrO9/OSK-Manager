import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';

const cancellationMessages: Record<string, string> = {
    'Cannot cancel a completed lesson': 'Nie można anulować zakończonej jazdy.',
    'Lesson is already cancelled': 'Ta jazda została już anulowana.',
    'Only scheduled lessons can be cancelled':
        'Można anulować tylko zaplanowaną jazdę.',
    'Cannot cancel a lesson that has already started':
        'Nie można anulować jazdy, która już się rozpoczęła.',
    'Lesson is no longer cancellable':
        'Nie można już anulować tej jazdy. Odśwież harmonogram.',
    'Lesson not found': 'Nie znaleziono tej jazdy.',
};

export function managerLessonEditErrorMessage(
    error: unknown,
    fallback: string,
): string {
    const status = getApiErrorStatusCode(error);

    if (status === 401) return 'Sesja wygasła. Zaloguj się ponownie.';

    if (status === 403) return 'Nie masz uprawnień do wykonania tej operacji.';

    if (status === 404) return 'Nie znaleziono jazdy lub wymaganych danych.';

    if (status === 409)
        return 'Dane jazdy zmieniły się. Odśwież stronę i spróbuj ponownie.';

    if (status === 429) return 'Zbyt wiele prób. Spróbuj ponownie później.';

    return fallback;
}

export function managerLessonCancelErrorMessage(error: unknown): string {
    const rawMessage = getApiFetchErrorMessage(error, '');
    const translated = cancellationMessages[rawMessage];

    if (translated) return translated;

    return managerLessonEditErrorMessage(
        error,
        'Nie udało się anulować rezerwacji. Spróbuj ponownie.',
    );
}
