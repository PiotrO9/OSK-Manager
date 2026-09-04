import type { RouteLocationRaw } from 'vue-router';
import type { InstructorListItem } from '~/types/instructors/instructor';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export const INSTRUCTOR_REGISTER_GENERIC_FALLBACK =
    'Nie udało się utworzyć konta instruktora.';

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
): string {
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

export function instructorInitials(instructor: InstructorListItem): string {
    const first = instructor.firstName.trim().charAt(0);
    const last = instructor.lastName.trim().charAt(0);
    const initials = `${first}${last}`.trim();

    return initials.length > 0 ? initials.toUpperCase() : 'IN';
}

export function buildInstructorDetailsRoute(
    instructor: InstructorListItem,
    activeSchoolId: string,
): RouteLocationRaw {
    const schoolId = activeSchoolId.trim();

    return {
        path: `/manager/instructors/${instructor.id}`,
        query:
            schoolId.length > 0
                ? {
                      schoolId,
                  }
                : {},
    };
}
