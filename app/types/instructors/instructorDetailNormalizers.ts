import {
    normalizeCourseTypesList,
    sortCourseTypeOptions,
} from '~/types/courses/courseType';
import type {
    InstructorDetail,
    InstructorEditFormModel,
} from './instructorModels';
import {
    formatPolishExperienceYears,
    readNumericExperienceYears,
} from './instructorNormalizeShared';
import { readAvatarUrlFromRecord } from '~/types/profileAvatar';

/**
 * Normalizacja odpowiedzi GET/PATCH pod formularz edycji (prefill).
 * `qualifications`: null → pusty string; lata: brak w danych → 0.
 */
export function normalizeInstructorDetailForEdit(
    data: unknown,
): InstructorEditFormModel | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const instructorRecord = data as Record<string, unknown>;
    const idRaw =
        instructorRecord.id != null ? String(instructorRecord.id).trim() : '';

    if (!idRaw) {
        return null;
    }

    const firstName =
        instructorRecord.firstName != null
            ? String(instructorRecord.firstName).trim()
            : instructorRecord.first_name != null
              ? String(instructorRecord.first_name).trim()
              : '';

    const lastName =
        instructorRecord.lastName != null
            ? String(instructorRecord.lastName).trim()
            : instructorRecord.last_name != null
              ? String(instructorRecord.last_name).trim()
              : '';

    const email =
        instructorRecord.email != null
            ? String(instructorRecord.email).trim()
            : '';
    const qualifications =
        instructorRecord.qualifications == null
            ? ''
            : String(instructorRecord.qualifications).trim();
    const qualifiedCourseTypes = normalizeCourseTypesList(
        instructorRecord.qualifiedCourseTypes,
    );

    let years = readNumericExperienceYears(instructorRecord);

    if (years == null || !Number.isFinite(years) || years < 0) {
        years = 0;
    }

    const experienceYears = Math.min(80, Math.max(0, Math.floor(years)));

    return {
        id: idRaw,
        firstName,
        lastName,
        email,
        qualifications,
        qualifiedCourseTypeIds: qualifiedCourseTypes.map((item) => item.id),
        experienceYears,
    };
}

export function normalizeInstructorDetail(
    data: unknown,
): InstructorDetail | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const instructorRecord = data as Record<string, unknown>;
    const idRaw =
        instructorRecord.id != null ? String(instructorRecord.id).trim() : '';
    const id = idRaw;

    if (!id) {
        return null;
    }

    const schoolIdsRaw =
        instructorRecord.schoolIds ?? instructorRecord.school_ids;
    const schoolIdFromArray =
        Array.isArray(schoolIdsRaw) && schoolIdsRaw.length === 1
            ? schoolIdsRaw[0]
            : undefined;
    const schoolIdRaw =
        instructorRecord.schoolId ??
        instructorRecord.school_id ??
        schoolIdFromArray;
    const schoolId =
        schoolIdRaw != null && String(schoolIdRaw).trim().length > 0
            ? String(schoolIdRaw).trim()
            : '';

    if (!schoolId) {
        return null;
    }

    let name =
        instructorRecord.name != null
            ? String(instructorRecord.name).trim()
            : '';

    if (
        !name &&
        (instructorRecord.firstName != null ||
            instructorRecord.lastName != null)
    ) {
        const firstName =
            instructorRecord.firstName != null
                ? String(instructorRecord.firstName).trim()
                : instructorRecord.first_name != null
                  ? String(instructorRecord.first_name).trim()
                  : '';
        const lastName =
            instructorRecord.lastName != null
                ? String(instructorRecord.lastName).trim()
                : instructorRecord.last_name != null
                  ? String(instructorRecord.last_name).trim()
                  : '';
        const parts = [firstName, lastName].filter(
            (namePart) => namePart.length > 0,
        );

        name = parts.length > 0 ? parts.join(' ') : '';
    }

    const email =
        instructorRecord.email != null
            ? String(instructorRecord.email).trim()
            : '';

    const licenseNumber =
        instructorRecord.licenseNumber != null
            ? String(instructorRecord.licenseNumber).trim()
            : instructorRecord.license_number != null
              ? String(instructorRecord.license_number).trim()
              : '';

    const phone =
        instructorRecord.phone != null
            ? String(instructorRecord.phone).trim()
            : instructorRecord.phoneNumber != null
              ? String(instructorRecord.phoneNumber).trim()
              : instructorRecord.phone_number != null
                ? String(instructorRecord.phone_number).trim()
                : instructorRecord.mobile != null
                  ? String(instructorRecord.mobile).trim()
                  : '';

    const qualifications =
        instructorRecord.qualifications != null
            ? String(instructorRecord.qualifications).trim()
            : instructorRecord.qualifications_list != null
              ? String(instructorRecord.qualifications_list).trim()
              : '';
    const qualifiedCourseTypes = sortCourseTypeOptions(
        normalizeCourseTypesList(instructorRecord.qualifiedCourseTypes),
    );

    let experience =
        instructorRecord.experience != null
            ? String(instructorRecord.experience).trim()
            : instructorRecord.years_experience != null
              ? String(instructorRecord.years_experience).trim()
              : '';

    if (!experience) {
        const years = readNumericExperienceYears(instructorRecord);

        if (years != null && years >= 0) {
            experience = formatPolishExperienceYears(years);
        }
    }

    return {
        id,
        schoolId,
        name: name || '—',
        email,
        avatarUrl: readAvatarUrlFromRecord(instructorRecord),
        licenseNumber: licenseNumber || '—',
        phone: phone || '—',
        qualifications: qualifications || '—',
        qualifiedCourseTypes,
        experience: experience || '—',
    };
}
