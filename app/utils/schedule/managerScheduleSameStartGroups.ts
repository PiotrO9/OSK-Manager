import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    isoToHm,
    isTheoryLessonType,
    lessonDurationMinutes,
    SAME_START_TILE_GAP_PX,
    SLOT_END_GUTTER_PX,
    slotTopPx,
} from './managerScheduleCalendarUtils';

export interface ScheduleSameStartGroup {
    startHm: string;
    commonEndHm: string | null;
    items: ScheduleLessonItem[];
    topPx: number;
    heightPx: number;
}

export function buildScheduleSameStartGroups(
    dayItems: readonly ScheduleLessonItem[],
): ScheduleSameStartGroup[] {
    const byStart = new Map<string, ScheduleLessonItem[]>();

    for (const item of dayItems) {
        const startHm = isoToHm(item.startTime);
        const items = byStart.get(startHm) ?? [];

        items.push(item);
        byStart.set(startHm, items);
    }

    const groups = [...byStart.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([startHm, items]) => {
            items.sort((a, b) => a.id.localeCompare(b.id));
            const firstEnd = isoToHm(items[0]!.endTime);

            return {
                startHm,
                commonEndHm: items.every(
                    (item) => isoToHm(item.endTime) === firstEnd,
                )
                    ? firstEnd
                    : null,
                items,
                topPx: slotTopPx(startHm),
                heightPx: Math.max(
                    1,
                    Math.max(...items.map(lessonDurationMinutes)) -
                        SLOT_END_GUTTER_PX,
                ),
            };
        });

    return groups.map((group, index) => {
        const nextGroup = groups[index + 1];

        if (!nextGroup || group.items.length === 1) {
            return group;
        }

        return {
            ...group,
            heightPx: Math.max(
                1,
                Math.min(
                    group.heightPx,
                    nextGroup.topPx - group.topPx - SAME_START_TILE_GAP_PX,
                ),
            ),
        };
    });
}

export function formatScheduleSameStartGroupLabel(
    group: ScheduleSameStartGroup,
): string {
    const count = group.items.length;
    const range = group.commonEndHm
        ? `${group.startHm}–${group.commonEndHm}`
        : group.startHm;
    const allDriving = group.items.every(
        (item) =>
            item.type.trim().toUpperCase() === 'PRACTICE' &&
            item.kind !== 'instructor_event',
    );
    const allTheory = group.items.every((item) =>
        isTheoryLessonType(item.type),
    );
    const few = count >= 2 && count <= 4;
    const noun = allDriving
        ? few
            ? 'jazdy'
            : 'jazd'
        : allTheory
          ? few
              ? 'zajęcia teorii'
              : 'zajęć teorii'
          : few
            ? 'zajęcia'
            : 'zajęć';

    return `${range} · ${count} ${noun}`;
}
