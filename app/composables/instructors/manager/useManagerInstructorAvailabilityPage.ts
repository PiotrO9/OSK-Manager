import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type { WeeklyDayFormRow } from '~/types/instructors/instructorAvailability';
import {
    buildEmptyWeekRows,
    mergeWeeklyEntriesToRows,
} from '~/types/instructors/instructorAvailability';
import { useAppToast } from '~/composables/core/useAppToast';
import { useInstructorAvailabilityApi } from '~/composables/instructors/useInstructorAvailabilityApi';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    formatInstructorAvailabilityDuration,
    getInstructorAvailabilityChangedRows,
    validateInstructorAvailabilityRows,
} from '~/utils/instructors/managerInstructorAvailabilityEditor';

function cloneRows(rows: readonly WeeklyDayFormRow[]): WeeklyDayFormRow[] {
    return rows.map((row) => ({ ...row }));
}

function upsertSavedRow(
    rows: readonly WeeklyDayFormRow[],
    nextRow: WeeklyDayFormRow,
): WeeklyDayFormRow[] {
    return rows.map((row) =>
        row.dayOfWeek === nextRow.dayOfWeek ? { ...nextRow } : row,
    );
}

export function useManagerInstructorAvailabilityPage(
    instructorId: () => string,
) {
    const { addToast } = useAppToast();
    const { isLoading, isSaving, fetchWeekly, saveDay, deleteDay } =
        useInstructorAvailabilityApi(instructorId);

    const rows = ref<WeeklyDayFormRow[]>(buildEmptyWeekRows());
    const savedRows = ref<WeeklyDayFormRow[]>(buildEmptyWeekRows());
    const loadError = ref<string | null>(null);
    const formError = ref<string | null>(null);
    const rowErrors = ref<Record<number, string | null>>({});
    const calendarRefreshKey = ref(0);

    let loadSeq = 0;

    const changedRows = computed(() =>
        getInstructorAvailabilityChangedRows(rows.value, savedRows.value),
    );

    const dirtyDayCount = computed(() => changedRows.value.length);
    const hasDirtyChanges = computed(() => dirtyDayCount.value > 0);

    const activeDayCount = computed(
        () => rows.value.filter((row) => row.enabled).length,
    );

    const totalDurationLabel = computed(() =>
        formatInstructorAvailabilityDuration(rows.value),
    );

    const canSave = computed(
        () =>
            hasDirtyChanges.value &&
            !isLoading.value &&
            !isSaving.value &&
            instructorId().trim().length > 0,
    );

    function getRowError(dayOfWeek: number): string | null {
        return rowErrors.value[dayOfWeek] ?? null;
    }

    function setRowError(dayOfWeek: number, message: string | null): void {
        rowErrors.value = { ...rowErrors.value, [dayOfWeek]: message };
    }

    function replaceRow(
        dayOfWeek: number,
        patch: Partial<WeeklyDayFormRow>,
    ): void {
        rows.value = rows.value.map((row) =>
            row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row,
        );
        setRowError(dayOfWeek, null);
        formError.value = null;
    }

    function updateDayEnabled(dayOfWeek: number, enabled: boolean): void {
        replaceRow(dayOfWeek, { enabled });
    }

    function updateStartTime(dayOfWeek: number, startTime: string): void {
        replaceRow(dayOfWeek, { startTime });
    }

    function updateEndTime(dayOfWeek: number, endTime: string): void {
        replaceRow(dayOfWeek, { endTime });
    }

    function resetDraft(): void {
        rows.value = cloneRows(savedRows.value);
        rowErrors.value = {};
        formError.value = null;
    }

    async function loadAvailability(): Promise<void> {
        const id = instructorId().trim();
        const seq = ++loadSeq;

        loadError.value = null;
        formError.value = null;
        rowErrors.value = {};

        if (!id) {
            rows.value = buildEmptyWeekRows();
            savedRows.value = buildEmptyWeekRows();
            loadError.value = 'Brak identyfikatora instruktora.';

            return;
        }

        try {
            const entries = await fetchWeekly();

            if (seq !== loadSeq) {
                return;
            }

            const nextRows = mergeWeeklyEntriesToRows(entries);

            rows.value = cloneRows(nextRows);
            savedRows.value = cloneRows(nextRows);
        } catch (err: unknown) {
            if (seq !== loadSeq) {
                return;
            }

            loadError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać dostępności.',
            );
        }
    }

    async function saveChanges(): Promise<void> {
        if (!canSave.value) {
            return;
        }

        const rowsToSave = cloneRows(changedRows.value);
        const validation = validateInstructorAvailabilityRows(rowsToSave);

        rowErrors.value = validation.rowErrors;
        formError.value = validation.formError;

        if (validation.hasErrors) {
            return;
        }

        let savedCount = 0;

        try {
            for (const row of rowsToSave) {
                if (row.enabled) {
                    const entry = await saveDay(
                        row.dayOfWeek,
                        row.startTime,
                        row.endTime,
                    );
                    const savedRow = { ...row, entryId: entry.id };

                    savedRows.value = upsertSavedRow(savedRows.value, savedRow);
                    rows.value = upsertSavedRow(rows.value, savedRow);
                    savedCount += 1;

                    continue;
                }

                if (row.entryId !== null) {
                    await deleteDay(row.dayOfWeek);

                    const savedRow = { ...row, entryId: null };

                    savedRows.value = upsertSavedRow(savedRows.value, savedRow);
                    rows.value = upsertSavedRow(rows.value, savedRow);
                    savedCount += 1;
                }
            }

            calendarRefreshKey.value += 1;

            addToast({
                title: 'Zapisano dostępność',
                description: `Zmienione dni: ${savedCount}.`,
                variant: 'success',
            });
        } catch (err: unknown) {
            formError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać wszystkich zmian.',
            );

            if (savedCount > 0) {
                calendarRefreshKey.value += 1;
            }
        }
    }

    function handleBeforeUnload(event: BeforeUnloadEvent): void {
        if (!hasDirtyChanges.value) {
            return;
        }

        event.preventDefault();
        event.returnValue = '';
    }

    onBeforeRouteLeave((_to, _from, next) => {
        if (!hasDirtyChanges.value || !import.meta.client) {
            next();

            return;
        }

        if (
            window.confirm(
                'Masz niezapisane zmiany dostępności. Czy na pewno chcesz opuścić widok?',
            )
        ) {
            next();

            return;
        }

        next(false);
    });

    watch(
        instructorId,
        () => {
            void loadAvailability();
        },
        { immediate: true },
    );

    if (import.meta.client) {
        window.addEventListener('beforeunload', handleBeforeUnload);
        onBeforeUnmount(() => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        });
    }

    return {
        rows,
        loadError,
        formError,
        isLoading,
        isSaving,
        calendarRefreshKey,
        dirtyDayCount,
        activeDayCount,
        totalDurationLabel,
        hasDirtyChanges,
        canSave,
        getRowError,
        loadAvailability,
        resetDraft,
        saveChanges,
        updateDayEnabled,
        updateStartTime,
        updateEndTime,
    };
}
