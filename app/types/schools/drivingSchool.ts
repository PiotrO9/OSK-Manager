import type { CourseKind } from '~/types/courses/course';

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

function isCourseKind(value: string): value is CourseKind {
    return (
        value === 'THEORY_GROUP' || value === 'PRACTICAL' || value === 'EXTRA'
    );
}

function normalizeOfferedCourseType(item: unknown): OfferedCourseType | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const o = item as Record<string, unknown>;

    const nested =
        o.courseType && typeof o.courseType === 'object'
            ? (o.courseType as Record<string, unknown>)
            : null;

    const src = nested ?? o;

    const idRaw =
        src.id ?? src.courseTypeId ?? src.course_type_id ?? o.courseTypeId;
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
        .filter((x): x is OfferedCourseType => x !== null);
}

function readSettingsRecord(
    o: Record<string, unknown>,
): Record<string, unknown> | null {
    const settings = o.settings;

    if (!settings || typeof settings !== 'object') {
        return null;
    }

    return settings as Record<string, unknown>;
}

/** Obsługa camelCase, snake_case i listy w `settings` (DTO z GET `/driving-schools`). */
function readOfferedCourseTypesRaw(o: Record<string, unknown>): unknown {
    if ('offeredCourseTypes' in o) {
        return o.offeredCourseTypes;
    }

    if ('offered_course_types' in o) {
        return o.offered_course_types;
    }

    const settings = readSettingsRecord(o);

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

function readEnabledCourseKindsRaw(o: Record<string, unknown>): unknown {
    if ('enabledCourseKinds' in o) {
        return o.enabledCourseKinds;
    }

    if ('enabled_course_kinds' in o) {
        return o.enabled_course_kinds;
    }

    const settings = readSettingsRecord(o);

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
        const s =
            typeof item === 'string'
                ? item.trim()
                : item == null
                  ? ''
                  : String(item).trim();

        if (s && isCourseKind(s) && !out.includes(s)) {
            out.push(s);
        }
    }

    return out;
}

export function normalizeDrivingSchoolsList(data: unknown): DrivingSchool[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeDrivingSchool(item))
            .filter((x): x is DrivingSchool => x !== null);
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

    const o = item as Record<string, unknown>;
    const id = o.id != null ? String(o.id) : '';
    const name = o.name != null ? String(o.name) : '';

    if (!id || !name) {
        return null;
    }

    let isDefault: boolean | undefined;

    if (typeof o.isDefault === 'boolean') {
        isDefault = o.isDefault;
    } else if (typeof o.is_default === 'boolean') {
        isDefault = o.is_default;
    } else if (typeof o.default === 'boolean') {
        isDefault = o.default;
    }

    const offeredRaw = readOfferedCourseTypesRaw(o);
    const hasOffered = offeredRaw !== undefined;
    const offeredCourseTypes = hasOffered
        ? normalizeOfferedCourseTypes(offeredRaw)
        : undefined;

    const enabledRaw = readEnabledCourseKindsRaw(o);
    const hasEnabledKinds = enabledRaw !== undefined;
    const enabledCourseKinds = hasEnabledKinds
        ? normalizeEnabledCourseKindsList(enabledRaw)
        : undefined;

    return {
        id,
        name,
        city: o.city != null ? String(o.city) : null,
        address: o.address != null ? String(o.address) : null,
        ...(isDefault !== undefined ? { isDefault } : {}),
        ...(offeredCourseTypes !== undefined ? { offeredCourseTypes } : {}),
        ...(enabledCourseKinds !== undefined ? { enabledCourseKinds } : {}),
    };
}
