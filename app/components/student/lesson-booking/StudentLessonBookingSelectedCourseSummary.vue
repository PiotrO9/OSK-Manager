<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next';
import type { CurrentUserCourseItem } from '~/types/courses/course';

const props = defineProps<{
    selectedCourse: CurrentUserCourseItem | null;
    selectedCourseTypeLabel: string;
    remainingCourseHours: number | null;
}>();

const programHours = computed(() => props.selectedCourse?.totalHours ?? 0);

const usedHours = computed(() => props.selectedCourse?.progress ?? 0);

const remainingHours = computed(() => {
    if (props.remainingCourseHours !== null) {
        return props.remainingCourseHours;
    }

    return Math.max(0, programHours.value - usedHours.value);
});

const usedPercent = computed(() => {
    if (programHours.value <= 0) {
        return 0;
    }

    return Math.min(
        100,
        Math.round((usedHours.value / programHours.value) * 100),
    );
});

const progressBarLabel = computed(() => {
    if (!props.selectedCourse) {
        return 'Postęp godzin programu kursu';
    }

    return `Wykorzystano ${usedHours.value} z ${programHours.value} godzin programu`;
});
</script>

<template>
    <UiCard
        class="gap-0 self-start overflow-hidden rounded-xl py-0 shadow-xs"
    >
        <div class="border-border border-b px-4 py-3 sm:px-5">
            <h2 class="text-foreground text-base font-semibold">
                Kontekst rezerwacji
            </h2>
            <p class="text-muted-foreground mt-0.5 text-sm">
                Aktywny kurs i postęp programu.
            </p>
        </div>

        <UiCardContent class="space-y-4 px-4 py-4 sm:px-5">
            <div class="flex items-start gap-3">
                <div
                    class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl"
                    aria-hidden="true"
                >
                    <GraduationCap class="size-5" />
                </div>
                <div class="min-w-0 space-y-1">
                    <p class="truncate font-semibold">
                        {{ selectedCourse?.name ?? 'Nie wybrano kursu' }}
                    </p>
                    <p class="text-muted-foreground text-sm">
                        {{ selectedCourseTypeLabel }}
                    </p>
                </div>
            </div>

            <div v-if="selectedCourse" class="space-y-2">
                <div
                    class="text-muted-foreground flex items-center justify-between gap-3 text-xs tabular-nums"
                >
                    <span class="text-foreground font-medium">
                        Postęp programu
                    </span>
                    <span>
                        Wykorzystano
                        <span class="text-foreground font-medium">
                            {{ usedHours }}
                        </span>
                        / {{ programHours }} godz.
                    </span>
                </div>

                <div
                    class="bg-muted h-2.5 w-full overflow-hidden rounded-full"
                    role="progressbar"
                    :aria-valuenow="usedHours"
                    :aria-valuemin="0"
                    :aria-valuemax="programHours"
                    :aria-label="progressBarLabel"
                >
                    <div
                        class="bg-primary h-full rounded-full transition-[width]"
                        :style="{ width: `${usedPercent}%` }"
                    />
                </div>

                <p
                    v-if="remainingHours === 0"
                    class="text-destructive text-xs font-medium"
                    role="status"
                >
                    Brak godzin do wykorzystania — wybierz inny kurs lub
                    skontaktuj się ze szkołą.
                </p>
            </div>

            <p v-else class="text-muted-foreground text-sm">
                Wybierz kurs praktyczny, aby zobaczyć postęp programu.
            </p>
        </UiCardContent>
    </UiCard>
</template>
