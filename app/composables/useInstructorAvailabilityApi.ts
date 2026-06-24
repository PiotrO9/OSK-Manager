import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { WeeklyEntry } from '~/types/instructorAvailability';

function buildWeeklyBasePath(instructorId: string): string {
    return `/api/instructors/${encodeURIComponent(instructorId)}/availability/weekly`;
}

function normalizeWeeklyEntries(data: unknown): WeeklyEntry[] {
    const weekly = (data as { weekly?: unknown } | null)?.weekly;

    return Array.isArray(weekly) ? (weekly as WeeklyEntry[]) : [];
}

function normalizeWeeklyEntry(data: unknown): WeeklyEntry | null {
    const entry = (data as { entry?: unknown } | null)?.entry;

    return entry && typeof entry === 'object' ? (entry as WeeklyEntry) : null;
}

export function useInstructorAvailabilityApi(
    instructorId: MaybeRefOrGetter<string>,
) {
    const isLoading = ref(false);
    const isSaving = ref(false);

    async function fetchWeekly(): Promise<WeeklyEntry[]> {
        const id = toValue(instructorId).trim();

        if (!id) {
            return [];
        }

        isLoading.value = true;

        try {
            return await requestBffData<WeeklyEntry[]>(
                'GET',
                buildWeeklyBasePath(id),
                {
                    fallbackMessage:
                        'Nie udało się pobrać dostępności instruktora.',
                    normalize: normalizeWeeklyEntries,
                },
            );
        } finally {
            isLoading.value = false;
        }
    }

    async function saveDay(
        dayOfWeek: number,
        startTime: string,
        endTime: string,
    ): Promise<WeeklyEntry> {
        const id = toValue(instructorId).trim();

        if (!id) {
            throw new Error('Brak identyfikatora instruktora.');
        }

        isSaving.value = true;

        try {
            return await requestBffData<WeeklyEntry>(
                'PUT',
                `${buildWeeklyBasePath(id)}/${dayOfWeek}`,
                {
                    body: { startTime, endTime },
                    fallbackMessage:
                        'Nie udało się zapisać dostępności instruktora.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: normalizeWeeklyEntry,
                },
            );
        } finally {
            isSaving.value = false;
        }
    }

    async function deleteDay(dayOfWeek: number): Promise<void> {
        const id = toValue(instructorId).trim();

        if (!id) {
            throw new Error('Brak identyfikatora instruktora.');
        }

        isSaving.value = true;

        try {
            await requestBffData<unknown>(
                'DELETE',
                `${buildWeeklyBasePath(id)}/${dayOfWeek}`,
                {
                    fallbackMessage:
                        'Nie udało się usunąć dostępności instruktora.',
                },
            );
        } finally {
            isSaving.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        fetchWeekly,
        saveDay,
        deleteDay,
    };
}
