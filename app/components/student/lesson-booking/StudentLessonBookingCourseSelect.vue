<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';
import type { CurrentUserCourseItem } from '~/types/courses/course';

const props = defineProps<{
    courses: CurrentUserCourseItem[];
    isLoading: boolean;
    disabled?: boolean;
}>();

const selectedCourseId = defineModel<string>({ required: true });

const hasCourses = computed(() => props.courses.length > 0);
</script>

<template>
    <section class="border-border bg-muted/20 rounded-2xl border p-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="min-w-0 flex-1 space-y-1.5">
                <label
                    for="student-booking-course"
                    class="text-foreground text-sm font-medium"
                >
                    Kurs
                </label>
                <UiSelect
                    v-model="selectedCourseId"
                    :disabled="disabled || isLoading || !hasCourses"
                >
                    <UiSelectTrigger
                        id="student-booking-course"
                        class="bg-background h-11 w-full rounded-xl"
                    >
                        <UiSelectValue placeholder="Wybierz kurs" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="course in courses"
                                :key="course.id"
                                :value="course.id"
                            >
                                {{ course.name }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>

            <div
                class="bg-background text-muted-foreground flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
                aria-live="polite"
            >
                <BookOpen class="size-4 shrink-0" aria-hidden="true" />
                <span v-if="isLoading">Wczytywanie kursów...</span>
                <span v-else>{{ courses.length }} aktywne</span>
            </div>
        </div>

        <p
            v-if="!isLoading && !hasCourses"
            class="text-muted-foreground mt-3 text-sm"
            role="status"
        >
            Brak aktywnych kursów praktycznych do rezerwacji.
        </p>
    </section>
</template>
