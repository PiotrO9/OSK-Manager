import { createError } from 'h3';
import { isUuid } from '~~/server/utils/validation/requestValidation';

export interface BffInstructorPatchBody {
    firstName?: string;
    lastName?: string;
    experienceYears?: number;
    qualifications?: string;
    qualifiedCourseTypeIds?: string[];
}

const INSTRUCTOR_PATCH_KEYS = [
    'firstName',
    'lastName',
    'experienceYears',
    'qualifications',
    'qualifiedCourseTypeIds',
] as const;

export function stripInstructorPatchBody(raw: unknown): BffInstructorPatchBody {
    if (!raw || typeof raw !== 'object') {
        return {};
    }

    const instructorRecord = raw as Record<string, unknown>;
    const out: BffInstructorPatchBody = {};

    for (const key of INSTRUCTOR_PATCH_KEYS) {
        if (!(key in instructorRecord) || instructorRecord[key] === undefined) {
            continue;
        }

        if (key === 'experienceYears') {
            const fieldValue = instructorRecord[key];

            if (
                typeof fieldValue === 'number' &&
                Number.isInteger(fieldValue)
            ) {
                out[key] = fieldValue;
            }

            continue;
        }

        if (key === 'qualifications') {
            out[key] =
                instructorRecord[key] == null
                    ? ''
                    : String(instructorRecord[key]);

            continue;
        }

        if (key === 'qualifiedCourseTypeIds') {
            const fieldValue = instructorRecord[key];

            if (!Array.isArray(fieldValue)) {
                throw createError({
                    statusCode: 400,
                    message: 'Invalid qualifiedCourseTypeIds',
                });
            }

            const ids: string[] = [];

            for (const item of fieldValue) {
                const id = typeof item === 'string' ? item.trim() : '';

                if (!id || !isUuid(id)) {
                    throw createError({
                        statusCode: 400,
                        message: 'Invalid qualifiedCourseTypeIds',
                    });
                }

                if (!ids.includes(id)) {
                    ids.push(id);
                }
            }

            out[key] = ids;

            continue;
        }

        if (key === 'firstName' || key === 'lastName') {
            out[key] =
                instructorRecord[key] == null
                    ? ''
                    : String(instructorRecord[key]);
        }
    }

    return out;
}
