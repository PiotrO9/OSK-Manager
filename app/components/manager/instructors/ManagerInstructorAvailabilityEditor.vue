<script setup lang="ts">
import {
    mergeWeeklyEntriesToRows,
    buildEmptyWeekRows,
    type WeeklyDayFormRow,
} from '~/types/instructors/instructorAvailability';
import { useInstructorAvailabilityApi } from '~/composables/instructors/useInstructorAvailabilityApi';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { useAppToast } from '~/composables/core/useAppToast';
import {
    getInstructorAvailabilityDraftTimelineBar,
    validateInstructorAvailabilityRow,
} from '~/utils/instructors/managerInstructorAvailabilityEditor';

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

const rowsWithDraftBars = computed(() =>
    rows.value.map((row) => ({
        row,
        draftBar: getInstructorAvailabilityDraftTimelineBar(row),
    })),
);

function updateRowStartTime(row: WeeklyDayFormRow, value: string): void {
    row.startTime = value;
}

function updateRowEndTime(row: WeeklyDayFormRow, value: string): void {
    row.endTime = value;
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

    const validationError = validateInstructorAvailabilityRow(row);

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
                <ManagerInstructorAvailabilityDayRow
                    v-for="item in rowsWithDraftBars"
                    :key="item.row.dayOfWeek"
                    :row="item.row"
                    :draft-bar="item.draftBar"
                    :is-saving="isRowSaving(item.row.dayOfWeek)"
                    :error="getRowError(item.row.dayOfWeek)"
                    @toggle-day="handleToggleDay(item.row)"
                    @save-row="handleSaveRow(item.row)"
                    @update-start-time="updateRowStartTime(item.row, $event)"
                    @update-end-time="updateRowEndTime(item.row, $event)"
                />
            </div>

            <p class="text-muted-foreground text-xs">
                Zmiany zapisują się osobno dla każdego dnia po kliknięciu
                "Zapisz".
            </p>
        </template>
    </div>
</template>
