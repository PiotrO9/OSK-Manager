<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

defineProps<{
    items: readonly ScheduleLessonItem[];
    selectedLessonId: string | null;
    isRefreshing?: boolean;
    isSubmitting?: boolean;
    errorMessage?: string | null;
}>();

defineEmits<{
    select: [lesson: ScheduleLessonItem];
    submit: [
        payload: {
            lesson: ScheduleLessonItem;
            rating: number;
            comment: string | null;
        },
    ];
}>();

const open = defineModel<boolean>('open', { required: true });
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent class="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
            <UiDialogHeader>
                <UiDialogTitle>Opinie po jazdach</UiDialogTitle>
                <UiDialogDescription>
                    Wybierz zakończoną jazdę, aby zobaczyć opinię lub dodać
                    ocenę.
                </UiDialogDescription>
            </UiDialogHeader>

            <StudentLessonRatingsPanel
                :items="items"
                :selected-lesson-id="selectedLessonId"
                :is-refreshing="isRefreshing"
                :is-submitting="isSubmitting"
                :error-message="errorMessage"
                @select="$emit('select', $event)"
                @submit="$emit('submit', $event)"
            />
        </UiDialogContent>
    </UiDialog>
</template>
