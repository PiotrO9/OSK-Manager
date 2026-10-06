<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type {
    InstructorFormErrors,
    InstructorFormField,
} from '~/composables/instructors/manager/useManagerInstructorForm';

defineProps<{
    schools: readonly DrivingSchool[];
    isSaving: boolean;
    fieldErrors: InstructorFormErrors;
    maxBirthDate: string;
}>();
const emit = defineEmits<{ touchField: [field: InstructorFormField] }>();

const emailModel = defineModel<string>('email', { required: true });
const passwordModel = defineModel<string>('password', { required: true });
const firstNameModel = defineModel<string>('firstName', { required: true });
const lastNameModel = defineModel<string>('lastName', { required: true });
const licenseNumberModel = defineModel<string>('licenseNumber', {
    required: true,
});
const birthDateModel = defineModel<string>('birthDate', { required: true });
const schoolIdModel = defineModel<string>('schoolId', { required: true });
const models = {
    email: emailModel,
    password: passwordModel,
    firstName: firstNameModel,
    lastName: lastNameModel,
    birthDate: birthDateModel,
    licenseNumber: licenseNumberModel,
};
const root = useTemplateRef<HTMLDivElement>('root');
const schoolOpen = ref(false);
const birthDateOpen = ref(false);
const groups: {
    title: string;
    columns: string;
    fields: {
        key: Exclude<InstructorFormField, 'schoolId'>;
        label: string;
        type?: string;
        autocomplete?: string;
    }[];
}[] = [
    {
        title: 'Dane konta',
        columns: 'sm:grid-cols-2',
        fields: [
            {
                key: 'email',
                label: 'E-mail',
                type: 'email',
                autocomplete: 'email',
            },
            {
                key: 'password',
                label: 'Hasło',
                type: 'password',
                autocomplete: 'new-password',
            },
        ],
    },
    {
        title: 'Dane instruktora',
        columns: 'sm:grid-cols-2 xl:grid-cols-4',
        fields: [
            {
                key: 'firstName',
                label: 'Imię',
                type: 'text',
                autocomplete: 'given-name',
            },
            {
                key: 'lastName',
                label: 'Nazwisko',
                type: 'text',
                autocomplete: 'family-name',
            },
            { key: 'birthDate', label: 'Data urodzenia' },
            {
                key: 'licenseNumber',
                label: 'Numer licencji',
                type: 'text',
                autocomplete: 'off',
            },
        ],
    },
];

function fieldId(field: InstructorFormField) {
    return `instructor-form-${field}`;
}

function handleOpenChange(field: 'schoolId' | 'birthDate', open: boolean) {
    if (field === 'schoolId') schoolOpen.value = open;
    else birthDateOpen.value = open;

    if (!open) emit('touchField', field);
}

function handleFocusOut(field: InstructorFormField, event: FocusEvent) {
    if (
        (field === 'schoolId' && schoolOpen.value) ||
        (field === 'birthDate' && birthDateOpen.value)
    )
        return;

    if (
        (event.currentTarget as HTMLElement).contains(
            event.relatedTarget as Node | null,
        )
    )
        return;

    emit('touchField', field);
}

async function focusField(field: InstructorFormField) {
    schoolOpen.value = false;
    birthDateOpen.value = false;
    await nextTick();
    root.value?.querySelector<HTMLElement>(`#${fieldId(field)}`)?.focus();
}

defineExpose({ focusField });
</script>

<template>
    <div ref="root" class="space-y-7">
        <div class="min-w-0">
            <div
                class="space-y-2"
                @focusout="handleFocusOut('schoolId', $event)"
            >
                <UiLabel :for="fieldId('schoolId')">Szkoła jazdy</UiLabel>
                <UiSelect
                    v-model="schoolIdModel"
                    :open="schoolOpen"
                    :disabled="isSaving"
                    @update:open="handleOpenChange('schoolId', $event)"
                >
                    <UiSelectTrigger
                        :id="fieldId('schoolId')"
                        class="w-full"
                        :aria-invalid="Boolean(fieldErrors.schoolId)"
                        :aria-describedby="
                            fieldErrors.schoolId
                                ? fieldId('schoolId') + '-error'
                                : undefined
                        "
                        aria-required="true"
                    >
                        <UiSelectValue placeholder="Wybierz OSK" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="school in schools"
                                :key="school.id"
                                :value="school.id"
                            >
                                {{ school.name
                                }}{{
                                    school.city ? ' (' + school.city + ')' : ''
                                }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
                <p
                    v-if="fieldErrors.schoolId"
                    :id="fieldId('schoolId') + '-error'"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ fieldErrors.schoolId }}
                </p>
            </div>
        </div>

        <fieldset
            v-for="group in groups"
            :key="group.title"
            class="min-w-0 space-y-4"
        >
            <legend class="text-sm font-semibold">{{ group.title }}</legend>
            <div class="grid gap-x-6 gap-y-5" :class="group.columns">
                <div
                    v-for="field in group.fields"
                    :key="field.key"
                    class="min-w-0 space-y-2"
                    @focusout="handleFocusOut(field.key, $event)"
                >
                    <UiLabel :for="fieldId(field.key)">{{
                        field.label
                    }}</UiLabel>
                    <UiDatePicker
                        v-if="field.key === 'birthDate'"
                        :id="fieldId(field.key)"
                        v-model="birthDateModel"
                        :open="birthDateOpen"
                        :max="maxBirthDate"
                        :year-range="{
                            start: 1900,
                            end: Number(maxBirthDate.slice(0, 4)),
                        }"
                        :show-today-button="false"
                        navigation-mode="month-year"
                        trigger-class="max-w-none"
                        :disabled="isSaving"
                        :aria-invalid="Boolean(fieldErrors.birthDate)"
                        :aria-describedby="
                            fieldErrors.birthDate
                                ? fieldId(field.key) + '-error'
                                : undefined
                        "
                        @update:open="handleOpenChange('birthDate', $event)"
                    />
                    <UiInput
                        v-else
                        :id="fieldId(field.key)"
                        v-model="models[field.key].value"
                        :name="field.key"
                        :type="field.type"
                        :autocomplete="field.autocomplete"
                        :disabled="isSaving"
                        aria-required="true"
                        :aria-invalid="Boolean(fieldErrors[field.key])"
                        :aria-describedby="
                            fieldErrors[field.key]
                                ? fieldId(field.key) + '-error'
                                : undefined
                        "
                    />
                    <p
                        v-if="fieldErrors[field.key]"
                        :id="fieldId(field.key) + '-error'"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ fieldErrors[field.key] }}
                    </p>
                </div>
            </div>
        </fieldset>
    </div>
</template>
