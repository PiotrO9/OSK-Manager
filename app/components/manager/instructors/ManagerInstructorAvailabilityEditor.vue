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
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 min-w-0 rounded-lg border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

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

function getAvailabilityLabel(row: WeeklyDayFormRow): string {
    if (!row.enabled) {
        return 'Brak dostępności';
    }

    return `${row.startTime}-${row.endTime}`;
}

function getStatusLabel(row: WeeklyDayFormRow): string {
    if (!row.enabled) {
        return 'wyłączony';
    }

    if (row.endTime <= '15:00') {
        return 'krócej';
    }

    return 'aktywny';
}

function getStatusClass(row: WeeklyDayFormRow): string {
    if (!row.enabled) {
        return 'bg-slate-100 text-slate-500 ring-slate-200';
    }

    if (row.endTime <= '15:00') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

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
                    description: `${row.label} - brak dostępności.`,
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
            description: `${row.label}: ${row.startTime}-${row.endTime}`,
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
    <div class="space-y-4 p-4 md:p-5">
        <p
            v-if="isLoading"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Wczytywanie dostępności...
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
                class="space-y-2.5"
                role="list"
                aria-label="Tygodniowa dostępność instruktora"
            >
                <article
                    v-for="item in rowsWithDraftBars"
                    :key="item.row.dayOfWeek"
                    class="border-border/80 bg-background rounded-xl border p-3 shadow-xs"
                    role="listitem"
                >
                    <div
                        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0 space-y-1">
                            <div class="flex items-center gap-2">
                                <UiSwitch
                                    :id="`availability-toggle-${item.row.dayOfWeek}`"
                                    :checked="item.row.enabled"
                                    :disabled="isRowSaving(item.row.dayOfWeek)"
                                    :aria-label="`Włącz dostępność: ${item.row.label}`"
                                    @update:checked="handleToggleDay(item.row)"
                                />
                                <label
                                    :for="`availability-toggle-${item.row.dayOfWeek}`"
                                    class="text-foreground cursor-pointer text-sm font-bold select-none"
                                >
                                    {{ item.row.label }}
                                </label>
                            </div>
                            <p
                                class="text-muted-foreground pl-11 text-xs tabular-nums"
                            >
                                {{ getAvailabilityLabel(item.row) }}
                            </p>
                        </div>

                        <span
                            class="inline-flex h-7 w-fit items-center rounded-full px-3 text-xs font-bold ring-1"
                            :class="getStatusClass(item.row)"
                        >
                            {{ getStatusLabel(item.row) }}
                        </span>
                    </div>

                    <div class="mt-3 space-y-3">
                        <div
                            class="bg-muted/50 border-border/60 relative h-2.5 w-full overflow-hidden rounded-full border"
                            aria-hidden="true"
                        >
                            <div
                                v-if="item.draftBar"
                                class="bg-primary absolute top-0.5 bottom-0.5 rounded-full transition-[left,width] duration-150 ease-out"
                                :style="{
                                    left: item.draftBar.leftPct + '%',
                                    width: item.draftBar.widthPct + '%',
                                }"
                            />
                        </div>

                        <div
                            class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                        >
                            <label class="min-w-0 space-y-1">
                                <span
                                    class="text-muted-foreground text-[11px] font-medium"
                                >
                                    Od
                                </span>
                                <input
                                    :id="`availability-start-${item.row.dayOfWeek}`"
                                    v-model="item.row.startTime"
                                    type="time"
                                    :disabled="
                                        !item.row.enabled ||
                                        isRowSaving(item.row.dayOfWeek)
                                    "
                                    :aria-label="`Godzina rozpoczęcia - ${item.row.label}`"
                                    :class="[fieldClass, 'w-full']"
                                />
                            </label>

                            <label class="min-w-0 space-y-1">
                                <span
                                    class="text-muted-foreground text-[11px] font-medium"
                                >
                                    Do
                                </span>
                                <input
                                    :id="`availability-end-${item.row.dayOfWeek}`"
                                    v-model="item.row.endTime"
                                    type="time"
                                    :disabled="
                                        !item.row.enabled ||
                                        isRowSaving(item.row.dayOfWeek)
                                    "
                                    :aria-label="`Godzina zakończenia - ${item.row.label}`"
                                    :class="[fieldClass, 'w-full']"
                                />
                            </label>

                            <UiButton
                                v-if="item.row.enabled"
                                type="button"
                                size="sm"
                                class="self-end rounded-lg"
                                :disabled="isRowSaving(item.row.dayOfWeek)"
                                :aria-busy="isRowSaving(item.row.dayOfWeek)"
                                :aria-label="`Zapisz dostępność: ${item.row.label}`"
                                @click="handleSaveRow(item.row)"
                            >
                                {{
                                    isRowSaving(item.row.dayOfWeek)
                                        ? 'Zapisywanie...'
                                        : 'Zapisz'
                                }}
                            </UiButton>

                            <span
                                v-else
                                class="text-muted-foreground self-end pb-2 text-xs italic"
                            >
                                Wyłączone
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
                </article>
            </div>

            <p class="text-muted-foreground text-xs">
                Zmiany zapisują się osobno dla każdego dnia po kliknięciu
                "Zapisz".
            </p>
        </template>
    </div>
</template>
