import type { DrivingSchool } from '~/types/schools/drivingSchool';

export interface StudentRegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    schoolId: string;
}

export interface StudentFormDraft {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    schoolId: string;
}

export interface StudentFormValidationState {
    showEmailRequired: boolean;
    showEmailInvalid: boolean;
    showPasswordRequired: boolean;
    showPasswordTooShort: boolean;
    showFirstRequired: boolean;
    showLastRequired: boolean;
    showSchoolRequired: boolean;
}

export const STUDENT_PASSWORD_MIN_LENGTH = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isStudentFormUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

export function getEmptyStudentFormValidationState(): StudentFormValidationState {
    return {
        showEmailRequired: false,
        showEmailInvalid: false,
        showPasswordRequired: false,
        showPasswordTooShort: false,
        showFirstRequired: false,
        showLastRequired: false,
        showSchoolRequired: false,
    };
}

export function resolveDefaultStudentSchoolId(
    schools: readonly DrivingSchool[],
    prefillSchoolId: string | null,
): string {
    const prefill = prefillSchoolId?.trim() ?? '';

    if (prefill && isStudentFormUuid(prefill)) {
        const exists = schools.some((school) => school.id === prefill);

        if (exists) {
            return prefill;
        }
    }

    if (schools.length === 1) {
        return schools[0]?.id ?? '';
    }

    return '';
}

export function validateStudentFormDraft(
    draft: StudentFormDraft,
): StudentFormValidationState {
    const email = draft.email.trim();
    const password = draft.password;
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();
    const schoolId = draft.schoolId.trim();

    return {
        showEmailRequired: email.length === 0,
        showEmailInvalid: email.length > 0 && !EMAIL_RE.test(email),
        showPasswordRequired: password.length === 0,
        showPasswordTooShort:
            password.length > 0 &&
            password.length < STUDENT_PASSWORD_MIN_LENGTH,
        showFirstRequired: firstName.length === 0,
        showLastRequired: lastName.length === 0,
        showSchoolRequired: !schoolId || !isStudentFormUuid(schoolId),
    };
}

export function hasStudentFormValidationErrors(
    validation: StudentFormValidationState,
): boolean {
    return Object.values(validation).some(Boolean);
}

export function buildStudentRegisterPayload(
    draft: StudentFormDraft,
): StudentRegisterPayload {
    return {
        email: draft.email.trim(),
        password: draft.password,
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        schoolId: draft.schoolId.trim(),
    };
}
