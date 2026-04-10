<script setup lang="ts">
import {
    mergeWeeklyEntriesToRows,
    buildEmptyWeekRows,
    type WeeklyDayFormRow,
} from '~/types/instructorAvailability';
import { useInstructorAvailabilityApi } from '~/composables/useInstructorAvailabilityApi';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { useAppToast } from '~/composables/useAppToast';
import { getAvailabilityTimelineBarStyle } from '~/utils/availabilityTimeline';

const props = defineProps<{
    instructorId: string;
}>();

const { addToast } = useAppToast();
const { isLoading, fetchWeekly, saveDay, deleteDay } =
    useInstructorAvailabilityApi(() => props.instructorId);

const rows = ref<WeeklyDayFormRow[]>(buildEmptyWeekRows());
const loadError = ref<string | null>(null);
const isSavingRow = ref<Record<number, boolean>>({});
const rowError = ref<Record<number, string | null>>({});

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

function setRowSaving(dayOfWeek: number, value: boolean): void {
    isSavingRow.value = { ...isSavingRow.value, [dayOfWeek]: value };
}

function setRowError(dayOfWeek: number, message: string | null): void {
    rowError.value = { ...rowError.value, [dayOfWeek]: message };
}

function isRowSaving(dayOfWeek: number): boolean {
    return isSavingRow.value[dayOfWeek] === true;
}

function getRowError(dayOfWeek: number): string | null {
    return rowError.value[dayOfWeek] ?? null;
}

function getDraftTimelineBar(row: WeeklyDayFormRow) {
    if (!row.enabled) {
        return null;
    }

    return getAvailabilityTimelineBarStyle(row.startTime, row.endTime);
}

const rowsWithDraftBars = computed(() =>
    rows.value.map((row) => ({
        row,
        draftBar: getDraftTimelineBar(row),
    })),
);

function validateRow(row: WeeklyDayFormRow): string | null {
    if (!row.enabled) {
        return null;
    }

    if (!row.startTime) {
        return 'Podaj godzinę rozpoczęcia.';
    }

    if (!row.endTime) {
        return 'Podaj godzinę zakończenia.';
    }

    if (row.startTime >= row.endTime) {
        return 'Godzina rozpoczęcia musi być wcześniejsza niż zakończenia.';
    }

    return null;
}

async function loadData(): Promise<void> {
    loadError.value = null;

    if (!props.instructorId.trim()) {
        loadError.value = 'Brak identyfikatora instruktora.';

        return;
    }

    try {
        const entries = await fetchWeekly();

        rows.value = mergeWeeklyEntriesToRows(entries);
    } catch (err: unknown) {
        loadError.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać dostępności.',
        );
    }
}

async function handleToggleDay(row: WeeklyDayFormRow): Promise<void> {
    setRowError(row.dayOfWeek, null);

    if (row.enabled) {
        if (row.entryId !== null) {
            setRowSaving(row.dayOfWeek, true);

            try {
                await deleteDay(row.dayOfWeek);

                row.entryId = null;
                row.enabled = false;

                addToast({
                    title: 'Dzień wyłączony',
                    description: `${row.label} — brak dostępności.`,
                    variant: 'success',
                });
            } catch (err: unknown) {
                setRowError(
                    row.dayOfWeek,
                    getApiFetchErrorMessage(
                        err,
                        'Nie udało się usunąć dostępności.',
                    ),
                );
            } finally {
                setRowSaving(row.dayOfWeek, false);
            }

            return;
        }

        row.enabled = false;

        return;
    }

    row.enabled = true;
}

async function handleSaveRow(row: WeeklyDayFormRow): Promise<void> {
    setRowError(row.dayOfWeek, null);

    const validationError = validateRow(row);

    if (validationError) {
        setRowError(row.dayOfWeek, validationError);

        return;
    }

    if (!row.enabled) {
        return;
    }

    setRowSaving(row.dayOfWeek, true);

    try {
        const entry = await saveDay(row.dayOfWeek, row.startTime, row.endTime);

        row.entryId = entry.id;

        addToast({
            title: 'Zapisano',
            description: `${row.label}: ${row.startTime}–${row.endTime}`,
            variant: 'success',
        });
    } catch (err: unknown) {
        setRowError(
            row.dayOfWeek,
            getApiFetchErrorMessage(err, 'Nie udało się zapisać.'),
        );
    } finally {
        setRowSaving(row.dayOfWeek, false);
    }
}

onMounted(loadData);
</script>

<template>
    <div class="space-y-4">
        <p
            v-if="isLoading"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Wczytywanie dostępności…
        </p>

        <p
            v-else-if="loadError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ loadError }}
        </p>

        <template v-else>
            <div
                class="border-border bg-card overflow-hidden rounded-xl border shadow-sm"
                role="list"
                aria-label="Tygodniowa dostępność instruktora"
            >
                <div class="bg-muted/30 border-border border-b px-4 py-3">
                    <p class="text-muted-foreground text-xs font-medium">
                        Oś czasu (podgląd 6:00–22:00) — zmiana godzin odświeża
                        pasek natychmiast.
                    </p>
                    <div
                        class="text-muted-foreground mt-2 flex justify-between text-[10px] font-medium tracking-wide uppercase sm:text-xs"
                        aria-hidden="true"
                    >
                        <span>6:00</span>
                        <span>14:00</span>
                        <span>22:00</span>
                    </div>
                </div>

                <div
                    v-for="(item, index) in rowsWithDraftBars"
                    :key="item.row.dayOfWeek"
                    role="listitem"
                    :class="[
                        'px-4 py-4',
                        index !== rowsWithDraftBars.length - 1
                            ? 'border-border border-b'
                            : '',
                    ]"
                >
                    <div
                        class="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5"
                    >
                        <div
                            class="flex w-full shrink-0 items-center gap-3 lg:w-44"
                        >
                            <UiSwitch
                                :id="`availability-toggle-${item.row.dayOfWeek}`"
                                :checked="item.row.enabled"
                                :disabled="isRowSaving(item.row.dayOfWeek)"
                                :aria-label="`Włącz dostępność: ${item.row.label}`"
                                @update:checked="handleToggleDay(item.row)"
                            />
                            <label
                                :for="`availability-toggle-${item.row.dayOfWeek}`"
                                class="cursor-pointer text-sm font-medium select-none"
                                :class="
                                    item.row.enabled
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                "
                            >
                                {{ item.row.label }}
                            </label>
                        </div>

                        <div class="min-w-0 flex-1 space-y-3">
                            <div
                                class="bg-muted/70 border-border/60 relative h-8 w-full overflow-hidden rounded-md border"
                                aria-hidden="true"
                            >
                                <div
                                    v-if="item.draftBar"
                                    class="bg-primary/85 absolute top-1 bottom-1 rounded shadow-sm transition-[left,width] duration-150 ease-out"
                                    :style="{
                                        left: item.draftBar.leftPct + '%',
                                        width: item.draftBar.widthPct + '%',
                                    }"
                                />
                                <div
                                    v-else-if="!item.row.enabled"
                                    class="bg-muted/45 absolute inset-0"
                                />
                                <div
                                    v-else
                                    class="text-muted-foreground/60 absolute inset-0 flex items-center justify-center text-[10px] font-medium sm:text-xs"
                                >
                                    Ustaw prawidłowe godziny
                                </div>
                            </div>

                            <div
                                class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                            >
                                <div class="flex items-center gap-2">
                                    <label
                                        :for="`availability-start-${item.row.dayOfWeek}`"
                                        class="text-muted-foreground w-6 shrink-0 text-xs"
                                    >
                                        od
                                    </label>
                                    <input
                                        :id="`availability-start-${item.row.dayOfWeek}`"
                                        v-model="item.row.startTime"
                                        type="time"
                                        :disabled="
                                            !item.row.enabled ||
                                            isRowSaving(item.row.dayOfWeek)
                                        "
                                        :aria-label="`Godzina rozpoczęcia — ${item.row.label}`"
                                        :class="[fieldClass, 'w-32']"
                                    />
                                </div>

                                <div class="flex items-center gap-2">
                                    <label
                                        :for="`availability-end-${item.row.dayOfWeek}`"
                                        class="text-muted-foreground w-6 shrink-0 text-xs"
                                    >
                                        do
                                    </label>
                                    <input
                                        :id="`availability-end-${item.row.dayOfWeek}`"
                                        v-model="item.row.endTime"
                                        type="time"
                                        :disabled="
                                            !item.row.enabled ||
                                            isRowSaving(item.row.dayOfWeek)
                                        "
                                        :aria-label="`Godzina zakończenia — ${item.row.label}`"
                                        :class="[fieldClass, 'w-32']"
                                    />
                                </div>

                                <button
                                    v-if="item.row.enabled"
                                    type="button"
                                    class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium shadow-sm hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                    :disabled="isRowSaving(item.row.dayOfWeek)"
                                    :aria-busy="isRowSaving(item.row.dayOfWeek)"
                                    :aria-label="`Zapisz dostępność: ${item.row.label}`"
                                    @click="handleSaveRow(item.row)"
                                >
                                    {{
                                        isRowSaving(item.row.dayOfWeek)
                                            ? 'Zapisywanie…'
                                            : 'Zapisz'
                                    }}
                                </button>

                                <span
                                    v-else
                                    class="text-muted-foreground text-xs italic"
                                >
                                    Brak dostępności
                                </span>
                            </div>

                            <p
                                v-if="getRowError(item.row.dayOfWeek)"
                                class="text-destructive text-xs"
                                role="alert"
                                aria-live="polite"
                            >
                                {{ getRowError(item.row.dayOfWeek) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-xs">
                Zmiany są zapisywane osobno dla każdego dnia po kliknięciu
                „Zapisz".
            </p>
        </template>
    </div>
</template>
