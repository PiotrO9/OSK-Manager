import type { H3Event } from 'h3';
import { bffUpstreamInstructorsList } from '~~/server/utils/instructorsBff';
import {
    bffScheduleManagerGet,
    type ScheduleItemResponse,
} from '~~/server/utils/scheduleBff';

function parseInstructorIdsFromListData(data: unknown): string[] {
    if (!data || typeof data !== 'object') {
        return [];
    }

    const o = data as Record<string, unknown>;
    const arr = o.instructors;

    if (!Array.isArray(arr)) {
        return [];
    }

    const ids: string[] = [];

    for (const item of arr) {
        if (item !== null && typeof item === 'object' && 'id' in item) {
            const id = String((item as { id: unknown }).id).trim();

            if (id) {
                ids.push(id);
            }
        }
    }

    return ids;
}

export async function bffAggregateSchoolSchedule(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
    dateFrom: string,
    dateTo: string,
): Promise<{ success: true; data: { items: ScheduleItemResponse[] } }> {
    const listRes = await bffUpstreamInstructorsList(
        event,
        upstreamBase,
        schoolId,
    );

    const instructorIds = parseInstructorIdsFromListData(listRes.data);

    if (instructorIds.length === 0) {
        return {
            success: true,
            data: { items: [] },
        };
    }

    const settled = await Promise.allSettled(
        instructorIds.map(async (instructorId) => {
            const params = new URLSearchParams({
                dateFrom,
                dateTo,
                instructorId,
            });

            const r = await bffScheduleManagerGet(
                event,
                upstreamBase,
                params.toString(),
            );

            return r.data.items;
        }),
    );

    const items: ScheduleItemResponse[] = [];

    for (const r of settled) {
        if (r.status === 'fulfilled') {
            items.push(...r.value);
        }
    }

    items.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const seen = new Set<string>();
    const unique: ScheduleItemResponse[] = [];

    for (const it of items) {
        if (seen.has(it.id)) {
            continue;
        }

        seen.add(it.id);
        unique.push(it);
    }

    return {
        success: true,
        data: { items: unique },
    };
}
