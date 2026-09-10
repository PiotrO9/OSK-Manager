<script setup lang="ts">
import type {
    StudentAdvancedFilterCourseOption,
    StudentAdvancedFilterDraft,
    StudentAdvancedFilterField,
} from '~~/shared/utils/studentAdvancedFilters';
import {
    buildStudentAdvancedFilterFromDraft,
    getStudentAdvancedFilterDraftForConditionChange,
    getStudentAdvancedFilterDraftForFieldChange,
    getStudentAdvancedFilterConditions,
    studentAdvancedFilterFieldConfigs,
    studentAdvancedFilterRequiresValue,
} from '~~/shared/utils/studentAdvancedFilters';

const props = defineProps<{
    draft: StudentAdvancedFilterDraft;
    courses: readonly StudentAdvancedFilterCourseOption[];
    disabled?: boolean;
    error?: string | null;
}>();

const emit = defineEmits<{
    updateDraft: [value: StudentAdvancedFilterDraft];
    apply: [];
    cancel: [];
}>();

const conditions = computed(() =>
    getStudentAdvancedFilterConditions(props.draft.field),
);

const selectedCondition = computed(
    () =>
        conditions.value.find((item) => item.value === props.draft.condition) ??
        conditions.value[0] ??
        null,
);

const requiresValue = computed(() =>
    studentAdvancedFilterRequiresValue(
        props.draft.field,
        props.draft.condition,
    ),
);

const canSubmit = computed(() =>
    Boolean(buildStudentAdvancedFilterFromDraft(props.draft)),
);

const textValue = computed(() =>
    typeof props.draft.value === 'string' ? props.draft.value : '',
);

const booleanValue = computed(() =>
    typeof props.draft.value === 'boolean' ? String(props.draft.value) : 'true',
);

function emitDraft(patch: Partial<StudentAdvancedFilterDraft>): void {
    emit('updateDraft', { ...props.draft, ...patch });
}

function handleFieldUpdate(value: unknown): void {
    const field = String(value) as StudentAdvancedFilterField;

    if (
        !studentAdvancedFilterFieldConfigs.some((item) => item.value === field)
    ) {
        return;
    }

    emit(
        'updateDraft',
        getStudentAdvancedFilterDraftForFieldChange(props.draft, field),
    );
}

function handleConditionUpdate(value: unknown): void {
    const condition = String(value);
    const nextDraft = getStudentAdvancedFilterDraftForConditionChange(
        props.draft,
        condition,
    );

    if (!nextDraft) {
        return;
    }

    emit('updateDraft', nextDraft);
}

function handleBooleanUpdate(value: unknown): void {
    emitDraft({ value: String(value) === 'true' });
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="emit('apply')">
        <div class="grid gap-2">
            <UiLabel for="student-advanced-filter-field">Pole</UiLabel>
            <UiSelect
                :model-value="draft.field"
                :disabled="disabled"
                @update:model-value="handleFieldUpdate"
            >
                <UiSelectTrigger
                    id="student-advanced-filter-field"
                    class="h-11 w-full"
                >
                    <UiSelectValue placeholder="Wybierz pole" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="field in studentAdvancedFilterFieldConfigs"
                            :key="field.value"
                            :value="field.value"
                        >
                            {{ field.label }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <div class="grid gap-2">
            <UiLabel for="student-advanced-filter-condition">Warunek</UiLabel>
            <UiSelect
                :model-value="draft.condition"
                :disabled="disabled"
                @update:model-value="handleConditionUpdate"
            >
                <UiSelectTrigger
                    id="student-advanced-filter-condition"
                    class="h-11 w-full"
                >
                    <UiSelectValue placeholder="Wybierz warunek" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="condition in conditions"
                            :key="condition.value"
                            :value="condition.value"
                        >
                            {{ condition.label }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <div
            v-if="
                requiresValue &&
                draft.field !== 'isActive' &&
                draft.field !== 'courseId' &&
                draft.field !== 'createdAt'
            "
            class="grid gap-2"
        >
            <UiLabel for="student-advanced-filter-text">Wartość</UiLabel>
            <UiInput
                id="student-advanced-filter-text"
                :model-value="textValue"
                :disabled="disabled"
                maxlength="120"
                autocomplete="off"
                class="h-11"
                @update:model-value="emitDraft({ value: String($event) })"
            />
        </div>

        <div
            v-else-if="requiresValue && draft.field === 'isActive'"
            class="grid gap-2"
        >
            <UiLabel for="student-advanced-filter-active">Wartość</UiLabel>
            <UiSelect
                :model-value="booleanValue"
                :disabled="disabled"
                @update:model-value="handleBooleanUpdate"
            >
                <UiSelectTrigger
                    id="student-advanced-filter-active"
                    class="h-11 w-full"
                >
                    <UiSelectValue />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem value="true">Aktywny</UiSelectItem>
                        <UiSelectItem value="false">Nieaktywny</UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <div
            v-else-if="requiresValue && draft.field === 'courseId'"
            class="grid gap-2"
        >
            <UiLabel for="student-advanced-filter-course">Wartość</UiLabel>
            <UiSelect
                :model-value="textValue"
                :disabled="disabled || courses.length === 0"
                @update:model-value="emitDraft({ value: String($event) })"
            >
                <UiSelectTrigger
                    id="student-advanced-filter-course"
                    class="h-11 w-full"
                >
                    <UiSelectValue placeholder="Wybierz kurs" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="course in courses"
                            :key="course.id"
                            :value="course.id"
                        >
                            {{ course.name
                            }}{{
                                course.category ? ` (${course.category})` : ''
                            }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <div
            v-else-if="requiresValue && draft.field === 'createdAt'"
            class="grid gap-3"
        >
            <div class="grid gap-2">
                <UiLabel for="student-advanced-filter-date-from">
                    {{
                        selectedCondition?.value === 'between'
                            ? 'Data od'
                            : 'Data'
                    }}
                </UiLabel>
                <UiInput
                    id="student-advanced-filter-date-from"
                    :model-value="textValue"
                    :disabled="disabled"
                    type="date"
                    class="h-11"
                    @update:model-value="emitDraft({ value: String($event) })"
                />
            </div>
            <div
                v-if="selectedCondition?.value === 'between'"
                class="grid gap-2"
            >
                <UiLabel for="student-advanced-filter-date-to">Data do</UiLabel>
                <UiInput
                    id="student-advanced-filter-date-to"
                    :model-value="draft.valueTo ?? ''"
                    :disabled="disabled"
                    type="date"
                    class="h-11"
                    @update:model-value="emitDraft({ valueTo: String($event) })"
                />
            </div>
        </div>

        <p
            v-if="error"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ error }}
        </p>

        <div
            class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"
        >
            <UiButton
                type="button"
                variant="outline"
                :disabled="disabled"
                @click="emit('cancel')"
            >
                Anuluj
            </UiButton>
            <UiButton type="submit" :disabled="disabled || !canSubmit">
                Zastosuj filtr
            </UiButton>
        </div>
    </form>
</template>
