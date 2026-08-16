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

    const o = raw as Record<string, unknown>;
    const out: BffInstructorPatchBody = {};

    for (const key of INSTRUCTOR_PATCH_KEYS) {
        if (!(key in o) || o[key] === undefined) {
            continue;
        }

        if (key === 'experienceYears') {
            const v = o[key];

            if (typeof v === 'number' && Number.isInteger(v)) {
                out[key] = v;
            }

            continue;
        }

        if (key === 'qualifications') {
            out[key] = o[key] == null ? '' : String(o[key]);

            continue;
        }

        if (key === 'qualifiedCourseTypeIds') {
            const v = o[key];

            if (!Array.isArray(v)) {
                throw createError({
                    statusCode: 400,
                    message: 'Invalid qualifiedCourseTypeIds',
                });
            }

            const ids: string[] = [];

            for (const item of v) {
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
            out[key] = o[key] == null ? '' : String(o[key]);
        }
    }

    return out;
}
