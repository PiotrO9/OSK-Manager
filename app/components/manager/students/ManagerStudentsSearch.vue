<script setup lang="ts">
import { Search, X } from '@lucide/vue';
import type { CourseListItem } from '~/types/courses/course';
import type {
    StudentAdvancedFilter,
    StudentAdvancedFilterDraft,
} from '~~/shared/utils/studentAdvancedFilters';
import type { StudentListView } from '~~/shared/utils/studentListFilters';

const props = defineProps<{
    search: string;
    quickView: StudentListView;
    activeCourseId?: string;
    schoolFilterActive?: boolean;
    viewCounts?: Record<StudentListView, number> | null;
    advancedFilters: readonly StudentAdvancedFilter[];
    advancedFilterDraft: StudentAdvancedFilterDraft;
    advancedFilterDraftError: string | null;
    courses: readonly CourseListItem[];
    disabled: boolean;
}>();
const emit = defineEmits<{
    'update:search': [value: string];
    'update:quickView': [value: StudentListView];
    startNewAdvancedFilter: [];
    startEditAdvancedFilter: [filterId: string];
    updateAdvancedFilterDraft: [value: StudentAdvancedFilterDraft];
    applyAdvancedFilterDraft: [];
    cancelAdvancedFilterDraft: [];
    removeAdvancedFilter: [filterId: string];
    clearAllFilters: [];
}>();
const views: { value: StudentListView; label: string }[] = [
    { value: 'all', label: 'Wszyscy' },
    { value: 'without-pkk', label: 'Bez PKK' },
    { value: 'without-course', label: 'Bez kursu' },
    { value: 'overdue', label: 'Z zaległościami' },
    { value: 'without-lesson', label: 'Bez zaplanowanej jazdy' },
];
const hasActiveFilters = computed(
    () =>
        Boolean(props.search.trim()) ||
        props.quickView !== 'all' ||
        Boolean(props.activeCourseId) ||
        props.schoolFilterActive ||
        props.advancedFilters.length > 0,
);
</script>

<template>
    <div class="border-border space-y-3 border-b px-4 py-3 sm:px-5">
        <div class="flex flex-wrap items-center gap-2">
            <div
                class="relative w-full max-w-lg sm:flex-1"
                role="search"
                aria-label="Wyszukiwanie kursantów"
            >
                <Search
                    class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                />
                <UiInput
                    :model-value="search"
                    :disabled="disabled"
                    type="search"
                    maxlength="120"
                    autocomplete="off"
                    class="h-11 pr-11 pl-9 sm:h-10"
                    aria-label="Szukaj kursanta po imieniu, nazwisku, e-mailu, telefonie lub PKK"
                    placeholder="Szukaj kursanta…"
                    @update:model-value="emit('update:search', String($event))"
                />
                <UiButton
                    v-if="search"
                    variant="ghost"
                    size="icon"
                    class="absolute top-0 right-0 size-11 sm:size-10"
                    aria-label="Wyczyść wyszukiwanie"
                    @click="emit('update:search', '')"
                    ><X class="size-4"
                /></UiButton>
            </div>
            <UiButton
                v-if="hasActiveFilters"
                type="button"
                variant="outline"
                size="sm"
                class="h-11 shrink-0 gap-1.5 sm:h-10"
                :disabled="disabled"
                @click="emit('clearAllFilters')"
            >
                <X class="size-4" aria-hidden="true" />
                Wyczyść wszystkie
            </UiButton>
        </div>
        <div
            class="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Szybkie filtry kursantów"
        >
            <span class="text-foreground mr-1 text-sm font-semibold"
                >Kursanci</span
            >
            <button
                v-for="view in views"
                :key="view.value"
                type="button"
                :disabled="disabled"
                :aria-pressed="quickView === view.value"
                class="focus-visible:ring-ring min-h-9 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                :class="
                    quickView === view.value
                        ? 'border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-500/50 dark:bg-primary-500/15 dark:text-primary-200'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                "
                @click="emit('update:quickView', view.value)"
            >
                {{ view.label }}
                <span class="ml-1 tabular-nums">{{
                    viewCounts?.[view.value] ?? '—'
                }}</span>
            </button>
        </div>
        <ManagerStudentsAdvancedFilters
            :filters="advancedFilters"
            :draft="advancedFilterDraft"
            :courses="courses"
            :disabled="disabled"
            :error="advancedFilterDraftError"
            @start-new="emit('startNewAdvancedFilter')"
            @start-edit="emit('startEditAdvancedFilter', $event)"
            @update-draft="emit('updateAdvancedFilterDraft', $event)"
            @apply="emit('applyAdvancedFilterDraft')"
            @cancel="emit('cancelAdvancedFilterDraft')"
            @remove="emit('removeAdvancedFilter', $event)"
            @clear="emit('clearAllFilters')"
        />
    </div>
</template>
