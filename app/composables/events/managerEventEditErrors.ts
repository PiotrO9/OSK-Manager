import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function getManagerEventEditErrorStatusCode(
    err: unknown,
): number | undefined {
    if (typeof err !== 'object' || err === null) {
        return undefined;
    }

    if (!('statusCode' in err)) {
        return undefined;
    }

    const code = (err as { statusCode: unknown }).statusCode;

    return typeof code === 'number' ? code : undefined;
}

export function isPatchParticipantConflict(err: unknown): boolean {
    if (getManagerEventEditErrorStatusCode(err) !== 409) {
        return false;
    }

    const message = getApiFetchErrorMessage(err, '').toLowerCase();

    return message.includes('participant schedules');
}
