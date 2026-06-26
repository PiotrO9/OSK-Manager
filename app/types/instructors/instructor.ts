import type { CourseInstructorRef } from '~/types/courses/course';
import {
    normalizeCourseTypesList,
    sortCourseTypeOptions,
    type CourseTypeOption,
} from '~/types/courses/courseType';

export interface InstructorListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    qualifiedCourseTypes?: CourseTypeOption[];
    /** Konto użytkownika (GET kursu zwraca `instructor.id` jako User.id). */
    userId?: string;
    /** GET /events/:id, GET /lessons/:id — gdy BE zwraca kontakt. */
    phone?: string | null;
}

export interface InstructorDetail {
    id: string;
    name: string;
    email: string;
    licenseNumber: string;
    phone: string;
    qualifications: string;
    qualifiedCourseTypes: CourseTypeOption[];
    experience: string;
}

/** Pola formularza edycji (bez placeholderów wyświetlania). */
export interface InstructorEditFormModel {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    qualifications: string;
    qualifiedCourseTypeIds: string[];
    experienceYears: number;
}

/** Liczba lat doświadczenia z pól API (camelCase / snake_case). */
function readNumericExperienceYears(o: Record<string, unknown>): number | null {
    for (const key of ['experienceYears', 'experience_years'] as const) {
        const v = o[key];

        if (v == null) {
            continue;
        }

        if (typeof v === 'number' && Number.isFinite(v)) {
            return v;
        }

        if (typeof v === 'string') {
            const parsed = Number.parseFloat(v.trim());

            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }

    return null;
}

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

/** Wyświetlanie „N rok / N lata / N lat” po polsku. */
function formatPolishExperienceYears(years: number): string {
    const n = Math.floor(years);

    if (n === 1) {
        return '1 rok';
    }

    const mod100 = n % 100;

    if (mod100 >= 11 && mod100 <= 14) {
        return `${n} lat`;
    }

    const mod10 = n % 10;

    if (mod10 === 1) {
        return `${n} rok`;
    }

    if (mod10 >= 2 && mod10 <= 4) {
        return `${n} lata`;
    }

    return `${n} lat`;
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

export function formatInstructorDisplayName(item: InstructorListItem): string {
    const parts = [item.firstName, item.lastName]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    if (parts.length === 0) {
        return '—';
    }

    return parts.join(' ');
}

function normalizeInstructorItem(
    item: unknown,
    index: number,
): InstructorListItem | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const o = item as Record<string, unknown>;
    const profileFromApi =
        o.instructorProfileId != null
            ? String(o.instructorProfileId).trim()
            : o.instructor_profile_id != null
              ? String(o.instructor_profile_id).trim()
              : o.profileId != null
                ? String(o.profileId).trim()
                : '';

    const idRaw = o.id != null ? String(o.id).trim() : '';
    const id = profileFromApi || idRaw || `instructor-row-${index}`;

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

    const userIdRaw =
        o.userId != null
            ? String(o.userId).trim()
            : o.user_id != null
              ? String(o.user_id).trim()
              : o.user && typeof o.user === 'object'
                ? String((o.user as Record<string, unknown>).id ?? '').trim()
                : '';

    const userId = userIdRaw.length > 0 ? userIdRaw : undefined;

    return {
        id,
        firstName,
        lastName,
        email,
        qualifiedCourseTypes: normalizeCourseTypesList(o.qualifiedCourseTypes),
        ...(userId !== undefined ? { userId } : {}),
    };
}

export function instructorHasCourseCategoryQualification(
    instructor: InstructorListItem,
    categoryCode: string,
): boolean {
    const code = categoryCode.trim();

    if (!code) {
        return false;
    }

    return (instructor.qualifiedCourseTypes ?? []).some(
        (courseType) => courseType.code.trim() === code,
    );
}

/**
 * Wartość opcji selecta (InstructorProfile.id): dopasowanie do aktualnego
 * instruktora z GET kursu (`instructor.id` = User.id lub heurystyka po nazwie).
 */
export function resolveInstructorProfileIdForCourseSelection(
    courseInstructor: CourseInstructorRef | null | undefined,
    instructors: InstructorListItem[],
): string {
    if (!courseInstructor) {
        return '';
    }

    const uid = courseInstructor.id.trim();

    if (uid.length > 0) {
        const byUserId = instructors.find((i) => i.userId === uid);

        if (byUserId) {
            return byUserId.id;
        }
    }

    const name = courseInstructor.name?.trim() ?? '';

    if (name.length === 0) {
        return '';
    }

    const byName = instructors.find(
        (i) => formatInstructorDisplayName(i).trim() === name,
    );

    return byName?.id ?? '';
}

export function normalizeInstructorsList(data: unknown): InstructorListItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item, index) => normalizeInstructorItem(item, index))
            .filter((x): x is InstructorListItem => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['instructors', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeInstructorsList(nested);
        }
    }

    return [];
}
