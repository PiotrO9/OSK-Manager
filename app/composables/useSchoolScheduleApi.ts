import type { ScheduleLessonItem } from '~/types/schedule';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';

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
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/driving-schools/${encodeURIComponent(sid)}/schedule?${params.toString()}`,
                ),
                { credentials: 'include' },
            );

            const data = unwrapApiSuccessData<{ items: ScheduleLessonItem[] }>(
                raw,
            );

            return Array.isArray(data?.items) ? data.items : [];
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        fetchSchoolSchedule,
    };
}
