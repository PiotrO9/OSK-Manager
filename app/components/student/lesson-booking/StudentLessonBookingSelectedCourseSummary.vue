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
    <section
        class="border-border bg-card grid gap-4 rounded-xl border p-4 shadow-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
        aria-label="Wybrany kurs i saldo godzin"
    >
        <div class="flex min-w-0 items-center gap-3">
            <div
                class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                aria-hidden="true"
            >
                <GraduationCap class="size-5" />
            </div>
            <div class="min-w-0">
                <p class="text-muted-foreground text-xs font-medium">
                    Wybrany kurs
                </p>
                <p class="truncate font-semibold">
                    {{ selectedCourse?.name ?? 'Nie wybrano kursu' }}
                </p>
                <p class="text-muted-foreground text-xs">
                    {{ selectedCourseTypeLabel }}
                </p>
            </div>
        </div>

        <div v-if="selectedCourse" class="grid gap-3 sm:min-w-80">
            <div class="flex items-end justify-between gap-4">
                <div>
                    <p class="text-muted-foreground text-xs">Pozostało</p>
                    <p
                        class="text-foreground text-lg font-semibold tabular-nums"
                    >
                        {{ remainingHours }} godz.
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-muted-foreground text-xs">Wykorzystano</p>
                    <p class="text-foreground text-sm font-medium tabular-nums">
                        {{ usedHours }} / {{ programHours }} godz.
                    </p>
                </div>
            </div>

            <div
                class="bg-muted h-2 w-full overflow-hidden rounded-full"
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
        </div>
    </section>
</template>
