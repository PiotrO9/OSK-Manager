import type { InstructorEditFormModel } from '~/types/instructors/instructor';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function getManagerInstructorRouteString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

export function displayManagerInstructorText(value: string): string {
    const text = value.trim();

    return text.length > 0 ? text : '—';
}

export function normalizeManagerInstructorCourseTypeIds(
    ids: string[],
): string[] {
    const out: string[] = [];

    for (const raw of ids) {
        const id = raw.trim();

        if (id && !out.includes(id)) {
            out.push(id);
        }
    }

    return out.sort((a, b) => a.localeCompare(b));
}

export function areSameManagerInstructorCourseTypeIds(
    left: string[],
    right: string[],
): boolean {
    const a = normalizeManagerInstructorCourseTypeIds(left);
    const b = normalizeManagerInstructorCourseTypeIds(right);

    return a.length === b.length && a.every((id, index) => id === b[index]);
}

export interface ManagerInstructorPatch {
    firstName?: string;
    lastName?: string;
    qualifications?: string;
    qualifiedCourseTypeIds?: string[];
    experienceYears?: number;
}

export function buildManagerInstructorDirtyPatch(
    form: InstructorEditFormModel | null,
    base: InstructorEditFormModel | null,
): ManagerInstructorPatch | null {
    if (!form || !base) {
        return null;
    }

    const patch: ManagerInstructorPatch = {};

    if (form.firstName.trim() !== base.firstName.trim()) {
        patch.firstName = form.firstName.trim();
    }

    if (form.lastName.trim() !== base.lastName.trim()) {
        patch.lastName = form.lastName.trim();
    }

    if (form.qualifications !== base.qualifications) {
        patch.qualifications = form.qualifications;
    }

    if (
        !areSameManagerInstructorCourseTypeIds(
            form.qualifiedCourseTypeIds,
            base.qualifiedCourseTypeIds,
        )
    ) {
        patch.qualifiedCourseTypeIds = normalizeManagerInstructorCourseTypeIds(
            form.qualifiedCourseTypeIds,
        );
    }

    if (form.experienceYears !== base.experienceYears) {
        patch.experienceYears = form.experienceYears;
    }

    return Object.keys(patch).length > 0 ? patch : null;
}

export function validateManagerInstructorPatch(
    patch: ManagerInstructorPatch,
): string | null {
    if (typeof patch.firstName === 'string' && !patch.firstName.trim()) {
        return 'Imię nie może być puste.';
    }

    if (typeof patch.lastName === 'string' && !patch.lastName.trim()) {
        return 'Nazwisko nie może być puste.';
    }

    if (typeof patch.experienceYears === 'number') {
        const years = patch.experienceYears;

        if (!Number.isInteger(years) || years < 0 || years > 80) {
            return 'Staż musi być liczbą całkowitą od 0 do 80.';
        }
    }

    return null;
}

export function getManagerInstructorNotFoundMessage(): string {
    return 'Nie znaleziono instruktora.';
}

export function getManagerInstructorGenericLoadErrorMessage(): string {
    return 'Nie udało się wczytać danych instruktora.';
}

export function getManagerInstructorGenericSaveErrorMessage(): string {
    return 'Nie udało się zapisać zmian.';
}

export function getManagerInstructorGenericCourseTypesErrorMessage(): string {
    return 'Nie udało się pobrać katalogu kategorii uprawnień.';
}

export function getManagerInstructorSaveErrorMessage(err: unknown): string {
    const status = getApiErrorStatusCode(err);
    const fromServer = getApiFetchErrorMessage(err, '').trim();

    if (status === 400) {
        return fromServer.length > 0
            ? fromServer
            : 'Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie.';
    }

    if (status === 403) {
        return fromServer.length > 0
            ? fromServer
            : 'Brak uprawnień do zapisu zmian.';
    }

    if (status === 404) {
        return fromServer.length > 0
            ? fromServer
            : getManagerInstructorNotFoundMessage();
    }

    if (status !== undefined && status >= 500) {
        return fromServer.length > 0
            ? fromServer
            : 'Błąd serwera. Spróbuj ponownie później.';
    }

    return getApiFetchErrorMessage(
        err,
        getManagerInstructorGenericSaveErrorMessage(),
    );
}

export function getManagerInstructorDeleteErrorMessage(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak uprawnień do tej operacji.';
    }

    if (status === 404) {
        return 'Instruktor nie istnieje lub został już usunięty.';
    }

    if (status === 401) {
        return getApiFetchErrorMessage(err, 'Brak autoryzacji.');
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (status === 400) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane.');
    }

    return getApiFetchErrorMessage(err, 'Nie udało się usunąć instruktora.');
}
