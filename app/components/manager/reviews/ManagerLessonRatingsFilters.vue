<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { LessonRatingsPeriod } from '~/types/lessons/lessonRating';

const props = defineProps<{
    schools: DrivingSchool[];
    instructors: InstructorListItem[];
    schoolId: string;
    instructorId: string;
    period: LessonRatingsPeriod;
    isLoading: boolean;
    isInstructorsLoading: boolean;
}>();

const emit = defineEmits<{
    schoolChange: [schoolId: string];
    instructorChange: [instructorId: string];
    periodChange: [period: LessonRatingsPeriod];
}>();

const periodOptions: Array<{ value: LessonRatingsPeriod; label: string }> = [
    { value: 'latest', label: 'Ostatnie' },
    { value: 'yesterday', label: 'Ubiegly dzien' },
    { value: 'last7days', label: 'Ostatni tydzien' },
    { value: 'all', label: 'Wszystkie' },
];
</script>

<template>
    <div class="border-border rounded-lg border p-4">
        <div class="grid gap-4 md:grid-cols-3">
            <div class="space-y-2">
                <UiLabel for="ratings-school-filter">Szkola jazdy</UiLabel>
                <UiSelect
                    :model-value="props.schoolId"
                    :disabled="props.isLoading || props.schools.length === 0"
                    @update:model-value="emit('schoolChange', String($event))"
                >
                    <UiSelectTrigger
                        id="ratings-school-filter"
                        aria-label="Wybierz szkole jazdy do listy opinii"
                    >
                        <UiSelectValue placeholder="Wybierz szkole" />
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

            <div class="space-y-2">
                <UiLabel for="ratings-period-filter">Okres</UiLabel>
                <UiSelect
                    :model-value="props.period"
                    :disabled="props.isLoading"
                    @update:model-value="
                        emit(
                            'periodChange',
                            String($event) as LessonRatingsPeriod,
                        )
                    "
                >
                    <UiSelectTrigger
                        id="ratings-period-filter"
                        aria-label="Wybierz okres opinii"
                    >
                        <UiSelectValue placeholder="Okres" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="option in periodOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>

            <div class="space-y-2">
                <UiLabel for="ratings-instructor-filter">Instruktor</UiLabel>
                <UiSelect
                    :model-value="props.instructorId || 'all'"
                    :disabled="
                        props.isLoading ||
                        props.isInstructorsLoading ||
                        props.instructors.length === 0
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
                        aria-label="Wybierz instruktora do filtrowania opinii"
                    >
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
            </div>
        </div>
    </div>
</template>
