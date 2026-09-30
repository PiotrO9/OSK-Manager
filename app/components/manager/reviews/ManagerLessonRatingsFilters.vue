<script setup lang="ts">
import { Building2, CalendarRange, GraduationCap } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import {
    MANAGER_REVIEWS_PERIOD_OPTIONS,
    type ManagerReviewsPeriod,
} from '~/utils/lessons/managerReviews';

const props = defineProps<{
    schools: readonly DrivingSchool[];
    instructors: readonly InstructorListItem[];
    schoolId: string;
    instructorId: string;
    period: ManagerReviewsPeriod;
    isSchoolsLoading: boolean;
    isInstructorsLoading: boolean;
    isRatingsLoading: boolean;
    instructorsErrorMessage: string | null;
}>();

const emit = defineEmits<{
    schoolChange: [schoolId: string];
    instructorChange: [instructorId: string];
    periodChange: [period: ManagerReviewsPeriod];
    retryInstructors: [];
}>();
</script>

<template>
    <section
        class="border-border bg-card overflow-hidden rounded-2xl border shadow-xs"
        aria-labelledby="manager-reviews-filters-title"
    >
        <div class="border-border border-b px-4 py-4 sm:px-5">
            <h2
                id="manager-reviews-filters-title"
                class="text-foreground text-base font-bold tracking-tight text-balance"
            >
                Zakres opinii
            </h2>
            <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
                Wybierz szkołę, instruktora i okres uwzględniony w wynikach.
            </p>
        </div>

        <div class="grid gap-4 p-4 sm:p-5 md:grid-cols-3 xl:grid-cols-1">
            <div class="min-w-0 space-y-2">
                <UiLabel for="ratings-school-filter">Szkoła jazdy</UiLabel>
                <UiSelect
                    :model-value="props.schoolId"
                    :disabled="
                        props.isSchoolsLoading || props.schools.length === 0
                    "
                    @update:model-value="emit('schoolChange', String($event))"
                >
                    <UiSelectTrigger
                        id="ratings-school-filter"
                        class="bg-background h-11 w-full"
                        aria-label="Wybierz szkołę jazdy"
                    >
                        <Building2
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                        <UiSelectValue placeholder="Wybierz szkołę" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="school in props.schools"
                                :key="school.id"
                                :value="school.id"
                            >
                                {{ school.name }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>

            <div class="min-w-0 space-y-2">
                <UiLabel for="ratings-instructor-filter">Instruktor</UiLabel>
                <UiSelect
                    :model-value="props.instructorId || 'all'"
                    :disabled="
                        !props.schoolId ||
                        props.isInstructorsLoading ||
                        props.isRatingsLoading
                    "
                    @update:model-value="
                        emit(
                            'instructorChange',
                            String($event) === 'all' ? '' : String($event),
                        )
                    "
                >
                    <UiSelectTrigger
                        id="ratings-instructor-filter"
                        class="bg-background h-11 w-full"
                        aria-label="Wybierz instruktora"
                    >
                        <GraduationCap
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                        <UiSelectValue placeholder="Wszyscy instruktorzy" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem value="all">
                                Wszyscy instruktorzy
                            </UiSelectItem>
                            <UiSelectItem
                                v-for="instructor in props.instructors"
                                :key="instructor.id"
                                :value="instructor.id"
                            >
                                {{ formatInstructorDisplayName(instructor) }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
                <div
                    v-if="props.instructorsErrorMessage"
                    class="text-danger-700 dark:text-danger-300 flex items-start justify-between gap-2 text-xs leading-relaxed"
                    role="status"
                >
                    <span>
                        {{ props.instructorsErrorMessage }} Możesz nadal
                        przeglądać opinie wszystkich instruktorów.
                    </span>
                    <button
                        type="button"
                        class="focus-visible:ring-ring shrink-0 rounded-sm font-bold underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
                        @click="emit('retryInstructors')"
                    >
                        Ponów
                    </button>
                </div>
            </div>

            <div class="min-w-0 space-y-2">
                <UiLabel for="ratings-period-filter">Okres</UiLabel>
                <UiSelect
                    :model-value="props.period"
                    :disabled="props.isRatingsLoading || !props.schoolId"
                    @update:model-value="
                        emit(
                            'periodChange',
                            String($event) as ManagerReviewsPeriod,
                        )
                    "
                >
                    <UiSelectTrigger
                        id="ratings-period-filter"
                        class="bg-background h-11 w-full"
                        aria-label="Wybierz okres opinii"
                    >
                        <CalendarRange
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                        <UiSelectValue placeholder="Wybierz okres" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="option in MANAGER_REVIEWS_PERIOD_OPTIONS"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>
        </div>
    </section>
</template>
