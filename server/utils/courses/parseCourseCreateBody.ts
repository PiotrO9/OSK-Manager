import {
    readOptionalDateString,
    readOptionalUuid,
    readTrimmedBodyString,
    parseSchoolIdFromBody,
} from '~~/server/utils/validation/requestValidation';
import { isCourseKind, type CourseKind } from '~~/shared/contracts/courses';
import { z } from 'zod';

export interface BffCourseCreateBody {
    schoolId: string;
    name: string;
    category: string;
    kind: CourseKind;
    totalHours: number;
    capacity?: number | null;
    instructorId?: string | null;
    theoryStartDate?: string | null;
    theoryEndDate?: string | null;
}

const courseCreateRecordSchema = z.custom<Record<string, unknown>>(
    (value) => value !== null && typeof value === 'object',
);

/** Serializacja do JSON dla upstreamu (bez `undefined`). */
export function courseCreateBodyToUpstreamRecord(
    body: BffCourseCreateBody,
): Record<string, unknown> {
    const courseRecord: Record<string, unknown> = {
        schoolId: body.schoolId,
        name: body.name,
        category: body.category,
        kind: body.kind,
        totalHours: body.totalHours,
    };

    if (body.capacity !== undefined) {
        courseRecord.capacity = body.capacity;
    }

    if (body.instructorId !== undefined) {
        courseRecord.instructorId = body.instructorId;
    }

    if (body.theoryStartDate !== undefined) {
        courseRecord.theoryStartDate = body.theoryStartDate;
    }

    if (body.theoryEndDate !== undefined) {
        courseRecord.theoryEndDate = body.theoryEndDate;
    }

    return courseRecord;
}

function parseTotalHours(body: Record<string, unknown>): number | null {
    const rawValue = body.totalHours;

    if (typeof rawValue === 'number') {
        return Number.isInteger(rawValue) && rawValue >= 1 ? rawValue : null;
    }

    if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim();
        const parsed = Number(trimmed);

        if (trimmed && Number.isInteger(parsed) && parsed >= 1) {
            return parsed;
        }
    }

    return null;
}

function parseCapacityForTheory(
    body: Record<string, unknown>,
): number | null | undefined | 'invalid' {
    if (!('capacity' in body)) {
        return undefined;
    }

    const rawValue = body.capacity;

    if (rawValue === null || rawValue === undefined) {
        return null;
    }

    if (typeof rawValue === 'number') {
        return Number.isInteger(rawValue) && rawValue >= 0
            ? rawValue
            : 'invalid';
    }

    if (typeof rawValue === 'string') {
        const trimmedCapacity = rawValue.trim();

        if (!trimmedCapacity) {
            return null;
        }

        const parsed = Number(trimmedCapacity);

        if (!Number.isInteger(parsed) || parsed < 0) {
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

    const recordResult = courseCreateRecordSchema.safeParse(body);

    if (!recordResult.success) {
        return { error: 'Nieprawidłowe dane żądania.' };
    }

    const courseRecord = recordResult.data;
    const name = readTrimmedBodyString(courseRecord, 'name');
    const category = readTrimmedBodyString(courseRecord, 'category');

    if (!name) {
        return { error: 'Pole name jest wymagane.' };
    }

    if (!category) {
        return { error: 'Pole category jest wymagane.' };
    }

    const kindRaw = readTrimmedBodyString(courseRecord, 'kind');

    if (!kindRaw || !isCourseKind(kindRaw)) {
        return {
            error: 'Pole kind musi być THEORY_GROUP, PRACTICAL lub EXTRA.',
        };
    }

    const totalHours = parseTotalHours(courseRecord);

    if (totalHours === null) {
        return {
            error: 'Pole totalHours jest wymagane i musi być liczbą całkowitą co najmniej 1.',
        };
    }

    const instructorParsed = readOptionalUuid(courseRecord, 'instructorId');

    if (instructorParsed.status === 'invalid') {
        return {
            error: 'Pole instructorId musi być poprawnym identyfikatorem UUID.',
        };
    }

    if (kindRaw === 'THEORY_GROUP') {
        const startRaw = readOptionalDateString(
            courseRecord,
            'theoryStartDate',
        );
        const endRaw = readOptionalDateString(courseRecord, 'theoryEndDate');

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

        const capacity = parseCapacityForTheory(courseRecord);

        if (capacity === 'invalid') {
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

        if (capacity !== undefined) {
            bffBody.capacity = capacity;
        }

        if (instructorParsed.status === 'value') {
            bffBody.instructorId = instructorParsed.uuid;
        }

        return { bffBody };
    }

    if (
        'capacity' in courseRecord &&
        courseRecord.capacity !== null &&
        courseRecord.capacity !== undefined
    ) {
        const capacity = parseCapacityForTheory(courseRecord);

        if (
            capacity !== 'invalid' &&
            capacity !== null &&
            capacity !== undefined
        ) {
            return {
                error: 'Pole capacity jest dozwolone tylko dla kursu typu THEORY_GROUP.',
            };
        }

        if (capacity === 'invalid') {
            return {
                error: 'Pole capacity musi być liczbą całkowitą większą lub równą 0 lub null.',
            };
        }
    }

    if (
        'theoryStartDate' in courseRecord &&
        courseRecord.theoryStartDate !== null &&
        courseRecord.theoryStartDate !== undefined &&
        String(courseRecord.theoryStartDate).trim() !== ''
    ) {
        return {
            error: 'Dat teorii nie można podawać dla kursów praktycznych lub dodatkowych.',
        };
    }

    if (
        'theoryEndDate' in courseRecord &&
        courseRecord.theoryEndDate !== null &&
        courseRecord.theoryEndDate !== undefined &&
        String(courseRecord.theoryEndDate).trim() !== ''
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
