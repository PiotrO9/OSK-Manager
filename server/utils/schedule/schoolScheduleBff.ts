import type { H3Event } from 'h3';
import { bffUpstreamInstructorsList } from '~~/server/utils/instructors/instructorsBff';
import {
    bffScheduleManagerGet,
    type ScheduleItemResponse,
} from '~~/server/utils/schedule/scheduleBff';

function parseInstructorIdsFromListData(data: unknown): string[] {
    if (!data || typeof data !== 'object') {
        return [];
    }

    const responseRecord = data as Record<string, unknown>;
    const instructorRows = responseRecord.instructors;

    if (!Array.isArray(instructorRows)) {
        return [];
    }

    const instructorIds: string[] = [];

    for (const item of instructorRows) {
        if (item !== null && typeof item === 'object' && 'id' in item) {
            const id = String((item as { id: unknown }).id).trim();

            if (id) {
                instructorIds.push(id);
            }
        }
    }

    return instructorIds;
}

export async function bffAggregateSchoolSchedule(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
    dateFrom: string,
    dateTo: string,
): Promise<{ success: true; data: { items: ScheduleItemResponse[] } }> {
    const instructorListResponse = await bffUpstreamInstructorsList(
        event,
        upstreamBase,
        schoolId,
    );

    const instructorIds = parseInstructorIdsFromListData(
        instructorListResponse.data,
    );

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

            const scheduleResponse = await bffScheduleManagerGet(
                event,
                upstreamBase,
                params.toString(),
            );

            return scheduleResponse.data.items;
        }),
    );

    const items: ScheduleItemResponse[] = [];

    for (const requestResult of settled) {
        if (requestResult.status === 'fulfilled') {
            items.push(...requestResult.value);
        }
    }

    items.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const seen = new Set<string>();
    const unique: ScheduleItemResponse[] = [];

    for (const scheduleItem of items) {
        if (seen.has(scheduleItem.id)) {
            continue;
        }

        seen.add(scheduleItem.id);
        unique.push(scheduleItem);
    }

    return {
        success: true,
        data: { items: unique },
    };
}
