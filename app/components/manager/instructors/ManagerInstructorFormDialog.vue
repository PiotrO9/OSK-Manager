<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { InstructorRegisterPayload } from '~/composables/instructors/manager/useManagerInstructorFormDialog';

export type { InstructorRegisterPayload } from '~/composables/instructors/manager/useManagerInstructorFormDialog';

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
    submit: [payload: InstructorRegisterPayload];
}>();

const DESCRIPTION_ID = 'instructor-form-dialog-desc';

const {
    emailModel,
    firstNameModel,
    lastNameModel,
    licenseNumberModel,
    passwordModel,
    schoolIdModel,
    validation,
    validate,
} = useManagerInstructorFormDialog(props);

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handleCancel() {
    emit('update:open', false);
}

function handleFormSubmit() {
    const payload = validate();

    if (!payload) {
        return;
    }

    emit('submit', payload);
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
                <UiDialogTitle>Nowy instruktor</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Konto powstaje przez rejestrację z rolą INSTRUCTOR w
                    wybranej OSK (upstream
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
                    <UiLabel for="instructor-dialog-school"
                        >Szkoła jazdy</UiLabel
                    >
                    <UiSelect v-model="schoolIdModel" :disabled="isSaving">
                        <UiSelectTrigger
                            id="instructor-dialog-school"
                            class="w-full"
                            :aria-invalid="validation.showSchoolRequired"
                            :aria-describedby="
                                validation.showSchoolRequired
                                    ? 'instructor-dialog-school-error'
                                    : undefined
                            "
                            aria-label="Wybierz szkołę jazdy dla instruktora"
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
                        v-if="validation.showSchoolRequired"
                        id="instructor-dialog-school-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        Wybierz szkołę jazdy.
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="instructor-dialog-email">E-mail</UiLabel>
                    <UiInput
                        id="instructor-dialog-email"
                        v-model="emailModel"
                        type="email"
                        name="email"
                        autocomplete="email"
                        :aria-invalid="
                            validation.showEmailRequired ||
                            validation.showEmailInvalid
                        "
                        :aria-describedby="
                            validation.showEmailRequired ||
                            validation.showEmailInvalid
                                ? 'instructor-dialog-email-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="
                            validation.showEmailRequired ||
                            validation.showEmailInvalid
                        "
                        id="instructor-dialog-email-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{
                            validation.showEmailRequired
                                ? 'E-mail jest wymagany.'
                                : 'Podaj poprawny adres e-mail.'
                        }}
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="instructor-dialog-password">Hasło</UiLabel>
                    <UiInput
                        id="instructor-dialog-password"
                        v-model="passwordModel"
                        type="password"
                        name="password"
                        autocomplete="new-password"
                        :aria-invalid="
                            validation.showPasswordRequired ||
                            validation.showPasswordTooShort
                        "
                        :aria-describedby="
                            validation.showPasswordRequired ||
                            validation.showPasswordTooShort
                                ? 'instructor-dialog-password-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="
                            validation.showPasswordRequired ||
                            validation.showPasswordTooShort
                        "
                        id="instructor-dialog-password-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{
                            validation.showPasswordRequired
                                ? 'Hasło jest wymagane.'
                                : `Minimum ${MANAGER_INSTRUCTOR_PASSWORD_MIN} znaków.`
                        }}
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="instructor-dialog-first-name">Imię</UiLabel>
                    <UiInput
                        id="instructor-dialog-first-name"
                        v-model="firstNameModel"
                        type="text"
                        name="firstName"
                        autocomplete="given-name"
                        :aria-invalid="validation.showFirstRequired"
                        :aria-describedby="
                            validation.showFirstRequired
                                ? 'instructor-dialog-first-name-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="validation.showFirstRequired"
                        id="instructor-dialog-first-name-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        Imię jest wymagane.
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="instructor-dialog-last-name"
                        >Nazwisko</UiLabel
                    >
                    <UiInput
                        id="instructor-dialog-last-name"
                        v-model="lastNameModel"
                        type="text"
                        name="lastName"
                        autocomplete="family-name"
                        :aria-invalid="validation.showLastRequired"
                        :aria-describedby="
                            validation.showLastRequired
                                ? 'instructor-dialog-last-name-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="validation.showLastRequired"
                        id="instructor-dialog-last-name-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        Nazwisko jest wymagane.
                    </p>
                </div>

                <div class="space-y-2">
                    <UiLabel for="instructor-dialog-license"
                        >Numer licencji</UiLabel
                    >
                    <UiInput
                        id="instructor-dialog-license"
                        v-model="licenseNumberModel"
                        type="text"
                        name="licenseNumber"
                        autocomplete="off"
                        :aria-invalid="validation.showLicenseRequired"
                        :aria-describedby="
                            validation.showLicenseRequired
                                ? 'instructor-dialog-license-error'
                                : undefined
                        "
                        :disabled="isSaving"
                    />
                    <p
                        v-if="validation.showLicenseRequired"
                        id="instructor-dialog-license-error"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        Numer licencji jest wymagany.
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
                        {{
                            isSaving ? 'Tworzenie konta…' : 'Utwórz instruktora'
                        }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
