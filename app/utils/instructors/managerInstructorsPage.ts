import type { RouteLocationRaw } from 'vue-router';
import type { InstructorListItem } from '~/types/instructors/instructor';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type {
    InstructorAdvancedFilter,
    InstructorAdvancedFilterQualificationOption,
} from '~~/shared/utils/instructorAdvancedFilters';

export const INSTRUCTOR_REGISTER_GENERIC_FALLBACK =
    'Nie udało się utworzyć konta instruktora.';

export type InstructorQuickView = 'all' | 'qualified' | 'unqualified';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isInstructorSchoolIdUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

export function resolveInstructorRegisterError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak uprawnień do tej operacji.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (status === 400 || status === 409) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane lub konflikt.');
    }

    return getApiFetchErrorMessage(err, INSTRUCTOR_REGISTER_GENERIC_FALLBACK);
}

export function resolveInstructorsListError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do listy instruktorów dla wybranej szkoły.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(
        err,
        'Nie udało się pobrać listy instruktorów.',
    );
}

export function formatVisibleInstructorsLabel(count: number): string {
    if (count === 1) {
        return '1 wynik';
    }

    if (count >= 2 && count <= 4) {
        return `${count} wyniki`;
    }

    return `${count} wyników`;
}

export function formatQualificationFilterLabel(
    uniqueQualificationCodesCount: number,
    quickView: InstructorQuickView = 'all',
): string {
    if (quickView === 'qualified') {
        return 'Z kwalifikacjami';
    }

    if (quickView === 'unqualified') {
        return 'Bez kwalifikacji';
    }

    if (uniqueQualificationCodesCount === 0) {
        return 'Kwalifikacje: brak danych';
    }

    return 'Kwalifikacje: wszystkie';
}

export function instructorQualificationLabel(
    instructor: InstructorListItem,
): string {
    const labels = (instructor.qualifiedCourseTypes ?? [])
        .map((courseType) => courseType.code.trim() || courseType.name.trim())
        .filter((label) => label.length > 0);

    if (labels.length === 0) {
        return 'Brak kwalifikacji';
    }

    return labels.join(', ');
}

function normalizeInstructorFilterValue(value: string): string {
    return value.trim().toLocaleLowerCase('pl');
}

function instructorSearchHaystack(instructor: InstructorListItem): string {
    const qualificationTokens = (instructor.qualifiedCourseTypes ?? []).flatMap(
        (courseType) => [courseType.code, courseType.name],
    );

    return normalizeInstructorFilterValue(
        [
            instructor.firstName,
            instructor.lastName,
            instructor.email,
            instructor.phone ?? '',
            ...qualificationTokens,
        ].join(' '),
    );
}

export function filterInstructorsForList(
    instructors: InstructorListItem[],
    search: string,
    quickView: InstructorQuickView,
    advancedFilters: readonly InstructorAdvancedFilter[] = [],
): InstructorListItem[] {
    const searchTerms = normalizeInstructorFilterValue(search)
        .split(/\s+/)
        .filter((term) => term.length > 0);

    return instructors.filter((instructor) => {
        const hasQualifications =
            (instructor.qualifiedCourseTypes ?? []).length > 0;

        if (quickView === 'qualified' && !hasQualifications) {
            return false;
        }

        if (quickView === 'unqualified' && hasQualifications) {
            return false;
        }

        if (searchTerms.length === 0 && advancedFilters.length === 0) {
            return true;
        }

        if (searchTerms.length > 0) {
            const haystack = instructorSearchHaystack(instructor);

            if (!searchTerms.every((term) => haystack.includes(term))) {
                return false;
            }
        }

        return advancedFilters.every((filter) =>
            instructorMatchesAdvancedFilter(instructor, filter),
        );
    });
}

function instructorMatchesAdvancedFilter(
    instructor: InstructorListItem,
    filter: InstructorAdvancedFilter,
): boolean {
    if (filter.field === 'hasQualifications') {
        const hasQualifications =
            (instructor.qualifiedCourseTypes ?? []).length > 0;

        return filter.value ? hasQualifications : !hasQualifications;
    }

    if (filter.field === 'qualification') {
        const qualificationIds = new Set(
            (instructor.qualifiedCourseTypes ?? []).map(
                (courseType) => courseType.id,
            ),
        );
        const hasQualification = qualificationIds.has(filter.value);

        return filter.operator === 'eq' ? hasQualification : !hasQualification;
    }

    const rawValue =
        filter.field === 'email' ? instructor.email : (instructor.phone ?? '');
    const instructorValue = normalizeInstructorFilterValue(rawValue);

    if (filter.operator === 'is_empty') {
        return instructorValue.length === 0;
    }

    if (filter.operator === 'is_not_empty') {
        return instructorValue.length > 0;
    }

    const filterValue = normalizeInstructorFilterValue(filter.value ?? '');

    if (filter.operator === 'contains') {
        return instructorValue.includes(filterValue);
    }

    if (filter.operator === 'not_contains') {
        return !instructorValue.includes(filterValue);
    }

    if (filter.operator === 'eq') {
        return instructorValue === filterValue;
    }

    return instructorValue !== filterValue;
}

export function getInstructorQualificationOptions(
    instructors: readonly InstructorListItem[],
): InstructorAdvancedFilterQualificationOption[] {
    const map = new Map<string, InstructorAdvancedFilterQualificationOption>();

    for (const instructor of instructors) {
        for (const courseType of instructor.qualifiedCourseTypes ?? []) {
            const id = courseType.id.trim();
            const code = courseType.code.trim();

            if (!id || !code || map.has(id)) {
                continue;
            }

            map.set(id, {
                id,
                code,
                name: courseType.name.trim() || code,
            });
        }
    }

    return [...map.values()].sort((a, b) => {
        const byCode = a.code.localeCompare(b.code, 'pl');

        return byCode !== 0 ? byCode : a.id.localeCompare(b.id);
    });
}

export function instructorInitials(instructor: InstructorListItem): string {
    const first = instructor.firstName.trim().charAt(0);
    const last = instructor.lastName.trim().charAt(0);
    const initials = `${first}${last}`.trim();

    return initials.length > 0 ? initials.toUpperCase() : 'IN';
}

export function buildInstructorDetailsRoute(
    instructor: InstructorListItem,
    _activeSchoolId: string,
): RouteLocationRaw {
    return {
        path: `/manager/instructors/${instructor.id}`,
    };
}
