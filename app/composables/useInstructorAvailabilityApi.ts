import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import type { WeeklyEntry } from '~/types/instructorAvailability';

function buildWeeklyBaseUrl(instructorId: string): string {
    return resolveBffEndpoint(
        `/api/instructors/${encodeURIComponent(instructorId)}/availability/weekly`,
    );
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
            const raw = await $fetch<unknown>(buildWeeklyBaseUrl(id), {
                credentials: 'include',
            });

            const data = unwrapApiSuccessData<{ weekly: WeeklyEntry[] }>(raw);

            return Array.isArray(data?.weekly) ? data.weekly : [];
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
            const url = `${buildWeeklyBaseUrl(id)}/${dayOfWeek}`;

            const raw = await $fetch<unknown>(url, {
                method: 'PUT',
                credentials: 'include',
                body: { startTime, endTime },
            });

            const data = unwrapApiSuccessData<{ entry: WeeklyEntry }>(raw);

            if (!data?.entry) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            return data.entry;
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
            const url = `${buildWeeklyBaseUrl(id)}/${dayOfWeek}`;

            await $fetch<unknown>(url, {
                method: 'DELETE',
                credentials: 'include',
            });
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
