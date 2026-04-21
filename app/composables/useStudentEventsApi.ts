import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import type { ScheduleLessonItem } from '~/types/schedule';
import {
    filterScheduleItemsByYyyyMmDdRange,
    studentEventsPayloadToScheduleItems,
} from '~/utils/studentEventsToScheduleItems';

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
        const url = resolveBffEndpoint(
            `/api/students/${encodeURIComponent(uid)}/events${qs.length > 0 ? `?${qs}` : ''}`,
        );

        const raw = await $fetch<unknown>(url, {
            credentials: 'include',
        });

        const data = unwrapApiSuccessData<unknown>(raw);
        let items = studentEventsPayloadToScheduleItems(data);

        if (from && to) {
            items = filterScheduleItemsByYyyyMmDdRange(items, from, to);
        }

        return items;
    }

    return {
        fetchStudentEvents,
    };
}
