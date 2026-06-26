<script setup lang="ts">
import { Clock3, ListChecks, Users } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

defineProps<{
    attentionEvents: ScheduleLessonItem[];
    eventCount: number;
    participantTotal: number;
    plannedEvents: number;
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5 pt-0">
            <UiCardTitle class="text-xl font-extrabold">
                Podsumowanie dnia
            </UiCardTitle>
            <UiCardDescription>
                Dane wyliczone z aktualnie wczytanych wydarzeĹ„.
            </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-3 px-4 py-0">
            <div class="border-border rounded-xl border p-4">
                <div class="flex items-start gap-3">
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"
                    >
                        <ListChecks class="size-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p class="font-extrabold">{{ eventCount }} wydarzeĹ„</p>
                        <p class="text-muted-foreground text-sm">
                            Wszystkie wczytane dla wybranego dnia
                        </p>
                    </div>
                </div>
            </div>

            <div class="border-border rounded-xl border p-4">
                <div class="flex items-start gap-3">
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                    >
                        <Clock3 class="size-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p class="font-extrabold">
                            {{ plannedEvents }} zaplanowane
                        </p>
                        <p class="text-muted-foreground text-sm">
                            Status: zaplanowane
                        </p>
                    </div>
                </div>
            </div>

            <div class="border-border rounded-xl border p-4">
                <div class="flex items-start gap-3">
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
                    >
                        <Users class="size-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p class="font-extrabold">
                            {{ participantTotal }} kursantĂłw
                        </p>
                        <p class="text-muted-foreground text-sm">
                            Suma uczestnikĂłw w wydarzeniach
                        </p>
                    </div>
                </div>
            </div>

            <div
                v-if="attentionEvents.length > 0"
                class="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-amber-900"
            >
                <p class="font-extrabold">
                    {{ attentionEvents.length }} wymagajÄ… uwagi
                </p>
                <p class="text-sm">
                    Anulowane lub oznaczone jako nieobecnoĹ›Ä‡.
                </p>
            </div>
        </UiCardContent>
    </UiCard>
</template>
