<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

const props = defineProps<{
    lesson: ScheduleLessonItem;
    isSubmitting?: boolean;
}>();

const emit = defineEmits<{
    submit: [payload: { rating: number; comment: string | null }];
}>();

const rating = shallowRef<number | null>(null);
const comment = shallowRef('');
const validationMessage = shallowRef<string | null>(null);

watch(
    () => props.lesson.id,
    () => {
        rating.value = null;
        comment.value = '';
        validationMessage.value = null;
    },
);

function handleSubmit(): void {
    if (rating.value === null) {
        validationMessage.value = 'Wybierz ocenę od 1 do 5.';

        return;
    }

    validationMessage.value = null;
    const trimmedComment = comment.value.trim();

    emit('submit', {
        rating: rating.value,
        comment: trimmedComment.length > 0 ? trimmedComment : null,
    });
}
</script>

<template>
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <fieldset class="flex flex-col gap-2">
            <legend class="text-foreground text-sm font-medium">
                Ocena lekcji
            </legend>
            <div class="flex flex-wrap gap-2" role="radiogroup">
                <UiButton
                    v-for="value in [1, 2, 3, 4, 5]"
                    :key="value"
                    type="button"
                    size="sm"
                    :variant="rating === value ? 'default' : 'outline'"
                    :aria-pressed="rating === value"
                    :disabled="isSubmitting"
                    @click="rating = value"
                >
                    {{ value }}
                </UiButton>
            </div>
        </fieldset>

        <div class="flex flex-col gap-2">
            <UiLabel for="lesson-rating-comment">Komentarz</UiLabel>
            <UiTextarea
                id="lesson-rating-comment"
                v-model="comment"
                rows="4"
                maxlength="5000"
                :disabled="isSubmitting"
                placeholder="Opcjonalnie opisz, jak przebiegła lekcja."
            />
        </div>

        <p v-if="validationMessage" class="text-destructive text-sm">
            {{ validationMessage }}
        </p>

        <div class="flex flex-wrap justify-end gap-2">
            <UiButton type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Zapisywanie...' : 'Dodaj opinię' }}
            </UiButton>
        </div>
    </form>
</template>
