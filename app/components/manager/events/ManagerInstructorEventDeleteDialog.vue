<script setup lang="ts">
import { CalendarClock, Trash2, TriangleAlert } from 'lucide-vue-next';

interface Props {
    open: boolean;
    /** Krótki opis (np. zakres czasu), opcjonalnie. */
    timeRangeLabel?: string;
    /** Blokuje przyciski podczas żądania DELETE. */
    isDeleting?: boolean;
}

withDefaults(defineProps<Props>(), {
    timeRangeLabel: '',
    isDeleting: false,
});

const emit = defineEmits<{
    'update:open': [value: boolean];
    cancel: [];
    confirm: [];
}>();

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="false"
            class="gap-0 overflow-hidden p-0 sm:max-w-md"
            aria-describedby="confirm-delete-instructor-event-description"
        >
            <div class="flex items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
                <div
                    class="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-xl"
                    aria-hidden="true"
                >
                    <Trash2 class="size-5" />
                </div>
                <UiDialogHeader class="gap-1 text-left">
                    <UiDialogTitle class="text-lg leading-snug">
                        Usunąć wydarzenie?
                    </UiDialogTitle>
                    <UiDialogDescription
                        id="confirm-delete-instructor-event-description"
                        class="leading-relaxed"
                    >
                        Blok zostanie usunięty z harmonogramu.
                    </UiDialogDescription>
                </UiDialogHeader>
            </div>

            <div class="space-y-3 px-5 py-5 sm:px-6">
                <div
                    v-if="timeRangeLabel?.trim()"
                    class="border-border bg-muted/40 flex items-start gap-3 rounded-xl border px-3.5 py-3"
                >
                    <CalendarClock
                        class="text-muted-foreground mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                    />
                    <div class="min-w-0">
                        <p class="text-muted-foreground text-xs font-medium">
                            Termin wydarzenia
                        </p>
                        <p class="text-foreground mt-1 text-sm font-semibold">
                            {{ timeRangeLabel }}
                        </p>
                    </div>
                </div>
                <p
                    class="text-destructive flex items-center gap-2 text-sm font-medium"
                >
                    <TriangleAlert class="size-4 shrink-0" aria-hidden="true" />
                    Tej operacji nie można cofnąć.
                </p>
            </div>

            <UiDialogFooter
                class="border-border bg-muted/20 border-t px-5 py-4 sm:px-6"
            >
                <UiButton
                    variant="outline"
                    type="button"
                    class="h-10 sm:min-w-24"
                    :disabled="isDeleting"
                    aria-label="Anuluj usuwanie bloku czasu"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    variant="destructive"
                    type="button"
                    class="h-10 sm:min-w-24"
                    :disabled="isDeleting"
                    :aria-busy="isDeleting"
                    aria-label="Potwierdź usunięcie bloku czasu z harmonogramu"
                    @click="emit('confirm')"
                >
                    {{ isDeleting ? 'Usuwanie…' : 'Usuń' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
