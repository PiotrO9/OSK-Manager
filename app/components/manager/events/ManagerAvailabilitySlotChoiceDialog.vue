<script setup lang="ts">
import type { LessonBookingSlotContext } from '~/types/lessons/lessonBooking';

const props = defineProps<{
    slotCtx: LessonBookingSlotContext | null;
}>();

const emit = defineEmits<{
    pickLesson: [];
    pickTheoryBlock: [];
}>();

const open = defineModel<boolean>('open', { required: true });

const DESCRIPTION_ID = 'slot-choice-dialog-desc';

const slotWhenLabel = computed((): string => {
    const s = props.slotCtx;

    if (!s) {
        return '';
    }

    const d = new Date(`${s.date}T12:00:00`);

    if (Number.isNaN(d.getTime())) {
        return `${s.date}, ${s.startTime}–${s.endTime}`;
    }

    const dateStr = d.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return `${dateStr}, ${s.startTime}–${s.endTime}`;
});

function handlePickLesson(): void {
    emit('pickLesson');
    open.value = false;
}

function handlePickTheoryBlock(): void {
    emit('pickTheoryBlock');
    open.value = false;
}

function handleClose(): void {
    open.value = false;
}
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent :aria-describedby="DESCRIPTION_ID" class="max-w-md">
            <UiDialogHeader>
                <UiDialogTitle>Co chcesz zaplanować?</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Wybrany termin:
                    <span v-if="slotWhenLabel" class="font-medium">{{
                        slotWhenLabel
                    }}</span>
                    . Jazda praktyczna jest przeznaczona dla jednego kursanta, a
                    zajęcia teoretyczne mogą mieć wielu uczestników.
                </UiDialogDescription>
            </UiDialogHeader>

            <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <UiButton
                    type="button"
                    class="flex-1"
                    @click="handlePickLesson"
                >
                    Zarezerwuj jazdę
                </UiButton>
                <UiButton
                    type="button"
                    variant="secondary"
                    class="flex-1"
                    @click="handlePickTheoryBlock"
                >
                    Utwórz zajęcia teoretyczne
                </UiButton>
            </div>

            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="secondary"
                    @click="handleClose"
                >
                    Anuluj
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
