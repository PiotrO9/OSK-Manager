import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    filterScheduleItemsByYyyyMmDdRange,
    studentEventsPayloadToScheduleItems,
} from '~/utils/schedule/studentEventsToScheduleItems';

export function useStudentEventsApi() {
    async function fetchStudentEvents(
        userId: string,
        options?: { dateFrom?: string; dateTo?: string },
    ): Promise<ScheduleLessonItem[]> {
        const uid = userId.trim();

        if (!uid) {
            return [];
        }

        const params = new URLSearchParams();
        const from = options?.dateFrom?.trim() ?? '';
        const to = options?.dateTo?.trim() ?? '';

        if (from && to) {
            params.set('dateFrom', from);
            params.set('dateTo', to);
        }

        const qs = params.toString();
        const items = await requestBffData<ScheduleLessonItem[]>(
            'GET',
            `/api/students/${encodeURIComponent(uid)}/events${qs.length > 0 ? `?${qs}` : ''}`,
            {
                fallbackMessage: 'Nie udało się pobrać wydarzeń kursanta.',
                normalize: studentEventsPayloadToScheduleItems,
            },
        );

        return from && to
            ? filterScheduleItemsByYyyyMmDdRange(items, from, to)
            : items;
    }

    return {
        fetchStudentEvents,
    };
}
