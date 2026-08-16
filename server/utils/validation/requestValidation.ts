import { createError, getRouterParam, type H3Event } from 'h3';

export type OptionalUuidResult =
    | { status: 'omit' }
    | { status: 'null' }
    | { status: 'value'; uuid: string }
    | { status: 'invalid' };

export function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value.trim(),
    );
}

export function readTrimmedBodyString(
    body: Record<string, unknown>,
    key: string,
): string {
    const raw = body[key];

    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (raw == null) {
        return '';
    }

    return String(raw).trim();
}

export function readQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

export function parseRequiredUuidQuery(
    query: Record<string, unknown>,
    key: string,
    messages: {
        required: string;
        invalid: string;
    },
): string {
    const value = readQueryString(query[key]);

    if (!value) {
        throw createError({
            statusCode: 400,
            message: messages.required,
        });
    }

    if (!isUuid(value)) {
        throw createError({
            statusCode: 400,
            message: messages.invalid,
        });
    }

    return value;
}

export function parseRequiredRouterParam(
    event: H3Event,
    key: string,
    requiredMessage: string,
): string {
    const value = getRouterParam(event, key)?.trim() ?? '';

    if (!value) {
        throw createError({
            statusCode: 400,
            message: requiredMessage,
        });
    }

    return value;
}

export function parseRequiredUuidRouterParam(
    event: H3Event,
    key: string,
    messages: {
        required: string;
        invalid: string;
    },
): string {
    const value = parseRequiredRouterParam(event, key, messages.required);

    if (!isUuid(value)) {
        throw createError({
            statusCode: 400,
            message: messages.invalid,
        });
    }

    return value;
}

export function parsePositiveIntQuery(raw: unknown, fallback: number): number {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return Math.trunc(raw);
    }

    if (typeof raw === 'string') {
        const parsed = Number.parseInt(raw.trim(), 10);

        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

export function parseSchoolIdFromBody(body: unknown): string | null {
    if (!body || typeof body !== 'object') return null;

    const schoolId = readTrimmedBodyString(
        body as Record<string, unknown>,
        'schoolId',
    );

    if (!schoolId) return null;

    if (!isUuid(schoolId)) return null;

    return schoolId;
}

export function readOptionalUuid(
    body: Record<string, unknown>,
    key: string,
): OptionalUuidResult {
    if (!(key in body)) {
        return { status: 'omit' };
    }

    const raw = body[key];

    if (raw === null) {
        return { status: 'null' };
    }

    const uuid =
        typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();

    if (!uuid) {
        return { status: 'null' };
    }

    if (!isUuid(uuid)) {
        return { status: 'invalid' };
    }

    return { status: 'value', uuid };
}

export function readOptionalDateString(
    body: Record<string, unknown>,
    key: string,
): string | null | undefined {
    if (!(key in body)) {
        return undefined;
    }

    const raw = body[key];

    if (raw === null) {
        return null;
    }

    const date =
        typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();

    if (!date) {
        return null;
    }

    return date;
}
