<script setup lang="ts">
import type { AdvancedFilterChip } from '~~/shared/utils/advancedFilters';
import type {
    StudentAdvancedFilter,
    StudentAdvancedFilterCourseOption,
    StudentAdvancedFilterDraft,
} from '~~/shared/utils/studentAdvancedFilters';
import {
    formatStudentAdvancedFilterLabel,
    formatStudentAdvancedFilterSegments,
} from '~~/shared/utils/studentAdvancedFilters';

const props = defineProps<{
    filters: readonly StudentAdvancedFilter[];
    draft: StudentAdvancedFilterDraft;
    courses: readonly StudentAdvancedFilterCourseOption[];
    disabled?: boolean;
    error?: string | null;
}>();

const emit = defineEmits<{
    startNew: [];
    startEdit: [filterId: string];
    updateDraft: [value: StudentAdvancedFilterDraft];
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
        label: formatStudentAdvancedFilterLabel(filter, props.courses),
        segments: formatStudentAdvancedFilterSegments(filter, props.courses),
    })),
);
</script>

<template>
    <AppAdvancedFilters
        :active-filters="activeFilters"
        :editor-title="editorTitle"
        :disabled="disabled"
        :error="error"
        controls-base-id="student-advanced-filter"
        @start-new="emit('startNew')"
        @start-edit="emit('startEdit', $event)"
        @apply="emit('apply')"
        @cancel="emit('cancel')"
        @remove="emit('remove', $event)"
        @clear="emit('clear')"
    >
        <template #editor="{ apply, cancel }">
            <ManagerStudentFilterEditor
                :draft="draft"
                :courses="courses"
                :disabled="disabled"
                :error="error"
                @update-draft="emit('updateDraft', $event)"
                @apply="apply"
                @cancel="cancel"
            />
        </template>
    </AppAdvancedFilters>
</template>
