<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    buildStudentRegisterPayload,
    getEmptyStudentFormValidationState,
    hasStudentFormValidationErrors,
    resolveDefaultStudentSchoolId,
    STUDENT_PASSWORD_MIN_LENGTH,
    validateStudentFormDraft,
    type StudentRegisterPayload,
} from '~/utils/students/managerStudentFormDialog';

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

const validation = reactive(getEmptyStudentFormValidationState());

const showEmailRequired = computed(() => validation.showEmailRequired);
const showEmailInvalid = computed(() => validation.showEmailInvalid);
const showPasswordRequired = computed(() => validation.showPasswordRequired);
const showPasswordTooShort = computed(() => validation.showPasswordTooShort);
const showFirstRequired = computed(() => validation.showFirstRequired);
const showLastRequired = computed(() => validation.showLastRequired);
const showSchoolRequired = computed(() => validation.showSchoolRequired);

function applyDefaultSchoolId() {
    schoolIdModel.value = resolveDefaultStudentSchoolId(
        props.schools,
        props.prefillSchoolId,
    );
}

function resetValidationAndFields() {
    emailModel.value = '';
    passwordModel.value = '';
    firstNameModel.value = '';
    lastNameModel.value = '';
    schoolIdModel.value = '';
    Object.assign(validation, getEmptyStudentFormValidationState());
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

    const draft = {
        email: emailModel.value,
        password: passwordModel.value,
        firstName: firstNameModel.value,
        lastName: lastNameModel.value,
        schoolId: schoolIdModel.value,
    };

    Object.assign(validation, validateStudentFormDraft(draft));

    if (hasStudentFormValidationErrors(validation)) {
        return;
    }

    emit('submit', buildStudentRegisterPayload(draft));
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
                                : `Minimum ${STUDENT_PASSWORD_MIN_LENGTH} znaków.`
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
