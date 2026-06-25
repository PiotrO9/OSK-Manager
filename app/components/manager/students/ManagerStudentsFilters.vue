<script setup lang="ts">
import type { CourseListItem } from '~/types/course';
import type { DrivingSchool } from '~/types/drivingSchool';

interface Props {
    schools: readonly DrivingSchool[];
    courses: readonly CourseListItem[];
    activeSchoolId: string;
    activeCourseId: string;
    activeSchoolName: string | null;
    isStudentsLoading: boolean;
    isCoursesLoading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
    'update:activeSchoolId': [value: string];
    'update:activeCourseId': [value: string];
    schoolChange: [];
    courseChange: [];
}>();

function handleSchoolUpdate(value: string) {
    emit('update:activeSchoolId', value);
    emit('schoolChange');
}

function handleCourseUpdate(value: string) {
    emit('update:activeCourseId', value);
    emit('courseChange');
}
</script>

<template>
    <div
        class="border-border bg-muted/20 grid gap-3 rounded-2xl border p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
        <div v-if="schools.length > 1" class="space-y-1.5">
            <UiLabel for="students-page-school">Szkoła jazdy</UiLabel>
            <UiSelect
                :model-value="activeSchoolId"
                :disabled="isStudentsLoading || isCoursesLoading"
                @update:model-value="handleSchoolUpdate"
            >
                <UiSelectTrigger
                    id="students-page-school"
                    class="bg-background h-11 w-full rounded-xl"
                    aria-label="Wybierz szkołę jazdy do podglądu listy kursantów"
                >
                    <UiSelectValue placeholder="Wybierz szkołę" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="s in schools"
                            :key="s.id"
                            :value="s.id"
                        >
                            {{ s.name
                            }}{{
                                s.city && s.city.length > 0
                                    ? ` (${s.city})`
                                    : ''
                            }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <div v-else class="border-border bg-background rounded-xl border p-3">
            <p class="text-muted-foreground text-xs font-medium">
                Szkoła jazdy
            </p>
            <p class="text-foreground mt-1 truncate text-sm font-bold">
                {{ activeSchoolName ?? 'Brak wybranej szkoły' }}
            </p>
        </div>

        <div class="space-y-1.5">
            <UiLabel for="students-page-course-filter"> Kurs </UiLabel>
            <UiSelect
                :model-value="activeCourseId"
                :disabled="
                    isStudentsLoading || isCoursesLoading || !activeSchoolId
                "
                @update:model-value="handleCourseUpdate"
            >
                <UiSelectTrigger
                    id="students-page-course-filter"
                    class="bg-background h-11 w-full rounded-xl"
                    aria-label="Wybierz kurs do filtrowania listy kursantów lub pozostaw wszystkie kursy"
                >
                    <UiSelectValue placeholder="Wszystkie kursy" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="c in courses"
                            :key="c.id"
                            :value="c.id"
                        >
                            {{ c.name }} ({{ c.category }})
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>
    </div>
</template>
