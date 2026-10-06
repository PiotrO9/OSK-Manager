import { computed, reactive, ref, watch, type Ref } from 'vue';
import { parseDate, today } from '@internationalized/date';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

export interface InstructorRegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    schoolId: string;
    birthDate: string;
}

interface UseManagerInstructorFormInput {
    schools: Ref<DrivingSchool[]>;
    isSchoolsLoading: Ref<boolean>;
    selectedSchoolId: Ref<string>;
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
    showBirthDateRequired: boolean;
    showBirthDateInvalid: boolean;
    showBirthDateFuture: boolean;
}

export interface InstructorFormDraft {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    schoolId: string;
    birthDate: string;
}

export type InstructorFormField = keyof InstructorFormDraft;
export type InstructorFormErrors = Partial<Record<InstructorFormField, string>>;

export const INSTRUCTOR_FORM_FIELD_ORDER: readonly InstructorFormField[] = [
    'schoolId',
    'email',
    'password',
    'firstName',
    'lastName',
    'birthDate',
    'licenseNumber',
];

export function getFirstInstructorErrorField(errors: InstructorFormErrors) {
    return INSTRUCTOR_FORM_FIELD_ORDER.find((field) => Boolean(errors[field]));
}

export function getInstructorToday(): string {
    return today('Europe/Warsaw').toString();
}

export const MANAGER_INSTRUCTOR_PASSWORD_MIN = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isManagerInstructorFormUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

export function getManagerInstructorDefaultSchoolId(options: {
    selectedSchoolId: string | null;
    schools: readonly DrivingSchool[];
}): string {
    const selectedSchoolId = options.selectedSchoolId;

    if (
        selectedSchoolId &&
        options.schools.some((school) => school.id === selectedSchoolId)
    ) {
        return selectedSchoolId;
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
        showBirthDateRequired: false,
        showBirthDateInvalid: false,
        showBirthDateFuture: false,
    };
}

export function validateManagerInstructorFormDraft(
    draft: InstructorFormDraft,
    maxBirthDate = getInstructorToday(),
): {
    payload: InstructorRegisterPayload | null;
    validation: InstructorFormValidationState;
    errors: InstructorFormErrors;
} {
    const email = draft.email.trim();
    const password = draft.password;
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();
    const licenseNumber = draft.licenseNumber.trim();
    const schoolId = draft.schoolId.trim();
    const birthDate = draft.birthDate.trim();
    let birthDateInvalid = false;

    if (birthDate) {
        try {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error();

            if (parseDate(birthDate).toString() !== birthDate)
                throw new Error();
        } catch {
            birthDateInvalid = true;
        }
    }

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
        showBirthDateRequired: birthDate.length === 0,
        showBirthDateInvalid: birthDateInvalid,
        showBirthDateFuture:
            Boolean(birthDate) && !birthDateInvalid && birthDate > maxBirthDate,
    };

    const errors: InstructorFormErrors = {};

    if (validation.showSchoolRequired)
        errors.schoolId = 'Wybierz szkołę jazdy.';

    if (validation.showEmailRequired) errors.email = 'E-mail jest wymagany.';
    else if (validation.showEmailInvalid)
        errors.email = 'Podaj poprawny adres e-mail.';

    if (validation.showPasswordRequired)
        errors.password = 'Hasło jest wymagane.';
    else if (validation.showPasswordTooShort)
        errors.password = `Minimum ${MANAGER_INSTRUCTOR_PASSWORD_MIN} znaków.`;

    if (validation.showFirstRequired) errors.firstName = 'Imię jest wymagane.';

    if (validation.showLastRequired)
        errors.lastName = 'Nazwisko jest wymagane.';

    if (validation.showLicenseRequired)
        errors.licenseNumber = 'Numer licencji jest wymagany.';

    if (validation.showBirthDateRequired)
        errors.birthDate = 'Data urodzenia jest wymagana.';
    else if (validation.showBirthDateInvalid)
        errors.birthDate = 'Podaj poprawną datę urodzenia.';
    else if (validation.showBirthDateFuture)
        errors.birthDate = 'Data urodzenia nie może być w przyszłości.';

    const hasError = Object.values(validation).some(Boolean);

    if (hasError) {
        return { payload: null, validation, errors };
    }

    return {
        payload: {
            email,
            password,
            firstName,
            lastName,
            licenseNumber,
            schoolId,
            birthDate,
        },
        validation,
        errors,
    };
}

export function useManagerInstructorForm(input: UseManagerInstructorFormInput) {
    const emailModel = ref('');
    const passwordModel = ref('');
    const firstNameModel = ref('');
    const lastNameModel = ref('');
    const licenseNumberModel = ref('');
    const schoolIdModel = ref('');
    const birthDateModel = ref('');
    const touched = reactive<Partial<Record<InstructorFormField, boolean>>>({});
    const submitAttempted = ref(false);
    const initialDraft = ref<InstructorFormDraft | null>(null);
    const maxBirthDate = ref(getInstructorToday());
    const draft = computed<InstructorFormDraft>(() => ({
        email: emailModel.value,
        password: passwordModel.value,
        firstName: firstNameModel.value,
        lastName: lastNameModel.value,
        licenseNumber: licenseNumberModel.value,
        schoolId: schoolIdModel.value,
        birthDate: birthDateModel.value,
    }));
    const result = computed(() =>
        validateManagerInstructorFormDraft(draft.value, maxBirthDate.value),
    );
    const fieldErrors = computed<InstructorFormErrors>(() =>
        Object.fromEntries(
            INSTRUCTOR_FORM_FIELD_ORDER.filter(
                (field) =>
                    (touched[field] || submitAttempted.value) &&
                    result.value.errors[field],
            ).map((field) => [field, result.value.errors[field]]),
        ),
    );
    const isDirty = computed(
        () =>
            initialDraft.value !== null &&
            INSTRUCTOR_FORM_FIELD_ORDER.some(
                (field) => draft.value[field] !== initialDraft.value?.[field],
            ),
    );

    function touchField(field: InstructorFormField) {
        maxBirthDate.value = getInstructorToday();
        touched[field] = true;
    }

    function markPristine() {
        initialDraft.value = { ...draft.value };
    }

    function validateForSubmit() {
        maxBirthDate.value = getInstructorToday();
        submitAttempted.value = true;

        return result.value.payload;
    }

    watch(
        input.isSchoolsLoading,
        (loading) => {
            if (
                loading ||
                initialDraft.value !== null ||
                input.schools.value.length === 0
            )
                return;

            schoolIdModel.value = getManagerInstructorDefaultSchoolId({
                selectedSchoolId: input.selectedSchoolId.value,
                schools: input.schools.value,
            });
            markPristine();
        },
        { immediate: true },
    );

    return {
        emailModel,
        firstNameModel,
        lastNameModel,
        licenseNumberModel,
        passwordModel,
        schoolIdModel,
        birthDateModel,
        draft,
        fieldErrors,
        maxBirthDate,
        isDirty,
        touchField,
        markPristine,
        validateForSubmit,
    };
}
