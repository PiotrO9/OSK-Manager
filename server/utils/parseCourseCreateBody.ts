import {
    isUuid,
    parseSchoolIdFromBody,
} from '~~/server/utils/parseVehicleRequestBody';

export type CourseCreateKind = 'THEORY_GROUP' | 'PRACTICAL' | 'EXTRA';

export interface BffCourseCreateBody {
    schoolId: string;
    name: string;
    category: string;
    kind: CourseCreateKind;
    totalHours: number;
    capacity?: number | null;
    instructorId?: string | null;
    theoryStartDate?: string | null;
    theoryEndDate?: string | null;
}

/** Serializacja do JSON dla upstreamu (bez `undefined`). */
export function courseCreateBodyToUpstreamRecord(
    body: BffCourseCreateBody,
): Record<string, unknown> {
    const o: Record<string, unknown> = {
        schoolId: body.schoolId,
        name: body.name,
        category: body.category,
        kind: body.kind,
        totalHours: body.totalHours,
    };

    if (body.capacity !== undefined) {
        o.capacity = body.capacity;
    }

    if (body.instructorId !== undefined) {
        o.instructorId = body.instructorId;
    }

    if (body.theoryStartDate !== undefined) {
        o.theoryStartDate = body.theoryStartDate;
    }

    if (body.theoryEndDate !== undefined) {
        o.theoryEndDate = body.theoryEndDate;
    }

    return o;
}

function isCourseCreateKind(value: string): value is CourseCreateKind {
    return (
        value === 'THEORY_GROUP' || value === 'PRACTICAL' || value === 'EXTRA'
    );
}

function readTrimmedString(body: Record<string, unknown>, key: string): string {
    const raw = body[key];

    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (raw == null) {
        return '';
    }

    return String(raw).trim();
}

type OptionalUuidResult =
    | { status: 'omit' }
    | { status: 'null' }
    | { status: 'value'; uuid: string }
    | { status: 'invalid' };

function readOptionalUuid(
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

    const s = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();

    if (!s) {
        return { status: 'null' };
    }

    if (!isUuid(s)) {
        return { status: 'invalid' };
    }

    return { status: 'value', uuid: s };
}

function parseTotalHours(body: Record<string, unknown>): number | null {
    const raw = body.totalHours;

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        const n = Math.trunc(raw);

        if (n >= 1) {
            return n;
        }

        return null;
    }

    if (typeof raw === 'string') {
        const parsed = Number.parseInt(raw.trim(), 10);

        if (!Number.isNaN(parsed) && parsed >= 1) {
            return parsed;
        }
    }

    return null;
}

/** `YYYY-MM-DD` z input[type=date] lub pusty. */
function readOptionalDateString(
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

    const s = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();

    if (!s) {
        return null;
    }

    return s;
}

function parseCapacityForTheory(
    body: Record<string, unknown>,
): number | null | undefined | 'invalid' {
    if (!('capacity' in body)) {
        return undefined;
    }

    const raw = body.capacity;

    if (raw === null || raw === undefined) {
        return null;
    }

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        const n = Math.trunc(raw);

        if (n < 0) {
            return 'invalid';
        }

        return n;
    }

    if (typeof raw === 'string') {
        const t = raw.trim();

        if (!t) {
            return null;
        }

        const parsed = Number.parseInt(t, 10);

        if (Number.isNaN(parsed) || parsed < 0) {
            return 'invalid';
        }

        return parsed;
    }

    return 'invalid';
}

function compareIsoDateStrings(a: string, b: string): number {
    return a.localeCompare(b);
}

/**
 * Parsuje body POST tworzenia kursu zgodnie z courses-api.md (BE).
 * Zwraca `null` + komunikat, jeśli walidacja nie przechodzi.
 */
export function parseCourseCreateBody(body: unknown):
    | {
          bffBody: BffCourseCreateBody;
      }
    | { error: string } {
    const schoolId = parseSchoolIdFromBody(body);

    if (!schoolId) {
        return {
            error: 'Pole schoolId jest wymagane i musi być poprawnym identyfikatorem UUID.',
        };
    }

    if (!body || typeof body !== 'object') {
        return { error: 'Nieprawidłowe dane żądania.' };
    }

    const o = body as Record<string, unknown>;
    const name = readTrimmedString(o, 'name');
    const category = readTrimmedString(o, 'category');

    if (!name) {
        return { error: 'Pole name jest wymagane.' };
    }

    if (!category) {
        return { error: 'Pole category jest wymagane.' };
    }

    const kindRaw = readTrimmedString(o, 'kind');

    if (!kindRaw || !isCourseCreateKind(kindRaw)) {
        return {
            error: 'Pole kind musi być THEORY_GROUP, PRACTICAL lub EXTRA.',
        };
    }

    const totalHours = parseTotalHours(o);

    if (totalHours === null) {
        return {
            error: 'Pole totalHours jest wymagane i musi być liczbą całkowitą co najmniej 1.',
        };
    }

    const instructorParsed = readOptionalUuid(o, 'instructorId');

    if (instructorParsed.status === 'invalid') {
        return {
            error: 'Pole instructorId musi być poprawnym identyfikatorem UUID.',
        };
    }

    if (kindRaw === 'THEORY_GROUP') {
        const startRaw = readOptionalDateString(o, 'theoryStartDate');
        const endRaw = readOptionalDateString(o, 'theoryEndDate');

        if (startRaw === undefined || startRaw === null || startRaw === '') {
            return {
                error: 'Dla kursu teorii (grupa) wymagana jest data rozpoczęcia (theoryStartDate).',
            };
        }

        if (endRaw === undefined || endRaw === null || endRaw === '') {
            return {
                error: 'Dla kursu teorii (grupa) wymagana jest data zakończenia (theoryEndDate).',
            };
        }

        if (compareIsoDateStrings(endRaw, startRaw) < 0) {
            return {
                error: 'Data zakończenia teorii nie może być wcześniejsza niż data rozpoczęcia.',
            };
        }

        const cap = parseCapacityForTheory(o);

        if (cap === 'invalid') {
            return {
                error: 'Pole capacity musi być liczbą całkowitą większą lub równą 0 lub null.',
            };
        }

        const bffBody: BffCourseCreateBody = {
            schoolId,
            name,
            category,
            kind: 'THEORY_GROUP',
            totalHours,
            theoryStartDate: startRaw,
            theoryEndDate: endRaw,
        };

        if (cap !== undefined) {
            bffBody.capacity = cap;
        }

        if (instructorParsed.status === 'value') {
            bffBody.instructorId = instructorParsed.uuid;
        }

        return { bffBody };
    }

    if ('capacity' in o && o.capacity !== null && o.capacity !== undefined) {
        const cap = parseCapacityForTheory(o);

        if (cap !== 'invalid' && cap !== null && cap !== undefined) {
            return {
                error: 'Pole capacity jest dozwolone tylko dla kursu typu THEORY_GROUP.',
            };
        }

        if (cap === 'invalid') {
            return {
                error: 'Pole capacity musi być liczbą całkowitą większą lub równą 0 lub null.',
            };
        }
    }

    if (
        'theoryStartDate' in o &&
        o.theoryStartDate !== null &&
        o.theoryStartDate !== undefined &&
        String(o.theoryStartDate).trim() !== ''
    ) {
        return {
            error: 'Dat teorii nie można podawać dla kursów praktycznych lub dodatkowych.',
        };
    }

    if (
        'theoryEndDate' in o &&
        o.theoryEndDate !== null &&
        o.theoryEndDate !== undefined &&
        String(o.theoryEndDate).trim() !== ''
    ) {
        return {
            error: 'Dat teorii nie można podawać dla kursów praktycznych lub dodatkowych.',
        };
    }

    const bffBody: BffCourseCreateBody = {
        schoolId,
        name,
        category,
        kind: kindRaw,
        totalHours,
    };

    if (instructorParsed.status === 'value') {
        bffBody.instructorId = instructorParsed.uuid;
    }

    return { bffBody };
}
