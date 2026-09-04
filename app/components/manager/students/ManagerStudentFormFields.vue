<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    STUDENT_PASSWORD_MIN_LENGTH,
    type StudentFormValidationState,
} from '~/utils/students/managerStudentFormDialog';

defineProps<{
    schools: readonly DrivingSchool[];
    isSaving: boolean;
    validation: StudentFormValidationState;
}>();

const emailModel = defineModel<string>('email', { required: true });
const passwordModel = defineModel<string>('password', { required: true });
const firstNameModel = defineModel<string>('firstName', { required: true });
const lastNameModel = defineModel<string>('lastName', { required: true });
const schoolIdModel = defineModel<string>('schoolId', { required: true });
</script>

<template>
    <div class="space-y-2">
        <UiLabel for="student-dialog-school">Szkoła jazdy</UiLabel>
        <UiSelect v-model="schoolIdModel" :disabled="isSaving">
            <UiSelectTrigger
                id="student-dialog-school"
                class="w-full"
                :aria-invalid="validation.showSchoolRequired"
                :aria-describedby="
                    validation.showSchoolRequired
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
                        {{ s.name }}{{ s.city ? ` (${s.city})` : '' }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <p
            v-if="validation.showSchoolRequired"
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
            :aria-invalid="
                validation.showEmailRequired || validation.showEmailInvalid
            "
            :aria-describedby="
                validation.showEmailRequired || validation.showEmailInvalid
                    ? 'student-dialog-email-error'
                    : undefined
            "
            :disabled="isSaving"
        />
        <p
            v-if="validation.showEmailRequired || validation.showEmailInvalid"
            id="student-dialog-email-error"
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
        <UiLabel for="student-dialog-password">Hasło</UiLabel>
        <UiInput
            id="student-dialog-password"
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
                    ? 'student-dialog-password-error'
                    : undefined
            "
            :disabled="isSaving"
        />
        <p
            v-if="
                validation.showPasswordRequired ||
                validation.showPasswordTooShort
            "
            id="student-dialog-password-error"
            class="text-destructive text-sm"
            role="alert"
        >
            {{
                validation.showPasswordRequired
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
            :aria-invalid="validation.showFirstRequired"
            :aria-describedby="
                validation.showFirstRequired
                    ? 'student-dialog-first-name-error'
                    : undefined
            "
            :disabled="isSaving"
        />
        <p
            v-if="validation.showFirstRequired"
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
            :aria-invalid="validation.showLastRequired"
            :aria-describedby="
                validation.showLastRequired
                    ? 'student-dialog-last-name-error'
                    : undefined
            "
            :disabled="isSaving"
        />
        <p
            v-if="validation.showLastRequired"
            id="student-dialog-last-name-error"
            class="text-destructive text-sm"
            role="alert"
        >
            Nazwisko jest wymagane.
        </p>
    </div>
</template>
