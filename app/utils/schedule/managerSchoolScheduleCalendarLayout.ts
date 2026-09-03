import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    isoToDateStr,
    isoToHm,
    lessonDurationMinutes,
    PX_PER_MINUTE,
    SAME_START_TILE_GAP_PX,
    SLOT_END_GUTTER_PX,
    slotTopPx,
} from '~/utils/schedule/managerScheduleCalendarUtils';

export function buildScheduleItemsByDate(
    items: readonly ScheduleLessonItem[],
): Map<string, ScheduleLessonItem[]> {
    const map = new Map<string, ScheduleLessonItem[]>();

    for (const item of items) {
        const dateStr = isoToDateStr(item.startTime);

        if (!dateStr) {
            continue;
        }

        if (!map.has(dateStr)) {
            map.set(dateStr, []);
        }

        map.get(dateStr)!.push(item);
    }

    for (const dayItems of map.values()) {
        dayItems.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
}

export function countScheduleInstructors(
    items: readonly ScheduleLessonItem[],
): number {
    const ids = new Set<string>();
    const names = new Set<string>();

    for (const item of items) {
        const instructor = item.instructor;

        if (!instructor) {
            continue;
        }

        if (instructor.id.trim()) {
            ids.add(instructor.id);
            continue;
        }

        const name = `${instructor.firstName} ${instructor.lastName}`.trim();

        if (name) {
            names.add(name);
        }
    }

    return ids.size + names.size;
}

export function formatEarliestScheduleStartLabel(
    items: readonly ScheduleLessonItem[],
): string {
    const times = items
        .map((item) => new Date(item.startTime))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

    if (times.length === 0) {
        return '--:--';
    }

    return `${String(times[0]!.getHours()).padStart(2, '0')}:${String(
        times[0]!.getMinutes(),
    ).padStart(2, '0')}`;
}

export function getSameStartScheduleItems(
    item: ScheduleLessonItem,
    dayItems: readonly ScheduleLessonItem[],
): ScheduleLessonItem[] {
    const startHm = isoToHm(item.startTime);
    const sameStartItems = dayItems.filter(
        (candidate) => isoToHm(candidate.startTime) === startHm,
    );

    sameStartItems.sort((a, b) => a.id.localeCompare(b.id));

    return sameStartItems;
}

export function calculateSameStartGroupDurationMinutes(
    item: ScheduleLessonItem,
    dayItems: readonly ScheduleLessonItem[],
): number {
    const sameStartItems = getSameStartScheduleItems(item, dayItems);
    let maxMinutes = 1;

    for (const sameStartItem of sameStartItems) {
        maxMinutes = Math.max(maxMinutes, lessonDurationMinutes(sameStartItem));
    }

    return maxMinutes;
}

export function calculateSameStartTileHeightPx(
    item: ScheduleLessonItem,
    dayItems: readonly ScheduleLessonItem[],
): number {
    const sameStartItems = getSameStartScheduleItems(item, dayItems);
    const innerHeightPx = Math.max(
        0,
        calculateSameStartGroupDurationMinutes(item, dayItems) * PX_PER_MINUTE -
            SLOT_END_GUTTER_PX,
    );
    const itemCount = Math.max(1, sameStartItems.length);

    if (itemCount === 1) {
        return Math.max(1, innerHeightPx);
    }

    return Math.max(
        1,
        (innerHeightPx - (itemCount - 1) * SAME_START_TILE_GAP_PX) / itemCount,
    );
}

export function calculateScheduleBlockTopPx(
    item: ScheduleLessonItem,
    dayItems: readonly ScheduleLessonItem[],
): number {
    const sameStartItems = getSameStartScheduleItems(item, dayItems);
    const tileHeightPx = calculateSameStartTileHeightPx(item, dayItems);
    const itemIndex = sameStartItems.findIndex(
        (candidate) => candidate.id === item.id,
    );
    const baseTopPx = slotTopPx(isoToHm(item.startTime));

    if (itemIndex < 0) {
        return baseTopPx;
    }

    return itemIndex * (tileHeightPx + SAME_START_TILE_GAP_PX) + baseTopPx;
}
