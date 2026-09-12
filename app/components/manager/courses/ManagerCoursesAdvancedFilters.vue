<script setup lang="ts">
import {
    courseFilterChip,
    type CourseFilter,
    type CourseFilterOption,
} from '~/utils/courses/courseFilters';
const props = defineProps<{
    filters: CourseFilter[];
    draft: CourseFilter;
    categories: CourseFilterOption[];
    instructors: CourseFilterOption[];
    disabled?: boolean;
    error: string | null;
}>();
const emit = defineEmits<{
    startNew: [];
    startEdit: [id: string];
    updateDraft: [value: CourseFilter];
    apply: [];
    cancel: [];
    remove: [id: string];
    clear: [];
}>();
const chips = computed(() =>
    props.filters.map((filter) => courseFilterChip(filter, props.instructors)),
);
</script>

<template>
    <AppAdvancedFilters
        :active-filters="chips"
        :editor-title="draft.id ? 'Edytuj filtr' : 'Dodaj filtr'"
        :disabled="disabled"
        :error="error"
        trigger-label="Filtry zaawansowane"
        controls-base-id="course-advanced-filter"
        @start-new="emit('startNew')"
        @start-edit="emit('startEdit', $event)"
        @apply="emit('apply')"
        @cancel="emit('cancel')"
        @remove="emit('remove', $event)"
        @clear="emit('clear')"
    >
        <template #editor="{ apply, cancel }">
            <ManagerCourseFilterEditor
                :draft="draft"
                :categories="categories"
                :instructors="instructors"
                :disabled="disabled"
                :error="error"
                @update-draft="emit('updateDraft', $event)"
                @apply="apply"
                @cancel="cancel"
            />
        </template>
    </AppAdvancedFilters>
</template>
