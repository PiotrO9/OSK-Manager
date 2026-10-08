import { isCourseKind, type CourseKind } from '~~/shared/contracts/courses';

/** Element `offeredCourseTypes` z GET `/driving-schools` (ustawienia OSK). */
export interface OfferedCourseType {
    id: string;
    code: string;
    name: string;
}

export interface DrivingSchool {
    id: string;
    name: string;
    city?: string | null;
    address?: string | null;
    /** Czy szkoła jest domyślną (jeśli backend zwraca to pole). */
    isDefault?: boolean;
    /** Z `SchoolSettings` — pusta tablica, jeśli brak konfiguracji. */
    offeredCourseTypes?: OfferedCourseType[];
    /** Dozwolone `kind` przy tworzeniu kursu (`POST /courses`). */
    enabledCourseKinds?: CourseKind[];
}

export interface CreateDrivingSchoolBody {
    name: string;
    city?: string;
    address?: string;
}

export interface UpdateDrivingSchoolBody {
    name: string;
    city?: string | null;
    address?: string | null;
}

function normalizeOfferedCourseType(item: unknown): OfferedCourseType | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const offeredCourseTypeRecord = item as Record<string, unknown>;

    const nested =
        offeredCourseTypeRecord.courseType &&
        typeof offeredCourseTypeRecord.courseType === 'object'
            ? (offeredCourseTypeRecord.courseType as Record<string, unknown>)
            : null;

    const src = nested ?? offeredCourseTypeRecord;

    const idRaw =
        src.id ??
        src.courseTypeId ??
        src.course_type_id ??
        offeredCourseTypeRecord.courseTypeId;
    const id = idRaw != null ? String(idRaw).trim() : '';

    const codeRaw =
        src.code ??
        src.categoryCode ??
        src.category_code ??
        src.licenseCategory;
    const code = codeRaw != null ? String(codeRaw).trim() : '';

    const nameRaw = src.name ?? src.label ?? src.title;
    const name = nameRaw != null ? String(nameRaw).trim() : '';

    if (!id || !code) {
        return null;
    }

    return {
        id,
        code,
        name: name.length > 0 ? name : code,
    };
}

function normalizeOfferedCourseTypes(raw: unknown): OfferedCourseType[] {
    if (!Array.isArray(raw)) {
        return [];
    }

    return raw
        .map((item) => normalizeOfferedCourseType(item))
        .filter(
            (courseType): courseType is OfferedCourseType =>
                courseType !== null,
        );
}

function readSettingsRecord(
    schoolRecord: Record<string, unknown>,
): Record<string, unknown> | null {
    const settings = schoolRecord.settings;

    if (!settings || typeof settings !== 'object') {
        return null;
    }

    return settings as Record<string, unknown>;
}

/** Obsługa camelCase, snake_case i listy w `settings` (DTO z GET `/driving-schools`). */
function readOfferedCourseTypesRaw(
    schoolRecord: Record<string, unknown>,
): unknown {
    if ('offeredCourseTypes' in schoolRecord) {
        return schoolRecord.offeredCourseTypes;
    }

    if ('offered_course_types' in schoolRecord) {
        return schoolRecord.offered_course_types;
    }

    const settings = readSettingsRecord(schoolRecord);

    if (!settings) {
        return undefined;
    }

    if ('offeredCourseTypes' in settings) {
        return settings.offeredCourseTypes;
    }

    if ('offered_course_types' in settings) {
        return settings.offered_course_types;
    }

    return undefined;
}

function readEnabledCourseKindsRaw(
    schoolRecord: Record<string, unknown>,
): unknown {
    if ('enabledCourseKinds' in schoolRecord) {
        return schoolRecord.enabledCourseKinds;
    }

    if ('enabled_course_kinds' in schoolRecord) {
        return schoolRecord.enabled_course_kinds;
    }

    const settings = readSettingsRecord(schoolRecord);

    if (!settings) {
        return undefined;
    }

    if ('enabledCourseKinds' in settings) {
        return settings.enabledCourseKinds;
    }

    if ('enabled_course_kinds' in settings) {
        return settings.enabled_course_kinds;
    }

    return undefined;
}

function normalizeEnabledCourseKindsList(raw: unknown): CourseKind[] {
    if (!Array.isArray(raw)) {
        return [];
    }

    const out: CourseKind[] = [];

    for (const item of raw) {
        const courseKind =
            typeof item === 'string'
                ? item.trim()
                : item == null
                  ? ''
                  : String(item).trim();

        if (
            courseKind &&
            isCourseKind(courseKind) &&
            !out.includes(courseKind)
        ) {
            out.push(courseKind);
        }
    }

    return out;
}

export function normalizeDrivingSchoolsList(data: unknown): DrivingSchool[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeDrivingSchool(item))
            .filter((school): school is DrivingSchool => school !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['items', 'drivingSchools', 'schools', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeDrivingSchoolsList(nested);
        }
    }

    return [];
}

export function normalizeDrivingSchool(item: unknown): DrivingSchool | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const schoolRecord = item as Record<string, unknown>;
    const id = schoolRecord.id != null ? String(schoolRecord.id) : '';
    const name = schoolRecord.name != null ? String(schoolRecord.name) : '';

    if (!id || !name) {
        return null;
    }

    let isDefault: boolean | undefined;

    if (typeof schoolRecord.isDefault === 'boolean') {
        isDefault = schoolRecord.isDefault;
    } else if (typeof schoolRecord.is_default === 'boolean') {
        isDefault = schoolRecord.is_default;
    } else if (typeof schoolRecord.default === 'boolean') {
        isDefault = schoolRecord.default;
    }

    const offeredRaw = readOfferedCourseTypesRaw(schoolRecord);
    const hasOffered = offeredRaw !== undefined;
    const offeredCourseTypes = hasOffered
        ? normalizeOfferedCourseTypes(offeredRaw)
        : undefined;

    const enabledRaw = readEnabledCourseKindsRaw(schoolRecord);
    const hasEnabledKinds = enabledRaw !== undefined;
    const enabledCourseKinds = hasEnabledKinds
        ? normalizeEnabledCourseKindsList(enabledRaw)
        : undefined;

    return {
        id,
        name,
        city: schoolRecord.city != null ? String(schoolRecord.city) : null,
        address:
            schoolRecord.address != null ? String(schoolRecord.address) : null,
        ...(isDefault !== undefined ? { isDefault } : {}),
        ...(offeredCourseTypes !== undefined ? { offeredCourseTypes } : {}),
        ...(enabledCourseKinds !== undefined ? { enabledCourseKinds } : {}),
    };
}
