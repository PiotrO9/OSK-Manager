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

    const o = data as Record<string, unknown>;
    const idRaw = o.id != null ? String(o.id).trim() : '';

    if (!idRaw) {
        return null;
    }

    const firstName =
        o.firstName != null
            ? String(o.firstName).trim()
            : o.first_name != null
              ? String(o.first_name).trim()
              : '';

    const lastName =
        o.lastName != null
            ? String(o.lastName).trim()
            : o.last_name != null
              ? String(o.last_name).trim()
              : '';

    const email = o.email != null ? String(o.email).trim() : '';
    const qualifications =
        o.qualifications == null ? '' : String(o.qualifications).trim();
    const qualifiedCourseTypes = normalizeCourseTypesList(
        o.qualifiedCourseTypes,
    );

    let years = readNumericExperienceYears(o);

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

    const o = data as Record<string, unknown>;
    const idRaw = o.id != null ? String(o.id).trim() : '';
    const id = idRaw;

    if (!id) {
        return null;
    }

    let name = o.name != null ? String(o.name).trim() : '';

    if (!name && (o.firstName != null || o.lastName != null)) {
        const fn =
            o.firstName != null
                ? String(o.firstName).trim()
                : o.first_name != null
                  ? String(o.first_name).trim()
                  : '';
        const ln =
            o.lastName != null
                ? String(o.lastName).trim()
                : o.last_name != null
                  ? String(o.last_name).trim()
                  : '';
        const parts = [fn, ln].filter((s) => s.length > 0);

        name = parts.length > 0 ? parts.join(' ') : '';
    }

    const email = o.email != null ? String(o.email).trim() : '';

    const licenseNumber =
        o.licenseNumber != null
            ? String(o.licenseNumber).trim()
            : o.license_number != null
              ? String(o.license_number).trim()
              : '';

    const phone =
        o.phone != null
            ? String(o.phone).trim()
            : o.phoneNumber != null
              ? String(o.phoneNumber).trim()
              : o.phone_number != null
                ? String(o.phone_number).trim()
                : o.mobile != null
                  ? String(o.mobile).trim()
                  : '';

    const qualifications =
        o.qualifications != null
            ? String(o.qualifications).trim()
            : o.qualifications_list != null
              ? String(o.qualifications_list).trim()
              : '';
    const qualifiedCourseTypes = sortCourseTypeOptions(
        normalizeCourseTypesList(o.qualifiedCourseTypes),
    );

    let experience =
        o.experience != null
            ? String(o.experience).trim()
            : o.years_experience != null
              ? String(o.years_experience).trim()
              : '';

    if (!experience) {
        const years = readNumericExperienceYears(o);

        if (years != null && years >= 0) {
            experience = formatPolishExperienceYears(years);
        }
    }

    return {
        id,
        name: name || '—',
        email,
        licenseNumber: licenseNumber || '—',
        phone: phone || '—',
        qualifications: qualifications || '—',
        qualifiedCourseTypes,
        experience: experience || '—',
    };
}
