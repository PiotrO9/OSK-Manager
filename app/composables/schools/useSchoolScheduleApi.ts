import type { ScheduleLessonItem } from '~/types/schedule/schedule';

function normalizeScheduleItems(data: unknown): ScheduleLessonItem[] {
    const items = (data as { items?: unknown } | null)?.items;

    return Array.isArray(items) ? (items as ScheduleLessonItem[]) : [];
}

export function useSchoolScheduleApi() {
    const isLoading = ref(false);

    async function fetchSchoolSchedule(
        schoolId: string,
        dateFrom: string,
        dateTo: string,
    ): Promise<ScheduleLessonItem[]> {
        const sid = schoolId.trim();
        const from = dateFrom.trim();
        const to = dateTo.trim();

        if (!sid || !from || !to) {
            return [];
        }

        const params = new URLSearchParams({
            dateFrom: from,
            dateTo: to,
        });

        isLoading.value = true;

        try {
            return await requestBffData<ScheduleLessonItem[]>(
                'GET',
                `/api/driving-schools/${encodeURIComponent(sid)}/schedule?${params.toString()}`,
                {
                    fallbackMessage: 'Nie udało się pobrać harmonogramu.',
                    normalize: normalizeScheduleItems,
                },
            );
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        fetchSchoolSchedule,
    };
}
