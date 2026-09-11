<script setup lang="ts">
import { Building2 } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { InstructorQuickView } from '~/utils/instructors/managerInstructorsPage';
import type {
    InstructorAdvancedFilter,
    InstructorAdvancedFilterDraft,
    InstructorAdvancedFilterQualificationOption,
} from '~~/shared/utils/instructorAdvancedFilters';

const props = defineProps<{
    schools: DrivingSchool[];
    activeSchool: DrivingSchool | null;
    instructors: InstructorListItem[];
    isSchoolsLoading: boolean;
    isInstructorsLoading: boolean;
    schoolsLoadError: string | null;
    instructorsLoadError: string | null;
    advancedFilters: readonly InstructorAdvancedFilter[];
    advancedFilterDraft: InstructorAdvancedFilterDraft;
    advancedFilterDraftError: string | null;
    qualificationOptions: readonly InstructorAdvancedFilterQualificationOption[];
    visibleInstructorsLabel: string;
    qualificationFilterLabel: string;
    instructorsWithQualificationsCount: number;
    uniqueQualificationCodesCount: number;
    hasActiveFilters: boolean;
    instructorDetailsTo: (instructor: InstructorListItem) => RouteLocationRaw;
    instructorQualificationLabel: (instructor: InstructorListItem) => string;
    instructorInitials: (instructor: InstructorListItem) => string;
}>();

const emit = defineEmits<{
    activeSchoolChange: [];
    createInstructor: [];
    startNewAdvancedFilter: [];
    startEditAdvancedFilter: [filterId: string];
    updateAdvancedFilterDraft: [value: InstructorAdvancedFilterDraft];
    applyAdvancedFilterDraft: [];
    cancelAdvancedFilterDraft: [];
    removeAdvancedFilter: [filterId: string];
    clearFilters: [];
    retrySchools: [];
    retryInstructors: [];
}>();

const activeSchoolId = defineModel<string>('activeSchoolId', {
    required: true,
});

const search = defineModel<string>('search', {
    required: true,
});

const quickView = defineModel<InstructorQuickView>('quickView', {
    required: true,
});

const isSummaryUnavailable = computed(
    () =>
        props.isSchoolsLoading ||
        props.isInstructorsLoading ||
        Boolean(props.schoolsLoadError || props.instructorsLoadError),
);

function toSelectId(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function handleSchoolUpdate(value: unknown) {
    const id = toSelectId(value);

    if (!id) return;

    activeSchoolId.value = id;
    emit('activeSchoolChange');
}
</script>

<template>
    <section
        class="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-xs"
        aria-label="Baza instruktorów"
    >
        <FilterBar
            title=""
            class="rounded-t-xl border-0 border-b px-4 py-4 shadow-none sm:px-5"
            :is-loading="isSchoolsLoading || isInstructorsLoading"
            aria-label="Filtry listy instruktorów"
        >
            <div
                class="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
                <div
                    v-if="schools.length > 1"
                    class="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 lg:max-w-sm lg:flex-1"
                >
                    <UiLabel
                        for="instructors-page-school"
                        class="text-muted-foreground shrink-0 text-xs"
                        >Szkoła jazdy</UiLabel
                    >
                    <UiSelect
                        :model-value="activeSchoolId"
                        :disabled="isSchoolsLoading || isInstructorsLoading"
                        @update:model-value="handleSchoolUpdate"
                    >
                        <UiSelectTrigger
                            id="instructors-page-school"
                            class="h-11 w-full min-w-0 sm:h-9"
                            aria-label="Wybierz szkołę jazdy do podglądu listy instruktorów"
                        >
                            <UiSelectValue placeholder="Wybierz szkołę" />
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
                                        school.city ? ` (${school.city})` : ''
                                    }}
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                </div>
                <div v-else class="flex min-w-0 items-center gap-3">
                    <span
                        class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                        ><Building2 class="size-4" aria-hidden="true"
                    /></span>
                    <div class="min-w-0">
                        <p class="text-muted-foreground text-xs">
                            Szkoła jazdy
                        </p>
                        <p
                            class="text-foreground text-sm font-semibold wrap-anywhere"
                        >
                            {{ activeSchool?.name ?? 'Brak wybranej szkoły' }}
                        </p>
                    </div>
                </div>

                <div
                    class="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3 lg:w-96 lg:shrink-0"
                >
                    <span class="text-muted-foreground shrink-0 text-xs">
                        Zakres
                    </span>
                    <div class="flex min-w-0 flex-wrap items-center gap-2">
                        <StatusBadge
                            :label="qualificationFilterLabel"
                            tone="neutral"
                            subtle
                        />
                        <span
                            class="text-muted-foreground text-xs font-semibold whitespace-nowrap"
                        >
                            {{ visibleInstructorsLabel }}
                        </span>
                    </div>
                </div>
            </div>
        </FilterBar>

        <ManagerInstructorsSearch
            v-model:search="search"
            v-model:quick-view="quickView"
            :advanced-filters="advancedFilters"
            :advanced-filter-draft="advancedFilterDraft"
            :advanced-filter-draft-error="advancedFilterDraftError"
            :qualifications="qualificationOptions"
            :disabled="
                isSchoolsLoading ||
                isInstructorsLoading ||
                Boolean(schoolsLoadError || instructorsLoadError) ||
                schools.length === 0
            "
            :has-active-filters="hasActiveFilters"
            @start-new-advanced-filter="emit('startNewAdvancedFilter')"
            @start-edit-advanced-filter="
                emit('startEditAdvancedFilter', $event)
            "
            @update-advanced-filter-draft="
                emit('updateAdvancedFilterDraft', $event)
            "
            @apply-advanced-filter-draft="emit('applyAdvancedFilterDraft')"
            @cancel-advanced-filter-draft="emit('cancelAdvancedFilterDraft')"
            @remove-advanced-filter="emit('removeAdvancedFilter', $event)"
            @clear-filters="emit('clearFilters')"
        />

        <ManagerInstructorsStatsGrid
            :instructors-count="instructors.length"
            :active-school="activeSchool"
            :instructors-with-qualifications-count="
                instructorsWithQualificationsCount
            "
            :unique-qualification-codes-count="uniqueQualificationCodesCount"
            :is-unavailable="isSummaryUnavailable"
        />

        <div
            :aria-busy="isSchoolsLoading || isInstructorsLoading"
            class="min-w-0"
        >
            <LoadingState
                v-if="isSchoolsLoading"
                class="m-4 border-0 shadow-none"
                title="Wczytywanie szkół jazdy"
                :show-labels="false"
            />

            <ErrorState
                v-else-if="schoolsLoadError"
                class="m-4"
                title="Nie udało się wczytać szkół jazdy"
                :description="schoolsLoadError"
                @retry="emit('retrySchools')"
            />

            <EmptyState
                v-else-if="schools.length === 0"
                class="m-4"
                title="Brak szkół jazdy"
                description="Dodaj OSK w panelu szkół, aby wyświetlić listę instruktorów."
            />

            <ErrorState
                v-else-if="instructorsLoadError"
                class="m-4"
                title="Nie udało się wczytać instruktorów"
                :description="instructorsLoadError"
                @retry="emit('retryInstructors')"
            />

            <LoadingState
                v-else-if="isInstructorsLoading"
                class="m-4 border-0 shadow-none"
                title="Wczytywanie instruktorów"
                :show-labels="false"
            />

            <EmptyState
                v-else-if="instructors.length === 0"
                class="m-4"
                :title="
                    hasActiveFilters
                        ? 'Brak wyników wyszukiwania'
                        : 'Brak instruktorów'
                "
                :description="
                    hasActiveFilters
                        ? 'Zmień wyszukiwanie lub wyczyść filtry, aby wrócić do pełnej listy.'
                        : 'W wybranej szkole nie ma jeszcze instruktorów.'
                "
            >
                <template #action>
                    <UiButton
                        v-if="hasActiveFilters"
                        type="button"
                        variant="outline"
                        @click="emit('clearFilters')"
                    >
                        Wyczyść filtry
                    </UiButton>
                    <UiButton
                        v-else
                        type="button"
                        @click="emit('createInstructor')"
                    >
                        Dodaj instruktora
                    </UiButton>
                </template>
            </EmptyState>

            <div v-else class="@container">
                <ManagerInstructorsDesktopTable
                    :instructors="instructors"
                    :instructor-details-to="instructorDetailsTo"
                    :instructor-qualification-label="
                        instructorQualificationLabel
                    "
                    :instructor-initials="instructorInitials"
                />

                <ManagerInstructorsMobileCards
                    :instructors="instructors"
                    :instructor-details-to="instructorDetailsTo"
                    :instructor-qualification-label="
                        instructorQualificationLabel
                    "
                    :instructor-initials="instructorInitials"
                />
            </div>
        </div>
    </section>
</template>
