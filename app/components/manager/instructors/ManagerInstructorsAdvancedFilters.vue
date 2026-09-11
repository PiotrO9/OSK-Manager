<script setup lang="ts">
import type { AdvancedFilterChip } from '~~/shared/utils/advancedFilters';
import type {
    InstructorAdvancedFilter,
    InstructorAdvancedFilterDraft,
    InstructorAdvancedFilterQualificationOption,
} from '~~/shared/utils/instructorAdvancedFilters';
import {
    formatInstructorAdvancedFilterLabel,
    formatInstructorAdvancedFilterSegments,
} from '~~/shared/utils/instructorAdvancedFilters';

const props = defineProps<{
    filters: readonly InstructorAdvancedFilter[];
    draft: InstructorAdvancedFilterDraft;
    qualifications: readonly InstructorAdvancedFilterQualificationOption[];
    disabled?: boolean;
    error?: string | null;
}>();

const emit = defineEmits<{
    startNew: [];
    startEdit: [filterId: string];
    updateDraft: [value: InstructorAdvancedFilterDraft];
    apply: [];
    cancel: [];
    remove: [filterId: string];
    clear: [];
}>();

const editorTitle = computed(() =>
    props.draft.id ? 'Edytuj filtr' : 'Dodaj filtr',
);

const activeFilters = computed<AdvancedFilterChip[]>(() =>
    props.filters.map((filter) => ({
        id: filter.id,
        label: formatInstructorAdvancedFilterLabel(
            filter,
            props.qualifications,
        ),
        segments: formatInstructorAdvancedFilterSegments(
            filter,
            props.qualifications,
        ),
    })),
);
</script>

<template>
    <AppAdvancedFilters
        :active-filters="activeFilters"
        :editor-title="editorTitle"
        :disabled="disabled"
        :error="error"
        controls-base-id="instructor-advanced-filter"
        @start-new="emit('startNew')"
        @start-edit="emit('startEdit', $event)"
        @apply="emit('apply')"
        @cancel="emit('cancel')"
        @remove="emit('remove', $event)"
        @clear="emit('clear')"
    >
        <template #editor="{ apply, cancel }">
            <ManagerInstructorFilterEditor
                :draft="draft"
                :qualifications="qualifications"
                :disabled="disabled"
                :error="error"
                @update-draft="emit('updateDraft', $event)"
                @apply="apply"
                @cancel="cancel"
            />
        </template>
    </AppAdvancedFilters>
</template>
