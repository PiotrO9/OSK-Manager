<script setup lang="ts">
import type {
    InstructorAdvancedFilterDraft,
    InstructorAdvancedFilterField,
    InstructorAdvancedFilterQualificationOption,
} from '~~/shared/utils/instructorAdvancedFilters';
import {
    buildInstructorAdvancedFilterFromDraft,
    getInstructorAdvancedFilterConditions,
    getInstructorAdvancedFilterDraftForConditionChange,
    getInstructorAdvancedFilterDraftForFieldChange,
    instructorAdvancedFilterFieldConfigs,
    instructorAdvancedFilterRequiresValue,
} from '~~/shared/utils/instructorAdvancedFilters';

const props = defineProps<{
    draft: InstructorAdvancedFilterDraft;
    qualifications: readonly InstructorAdvancedFilterQualificationOption[];
    disabled?: boolean;
    error?: string | null;
}>();

const emit = defineEmits<{
    updateDraft: [value: InstructorAdvancedFilterDraft];
    apply: [];
    cancel: [];
}>();

const conditions = computed(() =>
    getInstructorAdvancedFilterConditions(props.draft.field),
);

const requiresValue = computed(() =>
    instructorAdvancedFilterRequiresValue(
        props.draft.field,
        props.draft.condition,
    ),
);

const canSubmit = computed(() =>
    Boolean(buildInstructorAdvancedFilterFromDraft(props.draft)),
);

const textValue = computed(() =>
    typeof props.draft.value === 'string' ? props.draft.value : '',
);

function emitDraft(patch: Partial<InstructorAdvancedFilterDraft>): void {
    emit('updateDraft', { ...props.draft, ...patch });
}

function handleFieldUpdate(value: unknown): void {
    const field = String(value) as InstructorAdvancedFilterField;

    if (
        !instructorAdvancedFilterFieldConfigs.some(
            (item) => item.value === field,
        )
    ) {
        return;
    }

    emit(
        'updateDraft',
        getInstructorAdvancedFilterDraftForFieldChange(props.draft, field),
    );
}

function handleConditionUpdate(value: unknown): void {
    const condition = String(value);
    const nextDraft = getInstructorAdvancedFilterDraftForConditionChange(
        props.draft,
        condition,
    );

    if (!nextDraft) {
        return;
    }

    emit('updateDraft', nextDraft);
}

function qualificationLabel(
    item: InstructorAdvancedFilterQualificationOption,
): string {
    const code = item.code.trim();
    const name = item.name.trim();

    if (!name || name === code) {
        return code;
    }

    return `${code} - ${name}`;
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="emit('apply')">
        <div class="grid gap-2">
            <UiLabel for="instructor-advanced-filter-field">Pole</UiLabel>
            <UiSelect
                :model-value="draft.field"
                :disabled="disabled"
                @update:model-value="handleFieldUpdate"
            >
                <UiSelectTrigger
                    id="instructor-advanced-filter-field"
                    class="h-11 w-full"
                >
                    <UiSelectValue placeholder="Wybierz pole" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="field in instructorAdvancedFilterFieldConfigs"
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
            <UiLabel for="instructor-advanced-filter-condition">
                Warunek
            </UiLabel>
            <UiSelect
                :model-value="draft.condition"
                :disabled="disabled"
                @update:model-value="handleConditionUpdate"
            >
                <UiSelectTrigger
                    id="instructor-advanced-filter-condition"
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
            v-if="requiresValue && draft.field === 'qualification'"
            class="grid gap-2"
        >
            <UiLabel for="instructor-advanced-filter-qualification">
                Wartość
            </UiLabel>
            <UiSelect
                :model-value="textValue"
                :disabled="disabled || qualifications.length === 0"
                @update:model-value="emitDraft({ value: String($event) })"
            >
                <UiSelectTrigger
                    id="instructor-advanced-filter-qualification"
                    class="h-11 w-full"
                >
                    <UiSelectValue placeholder="Wybierz kwalifikację" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="qualification in qualifications"
                            :key="qualification.id"
                            :value="qualification.id"
                        >
                            {{ qualificationLabel(qualification) }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <div v-else-if="requiresValue" class="grid gap-2">
            <UiLabel for="instructor-advanced-filter-text">Wartość</UiLabel>
            <UiInput
                id="instructor-advanced-filter-text"
                :model-value="textValue"
                :disabled="disabled"
                maxlength="120"
                autocomplete="off"
                class="h-11"
                @update:model-value="emitDraft({ value: String($event) })"
            />
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
