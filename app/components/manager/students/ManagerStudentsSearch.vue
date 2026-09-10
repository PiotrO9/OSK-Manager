<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import type { StudentListView } from '~~/shared/utils/studentListFilters';

defineProps<{
    search: string;
    quickView: StudentListView;
    disabled: boolean;
}>();
const emit = defineEmits<{
    'update:search': [value: string];
    'update:quickView': [value: StudentListView];
}>();
const views: { value: StudentListView; label: string }[] = [
    { value: 'all', label: 'Wszyscy' },
    { value: 'without-pkk', label: 'Bez PKK' },
    { value: 'without-course', label: 'Bez kursu' },
    { value: 'overdue', label: 'Z zaległościami' },
    { value: 'without-lesson', label: 'Bez zaplanowanej jazdy' },
];
</script>

<template>
    <div class="border-border space-y-3 border-b px-4 py-3 sm:px-5">
        <div
            class="relative max-w-lg"
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
        <div
            class="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Szybkie filtry kursantów"
        >
            <UiButton
                v-for="view in views"
                :key="view.value"
                variant="ghost"
                size="sm"
                :disabled="disabled"
                :aria-pressed="quickView === view.value"
                class="h-11 rounded-md px-3 text-xs sm:h-8"
                :class="
                    quickView === view.value
                        ? 'bg-primary/10 text-primary dark:text-primary-300 hover:bg-primary/15'
                        : 'text-muted-foreground'
                "
                @click="emit('update:quickView', view.value)"
                >{{ view.label }}</UiButton
            >
        </div>
    </div>
</template>
