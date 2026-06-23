<script setup lang="ts">
import type { DrivingSchool } from '~/types/drivingSchool';

export interface StudentRegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    schoolId: string;
}

interface Props {
    open: boolean;
    schools: readonly DrivingSchool[];
    isSchoolsLoading: boolean;
    schoolsLoadError: string | null;
    isSaving: boolean;
    apiError: string | null;
    prefillSchoolId: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    submit: [payload: StudentRegisterPayload];
}>();

const DESCRIPTION_ID = 'student-form-dialog-desc';

const emailModel = ref('');
const passwordModel = ref('');
const firstNameModel = ref('');
const lastNameModel = ref('');
const schoolIdModel = ref('');

const showEmailRequired = ref(false);
const showEmailInvalid = ref(false);
const showPasswordRequired = ref(false);
const showPasswordTooShort = ref(false);
const showFirstRequired = ref(false);
const showLastRequired = ref(false);
const showSchoolRequired = ref(false);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 6;
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

function applyDefaultSchoolId() {
    const pre = props.prefillSchoolId;

    if (pre && isUuid(pre)) {
        const exists = props.schools.some((s) => s.id === pre);

        if (exists) {
            schoolIdModel.value = pre;

            return;
        }
    }

    if (props.schools.length === 1) {
        const only = props.schools[0];

        if (only) schoolIdModel.value = only.id;
    }
}

function resetValidationAndFields() {
    emailModel.value = '';
    passwordModel.value = '';
    firstNameModel.value = '';
    lastNameModel.value = '';
    schoolIdModel.value = '';
    showEmailRequired.value = false;
    showEmailInvalid.value = false;
    showPasswordRequired.value = false;
    showPasswordTooShort.value = false;
    showFirstRequired.value = false;
    showLastRequired.value = false;
    showSchoolRequired.value = false;
}

watch(
    () => props.open,
    (open) => {
        if (!open) return;

        resetValidationAndFields();
        applyDefaultSchoolId();
    },
);

watch(
    () => props.isSchoolsLoading,
    (loading) => {
        if (!props.open || loading) return;

        if (schoolIdModel.value !== '') return;

        applyDefaultSchoolId();
    },
);

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handleCancel() {
    emit('update:open', false);
}

function handleFormSubmit() {
    if (props.isSaving) return;

    const email = emailModel.value.trim();
    const password = passwordModel.value;
    const firstName = firstNameModel.value.trim();
    const lastName = lastNameModel.value.trim();
    const schoolId = schoolIdModel.value.trim();

    showEmailRequired.value = email.length === 0;
    showEmailInvalid.value = email.length > 0 && !EMAIL_RE.test(email);
    showPasswordRequired.value = password.length === 0;
    showPasswordTooShort.value =
        password.length > 0 && password.length < PASSWORD_MIN;
    showFirstRequired.value = firstName.length === 0;
    showLastRequired.value = lastName.length === 0;
    showSchoolRequired.value = !schoolId || !isUuid(schoolId);

    if (
        showEmailRequired.value ||
        showEmailInvalid.value ||
        showPasswordRequired.value ||
        showPasswordTooShort.value ||
        showFirstRequired.value ||
        showLastRequired.value ||
        showSchoolRequired.value
    ) {
        return;
    }

    emit('submit', {
        email,
        password,
        firstName,
        lastName,
        schoolId,
    });
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="true"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Nowy kursant</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Konto powstaje przez rejestrację z rolą STUDENT w wybranej
                    OSK (upstream
                    <span class="font-mono">POST /auth/register</span>).
                </UiDialogDescription>
            </UiDialogHeader>

            <p
                v-if="schoolsLoadError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ schoolsLoadError }}
            </p>

            <p
                v-else-if="isSchoolsLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie listy OSK…
            </p>

            <form
                v-else
                class="space-y-4"
                novalidate
                @submit.prevent="handleFormSubmit"
            >
                <p
                    v-if="apiError"
                    class="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {{ apiError }}
                </p>

                <div class="space-y-2">
                    <UiLabel for="student-dialog-school">Szkoła jazdy</UiLabel>
                    <UiSelect v-model="schoolIdModel" :disabled="isSaving">
                        <UiSelectTrigger
                            id="student-dialog-school"
                            class="w-full"
                            :aria-invalid="showSchoolRequired"
                            :aria-describedby="
                                showSchoolRequired
                                    ? 'student-dialog-school-error'
                                    : undefined
                            "
                            aria-label="Wybierz szkołę jazdy dla kursanta"
                        >
                            <UiSelectValue placeholder="— Wybierz OSK —" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="s in schools"
                                    :key="s.id"
                                    :value="s.id"
                                >
                                    {{ s.name
                                    }}{{ s.city ? ` (${s.city})` : '' }}
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                    <p
                        v-if="showSchoolRequired"
                        id="student-dialog-school-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        Wybierz szkołę jazdy.
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="student-dialog-email">E-mail</UiLabel>
                    <UiInput
                        id="student-dialog-email"
                        v-model="emailModel"
                        type="email"
                        name="email"
                        autocomplete="email"
                        :aria-invalid="showEmailRequired || showEmailInvalid"
                        :aria-describedby="
                            showEmailRequired || showEmailInvalid
                                ? 'student-dialog-email-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="showEmailRequired || showEmailInvalid"
                        id="student-dialog-email-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{
                            showEmailRequired
                                ? 'E-mail jest wymagany.'
                                : 'Podaj poprawny adres e-mail.'
                        }}
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="student-dialog-password">Hasło</UiLabel>
                    <UiInput
                        id="student-dialog-password"
                        v-model="passwordModel"
                        type="password"
                        name="password"
                        autocomplete="new-password"
                        :aria-invalid="
                            showPasswordRequired || showPasswordTooShort
                        "
                        :aria-describedby="
                            showPasswordRequired || showPasswordTooShort
                                ? 'student-dialog-password-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="showPasswordRequired || showPasswordTooShort"
                        id="student-dialog-password-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{
                            showPasswordRequired
                                ? 'Hasło jest wymagane.'
                                : `Minimum ${PASSWORD_MIN} znaków.`
                        }}
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="student-dialog-first-name">Imię</UiLabel>
                    <UiInput
                        id="student-dialog-first-name"
                        v-model="firstNameModel"
                        type="text"
                        name="firstName"
                        autocomplete="given-name"
                        :aria-invalid="showFirstRequired"
                        :aria-describedby="
                            showFirstRequired
                                ? 'student-dialog-first-name-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="showFirstRequired"
                        id="student-dialog-first-name-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        Imię jest wymagane.
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="student-dialog-last-name">Nazwisko</UiLabel>
                    <UiInput
                        id="student-dialog-last-name"
                        v-model="lastNameModel"
                        type="text"
                        name="lastName"
                        autocomplete="family-name"
                        :aria-invalid="showLastRequired"
                        :aria-describedby="
                            showLastRequired
                                ? 'student-dialog-last-name-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="showLastRequired"
                        id="student-dialog-last-name-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        Nazwisko jest wymagane.
                    </p>
                </div>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isSaving"
                        @click="handleCancel"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton type="submit" :disabled="isSaving">
                        {{ isSaving ? 'Tworzenie konta…' : 'Utwórz kursanta' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
