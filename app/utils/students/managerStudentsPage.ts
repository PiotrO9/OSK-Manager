import type { LocationQueryValue } from 'vue-router';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

export function readQueryTruthyFlag(raw: unknown): boolean {
    if (raw === undefined || raw === null) {
        return false;
    }

    const queryValue = Array.isArray(raw) ? raw[0] : raw;

    if (typeof queryValue !== 'string') {
        return false;
    }

    const normalizedQueryValue = queryValue.trim().toLowerCase();

    return (
        normalizedQueryValue === '1' ||
        normalizedQueryValue === 'true' ||
        normalizedQueryValue === 'yes'
    );
}

export function readUuidQueryValue(
    raw: LocationQueryValue | LocationQueryValue[] | undefined,
): string | null {
    const queryValue = Array.isArray(raw) ? raw[0] : raw;

    if (typeof queryValue !== 'string') return null;

    const normalizedQueryValue = queryValue.trim();

    if (!isUuid(normalizedQueryValue)) return null;

    return normalizedQueryValue;
}

export function resolveAssignToCourseError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 409) {
        return 'Ten kursant jest już zapisany na wybrany kurs.';
    }

    if (status === 403) {
        return 'Brak uprawnień do przypisania w tej szkole.';
    }

    if (status === 404) {
        return 'Nie znaleziono kursu lub kursanta.';
    }

    if (status === 400) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane żądania.');
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(
        err,
        'Nie udało się zapisać kursanta na kurs.',
    );
}

export function resolveStudentsListError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do listy kursantów dla wybranej szkoły.';
    }

    if (status === 404) {
        return 'Nie znaleziono wybranego kursu lub kurs nie należy do tej OSK.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(
        err,
        'Nie udało się pobrać listy kursantów.',
    );
}
