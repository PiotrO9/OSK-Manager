<script setup lang="ts">
import type { LessonBookingInstructorOption } from '~/types/lessons/lessonBooking';

defineProps<{
    instructors: readonly LessonBookingInstructorOption[];
    disabled: boolean;
}>();

const selectedInstructorId = defineModel<string>('selectedInstructorId', {
    required: true,
});
</script>

<template>
    <div class="space-y-2">
        <label
            class="text-sm leading-none font-medium"
            for="lesson-booking-instructor"
        >
            Instruktor
        </label>
        <UiSelect v-model="selectedInstructorId" :disabled="disabled">
            <UiSelectTrigger
                id="lesson-booking-instructor"
                class="w-full"
                aria-required="true"
            >
                <UiSelectValue placeholder="— Wybierz instruktora —" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="instructor in instructors"
                        :key="instructor.id"
                        :value="instructor.id"
                    >
                        {{ instructor.firstName }} {{ instructor.lastName }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
    </div>
</template>
