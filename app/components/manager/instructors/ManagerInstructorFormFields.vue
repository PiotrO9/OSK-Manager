<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    MANAGER_INSTRUCTOR_PASSWORD_MIN,
    type InstructorFormValidationState,
} from '~/composables/instructors/manager/useManagerInstructorFormDialog';

defineProps<{
    schools: readonly DrivingSchool[];
    isSaving: boolean;
    validation: InstructorFormValidationState;
}>();

const emailModel = defineModel<string>('email', { required: true });
const passwordModel = defineModel<string>('password', { required: true });
const firstNameModel = defineModel<string>('firstName', { required: true });
const lastNameModel = defineModel<string>('lastName', { required: true });
const licenseNumberModel = defineModel<string>('licenseNumber', {
    required: true,
});
const schoolIdModel = defineModel<string>('schoolId', { required: true });
</script>

<template>
    <div class="space-y-2">
        <UiLabel for="instructor-dialog-school">Szkoła jazdy</UiLabel>
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
                        {{ s.name }}{{ s.city ? ` (${s.city})` : '' }}
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
                validation.showEmailRequired || validation.showEmailInvalid
            "
            :aria-describedby="
                validation.showEmailRequired || validation.showEmailInvalid
                    ? 'instructor-dialog-email-error'
                    : undefined
            "
            :disabled="isSaving"
        />
        <p
            v-if="validation.showEmailRequired || validation.showEmailInvalid"
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
        <UiLabel for="instructor-dialog-last-name">Nazwisko</UiLabel>
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
        <UiLabel for="instructor-dialog-license">Numer licencji</UiLabel>
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
</template>
