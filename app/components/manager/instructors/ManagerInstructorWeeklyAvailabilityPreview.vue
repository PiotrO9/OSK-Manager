<script setup lang="ts">
import {
    WEEK_DAYS_ORDER,
    WEEK_DAY_LABELS,
    WEEK_DAY_SHORT_LABELS,
    type WeeklyEntry,
} from '~/types/instructorAvailability';
import { useInstructorAvailabilityApi } from '~/composables/useInstructorAvailabilityApi';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    getAvailabilityTimelineBarStyle,
    type AvailabilityTimelineBar,
} from '~/utils/availabilityTimeline';

const props = defineProps<{
    instructorId: string;
}>();

const { isLoading, fetchWeekly } = useInstructorAvailabilityApi(
    () => props.instructorId,
);

const entriesByDay = ref<Map<number, WeeklyEntry>>(new Map());
const loadError = ref<string | null>(null);

function getRowAriaLabel(
    dayOfWeek: number,
    entry: WeeklyEntry | undefined,
): string {
    const long = WEEK_DAY_LABELS[dayOfWeek] ?? `Dzień ${dayOfWeek}`;

    if (!entry) {
        return `${long}: brak ustawionej dostępności`;
    }

    return `${long}: dostępny od ${entry.startTime} do ${entry.endTime}`;
}

interface PreviewRow {
    dayOfWeek: number;
    shortLabel: string;
    longLabel: string;
    entry: WeeklyEntry | undefined;
    bar: AvailabilityTimelineBar | null;
}

const previewRows = computed((): PreviewRow[] => {
    const map = entriesByDay.value;

    return WEEK_DAYS_ORDER.map((dayOfWeek) => {
        const entry = map.get(dayOfWeek);
        const bar =
            entry != null
                ? getAvailabilityTimelineBarStyle(
                      entry.startTime,
                      entry.endTime,
                  )
                : null;

        return {
            dayOfWeek,
            shortLabel: WEEK_DAY_SHORT_LABELS[dayOfWeek] ?? '?',
            longLabel: WEEK_DAY_LABELS[dayOfWeek] ?? `Dzień ${dayOfWeek}`,
            entry,
            bar,
        };
    });
});

async function loadSchedule(): Promise<void> {
    loadError.value = null;

    if (!props.instructorId.trim()) {
        entriesByDay.value = new Map();

        return;
    }

    try {
        const list = await fetchWeekly();
        const map = new Map<number, WeeklyEntry>();

        for (const e of list) {
            map.set(e.dayOfWeek, e);
        }

        entriesByDay.value = map;
    } catch (err: unknown) {
        entriesByDay.value = new Map();
        loadError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać harmonogramu.',
        );
    }
}

watch(
    () => props.instructorId,
    () => {
        void loadSchedule();
    },
    { immediate: true },
);
</script>

<template>
    <section class="space-y-3" aria-label="Tygodniowa dostępność instruktora">
        <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
                <h3 class="text-foreground text-sm font-semibold">
                    Tygodniowa dostępność
                </h3>
                <p class="text-muted-foreground mt-0.5 text-xs">
                    Podgląd wzorca 6:00–22:00. Pełna edycja w widoku
                    dostępności.
                </p>
            </div>
        </div>

        <p
            v-if="isLoading"
            class="text-muted-foreground text-xs"
            role="status"
            aria-live="polite"
        >
            Wczytywanie harmonogramu…
        </p>

        <p v-else-if="loadError" class="text-destructive text-xs" role="alert">
            {{ loadError }}
        </p>

        <div v-else class="space-y-1">
            <div
                class="text-muted-foreground mb-2 flex justify-between text-[10px] font-medium tracking-wide uppercase sm:text-xs"
                aria-hidden="true"
            >
                <span>6:00</span>
                <span>14:00</span>
                <span>22:00</span>
            </div>

            <ul class="space-y-2.5" role="list">
                <li
                    v-for="row in previewRows"
                    :key="row.dayOfWeek"
                    class="grid grid-cols-[2rem_1fr] items-center gap-2 sm:grid-cols-[2.5rem_1fr]"
                    role="listitem"
                    :aria-label="getRowAriaLabel(row.dayOfWeek, row.entry)"
                >
                    <span
                        class="text-muted-foreground text-center text-xs font-semibold tabular-nums sm:text-sm"
                        :title="row.longLabel"
                    >
                        {{ row.shortLabel }}
                    </span>

                    <div class="min-w-0">
                        <div
                            class="bg-muted/70 border-border/60 relative h-7 w-full overflow-hidden rounded-md border"
                            role="presentation"
                        >
                            <div
                                v-if="row.bar"
                                class="bg-primary/85 absolute top-1 bottom-1 rounded shadow-sm"
                                :style="{
                                    left: row.bar.leftPct + '%',
                                    width: row.bar.widthPct + '%',
                                }"
                            />
                            <div
                                v-else-if="!row.entry"
                                class="bg-muted/40 absolute inset-0"
                            />
                        </div>
                        <p
                            v-if="row.entry"
                            class="text-muted-foreground mt-1 text-[11px] tabular-nums sm:text-xs"
                        >
                            {{ row.entry.startTime }}
                            <span class="mx-0.5">–</span>
                            {{ row.entry.endTime }}
                        </p>
                        <p
                            v-else
                            class="text-muted-foreground mt-1 text-[11px] sm:text-xs"
                        >
                            Brak dostępności
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>
