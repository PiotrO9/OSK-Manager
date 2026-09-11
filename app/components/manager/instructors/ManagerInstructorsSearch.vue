<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import type { InstructorQuickView } from '~/utils/instructors/managerInstructorsPage';
import type {
    InstructorAdvancedFilter,
    InstructorAdvancedFilterDraft,
    InstructorAdvancedFilterQualificationOption,
} from '~~/shared/utils/instructorAdvancedFilters';

defineProps<{
    advancedFilters: readonly InstructorAdvancedFilter[];
    advancedFilterDraft: InstructorAdvancedFilterDraft;
    advancedFilterDraftError: string | null;
    qualifications: readonly InstructorAdvancedFilterQualificationOption[];
    disabled: boolean;
    hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
    startNewAdvancedFilter: [];
    startEditAdvancedFilter: [filterId: string];
    updateAdvancedFilterDraft: [value: InstructorAdvancedFilterDraft];
    applyAdvancedFilterDraft: [];
    cancelAdvancedFilterDraft: [];
    removeAdvancedFilter: [filterId: string];
    clearFilters: [];
}>();

const search = defineModel<string>('search', {
    required: true,
});

const quickView = defineModel<InstructorQuickView>('quickView', {
    required: true,
});

const views: { value: InstructorQuickView; label: string }[] = [
    { value: 'all', label: 'Wszyscy' },
    { value: 'qualified', label: 'Z kwalifikacjami' },
    { value: 'unqualified', label: 'Bez kwalifikacji' },
];
</script>

<template>
    <div class="border-border space-y-3 border-b px-4 py-3 sm:px-5">
        <div
            class="relative max-w-lg"
            role="search"
            aria-label="Wyszukiwanie instruktorów"
        >
            <Search
                class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
            />
            <UiInput
                v-model="search"
                :disabled="disabled"
                type="search"
                maxlength="120"
                autocomplete="off"
                class="h-11 pr-11 pl-9 sm:h-10"
                aria-label="Szukaj instruktora po imieniu, nazwisku, e-mailu, telefonie lub kwalifikacji"
                placeholder="Szukaj instruktora..."
            />
            <UiButton
                v-if="search"
                variant="ghost"
                size="icon"
                class="absolute top-0 right-0 size-11 sm:size-10"
                aria-label="Wyczyść wyszukiwanie"
                @click="search = ''"
            >
                <X class="size-4" aria-hidden="true" />
            </UiButton>
        </div>

        <div
            class="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Szybkie filtry instruktorów"
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
                @click="quickView = view.value"
            >
                {{ view.label }}
            </UiButton>

            <UiButton
                v-if="hasActiveFilters"
                variant="ghost"
                size="sm"
                :disabled="disabled"
                class="text-muted-foreground h-11 rounded-md px-3 text-xs sm:h-8"
                @click="emit('clearFilters')"
            >
                Wyczyść
            </UiButton>
        </div>

        <ManagerInstructorsAdvancedFilters
            :filters="advancedFilters"
            :draft="advancedFilterDraft"
            :qualifications="qualifications"
            :disabled="disabled"
            :error="advancedFilterDraftError"
            @start-new="emit('startNewAdvancedFilter')"
            @start-edit="emit('startEditAdvancedFilter', $event)"
            @update-draft="emit('updateAdvancedFilterDraft', $event)"
            @apply="emit('applyAdvancedFilterDraft')"
            @cancel="emit('cancelAdvancedFilterDraft')"
            @remove="emit('removeAdvancedFilter', $event)"
            @clear="emit('clearFilters')"
        />
    </div>
</template>
