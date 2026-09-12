<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import {
    courseQuickViews,
    type CourseQuickView,
    type CourseFilterOption,
} from '~/utils/courses/courseFilters';
defineProps<{
    categories: CourseFilterOption[];
    disabled: boolean;
    hasActiveFilters: boolean;
}>();
const emit = defineEmits<{ clear: [] }>();
const search = defineModel<string>('search', { required: true });
const category = defineModel<string>('category', { required: true });
const quickView = defineModel<CourseQuickView>('quickView', { required: true });
</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-col gap-3 sm:flex-row">
            <div
                class="relative min-w-0 flex-1 sm:max-w-lg"
                role="search"
                aria-label="Wyszukiwanie kursów"
            >
                <Search
                    class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                />
                <UiInput
                    v-model="search"
                    type="search"
                    maxlength="120"
                    autocomplete="off"
                    class="h-11 pr-11 pl-9 sm:h-10"
                    :disabled="disabled"
                    placeholder="Szukaj kursu..."
                    aria-label="Szukaj po nazwie kursu, kategorii lub instruktorze"
                />
                <UiButton
                    v-if="search"
                    variant="ghost"
                    size="icon"
                    class="absolute top-0 right-0 size-11 sm:size-10"
                    :disabled="disabled"
                    aria-label="Wyczyść wyszukiwanie"
                    title="Wyczyść wyszukiwanie"
                    @click="search = ''"
                    ><X class="size-4" aria-hidden="true"
                /></UiButton>
            </div>
            <UiSelect v-model="category" :disabled="disabled">
                <UiSelectTrigger
                    class="!h-11 w-full sm:!h-10 sm:w-48"
                    aria-label="Kategoria kursu"
                    ><UiSelectValue
                /></UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectItem value="all">Wszystkie kategorie</UiSelectItem>
                    <UiSelectItem
                        v-for="option in categories"
                        :key="option.value"
                        :value="option.value"
                        >Kategoria {{ option.label }}</UiSelectItem
                    >
                </UiSelectContent>
            </UiSelect>
        </div>
        <div
            class="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Szybkie filtry kursów"
        >
            <UiButton
                v-for="view in courseQuickViews"
                :key="view.value"
                variant="ghost"
                size="sm"
                class="h-11 rounded-md px-3 text-xs sm:h-8"
                :class="
                    quickView === view.value
                        ? 'bg-primary/10 text-primary dark:text-primary-300 hover:bg-primary/15'
                        : 'text-muted-foreground'
                "
                :aria-pressed="quickView === view.value"
                :disabled="disabled"
                @click="quickView = view.value"
                >{{ view.label }}</UiButton
            >
            <UiButton
                v-if="hasActiveFilters"
                variant="ghost"
                size="sm"
                class="text-muted-foreground h-11 gap-1.5 text-xs sm:h-8"
                :disabled="disabled"
                @click="emit('clear')"
                ><X class="size-3.5" aria-hidden="true" />Wyczyść
                filtry</UiButton
            >
        </div>
    </div>
</template>
