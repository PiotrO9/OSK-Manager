<script setup lang="ts">
defineProps<{
    processLabel: string;
    notesLabel: string;
    paymentsLabel: string;
    scheduleLabel: string;
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5 pt-0">
            <div
                class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
                <div class="space-y-1">
                    <UiCardTitle class="text-xl font-extrabold">
                        Przegląd
                    </UiCardTitle>
                    <UiCardDescription>
                        Najważniejsze dane i sekcje tego widoku.
                    </UiCardDescription>
                </div>
                <UiBadge
                    variant="outline"
                    class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                >
                    Aktualne
                </UiBadge>
            </div>
        </UiCardHeader>
        <UiCardContent class="grid gap-3 p-4 sm:grid-cols-2">
            <div
                class="border-border rounded-2xl border p-4"
                aria-label="Status procesu"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="font-extrabold">Status procesu</p>
                        <p class="text-muted-foreground mt-1 text-sm">
                            PKK, teoria, praktyka i płatności.
                        </p>
                    </div>
                    <UiBadge
                        variant="outline"
                        class="shrink-0 rounded-full bg-sky-50 text-sky-700"
                    >
                        {{ processLabel }}
                    </UiBadge>
                </div>
            </div>

            <div
                class="border-border rounded-2xl border p-4"
                aria-label="Notatki managera"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="font-extrabold">Notatki managera</p>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Dane zachowane w profilu kursanta.
                        </p>
                    </div>
                    <UiBadge variant="outline" class="shrink-0 rounded-full">
                        {{ notesLabel }}
                    </UiBadge>
                </div>
            </div>

            <div
                class="border-border rounded-2xl border p-4"
                aria-label="Płatności"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="font-extrabold">Płatności</p>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Historia opłat w wybranej szkole.
                        </p>
                    </div>
                    <UiBadge variant="outline" class="shrink-0 rounded-full">
                        {{ paymentsLabel }}
                    </UiBadge>
                </div>
            </div>

            <div
                class="border-border rounded-2xl border p-4"
                aria-label="Lekcje tygodniowe"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="font-extrabold">Lekcje tygodniowe</p>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Terminarz dla aktualnego tygodnia.
                        </p>
                    </div>
                    <UiBadge variant="outline" class="shrink-0 rounded-full">
                        {{ scheduleLabel }}
                    </UiBadge>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
