import type { DrivingSchool } from '~/types/schools/drivingSchool';

export interface InstructorRegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    schoolId: string;
}

interface UseManagerInstructorFormDialogInput {
    open: boolean;
    schools: readonly DrivingSchool[];
    isSchoolsLoading: boolean;
    isSaving: boolean;
    prefillSchoolId: string | null;
}

export interface InstructorFormValidationState {
    showEmailRequired: boolean;
    showEmailInvalid: boolean;
    showPasswordRequired: boolean;
    showPasswordTooShort: boolean;
    showFirstRequired: boolean;
    showLastRequired: boolean;
    showLicenseRequired: boolean;
    showSchoolRequired: boolean;
}

export interface InstructorFormDraft {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    schoolId: string;
}

export const MANAGER_INSTRUCTOR_PASSWORD_MIN = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isManagerInstructorFormUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

export function getManagerInstructorDefaultSchoolId(options: {
    prefillSchoolId: string | null;
    schools: readonly DrivingSchool[];
}): string {
    const prefill = options.prefillSchoolId;

    if (prefill && isManagerInstructorFormUuid(prefill)) {
        const exists = options.schools.some((school) => school.id === prefill);

        if (exists) {
            return prefill;
        }
    }

    if (options.schools.length === 1) {
        return options.schools[0]?.id ?? '';
    }

    return '';
}

export function createEmptyInstructorFormValidationState(): InstructorFormValidationState {
    return {
        showEmailRequired: false,
        showEmailInvalid: false,
        showPasswordRequired: false,
        showPasswordTooShort: false,
        showFirstRequired: false,
        showLastRequired: false,
        showLicenseRequired: false,
        showSchoolRequired: false,
    };
}

export function validateManagerInstructorFormDraft(
    draft: InstructorFormDraft,
): {
    payload: InstructorRegisterPayload | null;
    validation: InstructorFormValidationState;
} {
    const email = draft.email.trim();
    const password = draft.password;
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();
    const licenseNumber = draft.licenseNumber.trim();
    const schoolId = draft.schoolId.trim();

    const validation: InstructorFormValidationState = {
        showEmailRequired: email.length === 0,
        showEmailInvalid: email.length > 0 && !EMAIL_RE.test(email),
        showPasswordRequired: password.length === 0,
        showPasswordTooShort:
            password.length > 0 &&
            password.length < MANAGER_INSTRUCTOR_PASSWORD_MIN,
        showFirstRequired: firstName.length === 0,
        showLastRequired: lastName.length === 0,
        showLicenseRequired: licenseNumber.length === 0,
        showSchoolRequired:
            schoolId.length === 0 || !isManagerInstructorFormUuid(schoolId),
    };

    const hasError = Object.values(validation).some(Boolean);

    if (hasError) {
        return { payload: null, validation };
    }

    return {
        payload: {
            email,
            password,
            firstName,
            lastName,
            licenseNumber,
            schoolId,
        },
        validation,
    };
}

export function useManagerInstructorFormDialog(
    input: UseManagerInstructorFormDialogInput,
) {
    const emailModel = ref('');
    const passwordModel = ref('');
    const firstNameModel = ref('');
    const lastNameModel = ref('');
    const licenseNumberModel = ref('');
    const schoolIdModel = ref('');

    const validation = reactive(createEmptyInstructorFormValidationState());

    function applyValidation(next: InstructorFormValidationState): void {
        Object.assign(validation, next);
    }

    function applyDefaultSchoolId(): void {
        schoolIdModel.value = getManagerInstructorDefaultSchoolId({
            prefillSchoolId: input.prefillSchoolId,
            schools: input.schools,
        });
    }

    function resetValidationAndFields(): void {
        emailModel.value = '';
        passwordModel.value = '';
        firstNameModel.value = '';
        lastNameModel.value = '';
        licenseNumberModel.value = '';
        schoolIdModel.value = '';
        applyValidation(createEmptyInstructorFormValidationState());
    }

    function validate(): InstructorRegisterPayload | null {
        if (input.isSaving) {
            return null;
        }

        const result = validateManagerInstructorFormDraft({
            email: emailModel.value,
            password: passwordModel.value,
            firstName: firstNameModel.value,
            lastName: lastNameModel.value,
            licenseNumber: licenseNumberModel.value,
            schoolId: schoolIdModel.value,
        });

        applyValidation(result.validation);

        return result.payload;
    }

    watch(
        () => input.open,
        (open) => {
            if (!open) return;

            resetValidationAndFields();
            applyDefaultSchoolId();
        },
    );

    watch(
        () => input.isSchoolsLoading,
        (loading) => {
            if (!input.open || loading) return;

            if (schoolIdModel.value !== '') return;

            applyDefaultSchoolId();
        },
    );

    return {
        emailModel,
        firstNameModel,
        lastNameModel,
        licenseNumberModel,
        passwordModel,
        schoolIdModel,
        validation,
        validate,
    };
}
